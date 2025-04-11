import { useState, useEffect } from 'react';
import { isPngFile, generateDefaultFilename, formatFileSize } from '../utils/imageUtils';

export interface ConversionStats {
  originalSize: number;
  convertedSize: number;
  reduction: number;
}

export interface ConvertedFile {
  file: File;
  convertedUrl: string;
  stats: ConversionStats;
}

export const useImageConverter = (setActiveTab?: (tab: string) => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(90);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [customFilename, setCustomFilename] = useState<string>("");
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadPreview = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    const img = document.createElement('img');
    img.onload = () => {
      setOriginalDimensions({width: img.width, height: img.height});
      setResizeWidth(img.width);
      setResizeHeight(img.height);
    };
    img.src = objectUrl;
    
    setCustomFilename(generateDefaultFilename(file.name));
  };

  const handleFileChange = (files: File[]) => {
    // Remove PNG filter and allow all files
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    if (files.length > 0) {
      loadPreview(files[0]);
    }
    
    // Switch to preview tab if files are selected
    if (setActiveTab) {
      setActiveTab("preview");
    }
  };

  const processFile = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('quality', quality.toString());
      formData.append('preserve_metadata', preserveMetadata.toString());
      
      if (resizeEnabled) {
        formData.append('resize', 'true');
        formData.append('width', resizeWidth.toString());
        formData.append('height', resizeHeight.toString());
      }
      
      const response = await fetch('http://127.0.0.1:5002/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }
      
      const data = await response.json();
      const convertedImageUrl = `http://localhost:5002${data.jpgUrl}`;
      setConvertedUrl(convertedImageUrl);
      
      const originalSize = file.size;
      const imageResponse = await fetch(convertedImageUrl);
      const blob = await imageResponse.blob();
      const convertedSize = blob.size;
      
      const reduction = ((originalSize - convertedSize) / originalSize) * 100;
      
      const stats = {
        originalSize,
        convertedSize,
        reduction
      };
      
      setConversionStats(stats);
      
      setConvertedFiles(prev => [
        ...prev,
        {
          file,
          convertedUrl: convertedImageUrl,
          stats
        }
      ]);
      
      return true;
    } catch (err) {
      setError(`Error processing ${file.name}: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
      return false;
    }
  };

  const handleConvert = async () => {
    if (!selectedFiles[currentFileIndex]) return;
    
    setIsLoading(true);
    setError(null);
    setConvertedFiles([]);
    
    const success = await processFile(selectedFiles[currentFileIndex]);
    setIsLoading(false);
    
    return success;
  };

  const handleBatchConvert = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setConvertedFiles([]);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const success = await processFile(selectedFiles[i]);
        if (!success) {
          setError(`Failed to convert ${selectedFiles[i].name}`);
          break;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!convertedUrl) return;
    
    try {
      const response = await fetch(convertedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = customFilename.trim() 
        ? `${customFilename.trim()}.jpg` 
        : `${generateDefaultFilename(selectedFiles[currentFileIndex].name)}.jpg`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  };

  return {
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
    handleFileChange,
    handleConvert,
    handleBatchConvert,
    handleDownload,
    loadPreview,
    setCurrentFileIndex,
    setError,
    setSelectedFiles
  };
}; 