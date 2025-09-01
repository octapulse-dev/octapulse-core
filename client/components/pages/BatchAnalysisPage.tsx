'use client';

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import ImageUpload, { UploadedFile } from '@/components/upload/ImageUpload';
import AnalysisConfig from '@/components/analysis/AnalysisConfig';
import { PopulationStatisticsDisplay } from '@/components/analysis/PopulationStatisticsDisplay';
import { PaginatedResults } from '@/components/analysis/PaginatedResults';
import { BatchProgressTracker, UploadProgressTracker } from '@/components/analysis/ProgressTrackers';
import { DownloadCenter } from '@/components/analysis/DownloadCenter';
import { useBatchAnalysis } from '@/lib/hooks/useBatchAnalysis';
import { perfMonitor } from '@/lib/utils/performance';
import { 
  AnalysisConfig as AnalysisConfigType
} from '@/lib/types';
import { 
  Fish, 
  Activity, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle,
  Upload as UploadIcon,
  Settings,
  TrendingUp,
  Download,
  Filter,
  Search,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function BatchAnalysisPage() {
  // Core state
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [config, setConfig] = useState<AnalysisConfigType>({
    gridSquareSize: 1.0,
    includeVisualizations: true,
    includeColorAnalysis: true,
    includeLateralLineAnalysis: true
  });

  // Use the performance-optimized batch analysis hook
  const {
    stage,
    batchResult,
    uploadProgress,
    analysisProgress,
    paginatedResults,
    error,
    retryCount,
    isProcessing,
    isCompleted,
    hasFailed,
    canRetry,
    startBatchAnalysis,
    cancelAnalysis,
    loadResults,
    resetAnalysis
  } = useBatchAnalysis({
    onStageChange: (stage) => {
      console.log('🔄 Stage changed to:', stage);
      perfMonitor.mark(`stage-${stage}`);
      if (stage === 'completed') {
        perfMonitor.measure('total-analysis-time', 'stage-uploading');
      }
    },
    onProgress: (uploadProgress, analysisProgress) => {
      console.log('📈 Progress update:', { uploadProgress, analysisProgress });
    },
    onComplete: (result) => {
      console.log('✅ Batch analysis completed:', result);
    },
    onError: (error) => {
      console.error('❌ Batch analysis error:', error);
    }
  });

  // UI state
  const [showPopulationStats, setShowPopulationStats] = useState(true);

  // Handle batch analysis with performance monitoring
  const handleBatchAnalysis = async () => {
    console.log('🚀 handleBatchAnalysis clicked!', { files: files.length, isProcessing, hasFailed });
    
    // Test backend connection first
    try {
      console.log('🏥 Testing backend connection...');
      const { healthCheck } = await import('@/lib/api');
      const health = await healthCheck();
      console.log('✅ Backend health check passed:', health);
    } catch (healthError) {
      console.error('❌ Backend health check failed:', healthError);
      // Continue anyway, but warn user
    }
    
    console.log('📊 About to call startBatchAnalysis with:', { 
      filesLength: files.length, 
      config,
      startBatchAnalysisType: typeof startBatchAnalysis,
      startBatchAnalysisExists: !!startBatchAnalysis
    });
    
    if (typeof startBatchAnalysis !== 'function') {
      console.error('❌ startBatchAnalysis is not a function!', startBatchAnalysis);
      return;
    }
    
    perfMonitor.mark('stage-uploading');
    
    try {
      console.log('🚀 Calling startBatchAnalysis...');
      await startBatchAnalysis(files, config);
      console.log('✅ startBatchAnalysis call completed');
    } catch (error) {
      console.error('❌ Error in startBatchAnalysis:', error);
    }
  };

  // Handle analysis cancellation
  const handleCancelAnalysis = () => {
    cancelAnalysis();
    setFiles([]); // Clear files on cancel
  };

  // Handle reset with file cleanup
  const handleResetAnalysis = () => {
    resetAnalysis();
    setFiles([]);
    perfMonitor.clear();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mono-bold">Batch Fish Population Analysis</h1>
        <p className="text-gray-600 mt-2 sans-clean">
          Upload multiple fish images to get comprehensive population statistics and distribution analysis
        </p>
      </div>

      {/* Debug Info - Remove After Testing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-yellow-800 mb-2">Debug Info (Remove After Testing)</h3>
        <p className="text-sm text-yellow-700">
          Files: {files.length} | Processing: {isProcessing.toString()} | Failed: {hasFailed.toString()} | 
          Stage: {stage} | Can Enable Button: {(files.length >= 2 && !isProcessing).toString()}
        </p>
        <p className="text-sm text-yellow-700">
          Upload Progress: {uploadProgress ? `${uploadProgress.overall_progress}%` : 'null'} | 
          Analysis Progress: {analysisProgress ? `${analysisProgress.progress_percent}%` : 'null'} |
          Batch ID: {currentBatchId || 'none'}
        </p>
      </div>

      {/* Summary Stats */}
      {batchResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mono-bold">{batchResult.batch_analysis.total_images}</div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mono-bold">{batchResult.batch_analysis.completed_images}</div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mono-bold">
                {batchResult.batch_analysis.population_statistics.processing_time_average.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Avg Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mono-bold">
                {(batchResult.batch_analysis.population_statistics.quality_metrics.average_detection_confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Avg Confidence</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workflow */}
      <div className="space-y-8">
        {/* Step 1: Upload Multiple Images */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mono-bold ${
                  files.length === 0 ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {files.length === 0 ? '1' : '✓'}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mono-bold">Upload Fish Images</h2>
              </div>
              {files.length > 0 && (
                <div className="text-emerald-600 text-sm font-medium sans-clean">
                  ✓ {files.length} images uploaded
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            <ImageUpload
              mode="batch"
              files={files}
              onFilesChange={setFiles}
              disabled={stage === 'uploading' || stage === 'analyzing'}
              maxFiles={100}
            />
            {files.length > 0 && files.length < 2 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm sans-clean">
                  <strong>Note:</strong> Batch analysis requires at least 2 images for meaningful population statistics. 
                  Current: {files.length} image{files.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Configure Analysis */}
        {files.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mono-bold ${
                  stage === 'idle' ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mono-bold">Configure Batch Analysis</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <AnalysisConfig
                    config={config}
                    onConfigChange={setConfig}
                    disabled={stage === 'uploading' || stage === 'analyzing'}
                  />
                </div>
                <div className="flex items-center justify-center relative">
                  <div className="space-y-4 w-full max-w-md">
                    <button
                      onClick={handleBatchAnalysis}
                      onMouseDown={() => console.log('🔥 Button mouse down')}
                      onMouseUp={() => console.log('🔥 Button mouse up')}
                      disabled={files.length < 2 || isProcessing}
                      className={`w-full px-12 py-6 rounded-xl font-bold text-lg transition-all duration-300 mono-bold relative z-10 cursor-pointer ${
                        isProcessing
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : hasFailed
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                      style={{ pointerEvents: files.length < 2 || isProcessing ? 'none' : 'auto' }}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center space-x-3">
                          <Activity className="w-6 h-6 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : hasFailed ? (
                        <div className="flex items-center justify-center space-x-3">
                          <AlertCircle className="w-6 h-6" />
                          <span>{canRetry ? `Retry Analysis (${retryCount}/${3})` : 'Analysis Failed'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <TrendingUp className="w-6 h-6" />
                          <span>Start Batch Analysis</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Test Button for Click Detection */}
                    <button
                      onClick={() => console.log('🧪 Test button clicked!')}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Test Click (Remove After Debug)
                    </button>

                    {/* Cancel Button During Processing */}
                    {isProcessing && (
                      <button
                        onClick={handleCancelAnalysis}
                        className="w-full px-6 py-3 rounded-lg font-medium text-sm border border-red-200 text-red-700 hover:bg-red-50 transition-colors mono-bold"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Analysis</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Progress */}
        {stage === 'uploading' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Progress</h3>
            {uploadProgress ? (
              <UploadProgressTracker 
                progress={uploadProgress} 
                isVisible={true} 
              />
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Preparing upload...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Analysis Progress */}
        {stage === 'analyzing' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Progress</h3>
            {analysisProgress ? (
              <BatchProgressTracker 
                progress={analysisProgress} 
                isVisible={true} 
              />
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Starting analysis...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Population Statistics */}
        {batchResult && showPopulationStats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
                  <h2 className="text-xl font-semibold text-gray-900 mono-bold">Population Statistics & Analysis</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleResetAnalysis}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors sans-clean font-medium"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PopulationStatisticsDisplay 
                statistics={batchResult.batch_analysis.population_statistics}
                visualizationUrls={batchResult.batch_analysis.visualization_urls}
              />
            </div>
          </div>
        )}

        {/* Step 6: Individual Results */}
        {paginatedResults && (
          <PaginatedResults 
            results={paginatedResults.items}
            isLoading={false}
            onViewResult={(result) => {
              console.log('View result:', result);
              // TODO: Implement result detail view
            }}
            onDownloadResult={(result) => {
              console.log('Download result:', result);
              // TODO: Implement individual result download
            }}
          />
        )}

        {/* Error Display */}
        {hasFailed && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800 mono-bold">Analysis Failed</h3>
            </div>
            <p className="text-red-700 mb-4 sans-clean">{error}</p>
            {canRetry && (
              <button
                onClick={handleBatchAnalysis}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again ({retryCount}/{3})
              </button>
            )}
          </div>
        )}

        {/* Download Center */}
        {batchResult && (
          <DownloadCenter 
            batchId={batchResult.batch_analysis.batch_id}
            downloadUrls={batchResult.download_urls}
            isVisible={true}
          />
        )}
      </div>

      {/* Empty State - Getting Started */}
      {stage === 'idle' && files.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 mt-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mono-bold mb-2">
                Population Analysis Ready
              </h2>
              <p className="text-lg text-gray-600 sans-clean max-w-2xl mx-auto">
                Upload multiple fish images to get comprehensive population statistics, size distributions, 
                and morphological analysis across your entire sample
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto">
                  <UploadIcon className="w-8 h-8 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Bulk Upload</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Upload multiple fish images at once for efficient batch processing
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Population Stats</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Get detailed statistical analysis of your fish population measurements
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Distribution Analysis</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Visualize size distributions, correlations, and population insights
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Export Results</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Download comprehensive reports, visualizations, and raw data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}