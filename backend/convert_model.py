# convert_model.py
import torch
from safetensors.torch import load_file
import os

# Path to your safetensors folder
model_folder = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best"

# Look for .safetensors files
safetensors_files = []
for root, dirs, files in os.walk(model_folder):
    for file in files:
        if file.endswith('.safetensors'):
            safetensors_files.append(os.path.join(root, file))

if safetensors_files:
    print(f"Found safetensors file: {safetensors_files[0]}")
    
    # Load safetensors
    state_dict = load_file(safetensors_files[0])
    
    # Create checkpoint in the format predict.py expects
    checkpoint = {
        'model_state': state_dict,
        'epoch': 0,
        'val_iou': 0.0
    }
    
    # Save as .pth
    output_path = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best.pth"
    torch.save(checkpoint, output_path)
    print(f"✅ Converted model saved to: {output_path}")
    print(f"   Size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
else:
    print("No .safetensors file found!")
    print("\nFiles in folder:")
    for item in os.listdir(model_folder):
        print(f"  - {item}")