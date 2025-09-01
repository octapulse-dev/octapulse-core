/**
 * API client for the OctaPulse aquaculture analysis platform
 */

import axios, { AxiosResponse, AxiosError } from 'axios';
import { 
  FishAnalysisResult, 
  BatchAnalysisResult, 
  UploadResponse, 
  BatchUploadResponse,
  ApiError,
  AnalysisConfig,
  BatchAnalysisResultEnhanced,
  PopulationStatistics,
  PaginatedResults,
  BatchResultsQuery,
  ComprehensiveBatchResult,
  UploadProgress,
  BatchUploadProgress,
  AnalysisProgress
} from './types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Transform axios errors to our ApiError format
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      detail: responseData?.detail || error.message || 'Unknown API error',
      status_code: error.response?.status
    };
    
    return Promise.reject(apiError);
  }
);

/**
 * Upload single image for analysis
 */
export async function uploadSingleImage(
  file: File,
  config: AnalysisConfig
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('grid_square_size', config.gridSquareSize.toString());
  formData.append('include_visualizations', config.includeVisualizations.toString());

  const response: AxiosResponse<UploadResponse> = await apiClient.post(
    '/upload/single',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Upload multiple images for batch analysis
 */
export async function uploadBatchImages(
  files: File[],
  config: AnalysisConfig
): Promise<BatchUploadResponse> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  formData.append('grid_square_size', config.gridSquareSize.toString());
  formData.append('include_visualizations', config.includeVisualizations.toString());

  const response: AxiosResponse<BatchUploadResponse> = await apiClient.post(
    '/upload/batch',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for batch uploads
    }
  );

  return response.data;
}

/**
 * Analyze single image
 */
export async function analyzeSingleImage(
  imagePath: string,
  config: AnalysisConfig
): Promise<FishAnalysisResult> {
  const response: AxiosResponse<FishAnalysisResult> = await apiClient.post(
    '/analysis/single',
    {
      image_path: imagePath,
      grid_square_size_inches: config.gridSquareSize,
      include_visualizations: config.includeVisualizations,
      include_color_analysis: config.includeColorAnalysis,
      include_lateral_line_analysis: config.includeLateralLineAnalysis,
    },
    {
      timeout: 120000, // 2 minutes for analysis
    }
  );

  return response.data;
}

/**
 * Start batch analysis
 */
export async function startBatchAnalysis(
  imagePaths: string[],
  config: AnalysisConfig,
  batchId?: string
): Promise<{ message: string; batch_id: string; status_check_url: string }> {
  console.log('🔬 startBatchAnalysis called with', imagePaths.length, 'images, batchId:', batchId);
  
  const payload: any = {
    images: imagePaths,
    grid_square_size_inches: config.gridSquareSize,
    include_visualizations: config.includeVisualizations,
  };

  // If we have a batch_id from upload, include it
  if (batchId) {
    payload.batch_id = batchId;
  }

  console.log('📡 Sending batch analysis request:', payload);
  const response = await apiClient.post('/analysis/batch', payload);
  console.log('✅ Batch analysis response:', response.data);
  return response.data;
}

/**
 * Get batch analysis status
 */
export async function getBatchStatus(batchId: string): Promise<{
  batch_id: string;
  status: string;
  total_images: number;
  completed_images: number;
  failed_images: number;
  progress_percent: number;
  results: FishAnalysisResult[];
}> {
  const response = await apiClient.get(`/analysis/batch/${batchId}/status`);
  return response.data;
}

/**
 * Get batch analysis results
 */
export async function getBatchResults(batchId: string): Promise<BatchAnalysisResult> {
  const response: AxiosResponse<BatchAnalysisResult> = await apiClient.get(
    `/analysis/batch/${batchId}/results`
  );

  return response.data;
}

/**
 * Get visualization image URL
 */
export function getVisualizationUrl(analysisId: string, vizType: 'detailed' | 'measurements'): string {
  return `${API_BASE_URL}${API_VERSION}/analysis/result/${analysisId}/visualization/${vizType}`;
}

/**
 * Cancel batch analysis
 */
export async function cancelBatchAnalysis(batchId: string): Promise<{
  message: string;
  batch_id: string;
  status: string;
}> {
  const response = await apiClient.delete(`/analysis/batch/${batchId}`);
  return response.data;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  api_version: string;
  model_loaded: boolean;
}> {
  const response = await apiClient.get('/health', {
    baseURL: API_BASE_URL, // Use base URL without /api/v1
  });
  return response.data;
}

/**
 * Upload and analyze single image (combined operation)
 */
export async function uploadAndAnalyzeSingle(
  file: File,
  config: AnalysisConfig,
  onProgress?: (stage: string) => void
): Promise<FishAnalysisResult> {
  try {
    onProgress?.('Uploading image...');
    const uploadResult = await uploadSingleImage(file, config);
    
    if (!uploadResult.file_info?.file_path) {
      throw new Error('Upload failed - no file path returned');
    }
    
    onProgress?.('Analyzing fish...');
    const analysisResult = await analyzeSingleImage(uploadResult.file_info.file_path, config);
    
    onProgress?.('Analysis complete!');
    return analysisResult;
    
  } catch (error) {
    onProgress?.('Analysis failed');
    throw error;
  }
}

/**
 * Enhanced batch upload with detailed progress tracking
 */
export async function uploadBatchImagesEnhanced(
  files: File[],
  config: AnalysisConfig,
  onProgress?: (progress: BatchUploadProgress) => void
): Promise<BatchUploadResponse> {
  console.log('📤 uploadBatchImagesEnhanced called with', files.length, 'files');
  const formData = new FormData();
  const startTime = Date.now();
  let uploadedBytes = 0;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  
  // Track upload progress for each file
  const fileProgresses: UploadProgress[] = files.map((file, index) => ({
    file_index: index,
    file_name: file.name,
    status: 'pending',
    progress_percent: 0
  }));

  files.forEach((file, index) => {
    formData.append('files', file);
    fileProgresses[index].status = 'uploading';
  });
  
  formData.append('grid_square_size', config.gridSquareSize.toString());
  formData.append('include_visualizations', config.includeVisualizations.toString());

  const response: AxiosResponse<BatchUploadResponse> = await apiClient.post(
    '/upload/batch',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large batches
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.loaded || 0;
        const total = progressEvent.total || totalBytes;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = progress / elapsed;
        const eta = (total - progress) / speed;

        const overallProgress: BatchUploadProgress = {
          total_files: files.length,
          uploaded_files: Math.floor((progress / total) * files.length),
          failed_files: 0,
          overall_progress: Math.round((progress / total) * 100),
          upload_speed: speed,
          eta: eta
        };

        onProgress?.(overallProgress);
      }
    }
  );

  return response.data;
}

/**
 * Get enhanced batch analysis results with pagination
 */
export async function getBatchResultsPaginated(
  batchId: string,
  query: BatchResultsQuery = {}
): Promise<PaginatedResults<FishAnalysisResult>> {
  const params = new URLSearchParams();
  
  if (query.page) params.append('page', query.page.toString());
  if (query.per_page) params.append('per_page', query.per_page.toString());
  if (query.status_filter) params.append('status_filter', query.status_filter);
  if (query.sort_by) params.append('sort_by', query.sort_by);
  if (query.sort_order) params.append('sort_order', query.sort_order);
  if (query.search) params.append('search', query.search);

  const response: AxiosResponse<PaginatedResults<FishAnalysisResult>> = await apiClient.get(
    `/analysis/batch/${batchId}/results/paginated?${params.toString()}`
  );

  return response.data;
}

/**
 * Get population statistics for a batch
 */
export async function getPopulationStatistics(batchId: string): Promise<PopulationStatistics> {
  const response: AxiosResponse<PopulationStatistics> = await apiClient.get(
    `/analysis/batch/${batchId}/population-stats`
  );

  return response.data;
}

/**
 * Get comprehensive batch results with population analysis
 */
export async function getComprehensiveBatchResults(
  batchId: string,
  query: BatchResultsQuery = {}
): Promise<ComprehensiveBatchResult> {
  const response: AxiosResponse<ComprehensiveBatchResult> = await apiClient.get(
    `/analysis/batch/${batchId}/comprehensive`,
    { params: query }
  );

  return response.data;
}

/**
 * Get enhanced batch analysis status with detailed progress
 */
export async function getBatchAnalysisProgress(batchId: string): Promise<AnalysisProgress> {
  const response: AxiosResponse<AnalysisProgress> = await apiClient.get(
    `/analysis/batch/${batchId}/progress`
  );

  return response.data;
}

/**
 * Download batch results in various formats
 */
export async function downloadBatchResults(
  batchId: string,
  format: 'csv' | 'json' | 'pdf' | 'zip'
): Promise<Blob> {
  const response = await apiClient.get(
    `/analysis/batch/${batchId}/download/${format}`,
    {
      responseType: 'blob',
      timeout: 60000 // 1 minute for downloads
    }
  );

  return response.data;
}

/**
 * Enhanced upload and analyze batch images with comprehensive progress tracking
 */
export async function uploadAndAnalyzeBatchEnhanced(
  files: File[],
  config: AnalysisConfig,
  onUploadProgress?: (progress: BatchUploadProgress) => void,
  onAnalysisProgress?: (progress: AnalysisProgress) => void
): Promise<ComprehensiveBatchResult> {
  try {
    // Phase 1: Upload with detailed progress
    const uploadResult = await uploadBatchImagesEnhanced(files, config, onUploadProgress);
    
    if (!uploadResult.batch_id) {
      throw new Error('Batch upload failed - no batch ID returned');
    }
    
    // Phase 2: Start analysis
    await startBatchAnalysis(
      uploadResult.uploaded_files.map(f => f.file_path),
      config,
      uploadResult.batch_id  // Pass the batch_id from upload
    );
    
    // Phase 3: Monitor analysis progress
    let attempts = 0;
    const maxAttempts = 600; // 10 minutes max for large batches
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const progress = await getBatchAnalysisProgress(uploadResult.batch_id);
      onAnalysisProgress?.(progress);
      
      if (progress.status === 'completed' || progress.status === 'failed') {
        break;
      }
      
      attempts++;
    }
    
    // Phase 4: Get comprehensive results
    const comprehensiveResults = await getComprehensiveBatchResults(uploadResult.batch_id);
    
    return comprehensiveResults;
    
  } catch (error) {
    throw error;
  }
}

/**
 * Upload and analyze batch images (legacy - maintained for compatibility)
 */
export async function uploadAndAnalyzeBatch(
  files: File[],
  config: AnalysisConfig,
  onProgress?: (stage: string, progress?: number) => void
): Promise<BatchAnalysisResult> {
  try {
    onProgress?.('Uploading images...');
    const uploadResult = await uploadBatchImages(files, config);
    
    if (!uploadResult.batch_id) {
      throw new Error('Batch upload failed - no batch ID returned');
    }
    
    onProgress?.('Starting analysis...');
    await startBatchAnalysis(
      uploadResult.uploaded_files.map(f => f.file_path),
      config
    );
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 180; // 3 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const status = await getBatchStatus(uploadResult.batch_id);
      onProgress?.(`Processing images... (${status.completed_images}/${status.total_images})`, status.progress_percent);
      
      if (status.status === 'completed' || status.status === 'failed') {
        break;
      }
      
      attempts++;
    }
    
    onProgress?.('Getting final results...');
    const finalResults = await getBatchResults(uploadResult.batch_id);
    
    onProgress?.('Batch analysis complete!');
    return finalResults;
    
  } catch (error) {
    onProgress?.('Batch analysis failed');
    throw error;
  }
}