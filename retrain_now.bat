@echo off
REM ============================================================
REM  Skincare AI — EfficientNetV2-S Retraining Script
REM  Run from the project root: d:\Github proj\skincare-clinic-ai
REM ============================================================

echo.
echo ============================================================
echo   SKINCARE AI — EFFICIENTNET RETRAINING
echo ============================================================
echo.
echo   Dataset : ml\data\raw\Skin v2  (9,770 images)
echo   Model   : EfficientNetV2-S + AttentionHead
echo   Epochs  : 20 (early stop patience = 6)
echo   Output  : ml\models\skin_classifier_v2s.pt
echo.
echo   Estimated time on CPU: 2-4 hours
echo   Press Ctrl+C at any time to save best checkpoint so far.
echo.
echo ============================================================

python -m tools.training.train ^
  --epochs 20 ^
  --batch-size 8 ^
  --lr-backbone 5e-5 ^
  --lr-classifier 2e-4 ^
  --freeze-epochs 5 ^
  --early-stop-patience 6

echo.
echo ============================================================
echo   Training finished. Restart the ML service to load new weights:
echo     python main.py --host 127.0.0.1 --port 8000
echo ============================================================
pause
