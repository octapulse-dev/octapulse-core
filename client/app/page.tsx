/**
 * Professional Dashboard - Main page of the OctaPulse application
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
import ImageModal from '@/components/ui/image-modal';
import { FishAnalysisResult, AnalysisConfig as AnalysisConfigType } from '@/lib/types';
import { uploadAndAnalyzeSingle } from '@/lib/api';
import { 
  Fish, 
  Zap, 
  Activity, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle,
  Upload as UploadIcon,
  Settings,
  Eye
} from 'lucide-react';

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
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);

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
    <>
      <div className="min-h-screen bg-transparent">
        {/* Dashboard Header */}
        <div className="h-16 bg-white/5 backdrop-blur-md border-b border-slate-700/30 sticky top-0 z-40" style={{background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.02) 0%, rgba(226, 232, 240, 0.01) 100%)'}}>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center pulse-glow">
                  <Fish className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">OctaPulse</h1>
                  <p className="text-xs text-slate-400">Fish Analysis Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {analysisResult && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="status-indicator success">
                    <div className="dot"></div>
                    <span>Analysis Complete</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          {!analysisResult && files.length === 0 && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-slate-400 text-sm font-medium">Images Uploaded</p>
                  </div>
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                    <UploadIcon className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">Ready</p>
                    <p className="text-slate-400 text-sm font-medium">System Status</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">AI</p>
                    <p className="text-slate-400 text-sm font-medium">Analysis Engine</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-violet-400">YOLOv8</p>
                    <p className="text-slate-400 text-sm font-medium">Model Version</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Analysis Stats */}
          {analysisResult && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{analysisResult.measurements.length}</p>
                    <p className="text-slate-400 text-sm font-medium">Measurements</p>
                  </div>
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{analysisResult.detailed_detections.length}</p>
                    <p className="text-slate-400 text-sm font-medium">Detections</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{analysisResult.processing_metadata.processing_time_seconds.toFixed(1)}s</p>
                    <p className="text-slate-400 text-sm font-medium">Processing Time</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${analysisResult.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}`}>{analysisResult.status === 'completed' ? 'Success' : 'Error'}</p>
                    <p className="text-slate-400 text-sm font-medium">Analysis Status</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${analysisResult.status === 'completed' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    <CheckCircle className={`w-5 h-5 ${analysisResult.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Upload & Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image Upload */}
              <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
                <div className="p-6 border-b border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <UploadIcon className="w-5 h-5 text-sky-400" />
                    <h2 className="text-lg font-semibold text-white">Upload Image</h2>
                  </div>
                </div>
                <div className="p-6">
                  <ImageUpload
                    mode="single"
                    files={files}
                    onFilesChange={setFiles}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              {/* Analysis Controls */}
              <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
                <div className="p-6 border-b border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-white">Analysis Controls</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={files.length === 0 || isAnalyzing}
                    className={`w-full py-4 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                      files.length === 0 || isAnalyzing
                        ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                        : 'minimal-button primary'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Fish className="w-4 h-4" />
                        <span>Analyze Fish</span>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={resetAnalysis}
                    disabled={isAnalyzing}
                    className="w-full minimal-button"
                  >
                    Reset Analysis
                  </button>
                  
                  {files.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-slate-400 text-sm">
                        Upload an image to begin analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Middle Column - Configuration */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
                <div className="p-6 border-b border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Configuration</h2>
                  </div>
                </div>
                <div className="p-6">
                  <AnalysisConfig
                    config={config}
                    onConfigChange={setConfig}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Progress & Visualizations */}
            <div className="lg:col-span-5 space-y-6">
              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="bg-white/5 backdrop-blur-sm border border-sky-500/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-5 h-5 text-sky-400 animate-spin" />
                      <h3 className="text-lg font-semibold text-white">
                        {currentStage || 'Processing...'}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-sky-400 font-semibold">{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                      <p className="text-xs text-slate-400">
                        Processing may take a few minutes depending on image complexity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Visualizations Preview */}
              {analysisResult?.visualization_paths && (
                <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
                  <div className="p-6 border-b border-slate-700/30">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-violet-400" />
                      <h2 className="text-lg font-semibold text-white">Visualizations</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="image-gallery">
                      {Object.entries(analysisResult.visualization_paths).map(([type, path]) => (
                        <div 
                          key={type} 
                          className="image-thumbnail"
                          onClick={() => setSelectedImage({
                            src: `http://localhost:8000/api/v1/analysis/${analysisResult.analysis_id}/visualization/${type}`,
                            alt: `${type} visualization`,
                            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`
                          })}
                        >
                          <img
                            src={`http://localhost:8000/api/v1/analysis/${analysisResult.analysis_id}/visualization/${type}`}
                            alt={`${type} visualization`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </div>
                      ))}
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
                showVisualizations={false}
              />
            </div>
          )}

          {/* Getting Started Guide */}
          {!analysisResult && files.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px] mt-8">
              <div className="p-8">
                <div className="text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Fish className="w-16 h-16 text-sky-400 float" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Get Started with Fish Analysis
                    </h3>
                    <p className="text-slate-400">
                      Upload your first fish image to begin comprehensive AI-powered analysis
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto border border-sky-500/30">
                        <span className="text-sky-400 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Upload Image</h4>
                        <p className="text-slate-400 text-sm">
                          Select a fish image with visible grid pattern
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Configure</h4>
                        <p className="text-slate-400 text-sm">
                          Adjust grid size and analysis parameters
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto border border-violet-500/30">
                        <span className="text-violet-400 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Analyze</h4>
                        <p className="text-slate-400 text-sm">
                          Get detailed measurements and visualizations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Expansion Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          title={selectedImage.title}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}