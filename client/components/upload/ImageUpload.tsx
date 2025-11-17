/**
 * Professional image upload component with drag and drop
 */

'use client';

import React, { useCallback, useState, useEffect, memo, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, validateImageFile } from '@/lib/utils';
import { useImageOptimization, useMemoryMonitor } from '@/lib/hooks/useImageOptimization';
import { formatBytes } from '@/lib/utils/memoryManager';
import VirtualizedFileList from './VirtualizedFileList';
import { FileListSkeleton } from '@/components/ui/SkeletonLoaders';

export interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  error?: string;
}

interface ImageUploadProps {
  mode: 'single' | 'batch';
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  mode,
  files,
  onFilesChange,
  maxFiles = mode === 'single' ? 1 : 100, // Increased default for batch mode
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);

  // Image optimization hook for thumbnails
  const {
    optimizedFiles,
    isProcessing: isOptimizing,
    processFiles,
    cleanup,
  } = useImageOptimization({
    thumbnailOptions: { maxWidth: 100, maxHeight: 100, quality: 0.6 },
    useDataURL: true, // Use data URLs to avoid memory leaks
    maxConcurrent: 5,
  });

  // Memory monitoring
  const { memoryInfo, isHighPressure, usagePercent } = useMemoryMonitor();

  // Enable virtualization for large lists
  useEffect(() => {
    setUseVirtualization(files.length > 20);
  }, [files.length]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    const rejectedMessages = rejectedFiles.map(({ file, errors }) => {
      const errorMessages = errors.map((e: any) => e.message).join(', ');
      return `${file.name}: ${errorMessages}`;
    });

    // Validate accepted files
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [...rejectedMessages];

    acceptedFiles.forEach((file) => {
      const validation = validateImageFile(file);

      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        return;
      }

      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const uploadedFile: UploadedFile = {
        file,
        id,
        // Don't create preview URL immediately - let optimization hook handle it
      };

      newFiles.push(uploadedFile);
    });

    // Check file limits
    const totalFiles = files.length + newFiles.length;
    if (totalFiles > maxFiles) {
      errors.push(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
      return;
    }

    // Add new files to existing ones
    const updatedFiles = mode === 'single' ? newFiles : [...files, ...newFiles];

    // Add errors to files if any
    if (errors.length > 0) {
      console.error('Upload errors:', errors);
      // You could show these errors in a toast notification
    }

    onFilesChange(updatedFiles);

    // Process thumbnails for new files
    if (newFiles.length > 0) {
      await processFiles(
        newFiles.map(f => f.file),
        newFiles.map(f => f.id)
      );
    }
  }, [files, maxFiles, mode, onFilesChange, processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff', '.tif']
    },
    maxSize,
    multiple: mode === 'batch',
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = useCallback((fileId: string) => {
    // Cleanup optimized file
    cleanup(fileId);

    // Remove from file list
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange, cleanup]);

  const clearAllFiles = useCallback(() => {
    // No need to manually revoke URLs - optimization hook handles it
    onFilesChange([]);
  }, [onFilesChange]);

  // Get thumbnails map for file list
  const thumbnailsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const [fileId, data] of optimizedFiles.entries()) {
      map.set(fileId, data.thumbnail);
    }
    return map;
  }, [optimizedFiles]);

  // Handle paste events for images
  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    if (disabled) return;
    
    const items = Array.from(event.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return;
    
    event.preventDefault();
    
    const newFiles: UploadedFile[] = [];
    
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;
      
      // Create a proper File object with a name
      const timestamp = Date.now();
      const extension = file.type.split('/')[1] || 'png';
      const namedFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
        type: file.type,
        lastModified: timestamp
      });
      
      const validation = validateImageFile(namedFile);
      if (!validation.valid) {
        console.error(`Pasted image validation failed: ${validation.error}`);
        continue;
      }
      
      const id = Math.random().toString(36).substring(2) + timestamp.toString(36);
      const uploadedFile: UploadedFile = {
        file: namedFile,
        id,
        preview: URL.createObjectURL(namedFile),
      };
      
      newFiles.push(uploadedFile);
    }
    
    if (newFiles.length > 0) {
      // Check file limits
      const totalFiles = files.length + newFiles.length;
      if (totalFiles > maxFiles) {
        console.error(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
        return;
      }
      
      const updatedFiles = mode === 'single' ? newFiles : [...files, ...newFiles];
      onFilesChange(updatedFiles);
    }
  }, [disabled, files, maxFiles, mode, onFilesChange]);

  // Add paste event listener
  useEffect(() => {
    const handleWindowPaste = (event: ClipboardEvent) => {
      handlePaste(event);
    };
    
    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [handlePaste]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragActive || dragActive
            ? 'border-black/30 bg-black/5' 
            : 'border-slate-600/50 hover:border-slate-500/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="p-8">
          <div {...getRootProps()} className="text-center space-y-4">
            <input {...getInputProps()} />
            
            <div className="mx-auto w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-600/50">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">
                {mode === 'single' 
                  ? 'Upload Fish Image' 
                  : 'Upload Fish Images'
                }
              </h3>
              
              <p className="text-slate-400 text-sm">
                {isDragActive || dragActive
                  ? 'Drop your images here...'
                  : `Drag and drop ${mode === 'single' ? 'an image' : 'images'} here, click to browse, or paste from clipboard`
                }
              </p>
              
              <p className="text-xs text-slate-500">
                Supports: JPEG, PNG, BMP, TIFF • Max size: {formatFileSize(maxSize)}
                {mode === 'batch' && ` • Max ${maxFiles} files`} • Paste with Ctrl+V (⌘+V)
              </p>

              {/* Memory warning */}
              {isHighPressure && (
                <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-amber-800">
                    High memory usage ({usagePercent.toFixed(0)}%). Consider reducing the number of images.
                  </p>
                </div>
              )}
            </div>

            {!disabled && (
              <button type="button" className="minimal-button mt-4">
                <FileImage className="w-4 h-4 mr-2" />
                Choose {mode === 'single' ? 'File' : 'Files'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300 hover:border-slate-600/50 hover:translate-y-[-2px]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-white">
                  Selected Files ({files.length})
                </h4>
                {isOptimizing && (
                  <span className="flex items-center space-x-1 text-xs text-slate-400">
                    <Zap className="w-3 h-3 animate-pulse" />
                    <span>Optimizing...</span>
                  </span>
                )}
                {useVirtualization && (
                  <Badge className="text-xs bg-slate-700 text-slate-300">
                    Virtualized
                  </Badge>
                )}
              </div>

              {files.length > 1 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {isOptimizing && files.length > 10 ? (
              <FileListSkeleton count={Math.min(files.length, 5)} />
            ) : useVirtualization ? (
              <VirtualizedFileList
                files={files}
                onRemove={removeFile}
                thumbnails={thumbnailsMap}
              />
            ) : (
              <div className="space-y-3">
                {files.map((uploadedFile) => (
                  <FilePreview
                    key={uploadedFile.id}
                    uploadedFile={uploadedFile}
                    onRemove={removeFile}
                    thumbnail={thumbnailsMap.get(uploadedFile.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// File Preview Component
interface FilePreviewProps {
  uploadedFile: UploadedFile;
  onRemove: (fileId: string) => void;
  thumbnail?: string;
}

const FilePreview = memo(({ uploadedFile, onRemove, thumbnail }: FilePreviewProps) => {
  const { file, id, preview, error } = uploadedFile;
  const displayThumbnail = thumbnail || preview;

  return (
    <div className="flex items-center space-x-4 p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
      {/* Thumbnail */}
      {displayThumbnail ? (
        <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30">
          <img
            src={displayThumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30 flex items-center justify-center">
          <FileImage className="w-6 h-6 text-slate-400" />
        </div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {file.name}
        </p>
        
        <p className="text-xs text-slate-400">
          {formatFileSize(file.size)}
        </p>

        {error && (
          <div className="flex items-center mt-1 text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <Badge variant={error ? 'destructive' : 'success'} className="text-xs">
        {error ? 'Error' : 'Ready'}
      </Badge>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors duration-200 rounded"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

FilePreview.displayName = 'FilePreview';