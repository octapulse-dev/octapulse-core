/**
 * TypeScript types for the aquaculture analysis platform
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

export interface Detection {
  class_name: string;
  confidence: number;
  bounding_box: BoundingBox;
  mask_area?: number;
}

export interface Measurement {
  name: string;
  distance_inches: number;
  point1: Point2D;
  point2?: Point2D;
  label: string;
  measurement_type?: string;
}

export interface ColorAnalysis {
  mean_color_bgr: [number, number, number];
  dominant_colors: number[][];
  color_percentages: number[];
  color_variance: [number, number, number];
  total_pixels: number;
}

export interface LateralLineAnalysis {
  linearity_score: number;
  mean_deviation: number;
  max_deviation: number;
  centerline_points: Point2D[];
}

export interface CalibrationInfo {
  pixels_per_inch: number;
  grid_square_size_inches: number;
  detected_squares: number;
  calibration_quality?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessingMetadata {
  processing_time_seconds: number;
  model_version: string;
  api_version: string;
  processed_at: string;
}

export enum AnalysisStatus {
  PENDING = "pending",
  PROCESSING = "processing", 
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface FishAnalysisResult {
  analysis_id: string;
  image_path: string;
  status: AnalysisStatus;
  image_dimensions: ImageDimensions;
  calibration: CalibrationInfo;
  detections: Record<string, number>;
  detailed_detections: Detection[];
  measurements: Measurement[];
  color_analysis?: ColorAnalysis;
  lateral_line_analysis?: LateralLineAnalysis;
  processing_metadata: ProcessingMetadata;
  visualization_paths?: Record<string, string>;
  error_message?: string;
}

export interface BatchAnalysisResult {
  batch_id: string;
  status: AnalysisStatus;
  total_images: number;
  completed_images: number;
  failed_images: number;
  results: FishAnalysisResult[];
  processing_metadata: ProcessingMetadata;
  error_message?: string;
}

export interface UploadResponse {
  status: string;
  message: string;
  file_info?: {
    original_filename: string;
    saved_filename: string;
    file_path: string;
    file_size: number;
    upload_time: string;
  };
  analysis_params?: {
    grid_square_size: number;
    include_visualizations: boolean;
  };
  next_step?: string;
}

export interface BatchUploadResponse {
  status: string;
  message: string;
  batch_id: string;
  uploaded_files: Array<{
    original_filename: string;
    saved_filename: string;
    file_path: string;
    file_size: number;
    upload_time: string;
  }>;
  failed_files: Array<{
    filename: string;
    error: string;
  }>;
  analysis_params: {
    grid_square_size: number;
    include_visualizations: boolean;
  };
  next_step: string;
  summary: {
    total_files: number;
    successful_uploads: number;
    failed_uploads: number;
  };
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface AnalysisConfig {
  gridSquareSize: number;
  includeVisualizations: boolean;
  includeColorAnalysis: boolean;
  includeLateralLineAnalysis: boolean;
}

// Population Statistics Types
export interface PopulationDistribution {
  measurement_name: string;
  mean: number;
  median: number;
  std_dev: number;
  min_value: number;
  max_value: number;
  q25: number;
  q75: number;
  skewness: number;
  kurtosis: number;
  sample_size: number;
}

export interface PopulationCorrelation {
  measurement1: string;
  measurement2: string;
  correlation_coefficient: number;
  p_value: number;
  relationship_strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
}

export interface PopulationInsight {
  category: 'distribution' | 'correlation' | 'outlier' | 'trend' | 'comparison';
  title: string;
  insight: string;
  confidence: number;
  data_points: number;
  statistical_significance?: number;
}

export interface PopulationStatistics {
  total_fish: number;
  successful_analyses: number;
  failed_analyses: number;
  processing_time_total: number;
  processing_time_average: number;
  distributions: PopulationDistribution[];
  correlations: PopulationCorrelation[];
  insights: PopulationInsight[];
  size_classification: {
    small: { count: number; percentage: number; range: [number, number] };
    medium: { count: number; percentage: number; range: [number, number] };
    large: { count: number; percentage: number; range: [number, number] };
  };
  quality_metrics: {
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
    average_detection_confidence: number;
  };
}

export interface BatchAnalysisResultEnhanced extends BatchAnalysisResult {
  population_statistics: PopulationStatistics;
  visualization_urls: {
    distributions: string[];
    correlations: string[];
    population_overview: string;
    size_classification: string;
  };
}

// Pagination Types
export interface PaginationMeta {
  total_items: number;
  items_per_page: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page?: number;
  previous_page?: number;
}

export interface PaginatedResults<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface BatchResultsQuery {
  page?: number;
  per_page?: number;
  status_filter?: AnalysisStatus;
  sort_by?: 'created_at' | 'file_size' | 'processing_time' | 'confidence';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

// Enhanced Upload Types
export interface UploadProgress {
  file_index: number;
  file_name: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  progress_percent: number;
  upload_speed?: number; // bytes per second
  eta?: number; // estimated time to completion in seconds
  error?: string;
}

export interface BatchUploadProgress {
  total_files: number;
  uploaded_files: number;
  failed_files: number;
  current_file?: UploadProgress;
  overall_progress: number;
  upload_speed: number; // overall speed
  eta: number; // overall ETA
}

// Analysis Progress Types
export interface AnalysisProgress {
  batch_id: string;
  status: AnalysisStatus;
  total_images: number;
  completed_images: number;
  failed_images: number;
  current_image?: string;
  progress_percent: number;
  estimated_completion_time?: string;
  processing_rate?: number; // images per minute
  average_processing_time?: number; // seconds per image
}

// Enhanced Batch Analysis Result with Population Data
export interface ComprehensiveBatchResult {
  batch_analysis: BatchAnalysisResultEnhanced;
  paginated_results: PaginatedResults<FishAnalysisResult>;
  download_urls: {
    full_dataset_csv: string;
    population_report_pdf: string;
    all_visualizations_zip: string;
    individual_results_json: string;
  };
}