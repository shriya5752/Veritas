# test_model_load.py
import sys
import os

# Add paths
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'model'))

try:
    from predict import load_model
    
    MODEL_PATH = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best.pth"
    
    print(f"Loading model from: {MODEL_PATH}")
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ File not found! Please extract the zip file first.")
    else:
        print(f"✅ File found! Size: {os.path.getsize(MODEL_PATH) / 1024 / 1024:.2f} MB")
        print("Loading model (this may take a few seconds)...")
        model = load_model(MODEL_PATH)
        print("✅ Model loaded successfully!")
        
except Exception as e:
    print(f"❌ Error: {e}")