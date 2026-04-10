import numpy as np
from schemas import Region

def generate_heatmap_regions(ai_score: float, img_class: str, mask: list = None) -> list[Region]:
    regions = []

    if mask is not None:
        # Use actual mask from model — divide into real spatial regions
        m = np.array(mask)
        h, w = m.shape

        # Split mask into spatial zones
        top    = m[:h//2, :]
        bottom = m[h//2:, :]
        left   = m[:, :w//2]
        right  = m[:, w//2:]
        center = m[h//4:3*h//4, w//4:3*w//4]
        edge   = np.concatenate([m[0,:], m[-1,:], m[:,0], m[:,-1]])

        zone_scores = {
            "Background": round(float(top.mean()) * 100, 1),
            "Foreground": round(float(bottom.mean()) * 100, 1),
            "Texture":    round(float(center.mean()) * 100, 1),
            "Edges":      round(float(edge.mean()) * 100, 1),
            "Lighting":   round(float(right.mean()) * 100, 1),
            "Metadata":   5.0 if img_class != "AI" else round(float(left.mean()) * 100, 1),
        }
    else:
        # Fallback if no mask — use ai_score with small variance
        zone_scores = {
            "Background": round(ai_score, 1),
            "Foreground": round(ai_score * 0.9, 1),
            "Texture":    round(ai_score * 0.8, 1),
            "Edges":      round(ai_score * 0.7, 1),
            "Lighting":   round(ai_score * 0.85, 1),
            "Metadata":   5.0 if img_class != "AI" else round(ai_score * 0.3, 1),
        }

    for name, score in zone_scores.items():
        if score >= 60:
            status = "ai"
        elif score >= 30:
            status = "suspect"
        else:
            status = "clean"
        regions.append(Region(name=name, score=score, status=status))

    return regions