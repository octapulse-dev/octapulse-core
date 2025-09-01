import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  ComprehensiveBatchResult,
  BatchUploadProgress,
  AnalysisProgress,
  AnalysisConfig,
  PaginatedResults,
  FishAnalysisResult,
  BatchResultsQuery
} from '@/lib/types';
import { 
  uploadAndAnalyzeBatchEnhanced, 
  getBatchResultsPaginated,
  cancelBatchAnalysis 
} from '@/lib/api';
import { UploadedFile } from '@/components/upload/ImageUpload';

type AnalysisStage = 'idle' | 'uploading' | 'analyzing' | 'completed' | 'failed';

interface UseBatchAnalysisOptions {
  onStageChange?: (stage: AnalysisStage) => void;
  onProgress?: (uploadProgress: BatchUploadProgress | null, analysisProgress: AnalysisProgress | null) => void;
  onComplete?: (result: ComprehensiveBatchResult) => void;
  onError?: (error: any) => void;
}

export function useBatchAnalysis(options: UseBatchAnalysisOptions = {}) {
  // Core state
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [batchResult, setBatchResult] = useState<ComprehensiveBatchResult | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

  // Progress state
  const [uploadProgress, setUploadProgress] = useState<BatchUploadProgress | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  // Results state
  const [paginatedResults, setPaginatedResults] = useState<PaginatedResults<FishAnalysisResult> | null>(null);
  const [resultsQuery, setResultsQuery] = useState<BatchResultsQuery>({
    page: 1,
    per_page: 12,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // References for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isComponentMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stage change handler
  const updateStage = useCallback((newStage: AnalysisStage) => {
    if (!isComponentMountedRef.current) return;
    setStage(newStage);
    options.onStageChange?.(newStage);
  }, [options.onStageChange]);

  // Progress handler
  const updateProgress = useCallback((upload: BatchUploadProgress | null, analysis: AnalysisProgress | null) => {
    if (!isComponentMountedRef.current) return;
    setUploadProgress(upload);
    setAnalysisProgress(analysis);
    options.onProgress?.(upload, analysis);
  }, [options.onProgress]);

  // Start batch analysis with error handling and retries
  const startBatchAnalysis = useCallback(async (
    files: UploadedFile[],
    config: AnalysisConfig
  ) => {
    console.log('🎯 startBatchAnalysis called!', { mounted: isComponentMountedRef.current, filesCount: files.length });
    
    if (!isComponentMountedRef.current) {
      console.warn('⚠️ Component not mounted, aborting batch analysis');
      return;
    }

    console.log('🚀 Starting batch analysis with', files.length, 'files');

    // Validation
    if (files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (files.length < 2) {
      toast.error('Batch analysis requires at least 2 images for population statistics');
      return;
    }

    // Reset state
    setError(null);
    setRetryCount(0);
    updateStage('uploading');
    updateProgress(null, null);
    setBatchResult(null);
    setCurrentBatchId(null);
    setPaginatedResults(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      console.log('📤 Starting upload and analysis...', {
        filesCount: files.length,
        config,
        stage
      });
      const result = await uploadAndAnalyzeBatchEnhanced(
        files.map(f => f.file),
        config,
        (progress) => {
          if (!isComponentMountedRef.current) return;
          console.log('📊 Upload progress:', progress.overall_progress + '%');
          updateProgress(progress, null);
          if (progress.overall_progress >= 100) {
            console.log('✅ Upload completed, starting analysis...');
            updateStage('analyzing');
          }
        },
        (progress) => {
          if (!isComponentMountedRef.current) return;
          console.log('🔬 Analysis progress:', progress.progress_percent + '%');
          updateProgress(null, progress);
          setCurrentBatchId(progress.batch_id);
        }
      );

      if (!isComponentMountedRef.current) return;

      setBatchResult(result);
      setCurrentBatchId(result.batch_analysis.batch_id);
      updateStage('completed');
      
      // Load first page of results
      try {
        const firstPageResults = await getBatchResultsPaginated(
          result.batch_analysis.batch_id, 
          resultsQuery
        );
        if (isComponentMountedRef.current) {
          setPaginatedResults(firstPageResults);
        }
      } catch (paginationError) {
        console.warn('Failed to load paginated results:', paginationError);
        // Don't fail the entire analysis for pagination issues
      }

      options.onComplete?.(result);
      toast.success(`Batch analysis completed! Processed ${result.batch_analysis.completed_images} out of ${result.batch_analysis.total_images} images.`);

    } catch (error: any) {
      if (!isComponentMountedRef.current) return;

      console.error('❌ Batch analysis error details:', {
        error,
        message: error?.message,
        status: error?.status_code,
        detail: error?.detail,
        response: error?.response?.data
      });
      
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        updateStage('idle');
        toast.info('Analysis cancelled');
        return;
      }

      // Handle retryable errors
      const isRetryable = error.status_code === 500 || error.status_code === 502 || error.status_code === 503;
      
      if (isRetryable && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        toast.error(`Analysis failed, retrying... (${retryCount + 1}/${maxRetries})`);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          if (isComponentMountedRef.current) {
            startBatchAnalysis(files, config);
          }
        }, delay);
        return;
      }

      const errorMessage = error.detail || error.message || 'Unknown error';
      setError(errorMessage);
      updateStage('failed');
      options.onError?.(error);
      toast.error('Batch analysis failed: ' + errorMessage);
    }
  }, [resultsQuery, retryCount, updateStage, updateProgress, options]);

  // Cancel analysis
  const cancelAnalysis = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (currentBatchId && (stage === 'uploading' || stage === 'analyzing')) {
      try {
        await cancelBatchAnalysis(currentBatchId);
        toast.info('Analysis cancelled successfully');
      } catch (error) {
        console.warn('Failed to cancel analysis on server:', error);
      }
    }

    updateStage('idle');
    setError(null);
    updateProgress(null, null);
    setCurrentBatchId(null);
  }, [currentBatchId, stage, updateStage, updateProgress]);

  // Load results with error handling
  const loadResults = useCallback(async (query: BatchResultsQuery) => {
    if (!currentBatchId || !isComponentMountedRef.current) return;
    
    try {
      const results = await getBatchResultsPaginated(currentBatchId, query);
      if (isComponentMountedRef.current) {
        setPaginatedResults(results);
        setResultsQuery(query);
      }
    } catch (error: any) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load results: ' + (error.detail || error.message));
    }
  }, [currentBatchId]);

  // Reset analysis
  const resetAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setStage('idle');
    setBatchResult(null);
    setCurrentBatchId(null);
    setUploadProgress(null);
    setAnalysisProgress(null);
    setPaginatedResults(null);
    setError(null);
    setRetryCount(0);
    setResultsQuery({
      page: 1,
      per_page: 12,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  }, []);

  return {
    // State
    stage,
    batchResult,
    currentBatchId,
    uploadProgress,
    analysisProgress,
    paginatedResults,
    resultsQuery,
    error,
    retryCount,
    
    // Actions
    startBatchAnalysis,
    cancelAnalysis,
    loadResults,
    resetAnalysis,
    
    // Computed state
    isProcessing: stage === 'uploading' || stage === 'analyzing',
    isCompleted: stage === 'completed',
    hasFailed: stage === 'failed',
    canRetry: stage === 'failed' && retryCount < maxRetries,
  };
}