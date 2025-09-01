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
                  ? 'bg-white border-t border-l border-r border-gray-200 text-sky-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-6 border border-sky-200">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-sky-600" />
                <h3 className="font-semibold text-gray-900 mono-bold">Sample Size</h3>
              </div>
              <div className="text-3xl font-bold text-sky-700 mono-bold mb-2">{statistics.total_fish}</div>
              <div className="text-sm text-sky-600 sans-clean">
                {statistics.successful_analyses} successful, {statistics.failed_analyses} failed
              </div>
              <div className="text-xs text-sky-500 mt-1 sans-clean">
                Success rate: {((statistics.successful_analyses / statistics.total_fish) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-emerald-600" />
                <h3 className="font-semibold text-gray-900 mono-bold">Quality Metrics</h3>
              </div>
              <div className="text-3xl font-bold text-emerald-700 mono-bold mb-2">
                {(statistics.quality_metrics.average_detection_confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-emerald-600 sans-clean">Average Confidence</div>
              <div className="flex justify-between text-xs text-emerald-500 mt-2 sans-clean">
                <span>High: {statistics.quality_metrics.high_confidence}</span>
                <span>Med: {statistics.quality_metrics.medium_confidence}</span>
                <span>Low: {statistics.quality_metrics.low_confidence}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900 mono-bold">Processing</h3>
              </div>
              <div className="text-3xl font-bold text-purple-700 mono-bold mb-2">
                {statistics.processing_time_average.toFixed(1)}s
              </div>
              <div className="text-sm text-purple-600 sans-clean">Average per fish</div>
              <div className="text-xs text-purple-500 mt-1 sans-clean">
                Total: {(statistics.processing_time_total / 60).toFixed(1)} minutes
              </div>
            </div>
          </div>

          {/* Size Classification */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 mono-bold">Size Classification</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-800 mono-bold">Small Fish</span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    {statistics.size_classification.small.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-blue-700 mono-bold mb-1">
                  {statistics.size_classification.small.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600 sans-clean">
                  {statistics.size_classification.small.range[0].toFixed(1)}" - {statistics.size_classification.small.range[1].toFixed(1)}"
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800 mono-bold">Medium Fish</span>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    {statistics.size_classification.medium.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-700 mono-bold mb-1">
                  {statistics.size_classification.medium.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 sans-clean">
                  {statistics.size_classification.medium.range[0].toFixed(1)}" - {statistics.size_classification.medium.range[1].toFixed(1)}"
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-orange-800 mono-bold">Large Fish</span>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                    {statistics.size_classification.large.count}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-orange-700 mono-bold mb-1">
                  {statistics.size_classification.large.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-orange-600 sans-clean">
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
            <TrendingUp className="w-6 h-6 text-sky-600" />
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
                          <div className="bg-sky-50 p-3 rounded border border-sky-200">
                            <div className="font-medium text-sky-800">Mean</div>
                            <div className="text-sky-600 font-bold mono-bold">{distribution.mean.toFixed(3)}"</div>
                          </div>
                          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                            <div className="font-medium text-emerald-800">Median</div>
                            <div className="text-emerald-600 font-bold mono-bold">{distribution.median.toFixed(3)}"</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mono-bold">Variability</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <div className="font-medium text-purple-800">Std Dev</div>
                            <div className="text-purple-600 font-bold mono-bold">{distribution.std_dev.toFixed(3)}"</div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded border border-orange-200">
                            <div className="font-medium text-orange-800">Range</div>
                            <div className="text-orange-600 font-bold mono-bold">
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
            <Target className="w-6 h-6 text-emerald-600" />
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.abs(correlation.correlation_coefficient) * 100}%` }}
                        ></div>
                      </div>
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
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Population Insights</h3>
            <Badge variant="secondary">{statistics.insights.length} insights</Badge>
          </div>

          <div className="space-y-3">
            {statistics.insights
              .sort((a, b) => b.confidence - a.confidence)
              .map((insight: PopulationInsight, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
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
                          <div className="w-24 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
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
            <Eye className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Population Visualizations</h3>
          </div>

          <div className="grid gap-6">
            {/* Population Overview */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Population Overview</h4>
              </div>
              <div className="p-4">
                <img 
                  src={visualizationUrls.population_overview} 
                  alt="Population Overview"
                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedVisualization(visualizationUrls.population_overview)}
                />
              </div>
            </div>

            {/* Size Classification */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mono-bold">Size Classification</h4>
              </div>
              <div className="p-4">
                <img 
                  src={visualizationUrls.size_classification} 
                  alt="Size Classification"
                  className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedVisualization(visualizationUrls.size_classification)}
                />
              </div>
            </div>

            {/* Distribution Charts */}
            {visualizationUrls.distributions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mono-bold">Measurement Distributions</h4>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-4">
                  {visualizationUrls.distributions.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Distribution ${index + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedVisualization(url)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Correlation Charts */}
            {visualizationUrls.correlations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mono-bold">Correlation Analysis</h4>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-4">
                  {visualizationUrls.correlations.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Correlation ${index + 1}`}
                      className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedVisualization(url)}
                    />
                  ))}
                </div>
              </div>
            )}
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