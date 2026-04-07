# check_model.py (create this in your backend folder)
import os

model_dir = os.path.join(os.path.dirname(__file__), '..', 'model')
print(f"Looking in: {model_dir}")

if os.path.exists(model_dir):
    print("Contents of model folder:")
    for item in os.listdir(model_dir):
        full_path = os.path.join(model_dir, item)
        if os.path.isdir(full_path):
            print(f"  📁 {item}/")
            # List contents of subdirectories
            for subitem in os.listdir(full_path):
                print(f"      📄 {subitem}")
        else:
            print(f"  📄 {item}")
else:
    print(f"Model folder not found at {model_dir}")