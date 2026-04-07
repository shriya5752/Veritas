# search_model.py (create in backend folder)
import os

def search_for_model(start_path):
    print(f"Searching for model files in: {start_path}")
    model_extensions = ['.pt', '.pth', '.bin', '.ckpt', '.pkl', '.h5', '.hdf5']
    
    for root, dirs, files in os.walk(start_path):
        for file in files:
            if any(file.endswith(ext) for ext in model_extensions):
                full_path = os.path.join(root, file)
                print(f"Found: {full_path}")
        
        # Also look for folders named 'veritas_seg_best'
        for dir in dirs:
            if 'veritas' in dir.lower() or 'seg' in dir.lower():
                print(f"Found directory: {os.path.join(root, dir)}")

# Search from your project root
project_root = r"C:\Users\Shriya\Veritas"
search_for_model(project_root)