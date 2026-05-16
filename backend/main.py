"""
main.py  –  DuckTrack FastAPI application entry point
Run with:  uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
import farmer
import veterinary
import uploads

# ── Create DB tables on startup ───────────────────────────────────────────────
create_tables()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "DuckTrack API",
    description = "Duck disease detection, alerting and tracking platform",
    version     = "1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],   # Tighten in production
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(farmer.router)
app.include_router(veterinary.router)
app.include_router(uploads.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "DuckTrack API v1.0"}