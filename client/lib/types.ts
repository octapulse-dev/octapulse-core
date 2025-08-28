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