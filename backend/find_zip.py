# find_zip.py
import os

print("Searching for veritas_seg_best.pth.zip...")
print("-" * 50)

# Common locations to search
search_locations = [
    r"C:\Users\Shriya\Desktop",
    r"C:\Users\Shriya\Downloads",
    r"C:\Users\Shriya\Documents",
    r"C:\Users\Shriya\Veritas",
]

found_zips = []
for location in search_locations:
    if os.path.exists(location):
        for file in os.listdir(location):
            if 'veritas' in file.lower() and (file.endswith('.zip') or file.endswith('.pth')):
                full_path = os.path.join(location, file)
                found_zips.append(full_path)
                print(f"✅ Found: {full_path}")
                if file.endswith('.zip'):
                    print(f"   Size: {os.path.getsize(full_path) / 1024 / 1024:.2f} MB (still zipped)")
                else:
                    print(f"   Size: {os.path.getsize(full_path) / 1024 / 1024:.2f} MB (already extracted)")

if not found_zips:
    print("\n❌ No veritas files found in common locations.")
    print("\nPlease check:")
    print("1. Did you download the veritas_seg_best.pth.zip file?")
    print("2. Where did you save it?")
    print("3. What is the exact filename?")