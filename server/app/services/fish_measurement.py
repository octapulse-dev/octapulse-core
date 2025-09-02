"""
Enhanced Fish Measurement System - Adapted for FastAPI
Based on your existing measurement system with professional improvements
"""

import cv2
import numpy as np
import json
import uuid
from pathlib import Path
from ultralytics import YOLO
import matplotlib.pyplot as plt
from scipy import ndimage
from sklearn.cluster import KMeans
import math
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime

from app.core.config import settings
from app.models.fish_analysis import (
    FishAnalysisResult, Measurement, Point2D, Detection, BoundingBox,
    ColorAnalysis, LateralLineAnalysis, CalibrationInfo, ImageDimensions,
    ProcessingMetadata, AnalysisStatus
)

logger = logging.getLogger(__name__)

class EnhancedFishMeasurementService:
    """Professional fish measurement service for FastAPI integration"""
    
    def __init__(self):
        """Initialize the enhanced fish measurement service"""
        self.model = None
        self.grid_square_size = settings.GRID_SQUARE_SIZE_INCHES
        self.pixels_per_inch = None
        self.grid_squares = []
        
        # Class names from training
        self.class_names = {
            0: "trout",
            1: "caudal_fin", 
            2: "dorsal_fin",
            3: "adipose_fin",
            4: "eye",
            5: "pectoral_fin",
            6: "pelvic_fin", 
            7: "anal_fin",
            8: "operculum"
        }
        
        # Colors for visualization (BGR format)
        self.colors = {
            'trout': (0, 255, 0),           # Green
            'eye': (255, 0, 0),             # Blue  
            'pectoral_fin': (0, 0, 255),    # Red
            'dorsal_fin': (0, 255, 255),    # Yellow
            'caudal_fin': (255, 0, 255),    # Magenta
            'adipose_fin': (255, 255, 0),   # Cyan
            'pelvic_fin': (128, 0, 128),    # Purple
            'anal_fin': (0, 165, 255),      # Orange
            'operculum': (255, 128, 0),     # Light Blue
            'measurement': (255, 255, 255), # White
            'grid': (0, 255, 255)           # Yellow
        }
        
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the YOLO model"""
        try:
            if not Path(settings.MODEL_PATH).exists():
                logger.error(f"Model file not found: {settings.MODEL_PATH}")
                raise FileNotFoundError(f"Model file not found: {settings.MODEL_PATH}")
            
            self.model = YOLO(settings.MODEL_PATH)
            logger.info(f"Model loaded successfully from {settings.MODEL_PATH}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise Exception(f"Failed to load YOLO model: {str(e)}")
    
    def detect_single_grid_square(self, image: np.ndarray) -> Optional[Tuple[float, List]]:
        """Detect grid squares for calibration"""
        logger.info("Detecting grid squares for calibration...")
        
        # Convert to different color spaces
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Try multiple enhancement approaches
        enhanced_images = []
        
        # CLAHE enhancement
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        enhanced_gray = clahe.apply(gray)
        enhanced_images.append(("CLAHE Gray", enhanced_gray))
        
        # Green channel enhancement
        green_channel = image[:,:,1]
        enhanced_green = clahe.apply(green_channel)
        enhanced_images.append(("Green Channel", enhanced_green))
        
        # HSV saturation channel
        enhanced_sat = clahe.apply(hsv[:,:,1])
        enhanced_images.append(("HSV Saturation", enhanced_sat))
        
        best_squares = []
        best_method = None
        
        for method_name, enhanced in enhanced_images:
            squares = self._find_grid_squares_in_image(enhanced)
            if len(squares) > len(best_squares):
                best_squares = squares
                best_method = method_name
        
        logger.info(f"Best detection method: {best_method}, found {len(best_squares)} squares")
        
        if not best_squares:
            logger.warning("No grid squares detected")
            return None
        
        # Calculate pixels per inch
        square_sizes = []
        for square in best_squares:
            x, y, w, h = square
            avg_size = (w + h) / 2
            square_sizes.append(avg_size)
        
        median_square_size = np.median(square_sizes)
        pixels_per_inch = median_square_size / self.grid_square_size
        
        logger.info(f"Calibration: {pixels_per_inch:.2f} pixels per inch from {len(best_squares)} squares")
        
        self.grid_squares = best_squares
        return pixels_per_inch, best_squares
    
    def _find_grid_squares_in_image(self, enhanced_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Find grid squares using contour detection"""
        squares = []
        blurred = cv2.GaussianBlur(enhanced_image, (3, 3), 0)
        threshold_values = [50, 70, 90, 110, 130]
        
        for thresh_val in threshold_values:
            _, binary = cv2.threshold(blurred, thresh_val, 255, cv2.THRESH_BINARY)
            
            # Morphological operations
            kernel = np.ones((2,2), np.uint8)
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
            
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                if len(approx) >= 4:
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    min_size = 20
                    max_size = min(enhanced_image.shape) // 3
                    aspect_ratio = w / h if h > 0 else 0
                    
                    if (min_size < w < max_size and 
                        min_size < h < max_size and
                        0.7 < aspect_ratio < 1.3):
                        
                        # Check for duplicates
                        is_duplicate = any(
                            abs(x - ex) < 10 and abs(y - ey) < 10 and
                            abs(w - ew) < 10 and abs(h - eh) < 10
                            for ex, ey, ew, eh in squares
                        )
                        
                        if not is_duplicate:
                            squares.append((x, y, w, h))
        
        return squares
    
    def run_segmentation(self, image: np.ndarray) -> Dict:
        """Run YOLO segmentation on the image"""
        if not self.model:
            raise Exception("Model not loaded")
        
        results = self.model.predict(image, conf=0.25, verbose=False)
        segmentation_data = {}
        
        if results and len(results) > 0:
            result = results[0]
            
            if result.masks is not None:
                masks = result.masks.data.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy().astype(int)
                boxes = result.boxes.xyxy.cpu().numpy()
                confidences = result.boxes.conf.cpu().numpy()
                
                for i, (mask, cls, box, conf) in enumerate(zip(masks, classes, boxes, confidences)):
                    class_name = self.class_names.get(cls, f"class_{cls}")
                    
                    if class_name not in segmentation_data:
                        segmentation_data[class_name] = []
                    
                    # Resize mask to image size
                    mask_resized = cv2.resize(mask, (image.shape[1], image.shape[0]))
                    mask_binary = (mask_resized > 0.5).astype(np.uint8)
                    
                    segmentation_data[class_name].append({
                        'mask': mask_binary,
                        'confidence': float(conf),
                        'bbox': box
                    })
        
        return segmentation_data
    
    def get_mask_endpoints(self, mask: np.ndarray) -> Dict[str, Tuple[int, int]]:
        """Get key points from a mask"""
        coords = np.where(mask > 0)
        if len(coords[0]) == 0:
            return {}
        
        y_coords, x_coords = coords
        
        leftmost_idx = x_coords.argmin()
        rightmost_idx = x_coords.argmax()
        topmost_idx = y_coords.argmin()
        bottommost_idx = y_coords.argmax()
        
        return {
            'leftmost': (int(x_coords[leftmost_idx]), int(y_coords[leftmost_idx])),
            'rightmost': (int(x_coords[rightmost_idx]), int(y_coords[rightmost_idx])),
            'topmost': (int(x_coords[topmost_idx]), int(y_coords[topmost_idx])),
            'bottommost': (int(x_coords[bottommost_idx]), int(y_coords[bottommost_idx])),
            'center': (int(x_coords.mean()), int(y_coords.mean())),
            'front': (int(x_coords[leftmost_idx]), int(y_coords[leftmost_idx])),
            'back': (int(x_coords[rightmost_idx]), int(y_coords[rightmost_idx]))
        }
    
    def calculate_distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """Calculate distance between two points in inches"""
        if self.pixels_per_inch is None:
            return 0.0
        
        pixel_distance = math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)
        return pixel_distance / self.pixels_per_inch
    
    def calculate_measurements(self, segmentation_data: Dict) -> List[Measurement]:
        """Calculate all fish measurements"""
        measurements = []
        
        trout_masks = segmentation_data.get('trout', [])
        if not trout_masks:
            logger.warning("No trout body detected")
            return measurements
        
        # Use highest confidence trout mask
        trout_mask = max(trout_masks, key=lambda x: x['confidence'])['mask']
        trout_points = self.get_mask_endpoints(trout_mask)
        
        # Find head front
        eye_masks = segmentation_data.get('eye', [])
        head_front = self._find_trout_head_front(trout_mask, [eye['mask'] for eye in eye_masks])
        
        def get_best_mask_points(masks, position='front'):
            if not masks:
                return None
            best_mask = max(masks, key=lambda x: x['confidence'])['mask']
            points = self.get_mask_endpoints(best_mask)
            return points.get(position, points.get('center'))
        
        # Calculate various measurements
        measurement_configs = [
            ('head_to_pectoral', 'pectoral_fin', 'center'),
            ('head_to_operculum', 'operculum', 'back'),
            ('head_to_dorsal', 'dorsal_fin', 'front'),
            ('head_to_pelvic', 'pelvic_fin', 'front'),
        ]
        
        for name, part_name, position in measurement_configs:
            part_masks = segmentation_data.get(part_name, [])
            if part_masks:
                point = get_best_mask_points(part_masks, position)
                if point:
                    distance = self.calculate_distance(head_front, point)
                    measurements.append(Measurement(
                        name=name,
                        distance_inches=distance,
                        point1=Point2D(x=head_front[0], y=head_front[1]),
                        point2=Point2D(x=point[0], y=point[1]),
                        label=f"{distance:.1f}inches"
                    ))
        
        # Add total length measurement
        if 'leftmost' in trout_points and 'rightmost' in trout_points:
            distance = self.calculate_distance(trout_points['leftmost'], trout_points['rightmost'])
            measurements.append(Measurement(
                name='total_length',
                distance_inches=distance,
                point1=Point2D(x=trout_points['leftmost'][0], y=trout_points['leftmost'][1]),
                point2=Point2D(x=trout_points['rightmost'][0], y=trout_points['rightmost'][1]),
                label=f"{distance:.1f}inches"
            ))
        
        return measurements
    
    def _find_trout_head_front(self, trout_mask: np.ndarray, eye_masks: List[np.ndarray]) -> Tuple[int, int]:
        """Find the front of the trout head"""
        trout_points = self.get_mask_endpoints(trout_mask)
        
        if not eye_masks or 'leftmost' not in trout_points:
            return trout_points.get('front', (0, 0))
        
        # Use eye position to determine orientation
        eye_centers = []
        for eye_mask in eye_masks:
            eye_points = self.get_mask_endpoints(eye_mask)
            if 'center' in eye_points:
                eye_centers.append(eye_points['center'])
        
        if eye_centers:
            avg_eye_x = sum(eye[0] for eye in eye_centers) / len(eye_centers)
            if avg_eye_x > trout_points['leftmost'][0]:
                return trout_points['leftmost']
            else:
                return trout_points['rightmost']
        
        return trout_points['front']
    
    def analyze_fish_color(self, image: np.ndarray, trout_mask: np.ndarray) -> Optional[ColorAnalysis]:
        """Analyze fish coloration"""
        try:
            fish_pixels = image[trout_mask > 0]
            if len(fish_pixels) == 0:
                logger.warning("No fish pixels found in mask")
                return None
            
            # Ensure we have enough pixels for meaningful analysis
            if len(fish_pixels) < 10:
                logger.warning(f"Too few fish pixels ({len(fish_pixels)}) for color analysis")
                return None
            
            # Calculate mean color with NaN handling
            mean_color = np.mean(fish_pixels, axis=0)
            if np.any(np.isnan(mean_color)) or np.any(np.isinf(mean_color)):
                logger.warning("Invalid mean color values, using defaults")
                mean_color = np.array([0.0, 0.0, 0.0])
            
            # Reshape and validate data for clustering
            pixel_data = fish_pixels.reshape(-1, 3)
            
            # Remove any invalid values
            valid_mask = ~(np.isnan(pixel_data).any(axis=1) | np.isinf(pixel_data).any(axis=1))
            pixel_data = pixel_data[valid_mask]
            
            if len(pixel_data) < 10:
                logger.warning("Too few valid pixels after filtering for color analysis")
                return None
            
            # Determine appropriate number of clusters (max 3, but adapt to data)
            n_clusters = min(3, max(1, len(pixel_data) // 5))
            
            # Color clustering with better error handling
            with np.errstate(divide='ignore', invalid='ignore'):
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                kmeans.fit(pixel_data)
                
                dominant_colors = kmeans.cluster_centers_
                labels = kmeans.labels_
                
                # Ensure we have valid cluster centers
                if np.any(np.isnan(dominant_colors)) or np.any(np.isinf(dominant_colors)):
                    logger.warning("Invalid cluster centers, falling back to mean color")
                    dominant_colors = np.array([mean_color] * n_clusters)
                
                # Calculate color percentages
                color_percentages = np.bincount(labels) / len(labels)
                if np.any(np.isnan(color_percentages)) or np.any(np.isinf(color_percentages)):
                    logger.warning("Invalid color percentages, using uniform distribution")
                    color_percentages = np.ones(n_clusters) / n_clusters
            
            # Calculate color variance
            color_variance = np.var(fish_pixels, axis=0)
            if np.any(np.isnan(color_variance)) or np.any(np.isinf(color_variance)):
                logger.warning("Invalid color variance, using zeros")
                color_variance = np.array([0.0, 0.0, 0.0])
            
            return ColorAnalysis(
                mean_color_bgr=mean_color.tolist(),
                dominant_colors=dominant_colors.tolist(),
                color_percentages=color_percentages.tolist(),
                color_variance=color_variance.tolist(),
                total_pixels=len(fish_pixels)
            )
        except Exception as e:
            logger.error(f"Error in color analysis: {str(e)}")
            return None
    
    async def process_image(
        self, 
        image_path: str, 
        grid_square_size: float = 1.0,
        include_visualizations: bool = True,
        include_color_analysis: bool = True,
        include_lateral_line_analysis: bool = True
    ) -> FishAnalysisResult:
        """
        Process a single image for fish measurements
        
        Args:
            image_path: Path to the image file
            grid_square_size: Size of grid squares in inches
            include_visualizations: Generate visualization images
            include_color_analysis: Include color analysis
            include_lateral_line_analysis: Include lateral line analysis
            
        Returns:
            Complete fish analysis result
        """
        analysis_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        processing_start = datetime.now()
        
        try:
            logger.info(f"Processing image: {image_path}")
            
            # Validate image file exists
            image_file = Path(image_path)
            if not image_file.exists():
                raise ValueError(f"Image file does not exist: {image_path}")
            
            # Validate file extension
            valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
            if image_file.suffix.lower() not in valid_extensions:
                raise ValueError(f"Unsupported image format: {image_file.suffix}")
            
            # Load and validate image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image (corrupted or invalid format): {image_path}")
            
            # Validate image dimensions
            if image.shape[0] <= 0 or image.shape[1] <= 0:
                raise ValueError(f"Invalid image dimensions: {image.shape[1]}x{image.shape[0]}")
            
            # Validate minimum image size
            if image.shape[0] < 100 or image.shape[1] < 100:
                raise ValueError(f"Image too small for analysis: {image.shape[1]}x{image.shape[0]} (minimum 100x100)")
            
            logger.info(f"Successfully loaded image: {image.shape[1]}x{image.shape[0]} pixels")
            
            self.grid_square_size = grid_square_size
            
            # Get calibration
            calibration_result = self.detect_single_grid_square(image)
            if not calibration_result:
                raise ValueError("Grid calibration failed - no grid pattern detected")
            
            self.pixels_per_inch, grid_squares = calibration_result
            
            # Run segmentation
            segmentation_data = self.run_segmentation(image)
            if not segmentation_data:
                raise ValueError("No fish parts detected in image")
            
            # Calculate measurements
            measurements = self.calculate_measurements(segmentation_data)
            
            # Prepare detection summary
            detections_summary = {k: len(v) for k, v in segmentation_data.items()}
            detailed_detections = []
            
            for class_name, detections in segmentation_data.items():
                for detection in detections:
                    bbox = detection['bbox']
                    detailed_detections.append(Detection(
                        class_name=class_name,
                        confidence=detection['confidence'],
                        bounding_box=BoundingBox(
                            x1=float(bbox[0]),
                            y1=float(bbox[1]),
                            x2=float(bbox[2]),
                            y2=float(bbox[3]),
                            confidence=detection['confidence']
                        ),
                        mask_area=float(np.sum(detection['mask'] > 0))
                    ))
            
            # Optional analyses
            color_analysis = None
            lateral_line_analysis = None
            
            trout_masks = segmentation_data.get('trout', [])
            if trout_masks:
                trout_mask = max(trout_masks, key=lambda x: x['confidence'])['mask']
                
                if include_color_analysis:
                    color_analysis = self.analyze_fish_color(image, trout_mask)
                
                # Lateral line analysis would go here
                # lateral_line_analysis = self.analyze_lateral_line(trout_mask)
            
            processing_time = (datetime.now() - processing_start).total_seconds()
            
            # Create result
            result = FishAnalysisResult(
                analysis_id=analysis_id,
                image_path=image_path,
                status=AnalysisStatus.COMPLETED,
                image_dimensions=ImageDimensions(
                    width=image.shape[1],
                    height=image.shape[0]
                ),
                calibration=CalibrationInfo(
                    pixels_per_inch=self.pixels_per_inch,
                    grid_square_size_inches=grid_square_size,
                    detected_squares=len(grid_squares)
                ),
                detections=detections_summary,
                detailed_detections=detailed_detections,
                measurements=measurements,
                color_analysis=color_analysis,
                lateral_line_analysis=lateral_line_analysis,
                processing_metadata=ProcessingMetadata(
                    processing_time_seconds=processing_time,
                    model_version="yolov8",
                    api_version=settings.VERSION,
                    processed_at=start_time
                )
            )
            
            # Generate visualizations if requested
            if include_visualizations:
                vis_paths = await self._generate_visualizations(
                    image, segmentation_data, measurements, analysis_id
                )
                result.visualization_paths = vis_paths
            
            logger.info(f"Analysis completed for {image_path} in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            processing_time = (datetime.now() - processing_start).total_seconds()
            
            # Try to get image dimensions even if processing failed
            image_width, image_height = 1, 1  # Valid minimal dimensions to pass validation
            try:
                if Path(image_path).exists():
                    temp_image = cv2.imread(image_path)
                    if temp_image is not None and temp_image.shape[0] > 0 and temp_image.shape[1] > 0:
                        image_height, image_width = temp_image.shape[:2]
            except Exception:
                # If we can't get dimensions, use minimal valid values
                pass
            
            return FishAnalysisResult(
                analysis_id=analysis_id,
                image_path=image_path,
                status=AnalysisStatus.FAILED,
                image_dimensions=ImageDimensions(width=image_width, height=image_height),
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
                    processing_time_seconds=processing_time,
                    model_version="yolov8",
                    api_version=settings.VERSION,
                    processed_at=start_time
                ),
                error_message=str(e)
            )
    
    async def _generate_visualizations(
        self, 
        image: np.ndarray, 
        segmentation_data: Dict, 
        measurements: List[Measurement], 
        analysis_id: str
    ) -> Dict[str, str]:
        """Generate visualization images"""
        try:
            results_dir = Path(settings.RESULTS_DIR)
            results_dir.mkdir(exist_ok=True)
            
            vis_paths = {}
            
            # Create detailed visualization
            detailed_vis = self._create_detailed_visualization(image, segmentation_data, measurements)
            detailed_path = results_dir / f"{analysis_id}_detailed.jpg"
            cv2.imwrite(str(detailed_path), detailed_vis)
            vis_paths['detailed'] = str(detailed_path)
            
            # Create measurements-only visualization
            clean_vis = self._create_measurements_only_visualization(image, measurements)
            clean_path = results_dir / f"{analysis_id}_measurements.jpg"
            cv2.imwrite(str(clean_path), clean_vis)
            vis_paths['measurements'] = str(clean_path)
            
            return vis_paths
            
        except Exception as e:
            logger.error(f"Error generating visualizations: {str(e)}")
            return {}
    
    def _create_detailed_visualization(
        self, 
        image: np.ndarray, 
        segmentation_data: Dict, 
        measurements: List[Measurement]
    ) -> np.ndarray:
        """Create detailed visualization with all elements"""
        vis_image = image.copy()
        
        # Draw grid squares
        for x, y, w, h in self.grid_squares:
            cv2.rectangle(vis_image, (x, y), (x+w, y+h), self.colors['grid'], 2)
            cv2.putText(vis_image, "1in²", (x+2, y+15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, self.colors['grid'], 1)
        
        # Draw segmentation masks
        for class_name, masks in segmentation_data.items():
            color = self.colors.get(class_name, (128, 128, 128))
            
            for mask_data in masks:
                mask = mask_data['mask']
                bbox = mask_data.get('bbox')
                confidence = mask_data['confidence']
                
                # Semi-transparent mask
                colored_mask = np.zeros_like(vis_image)
                colored_mask[mask > 0] = color
                vis_image = cv2.addWeighted(vis_image, 0.85, colored_mask, 0.15, 0)
                
                # Bounding box
                if bbox is not None:
                    x1, y1, x2, y2 = bbox.astype(int)
                    cv2.rectangle(vis_image, (x1, y1), (x2, y2), color, 2)
                    
                    # Label
                    label = f"{class_name.replace('_', ' ')}"
                    cv2.putText(vis_image, label, (x1+5, y1-8), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Draw measurements
        for measurement in measurements:
            if measurement.point2:
                p1 = (int(measurement.point1.x), int(measurement.point1.y))
                p2 = (int(measurement.point2.x), int(measurement.point2.y))
                
                cv2.line(vis_image, p1, p2, self.colors['measurement'], 2)
                cv2.circle(vis_image, p1, 4, (0, 0, 255), -1)
                cv2.circle(vis_image, p2, 4, (0, 0, 255), -1)
                
                # Label
                label_x = (p1[0] + p2[0]) // 2
                label_y = (p1[1] + p2[1]) // 2 - 10
                cv2.putText(vis_image, measurement.label, (label_x, label_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.colors['measurement'], 2)
        
        return vis_image
    
    def _create_measurements_only_visualization(
        self, 
        image: np.ndarray, 
        measurements: List[Measurement]
    ) -> np.ndarray:
        """Create clean measurements visualization"""
        vis_image = image.copy()
        
        for measurement in measurements:
            if measurement.point2:
                p1 = (int(measurement.point1.x), int(measurement.point1.y))
                p2 = (int(measurement.point2.x), int(measurement.point2.y))
                
                cv2.line(vis_image, p1, p2, (0, 255, 255), 3)  # Yellow line
                cv2.circle(vis_image, p1, 6, (0, 0, 255), -1)  # Red dots
                cv2.circle(vis_image, p2, 6, (0, 0, 255), -1)
                
                # Clean label
                label_x = (p1[0] + p2[0]) // 2
                label_y = (p1[1] + p2[1]) // 2 - 15
                cv2.putText(vis_image, measurement.label, (label_x, label_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        return vis_image

# Global service instance
fish_measurement_service = EnhancedFishMeasurementService()