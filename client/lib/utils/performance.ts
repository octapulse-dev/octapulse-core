import { FishAnalysisResult } from '@/lib/types';

/**
 * Performance utilities for batch analysis
 */

// Debounce function for search and filtering
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events and frequent updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization for expensive calculations
const memoCache = new Map<string, any>();

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    
    const result = func(...args);
    memoCache.set(key, result);
    
    // Clean up cache if it gets too large
    if (memoCache.size > 100) {
      const firstKey = memoCache.keys().next().value;
      if (firstKey !== undefined) {
        memoCache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

// Clear memoization cache
export function clearMemoCache(): void {
  memoCache.clear();
}

// Virtual scrolling calculations
export function calculateVisibleRange(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 5
): { startIndex: number; endIndex: number; visibleCount: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  
  return { startIndex, endIndex, visibleCount };
}

// Batch processing utility
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize: number = 10,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const total = items.length;
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, idx) => processor(item, i + idx));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      onProgress?.(results.length, total);
    } catch (error) {
      console.error(`Batch processing error at index ${i}:`, error);
      throw error;
    }
    
    // Small delay to prevent blocking the main thread
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return results;
}

// Image optimization for thumbnails and previews
export function createImageBlob(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > height) {
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
      } else {
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Memory-efficient file reading
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use FileReader for larger files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    } else {
      // Use URL.createObjectURL for smaller files (more memory efficient)
      const url = URL.createObjectURL(file);
      resolve(url);
    }
  });
}

// Cleanup object URLs to prevent memory leaks
export function cleanupObjectURL(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures = new Map<string, number>();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`Start mark '${startMark}' not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measures.set(name, duration);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  getMeasure(name: string): number | undefined {
    return this.measures.get(name);
  }
  
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }
  
  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

// Batch analysis specific optimizations
export const batchAnalysisOptimizations = {
  // Optimal batch sizes based on system resources
  getOptimalBatchSize: (totalFiles: number, availableMemory?: number): number => {
    const baseSize = 10;
    const memoryMultiplier = availableMemory ? Math.min(availableMemory / 1000, 3) : 1;
    return Math.min(Math.ceil(totalFiles / 10), Math.floor(baseSize * memoryMultiplier));
  },
  
  // Prioritize files based on size and type
  prioritizeFiles: (files: File[]): File[] => {
    return [...files].sort((a, b) => {
      // Prioritize smaller files first for faster initial feedback
      const sizeDiff = a.size - b.size;
      if (Math.abs(sizeDiff) > 1024 * 1024) { // 1MB difference
        return sizeDiff;
      }
      // Then by file type (JPEG before PNG)
      const aType = a.type.includes('jpeg') ? 0 : 1;
      const bType = b.type.includes('jpeg') ? 0 : 1;
      return aType - bType;
    });
  },
  
  // Estimate processing time based on file characteristics
  estimateProcessingTime: (files: File[]): number => {
    const avgTimePerMB = 2; // seconds per MB
    const baseTimePerFile = 5; // seconds base time per file
    
    const totalSizeMB = files.reduce((sum, file) => sum + file.size / (1024 * 1024), 0);
    const totalFiles = files.length;
    
    return Math.ceil(totalSizeMB * avgTimePerMB + totalFiles * baseTimePerFile);
  }
};

// Global performance monitor instance
export const perfMonitor = new PerformanceMonitor();