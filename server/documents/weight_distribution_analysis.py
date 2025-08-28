#!/usr/bin/env python3
"""
Fish Weight Distribution Analysis
Generates histogram and statistical analysis of fish weights from Excel data.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from pathlib import Path
import os

def load_weight_data(excel_path):
    """Load fish weight data from Excel file."""
    try:
        df = pd.read_excel(excel_path)
        # Clean the data - remove NaN values and ensure we have valid weights
        weights = df['Weight'].dropna()
        fish_numbers = df['Fish #'].dropna()
        
        print(f"Loaded {len(weights)} fish weight measurements")
        print(f"Weight range: {weights.min():.1f}g to {weights.max():.1f}g")
        print(f"Mean weight: {weights.mean():.1f}g")
        print(f"Standard deviation: {weights.std():.1f}g")
        
        return weights, fish_numbers
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None

def create_weight_distribution_plot(weights, output_dir):
    """Create comprehensive weight distribution visualization."""
    # Set up the plotting style
    plt.style.use('default')
    sns.set_palette("husl")
    
    # Create figure with subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Fish Weight Distribution Analysis', fontsize=16, fontweight='bold')
    
    # 1. Histogram with density curve
    ax1.hist(weights, bins=20, alpha=0.7, color='skyblue', edgecolor='black', density=True)
    # Add density curve
    x_smooth = np.linspace(weights.min(), weights.max(), 100)
    from scipy.stats import gaussian_kde
    density = gaussian_kde(weights)
    ax1.plot(x_smooth, density(x_smooth), 'r-', linewidth=2, label='Density Curve')
    ax1.set_xlabel('Weight (grams)')
    ax1.set_ylabel('Density')
    ax1.set_title('Weight Distribution with Density Curve')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # 2. Box plot
    box_plot = ax2.boxplot(weights, patch_artist=True)
    box_plot['boxes'][0].set_facecolor('lightgreen')
    ax2.set_ylabel('Weight (grams)')
    ax2.set_title('Weight Distribution Box Plot')
    ax2.grid(True, alpha=0.3)
    
    # Add statistical annotations to box plot
    q1, median, q3 = np.percentile(weights, [25, 50, 75])
    ax2.text(1.1, median, f'Median: {median:.1f}g', fontsize=10)
    ax2.text(1.1, q3, f'Q3: {q3:.1f}g', fontsize=10)
    ax2.text(1.1, q1, f'Q1: {q1:.1f}g', fontsize=10)
    
    # 3. Cumulative distribution
    sorted_weights = np.sort(weights)
    y = np.arange(1, len(sorted_weights) + 1) / len(sorted_weights)
    ax3.plot(sorted_weights, y, 'b-', linewidth=2)
    ax3.set_xlabel('Weight (grams)')
    ax3.set_ylabel('Cumulative Probability')
    ax3.set_title('Cumulative Distribution Function')
    ax3.grid(True, alpha=0.3)
    
    # 4. Statistical summary text
    ax4.axis('off')
    stats_text = f"""
    Statistical Summary:
    
    Sample Size: {len(weights)} fish
    
    Central Tendency:
    • Mean: {weights.mean():.1f} grams
    • Median: {weights.median():.1f} grams
    • Mode: {weights.mode().iloc[0]:.1f} grams
    
    Variability:
    • Standard Deviation: {weights.std():.1f} grams
    • Variance: {weights.var():.1f} grams²
    • Range: {weights.max() - weights.min():.1f} grams
    • IQR: {np.percentile(weights, 75) - np.percentile(weights, 25):.1f} grams
    
    Distribution Shape:
    • Skewness: {weights.skew():.3f}
    • Kurtosis: {weights.kurtosis():.3f}
    
    Percentiles:
    • 5th percentile: {np.percentile(weights, 5):.1f}g
    • 95th percentile: {np.percentile(weights, 95):.1f}g
    """
    ax4.text(0.05, 0.95, stats_text, transform=ax4.transAxes, fontsize=11,
            verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(output_dir, 'fish_weight_distribution.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Weight distribution plot saved to: {output_path}")
    
    return output_path

def create_simple_histogram(weights, output_dir):
    """Create a simpler histogram for the report."""
    plt.figure(figsize=(10, 6))
    
    # Create histogram
    n, bins, patches = plt.hist(weights, bins=15, alpha=0.8, color='steelblue', 
                               edgecolor='black', linewidth=0.5)
    
    # Add mean line
    mean_weight = weights.mean()
    plt.axvline(mean_weight, color='red', linestyle='--', linewidth=2, 
                label=f'Mean: {mean_weight:.1f}g')
    
    # Add labels and title
    plt.xlabel('Weight (grams)', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.title('Fish Weight Distribution', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Add text box with key statistics
    stats_text = f'n = {len(weights)}\nMean = {mean_weight:.1f}g\nSD = {weights.std():.1f}g'
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, 
             verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    plt.tight_layout()
    
    # Save the plot
    output_path = os.path.join(output_dir, 'fish_weight_histogram.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Simple histogram saved to: {output_path}")
    
    return output_path

def main():
    # Set up paths
    project_root = Path(__file__).parent.parent
    excel_path = project_root / "Photo testing 7-17-25.xlsx"
    results_dir = project_root / "src" / "results"
    
    # Create results directory if it doesn't exist
    results_dir.mkdir(exist_ok=True)
    
    print("Fish Weight Distribution Analysis")
    print("=" * 40)
    
    # Load data
    weights, fish_numbers = load_weight_data(excel_path)
    
    if weights is not None:
        # Create visualizations
        comprehensive_plot = create_weight_distribution_plot(weights, results_dir)
        simple_plot = create_simple_histogram(weights, results_dir)
        
        # Generate summary statistics
        print("\nSummary Statistics:")
        print(f"Mean weight: {weights.mean():.2f}g")
        print(f"Median weight: {weights.median():.2f}g")
        print(f"Standard deviation: {weights.std():.2f}g")
        print(f"Minimum weight: {weights.min():.2f}g")
        print(f"Maximum weight: {weights.max():.2f}g")
        print(f"Sample size: {len(weights)} fish")
        
        print(f"\nPlots saved to: {results_dir}")
        print("Analysis complete!")
    else:
        print("Failed to load weight data.")

if __name__ == "__main__":
    main()