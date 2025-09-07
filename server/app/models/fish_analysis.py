"""
Pydantic models for fish analysis
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
from enum import Enum

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Point2D(BaseModel):
    """2D point coordinates"""
    x: float
    y: float
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {"x": 150.5, "y": 200.3}
        }
    )

class BoundingBox(BaseModel):
    """Bounding box coordinates"""
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float = Field(..., ge=0.0, le=1.0)

class Detection(BaseModel):
    """Individual detection result"""
    class_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: BoundingBox
    mask_area: Optional[float] = None

class Measurement(BaseModel):
    """Fish measurement data"""
    name: str
    distance_inches: float = Field(..., ge=0.0)
    point1: Point2D
    point2: Optional[Point2D] = None
    label: str
    measurement_type: str = Field(default="length")  # length, area, etc.
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "head_to_pectoral",
                "distance_inches": 2.5,
                "point1": {"x": 100.0, "y": 150.0},
                "point2": {"x": 200.0, "y": 175.0},
                "label": "2.5inches",
                "measurement_type": "length"
            }
        }
    )

class ColorAnalysis(BaseModel):
    """Fish color analysis results"""
    mean_color_bgr: List[float] = Field(..., min_length=3, max_length=3)
    dominant_colors: List[List[float]]
    color_percentages: List[float]
    color_variance: List[float] = Field(..., min_length=3, max_length=3)
    total_pixels: int = Field(..., ge=0)

class LateralLineAnalysis(BaseModel):
    """Lateral line analysis results"""
    linearity_score: float = Field(..., ge=0.0, le=1.0)
    mean_deviation: float = Field(..., ge=0.0)
    max_deviation: float = Field(..., ge=0.0)
    centerline_points: List[Point2D]

class CalibrationInfo(BaseModel):
    """Grid calibration information"""
    pixels_per_inch: float = Field(..., gt=0)
    grid_square_size_inches: float = Field(..., gt=0)
    detected_squares: int = Field(..., ge=0)
    calibration_quality: str = Field(default="good")  # good, fair, poor

class ImageDimensions(BaseModel):
    """Image dimensions"""
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)

class ProcessingMetadata(BaseModel):
    """Processing metadata"""
    processing_time_seconds: float = Field(..., ge=0)
    model_version: str
    api_version: str
    processed_at: datetime = Field(default_factory=datetime.utcnow)

class FishAnalysisResult(BaseModel):
    """Complete fish analysis result"""
    analysis_id: str
    image_path: str
    status: AnalysisStatus
    image_dimensions: ImageDimensions
    calibration: CalibrationInfo
    detections: Dict[str, int]  # class_name -> count
    detailed_detections: List[Detection]
    measurements: List[Measurement]
    color_analysis: Optional[ColorAnalysis] = None
    lateral_line_analysis: Optional[LateralLineAnalysis] = None
    processing_metadata: ProcessingMetadata
    visualization_paths: Dict[str, str] = Field(default_factory=dict)
    error_message: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "analysis_id": "analysis_123456",
                "image_path": "/uploads/fish_001.jpg",
                "status": "completed",
                "image_dimensions": {"width": 1920, "height": 1080},
                "calibration": {
                    "pixels_per_inch": 45.2,
                    "grid_square_size_inches": 1.0,
                    "detected_squares": 12,
                    "calibration_quality": "good"
                },
                "detections": {"trout": 1, "eye": 2, "pectoral_fin": 2},
                "measurements": [],
                "processing_metadata": {
                    "processing_time_seconds": 3.45,
                    "model_version": "model",
                    "api_version": "1.0.0"
                }
            }
        }
    )

class BatchAnalysisRequest(BaseModel):
    """Batch analysis request"""
    images: List[str] = Field(..., min_length=1, max_length=100)
    grid_square_size_inches: float = Field(default=1.0, gt=0)
    include_visualizations: bool = Field(default=True)
    batch_id: Optional[str] = None  # Optional batch_id from upload
    
class BatchAnalysisResult(BaseModel):
    """Batch analysis result"""
    batch_id: str
    status: AnalysisStatus
    total_images: int = Field(..., ge=0)
    completed_images: int = Field(..., ge=0)
    failed_images: int = Field(..., ge=0)
    results: List[FishAnalysisResult]
    processing_metadata: ProcessingMetadata
    error_message: Optional[str] = None

class AnalysisRequest(BaseModel):
    """Single image analysis request"""
    image_path: str
    grid_square_size_inches: float = Field(default=1.0, gt=0)
    include_visualizations: bool = Field(default=True)
    include_color_analysis: bool = Field(default=True)
    include_lateral_line_analysis: bool = Field(default=True)

# Population Analysis Models
class PopulationDistribution(BaseModel):
    """Statistical distribution for a measurement"""
    measurement_name: str
    mean: float
    median: float
    std_dev: float
    min_value: float
    max_value: float
    q25: float
    q75: float
    skewness: float
    kurtosis: float
    sample_size: int

class PopulationCorrelation(BaseModel):
    """Correlation between two measurements"""
    measurement1: str
    measurement2: str
    correlation_coefficient: float
    p_value: float
    relationship_strength: str  # 'very_weak', 'weak', 'moderate', 'strong', 'very_strong'

class PopulationInsight(BaseModel):
    """Statistical insight about the population"""
    category: str  # 'distribution', 'correlation', 'outlier', 'trend', 'comparison'
    title: str
    insight: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    data_points: int
    statistical_significance: Optional[float] = None

class SizeClassification(BaseModel):
    """Size category information"""
    count: int
    percentage: float
    range: List[float] = Field(..., min_length=2, max_length=2)

class QualityMetrics(BaseModel):
    """Analysis quality metrics"""
    high_confidence: int
    medium_confidence: int
    low_confidence: int
    average_detection_confidence: float

class PopulationStatistics(BaseModel):
    """Complete population analysis statistics"""
    total_fish: int
    successful_analyses: int
    failed_analyses: int
    processing_time_total: float
    processing_time_average: float
    distributions: List[PopulationDistribution]
    correlations: List[PopulationCorrelation]
    insights: List[PopulationInsight]
    size_classification: Dict[str, SizeClassification]  # small, medium, large
    quality_metrics: QualityMetrics

class BatchAnalysisResultEnhanced(BatchAnalysisResult):
    """Enhanced batch analysis result with population statistics"""
    population_statistics: PopulationStatistics
    visualization_urls: Dict[str, List[str]] = Field(default_factory=dict)

class PaginationMeta(BaseModel):
    """Pagination metadata"""
    total_items: int
    items_per_page: int
    current_page: int
    total_pages: int
    has_next: bool
    has_previous: bool
    next_page: Optional[int] = None
    previous_page: Optional[int] = None

class PaginatedResults(BaseModel):
    """Paginated results wrapper"""
    items: List[FishAnalysisResult]
    pagination: PaginationMeta

class BatchResultsQuery(BaseModel):
    """Query parameters for batch results"""
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=12, ge=1, le=100)
    status_filter: Optional[AnalysisStatus] = None
    sort_by: str = Field(default="created_at")
    sort_order: str = Field(default="desc")
    search: Optional[str] = None

class AnalysisProgress(BaseModel):
    """Enhanced analysis progress information"""
    batch_id: str
    status: AnalysisStatus
    total_images: int
    completed_images: int
    failed_images: int
    current_image: Optional[str] = None
    progress_percent: float
    estimated_completion_time: Optional[str] = None
    processing_rate: Optional[float] = None  # images per minute
    average_processing_time: Optional[float] = None  # seconds per image

class ComprehensiveBatchResult(BaseModel):
    """Complete batch analysis result with all data"""
    batch_analysis: BatchAnalysisResultEnhanced
    paginated_results: PaginatedResults
    download_urls: Dict[str, str] = Field(default_factory=dict)

class BatchUploadResponse(BaseModel):
    """Response from batch upload endpoint"""
    status: str
    message: str
    batch_id: str
    uploaded_files: List[Dict[str, Any]]
    failed_files: List[Dict[str, str]]
    analysis_params: Dict[str, Any]
    next_step: str
    summary: Dict[str, int]