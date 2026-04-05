# image_utils.py
from schemas import Region

def generate_heatmap_regions(ai_score: float, img_class: str) -> list[Region]:

    # Base region definitions
    region_names = ["Background", "Foreground", "Texture", "Edges", "Lighting", "Metadata"]

    regions = []

    for i, name in enumerate(region_names):

        # Metadata is almost always clean — real cameras leave metadata
        if name == "Metadata":
            if img_class == "AI":
                score = 5.0
                status = "clean"
            elif img_class == "Tampered":
                score = round(ai_score * 0.4, 1)
                status = "suspect" if score > 30 else "clean"
            else:
                score = 10.0
                status = "clean"

        # Other regions vary based on ai_score
        else:
            variance = (i * 7) % 15  # slight variance per region
            score = round(min(100, max(0, ai_score + variance - 7)), 1)

            if score >= 70:
                status = "ai"
            elif score >= 40:
                status = "suspect"
            else:
                status = "clean"

        regions.append(Region(
            name=name,
            score=score,
            status=status
        ))

    return regions