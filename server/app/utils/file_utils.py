"""
File utilities for upload handling
"""

import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
import magic
from typing import List
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

async def validate_image_file(file: UploadFile) -> None:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file to validate
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check file size
    content = await file.read()
    file_size = len(content)
    
    # Reset file position for later reading
    await file.seek(0)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024*1024):.1f}MB"
        )
    
    # Check file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Check MIME type using python-magic
    try:
        mime_type = magic.from_buffer(content[:2048], mime=True)
        valid_mime_types = [
            'image/jpeg', 'image/png', 'image/bmp', 
            'image/tiff', 'image/x-ms-bmp'
        ]
        
        if mime_type not in valid_mime_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Detected: {mime_type}"
            )
            
    except Exception as e:
        logger.warning(f"MIME type detection failed: {str(e)}")
        # Continue without MIME validation if magic fails

def generate_unique_filename(original_filename: str) -> str:
    """
    Generate unique filename while preserving extension
    
    Args:
        original_filename: Original filename
        
    Returns:
        Unique filename with timestamp and UUID
    """
    from datetime import datetime
    
    file_path = Path(original_filename)
    extension = file_path.suffix.lower()
    
    # Create unique filename with timestamp and UUID
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    
    return f"fish_{timestamp}_{unique_id}{extension}"

def clean_filename(filename: str) -> str:
    """
    Clean filename by removing unsafe characters
    
    Args:
        filename: Original filename
        
    Returns:
        Cleaned filename
    """
    import re
    
    # Remove unsafe characters
    cleaned = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove multiple consecutive underscores
    cleaned = re.sub(r'_+', '_', cleaned)
    
    # Limit length
    if len(cleaned) > 100:
        file_path = Path(cleaned)
        extension = file_path.suffix
        name = file_path.stem[:90]
        cleaned = f"{name}{extension}"
    
    return cleaned

def get_file_info(file_path: Path) -> dict:
    """
    Get file information
    
    Args:
        file_path: Path to file
        
    Returns:
        Dictionary with file information
    """
    try:
        stats = file_path.stat()
        
        return {
            "filename": file_path.name,
            "size_bytes": stats.st_size,
            "size_mb": round(stats.st_size / (1024 * 1024), 2),
            "created": stats.st_ctime,
            "modified": stats.st_mtime,
            "exists": True
        }
    except Exception as e:
        return {
            "filename": file_path.name,
            "error": str(e),
            "exists": False
        }