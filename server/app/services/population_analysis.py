"""
Population Analysis Service for Batch Fish Analysis
Provides statistical analysis, distribution analysis, and insights generation for fish populations.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging
from scipy import stats
from pathlib import Path
import json
import math

from app.models.fish_analysis import FishAnalysisResult

logger = logging.getLogger(__name__)

class PopulationAnalysisService:
    """Service for analyzing fish population statistics and distributions."""
    
    def __init__(self):
        self.measurements_of_interest = [
            'total_length', 'standard_length', 'fork_length', 
            'head_length', 'eye_diameter', 'body_depth'
        ]
    
    def _sanitize_value(self, value: Any) -> Any:
        """Sanitize numeric values to remove NaN, inf, and None values."""
        if isinstance(value, (int, float)):
            if math.isnan(value) or math.isinf(value):
                return 0.0
        elif value is None:
            return 0.0
        return value
    
    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize a dictionary to remove NaN and inf values."""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, dict):
                sanitized[key] = self._sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [self._sanitize_value(v) if not isinstance(v, dict) 
                                else self._sanitize_dict(v) for v in value]
            else:
                sanitized[key] = self._sanitize_value(value)
        return sanitized
    
    def analyze_population(self, results: List[FishAnalysisResult]) -> Dict[str, Any]:
        """
        Perform comprehensive population analysis on batch results.
        
        Args:
            results: List of fish analysis results
            
        Returns:
            Complete population statistics
        """
        try:
            # Extract successful results only
            successful_results = [r for r in results if r.status == "completed"]
            
            if not successful_results:
                raise ValueError("No successful analyses found")
            
            # Extract measurement data
            measurement_data = self._extract_measurement_data(successful_results)
            
            # Generate distributions
            distributions = self._calculate_distributions(measurement_data)
            
            # Calculate correlations
            correlations = self._calculate_correlations(measurement_data)
            
            # Generate insights
            insights = self._generate_insights(measurement_data, distributions, correlations)
            
            # Size classification
            size_classification = self._classify_sizes(measurement_data)
            
            # Quality metrics
            quality_metrics = self._calculate_quality_metrics(successful_results)
            
            # Calculate processing times
            processing_times = [r.processing_metadata.processing_time_seconds for r in successful_results]
            
            result = {
                "total_fish": len(results),
                "successful_analyses": len(successful_results),
                "failed_analyses": len(results) - len(successful_results),
                "processing_time_total": sum(processing_times),
                "processing_time_average": float(np.mean(processing_times)) if processing_times else 0.0,
                "distributions": distributions,
                "correlations": correlations,
                "insights": insights,
                "size_classification": size_classification,
                "quality_metrics": quality_metrics
            }
            
            # Sanitize the entire result to remove any NaN or inf values
            return self._sanitize_dict(result)
            
        except Exception as e:
            logger.error(f"Error in population analysis: {str(e)}")
            raise
    
    def _extract_measurement_data(self, results: List[FishAnalysisResult]) -> pd.DataFrame:
        """Extract measurement data into a pandas DataFrame."""
        data = []
        
        for result in results:
            row = {
                'analysis_id': result.analysis_id,
                'image_path': result.image_path,
                'confidence': np.mean([d.confidence for d in result.detailed_detections]) if result.detailed_detections else 0
            }
            
            # Extract measurements
            for measurement in result.measurements:
                measurement_name = measurement.name.lower().replace(' ', '_')
                row[measurement_name] = measurement.distance_inches
            
            # Extract detection counts
            for detection_type, count in result.detections.items():
                row[f"{detection_type}_count"] = count
            
            data.append(row)
        
        return pd.DataFrame(data)
    
    def _calculate_distributions(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Calculate distribution statistics for measurements."""
        distributions = []
        
        # Get numeric columns (measurements)
        measurement_columns = [col for col in df.columns if col not in ['analysis_id', 'image_path'] and df[col].dtype in ['float64', 'int64']]
        
        for column in measurement_columns:
            if df[column].notna().sum() < 2:  # Need at least 2 values
                continue
                
            data = df[column].dropna()
            
            try:
                # Calculate statistics with NaN handling
                mean_val = data.mean()
                median_val = data.median()
                std_val = data.std()
                min_val = data.min()
                max_val = data.max()
                q25_val = data.quantile(0.25)
                q75_val = data.quantile(0.75)
                skew_val = data.skew()
                kurt_val = data.kurtosis()
                
                # Sanitize each value
                distribution = {
                    "measurement_name": column.replace('_', ' ').title(),
                    "mean": float(mean_val) if not pd.isna(mean_val) else 0.0,
                    "median": float(median_val) if not pd.isna(median_val) else 0.0,
                    "std_dev": float(std_val) if not pd.isna(std_val) else 0.0,
                    "min_value": float(min_val) if not pd.isna(min_val) else 0.0,
                    "max_value": float(max_val) if not pd.isna(max_val) else 0.0,
                    "q25": float(q25_val) if not pd.isna(q25_val) else 0.0,
                    "q75": float(q75_val) if not pd.isna(q75_val) else 0.0,
                    "skewness": float(skew_val) if not pd.isna(skew_val) else 0.0,
                    "kurtosis": float(kurt_val) if not pd.isna(kurt_val) else 0.0,
                    "sample_size": int(len(data))
                }
                distributions.append(distribution)
                
            except Exception as e:
                logger.warning(f"Error calculating distribution for {column}: {str(e)}")
                continue
        
        return distributions
    
    def _calculate_correlations(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Calculate correlations between measurements."""
        correlations = []
        
        # Get numeric measurement columns
        measurement_columns = [col for col in df.columns if col not in ['analysis_id', 'image_path', 'confidence'] and df[col].dtype in ['float64', 'int64']]
        
        if len(measurement_columns) < 2:
            return correlations
        
        # Calculate correlation matrix
        corr_data = df[measurement_columns].dropna()
        
        if len(corr_data) < 3:  # Need at least 3 samples for meaningful correlation
            return correlations
        
        try:
            corr_matrix = corr_data.corr()
            
            # Extract significant correlations
            for i, col1 in enumerate(measurement_columns):
                for col2 in measurement_columns[i+1:]:
                    if col1 in corr_matrix.index and col2 in corr_matrix.columns:
                        corr_coef = corr_matrix.loc[col1, col2]
                        
                        # Check for NaN correlation coefficient
                        if pd.isna(corr_coef) or math.isnan(corr_coef) or math.isinf(corr_coef):
                            continue
                            
                        if abs(corr_coef) > 0.3:  # Only include moderate+ correlations
                            # Calculate p-value
                            try:
                                _, p_value = stats.pearsonr(corr_data[col1], corr_data[col2])
                                if pd.isna(p_value) or math.isnan(p_value) or math.isinf(p_value):
                                    p_value = 1.0
                            except:
                                p_value = 1.0
                            
                            # Determine relationship strength
                            abs_corr = abs(corr_coef)
                            if abs_corr >= 0.8:
                                strength = "very_strong"
                            elif abs_corr >= 0.6:
                                strength = "strong"
                            elif abs_corr >= 0.4:
                                strength = "moderate"
                            elif abs_corr >= 0.2:
                                strength = "weak"
                            else:
                                strength = "very_weak"
                            
                            correlations.append({
                                "measurement1": col1.replace('_', ' ').title(),
                                "measurement2": col2.replace('_', ' ').title(),
                                "correlation_coefficient": float(corr_coef),
                                "p_value": float(p_value),
                                "relationship_strength": strength
                            })
            
        except Exception as e:
            logger.warning(f"Error calculating correlations: {str(e)}")
        
        return correlations
    
    def _generate_insights(self, df: pd.DataFrame, distributions: List[Dict], correlations: List[Dict]) -> List[Dict[str, Any]]:
        """Generate analytical insights from the data."""
        insights = []
        
        try:
            # Sample size insight
            sample_size = len(df)
            insights.append({
                "category": "distribution",
                "title": "Sample Size Analysis",
                "insight": f"Analysis based on {sample_size} fish specimens. " + 
                          ("Large sample provides robust statistical power." if sample_size >= 30 
                           else "Small sample size - results should be interpreted cautiously."),
                "confidence": 0.95 if sample_size >= 30 else 0.7,
                "data_points": sample_size
            })
            
            # Distribution insights
            for dist in distributions[:3]:  # Top 3 measurements
                if dist['sample_size'] >= 5:
                    # Check for normal distribution
                    skewness = abs(dist['skewness'])
                    if skewness < 0.5:
                        distribution_type = "approximately normal"
                    elif skewness < 1:
                        distribution_type = "moderately skewed"
                    else:
                        distribution_type = "highly skewed"
                    
                    # Variability assessment
                    cv = dist['std_dev'] / dist['mean'] if dist['mean'] > 0 else 0
                    variability = "low" if cv < 0.2 else "moderate" if cv < 0.5 else "high"
                    
                    insights.append({
                        "category": "distribution",
                        "title": f"{dist['measurement_name']} Distribution",
                        "insight": f"{dist['measurement_name']} shows {distribution_type} distribution with {variability} variability (CV: {cv:.2f}). Mean: {dist['mean']:.2f}, Range: {dist['min_value']:.2f}-{dist['max_value']:.2f}",
                        "confidence": 0.8,
                        "data_points": dist['sample_size']
                    })
            
            # Correlation insights
            strong_correlations = [c for c in correlations if c['relationship_strength'] in ['strong', 'very_strong']]
            for corr in strong_correlations[:2]:  # Top 2 strong correlations
                direction = "positive" if corr['correlation_coefficient'] > 0 else "negative"
                insights.append({
                    "category": "correlation",
                    "title": f"{corr['measurement1']} vs {corr['measurement2']}",
                    "insight": f"Strong {direction} correlation (r={corr['correlation_coefficient']:.3f}) between {corr['measurement1']} and {corr['measurement2']}. This suggests these measurements scale together in this population.",
                    "confidence": 0.9 if corr['p_value'] < 0.05 else 0.7,
                    "data_points": sample_size,
                    "statistical_significance": corr['p_value']
                })
            
            # Outlier detection insight
            if distributions:
                outlier_counts = []
                for dist in distributions:
                    if dist['sample_size'] >= 10:
                        # Simple outlier detection using IQR method
                        q1, q3 = dist['q25'], dist['q75']
                        iqr = q3 - q1
                        if iqr > 0:
                            # This is a simplified outlier count estimation
                            outlier_threshold = iqr * 1.5
                            outlier_counts.append(dist['measurement_name'])
                
                if outlier_counts:
                    insights.append({
                        "category": "outlier",
                        "title": "Measurement Variability",
                        "insight": f"Some measurements show high variability which may indicate diverse size ranges or measurement outliers in the population.",
                        "confidence": 0.75,
                        "data_points": sample_size
                    })
        
        except Exception as e:
            logger.warning(f"Error generating insights: {str(e)}")
        
        return insights
    
    def _classify_sizes(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Classify fish into size categories based on total length or body measurements."""
        
        # Try to find the best measurement for size classification
        size_column = None
        for col in ['total_length', 'standard_length', 'fork_length']:
            if col in df.columns and df[col].notna().sum() > 0:
                size_column = col
                break
        
        if not size_column:
            # Return empty classification
            return {
                "small": {"count": 0, "percentage": 0, "range": [0, 0]},
                "medium": {"count": 0, "percentage": 0, "range": [0, 0]},
                "large": {"count": 0, "percentage": 0, "range": [0, 0]}
            }
        
        try:
            sizes = df[size_column].dropna()
            if len(sizes) < 3:
                return {
                    "small": {"count": 0, "percentage": 0, "range": [0, 0]},
                    "medium": {"count": 0, "percentage": 0, "range": [0, 0]},
                    "large": {"count": 0, "percentage": 0, "range": [0, 0]}
                }
            
            # Use terciles for classification
            q33 = sizes.quantile(0.33)
            q67 = sizes.quantile(0.67)
            
            small_fish = sizes[sizes <= q33]
            medium_fish = sizes[(sizes > q33) & (sizes <= q67)]
            large_fish = sizes[sizes > q67]
            
            total_count = len(sizes)
            
            return {
                "small": {
                    "count": len(small_fish),
                    "percentage": round((len(small_fish) / total_count) * 100, 1),
                    "range": [float(small_fish.min()) if len(small_fish) > 0 else 0, 
                             float(small_fish.max()) if len(small_fish) > 0 else 0]
                },
                "medium": {
                    "count": len(medium_fish),
                    "percentage": round((len(medium_fish) / total_count) * 100, 1),
                    "range": [float(medium_fish.min()) if len(medium_fish) > 0 else 0,
                             float(medium_fish.max()) if len(medium_fish) > 0 else 0]
                },
                "large": {
                    "count": len(large_fish),
                    "percentage": round((len(large_fish) / total_count) * 100, 1),
                    "range": [float(large_fish.min()) if len(large_fish) > 0 else 0,
                             float(large_fish.max()) if len(large_fish) > 0 else 0]
                }
            }
            
        except Exception as e:
            logger.warning(f"Error in size classification: {str(e)}")
            return {
                "small": {"count": 0, "percentage": 0, "range": [0, 0]},
                "medium": {"count": 0, "percentage": 0, "range": [0, 0]},
                "large": {"count": 0, "percentage": 0, "range": [0, 0]}
            }
    
    def _calculate_quality_metrics(self, results: List[FishAnalysisResult]) -> Dict[str, Any]:
        """Calculate analysis quality metrics."""
        try:
            if not results:
                return {
                    "high_confidence": 0,
                    "medium_confidence": 0,
                    "low_confidence": 0,
                    "average_detection_confidence": 0.0
                }
            
            # Extract detection confidences
            all_confidences = []
            for result in results:
                if result.detailed_detections:
                    confidences = [d.confidence for d in result.detailed_detections]
                    all_confidences.extend(confidences)
            
            if not all_confidences:
                return {
                    "high_confidence": 0,
                    "medium_confidence": 0,
                    "low_confidence": 0,
                    "average_detection_confidence": 0.0
                }
            
            # Classify by confidence levels
            high_conf = sum(1 for c in all_confidences if c >= 0.8)
            medium_conf = sum(1 for c in all_confidences if 0.5 <= c < 0.8)
            low_conf = sum(1 for c in all_confidences if c < 0.5)
            
            return {
                "high_confidence": high_conf,
                "medium_confidence": medium_conf,
                "low_confidence": low_conf,
                "average_detection_confidence": float(np.mean(all_confidences))
            }
            
        except Exception as e:
            logger.warning(f"Error calculating quality metrics: {str(e)}")
            return {
                "high_confidence": 0,
                "medium_confidence": 0,
                "low_confidence": 0,
                "average_detection_confidence": 0.0
            }

# Global service instance
population_analysis_service = PopulationAnalysisService()