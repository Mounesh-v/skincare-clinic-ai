# Skincare Clinic AI - Teammate Handoff Guide

This guide explains how to run the entire application stack for the project.

## 🚀 Services Overview
1. **Frontend**: React application (Vite)
2. **Backend**: Node.js Express server (Handles auth & logic)
3. **ML Service**: Python FastAPI/HTTP server (Handles skin analysis)

---

## 🛠 Prerequisites
- Node.js (v16+)
- Python (3.9+)
- Git LFS (Required to handle the 343MB model file)

---

## 🏃 Running the Application

### 1. ML Service (Port 8000)
The ML service uses a fine-tuned Vision Transformer (ViT) model with **92.25% accuracy**.
```powershell
# From the project root
python -m ml_service.main --port 8000
```

### 2. Node.js Backend (Port 5005)
```powershell
cd server
npm install
npm run dev
```

### 3. Frontend Client (Port 5173/Default)
```powershell
cd client
npm install
npm run dev
```

---

## 📦 Pushing & Sharing the Model
> [!IMPORTANT]
> The model weights (`ml/models/vit_skin_type/model.safetensors`) are **343MB**. 
> Standard Git will reject this file. 

### How to push:
1. **Install Git LFS**: `git lfs install`
2. **Track large files**: `git lfs track "*.safetensors"`
3. **Push as usual**: `git add .`, `git commit -m "Add fine-tuned 92.25% model"`, `git push`

### How teammates get the model:
Teammates must run `git lfs pull` after cloning to ensure they have the actual model file instead of a pointer.

---

## ✅ Recent Improvements
- **Accuracy**: Fine-tuned to 92.25%.
- **Robustness**: Lowered confidence threshold to 0.30 to provide more reliable predictions.
- **Connection**: Fixed 404 errors by separating `mlClient` and `apiClient` in the frontend.
