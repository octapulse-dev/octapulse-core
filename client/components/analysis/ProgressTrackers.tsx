'use client';

import { Upload, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BatchUploadProgress, AnalysisProgress, UploadProgress } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface UploadProgressTrackerProps {
  progress: BatchUploadProgress;
  isVisible: boolean;
}

export function UploadProgressTracker({ progress, isVisible }: UploadProgressTrackerProps) {
  if (!isVisible) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-sky-100 rounded-lg">
          <Upload className="h-5 w-5 text-sky-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mono-bold">Upload Progress</h3>
          <p className="text-sm text-gray-600">
            {progress.uploaded_files} of {progress.total_files} files uploaded
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span className="mono">{progress.overall_progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sky-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.overall_progress}%` }}
          />
        </div>
      </div>

      {/* Upload Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Upload Speed</div>
          <div className="text-sm font-medium mono">
            {formatBytes(progress.upload_speed)}/s
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">ETA</div>
          <div className="text-sm font-medium mono">
            {formatTime(progress.eta)}
          </div>
        </div>
      </div>

      {/* File Status Summary */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">
            Uploaded: <span className="font-medium mono">{progress.uploaded_files}</span>
          </span>
        </div>
        {progress.failed_files > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-gray-600">
              Failed: <span className="font-medium mono">{progress.failed_files}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BatchProgressTrackerProps {
  progress: AnalysisProgress;
  isVisible: boolean;
}

export function BatchProgressTracker({ progress, isVisible }: BatchProgressTrackerProps) {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <BarChart3 className="h-5 w-5 text-sky-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (progress.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-sky-100 rounded-lg">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 mono-bold">
              Analysis Progress
            </h3>
            <Badge variant={getStatusBadgeVariant()}>
              {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Batch ID: <span className="mono">{progress.batch_id}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Analysis Progress</span>
          <span className="mono">{progress.progress_percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress.status === 'failed' 
                ? 'bg-red-500' 
                : progress.status === 'completed' 
                  ? 'bg-green-500' 
                  : 'bg-sky-500'
            }`}
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Image Processing Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-700 mb-1">Completed</div>
          <div className="text-lg font-semibold text-green-800 mono">
            {progress.completed_images}
          </div>
          <div className="text-xs text-green-600">
            of {progress.total_images}
          </div>
        </div>
        
        {progress.failed_images > 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="text-xs text-red-700 mb-1">Failed</div>
            <div className="text-lg font-semibold text-red-800 mono">
              {progress.failed_images}
            </div>
            <div className="text-xs text-red-600">errors</div>
          </div>
        )}
        
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-700 mb-1">
            {progress.status === 'processing' ? 'Processing' : 'Remaining'}
          </div>
          <div className="text-lg font-semibold text-gray-800 mono">
            {progress.total_images - progress.completed_images - progress.failed_images}
          </div>
          <div className="text-xs text-gray-600">images</div>
        </div>
      </div>

      {/* Performance Metrics */}
      {(progress.processing_rate || progress.average_processing_time) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {progress.processing_rate && (
            <div className="bg-sky-50 rounded-lg p-3">
              <div className="text-xs text-sky-700 mb-1">Processing Rate</div>
              <div className="text-sm font-medium mono text-sky-800">
                {progress.processing_rate.toFixed(1)} img/min
              </div>
            </div>
          )}
          {progress.average_processing_time && (
            <div className="bg-sky-50 rounded-lg p-3">
              <div className="text-xs text-sky-700 mb-1">Avg Time</div>
              <div className="text-sm font-medium mono text-sky-800">
                {progress.average_processing_time.toFixed(1)}s/img
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Processing */}
      {progress.current_image && progress.status === 'processing' && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-800">
              Currently processing: <span className="mono font-medium">
                {progress.current_image.split('/').pop()}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Estimated Completion */}
      {progress.estimated_completion_time && progress.status === 'processing' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Estimated completion: <span className="mono font-medium">
                {formatTime(progress.estimated_completion_time)}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface IndividualFileProgressProps {
  progress: UploadProgress;
}

export function IndividualFileProgress({ progress }: IndividualFileProgressProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-sky-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {progress.file_name}
        </div>
        {progress.error && (
          <div className="text-xs text-red-600 truncate">
            {progress.error}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        {progress.status === 'uploading' && (
          <div className="text-xs text-gray-500 mono">
            {progress.progress_percent}%
          </div>
        )}
      </div>
    </div>
  );
}