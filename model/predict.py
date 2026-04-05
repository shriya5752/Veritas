"""
Veritas — AI Image Segmentation Inference
==========================================
Usage:
    python predict.py --image path/to/image.jpg
    python predict.py --image path/to/image.jpg --model path/to/veritas_seg_best.pth
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

# ── Load model (once, at import time) ────────────────────────────────────────
def load_model(model_path: str = MODEL_PATH):
    model = smp.Unet(
        encoder_name    = 'efficientnet-b3',
        encoder_weights = None,
        in_channels     = 3,
        classes         = 1,
        activation      = None,
    )
    ckpt = torch.load(model_path, map_location=DEVICE)
    model.load_state_dict(ckpt['model_state'])
    model = model.to(DEVICE)
    model.eval()
    print(f'[Veritas] Model loaded — epoch {ckpt["epoch"]}, IoU={ckpt["val_iou"]:.4f}')
    return model

# ── Main inference function ───────────────────────────────────────────────────
def predict(image_path: str, model, save_path: str = None) -> dict:
    """
    Run Veritas segmentation inference on a single image.

    Args:
        image_path : path to input image
        model      : loaded Veritas model (from load_model())
        save_path  : optional path to save the output visualization

    Returns:
        dict:
            verdict          — 'original' | 'partially AI (hybrid)' | 'fully AI generated'
            derivation_score — float 0.0–1.0 (fraction of image that is AI)
            ai_percentage    — float (derivation_score * 100)
            original_pct     — float (100 - ai_percentage)
            mask             — numpy array (H x W), per-pixel AI probability
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

    # Visualize
    img_display  = np.array(orig_img.resize((IMG_SIZE, IMG_SIZE)))
    mask_display = cv2.resize(pred_mask, (IMG_SIZE, IMG_SIZE))
    heatmap      = cv2.applyColorMap((mask_display * 255).astype(np.uint8), cv2.COLORMAP_JET)
    heatmap      = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay      = cv2.addWeighted(img_display, 0.6, heatmap, 0.4, 0)

    fig, axes = plt.subplots(1, 3, figsize=(14, 5))
    axes[0].imshow(orig_img.resize((IMG_SIZE, IMG_SIZE))); axes[0].set_title('Input Image');       axes[0].axis('off')
    im = axes[1].imshow(mask_display, cmap='RdYlGn_r', vmin=0, vmax=1)
    axes[1].set_title('AI Region Mask\n(red = AI, green = original)');                             axes[1].axis('off')
    plt.colorbar(im, ax=axes[1], fraction=0.046)
    axes[2].imshow(overlay); axes[2].set_title(f'Overlay\nDerivation Score: {deriv_score:.3f}');  axes[2].axis('off')

    color = 'red' if deriv_score > 0.6 else 'orange' if deriv_score > 0.15 else 'green'
    plt.suptitle(f'Verdict: {verdict.upper()}  |  AI Content: {ai_pct:.1f}%',
                 fontsize=14, fontweight='bold', color=color)
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f'[Veritas] Saved to {save_path}')
    plt.show()

    print(f'\n── Veritas Result ───────────────────────────────────')
    print(f'  Verdict         : {verdict}')
    print(f'  Derivation Score: {deriv_score:.4f}')
    print(f'  AI Content      : {ai_pct:.1f}%')
    print(f'  Original Content: {100 - ai_pct:.1f}%')

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
    parser.add_argument('--model', default=MODEL_PATH, help='Path to .pth checkpoint')
    parser.add_argument('--save',  default=None,       help='Path to save output image')
    args = parser.parse_args()

    model  = load_model(args.model)
    result = predict(args.image, model, save_path=args.save)
