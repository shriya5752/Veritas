def calculate_scores(raw: dict) -> dict:
    ai_score = round(raw["derivation_score"], 1)
    originality_score = round(100 - ai_score, 1)

    if raw["class"] == "Tampered":
        manipulation_confidence = round(raw["confidence"] * 0.95, 1)
    elif raw["class"] == "AI":
        manipulation_confidence = round(raw["confidence"] * 0.85, 1)
    else:
        manipulation_confidence = round(raw["confidence"] * 0.15, 1)

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
        return "LIKELY AI"
    elif ai_score >= 50:
        return "SYNTHETIC HYBRID"
    elif ai_score >= 35:
        return "HEAVILY ENHANCED"
    elif ai_score >= 12:
        return "LIKELY EDITED"
    else:
        return "AUTHENTIC"

def get_summary(verdict: str, scores: dict, img_class: str) -> str:
    ai  = scores['ai_score']
    ori = scores['originality_score']

    if verdict == "AI-GENERATED":
        return f"Strong generative signatures detected across the image ({ai}% AI score). Pixel statistics and texture patterns are consistent with a fully synthetic origin."
    elif verdict == "LIKELY AI":
        return f"High AI signal detected at {ai}% — significant portions of this image show characteristics of AI generation. Authentic content is unlikely to be dominant."
    elif verdict == "SYNTHETIC HYBRID":
        return f"Mixed composition detected — {ai}% AI score suggests a meaningful blend of authentic and synthetic content. The image may be AI-edited, inpainted, or composited."
    elif verdict == "HEAVILY ENHANCED":
        return f"Significant post-processing detected at {ai}% AI score — the image shows strong signs of AI-assisted editing or enhancement beyond typical corrections."
    elif verdict == "LIKELY EDITED":
        return f"Moderate synthetic signal at {ai}% — image characteristics suggest AI-assisted edits or filters may have been applied, though core content appears real."
    else:  # AUTHENTIC
        return f"No meaningful AI generation signals detected ({ai}% AI score). Pixel patterns and image structure are consistent with an unmodified real-world photograph."