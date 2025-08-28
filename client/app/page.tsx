/**
 * Single Image Analysis Page - Main page of the OctaPulse application
 */

'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ImageUpload, { UploadedFile } from '@/components/upload/ImageUpload';
import AnalysisConfig from '@/components/analysis/AnalysisConfig';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { FishAnalysisResult, AnalysisConfig as AnalysisConfigType } from '@/lib/types';
import { uploadAndAnalyzeSingle } from '@/lib/api';
import { Fish, Zap, Activity } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [config, setConfig] = useState<AnalysisConfigType>({
    gridSquareSize: 1.0,
    includeVisualizations: true,
    includeColorAnalysis: true,
    includeLateralLineAnalysis: true
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FishAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('');

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error('Please upload an image first');
      return;
    }

    const file = files[0].file;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    try {
      const result = await uploadAndAnalyzeSingle(
        file,
        config,
        (stage) => {
          setCurrentStage(stage);
          switch (stage) {
            case 'Uploading image...':
              setAnalysisProgress(20);
              break;
            case 'Analyzing fish...':
              setAnalysisProgress(60);
              break;
            case 'Analysis complete!':
              setAnalysisProgress(100);
              break;
          }
        }
      );

      setAnalysisResult(result);
      
      if (result.status === 'completed') {
        toast.success('Fish analysis completed successfully!');
      } else {
        toast.error('Analysis failed: ' + (result.error_message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed: ' + (error.detail || error.message || 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
      setCurrentStage('');
      setAnalysisProgress(0);
    }
  };

  const resetAnalysis = () => {
    setFiles([]);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setCurrentStage('');
  };

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-4 float">
          <div className="relative">
            <Fish className="w-12 h-12 text-sky-400 pulse-glow" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text tech-mono tracking-tight">
            FISH ANALYSIS
          </h1>
        </div>
        
        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Upload fish images for <span className="text-sky-400 font-semibold">comprehensive analysis</span> including measurements, 
          anatomical detection, and color analysis using <span className="text-emerald-400 font-semibold">advanced computer vision</span>.
        </p>
        
        <div className="flex items-center justify-center space-x-8 text-sm text-slate-400 tech-mono">
          <div className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/30 border border-slate-700/50 hover:border-sky-500/50 transition-all duration-300">
            <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse group-hover:scale-110 transition-transform"></div>
            <span className="group-hover:text-sky-400 transition-colors">YOLO Segmentation</span>
          </div>
          <div className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:scale-110 transition-transform"></div>
            <span className="group-hover:text-emerald-400 transition-colors">Grid Calibration</span>
          </div>
          <div className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse group-hover:scale-110 transition-transform"></div>
            <span className="group-hover:text-cyan-400 transition-colors">Real-time Processing</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Upload & Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload */}
          <ImageUpload
            mode="single"
            files={files}
            onFilesChange={setFiles}
            disabled={isAnalyzing}
          />

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="enhanced-card neon-border">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 text-sky-400 animate-spin" />
                    <span className="font-semibold text-white tech-mono text-lg">
                      {currentStage || 'Processing...'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 tech-mono text-sm">Progress</span>
                      <span className="text-emerald-400 tech-mono text-sm font-bold">{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500 relative"
                        style={{ width: `${analysisProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full animate-pulse opacity-75"></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 tech-mono">
                    Processing may take a few minutes depending on image complexity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Controls */}
          <div className="enhanced-card">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Zap className="w-6 h-6 text-emerald-400 pulse-glow" />
                <h3 className="text-xl font-bold text-white tech-mono">ANALYSIS CONTROLS</h3>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || isAnalyzing}
                  className={`w-full py-4 px-6 rounded-xl font-bold tech-mono text-lg transition-all duration-300 ${
                    files.length === 0 || isAnalyzing
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'gradient-btn text-white hover:scale-105'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Activity className="w-5 h-5 animate-spin" />
                      <span>ANALYZING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Fish className="w-5 h-5" />
                      <span>ANALYZE FISH</span>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={resetAnalysis}
                  disabled={isAnalyzing}
                  className={`w-full py-3 px-4 rounded-lg font-semibold tech-mono text-sm transition-all duration-300 ${
                    isAnalyzing
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  RESET ANALYSIS
                </button>
              </div>
              
              {files.length === 0 && (
                <div className="mt-4 text-center">
                  <p className="text-slate-400 tech-mono text-sm">
                    Upload an image to begin analysis
                  </p>
                  <div className="mt-2 flex justify-center">
                    <div className="w-8 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Configuration */}
        <div className="space-y-6">
          <AnalysisConfig
            config={config}
            onConfigChange={setConfig}
            disabled={isAnalyzing}
          />

          {/* Quick Stats */}
          {analysisResult && (
            <div className="enhanced-card">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-white tech-mono">ANALYSIS STATS</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 tech-mono text-sm">Status</span>
                    <span className={`tech-mono text-sm font-bold ${
                      analysisResult.status === 'completed' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {analysisResult.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 tech-mono text-sm">Measurements</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                      <span className="tech-mono text-sm font-bold text-white">{analysisResult.measurements.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 tech-mono text-sm">Detections</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="tech-mono text-sm font-bold text-white">{analysisResult.detailed_detections.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 tech-mono text-sm">Processing Time</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                      <span className="tech-mono text-sm font-bold text-cyan-400">
                        {analysisResult.processing_metadata.processing_time_seconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8">
          <AnalysisResults 
            result={analysisResult}
            showVisualizations={true}
          />
        </div>
      )}

      {/* Getting Started */}
      {!analysisResult && files.length === 0 && (
        <div className="enhanced-card grid-lines relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5"></div>
          <div className="relative p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Fish className="w-16 h-16 text-sky-400 pulse-glow float" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold gradient-text tech-mono">
                  GETTING STARTED
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-500/25">
                    <span className="text-white font-bold text-lg tech-mono">1</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold tech-mono">UPLOAD IMAGE</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Drag and drop or select a fish image with a visible grid pattern for accurate calibration
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                    <span className="text-white font-bold text-lg tech-mono">2</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold tech-mono">CONFIGURE</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Adjust grid square size and analysis parameters to match your specific requirements
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
                    <span className="text-white font-bold text-lg tech-mono">3</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-bold tech-mono">ANALYZE</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Get comprehensive measurements, anatomical detection, and detailed analysis results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
