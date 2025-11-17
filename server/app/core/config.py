"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str = "OctaPulse Aquaculture Analysis API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3003"
    ]
    
    # Model settings
    MODEL_PATH: str = Field(
        default="documents/best.pt",
        description="Path to the trained model"
    )
    
    GRID_SQUARE_SIZE_INCHES: float = Field(
        default=1.0,
        description="Size of grid squares in inches for calibration"
    )
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = Field(
        default=10 * 1024 * 1024,  # 10MB
        description="Maximum file upload size in bytes"
    )
    
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [
        ".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"
    ]
    
    # Directory settings
    UPLOAD_DIR: str = "uploads"
    RESULTS_DIR: str = "results"
    TEMP_DIR: str = "temp"
    
    # Processing settings
    MAX_BATCH_SIZE: int = Field(
        default=100,
        description="Maximum number of images in a batch"
    )
    CONCURRENCY_LIMIT: int = Field(
        default=3,
        description="Maximum number of concurrent image processing tasks"
    )
    MEMORY_TTL_SECONDS: int = Field(
        default=60 * 30,  # 30 minutes
        description="TTL for in-memory stored images and artifacts"
    )

    # AprilTag calibration
    APRILTAG_SIZE_MM: float = Field(
        default=100.0,
        description="Physical side length of the AprilTag in millimeters"
    )
    APRILTAG_FAMILY: str = Field(
        default="DICT_APRILTAG_25h9",
        description="OpenCV aruco predefined AprilTag dictionary to detect"
    )

    # Optional global limits and debugging
    MAX_TOTAL_BATCH_SIZE: int = Field(
        default=2_147_483_648,  # 2 GB
        description="Maximum total size of a batch upload in bytes"
    )
    DEBUG: bool = Field(default=True, description="Enable debug mode")
    LOG_LEVEL: str = Field(default="INFO", description="Application log level")

    # Storage configuration
    STORAGE_TYPE: str = Field(
        default="memory",  # memory | s3
        description="Active storage backend"
    )
    S3_BUCKET_NAME: Optional[str] = Field(default=None, description="S3 bucket name for storage")
    S3_REGION: Optional[str] = Field(default=None, description="S3 region")
    S3_ENDPOINT_URL: Optional[str] = Field(default=None, description="Custom S3 endpoint URL (for MinIO, etc.)")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, description="AWS access key id")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, description="AWS secret access key")
    S3_USE_SSL: bool = Field(default=True, description="Use SSL for S3 connections")
    MEMORY_STORAGE_MAX_SIZE_MB: int = Field(
        default=500,
        description="Max memory store size in MB (soft limit, local only)"
    )
    MEMORY_STORAGE_MAX_OBJECTS: int = Field(
        default=1000,
        description="Max number of objects allowed in memory store"
    )

    # Celery / async processing backends (optional for local dev)
    CELERY_BROKER_URL: Optional[str] = Field(
        default="redis://localhost:6379/0",
        description="Celery broker URL"
    )
    CELERY_RESULT_BACKEND: Optional[str] = Field(
        default="redis://localhost:6379/0",
        description="Celery result backend URL"
    )
    
    # Security settings
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for JWT tokens"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()

# Ensure model path is absolute
if not os.path.isabs(settings.MODEL_PATH):
    settings.MODEL_PATH = os.path.join(os.getcwd(), settings.MODEL_PATH)