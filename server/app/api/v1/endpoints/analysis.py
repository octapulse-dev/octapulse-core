"""
Fish analysis endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
import uuid
from datetime import datetime
import asyncio
import json
import math

from app.core.config import settings
from app.models.fish_analysis import (
    FishAnalysisResult, BatchAnalysisResult, AnalysisRequest, 
    BatchAnalysisRequest, AnalysisStatus, PopulationStatistics,
    BatchAnalysisResultEnhanced, PaginatedResults, BatchResultsQuery,
    ComprehensiveBatchResult, AnalysisProgress, BatchUploadResponse,
    QualityMetrics, SizeClassification, PopulationDistribution,
    PopulationCorrelation, PopulationInsight, ImageDimensions,
    CalibrationInfo, ProcessingMetadata
)
from app.services.fish_measurement import fish_measurement_service
from app.services.in_memory_storage import store
from app.services.population_analysis import population_analysis_service

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for batch analysis status (in production, use Redis/database)
batch_analysis_status: Dict[str, Dict[str, Any]] = {}

def sanitize_for_json(obj: Any) -> Any:
    """Recursively sanitize an object to be JSON-safe, removing NaN, inf, and other problematic values."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return obj
    elif obj is None:
        return None
    else:
        return obj

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
        # Validate image path exists (supports in-memory and disk paths)
        image_path_str = request.image_path
        if image_path_str.startswith('mem://'):
            if not store.exists(image_path_str):
                raise HTTPException(status_code=404, detail=f"Image not found: {image_path_str}")
        else:
            image_path = Path(image_path_str)
            if not image_path.exists():
                raise HTTPException(status_code=404, detail=f"Image not found: {image_path_str}")
        
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
        # Use provided batch_id from request or generate new one
        batch_id = request.batch_id or str(uuid.uuid4())
        
        # Validate all image paths exist (supports in-memory and disk paths)
        valid_images = []
        invalid_images = []
        
        for image_path in request.images:
            if image_path.startswith('mem://'):
                if store.exists(image_path):
                    valid_images.append(image_path)
                else:
                    invalid_images.append(image_path)
            else:
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
        
        # First try in-memory visualization
        mem_key = f"memvis://{analysis_id}/{viz_type}.jpg"
        blob = store.get(mem_key)
        if blob is not None:
            data, content_type = blob
            return StreamingResponse(iter([data]), media_type=content_type or "image/jpeg")
        
        # Fallback to disk (legacy)
        results_dir = Path(settings.RESULTS_DIR)
        viz_filename = f"{analysis_id}_{viz_type}.jpg"
        viz_path = results_dir / viz_filename
        if viz_path.exists():
            return FileResponse(
                path=str(viz_path),
                media_type="image/jpeg",
                filename=viz_filename
            )
        
        raise HTTPException(status_code=404, detail="Visualization not found")
        
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

@router.get("/batch/{batch_id}/population-stats", response_model=PopulationStatistics)
async def get_population_statistics(batch_id: str):
    """
    Get population statistics for a completed batch analysis
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Population statistics and insights
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        
        if batch_info["status"] != AnalysisStatus.COMPLETED:
            raise HTTPException(
                status_code=400, 
                detail="Batch analysis must be completed to generate population statistics"
            )
        
        # Get the fish analysis results
        results = batch_info["results"]
        if not results:
            raise HTTPException(status_code=400, detail="No analysis results found")
        
        # Filter only successful results for population analysis
        successful_results = [r for r in results if r.status == AnalysisStatus.COMPLETED]
        if not successful_results:
            raise HTTPException(
                status_code=400, 
                detail="No successful analysis results found for population statistics"
            )
        
        # Perform population analysis using only successful results
        pop_stats = population_analysis_service.analyze_population(successful_results)
        
        # Convert to Pydantic models
        distributions = [PopulationDistribution(**dist) for dist in pop_stats["distributions"]]
        correlations = [PopulationCorrelation(**corr) for corr in pop_stats["correlations"]]
        insights = [PopulationInsight(**insight) for insight in pop_stats["insights"]]
        
        size_classification = {
            key: SizeClassification(**value) 
            for key, value in pop_stats["size_classification"].items()
        }
        
        quality_metrics = QualityMetrics(**pop_stats["quality_metrics"])
        
        population_statistics = PopulationStatistics(
            total_fish=pop_stats["total_fish"],
            successful_analyses=pop_stats["successful_analyses"],
            failed_analyses=pop_stats["failed_analyses"],
            processing_time_total=pop_stats["processing_time_total"],
            processing_time_average=pop_stats["processing_time_average"],
            distributions=distributions,
            correlations=correlations,
            insights=insights,
            size_classification=size_classification,
            quality_metrics=quality_metrics
        )
        
        return population_statistics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating population statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating population statistics")

@router.get("/batch/{batch_id}/results/paginated")
async def get_batch_results_paginated(
    batch_id: str,
    page: int = 1,
    per_page: int = 12,
    status_filter: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    search: Optional[str] = None
):
    """
    Get paginated batch analysis results with filtering and sorting
    
    Args:
        batch_id: Batch analysis ID
        page: Page number (1-based)
        per_page: Items per page
        status_filter: Filter by analysis status
        sort_by: Sort field
        sort_order: Sort direction (asc/desc)
        search: Search term
        
    Returns:
        Paginated results with metadata
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        all_results = batch_info["results"]
        
        # Filter results
        filtered_results = all_results
        
        if status_filter:
            filtered_results = [r for r in filtered_results if r.status.value == status_filter]
        
        if search:
            search_lower = search.lower()
            filtered_results = [
                r for r in filtered_results 
                if search_lower in r.image_path.lower() or search_lower in r.analysis_id.lower()
            ]
        
        # Sort results
        reverse = sort_order == "desc"
        if sort_by == "created_at":
            filtered_results.sort(key=lambda x: x.processing_metadata.processed_at, reverse=reverse)
        elif sort_by == "processing_time":
            filtered_results.sort(key=lambda x: x.processing_metadata.processing_time_seconds, reverse=reverse)
        elif sort_by == "confidence":
            filtered_results.sort(
                key=lambda x: (
                    sum(d.confidence for d in x.detailed_detections) / len(x.detailed_detections)
                    if x.detailed_detections else 0
                ), 
                reverse=reverse
            )
        
        # Paginate
        total_items = len(filtered_results)
        total_pages = max(1, (total_items + per_page - 1) // per_page)
        page = max(1, min(page, total_pages))
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_results = filtered_results[start_idx:end_idx]
        
        # Create pagination metadata
        pagination_meta = {
            "total_items": total_items,
            "items_per_page": per_page,
            "current_page": page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
            "next_page": page + 1 if page < total_pages else None,
            "previous_page": page - 1 if page > 1 else None
        }
        
        return {
            "items": page_results,
            "pagination": pagination_meta
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting paginated results: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving paginated results")

@router.get("/batch/{batch_id}/progress", response_model=AnalysisProgress)
async def get_batch_analysis_progress(batch_id: str):
    """
    Get enhanced batch analysis progress with detailed metrics
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Enhanced progress information
    """
    try:
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        
        # Calculate progress
        progress_percent = 0
        if batch_info["total_images"] > 0:
            progress_percent = (batch_info["completed_images"] / batch_info["total_images"]) * 100
        
        # Calculate processing rate
        processing_rate = None
        if batch_info.get("started_at") and batch_info["completed_images"] > 0:
            elapsed_time = (datetime.utcnow() - batch_info["started_at"]).total_seconds() / 60  # minutes
            if elapsed_time > 0:
                processing_rate = batch_info["completed_images"] / elapsed_time
        
        # Calculate average processing time
        average_processing_time = None
        if batch_info["results"]:
            processing_times = [r.processing_metadata.processing_time_seconds for r in batch_info["results"]]
            average_processing_time = sum(processing_times) / len(processing_times)
        
        # Estimate completion time
        estimated_completion_time = None
        if (processing_rate and processing_rate > 0 and 
            batch_info["status"] == AnalysisStatus.PROCESSING):
            remaining_images = batch_info["total_images"] - batch_info["completed_images"]
            remaining_minutes = remaining_images / processing_rate
            estimated_completion = datetime.utcnow().timestamp() + (remaining_minutes * 60)
            estimated_completion_time = datetime.fromtimestamp(estimated_completion).isoformat()
        
        return AnalysisProgress(
            batch_id=batch_id,
            status=batch_info["status"],
            total_images=batch_info["total_images"],
            completed_images=batch_info["completed_images"],
            failed_images=batch_info["failed_images"],
            current_image=batch_info.get("current_image"),
            progress_percent=round(progress_percent, 1),
            estimated_completion_time=estimated_completion_time,
            processing_rate=processing_rate,
            average_processing_time=average_processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting batch progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving batch progress")

@router.get("/batch/{batch_id}/comprehensive", response_model=ComprehensiveBatchResult)
async def get_comprehensive_batch_results(batch_id: str):
    """
    Get comprehensive batch results with population analysis and paginated results
    
    Args:
        batch_id: Batch analysis ID
        
    Returns:
        Complete batch analysis with population statistics
    """
    try:
        # Get basic batch results
        batch_info = batch_analysis_status[batch_id]
        if batch_info["status"] != AnalysisStatus.COMPLETED:
            if batch_info["status"] == AnalysisStatus.PROCESSING:
                raise HTTPException(
                    status_code=202, 
                    detail=f"Batch analysis still in progress: {batch_info['completed_images']}/{batch_info['total_images']} completed"
                )
            elif batch_info["status"] == AnalysisStatus.FAILED:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Batch analysis failed: {batch_info.get('error_message', 'Unknown error')}"
                )
            else:
                raise HTTPException(status_code=400, detail="Batch analysis not completed")
        
        # Get population statistics (only from successful results)
        try:
            pop_stats = await get_population_statistics(batch_id)
        except HTTPException as e:
            # If population stats fail, create empty stats for partial results
            if "No analysis results found" in str(e.detail) or batch_info["completed_images"] == 0:
                pop_stats = PopulationStatistics(
                    total_fish=0,
                    successful_analyses=0,
                    failed_analyses=batch_info["failed_images"],
                    processing_time_total=batch_info.get("total_processing_time", 0),
                    processing_time_average=0.0,
                    distributions=[],
                    correlations=[],
                    insights=[],
                    size_classification={},
                    quality_metrics=QualityMetrics(
                        high_confidence=0,
                        medium_confidence=0,
                        low_confidence=0,
                        average_detection_confidence=0.0
                    )
                )
            else:
                raise
        
        # Get first page of results
        paginated_results = await get_batch_results_paginated(batch_id, page=1, per_page=12)
        
        # Create enhanced batch result
        enhanced_batch = BatchAnalysisResultEnhanced(
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
            },
            population_statistics=pop_stats,
            visualization_urls={
                "distributions": [],  # TODO: Generate visualization URLs
                "correlations": [],
                "population_overview": [],
                "size_classification": []
            }
        )
        
        # Create download URLs
        download_urls = {
            "full_dataset_csv": f"/api/v1/analysis/batch/{batch_id}/download/csv",
            "population_report_pdf": f"/api/v1/analysis/batch/{batch_id}/download/pdf",
            "all_visualizations_zip": f"/api/v1/analysis/batch/{batch_id}/download/zip",
            "individual_results_json": f"/api/v1/analysis/batch/{batch_id}/download/json"
        }
        
        # Create the result
        result = ComprehensiveBatchResult(
            batch_analysis=enhanced_batch,
            paginated_results=paginated_results,
            download_urls=download_urls
        )
        
        # Sanitize the result to ensure JSON compatibility
        try:
            # Test JSON serialization to catch any remaining NaN values
            json.dumps(result.model_dump(), default=str)
            return result
        except (ValueError, TypeError) as e:
            logger.error(f"JSON serialization error in comprehensive results: {str(e)}")
            # If serialization fails, return a sanitized version
            sanitized_data = sanitize_for_json(result.model_dump())
            return ComprehensiveBatchResult.model_validate(sanitized_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comprehensive batch results: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving comprehensive results")

@router.get("/batch/{batch_id}/download/{format}")
async def download_batch_results(batch_id: str, format: str):
    """
    Download batch results in various formats
    
    Args:
        batch_id: Batch analysis ID
        format: Export format (csv, json, pdf, zip)
        
    Returns:
        File download response
    """
    try:
        if format not in ['csv', 'json', 'pdf', 'zip']:
            raise HTTPException(status_code=400, detail="Invalid format. Use: csv, json, pdf, zip")
        
        if batch_id not in batch_analysis_status:
            raise HTTPException(status_code=404, detail="Batch analysis not found")
        
        batch_info = batch_analysis_status[batch_id]
        if batch_info["status"] != AnalysisStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Batch analysis not completed")
        
        # For now, return a simple response
        # TODO: Implement actual file generation and download
        return JSONResponse(
            content={
                "message": f"Download would be generated for format: {format}",
                "batch_id": batch_id,
                "format": format,
                "note": "File generation not yet implemented"
            },
            status_code=501  # Not Implemented
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading batch results: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating download")

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
        
        # Concurrency control
        semaphore = asyncio.Semaphore(settings.CONCURRENCY_LIMIT)

        async def process_one(idx: int, image_path: str):
            nonlocal results
            async with semaphore:
                try:
                    if batch_info["status"] == AnalysisStatus.FAILED:
                        return
                    batch_info["current_image"] = image_path
                    logger.info(f"Processing batch image {idx+1}/{len(image_paths)}: {image_path}")
                    # Offload CPU-bound processing to a thread to avoid blocking the event loop
                    def _run_sync():
                        # Run the existing coroutine to completion in a new event loop in this worker thread
                        return asyncio.run(
                            fish_measurement_service.process_image(
                                image_path=image_path,
                                grid_square_size=grid_square_size,
                                include_visualizations=include_visualizations
                            )
                        )
                    result = await asyncio.to_thread(_run_sync)
                    results.append(result)
                    batch_info["completed_images"] += 1
                    logger.info(f"Completed batch image {idx+1}/{len(image_paths)}")
                except Exception as e:
                    logger.error(f"Error processing batch image {image_path}: {str(e)}")
                    batch_info["failed_images"] += 1
                    failed_result = FishAnalysisResult(
                        analysis_id=str(uuid.uuid4()),
                        image_path=image_path,
                        status=AnalysisStatus.FAILED,
                        image_dimensions=ImageDimensions(width=1, height=1),
                        calibration=CalibrationInfo(
                            pixels_per_inch=0.0,
                            grid_square_size_inches=grid_square_size,
                            detected_squares=0,
                            calibration_quality="failed"
                        ),
                        detections={},
                        detailed_detections=[],
                        measurements=[],
                        processing_metadata=ProcessingMetadata(
                            processing_time_seconds=0.0,
                            model_version="yolov8",
                            api_version=settings.VERSION,
                            processed_at=datetime.utcnow()
                        ),
                        error_message=str(e)
                    )
                    results.append(failed_result)
                finally:
                    # Cleanup in-memory image after processing to free memory
                    if image_path.startswith('mem://'):
                        store.delete(image_path)

        # Launch tasks
        tasks = [asyncio.create_task(process_one(i, p)) for i, p in enumerate(image_paths)]
        await asyncio.gather(*tasks)
        
        # Clear current image
        batch_info["current_image"] = None
        
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