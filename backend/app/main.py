"""
HarvestIQ - Main FastAPI Application
Modular Monolith Entry Point.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import init_db
from app.api.routes_analyze import router as analyze_router
from app.api.routes_data import router as data_router
from app.api.routes_history import router as history_router
from app.api.routes_baseline import router as baseline_router

# Ensure tables are created on module import
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.MODEL_VERSION,
    description="Risk-Aware Harvest Timing & Market Option Decision Support System",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(analyze_router)
app.include_router(data_router)
app.include_router(history_router)
app.include_router(baseline_router)

@app.get("/api/health", tags=["System"])
def health_check():
    """System liveness and metadata health endpoint."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "model_version": settings.MODEL_VERSION,
        "parameter_version": settings.PARAMETER_VERSION,
        "database": "SQLite (Connected)",
        "offline_ready": True
    }
