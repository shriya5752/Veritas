# ml_model.py
import sys
import os

# ── Point to model folder ─────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'model')
sys.path.append(MODEL_DIR)

from predict import load_model, predict_from_pil
from PIL import Image

# ── Model path - Point to the safetensors FOLDER ──
MODEL_PATH = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best"
_model = None

def load():
    global _model
    print("[Veritas] Loading model...")
    print(f"[Veritas] Looking for model at: {MODEL_PATH}")
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
    
    _model = load_model(MODEL_PATH)
    print("[Veritas] Model ready!")

def predict(img: Image.Image) -> dict:
    global _model
    if _model is None:
        load()

    return predict_from_pil(img, _model)