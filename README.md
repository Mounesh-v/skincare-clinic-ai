# Skincare Clinic AI

## First-time Setup
```bash
pip install -r requirements.txt
python -m ml.download_models     # downloads ~330MB once, then fully offline
```

## Run
```bash
python -m service.main
```

---

## Project Structure

```
skincare-clinic-ai/
├── ml/                        # ML pipeline
│   ├── config.py              # Single source of truth for all settings
│   ├── preprocessing.py       # Image preprocessing
│   ├── skin_type_vit.py       # ViT-based skin type inference (local, offline)
│   ├── download_models.py     # One-time model download script
│   ├── train_vit.py           # Fine-tuning script for ViT model
│   ├── train.py               # EfficientNet-B0 condition classifier training
│   ├── realtime.py            # Webcam loop with live skin analysis
│   └── models/
│       └── vit_skin_type/     # ViT model saved here after download
├── ml_service/                # HTTP service layer
│   ├── main.py                # HTTP server
│   ├── analyzer.py            # Core inference orchestrator
│   └── recommendations.py    # Personalised skincare plans
├── client/                    # React frontend
├── server/                    # Node.js backend
└── requirements.txt           # Python dependencies
```

## Skin Analysis Pipeline

1. **Image input** → `preprocess_image_bytes()` → 224×224 RGB array
2. **Condition detection** → EfficientNet-B0 → acne / pores / wrinkles / blackheads / dark_spots
3. **Skin type inference** → ViT (`dima806/skin_types_image_detection`) → Oily / Dry / Normal
4. **Recommendations** → `build_personalized_plan()` → personalised skincare plan

## Retrain on Your Own Data

```bash
# Place images in: ml/data/raw/Skin v2/<condition>/
# Supported folders: acne, blackheads, pores, wrinkles, dark spots
python -m ml.train_vit
```
