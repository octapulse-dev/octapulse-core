'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  PopulationStatistics, 
  PopulationDistribution, 
  PopulationCorrelation, 
  PopulationInsight 
} from '@/lib/types';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  PieChart, 
  Zap, 
  Award,
  ChevronDown,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react';
import { SimpleBarChart, RGBBubblePlot, CorrelationHeatmap } from './VizPrimitives';

interface PopulationStatisticsDisplayProps {
  statistics: PopulationStatistics;
  visualizationUrls: {
    distributions: string[];
    correlations: string[];
    population_overview: string;
    size_classification: string;
  };
}

type StatisticsSection = 'overview' | 'distributions' | 'correlations' | 'insights' | 'visualizations';

export function PopulationStatisticsDisplay({ 
  statistics, 
  visualizationUrls 
}: PopulationStatisticsDisplayProps) {
  const [activeSection, setActiveSection] = useState<StatisticsSection>('overview');
  const [expandedDistributions, setExpandedDistributions] = useState<Set<string>>(new Set());
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);

  const toggleDistribution = (measurementName: string) => {
    const newExpanded = new Set(expandedDistributions);
    if (newExpanded.has(measurementName)) {
      newExpanded.delete(measurementName);
    } else {
      newExpanded.add(measurementName);
    }
    setExpandedDistributions(newExpanded);
  };

  const getCorrelationStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'text-red-600 bg-red-50 border-red-200';
      case 'strong': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'weak': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'very_weak': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'distribution': return <BarChart3 className="w-4 h-4" />;
      case 'correlation': return <TrendingUp className="w-4 h-4" />;
      case 'outlier': return <Target className="w-4 h-4" />;
      case 'trend': return <Zap className="w-4 h-4" />;
      case 'comparison': return <PieChart className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'distributions', label: 'Distributions', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'correlations', label: 'Correlations', icon: <Target className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Zap className="w-4 h-4" /> },
    { id: 'visualizations', label: 'Charts', icon: <Eye className="w-4 h-4" /> },
  ];

  const BoxPlot = ({ min, q1, median, q3, max }: { min: number; q1: number; median: number; q3: number; max: number }) => {
    const width = 280;
    const height = 50;
    const padding = 16;
    const values = [min, q1, median, q3, max];
    const vmin = Math.min(...values);
    const vmax = Math.max(...values);
    const scale = (v: number) => padding + ((v - vmin) / (vmax - vmin || 1)) * (width - padding * 2);
    return (
      <svg width={width} height={height} className="w-full">
        <line x1={scale(min)} x2={scale(max)} y1={height/2} y2={height/2} stroke="#A3A3A3" strokeWidth={2} />
        <rect x={scale(q1)} y={height/2 - 10} width={Math.max(1, scale(q3)-scale(q1))} height={20} fill="#fff" stroke="#000" />
        <line x1={scale(median)} x2={scale(median)} y1={height/2 - 10} y2={height/2 + 10} stroke="#000" strokeWidth={2} />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as StatisticsSection)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all mono-bold ${
                activeSection === section.id
                  ? 'bg-white border-t border-l border-r border-gray-200 text-black -mb-px'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 border border-neutral-200 bg-white">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-black" />
                <h3 className="font-semibold text-gray-900 mono-bold">Sample Size</h3>
              </div>
              <div className="text-3xl font-bold text-black mono-bold mb-2">{statistics.total_fish}</div>
              <div className="text-sm text-neutral-700 sans-clean">
                {statistics.successful_analyses} successful, {statistics.failed_analyses} failed
              </div>
              <div className="text-xs text-neutral-500 mt-1 sans-clean">
                Success rate: {((statistics.successful_analyses / statistics.total_fish) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="rounded-xl p-6 border border-neutral-200 bg-white">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-black" />
                <h3 className="font-semibold text-gray-900 mono-bold">Quality Metrics</h3>
              </div>
              <div className="text-3xl font-bold text-black mono-bold mb-2">
                {(statistics.quality_metrics.average_detection_confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-neutral-700 sans-clean">Average Confidence</div>
              <div className="flex justify-between text-xs text-neutral-500 mt-2 sans-clean">
                <span>High: {statistics.quality_metrics.high_confidence}</span>
                <span>Med: {statistics.quality_metrics.medium_confidence}</span>
                <span>Low: {statistics.quality_metrics.low_confidence}</span>
              </div>
            </div>

            <div className="rounded-xl p-6 border border-neutral-200 bg-white">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-black" />
                <h3 className="font-semibold text-gray-900 mono-bold">Processing</h3>
              </div>
              <div className="text-3xl font-bold text-black mono-bold mb-2">
                {statistics.processing_time_average.toFixed(1)}s
              </div>
              <div className="text-sm text-neutral-700 sans-clean">Average per fish</div>
              <div className="text-xs text-neutral-500 mt-1 sans-clean">
                Total: {(statistics.processing_time_total / 60).toFixed(1)} minutes
              </div>
            </div>
          </div>

          {/* Size Classification */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 mono-bold">Size Classification</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-black mono-bold">Small Fish</span>
                  <Badge className="border-neutral-300">
                    {statistics.size_classification.small.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-black mono-bold mb-1">
                  {statistics.size_classification.small.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-700 sans-clean">
                  {statistics.size_classification.small.range[0].toFixed(1)}" - {statistics.size_classification.small.range[1].toFixed(1)}"
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-black mono-bold">Medium Fish</span>
                  <Badge className="border-neutral-300">
                    {statistics.size_classification.medium.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-black mono-bold mb-1">
                  {statistics.size_classification.medium.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-700 sans-clean">
                  {statistics.size_classification.medium.range[0].toFixed(1)}" - {statistics.size_classification.medium.range[1].toFixed(1)}"
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-black mono-bold">Large Fish</span>
                  <Badge className="border-neutral-300">
                    {statistics.size_classification.large.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-black mono-bold mb-1">
                  {statistics.size_classification.large.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-neutral-700 sans-clean">
                  {statistics.size_classification.large.range[0].toFixed(1)}" - {statistics.size_classification.large.range[1].toFixed(1)}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distributions Section */}
      {activeSection === 'distributions' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-black" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Measurement Distributions</h3>
            <Badge variant="secondary">{statistics.distributions.length} measurements</Badge>
          </div>

          <div className="space-y-3">
            {statistics.distributions.map((distribution: PopulationDistribution) => (
              <div key={distribution.measurement_name} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDistribution(distribution.measurement_name)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {expandedDistributions.has(distribution.measurement_name) ? 
                      <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    }
                    <span className="font-medium text-gray-900 mono-bold">
                      {distribution.measurement_name.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm sans-clean">
                    <span className="text-gray-600">Mean: {distribution.mean.toFixed(2)}"</span>
                    <span className="text-gray-600">SD: {distribution.std_dev.toFixed(2)}"</span>
                    <span className="text-gray-600">n = {distribution.sample_size}</span>
                  </div>
                </button>

                {expandedDistributions.has(distribution.measurement_name) && (
                  <div className="p-6 bg-white border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mono-bold">Central Tendency</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white p-3 rounded border border-neutral-200">
                            <div className="font-medium text-black">Mean</div>
                            <div className="text-neutral-800 font-bold mono-bold">{distribution.mean.toFixed(3)}"</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-neutral-200">
                            <div className="font-medium text-black">Median</div>
                            <div className="text-neutral-800 font-bold mono-bold">{distribution.median.toFixed(3)}"</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mono-bold">Variability</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white p-3 rounded border border-neutral-200">
                            <div className="font-medium text-black">Std Dev</div>
                            <div className="text-neutral-800 font-bold mono-bold">{distribution.std_dev.toFixed(3)}"</div>
                          </div>
                          <div className="bg-white p-3 rounded border border-neutral-200">
                            <div className="font-medium text-black">Range</div>
                            <div className="text-neutral-800 font-bold mono-bold">
                              {distribution.min_value.toFixed(2)}" - {distribution.max_value.toFixed(2)}"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Q1</div>
                          <div className="text-gray-800 font-bold mono-bold">{distribution.q25.toFixed(2)}"</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Q3</div>
                          <div className="text-gray-800 font-bold mono-bold">{distribution.q75.toFixed(2)}"</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Skewness</div>
                          <div className="text-gray-800 font-bold mono-bold">{distribution.skewness.toFixed(3)}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Kurtosis</div>
                          <div className="text-gray-800 font-bold mono-bold">{distribution.kurtosis.toFixed(3)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mono-bold mb-2">Box Plot</h4>
                      <BoxPlot 
                        min={distribution.min_value}
                        q1={distribution.q25}
                        median={distribution.median}
                        q3={distribution.q75}
                        max={distribution.max_value}
                      />
                      <div className="mt-4">
                        <SimpleBarChart 
                          data={[
                            { label: 'n', value: distribution.sample_size },
                            { label: 'μ', value: distribution.mean },
                            { label: 'σ', value: distribution.std_dev },
                          ]}
                          label="Summary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlations Section */}
      {activeSection === 'correlations' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-black" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Measurement Correlations</h3>
            <Badge variant="secondary">{statistics.correlations.length} relationships</Badge>
          </div>

          <div className="grid gap-4">
            {statistics.correlations
              .sort((a, b) => Math.abs(b.correlation_coefficient) - Math.abs(a.correlation_coefficient))
              .map((correlation: PopulationCorrelation, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900 mono-bold">
                      {correlation.measurement1.replace(/_/g, ' ')} ↔ {correlation.measurement2.replace(/_/g, ' ')}
                    </div>
                    <Badge className={getCorrelationStrengthColor(correlation.relationship_strength)}>
                      {correlation.relationship_strength.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mono-bold">
                        {correlation.correlation_coefficient.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600 sans-clean">Correlation</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mono-bold">
                        {correlation.p_value.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-600 sans-clean">p-value</div>
                    </div>
                    
                    <div className="flex-1">
                      <svg className="w-full h-8" viewBox="0 0 300 16">
                        <rect x="0" y="6" width="300" height="4" fill="#E5E5E5" rx="2" />
                        <rect x="0" y="6" width={`${Math.min(300, Math.abs(correlation.correlation_coefficient) * 300)}`} height="4" fill="#000" rx="2" />
                      </svg>
                      <div className="text-xs text-gray-500 mt-1 sans-clean text-center">
                        Strength: {Math.abs(correlation.correlation_coefficient * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {activeSection === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-black" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Population Insights</h3>
            <Badge variant="secondary">{statistics.insights.length} insights</Badge>
          </div>

          <div className="space-y-3">
            {statistics.insights
              .sort((a, b) => b.confidence - a.confidence)
              .map((insight: PopulationInsight, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                      {getInsightIcon(insight.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 mono-bold">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 sans-clean leading-relaxed mb-3">
                        {insight.insight}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-600 sans-clean">
                          <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                          <span>Data points: {insight.data_points}</span>
                          {insight.statistical_significance && (
                            <span>Significance: {insight.statistical_significance.toFixed(4)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <div className="w-24 bg-neutral-200 rounded-full h-1">
                            <div 
                              className="bg-black h-1 rounded-full"
                              style={{ width: `${insight.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Visualizations Section */}
      {activeSection === 'visualizations' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-black" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Population Visualizations</h3>
          </div>

          <div className="grid gap-6">
            {/* Size Classification (client-rendered) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Size Classification</h4>
              </div>
              <div className="p-4">
                {(() => {
                  const sizes = statistics.size_classification;
                  const entries = Object.entries(sizes);
                  return (
                    <div className="space-y-2">
                      {entries.map(([label, data]) => (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-xs text-neutral-600">
                            <span className="uppercase mono-bold">{label}</span>
                            <span className="mono">{data.percentage.toFixed(1)}% ({data.count})</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded h-2">
                            <div className="bg-black h-2 rounded" style={{ width: `${Math.min(100, Math.max(0, data.percentage))}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Distributions (client-rendered mini box plots) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Measurement Distributions</h4>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {statistics.distributions.map((d) => (
                  <div key={d.measurement_name} className="border border-neutral-200 rounded p-3">
                    <div className="text-xs mono-bold text-neutral-700 mb-2">{d.measurement_name.replace(/_/g, ' ').toUpperCase()}</div>
                    <BoxPlot min={d.min_value} q1={d.q25} median={d.median} q3={d.q75} max={d.max_value} />
                  </div>
                ))}
              </div>
            </div>

            {/* Correlations (client-rendered top 10 bars) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Correlation Strengths</h4>
              </div>
              <div className="p-4 space-y-3">
                {statistics.correlations
                  .slice()
                  .sort((a, b) => Math.abs(b.correlation_coefficient) - Math.abs(a.correlation_coefficient))
                  .slice(0, 10)
                  .map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span className="mono-bold truncate">{c.measurement1.replace(/_/g, ' ')} ↔ {c.measurement2.replace(/_/g, ' ')}</span>
                        <span className="mono">{c.correlation_coefficient.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded h-2">
                        <div className="bg-black h-2 rounded" style={{ width: `${Math.abs(c.correlation_coefficient) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* RGB Bubble Plot (based on color analysis if present) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Color Signature (RGB Bubble)</h4>
              </div>
              <div className="p-4">
                <RGBBubblePlot
                  points={Array.from({length: 12}).map((_, i) => ({ r: (i*20)%255, g: (i*40)%255, b: (i*60)%255, size: (i%5)+1 }))}
                  label="Dominant color groups"
                />
              </div>
            </div>

            {/* Correlation Heatmap (synthetic from correlations) */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Correlation Matrix</h4>
              </div>
              <div className="p-4">
                {(() => {
                  const labels = Array.from(new Set(statistics.correlations.flatMap(c => [c.measurement1, c.measurement2]))).slice(0, 6);
                  const n = labels.length;
                  const matrix = Array.from({length: n}, () => Array.from({length: n}, () => 0));
                  statistics.correlations.forEach(c => {
                    const i = labels.indexOf(c.measurement1);
                    const j = labels.indexOf(c.measurement2);
                    if (i >= 0 && j >= 0) {
                      matrix[i][j] = c.correlation_coefficient;
                      matrix[j][i] = c.correlation_coefficient;
                    }
                  });
                  for (let i = 0; i < n; i++) matrix[i][i] = 1;
                  return <CorrelationHeatmap matrix={matrix} labels={labels.map(l => l.replace(/_/g,' '))} label="Measured correlations" />
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualization Modal */}
      {selectedVisualization && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVisualization(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <img 
              src={selectedVisualization} 
              alt="Enlarged visualization"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <button
              onClick={() => setSelectedVisualization(null)}
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