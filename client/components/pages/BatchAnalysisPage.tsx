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
import { logger } from '@/lib/utils/logger';
import { getRecoverySuggestions } from '@/lib/utils/errorMessages';
import {
  PopulationStatsSkeleton,
  BatchResultsGridSkeleton
} from '@/components/ui/SkeletonLoaders';
import {
  AnalysisConfig as AnalysisConfigType,
  FishAnalysisResult
} from '@/lib/types';
import { getVisualizationUrl } from '@/lib/api';
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

function BadgeProgressState({ stage }: { stage: string }) {
  const map: Record<string, { text: string; color: string }> = {
    uploading: { text: 'Uploading', color: 'bg-neutral-100 text-neutral-800' },
    analyzing: { text: 'Analyzing', color: 'bg-neutral-100 text-neutral-800' },
  };
  const state = map[stage] || { text: stage, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-semibold tracking-wide ${state.color}`}>
      {state.text}
    </span>
  );
}

export default function BatchAnalysisPage() {
  // Core state
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [config, setConfig] = useState<AnalysisConfigType>({
    gridSquareSize: 1.0,
    includeVisualizations: true,
    includeColorAnalysis: true,
    includeLateralLineAnalysis: true,
    saveResults: false,
    saveUploads: false,
    saveLogs: false
  });

  // Use the performance-optimized batch analysis hook
  const {
    stage = 'idle',
    batchResult = null,
    currentBatchId = null,
    uploadProgress = null,
    analysisProgress = null,
    paginatedResults = null,
    error = null,
    retryCount = 0,
    isProcessing = false,
    isCompleted = false,
    hasFailed = false,
    canRetry = false,
    startBatchAnalysis = () => {},
    cancelAnalysis = () => {},
    loadResults = () => {},
    resetAnalysis = () => {}
  } = useBatchAnalysis({
    onStageChange: (stage) => {
      logger.debug('Stage changed to:', stage);
      perfMonitor.mark(`stage-${stage}`);
      if (stage === 'completed') {
        perfMonitor.measure('total-analysis-time', 'stage-uploading');
      }
    },
    onProgress: (uploadProgress, analysisProgress) => {
      logger.debug('Progress update:', { uploadProgress, analysisProgress });
    },
    onComplete: (result) => {
      logger.info('Batch analysis completed:', result);
    },
    onError: (error) => {
      logger.error('Batch analysis error:', error);
    }
  });

  // UI state
  const [showPopulationStats, setShowPopulationStats] = useState(true);
  const [modelInfo, setModelInfo] = useState<{ name: string; loaded: boolean } | undefined>(undefined);
  const [selectedResult, setSelectedResult] = useState<FishAnalysisResult | null>(null);

  // Handle batch analysis with performance monitoring
  const handleBatchAnalysis = async () => {
    logger.debug('handleBatchAnalysis clicked', { files: files.length, isProcessing, hasFailed });

    // Test backend connection first
    try {
      logger.debug('Testing backend connection...');
      const { healthCheck } = await import('@/lib/api');
      const health = await healthCheck();
      logger.info('Backend health check passed:', health);

      // Store model information for progress display
      setModelInfo({
        name: 'Model Loaded',
        loaded: health.model_loaded
      });
    } catch (healthError) {
      logger.error('Backend health check failed:', healthError);
      // Continue anyway, but warn user - still set model info as best guess
      setModelInfo({
        name: 'Model Loaded',
        loaded: false // Unknown, but likely loaded if analysis works
      });
    }

    logger.debug('About to call startBatchAnalysis with:', {
      filesLength: files.length,
      config,
      startBatchAnalysisType: typeof startBatchAnalysis,
      startBatchAnalysisExists: !!startBatchAnalysis
    });

    if (typeof startBatchAnalysis !== 'function') {
      logger.error('startBatchAnalysis is not a function!', startBatchAnalysis);
      return;
    }

    perfMonitor.mark('stage-uploading');

    try {
      logger.debug('Calling startBatchAnalysis...');
      await startBatchAnalysis(files, config);
      logger.info('startBatchAnalysis call completed');
    } catch (error) {
      logger.error('Error in startBatchAnalysis:', error);
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
      {/* Global compact progress ribbon */}
      {(stage === 'uploading' || stage === 'analyzing') && (
        <div className="fixed top-0 inset-x-0 z-50">
          <div className="mx-auto max-w-7xl">
            <div className="m-2 rounded-lg shadow-lg border border-gray-200 bg-white/95 backdrop-blur px-4 py-2">
              <div className="flex items-center gap-3">
                {stage === 'uploading' ? (
                  <UploadIcon className="w-4 h-4 text-black animate-pulse" />
                ) : (
                  <Activity className="w-4 h-4 text-black animate-spin" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <div className="truncate">
                      {stage === 'uploading' && (
                        <span>
                          Uploading {uploadProgress?.uploaded_files ?? 0}/{uploadProgress?.total_files ?? files.length}
                        </span>
                      )}
                      {stage === 'analyzing' && (
                        <span>
                          Analyzing {analysisProgress?.completed_images ?? 0}/{analysisProgress?.total_images ?? files.length}
                        </span>
                      )}
                    </div>
                    <div className="mono font-semibold">
                      {stage === 'uploading'
                        ? `${uploadProgress?.overall_progress ?? 0}%`
                        : `${analysisProgress?.progress_percent ?? 0}%`}
                    </div>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 bg-black`}
                      style={{ width: `${stage === 'uploading' ? (uploadProgress?.overall_progress ?? 0) : (analysisProgress?.progress_percent ?? 0)}%` }}
                    />
                  </div>
                </div>
                <BadgeProgressState stage={stage} />
              </div>
            </div>
          </div>
        </div>
      )}
      {(stage === 'uploading' || stage === 'analyzing') && <div className="h-14" />}
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mono-bold">Batch Fish Population Analysis</h1>
        <p className="text-gray-600 mt-2 sans-clean">
          Upload multiple fish images to get comprehensive population statistics and distribution analysis
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
              <div className="text-3xl font-bold text-gray-900 mono-bold">{batchResult.batch_analysis.completed_images}</div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mono-bold">
                {batchResult.batch_analysis.population_statistics.processing_time_average.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600 mt-1 sans-clean">Avg Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mono-bold">
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
                  files.length === 0 ? 'bg-black text-white' : 'bg-black text-white'
                }`}>
                  {files.length === 0 ? '1' : '✓'}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mono-bold">Upload Fish Images</h2>
              </div>
              {files.length > 0 && (
                <div className="text-neutral-800 text-sm font-medium sans-clean">
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
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-700 text-sm sans-clean">
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
                  stage === 'idle' ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
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
                      disabled={files.length < 2 || isProcessing}
                      className={`w-full px-12 py-6 rounded-xl font-bold text-lg transition-all duration-300 mono-bold relative z-10 cursor-pointer ${
                        isProcessing
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : hasFailed
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-black hover:bg-neutral-800 text-white shadow-sm'
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
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
                modelInfo={modelInfo}
              />
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-2 text-gray-600">Starting analysis...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Population Statistics */}
        {stage === 'completed' && batchResult && showPopulationStats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">✓</div>
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

        {/* Population Statistics Loading */}
        {stage === 'analyzing' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mono-bold">Preparing Population Statistics</h2>
              </div>
            </div>
            <div className="p-6">
              <PopulationStatsSkeleton />
            </div>
          </div>
        )}

        {/* Step 6: Individual Results */}
        {stage === 'completed' && paginatedResults && (
          <div className="space-y-4">
            <PaginatedResults
              results={paginatedResults.items}
              isLoading={false}
              onViewResult={(result) => setSelectedResult(result)}
              onDownloadResult={(result) => {
                logger.debug('Download result:', result);
              }}
            />
            {/* Simple pager controls to jump pages */}
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50"
                onClick={async () => {
                  try {
                    const { getBatchResultsPaginated } = await import('@/lib/api');
                    const next = await getBatchResultsPaginated(batchResult!.batch_analysis.batch_id, { page: paginatedResults.pagination.previous_page || 1 });
                    // naive: just replace via state if needed later
                  } catch {}
                }}
              >
                Prev
              </button>
              <button
                className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50"
                onClick={async () => {
                  try {
                    const { getBatchResultsPaginated } = await import('@/lib/api');
                    const next = await getBatchResultsPaginated(batchResult!.batch_analysis.batch_id, { page: paginatedResults.pagination.next_page || 1 });
                    // naive: just replace via state if needed later
                  } catch {}
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Individual Results Loading */}
        {stage === 'analyzing' && analysisProgress && analysisProgress.progress_percent > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-5 h-5 text-gray-600 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mono-bold">Loading Individual Results</h3>
              </div>
              <BatchResultsGridSkeleton count={6} />
            </div>
          </div>
        )}

        {/* Error Display */}
        {hasFailed && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800 mono-bold">Analysis Failed</h3>
            </div>

            {/* Error message */}
            <div className="mb-4">
              <p className="text-red-700 font-medium sans-clean mb-2">{error}</p>
            </div>

            {/* Recovery suggestions */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-red-800 mb-2 mono-bold">What you can try:</p>
              <ul className="space-y-1">
                {getRecoverySuggestions({ detail: error }).map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start gap-2 sans-clean">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {canRetry && (
                <button
                  onClick={handleBatchAnalysis}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium mono-bold"
                >
                  Try Again ({retryCount}/{3})
                </button>
              )}
              <button
                onClick={handleResetAnalysis}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium mono-bold"
              >
                Start Over
              </button>
            </div>
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
        {selectedResult && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedResult(null)}
          >
            <div className="relative max-w-6xl w-full bg-white rounded-xl border border-neutral-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <div>
                  <div className="text-sm text-neutral-600">Analysis ID</div>
                  <div className="text-neutral-900 mono-bold text-lg truncate max-w-[70vw]">{selectedResult.analysis_id}</div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="w-10 h-10 rounded-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-neutral-700 mono-bold">Detailed View</div>
                  <div className="relative border border-neutral-200 rounded-lg overflow-hidden">
                    <img
                      src={getVisualizationUrl(selectedResult.analysis_id, 'detailed')}
                      alt="Detailed visualization"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-neutral-700 mono-bold">Measurements View</div>
                  <div className="relative border border-neutral-200 rounded-lg overflow-hidden">
                    <img
                      src={getVisualizationUrl(selectedResult.analysis_id, 'measurements')}
                      alt="Measurements visualization"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-neutral-900 hover:bg-neutral-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State - Getting Started */}
      {stage === 'idle' && files.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 mt-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
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
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                  <UploadIcon className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Bulk Upload</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Upload multiple fish images at once for efficient batch processing
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Population Stats</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Get detailed statistical analysis of your fish population measurements
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mono-bold mb-2">Distribution Analysis</h3>
                  <p className="text-gray-600 text-sm sans-clean leading-relaxed">
                    Visualize size distributions, correlations, and population insights
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-black" />
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