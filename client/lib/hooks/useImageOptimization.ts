/**
 * useImageOptimization Hook
 *
 * React hook for optimizing images with thumbnail generation,
 * memory management, and automatic cleanup.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createThumbnail,
  createThumbnailDataURL,
  ThumbnailOptions,
  OptimizedImage,
} from '@/lib/utils/imageOptimization';
import { memoryManager } from '@/lib/utils/memoryManager';

export interface OptimizedFileData {
  fileId: string;
  file: File;
  thumbnail: string;
  originalSize: number;
  thumbnailSize: number;
  width: number;
  height: number;
}

export interface UseImageOptimizationOptions {
  thumbnailOptions?: ThumbnailOptions;
  useDataURL?: boolean; // Use data URLs instead of object URLs (no cleanup needed)
  maxConcurrent?: number;
  autoCleanup?: boolean;
}

export interface UseImageOptimizationResult {
  optimizedFiles: Map<string, OptimizedFileData>;
  isProcessing: boolean;
  progress: { completed: number; total: number };
  error: Error | null;
  processFiles: (files: File[], fileIds: string[]) => Promise<void>;
  cleanup: (fileId?: string) => void;
  cleanupAll: () => void;
  getOptimizedFile: (fileId: string) => OptimizedFileData | undefined;
}

export function useImageOptimization(
  options: UseImageOptimizationOptions = {}
): UseImageOptimizationResult {
  const {
    thumbnailOptions = {},
    useDataURL = false,
    maxConcurrent = 3,
    autoCleanup = true,
  } = options;

  const [optimizedFiles, setOptimizedFiles] = useState<Map<string, OptimizedFileData>>(
    new Map()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const processedIdsRef = useRef<Set<string>>(new Set());

  /**
   * Process a batch of files
   */
  const processFiles = useCallback(
    async (files: File[], fileIds: string[]) => {
      if (files.length !== fileIds.length) {
        throw new Error('Files and fileIds arrays must have the same length');
      }

      setIsProcessing(true);
      setError(null);
      setProgress({ completed: 0, total: files.length });

      abortControllerRef.current = new AbortController();

      try {
        const newOptimizedFiles = new Map(optimizedFiles);

        // Process files in batches for better performance
        for (let i = 0; i < files.length; i += maxConcurrent) {
          if (abortControllerRef.current.signal.aborted) {
            break;
          }

          const batch = files.slice(i, i + maxConcurrent);
          const batchIds = fileIds.slice(i, i + maxConcurrent);

          const batchPromises = batch.map(async (file, index) => {
            const fileId = batchIds[index];

            // Skip if already processed
            if (processedIdsRef.current.has(fileId)) {
              return;
            }

            try {
              let optimizedData: OptimizedImage;

              if (useDataURL) {
                const thumbnail = await createThumbnailDataURL(file, thumbnailOptions);
                optimizedData = {
                  thumbnail,
                  originalSize: file.size,
                  thumbnailSize: 0, // Data URLs don't have a separate size
                  width: thumbnailOptions.maxWidth || 150,
                  height: thumbnailOptions.maxHeight || 150,
                };
              } else {
                optimizedData = await createThumbnail(file, thumbnailOptions);
                // Register the thumbnail URL for cleanup
                memoryManager.registerResource(
                  `thumbnail-${fileId}`,
                  'object-url',
                  optimizedData.thumbnail,
                  optimizedData.thumbnailSize
                );
              }

              newOptimizedFiles.set(fileId, {
                fileId,
                file,
                ...optimizedData,
              });

              processedIdsRef.current.add(fileId);
            } catch (err) {
              console.error(`Failed to optimize file ${file.name}:`, err);
              // Continue with other files even if one fails
            }
          });

          await Promise.all(batchPromises);

          setProgress({
            completed: Math.min(i + maxConcurrent, files.length),
            total: files.length,
          });
        }

        setOptimizedFiles(newOptimizedFiles);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsProcessing(false);
        setProgress({ completed: files.length, total: files.length });
      }
    },
    [maxConcurrent, thumbnailOptions, useDataURL, optimizedFiles]
  );

  /**
   * Cleanup a specific file or all files
   */
  const cleanup = useCallback((fileId?: string) => {
    if (fileId) {
      setOptimizedFiles((prev) => {
        const next = new Map(prev);
        const optimized = next.get(fileId);

        if (optimized && !useDataURL) {
          // Cleanup thumbnail URL
          memoryManager.unregisterResource(`thumbnail-${fileId}`);
        }

        next.delete(fileId);
        processedIdsRef.current.delete(fileId);
        return next;
      });
    }
  }, [useDataURL]);

  /**
   * Cleanup all optimized files
   */
  const cleanupAll = useCallback(() => {
    if (!useDataURL) {
      // Cleanup all thumbnail URLs
      for (const fileId of optimizedFiles.keys()) {
        memoryManager.unregisterResource(`thumbnail-${fileId}`);
      }
    }

    setOptimizedFiles(new Map());
    processedIdsRef.current.clear();
  }, [optimizedFiles, useDataURL]);

  /**
   * Get optimized file data
   */
  const getOptimizedFile = useCallback(
    (fileId: string) => {
      return optimizedFiles.get(fileId);
    },
    [optimizedFiles]
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoCleanup) {
        if (!useDataURL) {
          for (const fileId of optimizedFiles.keys()) {
            memoryManager.unregisterResource(`thumbnail-${fileId}`);
          }
        }
      }

      // Abort any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoCleanup, useDataURL, optimizedFiles]);

  return {
    optimizedFiles,
    isProcessing,
    progress,
    error,
    processFiles,
    cleanup,
    cleanupAll,
    getOptimizedFile,
  };
}

/**
 * Simple hook for memory monitoring
 */
export function useMemoryMonitor(interval: number = 5000) {
  const [memoryInfo, setMemoryInfo] = useState(memoryManager.getMemoryInfo());
  const [isHighPressure, setIsHighPressure] = useState(false);

  useEffect(() => {
    const stopMonitoring = memoryManager.startMonitoring(interval);

    const removeListener = memoryManager.addMemoryListener((info) => {
      setMemoryInfo(info);
      setIsHighPressure(memoryManager.isMemoryPressureHigh());
    });

    return () => {
      stopMonitoring();
      removeListener();
    };
  }, [interval]);

  return {
    memoryInfo,
    isHighPressure,
    usagePercent: memoryManager.getMemoryUsagePercent(),
    resourceStats: memoryManager.getResourceStats(),
  };
}
