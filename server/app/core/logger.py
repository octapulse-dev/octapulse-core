"""
Logging configuration
"""

import logging
import sys
from datetime import datetime
from pathlib import Path

def setup_logging():
    """Setup application logging"""
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Configure logging format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler
            logging.FileHandler(
                logs_dir / f"octapulse_{datetime.now().strftime('%Y%m%d')}.log"
            )
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("ultralytics").setLevel(logging.WARNING)  # Reduce YOLO verbosity