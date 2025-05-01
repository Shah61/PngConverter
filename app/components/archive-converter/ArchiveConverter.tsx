"use client";

import React from "react";

export interface ArchiveConverterProps {
  renderUI: (props: ArchiveConverterRenderProps) => React.ReactNode;
}

export interface ArchiveConverterRenderProps {
  // State
  selectedFiles: File[];
  currentFileIndex: number;
  previewUrl: string | null;
  convertedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  compressionLevel: number;
  conversionStats: {
    originalSize: number;
    convertedSize: number;
    reduction: number;
  } | null;
  customFilename: string;
  convertedFiles: {
    file: File;
    convertedUrl: string;
    stats: {
      originalSize: number;
      convertedSize: number;
      reduction: number;
    };
  }[];
  activeTab: string;
  isDragOver: boolean;
  selectedFile: File | null;
  activeArchiveFormat: string;

  // Setters
  setCompressionLevel: (value: number) => void;
  setCustomFilename: (filename: string) => void;
  setActiveTab: (tab: string) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setCurrentFileIndex: (index: number) => void;
  setError: (error: string | null) => void;
  setSelectedFiles: (files: File[]) => void;
  setActiveArchiveFormat: (format: string) => void;

  // Actions
  handleFileChange: (files: File[]) => void;
  handleConvert: () => Promise<boolean>;
  handleDownload: () => Promise<void>;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  getFileType: (file: File) => string;
}

export default function ArchiveConverter({ renderUI }: ArchiveConverterProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = React.useState(5); // compression level from 1-9
  const [activeTab, setActiveTab] = React.useState("upload");
  const [activeArchiveFormat, setActiveArchiveFormat] = React.useState('zip-to-rar');
  const [customFilename, setCustomFilename] = React.useState("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [conversionStats, setConversionStats] = React.useState<{
    originalSize: number;
    convertedSize: number;
    reduction: number;
  } | null>(null);
  const [convertedFiles, setConvertedFiles] = React.useState<{
    file: File;
    convertedUrl: string;
    stats: {
      originalSize: number;
      convertedSize: number;
      reduction: number;
    };
  }[]>([]);

  const selectedFile = selectedFiles[currentFileIndex] || null;

  // Effect to create "preview" URL when selectedFile changes
  // Archive files don't have real previews, but we still need the cleanup
  React.useEffect(() => {
    if (selectedFile) {
      // For archives, we don't actually create a preview URL for viewing content
      // That would require unpacking the archive, which would be done server-side
      // But we'll still follow the pattern for consistency
      
      // Generate a default filename for the output
      setCustomFilename(selectedFile.name.split('.')[0] || "converted-archive");
    }
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedFile]);

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setConvertedFiles([]);
    
    // Auto-set the active format based on the first file's extension
    const firstFileExt = files[0].name.split('.').pop()?.toLowerCase() || '';
    
    if (firstFileExt === 'zip') {
      setActiveArchiveFormat('zip-to-rar');
    } else if (firstFileExt === 'rar') {
      setActiveArchiveFormat('rar-to-zip');
    } else if (firstFileExt === 'tar') {
      setActiveArchiveFormat('tar-to-zip');
    } else if (firstFileExt === '7z') {
      setActiveArchiveFormat('7z-to-zip');
    } else if (firstFileExt === 'gz' || firstFileExt === 'gzip') {
      setActiveArchiveFormat('gz-to-zip');
    }
    
    setActiveTab("preview");
  };

  const handleConvert = async (): Promise<boolean> => {
    if (!selectedFile) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate archive conversion (in a real app, you'd call your API here)
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // In a real app, this would be the URL returned from your server
      // For this demo, we'll create a placeholder URL
      const fakeArchiveUrl = "https://example.com/converted-archive.zip";
      
      // For demo purposes only - fake the converted file stats
      const originalSize = selectedFile.size;
      // The compression level affects the result size
      // Higher compression level means smaller file
      const compressionFactor = 1 - (compressionLevel / 10);
      const convertedSize = Math.round(originalSize * compressionFactor);
      const reduction = ((originalSize - convertedSize) / originalSize) * 100;
      
      const stats = {
        originalSize,
        convertedSize,
        reduction
      };
      
      setConversionStats(stats);
      setConvertedUrl(fakeArchiveUrl);
      
      // Also add to converted files list for batch operations
      setConvertedFiles(prev => [
        ...prev,
        {
          file: selectedFile,
          convertedUrl: fakeArchiveUrl,
          stats
        }
      ]);
      
      setActiveTab("result");
      return true;
    } catch (err) {
      setError("An error occurred during conversion. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (): Promise<void> => {
    // In a real application, this would download the actual converted file
    // For this demo, we'll simulate downloading a placeholder file
    
    try {
      // Here, you would fetch the actual file from convertedUrl
      // For demo purposes, we'll create a text blob
      const outputFormat = activeArchiveFormat.split('-to-')[1];
      const blob = new Blob(
        [`This is a simulated ${outputFormat.toUpperCase()} archive converted from ${selectedFile?.name} with compression level ${compressionLevel}`], 
        { type: 'application/octet-stream' }
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customFilename || 'converted-archive'}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      setError("Download failed. Please try again.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files || [])
      .filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        // Only accept archive file types
        return ['zip', 'rar', 'tar', '7z', 'gz', 'bz2', 'xz', 'iso'].includes(ext);
      });
    
    if (files.length === 0) {
      setError("Please drop valid archive files (ZIP, RAR, TAR, etc).");
      return;
    }
    
    handleFileChange(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const getFileType = (file: File): string => {
    const type = file.type.toLowerCase();
    if (type.includes('application/zip')) {
      return 'zip';
    }
    if (type.includes('application/x-rar-compressed') || type.includes('application/vnd.rar')) {
      return 'rar';
    }
    if (type.includes('application/x-tar')) {
      return 'tar';
    }
    if (type.includes('application/x-7z-compressed')) {
      return '7z';
    }
    if (type.includes('application/gzip')) {
      return 'gz';
    }
    // Fallback to extension if mime type doesn't work
    return file.name.split('.').pop()?.toLowerCase() || 'unknown';
  };

  return renderUI({
    // State
    selectedFiles,
    currentFileIndex,
    previewUrl,
    convertedUrl,
    isLoading,
    error,
    compressionLevel,
    conversionStats,
    customFilename,
    convertedFiles,
    activeTab,
    isDragOver,
    selectedFile,
    activeArchiveFormat,
    
    // Setters
    setCompressionLevel,
    setCustomFilename,
    setActiveTab,
    setIsDragOver,
    setCurrentFileIndex,
    setError,
    setSelectedFiles,
    setActiveArchiveFormat,

    // Actions
    handleFileChange,
    handleConvert,
    handleDownload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    getFileType
  });
} 