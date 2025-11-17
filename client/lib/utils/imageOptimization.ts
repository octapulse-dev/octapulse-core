/**
 * Image Optimization Utilities
 *
 * Provides utilities for optimizing images, creating thumbnails,
 * and managing image resources efficiently.
 */

export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface OptimizedImage {
  thumbnail: string; // Data URL or Object URL
  originalSize: number;
  thumbnailSize: number;
  width: number;
  height: number;
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.7,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create thumbnail blob'));
              return;
            }

            const thumbnailUrl = URL.createObjectURL(blob);

            resolve({
              thumbnail: thumbnailUrl,
              originalSize: file.size,
              thumbnailSize: blob.size,
              width,
              height,
            });

            // Cleanup
            URL.revokeObjectURL(objectUrl);
          },
          format,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Create a thumbnail as a data URL (smaller, no cleanup needed)
 */
export async function createThumbnailDataURL(
  file: File,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.7,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL(format, quality);

        resolve(dataUrl);

        // Cleanup
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'image/jpeg',
  } = options;

  let quality = 0.9;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const blob = await compressImageWithQuality(file, quality, {
      maxWidth,
      maxHeight,
      format,
    });

    const sizeKB = blob.size / 1024;

    if (sizeKB <= maxSizeKB || attempts === maxAttempts - 1) {
      return blob;
    }

    // Reduce quality for next attempt
    quality -= 0.15;
    attempts++;
  }

  throw new Error('Failed to compress image to target size');
}

/**
 * Compress image with specific quality
 */
async function compressImageWithQuality(
  file: File,
  quality: number,
  options: Required<Pick<ThumbnailOptions, 'maxWidth' | 'maxHeight' | 'format'>>
): Promise<Blob> {
  const { maxWidth, maxHeight, format } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            resolve(blob);
            URL.revokeObjectURL(objectUrl);
          },
          format,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Get image dimensions without loading the full image
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/**
 * Calculate the reduction percentage from compression
 */
export function calculateReduction(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Batch process images with concurrency control
 */
export async function batchProcessImages<T>(
  files: File[],
  processor: (file: File) => Promise<T>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<T[]> {
  const { concurrency = 3, onProgress } = options;
  const results: T[] = [];
  let completed = 0;

  // Process files in batches
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(file => processor(file))
    );

    results.push(...batchResults);
    completed += batch.length;

    if (onProgress) {
      onProgress(completed, files.length);
    }
  }

  return results;
}

/**
 * Preload images for better performance
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    const img = new Image();
    img.onload = () => resolve(img.width === 2);
    img.onerror = () => resolve(false);
    img.src = webP;
  });
}
