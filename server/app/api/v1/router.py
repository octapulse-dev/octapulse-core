"""
API v1 Router - Main router that includes all endpoint routers
"""

from fastapi import APIRouter
from app.api.v1.endpoints import analysis, upload

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])