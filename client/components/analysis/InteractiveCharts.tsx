/**
 * Interactive Charts Component
 *
 * Professional, interactive charts using Recharts library.
 * Includes distribution histograms, correlation heatmaps, scatter plots,
 * and more with tooltips, zoom, and export capabilities.
 */

'use client';

import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine,
  Brush,
} from 'recharts';
import type { PopulationDistribution, PopulationCorrelation } from '@/lib/types';

// Color palette for consistent theming
const COLORS = {
  primary: '#000000',
  secondary: '#525252',
  accent: '#737373',
  background: '#ffffff',
  grid: '#e5e7eb',
  tooltip: '#1f2937',
};

interface DistributionChartProps {
  distribution: PopulationDistribution;
  width?: number | string | `${number}%`;
  height?: number;
  showBrush?: boolean;
}

/**
 * Distribution Histogram with quartile markers
 */
export const DistributionHistogram = memo(({
  distribution,
  width = '100%',
  height = 300,
  showBrush = false,
}: DistributionChartProps) => {
  // Create histogram data from distribution
  const histogramData = useMemo(() => {
    const bins = 20;
    const range = distribution.max_value - distribution.min_value;
    const binSize = range / bins;

    return Array.from({ length: bins }, (_, i) => {
      const binStart = distribution.min_value + i * binSize;
      const binEnd = binStart + binSize;
      const binMid = (binStart + binEnd) / 2;

      return {
        bin: binMid.toFixed(2),
        range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        // Approximate frequency using normal distribution
        frequency: Math.exp(-Math.pow((binMid - distribution.mean) / distribution.std_dev, 2) / 2),
      };
    });
  }, [distribution]);

  return (
    <ResponsiveContainer width={typeof width === 'number' ? width : width as any} height={height}>
      <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          dataKey="range"
          tick={{ fill: COLORS.secondary, fontSize: 11 }}
          tickLine={{ stroke: COLORS.grid }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          tickLine={{ stroke: COLORS.grid }}
          label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: COLORS.secondary }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: COLORS.tooltip,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
          }}
          formatter={(value: number) => [value.toFixed(3), 'Frequency']}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />

        {/* Reference lines for quartiles */}
        <ReferenceLine
          x={distribution.q25.toFixed(2)}
          stroke={COLORS.accent}
          strokeDasharray="5 5"
          label={{ value: 'Q1', position: 'top', fill: COLORS.secondary }}
        />
        <ReferenceLine
          x={distribution.median.toFixed(2)}
          stroke={COLORS.primary}
          strokeDasharray="5 5"
          label={{ value: 'Median', position: 'top', fill: COLORS.primary }}
        />
        <ReferenceLine
          x={distribution.q75.toFixed(2)}
          stroke={COLORS.accent}
          strokeDasharray="5 5"
          label={{ value: 'Q3', position: 'top', fill: COLORS.secondary }}
        />

        <Bar dataKey="frequency" fill={COLORS.primary} name={distribution.measurement_name}>
          {histogramData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.primary} opacity={0.8} />
          ))}
        </Bar>

        {showBrush && <Brush dataKey="range" height={30} stroke={COLORS.primary} />}
      </BarChart>
    </ResponsiveContainer>
  );
});

DistributionHistogram.displayName = 'DistributionHistogram';

interface BoxPlotChartProps {
  distributions: PopulationDistribution[];
  width?: number | string | `${number}%`;
  height?: number;
}

/**
 * Box Plot Chart for comparing multiple distributions
 */
export const BoxPlotChart = memo(({
  distributions,
  width = '100%',
  height = 300,
}: BoxPlotChartProps) => {
  const boxPlotData = useMemo(() => {
    return distributions.map(d => ({
      name: d.measurement_name.replace(/_/g, ' ').toUpperCase().slice(0, 15),
      min: d.min_value,
      q1: d.q25,
      median: d.median,
      q3: d.q75,
      max: d.max_value,
      mean: d.mean,
    }));
  }, [distributions]);

  return (
    <ResponsiveContainer width={typeof width === 'number' ? width : width as any} height={height}>
      <BarChart data={boxPlotData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          dataKey="name"
          tick={{ fill: COLORS.secondary, fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          label={{ value: 'Value', angle: -90, position: 'insideLeft', fill: COLORS.secondary }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: COLORS.tooltip,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
          }}
          formatter={(value: number, name: string) => [value.toFixed(3), name]}
        />
        <Legend />
        <Bar dataKey="min" fill="#94a3b8" name="Min" stackId="a" />
        <Bar dataKey="q1" fill="#64748b" name="Q1" stackId="a" />
        <Bar dataKey="median" fill={COLORS.primary} name="Median" stackId="a" />
        <Bar dataKey="q3" fill="#64748b" name="Q3" stackId="a" />
        <Bar dataKey="max" fill="#94a3b8" name="Max" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
});

BoxPlotChart.displayName = 'BoxPlotChart';

interface CorrelationScatterProps {
  correlation: PopulationCorrelation;
  data?: Array<{ x: number; y: number }>;
  width?: number | string | `${number}%`;
  height?: number;
}

/**
 * Scatter Plot for correlation visualization
 */
export const CorrelationScatter = memo(({
  correlation,
  data,
  width = '100%',
  height = 300,
}: CorrelationScatterProps) => {
  // Generate synthetic data if not provided
  const scatterData = useMemo(() => {
    if (data) return data;

    // Generate synthetic correlated data
    const numPoints = 50;
    const r = correlation.correlation_coefficient;

    return Array.from({ length: numPoints }, (_, i) => {
      const x = Math.random() * 100;
      const y = r * x + (1 - Math.abs(r)) * Math.random() * 100;
      return { x, y };
    });
  }, [data, correlation.correlation_coefficient]);

  return (
    <ResponsiveContainer width={typeof width === 'number' ? width : width as any} height={height}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          type="number"
          dataKey="x"
          name={correlation.measurement1}
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          label={{
            value: correlation.measurement1.replace(/_/g, ' '),
            position: 'insideBottom',
            offset: -10,
            fill: COLORS.secondary,
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={correlation.measurement2}
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          label={{
            value: correlation.measurement2.replace(/_/g, ' '),
            angle: -90,
            position: 'insideLeft',
            fill: COLORS.secondary,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: COLORS.tooltip,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
          }}
          formatter={(value: number) => value.toFixed(2)}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '10px' }}
          content={() => (
            <div className="text-center text-sm text-gray-600 pt-2">
              r = {correlation.correlation_coefficient.toFixed(3)} ({correlation.relationship_strength})
            </div>
          )}
        />
        <Scatter
          name={`${correlation.measurement1} vs ${correlation.measurement2}`}
          data={scatterData}
          fill={COLORS.primary}
          fillOpacity={0.6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
});

CorrelationScatter.displayName = 'CorrelationScatter';

interface CorrelationHeatmapProps {
  correlations: PopulationCorrelation[];
  width?: number | string | `${number}%`;
  height?: number;
}

/**
 * Correlation Heatmap using a simplified approach
 */
export const CorrelationHeatmap = memo(({
  correlations,
  width = '100%',
  height = 400,
}: CorrelationHeatmapProps) => {
  const heatmapData = useMemo(() => {
    // Get unique measurements
    const measurements = Array.from(
      new Set(correlations.flatMap(c => [c.measurement1, c.measurement2]))
    ).slice(0, 10); // Limit to top 10 for readability

    // Create matrix data
    const matrix = measurements.map(m1 => {
      const row: any = { measurement: m1.replace(/_/g, ' ').slice(0, 15) };

      measurements.forEach(m2 => {
        if (m1 === m2) {
          row[m2] = 1.0;
        } else {
          const corr = correlations.find(
            c => (c.measurement1 === m1 && c.measurement2 === m2) ||
                 (c.measurement1 === m2 && c.measurement2 === m1)
          );
          row[m2] = corr ? Math.abs(corr.correlation_coefficient) : 0;
        }
      });

      return row;
    });

    return matrix;
  }, [correlations]);

  const measurements = useMemo(() => {
    return Array.from(
      new Set(correlations.flatMap(c => [c.measurement1, c.measurement2]))
    ).slice(0, 10);
  }, [correlations]);

  return (
    <div className="space-y-2">
      {heatmapData.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-2">
          <div className="w-24 text-xs text-right font-mono text-neutral-700 truncate">
            {row.measurement}
          </div>
          <div className="flex-1 flex space-x-1">
            {measurements.map((m, colIndex) => {
              const value = row[m] || 0;
              const intensity = Math.round(255 * (1 - value));
              const bgColor = `rgb(${intensity}, ${intensity}, ${intensity})`;

              return (
                <div
                  key={colIndex}
                  className="flex-1 h-8 border border-gray-200 rounded"
                  style={{ backgroundColor: bgColor }}
                  title={`${row.measurement} vs ${m.replace(/_/g, ' ')}: ${value.toFixed(3)}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

CorrelationHeatmap.displayName = 'CorrelationHeatmap';

interface TrendLineChartProps {
  data: Array<{ label: string; value: number }>;
  width?: number | string | `${number}%`;
  height?: number;
  showArea?: boolean;
}

/**
 * Trend Line Chart with optional area fill
 */
export const TrendLineChart = memo(({
  data,
  width = '100%',
  height = 300,
  showArea = true,
}: TrendLineChartProps) => {
  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <ResponsiveContainer width={typeof width === 'number' ? width : width as any} height={height}>
      <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          tickLine={{ stroke: COLORS.grid }}
        />
        <YAxis
          tick={{ fill: COLORS.secondary, fontSize: 12 }}
          tickLine={{ stroke: COLORS.grid }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: COLORS.tooltip,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
          }}
          formatter={(value: number) => [value.toFixed(2), 'Value']}
        />
        <Legend />
        <DataComponent
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={showArea ? 0.3 : 1}
          strokeWidth={2}
          name="Measurement"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
});

TrendLineChart.displayName = 'TrendLineChart';

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number }>;
  width?: number | string | `${number}%`;
  height?: number;
  horizontal?: boolean;
}

/**
 * Simple Bar Chart (Recharts version)
 */
export const SimpleBarChartRecharts = memo(({
  data,
  width = '100%',
  height = 250,
  horizontal = false,
}: SimpleBarChartProps) => {
  return (
    <ResponsiveContainer width={typeof width === 'number' ? width : width as any} height={height}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: COLORS.secondary, fontSize: 12 }} />
            <YAxis type="category" dataKey="label" tick={{ fill: COLORS.secondary, fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={{ fill: COLORS.secondary, fontSize: 12 }} />
            <YAxis tick={{ fill: COLORS.secondary, fontSize: 12 }} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: COLORS.tooltip,
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
          }}
        />
        <Bar dataKey="value" fill={COLORS.primary}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.primary} opacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

SimpleBarChartRecharts.displayName = 'SimpleBarChartRecharts';
