"use client";

import React, { useState, useRef, useEffect } from "react";
import { ImageIcon, AlertCircle, Upload, ArrowLeft, ArrowRight, Check, Image as LucideImage, Download, Info, ChevronLeft, ChevronRight, FileArchive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Import custom components
import UploadTab from "./converter/UploadTab";
import PreviewTab from "./converter/PreviewTab";
import ResultTab from "./converter/ResultTab";
import ZipAnalyzer from "./converter/ZipAnalyzer";
import { isPngFile, generateDefaultFilename, formatFileSize } from "./utils/imageUtils";

export default function PngToJpgConverter() {
  // State management
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(90);
  const [activeTab, setActiveTab] = useState("upload");
  const [conversionStats, setConversionStats] = useState<{
    originalSize: number;
    convertedSize: number;
    reduction: number;
  } | null>(null);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [customFilename, setCustomFilename] = useState<string>("");
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [processingQueue, setProcessingQueue] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<number>(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [convertedFiles, setConvertedFiles] = useState<{
    file: File;
    convertedUrl: string;
    stats: {
      originalSize: number;
      convertedSize: number;
      reduction: number;
    };
  }[]>([]);
  
  // ZIP file handling states
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [analyzingZip, setAnalyzingZip] = useState<boolean>(false);

  // Get current file
  const selectedFile = selectedFiles[currentFileIndex] || null;

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Function to check if a file is a ZIP file
  const isZipFile = (file: File): boolean => {
    return file.type === 'application/zip' || 
           file.type === 'application/x-zip-compressed' || 
           file.name.toLowerCase().endsWith('.zip');
  };

  // Handle selected files from ZIP analyzer
  const handleZipFileSelection = (extractedFiles: File[]) => {
    setZipFile(null);
    setAnalyzingZip(false);
    
    if (extractedFiles.length === 0) {
      setError("No valid files were selected from the ZIP archive.");
      return;
    }

    // Reset states
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    setSelectedFiles(extractedFiles);
    setCurrentFileIndex(0);
    loadPreview(extractedFiles[0]);
    
    // Auto-switch to preview tab
    setActiveTab("preview");
  };

  // Cancel ZIP analysis
  const handleCancelZipAnalysis = () => {
    setZipFile(null);
    setAnalyzingZip(false);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const files = Array.from(event.target.files);
    console.log("Selected files:", files.length);
    
    // Check if we have a ZIP file
    const zipFiles = files.filter(file => isZipFile(file));
    if (zipFiles.length > 0) {
      // If multiple files were selected but one is a ZIP, prioritize the ZIP
      if (files.length > 1) {
        console.log("Multiple files selected including ZIP. Prioritizing ZIP file.");
      }
      
      // Process the first ZIP file
      setZipFile(zipFiles[0]);
      setAnalyzingZip(true);
      setActiveTab("upload"); // Keep on upload tab while analyzing
      return;
    }
    
    // Otherwise, handle as regular PNG files
    const pngFiles = files.filter(file => isPngFile(file));
    
    // Reset states
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    if (pngFiles.length === 0) {
      setError("Only PNG and ZIP files are supported.");
      setSelectedFiles([]);
      setPreviewUrl(null);
      setCustomFilename("");
      return;
    }
    
    setSelectedFiles(pngFiles);
    setCurrentFileIndex(0);
    loadPreview(pngFiles[0]);
    
    // Auto-switch to preview tab
    setActiveTab("preview");
  };

  // Load preview for a file
  const loadPreview = (file: File) => {
    // Create object URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Get original image dimensions
    const img = document.createElement('img');
    img.onload = () => {
      setOriginalDimensions({width: img.width, height: img.height});
      setResizeWidth(img.width);
      setResizeHeight(img.height);
    };
    img.src = objectUrl;
    
    // Set default custom filename (without extension)
    setCustomFilename(generateDefaultFilename(file.name));
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files || []);
    console.log("Dropped files:", files.length);
    
    if (files.length === 0) return;
    
    // Check if we have a ZIP file
    const zipFiles = files.filter(file => isZipFile(file));
    if (zipFiles.length > 0) {
      // If multiple files were dropped but one is a ZIP, prioritize the ZIP
      if (files.length > 1) {
        console.log("Multiple files dropped including ZIP. Prioritizing ZIP file.");
      }
      
      // Process the first ZIP file
      setZipFile(zipFiles[0]);
      setAnalyzingZip(true);
      return;
    }
    
    // Otherwise, handle as regular PNG files
    const pngFiles = files.filter(file => isPngFile(file));
    
    if (pngFiles.length === 0) {
      setError("Only PNG and ZIP files are supported.");
      return;
    }
    
    // Reset states
    setError(null);
    setConvertedUrl(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    setSelectedFiles(pngFiles);
    setCurrentFileIndex(0);
    loadPreview(pngFiles[0]);
    
    // Auto-switch to preview tab
    setActiveTab("preview");
  };

  // Handle drag over and leave
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

  // Handle width change maintaining aspect ratio
  const handleWidthChange = (value: number) => {
    setResizeWidth(value);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeHeight(Math.round(value / aspectRatio));
    }
  };

  // Handle height change maintaining aspect ratio
  const handleHeightChange = (value: number) => {
    setResizeHeight(value);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(value * aspectRatio));
    }
  };

  // Process a single file
  const processFile = async (file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('quality', quality.toString());
      formData.append('preserve_metadata', preserveMetadata.toString());
      
      // Add resize parameters if enabled
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
      
      // Construct full URL to the converted image
      const convertedImageUrl = `http://localhost:5002${data.jpgUrl}`;
      setConvertedUrl(convertedImageUrl);
      
      // Calculate size reduction
      const originalSize = file.size;
      
      // Fetch the converted file to get its size
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
      
      // Add to converted files
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

  // Handle file conversion
  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    setConvertedFiles([]);
    
    if (selectedFiles.length > 1) {
      // Batch processing
      setProcessingQueue(true);
      setProcessedFiles(0);
      
      let successCount = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentFileIndex(i);
        loadPreview(selectedFiles[i]);
        
        const success = await processFile(selectedFiles[i]);
        if (success) {
          successCount++;
        }
        
        setProcessedFiles(i + 1);
      }
      
      setProcessingQueue(false);
      setError(successCount < selectedFiles.length 
        ? `Processed ${successCount} of ${selectedFiles.length} files. Some files encountered errors.` 
        : null);
      
      // Switch to result tab
      setActiveTab("result");
    } else {
      // Single file processing
      const success = await processFile(selectedFile);
      if (success) {
        // Switch to result tab
        setActiveTab("result");
      }
    }
    
    setIsLoading(false);
  };

  // Handle download
  const handleDownload = async () => {
    if (!convertedUrl) return;
    
    try {
      // Fetch the image as a blob
      const response = await fetch(convertedUrl);
      const blob = await response.blob();
      
      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create link element
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Use custom filename if provided, otherwise use original name or default
      const filename = customFilename.trim() 
        ? `${customFilename.trim()}.jpg` 
        : (selectedFile ? `${generateDefaultFilename(selectedFile.name)}.jpg` : 'converted-image.jpg');
      
      link.download = filename;
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  };

  // Handle download all
  const handleDownloadAll = async () => {
    if (convertedFiles.length === 0) return;
    
    try {
      for (const item of convertedFiles) {
        const response = await fetch(item.convertedUrl);
        const blob = await response.blob();
        
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${generateDefaultFilename(item.file.name)}.jpg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (err) {
      setError(`Batch download failed: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  };

  // Navigate to next file in batch
  const goToNextFile = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      loadPreview(selectedFiles[currentFileIndex + 1]);
    }
  };

  // Navigate to previous file in batch
  const goToPrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      loadPreview(selectedFiles[currentFileIndex - 1]);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="overflow-hidden shadow-xl border-0 rounded-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">PNG to JPG Converter</CardTitle>
                <CardDescription className="text-indigo-100 mt-2 text-lg">
                  Convert PNG images to JPG format with advanced options
                </CardDescription>
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                <ImageIcon size={32} className="text-white" />
              </div>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-8 pt-6">
              <TabsList className="grid grid-cols-3 w-full bg-slate-100/80">
                <TabsTrigger 
                  value="upload"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5"
                >
                  <Upload size={18} className="mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  disabled={!selectedFile}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5"
                >
                  <LucideImage size={18} className="mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="result" 
                  disabled={!convertedUrl && convertedFiles.length === 0}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5"
                >
                  <Check size={18} className="mr-2" />
                  Result
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-8">
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Batch Processing Indicator */}
              <AnimatePresence>
                {processingQueue && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="mb-6 bg-indigo-50 border-indigo-200">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <AlertTitle className="text-indigo-700">Processing Batch</AlertTitle>
                          <AlertDescription className="text-indigo-600">
                            Processing file {processedFiles} of {selectedFiles.length}
                          </AlertDescription>
                        </div>
                        <div className="w-8 h-8 border-4 border-t-transparent border-indigo-600 rounded-full animate-spin"></div>
                      </div>
                      <div className="w-full bg-indigo-100 rounded-full h-3 mt-3 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${(processedFiles / selectedFiles.length) * 100}%` }}
                        ></div>
                      </div>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File navigation for batch processing */}
              <AnimatePresence>
                {selectedFiles.length > 1 && selectedFile && activeTab !== "upload" && (
                  <motion.div 
                    className="flex items-center justify-between mb-6 bg-slate-50 p-3 rounded-lg border"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentFileIndex === 0}
                      onClick={goToPrevFile}
                      className="flex items-center"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </Button>
                    <span className="font-medium text-slate-700">
                      File <span className="text-indigo-600">{currentFileIndex + 1}</span> of {selectedFiles.length}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentFileIndex === selectedFiles.length - 1}
                      onClick={goToNextFile}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {activeTab === "upload" && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {analyzingZip && zipFile ? (
                      <ZipAnalyzer 
                        zipFile={zipFile} 
                        onSelect={handleZipFileSelection} 
                        onCancel={handleCancelZipAnalysis} 
                      />
                    ) : (
                      <div 
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                          isDragOver 
                            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <motion.div 
                          className="flex flex-col items-center justify-center space-y-6"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div 
                            variants={itemVariants}
                            className={`relative p-6 rounded-full ${isDragOver ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 text-indigo-500'} transition-colors duration-300`}
                          >
                            <Upload size={42} />
                            {isDragOver && (
                              <motion.div 
                                className="absolute inset-0 rounded-full border-4 border-indigo-400"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </motion.div>
                          
                          <motion.div variants={itemVariants}>
                            <h3 className="text-2xl font-bold text-slate-800">Drag & drop your PNG files here</h3>
                            <p className="text-slate-500 mt-2">or click to browse files</p>
                          </motion.div>
                          
                          <motion.div variants={itemVariants}>
                            <Button 
                              onClick={() => document.getElementById('file-input')?.click()}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                              size="lg"
                            >
                              <Upload size={20} className="mr-2" />
                              Select PNG Files
                            </Button>
                            <input
                              id="file-input"
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".png,.zip,application/zip,application/x-zip-compressed"
                              multiple={true}
                            />
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="flex gap-2 items-center">
                            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                              PNG files only
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                              Batch processing supported
                            </Badge>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="text-sm text-slate-500 max-w-md">
                            Select multiple PNG files for batch conversion. All files will be processed with the same settings.
                          </motion.div>
                        </motion.div>
                      </div>
                    )}
                    
                    <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex gap-3">
                        <div className="text-blue-500 shrink-0 mt-0.5">
                          <Info size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-700">Advanced Features</h4>
                          <ul className="mt-2 text-sm text-blue-600 space-y-1">
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              Adjust JPG quality to control file size
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              Resize images during conversion
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              See before/after comparison
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              Convert multiple files in one go
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "preview" && selectedFile && previewUrl && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden border flex items-center justify-center relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                      {originalDimensions && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                          {originalDimensions.width} × {originalDimensions.height} px
                        </div>
                      )}
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">File Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File name:</span>
                            <span className="font-medium text-slate-800 truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File size:</span>
                            <span className="font-medium text-slate-800">{formatFileSize(selectedFile.size)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File type:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {selectedFile.type}
                            </Badge>
                          </div>
                          {originalDimensions && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Dimensions:</span>
                              <span className="font-medium text-slate-800">
                                {originalDimensions.width} × {originalDimensions.height}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">JPG Quality</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Quality:</span>
                            <Badge className={`bg-white px-3 py-1 ${quality >= 80 ? 'text-green-600' : quality >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                              {quality}%
                            </Badge>
                          </div>
                          
                          <div className="relative pt-1">
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={quality}
                              onChange={(e) => setQuality(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                              <span>Low</span>
                              <span>Medium</span>
                              <span>High</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-500">
                            Higher quality results in larger file size. Lower quality creates smaller files.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-slate-800">Resize Image</h3>
                        <div className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-200"
                             onClick={() => setResizeEnabled(!resizeEnabled)}>
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            resizeEnabled ? 'translate-x-6 bg-indigo-500' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {resizeEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 space-y-4"
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="aspectRatio"
                                checked={maintainAspectRatio}
                                onChange={() => setMaintainAspectRatio(!maintainAspectRatio)}
                                className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="aspectRatio" className="text-sm font-medium text-slate-700">
                                Maintain aspect ratio
                              </label>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <label htmlFor="width" className="text-sm font-medium text-slate-700">
                                    Width
                                  </label>
                                  <span className="text-sm text-indigo-600 font-mono">{resizeWidth}px</span>
                                </div>
                                <input
                                  type="range"
                                  id="width"
                                  min={50}
                                  max={originalDimensions ? originalDimensions.width * 2 : 2000}
                                  value={resizeWidth}
                                  onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <input
                                  type="number"
                                  value={resizeWidth}
                                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 50)}
                                  className="w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  min={50}
                                />
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <label htmlFor="height" className="text-sm font-medium text-slate-700">
                                    Height
                                  </label>
                                  <span className="text-sm text-indigo-600 font-mono">{resizeHeight}px</span>
                                </div>
                                <input
                                  type="range"
                                  id="height"
                                  min={50}
                                  max={originalDimensions ? originalDimensions.height * 2 : 2000}
                                  value={resizeHeight}
                                  onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <input
                                  type="number"
                                  value={resizeHeight}
                                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 50)}
                                  className="w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  min={50}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-50">
                              <span className="text-slate-600 text-sm">New dimensions:</span>
                              <span className="font-medium text-indigo-700 font-mono">{resizeWidth} × {resizeHeight}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="flex justify-between items-center border-t border-b py-4 mt-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">Preserve Metadata</h3>
                          <div className="relative group">
                            <Info size={16} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              Maintains EXIF data like camera settings, date/time, and location information if present in the original PNG.
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-200"
                             onClick={() => setPreserveMetadata(!preserveMetadata)}>
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preserveMetadata ? 'translate-x-6 bg-indigo-500' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-4 mt-8">
                      <Button 
                        variant="outline"
                        size="lg"
                        onClick={() => setActiveTab("upload")}
                        className="px-6"
                      >
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleConvert} 
                        disabled={isLoading} 
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 flex-1 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                      >
                        {isLoading ? (
                          <>
                            <span className="mr-2">Converting</span>
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </>
                        ) : (
                          <>
                            Convert to JPG
                            <ArrowRight size={18} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {/* Before/After Comparison Toggle */}
                    {convertedUrl && previewUrl && (
                      <div className="mb-6 flex justify-end">
                        <button
                          className={`text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                            showBeforeAfter 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                        >
                          {showBeforeAfter ? 'Hide Comparison' : 'Show Before/After'}
                        </button>
                      </div>
                    )}

                    {/* Before/After Comparison View */}
                    <AnimatePresence>
                      {showBeforeAfter && convertedUrl && previewUrl && (
                        <motion.div 
                          className="mb-8 grid grid-cols-2 gap-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col">
                            <span className="text-center text-sm font-medium mb-2 bg-slate-100 py-1 rounded-t-lg">Before (PNG)</span>
                            <div className="aspect-video bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border">
                              <img 
                                src={previewUrl} 
                                alt="Original PNG" 
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-center text-sm font-medium mb-2 bg-indigo-100 py-1 rounded-t-lg text-indigo-700">After (JPG)</span>
                            <div className="aspect-video bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border">
                              <img 
                                src={convertedUrl} 
                                alt="Converted JPG" 
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {convertedUrl && conversionStats ? (
                      <div className="space-y-6">
                        <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border">
                          <img 
                            src={convertedUrl} 
                            alt="Converted JPG" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                          <h3 className="font-semibold text-lg text-green-800 mb-4">Conversion Successful!</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-green-50">
                              <div className="text-sm text-green-700 mb-1">Original Size</div>
                              <div className="font-semibold text-lg">{formatFileSize(conversionStats.originalSize)}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-50">
                              <div className="text-sm text-green-700 mb-1">Converted Size</div>
                              <div className="font-semibold text-lg">{formatFileSize(conversionStats.convertedSize)}</div>
                            </div>
                            <div className="col-span-2 bg-white rounded-lg p-4 border border-green-50 flex justify-between items-center">
                              <div>
                                <div className="text-sm text-green-700 mb-1">Space Saved</div>
                                <div className="font-semibold text-lg">
                                  {formatFileSize(conversionStats.originalSize - conversionStats.convertedSize)}
                                </div>
                              </div>
                              <Badge 
                                className={conversionStats.reduction > 0
                                  ? "bg-green-100 text-green-800 border-0 px-3 py-1.5 text-sm"
                                  : "bg-amber-100 text-amber-800 border-0 px-3 py-1.5 text-sm"
                                }
                              >
                                {conversionStats.reduction.toFixed(1)}% {conversionStats.reduction > 0 ? 'Reduction' : 'Increase'}
                              </Badge>
                            </div>
                          </div>
                          
                          {resizeEnabled && originalDimensions && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-green-50 flex items-center justify-between">
                              <span className="text-sm text-slate-600">Resized From:</span>
                              <span className="font-medium text-slate-800">
                                {originalDimensions.width} × {originalDimensions.height} → {resizeWidth} × {resizeHeight}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Custom Filename</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter filename (without extension)"
                                value={customFilename}
                                onChange={(e) => setCustomFilename(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <span className="flex items-center text-slate-500 bg-slate-50 px-3 rounded border">.jpg</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between gap-4 mt-6">
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={() => setActiveTab("preview")}
                              className="px-6"
                            >
                              <ArrowLeft size={18} className="mr-2" />
                              Back
                            </Button>
                            <Button 
                              onClick={handleDownload}
                              size="lg"
                              className="bg-indigo-600 hover:bg-indigo-700 flex-1 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            >
                              <Download size={18} className="mr-2" />
                              Download JPG
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : convertedFiles.length > 0 ? (
                      <div className="space-y-6">
                        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-green-800">Batch Conversion Complete</h3>
                            <Badge className="bg-green-100 text-green-800 border-0 px-3 py-1.5">
                              {convertedFiles.length} Files Converted
                            </Badge>
                          </div>
                          
                          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {convertedFiles.map((item, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-green-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-50 p-2 rounded">
                                    <Check size={18} className="text-indigo-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-800 truncate max-w-[200px]">
                                      {item.file.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {formatFileSize(item.file.size)} → {formatFileSize(item.stats.convertedSize)}
                                      <span className="ml-2 text-green-600">
                                        ({item.stats.reduction.toFixed(1)}% {item.stats.reduction > 0 ? 'saved' : 'increase'})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                                                  <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setConvertedUrl(item.convertedUrl);
                                    setConversionStats(item.stats);
                                    // Find the index of this file in the selectedFiles array
                                    const fileIndex = selectedFiles.findIndex(f => f.name === item.file.name && f.size === item.file.size);
                                    if (fileIndex >= 0) {
                                      setCurrentFileIndex(fileIndex);
                                    } else {
                                      // If not found (shouldn't happen), update selected files
                                      setSelectedFiles([item.file, ...selectedFiles]);
                                      setCurrentFileIndex(0);
                                    }
                                    const preview = URL.createObjectURL(item.file);
                                    setPreviewUrl(preview);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                >
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            onClick={handleDownloadAll}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 py-2.5"
                          >
                            <Download size={18} className="mr-2" />
                            Download All JPGs
                          </Button>
                        </div>

                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab("upload")}
                          className="mt-4 w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          Convert More Images
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <LucideImage size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">No converted images yet</h3>
                        <p className="text-slate-500 mt-2">
                          Go to the Preview tab to convert your PNG files
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-6"
                          onClick={() => setActiveTab("preview")}
                        >
                          Back to Preview
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Tabs>

          <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-b-xl px-8 py-6">
            <div className="flex flex-col md:flex-row md:justify-between w-full gap-2 md:gap-0 text-sm text-slate-500">
              <p>Powered by Next.js + Flask</p>
              <p>© {new Date().getFullYear()} PNG to JPG Converter</p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}