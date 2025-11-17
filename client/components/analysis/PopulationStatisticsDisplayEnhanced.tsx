/**
 * Enhanced Population Statistics Display
 *
 * Professional population statistics display with interactive Recharts,
 * chart configuration, and export capabilities.
 */

'use client';

import React, { useState, useMemo, useRef, memo } from 'react';
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
  Download,
  Settings
} from 'lucide-react';
import {
  DistributionHistogram,
  BoxPlotChart,
  CorrelationScatter,
  CorrelationHeatmap as RechartsHeatmap,
  SimpleBarChartRecharts
} from './InteractiveCharts';
import { ChartConfig, defaultChartConfig, ChartConfiguration } from './ChartConfig';
import { ChartExport } from './ChartExport';
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/SkeletonLoaders';

interface PopulationStatisticsDisplayEnhancedProps {
  statistics: PopulationStatistics;
  visualizationUrls: {
    distributions: string[];
    correlations: string[];
    population_overview: string;
    size_classification: string;
  };
}

type StatisticsSection = 'overview' | 'distributions' | 'correlations' | 'insights' | 'visualizations';

export const PopulationStatisticsDisplayEnhanced = memo(({
  statistics,
  visualizationUrls
}: PopulationStatisticsDisplayEnhancedProps) => {
  const [activeSection, setActiveSection] = useState<StatisticsSection>('overview');
  const [expandedDistributions, setExpandedDistributions] = useState<Set<string>>(new Set());
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfiguration>(defaultChartConfig);
  const [showChartConfig, setShowChartConfig] = useState(false);

  const chartRefs = {
    distribution: useRef<HTMLDivElement>(null),
    correlation: useRef<HTMLDivElement>(null),
    sizeClass: useRef<HTMLDivElement>(null),
  };

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

  // Prepare size classification data for charts
  const sizeClassData = useMemo(() => {
    const sizes = statistics.size_classification;
    return [
      { label: 'Small', value: sizes.small.count },
      { label: 'Medium', value: sizes.medium.count },
      { label: 'Large', value: sizes.large.count },
    ];
  }, [statistics.size_classification]);

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

          {/* Chart Config Toggle */}
          <button
            onClick={() => setShowChartConfig(!showChartConfig)}
            className={`ml-auto flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
              showChartConfig
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Chart Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Configuration Panel */}
      {showChartConfig && (
        <ChartConfig
          config={chartConfig}
          onChange={setChartConfig}
          className="animate-in slide-in-from-top duration-200"
        />
      )}

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

          {/* Size Classification Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6" ref={chartRefs.sizeClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mono-bold">Size Classification</h3>
              <ChartExport chartRef={chartRefs.sizeClass} chartName="size-classification" />
            </div>
            <SimpleBarChartRecharts
              data={sizeClassData}
              height={chartConfig.chartHeight}
            />
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

          {/* Box Plot Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6" ref={chartRefs.distribution}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 mono-bold">Distribution Overview</h4>
              <ChartExport chartRef={chartRefs.distribution} chartName="distributions-overview" />
            </div>
            <BoxPlotChart
              distributions={statistics.distributions.slice(0, 8)}
              height={chartConfig.chartHeight}
            />
          </div>

          {/* Individual Distributions */}
          <div className="space-y-3">
            {statistics.distributions.map((distribution: PopulationDistribution) => (
              <div key={distribution.measurement_name} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
                    <DistributionHistogram
                      distribution={distribution}
                      height={chartConfig.chartHeight}
                      showBrush={chartConfig.enableBrush}
                    />

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
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

          {/* Correlation Heatmap */}
          <div className="bg-white rounded-xl border border-gray-200 p-6" ref={chartRefs.correlation}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 mono-bold">Correlation Matrix</h4>
              <ChartExport chartRef={chartRefs.correlation} chartName="correlation-matrix" />
            </div>
            <RechartsHeatmap
              correlations={statistics.correlations}
              height={chartConfig.chartHeight}
            />
          </div>

          {/* Top Correlations */}
          <div className="grid gap-4">
            {statistics.correlations
              .sort((a, b) => Math.abs(b.correlation_coefficient) - Math.abs(a.correlation_coefficient))
              .slice(0, 5)
              .map((correlation: PopulationCorrelation, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-medium text-gray-900 mono-bold">
                      {correlation.measurement1.replace(/_/g, ' ')} ↔ {correlation.measurement2.replace(/_/g, ' ')}
                    </div>
                    <Badge className={getCorrelationStrengthColor(correlation.relationship_strength)}>
                      {correlation.relationship_strength.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <CorrelationScatter
                    correlation={correlation}
                    height={250}
                  />
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
            <h3 className="text-xl font-semibold text-gray-900 mono-bold">Interactive Visualizations</h3>
          </div>

          <div className="grid gap-6">
            {/* All interactive charts in one view */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mono-bold mb-4">Size Distribution</h4>
              <SimpleBarChartRecharts
                data={sizeClassData}
                height={chartConfig.chartHeight}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mono-bold mb-4">Measurement Box Plots</h4>
              <BoxPlotChart
                distributions={statistics.distributions}
                height={chartConfig.chartHeight}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mono-bold mb-4">Correlation Heatmap</h4>
              <RechartsHeatmap
                correlations={statistics.correlations}
                height={chartConfig.chartHeight}
              />
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
});

PopulationStatisticsDisplayEnhanced.displayName = 'PopulationStatisticsDisplayEnhanced';
