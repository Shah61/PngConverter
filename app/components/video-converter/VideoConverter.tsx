"use client";

import React from "react";

export interface VideoConverterProps {
  renderUI: (props: VideoConverterRenderProps) => React.ReactNode;
}

export interface VideoConverterRenderProps {
  // State
  selectedFiles: File[];
  currentFileIndex: number;
  previewUrl: string | null;
  convertedUrl: string | null;
  isLoading: boolean;
  error: string | null;
  quality: number;
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
  activeVideoFormat: string;

  // Setters
  setQuality: (value: number) => void;
  setCustomFilename: (filename: string) => void;
  setActiveTab: (tab: string) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setCurrentFileIndex: (index: number) => void;
  setError: (error: string | null) => void;
  setSelectedFiles: (files: File[]) => void;
  setActiveVideoFormat: (format: string) => void;

  // Actions
  handleFileChange: (files: File[]) => void;
  handleConvert: () => Promise<boolean>;
  handleDownload: () => Promise<void>;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  getFileType: (file: File) => string;
}

export default function VideoConverter({ renderUI }: VideoConverterProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [quality, setQuality] = React.useState(720); // resolution quality (720p, 1080p, etc.)
  const [activeTab, setActiveTab] = React.useState("upload");
  const [activeVideoFormat, setActiveVideoFormat] = React.useState('mp4-to-webm');
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
      
      // Create video preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Generate a default filename for the output
      setCustomFilename(selectedFile.name.split('.')[0] || "converted-video");
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
    
    if (firstFileExt === 'mp4') {
      setActiveVideoFormat('mp4-to-webm');
    } else if (firstFileExt === 'webm') {
      setActiveVideoFormat('webm-to-mp4');
    } else if (firstFileExt === 'avi') {
      setActiveVideoFormat('avi-to-mp4');
    } else if (firstFileExt === 'mov') {
      setActiveVideoFormat('mov-to-mp4');
    } else if (firstFileExt === 'mkv') {
      setActiveVideoFormat('mkv-to-mp4');
    }
    
    setActiveTab("preview");
  };

  const handleConvert = async (): Promise<boolean> => {
    if (!selectedFile) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate video conversion (in a real app, you'd call your API here)
      await new Promise(resolve => setTimeout(resolve, 2500)); // Video conversions typically take longer
      
      // In a real app, this would be the URL returned from your server
      // For this demo, we'll create a placeholder URL
      const fakeVideoUrl = "https://example.com/converted-video.mp4";
      
      // For demo purposes only - fake the converted file stats
      const originalSize = selectedFile.size;
      // Higher quality = less compression, lower quality = more compression
      const compressionRate = quality >= 1080 ? 0.9 : quality >= 720 ? 0.7 : 0.5;
      const convertedSize = Math.round(originalSize * compressionRate);
      const reduction = ((originalSize - convertedSize) / originalSize) * 100;
      
      const stats = {
        originalSize,
        convertedSize,
        reduction
      };
      
      setConversionStats(stats);
      setConvertedUrl(fakeVideoUrl);
      
      // Also add to converted files list for batch operations
      setConvertedFiles(prev => [
        ...prev,
        {
          file: selectedFile,
          convertedUrl: fakeVideoUrl,
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
      const outputFormat = activeVideoFormat.split('-to-')[1];
      const blob = new Blob(
        [`This is a simulated ${outputFormat.toUpperCase()} file converted from ${selectedFile?.name} at ${quality}p quality`], 
        { type: `video/${outputFormat}` }
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customFilename || 'converted-video'}.${outputFormat}`;
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
        // Only accept video file types
        return ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', '3gp'].includes(ext);
      });
    
    if (files.length === 0) {
      setError("Please drop valid video files (MP4, WEBM, AVI, etc).");
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
    if (type.includes('video/mp4')) {
      return 'mp4';
    }
    if (type.includes('video/webm')) {
      return 'webm';
    }
    if (type.includes('video/avi') || type.includes('video/x-msvideo')) {
      return 'avi';
    }
    if (type.includes('video/quicktime')) {
      return 'mov';
    }
    if (type.includes('video/x-matroska')) {
      return 'mkv';
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
    quality,
    conversionStats,
    customFilename,
    convertedFiles,
    activeTab,
    isDragOver,
    selectedFile,
    activeVideoFormat,
    
    // Setters
    setQuality,
    setCustomFilename,
    setActiveTab,
    setIsDragOver,
    setCurrentFileIndex,
    setError,
    setSelectedFiles,
    setActiveVideoFormat,

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