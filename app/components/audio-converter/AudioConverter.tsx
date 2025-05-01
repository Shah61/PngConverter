"use client";

import React from "react";

export interface AudioConverterProps {
  renderUI: (props: AudioConverterRenderProps) => React.ReactNode;
}

export interface AudioConverterRenderProps {
  // State
  selectedFiles: File[];
  currentFileIndex: number;
  previewUrl: string | null;
  convertedUrl: string | null;
  isLoading: boolean;
  error: string | null;
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
  activeAudioFormat: string;

  // Setters
  setCustomFilename: (filename: string) => void;
  setActiveTab: (tab: string) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setCurrentFileIndex: (index: number) => void;
  setError: (error: string | null) => void;
  setSelectedFiles: (files: File[]) => void;
  setActiveAudioFormat: (format: string) => void;

  // Actions
  handleFileChange: (files: File[]) => void;
  handleConvert: () => Promise<boolean>;
  handleDownload: () => Promise<void>;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  getFileType: (file: File) => string;
}

export default function AudioConverter({ renderUI }: AudioConverterProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("upload");
  const [activeAudioFormat, setActiveAudioFormat] = React.useState('mp3-to-wav');
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

  // Effect to create preview URL when selectedFile changes
  React.useEffect(() => {
    if (selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create audio preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Generate a default filename for the output
      setCustomFilename(selectedFile.name.split('.')[0] || "converted-audio");
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
    
    if (firstFileExt === 'mp3') {
      setActiveAudioFormat('mp3-to-wav');
    } else if (firstFileExt === 'wav') {
      setActiveAudioFormat('wav-to-mp3');
    } else if (firstFileExt === 'ogg') {
      setActiveAudioFormat('ogg-to-mp3');
    } else if (firstFileExt === 'flac') {
      setActiveAudioFormat('flac-to-mp3');
    } else if (firstFileExt === 'aac') {
      setActiveAudioFormat('aac-to-mp3');
    }
    
    setActiveTab("preview");
  };

  const handleConvert = async (): Promise<boolean> => {
    if (!selectedFile) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate audio conversion (in a real app, you'd call your API here)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be the URL returned from your server
      // For this demo, we'll create a placeholder URL
      const fakeAudioUrl = "https://example.com/converted-audio.mp3";
      
      // For demo purposes only - fake the converted file stats
      const originalSize = selectedFile.size;
      const convertedSize = Math.round(originalSize * 0.75); // Fake 25% size reduction
      const reduction = ((originalSize - convertedSize) / originalSize) * 100;
      
      const stats = {
        originalSize,
        convertedSize,
        reduction
      };
      
      setConversionStats(stats);
      setConvertedUrl(fakeAudioUrl);
      
      // Also add to converted files list for batch operations
      setConvertedFiles(prev => [
        ...prev,
        {
          file: selectedFile,
          convertedUrl: fakeAudioUrl,
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
      const outputFormat = activeAudioFormat.split('-to-')[1];
      const blob = new Blob(
        [`This is a simulated ${outputFormat.toUpperCase()} file converted from ${selectedFile?.name}`], 
        { type: `audio/${outputFormat}` }
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customFilename || 'converted-audio'}.${outputFormat}`;
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
        // Only accept audio file types
        return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext);
      });
    
    if (files.length === 0) {
      setError("Please drop valid audio files (MP3, WAV, OGG, etc).");
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
    if (type.includes('audio/mp3') || type.includes('audio/mpeg')) {
      return 'mp3';
    }
    if (type.includes('audio/wav') || type.includes('audio/x-wav')) {
      return 'wav';
    }
    if (type.includes('audio/ogg')) {
      return 'ogg';
    }
    if (type.includes('audio/flac')) {
      return 'flac';
    }
    if (type.includes('audio/aac')) {
      return 'aac';
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
    conversionStats,
    customFilename,
    convertedFiles,
    activeTab,
    isDragOver,
    selectedFile,
    activeAudioFormat,
    
    // Setters
    setCustomFilename,
    setActiveTab,
    setIsDragOver,
    setCurrentFileIndex,
    setError,
    setSelectedFiles,
    setActiveAudioFormat,

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