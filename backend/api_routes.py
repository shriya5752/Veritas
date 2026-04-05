# api_routes.py
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import io

from schemas import AnalysisResponse
from services import run_analysis

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(image: UploadFile = File(...)):

    # ── Validate file type ────────────────────────────────────
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not an image"
        )

    # ── Read and validate image ───────────────────────────────
    contents = await image.read()

    # Check file size — max 10MB
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )

    # ── Open image ────────────────────────────────────────────
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read image. File may be corrupted"
        )

    # ── Run analysis ──────────────────────────────────────────
    try:
        result = await run_analysis(img, image.filename)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )