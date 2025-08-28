/**
 * Professional image upload component with drag and drop
 */

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, validateImageFile } from '@/lib/utils';

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
  maxFiles = mode === 'single' ? 1 : 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
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
        preview: URL.createObjectURL(file),
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
  }, [files, maxFiles, mode, onFilesChange]);

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
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const clearAllFiles = useCallback(() => {
    // Revoke object URLs to prevent memory leaks
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    onFilesChange([]);
  }, [files, onFilesChange]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragActive || dragActive
            ? 'border-sky-400/50 bg-sky-500/10' 
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
                  : `Drag and drop ${mode === 'single' ? 'an image' : 'images'} here, or click to browse`
                }
              </p>
              
              <p className="text-xs text-slate-500">
                Supports: JPEG, PNG, BMP, TIFF • Max size: {formatFileSize(maxSize)}
                {mode === 'batch' && ` • Max ${maxFiles} files`}
              </p>
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
              <h4 className="font-medium text-white">
                Selected Files ({files.length})
              </h4>
              
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

            <div className="space-y-3">
              {files.map((uploadedFile) => (
                <FilePreview 
                  key={uploadedFile.id}
                  uploadedFile={uploadedFile}
                  onRemove={removeFile}
                />
              ))}
            </div>
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
}

function FilePreview({ uploadedFile, onRemove }: FilePreviewProps) {
  const { file, id, preview, error } = uploadedFile;

  return (
    <div className="flex items-center space-x-4 p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg hover:bg-slate-700/20 transition-all duration-200">
      {/* Thumbnail */}
      {preview && (
        <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/30">
          <img 
            src={preview} 
            alt={file.name}
            className="w-full h-full object-cover"
            onLoad={() => {
              // Cleanup function will be handled by parent component
            }}
          />
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
}