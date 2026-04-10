# schemas.py
from pydantic import BaseModel
from typing import List

class Region(BaseModel):
    name: str
    score: float
    status: str  # "clean" | "suspect" | "ai"

class Finding(BaseModel):
    type: str    # "crit" | "warn" | "info"
    title: str
    detail: str

class Attribution(BaseModel):
    model: str
    confidence: float

class AnalysisResponse(BaseModel):
    ai_score: float
    originality_score: float
    manipulation_confidence: float
    gan_fingerprint: float
    verdict: str
    summary: str
    regions: List[Region]
    findings: List[Finding]
    attribution: List[Attribution]
    heatmap: str = ""  # base64 encoded PNG