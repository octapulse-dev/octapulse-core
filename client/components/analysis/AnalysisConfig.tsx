/**
 * Analysis configuration component
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Info } from 'lucide-react';
import { AnalysisConfig } from '@/lib/types';

interface AnalysisConfigProps {
  config: AnalysisConfig;
  onConfigChange: (config: AnalysisConfig) => void;
  disabled?: boolean;
  className?: string;
}

export default function AnalysisConfigComponent({
  config,
  onConfigChange,
  disabled = false,
  className = ''
}: AnalysisConfigProps) {
  const updateConfig = (field: keyof AnalysisConfig, value: any) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className={`enhanced-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-sky-400 pulse-glow" />
          <h3 className="text-xl font-bold text-white tech-mono">ANALYSIS CONFIG</h3>
        </div>
        
        <div className="space-y-6">
        {/* Grid Square Size */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-bold text-white tech-mono">
              GRID SQUARE SIZE
            </label>
            <span className="text-xs text-slate-400 tech-mono">(INCHES)</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={config.gridSquareSize}
              onChange={(e) => updateConfig('gridSquareSize', parseFloat(e.target.value) || 1.0)}
              disabled={disabled}
              className="flex h-11 w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm text-white tech-mono shadow-sm backdrop-blur-sm transition-all focus-glow focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            
            <div className="group relative">
              <Info className="w-5 h-5 text-sky-400 cursor-help hover:text-sky-300 transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 glass rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-600">
                <p className="text-xs text-white tech-mono">Size of calibration grid squares</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 tech-mono">
            Adjust based on grid pattern for accurate measurements
          </p>
        </div>

        {/* Analysis Options */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-white tech-mono">ANALYSIS OPTIONS</h4>
          
          {/* Include Visualizations */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeVisualizations"
              checked={config.includeVisualizations}
              onChange={(e) => updateConfig('includeVisualizations', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-sky-500 bg-slate-800 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
            />
            <label htmlFor="includeVisualizations" className="text-sm text-slate-300 tech-mono">
              Generate visualization images
            </label>
          </div>
          
          {/* Include Color Analysis */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeColorAnalysis"
              checked={config.includeColorAnalysis}
              onChange={(e) => updateConfig('includeColorAnalysis', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <label htmlFor="includeColorAnalysis" className="text-sm text-slate-300 tech-mono">
              Include color analysis
            </label>
          </div>
          
          {/* Include Lateral Line Analysis */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeLateralLineAnalysis"
              checked={config.includeLateralLineAnalysis}
              onChange={(e) => updateConfig('includeLateralLineAnalysis', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="includeLateralLineAnalysis" className="text-sm text-slate-300 tech-mono">
              Include lateral line analysis
            </label>
          </div>
        </div>

        {/* Reset to Defaults */}
        <div className="pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => onConfigChange({
              gridSquareSize: 1.0,
              includeVisualizations: true,
              includeColorAnalysis: true,
              includeLateralLineAnalysis: true
            })}
            disabled={disabled}
            className="w-full py-2 px-4 text-xs font-bold tech-mono text-slate-400 bg-slate-800/50 border border-slate-600 rounded-lg hover:bg-slate-700/50 hover:text-slate-300 transition-all disabled:opacity-50"
          >
            RESET TO DEFAULTS
          </button>
        </div>

        {/* Configuration Summary */}
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <h5 className="text-xs font-bold mb-3 text-white tech-mono">CURRENT CONFIG</h5>
          <div className="text-xs text-slate-400 tech-mono space-y-2">
            <div className="flex justify-between">
              <span>Grid Size:</span>
              <span className="text-sky-400">{config.gridSquareSize}" per square</span>
            </div>
            <div className="flex justify-between">
              <span>Visualizations:</span>
              <span className={config.includeVisualizations ? 'text-emerald-400' : 'text-red-400'}>
                {config.includeVisualizations ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Color Analysis:</span>
              <span className={config.includeColorAnalysis ? 'text-emerald-400' : 'text-red-400'}>
                {config.includeColorAnalysis ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lateral Line:</span>
              <span className={config.includeLateralLineAnalysis ? 'text-emerald-400' : 'text-red-400'}>
                {config.includeLateralLineAnalysis ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}