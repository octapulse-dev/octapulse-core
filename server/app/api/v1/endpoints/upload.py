"""
File upload endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import aiofiles
import uuid
from pathlib import Path
import logging
from datetime import datetime

from app.core.config import settings
from app.utils.file_utils import validate_image_file, generate_unique_filename
from app.models.fish_analysis import AnalysisStatus

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/single")
async def upload_single_image(
    file: UploadFile = File(...),
    grid_square_size: float = Form(default=1.0),
    include_visualizations: bool = Form(default=True)
):
    """
    Upload a single fish image for analysis
    
    Args:
        file: Image file to upload
        grid_square_size: Size of grid squares in inches for calibration
        include_visualizations: Whether to generate visualization images
    
    Returns:
        Upload confirmation with file info and analysis trigger
    """
    try:
        # Validate file
        await validate_image_file(file)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = generate_unique_filename(file.filename)
        
        # Create upload directory
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"Single image uploaded: {unique_filename}")
        
        # Return upload info
        return {
            "status": "success",
            "message": "Image uploaded successfully",
            "file_info": {
                "original_filename": file.filename,
                "saved_filename": unique_filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "upload_time": datetime.utcnow().isoformat()
            },
            "analysis_params": {
                "grid_square_size": grid_square_size,
                "include_visualizations": include_visualizations
            },
            "next_step": f"Call /api/v1/analysis/single with file_path: {file_path}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading single image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during upload")

@router.post("/batch")
async def upload_batch_images(
    files: List[UploadFile] = File(...),
    grid_square_size: float = Form(default=1.0),
    include_visualizations: bool = Form(default=True)
):
    """
    Upload multiple fish images for batch analysis
    
    Args:
        files: List of image files to upload
        grid_square_size: Size of grid squares in inches for calibration
        include_visualizations: Whether to generate visualization images
    
    Returns:
        Batch upload confirmation with file info and analysis trigger
    """
    try:
        # Validate batch size
        if len(files) > settings.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Batch size exceeds maximum of {settings.MAX_BATCH_SIZE} images"
            )
        
        if len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Create upload directory
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(exist_ok=True)
        
        uploaded_files = []
        failed_files = []
        
        # Process each file
        for file in files:
            try:
                # Validate file
                await validate_image_file(file)
                
                # Generate unique filename
                unique_filename = generate_unique_filename(file.filename)
                file_path = upload_dir / unique_filename
                
                # Save file
                async with aiofiles.open(file_path, 'wb') as f:
                    content = await file.read()
                    await f.write(content)
                
                uploaded_files.append({
                    "original_filename": file.filename,
                    "saved_filename": unique_filename,
                    "file_path": str(file_path),
                    "file_size": len(content),
                    "upload_time": datetime.utcnow().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error uploading file {file.filename}: {str(e)}")
                failed_files.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        if not uploaded_files:
            raise HTTPException(
                status_code=400,
                detail="No files were successfully uploaded"
            )
        
        batch_id = str(uuid.uuid4())
        
        logger.info(f"Batch upload completed: {len(uploaded_files)} successful, {len(failed_files)} failed")
        
        return {
            "status": "success",
            "message": f"Batch upload completed: {len(uploaded_files)} files uploaded",
            "batch_id": batch_id,
            "uploaded_files": uploaded_files,
            "failed_files": failed_files,
            "analysis_params": {
                "grid_square_size": grid_square_size,
                "include_visualizations": include_visualizations
            },
            "next_step": f"Call /api/v1/analysis/batch with batch_id: {batch_id}",
            "summary": {
                "total_files": len(files),
                "successful_uploads": len(uploaded_files),
                "failed_uploads": len(failed_files)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during batch upload")

@router.get("/status/{filename}")
async def get_upload_status(filename: str):
    """
    Check if a file exists in uploads
    
    Args:
        filename: Name of the uploaded file
    
    Returns:
        File existence status and metadata
    """
    try:
        file_path = Path(settings.UPLOAD_DIR) / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        file_stats = file_path.stat()
        
        return {
            "status": "found",
            "filename": filename,
            "file_path": str(file_path),
            "file_size": file_stats.st_size,
            "modified_time": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
            "exists": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking upload status for {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking file status")

@router.delete("/cleanup")
async def cleanup_old_uploads(days_old: int = 7):
    """
    Clean up old uploaded files
    
    Args:
        days_old: Delete files older than this many days
    
    Returns:
        Cleanup summary
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        if not upload_dir.exists():
            return {"status": "success", "message": "Upload directory does not exist", "deleted_count": 0}
        
        cutoff_time = datetime.now().timestamp() - (days_old * 24 * 3600)
        deleted_files = []
        
        for file_path in upload_dir.iterdir():
            if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                try:
                    file_path.unlink()
                    deleted_files.append(str(file_path.name))
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {str(e)}")
        
        logger.info(f"Cleanup completed: {len(deleted_files)} files deleted")
        
        return {
            "status": "success",
            "message": f"Cleanup completed",
            "deleted_count": len(deleted_files),
            "deleted_files": deleted_files,
            "days_old": days_old
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during cleanup operation")