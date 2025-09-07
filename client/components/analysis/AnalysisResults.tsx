/**
 * Comprehensive analysis results component
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Fish, 
  Ruler, 
  Camera, 
  Palette, 
  Download, 
  Eye, 
  Clock,
  Target,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  FishAnalysisResult, 
  Measurement, 
  Detection,
  ColorAnalysis 
} from '@/lib/types';
import { 
  formatMeasurementName, 
  formatDuration, 
  formatTimestamp,
  getConfidenceColor,
  getCalibrationQualityColor,
  exportAnalysisResults
} from '@/lib/utils';
import { getVisualizationUrl } from '@/lib/api';

interface AnalysisResultsProps {
  result: FishAnalysisResult;
  showVisualizations?: boolean;
  className?: string;
}

export default function AnalysisResults({
  result,
  showVisualizations = true,
  className = ''
}: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    measurements: true,
    detections: false,
    calibration: false,
    color: false,
    metadata: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleDownload = () => {
    exportAnalysisResults(result, `fish-analysis-${result.analysis_id}.json`);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Fish className="w-8 h-8 text-black" />
              <h2 className="text-2xl font-bold text-gray-900 mono-bold tracking-wide">Fish Analysis Results</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant={result.status === 'completed' ? 'success' : 'destructive'}>
                {result.status.toUpperCase()}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="mono-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm tech-mono">
            <div className="space-y-2">
              <span className="text-gray-600 uppercase tracking-wide">Analysis ID:</span>
              <div className="text-black font-bold">{result.analysis_id}</div>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 uppercase tracking-wide">Processing Time:</span>
              <div className="text-black font-bold">{formatDuration(result.processing_metadata.processing_time_seconds)}</div>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 uppercase tracking-wide">Image Dimensions:</span>
              <div className="text-black font-bold">{result.image_dimensions.width} × {result.image_dimensions.height}</div>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 uppercase tracking-wide">Processed At:</span>
              <div className="text-black font-bold">{formatTimestamp(result.processing_metadata.processed_at)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {result.error_message && (
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6 text-red-600" />
              <span className="font-bold text-red-800 mono-bold text-lg">Analysis Error</span>
            </div>
            <p className="text-red-700 tech-mono">{result.error_message}</p>
          </div>
        </div>
      )}

      {/* Measurements */}
      {result.measurements.length > 0 && (
        <CollapsibleSection
          title="Fish Measurements"
          icon={<Ruler className="w-5 h-5" />}
          count={result.measurements.length}
          expanded={expandedSections.measurements}
          onToggle={() => toggleSection('measurements')}
        >
          <MeasurementsTable measurements={result.measurements} />
        </CollapsibleSection>
      )}

      {/* Detections */}
      {result.detailed_detections.length > 0 && (
        <CollapsibleSection
          title="Detected Fish Parts"
          icon={<Target className="w-5 h-5" />}
          count={result.detailed_detections.length}
          expanded={expandedSections.detections}
          onToggle={() => toggleSection('detections')}
        >
          <DetectionsTable detections={result.detailed_detections} />
        </CollapsibleSection>
      )}

      {/* Calibration Info */}
      <CollapsibleSection
        title="Calibration Information"
        icon={<Camera className="w-5 h-5" />}
        expanded={expandedSections.calibration}
        onToggle={() => toggleSection('calibration')}
      >
        <CalibrationInfo calibration={result.calibration} />
      </CollapsibleSection>

      {/* Color Analysis */}
      {result.color_analysis && (
        <CollapsibleSection
          title="Color Analysis"
          icon={<Palette className="w-5 h-5" />}
          expanded={expandedSections.color}
          onToggle={() => toggleSection('color')}
        >
          <ColorAnalysisDisplay colorAnalysis={result.color_analysis} />
        </CollapsibleSection>
      )}

      {/* Visualizations */}
      {showVisualizations && result.visualization_paths && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-black" />
              <h3 className="text-xl font-bold text-gray-900 mono-bold tracking-wide">Visualizations</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(result.visualization_paths).map(([type, path]) => (
                <div key={type} className="space-y-3">
                  <h4 className="font-bold text-gray-700 tech-mono uppercase tracking-wide">{type} View</h4>
                  <div className="relative group overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={getVisualizationUrl(result.analysis_id, type as 'detailed' | 'measurements')}
                      alt={`${type} visualization`}
                      className="w-full transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                      loading="lazy"
                      onClick={() => setSelectedImageUrl(getVisualizationUrl(result.analysis_id, type as 'detailed' | 'measurements'))}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <CollapsibleSection
        title="Processing Metadata"
        icon={<Clock className="w-5 h-5" />}
        expanded={expandedSections.metadata}
        onToggle={() => toggleSection('metadata')}
      >
        <div className="grid md:grid-cols-2 gap-6 text-sm tech-mono">
          <div className="space-y-2">
            <span className="text-gray-600 uppercase tracking-wide">Model Version:</span>
            <div className="text-sky-600 font-bold">{result.processing_metadata.model_version}</div>
          </div>
          <div className="space-y-2">
            <span className="text-gray-600 uppercase tracking-wide">API Version:</span>
            <div className="text-emerald-600 font-bold">{result.processing_metadata.api_version}</div>
          </div>
          <div className="space-y-2">
            <span className="text-gray-600 uppercase tracking-wide">Processing Time:</span>
            <div className="text-teal-600 font-bold">{formatDuration(result.processing_metadata.processing_time_seconds)}</div>
          </div>
          <div className="space-y-2">
            <span className="text-gray-600 uppercase tracking-wide">Processed At:</span>
            <div className="text-purple-600 font-bold">{formatTimestamp(result.processing_metadata.processed_at)}</div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Image Lightbox */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={selectedImageUrl} 
              alt="Visualization"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sky-600">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mono-bold tracking-wide">{title}</h3>
            {count !== undefined && (
              <Badge variant="secondary">
                {count}
              </Badge>
            )}
          </div>
          
          <div className="text-gray-500 hover:text-gray-700 transition-colors">
            {expanded ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// Measurements Table
function MeasurementsTable({ measurements }: { measurements: Measurement[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm tech-mono bg-white">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Measurement</th>
            <th className="text-right py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Distance (inches)</th>
            <th className="text-center py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Type</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((measurement, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors group">
              <td className="py-4 px-6 text-gray-900 font-bold group-hover:text-sky-700 transition-colors">
                {formatMeasurementName(measurement.name)}
              </td>
              <td className="text-right py-4 px-6 text-sky-600 font-bold text-lg">
                {measurement.distance_inches.toFixed(2)}"
              </td>
              <td className="text-center py-4 px-6">
                <Badge variant="outline">
                  {(measurement.measurement_type || 'length').toUpperCase()}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Detections Table
function DetectionsTable({ detections }: { detections: Detection[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm tech-mono bg-white">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Part</th>
            <th className="text-center py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Confidence</th>
            <th className="text-right py-4 px-6 text-gray-700 font-bold uppercase tracking-wide">Mask Area</th>
          </tr>
        </thead>
        <tbody>
          {detections.map((detection, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors group">
              <td className="py-4 px-6 text-gray-900 font-bold group-hover:text-emerald-700 transition-colors">
                {formatMeasurementName(detection.class_name)}
              </td>
              <td className="text-center py-4 px-6">
                <Badge 
                  variant="outline"
                  className={getConfidenceColor(detection.confidence)}
                >
                  {(detection.confidence * 100).toFixed(1)}%
                </Badge>
              </td>
              <td className="text-right py-4 px-6 text-emerald-600 font-bold text-lg">
                {detection.mask_area ? Math.round(detection.mask_area) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Calibration Info
function CalibrationInfo({ calibration }: { calibration: any }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 text-sm tech-mono">
      <div className="space-y-2">
        <span className="text-gray-600 uppercase tracking-wide">Pixels per Inch:</span>
        <div className="text-sky-600 font-bold">{calibration.pixels_per_inch.toFixed(2)}</div>
      </div>
      <div className="space-y-2">
        <span className="text-gray-600 uppercase tracking-wide">Grid Square Size:</span>
        <div className="text-emerald-600 font-bold">{calibration.grid_square_size_inches}"</div>
      </div>
      <div className="space-y-2">
        <span className="text-gray-600 uppercase tracking-wide">Detected Squares:</span>
        <div className="text-teal-600 font-bold">{calibration.detected_squares}</div>
      </div>
      <div className="space-y-2">
        <span className="text-gray-600 uppercase tracking-wide">Quality:</span>
        <div className={`font-bold ${getCalibrationQualityColor(calibration.calibration_quality || 'unknown')}`}>
          {(calibration.calibration_quality || 'Unknown').toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// Color Analysis Display
function ColorAnalysisDisplay({ colorAnalysis }: { colorAnalysis: ColorAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 text-sm tech-mono">
        <div className="space-y-2">
          <span className="text-gray-600 uppercase tracking-wide">Total Pixels:</span>
          <div className="text-sky-600 font-bold">{colorAnalysis.total_pixels.toLocaleString()}</div>
        </div>
        <div className="space-y-2">
          <span className="text-gray-600 uppercase tracking-wide">Mean Color (BGR):</span>
          <div className="text-emerald-600 font-bold">[{colorAnalysis.mean_color_bgr.map(c => Math.round(c)).join(', ')}]</div>
        </div>
      </div>
      
      <div>
        <h5 className="font-bold text-gray-900 mono-bold mb-4 uppercase tracking-wide">Dominant Colors</h5>
        <div className="flex space-x-4">
          {colorAnalysis.dominant_colors.map((color, index) => (
            <div key={index} className="text-center space-y-2">
              <div 
                className="w-16 h-16 rounded-xl border-2 border-gray-300 shadow-lg hover:scale-110 transition-transform duration-300"
                style={{ 
                  backgroundColor: `rgb(${Math.round(color[2])}, ${Math.round(color[1])}, ${Math.round(color[0])})` 
                }}
              />
              <div className="text-xs text-gray-700 tech-mono font-bold">
                {(colorAnalysis.color_percentages[index] * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}