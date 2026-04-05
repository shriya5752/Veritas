# ml_model.py
import sys
import os
import tempfile

# ── Point to model folder ─────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'model')
sys.path.append(MODEL_DIR)

from predict import load_model, predict as model_predict
from PIL import Image

# ── Model path ────────────────────────────────────────────────
MODEL_PATH = r"C:\Users\Shravni Joshi\Documents\4th Sem\Veritas\Veritas\model\veritas_seg_best"
_model = None

def load():
    global _model
    print("[Veritas] Loading model...")
    _model = load_model(MODEL_PATH)
    print("[Veritas] Model ready!")

# ── Predict ───────────────────────────────────────────────────
def predict(img: Image.Image) -> dict:
    global _model
    if _model is None:
        load()

    # Save PIL image temporarily — their predict() needs a file path
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = model_predict(tmp_path, _model)
    finally:
        os.unlink(tmp_path)  # clean up temp file

    # Map their verdict to our class format
    verdict_map = {
        'original':               'Real',
        'partially AI (hybrid)':  'Tampered',
        'fully AI generated':     'AI'
    }

    return {
        "class":            verdict_map.get(result['verdict'], 'AI'),
        "confidence":       round(result['ai_percentage'], 2),
        "derivation_score": round(result['ai_percentage'], 2)
    }