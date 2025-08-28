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
      <Card 
        className={`border-2 border-dashed transition-all duration-300 ${
          isDragActive || dragActive
            ? 'border-sky-400 bg-sky-500/10 neon-border' 
            : 'border-slate-600 hover:border-slate-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center space-y-4">
            <input {...getInputProps()} />
            
            <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center backdrop-blur-sm border border-slate-600 pulse-glow">
              <Upload className="w-8 h-8 text-sky-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tech-mono">
                {mode === 'single' 
                  ? 'UPLOAD FISH IMAGE' 
                  : 'UPLOAD FISH IMAGES'
                }
              </h3>
              
              <p className="text-slate-300 tech-mono">
                {isDragActive || dragActive
                  ? 'DROP YOUR IMAGES HERE...'
                  : `DRAG AND DROP ${mode === 'single' ? 'AN IMAGE' : 'IMAGES'} HERE, OR CLICK TO BROWSE`
                }
              </p>
              
              <p className="text-sm text-slate-400 tech-mono">
                SUPPORTS: JPEG, PNG, BMP, TIFF • MAX SIZE: {formatFileSize(maxSize)}
                {mode === 'batch' && ` • MAX ${maxFiles} FILES`}
              </p>
            </div>

            {!disabled && (
              <Button type="button" variant="outline" className="mt-6 tech-mono font-bold">
                <FileImage className="w-5 h-5 mr-2" />
                CHOOSE {mode === 'single' ? 'FILE' : 'FILES'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="enhanced-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-white tech-mono text-lg">
                SELECTED FILES ({files.length})
              </h4>
              
              {files.length > 1 && (
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-red-400 hover:text-red-300 tech-mono font-bold"
                >
                  CLEAR ALL
                </Button>
              )}
            </div>

            <div className="space-y-4">
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
    <div className="flex items-center space-x-4 p-4 bg-slate-800/30 border border-slate-700 rounded-xl backdrop-blur-sm hover:bg-slate-700/30 transition-all duration-300">
      {/* Thumbnail */}
      {preview && (
        <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
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
        <p className="text-sm font-bold text-white tech-mono truncate">
          {file.name}
        </p>
        
        <p className="text-sm text-slate-400 tech-mono">
          {formatFileSize(file.size)}
        </p>

        {error && (
          <div className="flex items-center mt-1 text-red-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-xs tech-mono">{error}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <Badge variant={error ? 'destructive' : 'success'}>
        {error ? 'ERROR' : 'READY'}
      </Badge>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 w-8 h-8 text-slate-400 hover:text-red-400 transition-colors duration-300"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}