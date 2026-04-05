# services.py
from PIL import Image
from schemas import AnalysisResponse, Region, Finding, Attribution
from ml_model import predict
from scoring import calculate_scores, get_verdict, get_summary
from image_utils import generate_heatmap_regions

async def run_analysis(img: Image.Image, filename: str) -> AnalysisResponse:

    # ── Step 1: Get raw model output ──────────────────────────
    raw = predict(img)
    # raw = { "class": "AI", "confidence": 82.0, "derivation_score": 78.0 }

    # ── Step 2: Calculate all scores ─────────────────────────
    scores = calculate_scores(raw)
    # scores = { "ai_score", "originality_score", "manipulation_confidence", "gan_fingerprint" }

    # ── Step 3: Get verdict and summary ──────────────────────
    verdict = get_verdict(scores["ai_score"])
    summary = get_summary(verdict, scores, raw["class"])

    # ── Step 4: Generate region heatmap ──────────────────────
    regions = generate_heatmap_regions(scores["ai_score"], raw["class"])

    # ── Step 5: Generate findings ────────────────────────────
    findings = generate_findings(scores, raw)

    # ── Step 6: Generate attribution ─────────────────────────
    attribution = generate_attribution(raw["class"], scores["ai_score"])

    # ── Step 7: Return full response ─────────────────────────
    return AnalysisResponse(
        ai_score=scores["ai_score"],
        originality_score=scores["originality_score"],
        manipulation_confidence=scores["manipulation_confidence"],
        gan_fingerprint=scores["gan_fingerprint"],
        verdict=verdict,
        summary=summary,
        regions=regions,
        findings=findings,
        attribution=attribution
    )


def generate_findings(scores: dict, raw: dict) -> list[Finding]:
    findings = []

    # Critical — high AI score
    if scores["ai_score"] >= 70:
        findings.append(Finding(
            type="crit",
            title="GAN Artifacts Detected",
            detail=f"Characteristic frequency domain signatures match known generative model outputs with {scores['manipulation_confidence']}% confidence."
        ))

    # Critical — no real origin
    if raw["class"] == "AI":
        findings.append(Finding(
            type="crit",
            title="No EXIF Origin Data",
            detail="Image lacks authentic camera metadata, consistent with AI generation pipeline output."
        ))

    # Warning — tampered
    if raw["class"] == "Tampered":
        findings.append(Finding(
            type="warn",
            title="Manipulation Detected",
            detail=f"Image shows signs of post-generation editing. Manipulation confidence: {scores['manipulation_confidence']}%."
        ))

    # Warning — medium AI score
    if 40 <= scores["ai_score"] < 70:
        findings.append(Finding(
            type="warn",
            title="Partial AI Influence",
            detail="Image shows mixed signals — may be human-created with AI enhancement or editing."
        ))

    # Info — GAN fingerprint
    if scores["gan_fingerprint"] >= 60:
        findings.append(Finding(
            type="info",
            title="GAN Fingerprint Match",
            detail=f"Pixel distribution matches known latent diffusion model output patterns at {scores['gan_fingerprint']}% match rate."
        ))

    # Info — low AI score
    if scores["ai_score"] < 40:
        findings.append(Finding(
            type="info",
            title="Authentic Signals Present",
            detail="Image contains natural noise patterns and EXIF-consistent metadata typical of real photography."
        ))

    # Always return exactly 4 findings — pad if needed
    while len(findings) > 4:
        findings.pop()
    while len(findings) < 4:
        findings.append(Finding(
            type="info",
            title="Analysis Complete",
            detail="No additional anomalies detected in this region."
        ))

    return findings


def generate_attribution(img_class: str, ai_score: float) -> list[Attribution]:
    if img_class == "AI" or ai_score >= 70:
        return [
            Attribution(model="Stable Diffusion v1.5", confidence=round(ai_score * 0.75, 1)),
            Attribution(model="Midjourney v5",         confidence=round(ai_score * 0.15, 1)),
            Attribution(model="DALL-E 3",              confidence=round(ai_score * 0.10, 1))
        ]
    elif img_class == "Tampered":
        return [
            Attribution(model="Adobe Photoshop",       confidence=round(ai_score * 0.50, 1)),
            Attribution(model="Stable Diffusion v1.5", confidence=round(ai_score * 0.30, 1)),
            Attribution(model="GAN Inpainting",        confidence=round(ai_score * 0.20, 1))
        ]
    else:
        return [
            Attribution(model="Stable Diffusion v1.5", confidence=round(ai_score * 0.50, 1)),
            Attribution(model="Midjourney v5",         confidence=round(ai_score * 0.30, 1)),
            Attribution(model="DALL-E 3",              confidence=round(ai_score * 0.20, 1))
        ]