"""
pre_training_checklist.py - Pre-training validation for dermatological condition classifier
"""
import os
import sys
import torch
import torchvision
import torch.nn as nn
from PIL import Image
import time
import logging
from glob import glob
import json

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'raw', 'Skin_v2')

# 1. Verify dataset exists
if not os.path.isdir(DATA_DIR):
    logging.error(f"Dataset not found at {DATA_DIR}")
    sys.exit(1)

# 2. Count images per class
class_names = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])
counts = {}
corrupted = []
for cname in class_names:
    cdir = os.path.join(DATA_DIR, cname)
    imgs = []
    for ext in ('*.jpg', '*.jpeg', '*.png', '*.bmp'):
        imgs.extend(glob(os.path.join(cdir, ext)))
    counts[cname] = len(imgs)
    # 3. Check for corrupted images
    for img_path in imgs:
        try:
            with Image.open(img_path) as img:
                img.verify()
        except Exception:
            corrupted.append(img_path)

# 4. Test data pipeline (load 1 batch)
val_transform = torchvision.transforms.Compose([
    torchvision.transforms.Resize(416),
    torchvision.transforms.CenterCrop(384),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
class DummyDataset(torch.utils.data.Dataset):
    def __init__(self, img_paths):
        self.img_paths = img_paths
    def __len__(self):
        return len(self.img_paths)
    def __getitem__(self, idx):
        img = Image.open(self.img_paths[idx]).convert('RGB')
        return val_transform(img)
all_imgs = [img for c in class_names for ext in ('*.jpg','*.jpeg','*.png','*.bmp') for img in glob(os.path.join(DATA_DIR, c, ext))]
if all_imgs:
    loader = torch.utils.data.DataLoader(DummyDataset(all_imgs[:16]), batch_size=8)
    try:
        batch = next(iter(loader))
        pipeline_ok = True
    except Exception as e:
        logging.error(f"Data pipeline error: {e}")
        pipeline_ok = False
else:
    pipeline_ok = False

# 5. Test model forward pass (uses same AttentionClassifierHead as train.py)
try:
    import sys as _sys
    _sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from ml.model_utils import AttentionClassifierHead
    from typing import cast as _cast
    model = torchvision.models.efficientnet_v2_s(weights='IMAGENET1K_V1')
    in_features = _cast(nn.Linear, model.classifier[1]).in_features
    model.classifier[1] = AttentionClassifierHead(in_features, len(class_names))
    dummy = torch.randn(4, 3, 384, 384)
    out = model(dummy)
    model_ok = out.shape == (4, len(class_names))
except Exception as e:
    logging.error(f"Model forward error: {e}")
    model_ok = False

# 6. Estimate training time (CPU)
est_img_sec = 2.0  # conservative for CPU, per image per epoch
n_imgs = sum(counts.values())
est_epochs = 35
est_time_h = (n_imgs * est_epochs * est_img_sec) / 3600

# 7. Print summary
print("\n===== Pre-Training Checklist =====")
print(f"Dataset path: {DATA_DIR}")
print(f"Classes: {class_names}")
for cname in class_names:
    print(f"  {cname}: {counts[cname]} images")
if corrupted:
    print(f"Corrupted images: {len(corrupted)} (see log)")
else:
    print("No corrupted images found.")
print(f"Data pipeline test: {'OK' if pipeline_ok else 'FAIL'}")
print(f"Model forward pass: {'OK' if model_ok else 'FAIL'}")
print(f"Estimated training time (CPU, 35 epochs): {est_time_h:.1f} hours")

if not (pipeline_ok and model_ok and not corrupted):
    print("\nChecklist failed. Please fix issues above before training.")
    sys.exit(1)
else:
    print("\nChecklist passed. Ready to train!")
    sys.exit(0)
