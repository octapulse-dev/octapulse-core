/**
 * ChartConfig Component
 *
 * Configuration panel for customizing chart display options.
 * Allows users to toggle axes, legends, grid lines, and other chart features.
 */

'use client';

import React, { memo } from 'react';
import { Settings, Eye, EyeOff, Grid, TrendingUp, Tag } from 'lucide-react';

export interface ChartConfiguration {
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showAxesLabels: boolean;
  showDataLabels: boolean;
  enableZoom: boolean;
  enableBrush: boolean;
  chartHeight: number;
}

interface ChartConfigProps {
  config: ChartConfiguration;
  onChange: (config: ChartConfiguration) => void;
  className?: string;
}

export const ChartConfig = memo(({
  config,
  onChange,
  className = '',
}: ChartConfigProps) => {
  const toggleOption = (key: keyof ChartConfiguration) => {
    onChange({ ...config, [key]: !config[key] });
  };

  const updateHeight = (height: number) => {
    onChange({ ...config, chartHeight: height });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900 mono-bold">Chart Configuration</h3>
      </div>

      <div className="space-y-3">
        {/* Display Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Display Options</h4>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={() => toggleOption('showGrid')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <Grid className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Show Grid Lines</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showLegend}
              onChange={() => toggleOption('showLegend')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Show Legend</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showTooltip}
              onChange={() => toggleOption('showTooltip')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Show Tooltips</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showAxesLabels}
              onChange={() => toggleOption('showAxesLabels')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Show Axes Labels</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showDataLabels}
              onChange={() => toggleOption('showDataLabels')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700 ml-6">Show Data Labels</span>
          </label>
        </div>

        {/* Interaction Options */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Interaction</h4>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableZoom}
              onChange={() => toggleOption('enableZoom')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">Enable Zoom</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableBrush}
              onChange={() => toggleOption('enableBrush')}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">Enable Brush Selection</span>
          </label>
        </div>

        {/* Size Options */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Chart Height</h4>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="200"
              max="600"
              step="50"
              value={config.chartHeight}
              onChange={(e) => updateHeight(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-700 w-12 text-right mono">
              {config.chartHeight}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartConfig.displayName = 'ChartConfig';

// Default configuration
export const defaultChartConfig: ChartConfiguration = {
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  showAxesLabels: true,
  showDataLabels: false,
  enableZoom: false,
  enableBrush: false,
  chartHeight: 300,
};
