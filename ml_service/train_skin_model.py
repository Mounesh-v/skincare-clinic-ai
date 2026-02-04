"""TensorFlow training pipeline for the skin-type classifier.

Upgrades over the legacy trainer:
- Face detection & cropping via MediaPipe before every sample.
- Lighting normalisation with CLAHE in HSV space.
- Transfer learning with MobileNetV2 and rich mobile-style augmentations.
- SavedModel export to stay compatible with TensorFlow Lite conversion.
"""

from __future__ import annotations

import argparse
import json
import random
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, Tuple

import numpy as np

try:
    import tensorflow as tf  # type: ignore[import]
    from tensorflow.keras import callbacks, layers, models, optimizers  # type: ignore[import]
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input  # type: ignore[import]
except ImportError as exc:  # pragma: no cover - defensive guard for missing dependency
    raise ImportError(
        "TensorFlow is required to train the skin-type classifier. Install it via 'pip install tensorflow-cpu'."
    ) from exc

from .model.preprocessing import (
    CANONICAL_LABELS,
    DISPLAY_LABELS,
    TARGET_IMAGE_SIZE,
    filter_labelled_files,
    preprocess_image_file,
)

AUTOTUNE = tf.data.AUTOTUNE
RNG_SEED = 2024
IMAGE_HEIGHT, IMAGE_WIDTH = TARGET_IMAGE_SIZE
NUM_CLASSES = len(CANONICAL_LABELS)


@dataclass
class TrainingConfig:
    dataset: str
    output_dir: str
    epochs: int
    batch_size: int
    warmup_epochs: int
    fine_tune_at_layer: int
    learning_rate: float
    fine_tune_learning_rate: float


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def iter_labelled_files(split_dir: Path) -> Iterable[Tuple[Path, str]]:
    image_suffixes = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    for label_dir in split_dir.iterdir():
        if not label_dir.is_dir():
            continue
        label = label_dir.name.lower()
        for filepath in label_dir.rglob("*"):
            if filepath.suffix.lower() in image_suffixes:
                yield filepath, label


def load_split(dataset_dir: Path, split: str) -> Tuple[np.ndarray, np.ndarray]:
    split_dir = dataset_dir / split
    if not split_dir.exists():
        raise FileNotFoundError(f"Split '{split}' not found at {split_dir}")
    paths, labels = filter_labelled_files(iter_labelled_files(split_dir))
    if len(paths) == 0:
        raise ValueError(f"No supported images found in {split_dir}")
    return paths, labels


def _py_load_image(path_tensor: tf.Tensor) -> tf.Tensor:
    path_value = path_tensor.numpy()
    if isinstance(path_value, (bytes, np.bytes_)):
        path_bytes = bytes(path_value)
    elif isinstance(path_value, np.ndarray):
        path_bytes = path_value.tobytes()
    else:
        path_bytes = str(path_value).encode("utf-8")
    path = path_bytes.decode("utf-8")
    image, _ = preprocess_image_file(path, target_size=TARGET_IMAGE_SIZE, enforce_face=True)
    return tf.convert_to_tensor(image, dtype=tf.float32)


def build_dataset(paths: np.ndarray, labels: np.ndarray, batch_size: int, shuffle: bool) -> tf.data.Dataset:
    path_ds = tf.data.Dataset.from_tensor_slices(paths)
    label_ds = tf.data.Dataset.from_tensor_slices(labels)
    ds = tf.data.Dataset.zip((path_ds, label_ds))

    def _load(path: tf.Tensor, label: tf.Tensor) -> Tuple[tf.Tensor, tf.Tensor]:
        image = tf.py_function(func=_py_load_image, inp=[path], Tout=tf.float32)
        image.set_shape((IMAGE_HEIGHT, IMAGE_WIDTH, 3))
        image = preprocess_input(image)
        return image, label

    ds = ds.map(_load, num_parallel_calls=AUTOTUNE)
    if shuffle:
        ds = ds.shuffle(buffer_size=len(paths), seed=RNG_SEED, reshuffle_each_iteration=True)
    ds = ds.batch(batch_size)
    ds = ds.prefetch(AUTOTUNE)
    return ds


def make_augmentation_block() -> tf.keras.Sequential:
    return tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.08),
            layers.RandomTranslation(0.05, 0.05),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.2),
        ],
        name="augmentation",
    )


def build_model() -> Tuple[tf.keras.Model, tf.keras.Model]:
    data_augmentation = make_augmentation_block()
    inputs = layers.Input(shape=(IMAGE_HEIGHT, IMAGE_WIDTH, 3))
    x = data_augmentation(inputs)
    base_model = MobileNetV2(include_top=False, weights="imagenet", input_shape=(IMAGE_HEIGHT, IMAGE_WIDTH, 3))
    base_model.trainable = False
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.25)(x)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="skin_type_logits")(x)
    model = models.Model(inputs=inputs, outputs=outputs, name="skin_type_classifier")
    return model, base_model


def compute_class_weights(labels: np.ndarray) -> Dict[int, float]:
    counts = np.bincount(labels, minlength=NUM_CLASSES)
    total = float(labels.shape[0])
    weights: Dict[int, float] = {}
    for idx, count in enumerate(counts):
        weights[idx] = total / (NUM_CLASSES * float(max(count, 1)))
    return weights


def train_model(
    model: tf.keras.Model,
    base_model: tf.keras.Model,
    train_ds: tf.data.Dataset,
    val_ds: tf.data.Dataset,
    config: TrainingConfig,
    class_weights: Dict[int, float],
) -> models.Model:
    optimiser = optimizers.Adam(learning_rate=config.learning_rate)
    model.compile(
        optimizer=optimiser,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.TopKCategoricalAccuracy(k=2, name="top2")],
    )

    early_stop = callbacks.EarlyStopping(monitor="val_accuracy", patience=5, restore_best_weights=True)
    reduce_lr = callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6)

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.warmup_epochs,
        class_weight=class_weights,
        callbacks=[early_stop, reduce_lr],
    )

    if config.epochs <= config.warmup_epochs:
        return model

    base_model.trainable = True
    freeze_until = max(len(base_model.layers) - config.fine_tune_at_layer, 0)
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False

    fine_tune_opt = optimizers.Adam(learning_rate=config.fine_tune_learning_rate)
    model.compile(
        optimizer=fine_tune_opt,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.TopKCategoricalAccuracy(k=2, name="top2")],
    )

    total_epochs = config.epochs
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=total_epochs,
        initial_epoch=config.warmup_epochs,
        class_weight=class_weights,
        callbacks=[early_stop, reduce_lr],
    )

    return model


def export_model(model: tf.keras.Model, output_dir: Path, config: TrainingConfig) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    saved_model_dir = output_dir / "saved_model"
    tf.saved_model.save(model, saved_model_dir)

    label_map = {int(idx): DISPLAY_LABELS[label] for idx, label in enumerate(CANONICAL_LABELS)}
    metadata = {
        "labels": label_map,
        "canonical_labels": list(CANONICAL_LABELS),
        "image_size": TARGET_IMAGE_SIZE,
        "config": asdict(config),
    }
    with (output_dir / "model_metadata.json").open("w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)

    print(f"Saved TensorFlow model to {saved_model_dir}")
    print("To generate a TensorFlow Lite file run:")
    print(f"  tflite_convert --saved_model_dir={saved_model_dir} --output_file={output_dir / 'skin_classifier.tflite'}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the MobileNetV2 skin-type classifier")
    parser.add_argument("--dataset", type=Path, required=True, help="Dataset root containing train/ and val/ subdirectories")
    parser.add_argument("--output", type=Path, default=Path("ml_service/model/artifacts"), help="Directory to store the SavedModel and metadata")
    parser.add_argument("--epochs", type=int, default=20, help="Total number of epochs including fine-tuning")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--warmup-epochs", type=int, default=8, help="Epochs with frozen base before fine-tuning")
    parser.add_argument("--fine-tune-at-layer", type=int, default=40, help="Number of base layers (from the end) to include in fine-tuning")
    parser.add_argument("--learning-rate", type=float, default=1e-4)
    parser.add_argument("--fine-tune-learning-rate", type=float, default=1e-5)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    seed_everything(RNG_SEED)

    train_paths, train_labels = load_split(args.dataset, "train")
    val_paths, val_labels = load_split(args.dataset, "val")

    train_ds = build_dataset(train_paths, train_labels, batch_size=args.batch_size, shuffle=True)
    val_ds = build_dataset(val_paths, val_labels, batch_size=args.batch_size, shuffle=False)

    class_weights = compute_class_weights(train_labels)

    model, base_model = build_model()

    config = TrainingConfig(
        dataset=str(args.dataset.resolve()),
        output_dir=str(args.output.resolve()),
        epochs=int(args.epochs),
        batch_size=int(args.batch_size),
        warmup_epochs=int(args.warmup_epochs),
        fine_tune_at_layer=int(args.fine_tune_at_layer),
        learning_rate=float(args.learning_rate),
        fine_tune_learning_rate=float(args.fine_tune_learning_rate),
    )

    trained_model = train_model(
        model,
        base_model,
        train_ds,
        val_ds,
        config=config,
        class_weights=class_weights,
    )

    export_model(trained_model, args.output, config)


if __name__ == "__main__":
    main()
