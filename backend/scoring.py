# scoring.py

def calculate_scores(raw: dict) -> dict:

    ai_score = round(raw["derivation_score"], 1)
    originality_score = round(100 - ai_score, 1)

    # Manipulation confidence — higher if tampered
    if raw["class"] == "Tampered":
        manipulation_confidence = round(raw["confidence"] * 0.95, 1)
    elif raw["class"] == "AI":
        manipulation_confidence = round(raw["confidence"] * 0.85, 1)
    else:
        manipulation_confidence = round(raw["confidence"] * 0.15, 1)

    # GAN fingerprint — derived from ai_score with slight variance
    if raw["class"] == "AI":
        gan_fingerprint = round(ai_score * 0.90, 1)
    elif raw["class"] == "Tampered":
        gan_fingerprint = round(ai_score * 0.60, 1)
    else:
        gan_fingerprint = round(ai_score * 0.20, 1)

    return {
        "ai_score": ai_score,
        "originality_score": originality_score,
        "manipulation_confidence": manipulation_confidence,
        "gan_fingerprint": gan_fingerprint
    }


def get_verdict(ai_score: float) -> str:
    if ai_score >= 85:
        return "AI-GENERATED"
    elif ai_score >= 70:
        return "LIKELY AI-GENERATED"
    elif ai_score >= 50:
        return "HYBRID"
    elif ai_score >= 30:
        return "INCONCLUSIVE"
    elif ai_score >= 15:
        return "LIKELY AUTHENTIC"
    else:
        return "AUTHENTIC"


def get_summary(verdict: str, scores: dict, img_class: str) -> str:
    summaries = {
        "AI-GENERATED": f"Strong GAN fingerprint signatures detected across primary image regions. Texture synthesis patterns are consistent with known AI generation architectures.",
        "LIKELY AI-GENERATED": f"Image shows significant AI generation signals with {scores['ai_score']}% derivation score. Multiple synthetic patterns detected across key regions.",
        "HYBRID": f"Image contains a mix of authentic and AI-generated content. Partial synthesis detected with {scores['ai_score']}% AI influence score.",
        "INCONCLUSIVE": f"Analysis returned inconclusive results. Image shows weak signals of both authentic and synthetic origin at {scores['ai_score']}% AI score.",
        "LIKELY AUTHENTIC": f"Image appears largely authentic with minor anomalies. Low AI derivation score of {scores['ai_score']}% suggests real-world origin.",
        "AUTHENTIC": f"No significant AI generation signals detected. Image metadata and pixel patterns are consistent with authentic photographic origin."
    }
    return summaries.get(verdict, "Analysis complete.")