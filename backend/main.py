# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from api_routes import router

# ── Create folders if they don't exist ──────────────────────
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# ── App init ─────────────────────────────────────────────────
app = FastAPI(
    title="Veritas API",
    description="Image forensics and AI derivation analysis",
    version="1.0.0"
)

# ── CORS — allows frontend to talk to backend ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Serve heatmap images as static files ─────────────────────
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# ── Routes ───────────────────────────────────────────────────
app.include_router(router)

# ── Health check ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Veritas API is running"}

# ── Run ──────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    