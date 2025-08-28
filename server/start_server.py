#!/usr/bin/env python3
"""
OctaPulse Server Startup Script
Professional startup script for the FastAPI backend
"""

import uvicorn
import sys
import os
from pathlib import Path
import logging
from app.core.logger import setup_logging
from app.core.config import settings

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    """Main function to start the server"""
    
    # Setup logging
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # Check if model file exists
    if not Path(settings.MODEL_PATH).exists():
        logger.error(f"Model file not found: {settings.MODEL_PATH}")
        logger.error("Please ensure the YOLO model file 'best.pt' is present in the documents/ directory")
        sys.exit(1)
    
    # Create necessary directories
    directories = ['uploads', 'results', 'logs', 'temp']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    logger.info("="*70)
    logger.info("🐟 Starting OctaPulse Aquaculture Analysis API Server")
    logger.info("="*70)
    logger.info(f"📊 Project: {settings.PROJECT_NAME}")
    logger.info(f"🔢 Version: {settings.VERSION}")
    logger.info(f"🤖 Model: {settings.MODEL_PATH}")
    logger.info(f"📐 Grid Size: {settings.GRID_SQUARE_SIZE_INCHES} inches")
    logger.info(f"🌐 CORS Origins: {settings.ALLOWED_HOSTS}")
    logger.info("="*70)
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True,
        workers=1  # Single worker for development
    )

if __name__ == "__main__":
    main()