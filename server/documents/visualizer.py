#!/usr/bin/env python3
"""
Trout Segmentation Visualizer
Runs inference on images and displays segmentation outlines with class labels
"""

import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.colors import ListedColormap
import argparse
import os

class TroutSegmentationVisualizer:
    def __init__(self, model_path, class_names=None):
        """
        Initialize the visualizer
        
        Args:
            model_path (str): Path to trained YOLO model
            class_names (list): List of class names (optional)
        """
        self.model_path = Path(model_path)
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
            
        self.model = YOLO(str(self.model_path))
        
        # Default class names from your training
        self.class_names = class_names or [
            "trout", "caudal_fin", "dorsal_fin", "adipose_fin", 
            "eye", "pectoral_fin", "pelvic_fin", "anal_fin"
        ]
        
        # Define colors for each class (distinct colors for visibility)
        self.colors = [
            (255, 0, 0),      # trout - red
            (0, 255, 0),      # caudal_fin - green
            (0, 0, 255),      # dorsal_fin - blue
            (255, 255, 0),    # adipose_fin - yellow
            (255, 0, 255),    # eye - magenta
            (0, 255, 255),    # pectoral_fin - cyan
            (255, 128, 0),    # pelvic_fin - orange
            (128, 0, 255),    # anal_fin - purple
        ]
        
        print(f"✓ Loaded model from {model_path}")
        print(f"✓ Classes: {', '.join(self.class_names)}")
    
    def run_inference(self, image_path, conf_threshold=0.25, save_results=True):
        """
        Run inference on a single image
        
        Args:
            image_path (str): Path to input image
            conf_threshold (float): Confidence threshold for detections
            save_results (bool): Whether to save annotated images
            
        Returns:
            results: YOLO inference results
        """
        print(f"🔍 Running inference on: {image_path}")
        
        results = self.model.predict(
            source=image_path,
            conf=conf_threshold,
            save=save_results,
            save_txt=False,
            save_crop=False,
            show_labels=True,
            show_conf=True,
            show_boxes=True,
            line_width=2
        )
        
        return results
    
    def visualize_segmentation(self, image_path, results, save_path=None, show_plot=True):
        """
        Create detailed visualization with segmentation outlines
        
        Args:
            image_path (str): Path to original image
            results: YOLO inference results
            save_path (str): Path to save visualization (optional)
            show_plot (bool): Whether to display the plot
        """
        # Load original image
        image = cv2.imread(str(image_path))
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Create figure with subplots
        fig, axes = plt.subplots(1, 3, figsize=(20, 7))
        
        # Plot 1: Original image
        axes[0].imshow(image_rgb)
        axes[0].set_title("Original Image", fontsize=14, fontweight='bold')
        axes[0].axis('off')
        
        # Plot 2: Segmentation masks overlay
        axes[1].imshow(image_rgb)
        overlay = np.zeros_like(image_rgb)
        
        # Plot 3: Outlined segmentation
        outlined_image = image_rgb.copy()
        
        if results and len(results) > 0 and results[0].masks is not None:
            masks = results[0].masks.data.cpu().numpy()
            boxes = results[0].boxes.xyxy.cpu().numpy()
            classes = results[0].boxes.cls.cpu().numpy().astype(int)
            confidences = results[0].boxes.conf.cpu().numpy()
            
            print(f"📊 Found {len(masks)} detections:")
            
            for i, (mask, box, cls, conf) in enumerate(zip(masks, boxes, classes, confidences)):
                class_name = self.class_names[cls]
                color = self.colors[cls]
                color_normalized = tuple(c/255.0 for c in color)
                
                print(f"  - {class_name}: {conf:.3f} confidence")
                
                # Resize mask to image dimensions
                mask_resized = cv2.resize(mask, (image_rgb.shape[1], image_rgb.shape[0]))
                mask_binary = (mask_resized > 0.5).astype(np.uint8)
                
                # Create colored overlay for this mask
                colored_mask = np.zeros_like(image_rgb)
                colored_mask[mask_binary == 1] = color
                
                # Add to overlay with transparency
                alpha = 0.4
                overlay = cv2.addWeighted(overlay, 1, colored_mask, alpha, 0)
                
                # Create outline for the mask
                contours, _ = cv2.findContours(mask_binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cv2.drawContours(outlined_image, contours, -1, color, thickness=3)
                
                # Add bounding box and label to outlined image
                x1, y1, x2, y2 = box.astype(int)
                cv2.rectangle(outlined_image, (x1, y1), (x2, y2), color, 2)
                
                # Add text label
                label = f"{class_name} {conf:.2f}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(outlined_image, (x1, y1 - label_size[1] - 10), 
                            (x1 + label_size[0], y1), color, -1)
                cv2.putText(outlined_image, label, (x1, y1 - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        else:
            print("❌ No detections found")
            overlay = image_rgb
            outlined_image = image_rgb
        
        # Display segmentation overlay
        combined = cv2.addWeighted(image_rgb, 0.7, overlay, 0.3, 0)
        axes[1].imshow(combined)
        axes[1].set_title("Segmentation Overlay", fontsize=14, fontweight='bold')
        axes[1].axis('off')
        
        # Display outlined segmentation
        axes[2].imshow(outlined_image)
        axes[2].set_title("Segmentation Outlines", fontsize=14, fontweight='bold')
        axes[2].axis('off')
        
        # Add legend
        legend_elements = []
        for i, (class_name, color) in enumerate(zip(self.class_names, self.colors)):
            color_normalized = tuple(c/255.0 for c in color)
            legend_elements.append(patches.Patch(color=color_normalized, label=class_name))
        
        fig.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.02), 
                  ncol=len(self.class_names), fontsize=10)
        
        plt.tight_layout()
        plt.subplots_adjust(bottom=0.1)
        
        # Save if requested
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"💾 Saved visualization to: {save_path}")
        
        if show_plot:
            plt.show()
        else:
            plt.close()
    
    def process_directory(self, input_dir, output_dir=None, conf_threshold=0.25, 
                         image_extensions=None):
        """
        Process all images in a directory
        
        Args:
            input_dir (str): Directory containing input images
            output_dir (str): Directory to save visualizations (optional)
            conf_threshold (float): Confidence threshold
            image_extensions (list): List of image file extensions to process
        """
        input_path = Path(input_dir)
        if not input_path.exists():
            raise FileNotFoundError(f"Input directory not found: {input_dir}")
        
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
        
        if image_extensions is None:
            image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.JPG', '.JPEG']
        
        # Find all image files
        image_files = []
        for ext in image_extensions:
            image_files.extend(input_path.glob(f"*{ext}"))
        
        if not image_files:
            print(f"❌ No images found in {input_dir}")
            return
        
        print(f"🎯 Processing {len(image_files)} images...")
        
        for i, image_file in enumerate(image_files, 1):
            print(f"\n[{i}/{len(image_files)}] Processing: {image_file.name}")
            
            try:
                # Run inference
                results = self.run_inference(str(image_file), conf_threshold, save_results=False)
                
                # Create visualization
                save_path = None
                if output_dir:
                    save_name = f"{image_file.stem}_segmented.png"
                    save_path = output_path / save_name
                
                self.visualize_segmentation(
                    str(image_file), 
                    results, 
                    save_path=str(save_path) if save_path else None,
                    show_plot=False  # Don't show each image individually
                )
                
            except Exception as e:
                print(f"❌ Error processing {image_file.name}: {str(e)}")
        
        print(f"\n✅ Completed processing {len(image_files)} images!")
        if output_dir:
            print(f"📁 Visualizations saved to: {output_dir}")

def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description="Visualize trout segmentation results")
    parser.add_argument("--model", "-m", required=True, 
                       help="Path to trained YOLO model (.pt file)")
    parser.add_argument("--input", "-i", required=True,
                       help="Path to input image or directory")
    parser.add_argument("--output", "-o", 
                       help="Output directory for visualizations (optional)")
    parser.add_argument("--confidence", "-c", type=float, default=0.25,
                       help="Confidence threshold (default: 0.25)")
    parser.add_argument("--no-show", action="store_true",
                       help="Don't display plots (only save)")
    
    args = parser.parse_args()
    
    print("🐟 Trout Segmentation Visualizer")
    print("=" * 40)
    
    # Initialize visualizer
    try:
        visualizer = TroutSegmentationVisualizer(args.model)
    except FileNotFoundError as e:
        print(f"❌ {e}")
        return
    
    input_path = Path(args.input)
    
    if input_path.is_file():
        # Process single image
        print(f"🖼️  Processing single image: {input_path}")
        
        results = visualizer.run_inference(str(input_path), args.confidence, save_results=False)
        
        save_path = None
        if args.output:
            output_dir = Path(args.output)
            output_dir.mkdir(parents=True, exist_ok=True)
            save_path = output_dir / f"{input_path.stem}_segmented.png"
        
        visualizer.visualize_segmentation(
            str(input_path), 
            results, 
            save_path=str(save_path) if save_path else None,
            show_plot=not args.no_show
        )
        
    elif input_path.is_dir():
        # Process directory
        print(f"📁 Processing directory: {input_path}")
        visualizer.process_directory(
            str(input_path), 
            args.output, 
            args.confidence
        )
        
    else:
        print(f"❌ Input path not found: {input_path}")

if __name__ == "__main__":
    # Example usage if run directly
    if len(os.sys.argv) == 1:
        print("🐟 Trout Segmentation Visualizer")
        print("=" * 40)
        print("\nExample usage:")
        print("  Single image:")
        print("    python visualizer.py -m best.pt -i image.jpg")
        print("  Directory:")
        print("    python visualizer.py -m best.pt -i images/ -o visualizations/")
        print("  With custom confidence:")
        print("    python visualizer.py -m best.pt -i images/ -c 0.5")
        print("\nQuick start with your model:")
        
        # Quick start mode
        model_path = "runs/segment/trout_segmentation/weights/best.pt"
        images_dir = "images"
        
        if Path(model_path).exists() and Path(images_dir).exists():
            print(f"\n🚀 Quick start: Processing {images_dir} with {model_path}")
            
            visualizer = TroutSegmentationVisualizer(model_path)
            visualizer.process_directory(images_dir, "visualizations", conf_threshold=0.25)
        else:
            print(f"\n⚠️  Quick start not available:")
            if not Path(model_path).exists():
                print(f"   Model not found: {model_path}")
            if not Path(images_dir).exists():
                print(f"   Images directory not found: {images_dir}")
    else:
        main()
        
        # python visualizer.py -m best.pt -i images/Fish_99.jpg