# schemas.py
from pydantic import BaseModel
from typing import List

# ── Region (heatmap zones) ────────────────────────────────────
class Region(BaseModel):
    name: str
    score: float
    status: str  # "clean" | "suspect" | "ai"

# ── Finding (forensic findings) ──────────────────────────────
class Finding(BaseModel):
    type: str    # "crit" | "warn" | "info"
    title: str
    detail: str

# ── Attribution (source model) ────────────────────────────────
class Attribution(BaseModel):
    model: str
    confidence: float

# ── Full response — matches frontend API contract exactly ─────
class AnalysisResponse(BaseModel):
    ai_score: float
    originality_score: float
    manipulation_confidence: float
    gan_fingerprint: float
    verdict: str   # "AUTHENTIC" | "LIKELY AUTHENTIC" | "INCONCLUSIVE" | "LIKELY AI-GENERATED" | "AI-GENERATED" | "HYBRID"
    summary: str
    regions: List[Region]
    findings: List[Finding]
    attribution: List[Attribution]