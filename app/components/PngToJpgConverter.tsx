"use client";

import React, { useState } from "react";
import { ImageIcon, AlertCircle, Upload, ArrowLeft, ArrowRight, Check, Image as LucideImage, Download, Info, ChevronLeft, ChevronRight, FileArchive, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "./layout/MainLayout";
import ImageConversionOptions from "./converter/ImageConversionOptions";
import UploadTab from "./converter/UploadTab";
import PreviewTab from "./converter/PreviewTab";
import { ResultTab } from "./converter/ResultTab";
import ZipAnalyzer from "./converter/ZipAnalyzer";
import { ResizeControls } from "./converter/ResizeControls";
import { QualityControls } from "./converter/QualityControls";
import { useImageConverter } from "./hooks/useImageConverter";
import { formatFileSize } from "./utils/imageUtils";
import { StatCard } from "./ui/StatCard";
import { ProBadge } from "./ui/ProBadge";
import { WatermarkTool } from "./premium/WatermarkTool";
import { PresetManager } from "./premium/PresetManager";

// Define the ConversionStats type
type ConversionStats = {
  originalSize: number;
  convertedSize: number;
  reduction: number;
};

// Define the ConvertedFile type
type ConvertedFile = {
  file: File;
  convertedUrl: string;
  stats: ConversionStats;
};

export default function PngToJpgConverter() {
  const [activeTab, setActiveTab] = useState("upload");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [analyzingZip, setAnalyzingZip] = useState(false);
  const [activeConversionType, setActiveConversionType] = useState('image');
  const [activeImageFormat, setActiveImageFormat] = useState('png-to-jpg');
  const [isLoading, setIsLoading] = useState(false);

  const {
    previewUrl,
    error,
    quality,
    conversionStats: hookConversionStats,
    resizeEnabled,
    resizeWidth,
    resizeHeight,
    maintainAspectRatio,
    customFilename,
    preserveMetadata,
    setQuality,
    setResizeEnabled,
    setResizeWidth,
    setResizeHeight,
    setMaintainAspectRatio,
    setCustomFilename,
    setPreserveMetadata,
    handleConvert,
    handleDownload,
    loadPreview,
    setError
  } = useImageConverter(setActiveTab);

  const selectedFile = selectedFiles[currentFileIndex] || null;

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

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    
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
    
    // Otherwise, handle as regular files
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    loadPreview(files[0]);
    
    // Auto-switch to preview tab
    setActiveTab("preview");
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
    
    // Otherwise, handle as regular files
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
    
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    loadPreview(files[0]);
    
    // Auto-switch to preview tab
    setActiveTab("preview");
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

  const goToNextFile = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      loadPreview(selectedFiles[currentFileIndex + 1]);
    }
  };

  const goToPrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      loadPreview(selectedFiles[currentFileIndex - 1]);
    }
  };

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

  const handleClearAll = () => {
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    setError(null);
    setConvertedUrl(null);
    setConversionStats(null);
    setOriginalDimensions(null);
    setConvertedFiles([]);
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

  return (
    <MainLayout
      activeConversionType={activeConversionType}
      onConversionTypeChange={setActiveConversionType}
    >
      {activeConversionType === 'image' ? (
        <>
          <ImageConversionOptions
            activeFormat={activeImageFormat}
            onFormatChange={setActiveImageFormat}
          />
          <div className="border-t">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-8 pt-6">
                <TabsList className="grid grid-cols-3 w-full bg-slate-100/80 py-1 h-auto">
                  <TabsTrigger 
                    value="upload"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5 cursor-pointer"
                  >
                    <Upload size={18} className="mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    disabled={!selectedFile}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5 cursor-pointer"
                  >
                    <LucideImage size={18} className="mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="result" 
                    disabled={!convertedUrl && convertedFiles.length === 0}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 py-2.5 cursor-pointer"
                  >
                    <Check size={18} className="mr-2" />
                    Result
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-8">
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
                        <UploadTab
                          onFilesSelected={handleFileChange}
                          isDragOver={isDragOver}
                          setIsDragOver={setIsDragOver}
                        />
                      )}
                    </motion.div>
                  )}

                  {activeTab === "preview" && selectedFile && previewUrl && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <PreviewTab
                        selectedFiles={selectedFiles}
                        currentFileIndex={currentFileIndex}
                        quality={quality}
                        setQuality={setQuality}
                        preserveTransparency={false}
                        setPreserveTransparency={() => {}}
                        onConvert={handleConvert}
                        onFileClick={(index) => {
                          setCurrentFileIndex(index);
                          loadPreview(selectedFiles[index]);
                        }}
                        onRemoveFile={(index) => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                          if (currentFileIndex === index) {
                            setCurrentFileIndex(0);
                          } else if (currentFileIndex > index) {
                            setCurrentFileIndex(prev => prev - 1);
                          }
                        }}
                        onClearAll={handleClearAll}
                        onBatchConvert={handleBatchConvert}
                        isConverting={isLoading}
                      />
                    </motion.div>
                  )}

                  {activeTab === "result" && (
                    <ResultTab
                      convertedUrl={convertedUrl}
                      previewUrl={previewUrl}
                      showBeforeAfter={showBeforeAfter}
                      setShowBeforeAfter={setShowBeforeAfter}
                      conversionStats={conversionStats}
                      originalDimensions={originalDimensions}
                      resizeEnabled={resizeEnabled}
                      resizeWidth={resizeWidth}
                      resizeHeight={resizeHeight}
                      preserveMetadata={preserveMetadata}
                      customFilename={customFilename}
                      setCustomFilename={setCustomFilename}
                      handleDownload={handleDownload}
                      setActiveTab={setActiveTab}
                      convertedFiles={convertedFiles}
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                      currentFileIndex={currentFileIndex}
                      setCurrentFileIndex={setCurrentFileIndex}
                      loadPreview={loadPreview}
                    />
                  )}
                </AnimatePresence>
              </CardContent>
            </Tabs>
          </div>
          <WatermarkTool
            onApplyWatermark={(settings) => {
              // Handle watermark settings
              console.log(settings);
            }}
          />
          <PresetManager
            onApplyPreset={(preset) => {
              // Handle applying a preset
              console.log('Applying preset:', preset);
            }}
            onSavePreset={(preset) => {
              // Handle saving a new preset
              console.log('Saving preset:', preset);
            }}
            onDeletePreset={(presetId) => {
              // Handle deleting a preset
              console.log('Deleting preset:', presetId);
            }}
            currentSettings={{
              quality: 90,
              resizeEnabled: false,
              resizeWidth: 800,
              resizeHeight: 600,
              preserveMetadata: true
            }}
          />
        </>
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Coming Soon</h2>
          <p className="text-slate-600">
            We're working on adding more conversion types. Stay tuned for updates!
          </p>
        </div>
      )}
    </MainLayout>
  );
}