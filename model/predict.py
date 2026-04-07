"""
Veritas — AI Image Segmentation Inference
==========================================
Supports both PyTorch (.pth) and Safetensors formats
"""

import os
import sys
import argparse
import numpy as np
import cv2
import torch
import segmentation_models_pytorch as smp
import albumentations as A
from albumentations.pytorch import ToTensorV2
from PIL import Image
import matplotlib.pyplot as plt

# ── Config ────────────────────────────────────────────────────────────────────
IMG_SIZE   = 256
DEVICE     = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'veritas_seg_best.pth')

INFER_TF = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2(),
])

# ── Model loader supporting multiple formats ─────────────────────────────────
def load_model(model_path: str):
    """
    Load model from either PyTorch .pth or Safetensors format
    """
    # Create model architecture
    model = smp.Unet(
        encoder_name    = 'efficientnet-b3',
        encoder_weights = None,
        in_channels     = 3,
        classes         = 1,
        activation      = None,
    )
    
    # Check if path is a directory (safetensors format)
    if os.path.isdir(model_path):
        print(f'[Veritas] Loading from safetensors directory: {model_path}')
        try:
            from safetensors.torch import load_file
            
            # Find the .safetensors file
            safetensors_file = None
            for file in os.listdir(model_path):
                if file.endswith('.safetensors'):
                    safetensors_file = os.path.join(model_path, file)
                    break
            
            if safetensors_file:
                print(f'[Veritas] Found safetensors file: {safetensors_file}')
                state_dict = load_file(safetensors_file)
                model.load_state_dict(state_dict)
                model = model.to(DEVICE)
                model.eval()
                print(f'[Veritas] Model loaded from safetensors format')
                return model
            else:
                raise FileNotFoundError(f"No .safetensors file found in {model_path}")
                
        except ImportError:
            print("[Veritas] safetensors not installed. Install with: pip install safetensors")
            raise
    
    # Check if it's a PyTorch .pth file
    elif os.path.isfile(model_path) and model_path.endswith('.pth'):
        print(f'[Veritas] Loading from PyTorch checkpoint: {model_path}')
        ckpt = torch.load(model_path, map_location=DEVICE)
        
        # Try different checkpoint formats
        if 'model_state' in ckpt:
            model.load_state_dict(ckpt['model_state'])
            epoch = ckpt.get('epoch', 'unknown')
            val_iou = ckpt.get('val_iou', 'unknown')
            print(f'[Veritas] Model loaded — epoch {epoch}, IoU={val_iou:.4f}' if val_iou != 'unknown' else '[Veritas] Model loaded')
        elif 'state_dict' in ckpt:
            model.load_state_dict(ckpt['state_dict'])
            print('[Veritas] Model loaded from state_dict')
        else:
            # Try loading directly
            model.load_state_dict(ckpt)
            print('[Veritas] Model loaded directly')
        
        model = model.to(DEVICE)
        model.eval()
        return model
    
    else:
        raise FileNotFoundError(f"Unsupported model format at: {model_path}\nExpected either a .pth file or a directory with .safetensors file")

# ── Main inference function ───────────────────────────────────────────────────
def predict(image_path: str, model, save_path: str = None) -> dict:
    """
    Run Veritas segmentation inference on a single image.
    """
    # Load & preprocess
    orig_img     = Image.open(image_path).convert('RGB')
    orig_w, orig_h = orig_img.size
    img_np       = np.array(orig_img)
    inp          = INFER_TF(image=img_np)['image'].unsqueeze(0).to(DEVICE)

    # Inference
    with torch.no_grad():
        pred_mask = torch.sigmoid(model(inp)).squeeze().cpu().numpy()

    # Scores
    deriv_score = float(pred_mask.mean())
    ai_pct      = deriv_score * 100

    if deriv_score < 0.15:
        verdict = 'original'
    elif deriv_score < 0.60:
        verdict = 'partially AI (hybrid)'
    else:
        verdict = 'fully AI generated'

    # Visualize (optional)
    if save_path:
        img_display  = np.array(orig_img.resize((IMG_SIZE, IMG_SIZE)))
        mask_display = cv2.resize(pred_mask, (IMG_SIZE, IMG_SIZE))
        heatmap      = cv2.applyColorMap((mask_display * 255).astype(np.uint8), cv2.COLORMAP_JET)
        heatmap      = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        overlay      = cv2.addWeighted(img_display, 0.6, heatmap, 0.4, 0)

        fig, axes = plt.subplots(1, 3, figsize=(14, 5))
        axes[0].imshow(orig_img.resize((IMG_SIZE, IMG_SIZE))); axes[0].set_title('Input Image'); axes[0].axis('off')
        im = axes[1].imshow(mask_display, cmap='RdYlGn_r', vmin=0, vmax=1)
        axes[1].set_title('AI Region Mask\n(red = AI, green = original)'); axes[1].axis('off')
        plt.colorbar(im, ax=axes[1], fraction=0.046)
        axes[2].imshow(overlay); axes[2].set_title(f'Overlay\nDerivation Score: {deriv_score:.3f}'); axes[2].axis('off')

        color = 'red' if deriv_score > 0.6 else 'orange' if deriv_score > 0.15 else 'green'
        plt.suptitle(f'Verdict: {verdict.upper()}  |  AI Content: {ai_pct:.1f}%',
                     fontsize=14, fontweight='bold', color=color)
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        plt.close()  # Close to free memory

    return {
        'verdict':          verdict,
        'derivation_score': round(deriv_score, 4),
        'ai_percentage':    round(ai_pct, 2),
        'original_pct':     round(100 - ai_pct, 2),
        'mask':             pred_mask,
    }

# ── CLI entry point ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Veritas AI Image Detector')
    parser.add_argument('--image', required=True, help='Path to input image')
    parser.add_argument('--model', default=MODEL_PATH, help='Path to .pth checkpoint or safetensors folder')
    parser.add_argument('--save',  default=None,       help='Path to save output image')
    args = parser.parse_args()

    model  = load_model(args.model)
    result = predict(args.image, model, save_path=args.save)
    
    print(f'\n── Veritas Result ───────────────────────────────────')
    print(f'  Verdict         : {result["verdict"]}')
    print(f'  Derivation Score: {result["derivation_score"]:.4f}')
    print(f'  AI Content      : {result["ai_percentage"]:.1f}%')
    print(f'  Original Content: {result["original_pct"]:.1f}%')

def predict_from_pil(img: Image.Image, model) -> dict:
    """Predict from PIL image directly"""
    img_np = np.array(img.convert('RGB'))
    inp    = INFER_TF(image=img_np)['image'].unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        pred_mask = torch.sigmoid(model(inp)).squeeze().cpu().numpy()

    deriv_score = float(pred_mask.mean())
    ai_pct      = deriv_score * 100

    if deriv_score < 0.15:
        img_class = 'Original'
    elif deriv_score < 0.60:
        img_class = 'Tampered'
    else:
        img_class = 'AI'

    return {
        'class':            img_class,
        'confidence':       round(ai_pct, 1),
        'derivation_score': round(ai_pct, 1),
        'mask':             pred_mask
    }