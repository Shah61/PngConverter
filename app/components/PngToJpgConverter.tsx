"use client";

import React from "react";
import { ImageIcon, AlertCircle, Upload, ArrowLeft, ArrowRight, Check, Image as LucideImage, Download, Info, ChevronLeft, ChevronRight, FileArchive } from "lucide-react";
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

export default function PngToJpgConverter() {
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
    handleFileChange,
    handleConvert,
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

  const selectedFile = selectedFiles[currentFileIndex] || null;

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files || []);
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
                          onSelect={handleFileChange} 
                          onCancel={() => {
                            setZipFile(null);
                            setAnalyzingZip(false);
                          }} 
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
                                onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
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
                          </motion.div>
                        </div>
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
                        
                        <QualityControls quality={quality} setQuality={setQuality} />
                      </div>
                      
                      <ResizeControls
                        resizeEnabled={resizeEnabled}
                        setResizeEnabled={setResizeEnabled}
                        resizeWidth={resizeWidth}
                        setResizeWidth={setResizeWidth}
                        resizeHeight={resizeHeight}
                        setResizeHeight={setResizeHeight}
                        maintainAspectRatio={maintainAspectRatio}
                        setMaintainAspectRatio={setMaintainAspectRatio}
                        originalDimensions={originalDimensions}
                      />
                      
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