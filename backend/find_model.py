# find_model.py
import os

# Check common locations
possible_locations = [
    r"C:\Users\Shriya\Desktop\veritas_model\veritas_seg_best.pth",
    r"C:\Users\Shriya\Desktop\veritas_seg_best.pth",
    r"C:\Users\Shriya\Downloads\veritas_seg_best.pth",
    r"C:\Users\Shriya\Veritas\model\veritas_seg_best.pth",
    r"C:\Users\Shriya\Veritas\veritas_seg_best.pth",
]

print("Searching for veritas_seg_best.pth...")
print("-" * 50)

found = False
for location in possible_locations:
    if os.path.exists(location):
        print(f"✅ FOUND at: {location}")
        print(f"   Size: {os.path.getsize(location) / 1024 / 1024:.2f} MB")
        found = True
        break
    else:
        print(f"❌ Not found: {location}")

if not found:
    print("\n⚠️ Model file not found in common locations.")
    print("\nPlease tell me:")
    print("1. Where did you extract the zip file?")
    print("2. What is the FULL path to veritas_seg_best.pth?")
    
    # Search entire Desktop
    desktop = r"C:\Users\Shriya\Desktop"
    print(f"\nSearching Desktop for .pth files...")
    for root, dirs, files in os.walk(desktop):
        for file in files:
            if file.endswith('.pth'):
                print(f"   Found: {os.path.join(root, file)}")