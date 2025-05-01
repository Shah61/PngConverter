"use client";

import React from "react";
import { useImageConverter } from "../hooks/useImageConverter";
import { formatFileSize } from "../utils/imageUtils";
import { validateFileType, getRecommendedTabForFile, typeToTabMap } from "../../../app/utils/fileUtils";

export interface ImageConverterProps {
  renderUI: (props: ImageConverterRenderProps) => React.ReactNode;
  setActiveConversionType?: (type: string) => void;
}

export interface ImageConverterRenderProps {
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
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspectRatio: boolean;
  originalDimensions: { width: number; height: number } | null;
  customFilename: string;
  preserveMetadata: boolean;
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
  showBeforeAfter: boolean;
  isDragOver: boolean;
  zipFile: File | null;
  analyzingZip: boolean;
  activeConversionType: string;
  activeImageFormat: string;
  showFileTypeDetector: boolean;
  selectedFile: File | null;

  // Setters
  setQuality: (value: number) => void;
  setResizeEnabled: (enabled: boolean) => void;
  setResizeWidth: (width: number) => void;
  setResizeHeight: (height: number) => void;
  setMaintainAspectRatio: (maintain: boolean) => void;
  setCustomFilename: (filename: string) => void;
  setPreserveMetadata: (preserve: boolean) => void;
  setActiveTab: (tab: string) => void;
  setShowBeforeAfter: (show: boolean) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setZipFile: (file: File | null) => void;
  setAnalyzingZip: (analyzing: boolean) => void;
  setActiveConversionType: (type: string) => void;
  setActiveImageFormat: (format: string) => void;
  setShowFileTypeDetector: (show: boolean) => void;
  setCurrentFileIndex: (index: number) => void;
  setError: (error: string | null) => void;
  setSelectedFiles: (files: File[]) => void;

  // Actions
  handleFileChange: (files: File[]) => void;
  handleConvert: () => Promise<boolean>;
  handleDownload: () => Promise<void>;
  loadPreview: (file: File) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleFormatSelect: (format: string) => void;
  getFileType: (file: File) => string;
}

export default function ImageConverter({ renderUI, setActiveConversionType: externalSetActiveConversionType }: ImageConverterProps) {
  const {
    selectedFiles,
    currentFileIndex,
    previewUrl,
    convertedUrl,
    isLoading,
    error,
    quality,
    conversionStats,
    resizeEnabled,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    originalDimensions,
    customFilename,
    preserveMetadata,
    convertedFiles,
    setQuality,
    setResizeEnabled,
    setResizeWidth,
    setResizeHeight,
    setMaintainAspectRatio,
    setCustomFilename,
    setPreserveMetadata,
    handleConvert: internalHandleConvert,
    handleDownload,
    loadPreview,
    setCurrentFileIndex,
    setError,
    setSelectedFiles
  } = useImageConverter();

  const [activeTab, setActiveTab] = React.useState("upload");
  const [showBeforeAfter, setShowBeforeAfter] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [zipFile, setZipFile] = React.useState<File | null>(null);
  const [analyzingZip, setAnalyzingZip] = React.useState(false);
  const [activeConversionType, setActiveConversionType] = React.useState('image');
  const [activeImageFormat, setActiveImageFormat] = React.useState('png-to-jpg');
  const [showFileTypeDetector, setShowFileTypeDetector] = React.useState(false);

  const selectedFile = selectedFiles[currentFileIndex] || null;

  // Ensure handleConvert always returns a Promise<boolean>
  const handleConvert = async (): Promise<boolean> => {
    const result = await internalHandleConvert();
    return result === undefined ? false : result;
  };

  // Enhanced file change handler with validation
  const handleFileChange = (files: File[]) => {
    // Reset error state
    setError(null);
    
    // Check if zip file is included
    const zipFiles = files.filter(file => file.name.toLowerCase().endsWith('.zip'));
    if (zipFiles.length > 0) {
      setZipFile(zipFiles[0]);
      setAnalyzingZip(true);
      return;
    }
    
    // Validate all files are the correct type
    const invalidFiles = files.filter(file => !validateFileType(file, 'image'));
    
    if (invalidFiles.length > 0) {
      // Get recommended tab for the first invalid file
      const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
      
      // Set error message
      if (recommendedTab && recommendedTab !== 'zip') {
        const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
        setError(`This file is not a supported image file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
      } else {
        setError('One or more files are not supported image files. Please select only image files (PNG, JPEG, GIF, etc.).');
      }
      return;
    }
    
    // All files valid, continue processing
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    setShowFileTypeDetector(true);
  };

  // Enhanced drag and drop with validation
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files || []);
    handleFileChange(files); // Reuse the same validation logic
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

  const handleFormatSelect = (format: string) => {
    setActiveImageFormat(`${getFileType(selectedFile)}-to-${format}`);
    setShowFileTypeDetector(false);
    loadPreview(selectedFile);
    setActiveTab("preview");
  };

  const getFileType = (file: File): string => {
    const type = file.type.toLowerCase();
    if (type.includes('image/')) {
      return type.split('/')[1];
    }
    return file.name.split('.').pop()?.toLowerCase() || 'unknown';
  };

  // Create a function that updates both internal and external state
  const handleSetActiveConversionType = (type: string) => {
    setActiveConversionType(type);
    if (externalSetActiveConversionType) {
      externalSetActiveConversionType(type);
    }
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
    resizeEnabled,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    originalDimensions,
    customFilename,
    preserveMetadata,
    convertedFiles,
    activeTab,
    showBeforeAfter,
    isDragOver,
    zipFile,
    analyzingZip,
    activeConversionType,
    activeImageFormat,
    showFileTypeDetector,
    selectedFile,
    
    // Setters
    setQuality,
    setResizeEnabled,
    setResizeWidth,
    setResizeHeight,
    setMaintainAspectRatio,
    setCustomFilename,
    setPreserveMetadata,
    setActiveTab,
    setShowBeforeAfter,
    setIsDragOver,
    setZipFile,
    setAnalyzingZip,
    setActiveConversionType: handleSetActiveConversionType,
    setActiveImageFormat,
    setShowFileTypeDetector,
    setCurrentFileIndex,
    setError,
    setSelectedFiles,

    // Actions
    handleFileChange,
    handleConvert,
    handleDownload,
    loadPreview,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFormatSelect,
    getFileType
  });
} 