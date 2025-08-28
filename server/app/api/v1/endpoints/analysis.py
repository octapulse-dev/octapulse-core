"""
Fish analysis endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Dict, Any
import logging
from pathlib import Path
import uuid
from datetime import datetime
import asyncio

from app.core.config import settings
from app.models.fish_analysis import (
    FishAnalysisResult, BatchAnalysisResult, AnalysisRequest, 
    BatchAnalysisRequest, AnalysisStatus
)
from app.services.fish_measurement import fish_measurement_service

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for batch analysis status (in production, use Redis/database)
batch_analysis_status: Dict[str, Dict[str, Any]] = {}

@router.post("/single", response_model=FishAnalysisResult)
async def analyze_single_image(request: AnalysisRequest):
    """
    Analyze a single fish image
    
    Args:
        request: Analysis request with image path and parameters
        
    Returns:
        Complete fish analysis result
    """
    try:
        # Validate image path exists
        image_path = Path(request.image_path)
        if not image_path.exists():
            raise HTTPException(status_code=404, detail=f"Image not found: {request.image_path}")
        
        logger.info(f"Starting single image analysis: {request.image_path}")
        
        # Process the image
        result = await fish_measurement_service.process_image(
            image_path=request.image_path,
            grid_square_size=request.grid_square_size_inches,
            include_visualizations=request.include_visualizations,
            include_color_analysis=request.include_color_analysis,
            include_lateral_line_analysis=request.include_lateral_line_analysis
        )
        
        logger.info(f"Single image analysis completed: {result.analysis_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in single image analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/batch")
async def start_batch_analysis(
    request: BatchAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Start batch analysis of multiple images
    
    Args:
        request: Batch analysis request
        background_tasks: FastAPI background tasks
        
    Returns:
        Batch analysis initiation response
    """
    try:
        batch_id = str(uuid.uuid4())
        
        # Validate all image paths exist
        valid_images = []
        invalid_images = []
        
        for image_path in request.images:
            if Path(image_path).exists():
                valid_images.append(image_path)
            else:
                invalid_images.append(image_path)
        
        if not valid_images:
            raise HTTPException(status_code=400, detail="No valid images found")
        
        # Initialize batch status
        batch_analysis_status[batch_id] = {
            "batch_id": batch_id,
            "status": AnalysisStatus.PENDING,
            "total_images": len(valid_images),
            "completed_images": 0,
            "failed_images": len(invalid_images),
            "results": [],
            "invalid_images": invalid_images,
            "started_at": datetime.utcnow(),
            "grid_square_size": request.grid_square_size_inches,
            "include_visualizations": request.include_visualizations
        }
        
        # Start background processing
        background_tasks.add_task(
            _process_batch_images, 
            batch_id, 
            valid_images,
            request.grid_square_size_inches,
            request.include_visualizations
        )
        
        logger.info(f"Batch analysis started: {batch_id} with {len(valid_images)} images")
        
        return {
            "message": "Batch analysis started",
            "batch_id": batch_id,
            "total_images": len(valid_images),
            "invalid_images": invalid_images,
            "status_check_url": f"/api/v1/analysis/batch/{batch_id}/status"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting batch analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start batch analysis")

@router.get("/batch/{batch_id}/status")
async def get_batch_status(batch_id: str):
    """
    Get batch analysis status
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Current batch status
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        status_info = batch_analysis_status[batch_id].copy()
        
        # Calculate progress
        progress_percent = 0
        if status_info["total_images"] > 0:
            progress_percent = (status_info["completed_images"] / status_info["total_images"]) * 100
        
        status_info["progress_percent"] = round(progress_percent, 1)
        
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting batch status: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving batch status")

@router.get("/batch/{batch_id}/results", response_model=BatchAnalysisResult)
async def get_batch_results(batch_id: str):
    """
    Get complete batch analysis results
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Complete batch analysis results
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        
        if batch_info["status"] == AnalysisStatus.PROCESSING:
            raise HTTPException(
                status_code=202, 
                detail="Batch analysis still in progress. Check status first."
            )
        
        # Create batch result
        batch_result = BatchAnalysisResult(
            batch_id=batch_id,
            status=batch_info["status"],
            total_images=batch_info["total_images"],
            completed_images=batch_info["completed_images"],
            failed_images=batch_info["failed_images"],
            results=batch_info["results"],
            processing_metadata={
                "processing_time_seconds": batch_info.get("total_processing_time", 0),
                "model_version": "yolov8",
                "api_version": settings.VERSION,
                "processed_at": batch_info["started_at"]
            }
        )
        
        return batch_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting batch results: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving batch results")

@router.get("/result/{analysis_id}/visualization/{viz_type}")
async def get_visualization(analysis_id: str, viz_type: str):
    """
    Get visualization image for an analysis
    
    Args:
        analysis_id: Analysis ID
        viz_type: Type of visualization ('detailed' or 'measurements')
        
    Returns:
        Visualization image file
    """
    try:
        if viz_type not in ['detailed', 'measurements']:
            raise HTTPException(
                status_code=400, 
                detail="Invalid visualization type. Use 'detailed' or 'measurements'"
            )
        
        # Find visualization file
        results_dir = Path(settings.RESULTS_DIR)
        viz_filename = f"{analysis_id}_{viz_type}.jpg"
        viz_path = results_dir / viz_filename
        
        if not viz_path.exists():
            raise HTTPException(status_code=404, detail="Visualization not found")
        
        return FileResponse(
            path=str(viz_path),
            media_type="image/jpeg",
            filename=viz_filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting visualization: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving visualization")

@router.delete("/batch/{batch_id}")
async def cancel_batch_analysis(batch_id: str):
    """
    Cancel a running batch analysis
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Cancellation confirmation
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        
        if batch_info["status"] in [AnalysisStatus.COMPLETED, AnalysisStatus.FAILED]:
            raise HTTPException(status_code=400, detail="Cannot cancel completed analysis")
        
        # Mark as cancelled (the background task should check this)
        batch_analysis_status[batch_id]["status"] = AnalysisStatus.FAILED
        batch_analysis_status[batch_id]["error_message"] = "Analysis cancelled by user"
        
        logger.info(f"Batch analysis cancelled: {batch_id}")
        
        return {
            "message": "Batch analysis cancelled",
            "batch_id": batch_id,
            "status": "cancelled"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling batch analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Error cancelling batch analysis")

async def _process_batch_images(
    batch_id: str, 
    image_paths: List[str],
    grid_square_size: float,
    include_visualizations: bool
):
    """
    Background task to process batch images
    
    Args:
        batch_id: Batch ID
        image_paths: List of image paths to process
        grid_square_size: Grid calibration size
        include_visualizations: Generate visualizations
    """
    try:
        batch_info = batch_analysis_status[batch_id]
        batch_info["status"] = AnalysisStatus.PROCESSING
        
        start_time = datetime.now()
        results = []
        
        for i, image_path in enumerate(image_paths):
            try:
                # Check if batch was cancelled
                if batch_info["status"] == AnalysisStatus.FAILED:
                    logger.info(f"Batch {batch_id} was cancelled, stopping processing")
                    break
                
                logger.info(f"Processing batch image {i+1}/{len(image_paths)}: {image_path}")
                
                result = await fish_measurement_service.process_image(
                    image_path=image_path,
                    grid_square_size=grid_square_size,
                    include_visualizations=include_visualizations
                )
                
                results.append(result)
                batch_info["completed_images"] += 1
                
                logger.info(f"Completed batch image {i+1}/{len(image_paths)}")
                
            except Exception as e:
                logger.error(f"Error processing batch image {image_path}: {str(e)}")
                batch_info["failed_images"] += 1
        
        # Finalize batch
        total_time = (datetime.now() - start_time).total_seconds()
        batch_info["results"] = results
        batch_info["total_processing_time"] = total_time
        
        if batch_info["status"] != AnalysisStatus.FAILED:  # Not cancelled
            batch_info["status"] = AnalysisStatus.COMPLETED
        
        batch_info["completed_at"] = datetime.utcnow()
        
        logger.info(f"Batch processing completed: {batch_id} in {total_time:.2f}s")
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        batch_analysis_status[batch_id]["status"] = AnalysisStatus.FAILED
        batch_analysis_status[batch_id]["error_message"] = str(e)