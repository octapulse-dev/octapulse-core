/**
 * Minimalistic Analysis Configuration Component
 */

'use client';

import React from 'react';
import { Info } from 'lucide-react';
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
    <div className={`space-y-6 ${className}`}>
      {/* Grid Square Size */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Grid Square Size
        </label>
        
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.gridSquareSize}
            onChange={(e) => updateConfig('gridSquareSize', parseFloat(e.target.value) || 1.0)}
            disabled={disabled}
            className="minimal-input"
          />
          <span className="text-xs text-slate-400 whitespace-nowrap">inches</span>
          
          <div className="group relative">
            <Info className="w-4 h-4 text-slate-400 cursor-help hover:text-sky-400 transition-colors" />
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800/95 border border-slate-600/50 rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm z-10">
              <p className="text-xs text-white">Size of calibration grid squares</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-slate-400">
          Adjust based on grid pattern for accurate measurements
        </p>
      </div>

      {/* Analysis Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">Analysis Options</h4>
        
        {/* Include Visualizations */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.includeVisualizations}
            onChange={(e) => updateConfig('includeVisualizations', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-sky-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-sky-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Generate visualization images
          </span>
        </label>
        
        {/* Include Color Analysis */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.includeColorAnalysis}
            onChange={(e) => updateConfig('includeColorAnalysis', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-emerald-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-emerald-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Include color analysis
          </span>
        </label>
        
        {/* Include Lateral Line Analysis */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.includeLateralLineAnalysis}
            onChange={(e) => updateConfig('includeLateralLineAnalysis', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-cyan-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-cyan-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Include lateral line analysis
          </span>
        </label>
      </div>

      {/* Save Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">Save Options</h4>
        
        {/* Save Results */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.saveResults}
            onChange={(e) => updateConfig('saveResults', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-purple-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-purple-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Save analysis results
          </span>
        </label>
        
        {/* Save Uploads */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.saveUploads}
            onChange={(e) => updateConfig('saveUploads', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-orange-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-orange-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Save uploaded images
          </span>
        </label>
        
        {/* Save Logs */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.saveLogs}
            onChange={(e) => updateConfig('saveLogs', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-yellow-500 bg-slate-800/50 border border-slate-600/50 rounded focus:ring-yellow-500/50 focus:ring-2 transition-colors"
          />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
            Save processing logs
          </span>
        </label>
      </div>

      {/* Reset to Defaults */}
      <div className="pt-4 border-t border-slate-700/30">
        <button
          type="button"
          onClick={() => onConfigChange({
            gridSquareSize: 1.0,
            includeVisualizations: true,
            includeColorAnalysis: true,
            includeLateralLineAnalysis: true,
            saveResults: false,
            saveUploads: false,
            saveLogs: false
          })}
          disabled={disabled}
          className="w-full minimal-button text-sm"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}