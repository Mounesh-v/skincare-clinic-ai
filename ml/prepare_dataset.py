"""Dataset preparation script for skin type classification.

This script:
1. Fixes the typo in the folder name (blackheades -> blackheads)
2. Creates train/val splits (80/20)
3. Organizes the dataset into the structure expected by the training script
"""

from __future__ import annotations

import random
import shutil
from pathlib import Path
from typing import Dict, List

# Configuration
DATASET_ROOT = Path(__file__).parent / "data" / "raw" / "Skin v2"
RANDOM_SEED = 2024
TRAIN_RATIO = 0.8

# Expected class names (canonical)
CANONICAL_CLASSES = ["acne", "blackheads", "dark spots", "pores", "wrinkles"]


def fix_typo(root: Path) -> None:
    """Fix the typo in the blackheades folder name."""
    old_name = root / "blackheades"
    new_name = root / "blackheads"
    
    if old_name.exists() and not new_name.exists():
        print(f"Renaming {old_name.name} -> {new_name.name}")
        old_name.rename(new_name)
        print("✓ Folder renamed successfully")
    elif new_name.exists():
        print("✓ Folder 'blackheads' already exists, skipping rename")
    else:
        print(f"⚠ Warning: Neither 'blackheades' nor 'blackheads' folder found")


def get_image_files(class_dir: Path) -> List[Path]:
    """Get all image files from a class directory."""
    extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    files = []
    for ext in extensions:
        files.extend(class_dir.glob(f"*{ext}"))
        files.extend(class_dir.glob(f"*{ext.upper()}"))
    return sorted(files)


def create_splits(root: Path) -> None:
    """Create train/val splits from the flat class structure."""
    random.seed(RANDOM_SEED)
    
    # Check if splits already exist
    train_dir = root / "train"
    val_dir = root / "val"
    
    if train_dir.exists() or val_dir.exists():
        response = input("\nTrain/val directories already exist. Recreate them? (y/n): ")
        if response.lower() != 'y':
            print("Skipping split creation")
            return
        
        # Clean up existing splits
        if train_dir.exists():
            print(f"Removing existing {train_dir}")
            shutil.rmtree(train_dir)
        if val_dir.exists():
            print(f"Removing existing {val_dir}")
            shutil.rmtree(val_dir)
    
    # Create split directories
    train_dir.mkdir(exist_ok=True)
    val_dir.mkdir(exist_ok=True)
    
    stats: Dict[str, Dict[str, int]] = {}
    
    for class_name in CANONICAL_CLASSES:
        class_dir = root / class_name
        
        if not class_dir.exists():
            print(f"⚠ Warning: Class directory '{class_name}' not found, skipping")
            continue
        
        # Get all image files
        image_files = get_image_files(class_dir)
        
        if not image_files:
            print(f"⚠ Warning: No images found in '{class_name}', skipping")
            continue
        
        # Shuffle and split
        random.shuffle(image_files)
        num_train = int(len(image_files) * TRAIN_RATIO)
        train_files = image_files[:num_train]
        val_files = image_files[num_train:]
        
        # Create class directories in train/val
        (train_dir / class_name).mkdir(exist_ok=True)
        (val_dir / class_name).mkdir(exist_ok=True)
        
        # Copy files to train split
        print(f"\nProcessing '{class_name}' ({len(image_files)} images)")
        for i, src_file in enumerate(train_files, 1):
            dst_file = train_dir / class_name / src_file.name
            shutil.copy2(src_file, dst_file)
            if i % 100 == 0:
                print(f"  Copied {i}/{len(train_files)} train images")
        
        # Copy files to val split
        for i, src_file in enumerate(val_files, 1):
            dst_file = val_dir / class_name / src_file.name
            shutil.copy2(src_file, dst_file)
            if i % 100 == 0:
                print(f"  Copied {i}/{len(val_files)} val images")
        
        stats[class_name] = {
            "total": len(image_files),
            "train": len(train_files),
            "val": len(val_files)
        }
        
        print(f"  ✓ {class_name}: {len(train_files)} train, {len(val_files)} val")
    
    # Print summary
    print("\n" + "=" * 60)
    print("DATASET SPLIT SUMMARY")
    print("=" * 60)
    print(f"{'Class':<15} {'Total':<10} {'Train':<10} {'Val':<10}")
    print("-" * 60)
    
    total_images = 0
    total_train = 0
    total_val = 0
    
    for class_name in CANONICAL_CLASSES:
        if class_name in stats:
            s = stats[class_name]
            print(f"{class_name:<15} {s['total']:<10} {s['train']:<10} {s['val']:<10}")
            total_images += s['total']
            total_train += s['train']
            total_val += s['val']
    
    print("-" * 60)
    print(f"{'TOTAL':<15} {total_images:<10} {total_train:<10} {total_val:<10}")
    print("=" * 60)
    print(f"\nTrain/Val ratio: {total_train/total_images:.1%} / {total_val/total_images:.1%}")


def main() -> None:
    """Main execution function."""
    print("=" * 60)
    print("SKIN TYPE DATASET PREPARATION")
    print("=" * 60)
    print(f"Dataset root: {DATASET_ROOT}")
    print(f"Random seed: {RANDOM_SEED}")
    print(f"Train ratio: {TRAIN_RATIO:.0%}")
    print("=" * 60)
    
    if not DATASET_ROOT.exists():
        print(f"\n❌ Error: Dataset root not found: {DATASET_ROOT}")
        return
    
    # Step 1: Fix typo
    print("\n[Step 1/2] Fixing folder typo...")
    fix_typo(DATASET_ROOT)
    
    # Step 2: Create splits
    print("\n[Step 2/2] Creating train/val splits...")
    create_splits(DATASET_ROOT)
    
    print("\n✓ Dataset preparation complete!")
    print(f"\nDataset structure:")
    print(f"  {DATASET_ROOT / 'train'}")
    print(f"  {DATASET_ROOT / 'val'}")


if __name__ == "__main__":
    main()
