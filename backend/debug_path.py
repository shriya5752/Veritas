# debug_path.py
import os

# This is the path your code is looking for
MODEL_PATH = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best\veritas_seg_best.pth"

print("🔍 PATH DEBUGGING")
print("=" * 60)
print(f"Looking for: {MODEL_PATH}")
print("=" * 60)

# Check each part of the path
print("\n📁 Checking each directory level:")

# Check Desktop
desktop = r"C:\Users\Shriya\Desktop"
print(f"\n1. Desktop exists? {os.path.exists(desktop)}")
if os.path.exists(desktop):
    print(f"   Contents of Desktop (first 10 items):")
    for i, item in enumerate(os.listdir(desktop)[:10]):
        print(f"     - {item}")

# Check veritas_model folder
veritas_model = r"C:\Users\Shriya\Desktop\veritas_model"
print(f"\n2. veritas_model exists? {os.path.exists(veritas_model)}")
if os.path.exists(veritas_model):
    print(f"   Contents of veritas_model:")
    for item in os.listdir(veritas_model):
        print(f"     - {item}")
else:
    print(f"   ❌ veritas_model folder not found!")

# Check veritas_seg_best subfolder
subfolder = r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best"
print(f"\n3. veritas_seg_best subfolder exists? {os.path.exists(subfolder)}")
if os.path.exists(subfolder):
    print(f"   Contents of veritas_seg_best:")
    for item in os.listdir(subfolder):
        file_path = os.path.join(subfolder, item)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path) / 1024 / 1024
            print(f"     - {item} ({size:.2f} MB)")
        else:
            print(f"     - {item}/")
else:
    print(f"   ❌ veritas_seg_best subfolder not found!")

# Check for the actual .pth file anywhere on Desktop
print("\n" + "=" * 60)
print("🔍 Searching entire Desktop for .pth files:")
print("=" * 60)

found_files = []
for root, dirs, files in os.walk(desktop):
    for file in files:
        if file.endswith('.pth'):
            full_path = os.path.join(root, file)
            size = os.path.getsize(full_path) / 1024 / 1024
            found_files.append((full_path, size))
            print(f"✅ Found: {full_path}")
            print(f"   Size: {size:.2f} MB")

if not found_files:
    print("❌ No .pth files found anywhere on Desktop!")
    print("\nPossible issues:")
    print("1. The file might have a different name (check for .pt, .bin, etc.)")
    print("2. The file might be in a different location")
    print("3. The file might still be zipped")
    
    # Check for zip files
    print("\n📦 Checking for zip files on Desktop:")
    for file in os.listdir(desktop):
        if file.endswith('.zip') and 'veritas' in file.lower():
            print(f"   Found zip: {file}")