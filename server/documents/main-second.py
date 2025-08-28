#!/usr/bin/env python3
"""
Enhanced Fish Measurement System with Detailed Visualization
Creates annotated visualizations showing all measurements like your reference image
"""

import cv2
import numpy as np
import json
from pathlib import Path
from ultralytics import YOLO
import matplotlib.pyplot as plt
from scipy import ndimage
from sklearn.cluster import KMeans
import math
from typing import Dict, List, Tuple, Optional
import argparse

class EnhancedFishMeasurementSystem:
    def __init__(self, model_path: str, grid_square_size_inches: float = 1.0):
        """
        Initialize the enhanced fish measurement system
        
        Args:
            model_path (str): Path to trained YOLO segmentation model
            grid_square_size_inches (float): Size of each grid square in inches
        """
        self.model = YOLO(model_path)
        self.grid_square_size = grid_square_size_inches
        self.pixels_per_inch = None
        self.grid_squares = []
        
        # Class names from your training script
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
        
    def detect_single_grid_square(self, image: np.ndarray) -> Optional[Tuple[float, List]]:
        """
        Detect a single complete grid square and use it for calibration
        """
        print("Detecting grid squares...")
        
        # Convert to different color spaces to enhance grid visibility
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Try multiple approaches to enhance grid visibility
        enhanced_images = []
        
        # Approach 1: Standard grayscale with CLAHE
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        enhanced_gray = clahe.apply(gray)
        enhanced_images.append(("CLAHE Gray", enhanced_gray))
        
        # Approach 2: Green channel (since mat is green)
        green_channel = image[:,:,1]  # BGR format, so green is index 1
        enhanced_green = clahe.apply(green_channel)
        enhanced_images.append(("Green Channel", enhanced_green))
        
        # Approach 3: HSV saturation channel
        enhanced_sat = clahe.apply(hsv[:,:,1])
        enhanced_images.append(("HSV Saturation", enhanced_sat))
        
        best_squares = []
        best_method = None
        
        for method_name, enhanced in enhanced_images:
            print(f"Trying {method_name}...")
            squares = self._find_grid_squares_in_image(enhanced)
            
            if len(squares) > len(best_squares):
                best_squares = squares
                best_method = method_name
        
        print(f"Best method: {best_method}, found {len(best_squares)} squares")
        
        if not best_squares:
            # Fallback: Try edge-based detection
            print("Trying edge-based detection...")
            best_squares = self._edge_based_grid_detection(gray)
        
        if not best_squares:
            print("Warning: No grid squares detected")
            return None
        
        # Calculate pixels per inch from detected squares
        square_sizes = []
        for square in best_squares:
            x, y, w, h = square
            # Use average of width and height
            avg_size = (w + h) / 2
            square_sizes.append(avg_size)
        
        # Use median to avoid outliers
        median_square_size = np.median(square_sizes)
        pixels_per_inch = median_square_size / self.grid_square_size
        
        print(f"Detected {len(best_squares)} grid squares")
        print(f"Median square size: {median_square_size:.1f} pixels")
        print(f"Calibration: {pixels_per_inch:.2f} pixels per inch")
        
        self.grid_squares = best_squares
        return pixels_per_inch, best_squares
    
    def _find_grid_squares_in_image(self, enhanced_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Find grid squares using contour detection"""
        squares = []
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(enhanced_image, (3, 3), 0)
        
        # Use multiple threshold values
        threshold_values = [50, 70, 90, 110, 130]
        
        for thresh_val in threshold_values:
            # Binary threshold
            _, binary = cv2.threshold(blurred, thresh_val, 255, cv2.THRESH_BINARY)
            
            # Morphological operations to clean up
            kernel = np.ones((2,2), np.uint8)
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                # Approximate contour to polygon
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Check if it's roughly a quadrilateral
                if len(approx) >= 4:
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Filter based on size and aspect ratio
                    min_size = 20  # Minimum size in pixels
                    max_size = min(enhanced_image.shape) // 3  # Maximum size
                    aspect_ratio = w / h if h > 0 else 0
                    
                    if (min_size < w < max_size and 
                        min_size < h < max_size and
                        0.7 < aspect_ratio < 1.3):  # Roughly square
                        
                        # Check if this square is already detected
                        is_duplicate = False
                        for existing_x, existing_y, existing_w, existing_h in squares:
                            if (abs(x - existing_x) < 10 and abs(y - existing_y) < 10 and
                                abs(w - existing_w) < 10 and abs(h - existing_h) < 10):
                                is_duplicate = True
                                break
                        
                        if not is_duplicate:
                            squares.append((x, y, w, h))
        
        return squares
    
    def _edge_based_grid_detection(self, gray_image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Edge-based grid detection using Canny and Hough transforms"""
        print("Using edge-based detection...")
        
        # Apply Canny edge detection
        edges = cv2.Canny(gray_image, 50, 150, apertureSize=3)
        
        # Dilate edges to connect nearby edges
        kernel = np.ones((2,2), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Detect lines using HoughLinesP
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, 
                               minLineLength=30, maxLineGap=5)
        
        if lines is None:
            return []
        
        # Separate horizontal and vertical lines
        horizontal_lines = []
        vertical_lines = []
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = abs(math.atan2(y2-y1, x2-x1) * 180 / math.pi)
            
            if angle < 15 or angle > 165:  # Horizontal lines
                horizontal_lines.append(line[0])
            elif 75 < angle < 105:  # Vertical lines
                vertical_lines.append(line[0])
        
        # Find intersections to form grid squares
        squares = self._find_grid_intersections(horizontal_lines, vertical_lines)
        
        return squares
    
    def _find_grid_intersections(self, horizontal_lines: List, vertical_lines: List) -> List[Tuple[int, int, int, int]]:
        """Find grid squares from line intersections"""
        squares = []
        
        # Sort lines
        horizontal_lines.sort(key=lambda x: (x[1] + x[3]) / 2)  # Sort by y-coordinate
        vertical_lines.sort(key=lambda x: (x[0] + x[2]) / 2)    # Sort by x-coordinate
        
        # Find potential grid squares
        for i in range(len(horizontal_lines) - 1):
            for j in range(len(vertical_lines) - 1):
                # Get line coordinates
                h1 = horizontal_lines[i]
                h2 = horizontal_lines[i + 1]
                v1 = vertical_lines[j]
                v2 = vertical_lines[j + 1]
                
                # Calculate potential square coordinates
                x1 = min(v1[0], v1[2])
                x2 = max(v2[0], v2[2])
                y1 = min(h1[1], h1[3])
                y2 = max(h2[1], h2[3])
                
                w = x2 - x1
                h = y2 - y1
                
                # Check if it's a reasonable square
                if w > 20 and h > 20 and 0.7 < w/h < 1.3:
                    squares.append((x1, y1, w, h))
        
        return squares
    
    def get_robust_calibration(self, image: np.ndarray) -> Optional[float]:
        """Try multiple methods to get reliable calibration"""
        methods = []
        
        # Method 1: Single grid square detection
        result1 = self.detect_single_grid_square(image)
        if result1:
            pixels_per_inch, squares = result1
            methods.append(("Grid Square Detection", pixels_per_inch))
        
        if not methods:
            return None
        
        # Use the most reliable method
        best_method = methods[0]
        print(f"Using calibration from: {best_method[0]} = {best_method[1]:.2f} pixels/inch")
        
        return best_method[1]
    
    def run_segmentation(self, image: np.ndarray) -> Dict:
        """Run YOLO segmentation on the image"""
        results = self.model.predict(image, conf=0.25, verbose=False)
        
        segmentation_data = {}
        
        if results and len(results) > 0:
            result = results[0]
            
            if result.masks is not None:
                masks = result.masks.data.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy().astype(int)
                boxes = result.boxes.xyxy.cpu().numpy()
                
                for i, (mask, cls, box) in enumerate(zip(masks, classes, boxes)):
                    class_name = self.class_names.get(cls, f"class_{cls}")
                    
                    if class_name not in segmentation_data:
                        segmentation_data[class_name] = []
                    
                    # Resize mask to image size
                    mask_resized = cv2.resize(mask, (image.shape[1], image.shape[0]))
                    mask_binary = (mask_resized > 0.5).astype(np.uint8)
                    
                    segmentation_data[class_name].append({
                        'mask': mask_binary,
                        'confidence': result.boxes.conf[i].item(),
                        'bbox': box  # x1, y1, x2, y2
                    })
        
        return segmentation_data
    
    def get_mask_endpoints(self, mask: np.ndarray) -> Dict[str, Tuple[int, int]]:
        """Get key points from a mask with improved accuracy"""
        coords = np.where(mask > 0)
        if len(coords[0]) == 0:
            return {}
        
        y_coords, x_coords = coords
        
        # Find extreme points with better accuracy
        leftmost_idx = x_coords.argmin()
        rightmost_idx = x_coords.argmax()
        topmost_idx = y_coords.argmin()
        bottommost_idx = y_coords.argmax()
        
        leftmost = (int(x_coords[leftmost_idx]), int(y_coords[leftmost_idx]))
        rightmost = (int(x_coords[rightmost_idx]), int(y_coords[rightmost_idx]))
        topmost = (int(x_coords[topmost_idx]), int(y_coords[topmost_idx]))
        bottommost = (int(x_coords[bottommost_idx]), int(y_coords[bottommost_idx]))
        center = (int(x_coords.mean()), int(y_coords.mean()))
        
        return {
            'leftmost': leftmost,
            'rightmost': rightmost, 
            'topmost': topmost,
            'bottommost': bottommost,
            'center': center,
            'front': leftmost,  # Assuming fish faces left
            'back': rightmost
        }
    
    def calculate_distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """Calculate distance between two points in inches"""
        if self.pixels_per_inch is None:
            return 0.0
        
        pixel_distance = math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)
        return pixel_distance / self.pixels_per_inch
    
    def find_trout_head_front(self, trout_mask: np.ndarray, eye_masks: List[np.ndarray]) -> Tuple[int, int]:
        """Find the front of the trout head using trout mask and eye position"""
        trout_points = self.get_mask_endpoints(trout_mask)
        
        if not eye_masks or 'leftmost' not in trout_points:
            return trout_points.get('front', (0, 0))
        
        # Use eye position to determine head orientation
        eye_centers = []
        for eye_mask in eye_masks:
            eye_points = self.get_mask_endpoints(eye_mask)
            if 'center' in eye_points:
                eye_centers.append(eye_points['center'])
        
        if eye_centers:
            avg_eye_x = sum(eye[0] for eye in eye_centers) / len(eye_centers)
            # Head front is typically beyond the leftmost point, in direction away from eye
            if avg_eye_x > trout_points['leftmost'][0]:
                return trout_points['leftmost']
            else:
                return trout_points['rightmost']
        
        return trout_points['front']
    
    def calculate_measurements(self, segmentation_data: Dict) -> Dict[str, Dict]:
        """
        Calculate all requested fish measurements with point coordinates
        
        Returns:
            Dict[str, Dict]: Dictionary with measurement info including points and distance
        """
        measurements = {}
        
        # Get masks for each body part
        trout_masks = segmentation_data.get('trout', [])
        eye_masks = segmentation_data.get('eye', [])
        pectoral_masks = segmentation_data.get('pectoral_fin', [])
        operculum_masks = segmentation_data.get('operculum', [])
        dorsal_masks = segmentation_data.get('dorsal_fin', [])
        caudal_masks = segmentation_data.get('caudal_fin', [])
        adipose_masks = segmentation_data.get('adipose_fin', [])
        pelvic_masks = segmentation_data.get('pelvic_fin', [])
        anal_masks = segmentation_data.get('anal_fin', [])
        
        if not trout_masks:
            print("Warning: No trout body detected")
            return measurements
        
        # Use the highest confidence trout mask
        trout_mask = max(trout_masks, key=lambda x: x['confidence'])['mask']
        trout_points = self.get_mask_endpoints(trout_mask)
        
        # Find head front using eye information
        head_front = self.find_trout_head_front(
            trout_mask, 
            [eye['mask'] for eye in eye_masks]
        )
        
        # Get key points for other body parts
        def get_best_mask_points(masks, position='front'):
            if not masks:
                return None
            best_mask = max(masks, key=lambda x: x['confidence'])['mask']
            points = self.get_mask_endpoints(best_mask)
            return points.get(position, points.get('center'))
        
        # Calculate measurements with point coordinates
        try:
            # 1. Front of head to base of pectoral fin
            if pectoral_masks:
                pectoral_base = get_best_mask_points(pectoral_masks, 'center')
                if pectoral_base:
                    distance = self.calculate_distance(head_front, pectoral_base)
                    measurements['head_to_pectoral'] = {
                        'distance': distance,
                        'point1': head_front,
                        'point2': pectoral_base,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 2. Front of head to back of operculum
            if operculum_masks:
                operculum_back = get_best_mask_points(operculum_masks, 'back')
                if operculum_back:
                    distance = self.calculate_distance(head_front, operculum_back)
                    measurements['head_to_operculum'] = {
                        'distance': distance,
                        'point1': head_front,
                        'point2': operculum_back,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 3. Front of head to front of dorsal fin
            if dorsal_masks:
                dorsal_front = get_best_mask_points(dorsal_masks, 'front')
                if dorsal_front:
                    distance = self.calculate_distance(head_front, dorsal_front)
                    measurements['head_to_dorsal'] = {
                        'distance': distance,
                        'point1': head_front,
                        'point2': dorsal_front,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 4. Front of dorsal fin to base of caudal fin
            if dorsal_masks and caudal_masks:
                dorsal_front = get_best_mask_points(dorsal_masks, 'front')
                caudal_base = get_best_mask_points(caudal_masks, 'front')
                if dorsal_front and caudal_base:
                    distance = self.calculate_distance(dorsal_front, caudal_base)
                    measurements['dorsal_to_caudal'] = {
                        'distance': distance,
                        'point1': dorsal_front,
                        'point2': caudal_base,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 5. Front of adipose to base of caudal fin
            if adipose_masks and caudal_masks:
                adipose_front = get_best_mask_points(adipose_masks, 'front')
                caudal_base = get_best_mask_points(caudal_masks, 'front')
                if adipose_front and caudal_base:
                    distance = self.calculate_distance(adipose_front, caudal_base)
                    measurements['adipose_to_caudal'] = {
                        'distance': distance,
                        'point1': adipose_front,
                        'point2': caudal_base,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 6. Front of head to front of pelvic fin
            if pelvic_masks:
                pelvic_front = get_best_mask_points(pelvic_masks, 'front')
                if pelvic_front:
                    distance = self.calculate_distance(head_front, pelvic_front)
                    measurements['head_to_pelvic'] = {
                        'distance': distance,
                        'point1': head_front,
                        'point2': pelvic_front,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 7. Front of pelvic fin to base of caudal fin
            if pelvic_masks and caudal_masks:
                pelvic_front = get_best_mask_points(pelvic_masks, 'front')
                caudal_base = get_best_mask_points(caudal_masks, 'front')
                if pelvic_front and caudal_base:
                    distance = self.calculate_distance(pelvic_front, caudal_base)
                    measurements['pelvic_to_caudal'] = {
                        'distance': distance,
                        'point1': pelvic_front,
                        'point2': caudal_base,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 8. Front of anal fin to base of caudal fin
            if anal_masks and caudal_masks:
                anal_front = get_best_mask_points(anal_masks, 'front')
                caudal_base = get_best_mask_points(caudal_masks, 'front')
                if anal_front and caudal_base:
                    distance = self.calculate_distance(anal_front, caudal_base)
                    measurements['anal_to_caudal'] = {
                        'distance': distance,
                        'point1': anal_front,
                        'point2': caudal_base,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 9. Distance from front of dorsal fin to belly (width of fish)
            if dorsal_masks:
                dorsal_front = get_best_mask_points(dorsal_masks, 'front')
                if dorsal_front and 'bottommost' in trout_points:
                    # Find belly point directly below dorsal fin
                    belly_point = (dorsal_front[0], trout_points['bottommost'][1])
                    distance = self.calculate_distance(dorsal_front, belly_point)
                    measurements['dorsal_to_belly'] = {
                        'distance': distance,
                        'point1': dorsal_front,
                        'point2': belly_point,
                        'label': f'{distance:.1f}inches'
                    }
            
            # 10. Area of eye
            if eye_masks:
                eye_mask = max(eye_masks, key=lambda x: x['confidence'])['mask']
                eye_area_pixels = np.sum(eye_mask > 0)
                eye_area_inches = eye_area_pixels / (self.pixels_per_inch ** 2)
                eye_center = get_best_mask_points(eye_masks, 'center')
                measurements['eye_area'] = {
                    'distance': eye_area_inches,
                    'point1': eye_center,
                    'point2': None,
                    'label': f'{eye_area_inches:.2f}inches²'
                }
                
            # Add total fish length for reference
            if 'leftmost' in trout_points and 'rightmost' in trout_points:
                distance = self.calculate_distance(trout_points['leftmost'], trout_points['rightmost'])
                measurements['total_length'] = {
                    'distance': distance,
                    'point1': trout_points['leftmost'],
                    'point2': trout_points['rightmost'],
                    'label': f'{distance:.1f}inches'
                }
                
        except Exception as e:
            print(f"Error calculating measurements: {e}")
        
        return measurements
    
    def create_detailed_visualization(self, image: np.ndarray, segmentation_data: Dict, 
                                    measurements: Dict, save_path: Optional[str] = None) -> np.ndarray:
        """
        Create detailed visualization like your reference image
        
        Args:
            image (np.ndarray): Original image
            segmentation_data (Dict): Segmentation results
            measurements (Dict): Calculated measurements with point coordinates
            save_path (Optional[str]): Path to save visualization
            
        Returns:
            np.ndarray: Detailed visualization image
        """
        vis_image = image.copy()
        
        # Draw detected grid squares first
        for x, y, w, h in self.grid_squares:
            cv2.rectangle(vis_image, (x, y), (x+w, y+h), self.colors['grid'], 2)
            # Add "1in²" label to some squares
            cv2.putText(vis_image, "1in²", (x+2, y+15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, self.colors['grid'], 1)
        
        # Draw segmentation masks with bounding boxes
        for class_name, masks in segmentation_data.items():
            color = self.colors.get(class_name, (128, 128, 128))
            
            for mask_data in masks:
                mask = mask_data['mask']
                bbox = mask_data.get('bbox')
                confidence = mask_data['confidence']
                
                # Draw semi-transparent mask
                colored_mask = np.zeros_like(vis_image)
                colored_mask[mask > 0] = color
                vis_image = cv2.addWeighted(vis_image, 0.85, colored_mask, 0.15, 0)
                
                # Draw bounding box
                if bbox is not None:
                    x1, y1, x2, y2 = bbox.astype(int)
                    cv2.rectangle(vis_image, (x1, y1), (x2, y2), color, 2)
                    
                    # Add class label with confidence
                    label = f"{class_name.replace('_', ' ')}"
                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                    
                    # Draw label background
                    cv2.rectangle(vis_image, (x1, y1-25), (x1+label_size[0]+10, y1), color, -1)
                    cv2.putText(vis_image, label, (x1+5, y1-8), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                    
                    # Add confidence score
                    conf_text = f"{confidence:.3f}"
                    cv2.putText(vis_image, conf_text, (x1+5, y2+15), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        # Draw measurement lines and labels
        for measurement_name, measurement_data in measurements.items():
            if measurement_data['point2'] is not None:  # Skip area measurements
                point1 = measurement_data['point1']
                point2 = measurement_data['point2']
                label = measurement_data['label']
                
                # Draw measurement line
                cv2.line(vis_image, point1, point2, self.colors['measurement'], 2)
                
                # Draw end points
                cv2.circle(vis_image, point1, 4, (0, 0, 255), -1)  # Red dot
                cv2.circle(vis_image, point2, 4, (0, 0, 255), -1)  # Red dot
                
                # Calculate label position (midpoint of line)
                label_x = (point1[0] + point2[0]) // 2
                label_y = (point1[1] + point2[1]) // 2
                
                # Create label background
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                
                # Position label above the line
                label_bg_x1 = label_x - label_size[0]//2 - 5
                label_bg_y1 = label_y - 20
                label_bg_x2 = label_x + label_size[0]//2 + 5
                label_bg_y2 = label_y - 5
                
                # Draw label background
                cv2.rectangle(vis_image, (label_bg_x1, label_bg_y1), (label_bg_x2, label_bg_y2), 
                             (0, 0, 0), -1)
                cv2.rectangle(vis_image, (label_bg_x1, label_bg_y1), (label_bg_x2, label_bg_y2), 
                             self.colors['measurement'], 1)
                
                # Draw label text
                cv2.putText(vis_image, label, (label_x - label_size[0]//2, label_y - 8), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.colors['measurement'], 2)
        
        # Add calibration info in corner
        if self.pixels_per_inch:
            calib_text = f"Cal: {self.pixels_per_inch:.1f}px/in"
            cv2.putText(vis_image, calib_text, (10, vis_image.shape[0] - 40), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            squares_text = f"Grid: {len(self.grid_squares)} squares"
            cv2.putText(vis_image, squares_text, (10, vis_image.shape[0] - 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Add measurement summary in top-right corner
        summary_x = vis_image.shape[1] - 300
        summary_y = 30
        
        # Draw summary background
        cv2.rectangle(vis_image, (summary_x - 10, summary_y - 20), 
                     (vis_image.shape[1] - 10, summary_y + len(measurements) * 25), 
                     (0, 0, 0), -1)
        cv2.rectangle(vis_image, (summary_x - 10, summary_y - 20), 
                     (vis_image.shape[1] - 10, summary_y + len(measurements) * 25), 
                     (255, 255, 255), 2)
        
        # Add summary title
        cv2.putText(vis_image, "MEASUREMENTS", (summary_x, summary_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add measurements to summary
        y_offset = summary_y + 25
        for measurement_name, measurement_data in measurements.items():
            distance = measurement_data['distance']
            display_name = measurement_name.replace('_', ' ').title()
            
            if 'area' in measurement_name:
                text = f"{display_name}: {distance:.2f}inches²"
            else:
                text = f"{display_name}: {distance:.1f}inches"
            
            cv2.putText(vis_image, text, (summary_x, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            y_offset += 20
        
        if save_path:
            cv2.imwrite(save_path, vis_image)
            print(f"Detailed visualization saved to: {save_path}")
        
        return vis_image
    
    def analyze_fish_color(self, image: np.ndarray, trout_mask: np.ndarray) -> Dict:
        """Analyze fish coloration"""
        # Extract fish pixels
        fish_pixels = image[trout_mask > 0]
        
        if len(fish_pixels) == 0:
            return {}
        
        # Calculate mean color
        mean_color = np.mean(fish_pixels, axis=0)
        
        # Perform color clustering to find dominant colors
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans.fit(fish_pixels.reshape(-1, 3))
        
        dominant_colors = kmeans.cluster_centers_
        color_percentages = np.bincount(kmeans.labels_) / len(kmeans.labels_)
        
        # Calculate color variance
        color_variance = np.var(fish_pixels, axis=0)
        
        color_analysis = {
            'mean_color_bgr': mean_color.tolist(),
            'dominant_colors': dominant_colors.tolist(),
            'color_percentages': color_percentages.tolist(),
            'color_variance': color_variance.tolist(),
            'total_pixels': len(fish_pixels)
        }
        
        return color_analysis
    
    def analyze_lateral_line(self, trout_mask: np.ndarray) -> Dict:
        """Analyze lateral line linearity"""
        # Find the centerline of the fish body
        coords = np.where(trout_mask > 0)
        if len(coords[0]) == 0:
            return {}
        
        y_coords, x_coords = coords
        
        # Group pixels by x-coordinate and find center y for each x
        x_min, x_max = x_coords.min(), x_coords.max()
        centerline_points = []
        
        for x in range(x_min, x_max + 1, 5):  # Sample every 5 pixels
            y_at_x = y_coords[x_coords == x]
            if len(y_at_x) > 0:
                center_y = int(np.mean(y_at_x))
                centerline_points.append((x, center_y))
        
        if len(centerline_points) < 3:
            return {}
        
        # Fit a line and calculate deviation
        x_points = [p[0] for p in centerline_points]
        y_points = [p[1] for p in centerline_points]
        
        # Linear regression
        coeffs = np.polyfit(x_points, y_points, 1)
        fitted_line = np.poly1d(coeffs)
        
        # Calculate deviations
        deviations = []
        for x, y in centerline_points:
            expected_y = fitted_line(x)
            deviation = abs(y - expected_y)
            deviations.append(deviation)
        
        linearity_score = 1.0 / (1.0 + np.mean(deviations))  # Higher score = more linear
        
        return {
            'linearity_score': linearity_score,
            'mean_deviation': np.mean(deviations),
            'max_deviation': np.max(deviations),
            'centerline_points': centerline_points
        }
    
    def process_image(self, image_path: str, output_dir: Optional[str] = None) -> Dict:
        """
        Process a single image for fish measurements with detailed visualization
        
        Args:
            image_path (str): Path to input image
            output_dir (Optional[str]): Directory to save results
            
        Returns:
            Dict: Complete analysis results
        """
        print(f"Processing: {image_path}")
        
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not load image {image_path}")
            return {}
        
        print(f"Image size: {image.shape[1]}x{image.shape[0]} pixels")
        
        # Get robust calibration using multiple methods
        self.pixels_per_inch = self.get_robust_calibration(image)
        if self.pixels_per_inch is None:
            print("Error: Grid calibration failed completely.")
            print("Please ensure the image shows a clear grid pattern.")
            return {}
        
        # Sanity check on calibration
        if self.pixels_per_inch < 10 or self.pixels_per_inch > 1000:
            print(f"Warning: Unusual calibration value: {self.pixels_per_inch:.1f} px/inch")
            print("This might indicate calibration issues.")
        
        # Run segmentation
        print("Running fish segmentation...")
        segmentation_data = self.run_segmentation(image)
        
        if not segmentation_data:
            print("Warning: No fish parts detected")
            return {}
        
        print(f"Detected parts: {list(segmentation_data.keys())}")
        
        # Calculate measurements with coordinates
        print("Calculating measurements...")
        measurements = self.calculate_measurements(segmentation_data)
        
        # Analyze colors
        trout_masks = segmentation_data.get('trout', [])
        color_analysis = {}
        lateral_line_analysis = {}
        
        if trout_masks:
            print("Analyzing fish color and lateral line...")
            trout_mask = max(trout_masks, key=lambda x: x['confidence'])['mask']
            color_analysis = self.analyze_fish_color(image, trout_mask)
            lateral_line_analysis = self.analyze_lateral_line(trout_mask)
        
        # Create results
        results = {
            'image_path': image_path,
            'image_dimensions': {'width': image.shape[1], 'height': image.shape[0]},
            'calibration': {
                'pixels_per_inch': self.pixels_per_inch,
                'grid_square_size_inches': self.grid_square_size,
                'detected_squares': len(self.grid_squares)
            },
            'detections': {k: len(v) for k, v in segmentation_data.items()},
            'measurements': measurements,  # Now includes coordinates
            'color_analysis': color_analysis,
            'lateral_line_analysis': lateral_line_analysis
        }
        
        # Save results and detailed visualization
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True)
            
            # Save JSON results
            image_name = Path(image_path).stem
            json_path = output_path / f"{image_name}_detailed_measurements.json"
            
            # Convert measurements for JSON serialization
            json_measurements = {}
            for key, value in measurements.items():
                json_measurements[key] = {
                    'distance_inches': value['distance'],
                    'point1': value['point1'],
                    'point2': value['point2'],
                    'label': value['label']
                }
            
            json_results = results.copy()
            json_results['measurements'] = json_measurements
            
            with open(json_path, 'w') as f:
                json.dump(json_results, f, indent=2)
            
            # Save detailed visualization (like your reference image)
            detailed_vis_path = output_path / f"{image_name}_detailed_visualization.jpg"
            self.create_detailed_visualization(image, segmentation_data, measurements, str(detailed_vis_path))
            
            # Also save a clean version with just measurements
            clean_vis_path = output_path / f"{image_name}_measurements_only.jpg"
            self.create_measurements_only_visualization(image, measurements, str(clean_vis_path))
            
            print(f"Results saved to: {json_path}")
            print(f"Detailed visualization saved to: {detailed_vis_path}")
            print(f"Clean measurements saved to: {clean_vis_path}")
        
        return results
    
    def create_measurements_only_visualization(self, image: np.ndarray, measurements: Dict, save_path: str):
        """Create a clean visualization showing only measurements like your reference"""
        vis_image = image.copy()
        
        # Draw measurement lines and labels only
        for measurement_name, measurement_data in measurements.items():
            if measurement_data['point2'] is not None:  # Skip area measurements
                point1 = measurement_data['point1']
                point2 = measurement_data['point2']
                distance = measurement_data['distance']
                
                # Draw measurement line in bright color
                cv2.line(vis_image, point1, point2, (0, 255, 255), 3)  # Yellow line
                
                # Draw end points
                cv2.circle(vis_image, point1, 6, (0, 0, 255), -1)  # Red dots
                cv2.circle(vis_image, point2, 6, (0, 0, 255), -1)
                
                # Calculate label position
                label_x = (point1[0] + point2[0]) // 2
                label_y = (point1[1] + point2[1]) // 2 - 15
                
                # Create measurement label
                label_text = f"{distance:.1f}inches"
                label_size = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
                
                # Draw label background
                cv2.rectangle(vis_image, 
                             (label_x - label_size[0]//2 - 5, label_y - 25),
                             (label_x + label_size[0]//2 + 5, label_y + 5),
                             (255, 255, 255), -1)
                cv2.rectangle(vis_image, 
                             (label_x - label_size[0]//2 - 5, label_y - 25),
                             (label_x + label_size[0]//2 + 5, label_y + 5),
                             (0, 0, 0), 2)
                
                # Draw label text
                cv2.putText(vis_image, label_text, 
                           (label_x - label_size[0]//2, label_y - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        cv2.imwrite(save_path, vis_image)

def main():
    parser = argparse.ArgumentParser(description='Enhanced Fish Measurement System with Detailed Visualization')
    parser.add_argument('--model', required=True, help='Path to trained YOLO model')
    parser.add_argument('--image', required=True, help='Path to input image')
    parser.add_argument('--output', help='Output directory for results')
    parser.add_argument('--grid-size', type=float, default=1.0, 
                       help='Size of grid squares in inches (default: 1.0)')
    
    args = parser.parse_args()
    
    # Initialize enhanced measurement system
    measurement_system = EnhancedFishMeasurementSystem(
        model_path=args.model,
        grid_square_size_inches=args.grid_size
    )
    
    # Process image
    results = measurement_system.process_image(args.image, args.output)
    
    if results and 'measurements' in results:
        print("\n" + "="*70)
        print("ENHANCED FISH MEASUREMENTS WITH DETAILED VISUALIZATION")
        print("="*70)
        
        # Display calibration info
        calib = results.get('calibration', {})
        print(f"✓ Calibration: {calib.get('pixels_per_inch', 0):.1f} pixels per inch")
        print(f"✓ Grid squares detected: {calib.get('detected_squares', 0)}")
        print(f"✓ Detected parts: {', '.join(results.get('detections', {}).keys())}")
        print()
        
        measurements = results['measurements']
        for name, data in measurements.items():
            distance = data['distance']
            if 'area' in name:
                print(f"{name.replace('_', ' ').title()}: {distance:.2f} inches")
            else:
                print(f"{name.replace('_', ' ').title()}: {distance:.1f} inches")
        
        # Sanity check on fish size
        total_length_data = measurements.get('total_length')
        if total_length_data:
            total_length = total_length_data['distance']
            if total_length < 7.5:  # 3 inches
                print(f"\n⚠️  Fish appears small ({total_length:.1f} inches)")
            elif total_length > 91:  # 36 inches
                print(f"\n⚠️  Fish appears very large ({total_length:.1f} inches)")
                print("Please verify grid calibration is correct.")
            else:
                print(f"\n✓ Fish size appears normal ({total_length:.1f} inches)")
        
        if 'color_analysis' in results and results['color_analysis']:
            mean_color = results['color_analysis']['mean_color_bgr']
            print(f"\n🎨 Mean Color (BGR): [{mean_color[0]:.0f}, {mean_color[1]:.0f}, {mean_color[2]:.0f}]")
        
        if 'lateral_line_analysis' in results and results['lateral_line_analysis']:
            linearity = results['lateral_line_analysis'].get('linearity_score', 0)
            print(f"📏 Lateral Line Linearity: {linearity:.3f}")
        
        print(f"\n📁 Check output directory for detailed visualizations!")
        
    else:
        print("❌ Failed to process image or calculate measurements.")
        print("Please check:")
        print("1. Image contains visible grid pattern")
        print("2. YOLO model path is correct")
        print("3. Fish is clearly visible in the image")
        print("4. Grid squares are at least 20x20 pixels in size")

if __name__ == "__main__":
    main()
    
# python main-second.py --model runs/segment/trout_segmentation/weights/best.pt --image images/Fish_99.jpg --output results/