'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import ImageUpload, { UploadedFile } from '@/components/upload/ImageUpload';
import AnalysisConfig from '@/components/analysis/AnalysisConfig';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import ImageModal from '@/components/ui/image-modal';
import GettingStarted from '@/components/ui/getting-started';
import { FishAnalysisResult, AnalysisConfig as AnalysisConfigType } from '@/lib/types';
import { uploadAndAnalyzeSingle } from '@/lib/api';
import { 
  Fish, 
  Activity, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle,
  Upload as UploadIcon,
  Settings,
  Eye,
  Zap
} from 'lucide-react';

export default function PhenotypingPage() {
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
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mono-bold">Fish Phenotyping Analysis</h1>
          <p className="text-gray-600 mt-2 sans-clean">Upload fish images and get detailed morphological measurements using AI-powered computer vision</p>
        </div>
        {/* Quick Stats Bar */}
        {analysisResult && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mono-bold">{analysisResult.measurements.length}</div>
                <div className="text-sm text-gray-600 mt-1 sans-clean">Measurements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mono-bold">{analysisResult.detailed_detections.length}</div>
                <div className="text-sm text-gray-600 mt-1 sans-clean">Detections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mono-bold">{analysisResult.processing_metadata.processing_time_seconds.toFixed(1)}s</div>
                <div className="text-sm text-gray-600 mt-1 sans-clean">Processing Time</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mono-bold ${analysisResult.status === 'completed' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {analysisResult.status === 'completed' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600 mt-1 sans-clean">Status</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Workflow - Step by Step */}
        <div className="space-y-8">
          {/* Step 1: Upload */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold mono-bold">1</div>
                  <h2 className="text-xl font-semibold text-gray-900 mono-bold">Upload Fish Image</h2>
                </div>
                {files.length > 0 && (
                  <div className="text-emerald-600 text-sm font-medium sans-clean">✓ Image uploaded</div>
                )}
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

          {/* Step 2: Configure */}
          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold mono-bold">2</div>
                  <h2 className="text-xl font-semibold text-gray-900 mono-bold">Configure Analysis</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <AnalysisConfig
                      config={config}
                      onConfigChange={setConfig}
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`px-12 py-6 rounded-xl font-bold text-lg transition-all duration-300 mono-bold ${
                        isAnalyzing
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center space-x-3">
                          <Activity className="w-6 h-6 animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Fish className="w-6 h-6" />
                          <span>Start Analysis</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Progress */}
          {isAnalyzing && (
            <div className="bg-white rounded-xl border border-sky-200 shadow-sm">
              <div className="p-6 border-b border-sky-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <Activity className="w-4 h-4 animate-spin" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mono-bold">Processing Analysis</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium sans-clean">
                      {currentStage || 'Initializing...'}
                    </span>
                    <span className="text-sky-600 font-bold mono-bold">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-3" />
                  <p className="text-sm text-gray-600 sans-clean">
                    Analysis typically takes 30-90 seconds depending on image complexity
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {analysisResult && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
                    <h2 className="text-xl font-semibold text-gray-900 mono-bold">Analysis Results</h2>
                  </div>
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors sans-clean font-medium"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Visualizations */}
                {analysisResult.visualization_paths && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 mono-bold">Visualizations</h3>
                    <div className="image-gallery">
                      {Object.entries(analysisResult.visualization_paths).map(([type, path]) => (
                        <div 
                          key={type} 
                          className="image-thumbnail"
                          onClick={() => setSelectedImage({
                            src: `http://localhost:8000/api/v1/analysis/result/${analysisResult.analysis_id}/visualization/${type}`,
                            alt: `${type} visualization`,
                            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`
                          })}
                        >
                          <img
                            src={`http://localhost:8000/api/v1/analysis/result/${analysisResult.analysis_id}/visualization/${type}`}
                            alt={`${type} visualization`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded sans-clean">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty State - Getting Started */}
        {!analysisResult && files.length === 0 && (
          <div className="mt-8">
            <GettingStarted />
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-8">
            <AnalysisResults 
              result={analysisResult}
              showVisualizations={false}
            />
          </div>
        )}
      </div>
      
      {/* Image Modal */}
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