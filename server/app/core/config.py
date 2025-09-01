"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
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
        description="Path to the trained YOLO model"
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