/**
 * CVUploader Component - PRD-038
 * Componente de upload de currículo com drag-and-drop
 */

import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCVFile, VALID_CV_MIME_TYPES, MAX_CV_FILE_SIZE } from '@/types/cvParser';
import { Button } from '@/components/ui/button';

interface CVUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function CVUploader({ onFileSelect, disabled = false, className }: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validation = validateCVFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Arquivo inválido');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200',
          'flex flex-col items-center justify-center text-center',
          isDragging && !disabled && 'border-cyan-500 bg-cyan-50',
          !isDragging && !error && 'border-gray-300 hover:border-gray-400',
          error && 'border-red-300 bg-red-50',
          disabled && 'opacity-50 cursor-not-allowed',
          selectedFile && !error && 'border-green-300 bg-green-50'
        )}
      >
        <input
          type="file"
          accept={VALID_CV_MIME_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {selectedFile && !error ? (
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-green-500 mb-3" />
            <p className="font-medium text-green-700">{selectedFile.name}</p>
            <p className="text-sm text-green-600 mt-1">
              {formatFileSize(selectedFile.size)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="mt-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Remover arquivo
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Tente selecionar outro arquivo
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload
              className={cn(
                'w-12 h-12 mb-3 transition-colors',
                isDragging ? 'text-cyan-500' : 'text-gray-400'
              )}
            />
            <p className="font-medium text-gray-700">
              {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu currículo aqui'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou clique para selecionar
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                PDF, DOC, DOCX
              </span>
              <span>Máx. {formatFileSize(MAX_CV_FILE_SIZE)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
