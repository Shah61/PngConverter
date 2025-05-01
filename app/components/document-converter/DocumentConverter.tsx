"use client";

import React from "react";

export interface DocumentConverterProps {
  renderUI: (props: DocumentConverterRenderProps) => React.ReactNode;
}

export interface DocumentConverterRenderProps {
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
  activeDocFormat: string;

  // Setters
  setCustomFilename: (filename: string) => void;
  setActiveTab: (tab: string) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setCurrentFileIndex: (index: number) => void;
  setError: (error: string | null) => void;
  setSelectedFiles: (files: File[]) => void;
  setActiveDocFormat: (format: string) => void;

  // Actions
  handleFileChange: (files: File[]) => void;
  handleConvert: () => Promise<boolean>;
  handleDownload: () => Promise<void>;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  getFileType: (file: File) => string;
}

export default function DocumentConverter({ renderUI }: DocumentConverterProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("upload");
  const [activeDocFormat, setActiveDocFormat] = React.useState('pdf-to-docx');
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
      
      // Only create preview for PDF files, others won't show
      if (selectedFile.type === 'application/pdf') {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        // For non-PDF files, we'll set a null preview but continue with selection
        setPreviewUrl(null);
      }
      
      // Generate a default filename for the output
      setCustomFilename(selectedFile.name.split('.')[0] || "converted-document");
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
    
    if (firstFileExt === 'pdf') {
      setActiveDocFormat('pdf-to-docx');
    } else if (firstFileExt === 'docx' || firstFileExt === 'doc') {
      setActiveDocFormat('docx-to-pdf');
    } else if (firstFileExt === 'txt') {
      setActiveDocFormat('txt-to-pdf');
    } else if (firstFileExt === 'csv') {
      setActiveDocFormat('csv-to-xls');
    } else if (firstFileExt === 'xls' || firstFileExt === 'xlsx') {
      setActiveDocFormat('xls-to-csv');
    }
    
    setActiveTab("preview");
  };

  const handleConvert = async (): Promise<boolean> => {
    if (!selectedFile) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate document conversion (in a real app, you'd call your API here)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be the URL returned from your server
      // For this demo, we'll create a placeholder URL
      const fakePdfUrl = "https://example.com/converted-document.pdf";
      
      // For demo purposes only - fake the converted file stats
      const originalSize = selectedFile.size;
      const convertedSize = Math.round(originalSize * 0.85); // Fake 15% size reduction
      const reduction = ((originalSize - convertedSize) / originalSize) * 100;
      
      const stats = {
        originalSize,
        convertedSize,
        reduction
      };
      
      setConversionStats(stats);
      setConvertedUrl(fakePdfUrl);
      
      // Also add to converted files list for batch operations
      setConvertedFiles(prev => [
        ...prev,
        {
          file: selectedFile,
          convertedUrl: fakePdfUrl,
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
      const outputFormat = activeDocFormat.split('-to-')[1];
      const blob = new Blob(
        [`This is a simulated ${outputFormat.toUpperCase()} file converted from ${selectedFile?.name}`], 
        { type: outputFormat === 'pdf' ? 'application/pdf' : 'application/octet-stream' }
      );
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customFilename || 'converted-document'}.${outputFormat}`;
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
    
    // Get all files from the drop event
    const files = Array.from(event.dataTransfer.files || []);
    
    // Check if any valid document files were dropped
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      // Only accept document file types, including CSV and XLS/XLSX
      return ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xls', 'xlsx'].includes(ext);
    });
    
    // Show error if no valid files were found
    if (validFiles.length === 0) {
      setError("Please drop valid document files (PDF, DOCX, TXT, CSV, XLS, etc).");
      return;
    }
    
    // Check if any files were of the wrong type (e.g., image, audio, etc.)
    const wrongTypeFiles = files.filter(file => !validFiles.includes(file));
    if (wrongTypeFiles.length > 0) {
      // In a real implementation, you would use the WrongFileTypeAlert component
      // and the useFileTypeValidation hook as shown in the PngToJpgConverter component
      setError("Some files were not document files and were ignored.");
    }
    
    // Process the valid files
    handleFileChange(validFiles);
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
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (type.includes('application/pdf')) {
      return 'pdf';
    }
    if (type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return 'docx';
    }
    if (type.includes('application/msword')) {
      return 'doc';
    }
    if (type.includes('text/plain')) {
      return 'txt';
    }
    // Excel formats
    if (type.includes('application/vnd.ms-excel') || 
        type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        extension === 'xls' || 
        extension === 'xlsx') {
      return 'xls';
    }
    // CSV format
    if (type.includes('text/csv') || extension === 'csv') {
      return 'csv';
    }
    
    return extension;
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
    activeDocFormat,
    
    // Setters
    setCustomFilename,
    setActiveTab,
    setIsDragOver,
    setCurrentFileIndex,
    setError,
    setSelectedFiles,
    setActiveDocFormat,

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