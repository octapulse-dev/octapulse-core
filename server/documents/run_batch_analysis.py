#!/usr/bin/env python3
"""
Quick demonstration script for the batch analysis system
Processes a subset of images to show functionality
"""

import sys
from pathlib import Path

# Add src directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from batch_processor import ComprehensiveBatchProcessor


def main():
    """Run quick demonstration"""
    print("="*70)
    print("FISH BATCH ANALYSIS DEMONSTRATION")
    print("="*70)
    print()
    
    # Setup paths
    model_path = "best.pt"
    images_dir = "images"
    output_dir = "results"
    
    # Check if model exists
    if not Path(model_path).exists():
        print(f"Looking for model...")
        possible_paths = [
            Path("runs/segment/extreme_robust_model/weights/best.pt"),
            Path("src/best.pt"),
            Path("best.pt")
        ]
        
        for path in possible_paths:
            if path.exists():
                model_path = str(path)
                print(f"Found model at: {model_path}")
                break
    
    print(f"\nConfiguration:")
    print(f"  Model: {model_path}")
    print(f"  Images: {images_dir}")
    print(f"  Output: {output_dir}")
    print()
    
    # Initialize processor
    processor = ComprehensiveBatchProcessor(model_path, output_dir)
    
    # For demonstration, we'll process just the first few images
    # Modify the processor to handle subset
    image_path = Path(images_dir)
    demo_images = list(image_path.glob("Fish_*.JPG"))[:5]  # Process first 5 images
    
    print(f"Processing {len(demo_images)} images for demonstration...")
    print("(Full batch processing would handle all 96 images)")
    print()
    
    # Process images
    for img in demo_images:
        print(f"Processing: {img.name}")
        processor.process_single_image(img)
    
    # Generate reports if we have data
    if processor.all_measurements:
        print("\nGenerating analysis reports...")
        
        # Save data
        df = processor.save_measurement_data()
        
        # Create visualizations
        processor.create_distribution_charts(df)
        processor.analyze_correlations(df)
        processor.create_pca_analysis(df)
        
        # Generate insights
        insights = processor.generate_insights(df)
        
        # Create summary
        report = processor.create_summary_report()
        
        print("\n" + "="*70)
        print("DEMONSTRATION COMPLETE!")
        print("="*70)
        print(f"\nResults saved to: {processor.folders['main']}")
        print("\nKey outputs created:")
        print(f"  ✓ Individual fish visualizations")
        print(f"  ✓ Measurement data (CSV & JSON)")
        print(f"  ✓ Distribution charts")
        print(f"  ✓ Correlation analysis")
        print(f"  ✓ PCA analysis")
        print(f"  ✓ Insights report")
        print(f"  ✓ Processing summary")
        
        print("\nSample measurements from processed fish:")
        for i, measurement in enumerate(processor.all_measurements[:3]):
            print(f"\n  {measurement['image_name']}:")
            for key, value in measurement.items():
                if 'inches' in key and isinstance(value, (int, float)):
                    print(f"    - {key}: {value:.2f}")
        
        print("\nSample insights generated:")
        for insight in insights[:3]:
            print(f"  • {insight['category']}: {insight['insight']}")
        
        print("\n" + "="*70)
        print("Full batch processing command:")
        print("  python batch_processor.py --model best.pt --images images --output results")
        print("\nThis will process all 96 images and generate complete analysis.")
        print("="*70)
        
        return report
    else:
        print("No measurements collected. Please check the images and model.")
        return None


if __name__ == "__main__":
    report = main()