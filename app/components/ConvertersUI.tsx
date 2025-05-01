"use client"
import React from "react";
import { ImageIcon, AlertCircle, Upload, ArrowLeft, ArrowRight, Check, Image as LucideImage, Download, Info, ChevronLeft, ChevronRight, FileArchive, FileAudio, FileVideo, File, Trash2, Loader2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "./layout/MainLayout";
import ImageConverter, { ImageConverterRenderProps } from "./image-converter/ImageConverter";
import { FileTypeDetector } from "./image-converter/FileTypeDetector";
import PreviewTab from "./image-converter/PreviewTab";
import { ResultTab } from "./image-converter/ResultTab";
import DocumentConverter, { DocumentConverterRenderProps } from "./document-converter/DocumentConverter";
import AudioConverter, { AudioConverterRenderProps } from "./audio-converter/AudioConverter";
import VideoConverter, { VideoConverterRenderProps } from "./video-converter/VideoConverter";
import ArchiveConverter, { ArchiveConverterRenderProps } from "./archive-converter/ArchiveConverter";
import ZipAnalyzer from "./utils/ZipAnalyzer";
import FileTypeErrorAlert from "./ui/FileTypeErrorAlert";
import { typeToTabMap, validateFileType, getRecommendedTabForFile } from "../utils/fileUtils";

export default function ConvertersUI() {
  const [activeConversionType, setActiveConversionType] = React.useState('image');
  
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

  // Render the image converter UI
  const renderImageConverterUI = (props: ImageConverterRenderProps) => {
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
      activeTab,
      showBeforeAfter,
      isDragOver,
      zipFile,
      analyzingZip,
      activeConversionType,
      activeImageFormat,
      showFileTypeDetector,
      selectedFile,
      
      // Actions and setters
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
      handleDrop,
      handleDragOver,
      handleDragLeave,
      handleFormatSelect,
      setActiveTab,
      setShowBeforeAfter,
      setIsDragOver,
      setZipFile,
      setAnalyzingZip,
      setShowFileTypeDetector,
      setSelectedFiles,
      setCurrentFileIndex,
      setError
    } = props;

    return (
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
                <FileTypeErrorAlert
                  message={error}
                  onDismiss={() => setError(null)}
                  showSwitchButton={error.includes('Please use the') || error.includes('Converter')}
                  switchTabLabel={
                    error.includes('Image') ? 'Go to Image Converter' : 
                    error.includes('Audio') ? 'Go to Audio Converter' : 
                    error.includes('Video') ? 'Go to Video Converter' : 
                    error.includes('Archive') ? 'Go to Archive Converter' : ''
                  }
                  onSwitchTab={() => {
                    if (error.includes('Image')) {
                      setActiveConversionType('image');
                    } else if (error.includes('Audio')) {
                      setActiveConversionType('audio');
                    } else if (error.includes('Video')) {
                      setActiveConversionType('video');
                    } else if (error.includes('Archive')) {
                      setActiveConversionType('archive');
                    }
                    setError(null);
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {showFileTypeDetector && selectedFile ? (
                <motion.div
                  key="file-type-detector"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <FileTypeDetector
                    file={selectedFile}
                    onFormatSelect={handleFormatSelect}
                    onCancel={() => setShowFileTypeDetector(false)}
                  />
                </motion.div>
              ) : activeTab === "upload" && (
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
                      converterType="image"
                      onSelect={(files) => {
                        setSelectedFiles(files);
                        setAnalyzingZip(false);
                        setZipFile(null);
                        setShowFileTypeDetector(true);
                      }} 
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
                          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your files here</h3>
                          <p className="text-slate-500 mt-2">or click to browse files</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            onClick={() => document.getElementById('file-input')?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            size="lg"
                          >
                            <Upload size={20} className="mr-2" />
                            Select Files
                          </Button>
                          <input
                            id="file-input"
                            type="file"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleFileChange(files); // Use the same handler that does validation
                            }}
                            className="hidden"
                            accept="image/*,.zip"
                            multiple={true}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            PNG, JPEG, GIF, WebP and more
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            ZIP archives supported
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "preview" && selectedFile && previewUrl && (
                <PreviewTab
                  selectedFiles={selectedFiles}
                  currentFileIndex={currentFileIndex}
                  quality={quality}
                  setQuality={setQuality}
                  preserveMetadata={preserveMetadata}
                  setPreserveMetadata={setPreserveMetadata}
                  onConvert={handleConvert}
                  onFileClick={setCurrentFileIndex}
                  onRemoveFile={(index) => {
                    const newFiles = [...selectedFiles];
                    newFiles.splice(index, 1);
                    setSelectedFiles(newFiles);
                    if (currentFileIndex === index) {
                      setCurrentFileIndex(0);
                    } else if (currentFileIndex > index) {
                      setCurrentFileIndex(currentFileIndex - 1);
                    }
                  }}
                  onClearAll={() => {
                    setSelectedFiles([]);
                    setCurrentFileIndex(0);
                  }}
                  onBatchConvert={handleConvert}
                  isConverting={isLoading}
                  resizeEnabled={resizeEnabled}
                  setResizeEnabled={setResizeEnabled}
                  resizeWidth={resizeWidth}
                  setResizeWidth={setResizeWidth}
                  resizeHeight={resizeHeight}
                  setResizeHeight={setResizeHeight}
                  maintainAspectRatio={maintainAspectRatio}
                  setMaintainAspectRatio={setMaintainAspectRatio}
                  originalDimensions={originalDimensions}
                  activeImageFormat={activeImageFormat}
                />
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
    );
  };

  // Render the document converter UI
  const renderDocumentConverterUI = (props: DocumentConverterRenderProps) => {
    const {
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
      
      // Actions and setters
      setCustomFilename,
      handleFileChange,
      handleConvert,
      handleDownload,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      setActiveTab,
      setIsDragOver,
      setSelectedFiles,
      setCurrentFileIndex,
      setError,
      setActiveDocFormat,
      getFileType
    } = props;

    // Add state for ZIP handling
    const [zipFile, setZipFile] = React.useState<File | null>(null);
    const [analyzingZip, setAnalyzingZip] = React.useState(false);

    // Update the document version of handleDrop to handle ZIP files
    const handleDocumentDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(event.dataTransfer.files || []);
      
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
      const invalidFiles = files.filter(file => !validateFileType(file, 'document'));
      
      if (invalidFiles.length > 0) {
        // Get recommended tab for the first invalid file
        const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
        
        // Set error message
        if (recommendedTab && recommendedTab !== 'zip') {
          const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
          setError(`This file is not a supported document file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
        } else {
          setError('One or more files are not supported document files. Please select only document files (PDF, DOCX, TXT, etc.).');
        }
        return;
      }
      
      // All files valid, proceed with handling
      handleFileChange(files);
    };

    return (
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
                <File size={18} className="mr-2" />
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
                <FileTypeErrorAlert
                  message={error}
                  onDismiss={() => setError(null)}
                  showSwitchButton={error.includes('Please use the') || error.includes('Converter')}
                  switchTabLabel={
                    error.includes('Image') ? 'Go to Image Converter' : 
                    error.includes('Audio') ? 'Go to Audio Converter' : 
                    error.includes('Video') ? 'Go to Video Converter' : 
                    error.includes('Archive') ? 'Go to Archive Converter' : ''
                  }
                  onSwitchTab={() => {
                    if (error.includes('Image')) {
                      setActiveConversionType('image');
                    } else if (error.includes('Audio')) {
                      setActiveConversionType('audio');
                    } else if (error.includes('Video')) {
                      setActiveConversionType('video');
                    } else if (error.includes('Archive')) {
                      setActiveConversionType('archive');
                    }
                    setError(null);
                  }}
                />
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
                      converterType="document"
                      onSelect={(files) => {
                        setSelectedFiles(files);
                        setAnalyzingZip(false);
                        setZipFile(null);
                        setActiveTab("preview");
                      }} 
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
                      onDrop={handleDocumentDrop}
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
                          <File size={42} />
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
                          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your documents here</h3>
                          <p className="text-slate-500 mt-2">or click to browse files</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            onClick={() => document.getElementById('document-file-input')?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            size="lg"
                          >
                            <Upload size={20} className="mr-2" />
                            Select Documents
                          </Button>
                          <input
                            id="document-file-input"
                            type="file"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
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
                              const invalidFiles = files.filter(file => !validateFileType(file, 'document'));
                              
                              if (invalidFiles.length > 0) {
                                // Get recommended tab for the first invalid file
                                const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
                                
                                // Set error message
                                if (recommendedTab && recommendedTab !== 'zip') {
                                  const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
                                  setError(`This file is not a supported document file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
                                } else {
                                  setError('One or more files are not supported document files. Please select only document files (PDF, DOCX, TXT, etc.).');
                                }
                                return;
                              }
                              
                              // All files valid, proceed with handling
                              setSelectedFiles(files);
                              if (files.length > 0) {
                                setActiveTab("preview");
                              }
                            }}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.zip"
                            multiple={true}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            PDF, DOCX, TXT and more
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            ZIP archives supported
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "preview" && selectedFile && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="aspect-square rounded-lg border bg-muted overflow-hidden flex items-center justify-center text-center">
                        {previewUrl ? (
                          selectedFile.type.includes('application/pdf') ? (
                            <embed src={previewUrl} type="application/pdf" width="100%" height="100%" />
                          ) : (
                            <div className="p-6 flex flex-col items-center">
                              <File className="w-12 h-12 text-indigo-500 mb-3" />
                              <span className="text-md font-medium">{selectedFile.name}</span>
                              <span className="text-sm text-gray-500">Preview not available</span>
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <File className="w-12 h-12 text-muted-foreground mb-2" />
                            <span className="text-sm text-slate-500">Loading preview...</span>
                          </div>
                        )}
                      </div>

                      {/* File Details Card */}
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">File Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File name:</span>
                            <span className="font-medium text-slate-800 truncate max-w-[200px]">{selectedFile?.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File size:</span>
                            <span className="font-medium text-slate-800">{selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File type:</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {selectedFile?.type || selectedFile?.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Conversion Options */}
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">Conversion Options</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="format-select" className="text-sm font-medium text-slate-700 block">
                              Convert to Format
                            </label>
                            <select 
                              id="format-select"
                              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={activeDocFormat}
                              onChange={(e) => setActiveDocFormat(e.target.value)}
                            >
                              {selectedFile && getFileType(selectedFile) === 'pdf' && (
                                <>
                                  <option value="pdf-to-docx">PDF to DOCX</option>
                                  <option value="pdf-to-txt">PDF to TXT</option>
                                </>
                              )}
                              {selectedFile && (getFileType(selectedFile) === 'docx' || getFileType(selectedFile) === 'doc') && (
                                <option value="docx-to-pdf">DOCX to PDF</option>
                              )}
                              {selectedFile && getFileType(selectedFile) === 'txt' && (
                                <option value="txt-to-pdf">TXT to PDF</option>
                              )}
                              {/* XLS to CSV conversion option */}
                              {selectedFile && (getFileType(selectedFile) === 'xls' || getFileType(selectedFile) === 'xlsx') && (
                                <option value="xls-to-csv">XLS to CSV</option>
                              )}
                              {/* CSV to XLS conversion option */}
                              {selectedFile && getFileType(selectedFile) === 'csv' && (
                                <option value="csv-to-xls">CSV to XLS</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Selected Files List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">Selected Files</h4>
                            <Badge variant="secondary">{selectedFiles.length} files</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFiles([]);
                                setCurrentFileIndex(0);
                                setActiveTab("upload");
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All
                            </Button>
                            <Button
                              onClick={handleConvert}
                              disabled={isLoading}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Converting...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Convert
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                currentFileIndex === index
                                  ? "border-indigo-300 bg-indigo-50"
                                  : "border-slate-200"
                              }`}
                            >
                              <div
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => setCurrentFileIndex(index)}
                              >
                                <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
                                  <File className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newFiles = [...selectedFiles];
                                  newFiles.splice(index, 1);
                                  setSelectedFiles(newFiles);
                                  if (currentFileIndex === index) {
                                    setCurrentFileIndex(0);
                                  } else if (currentFileIndex > index) {
                                    setCurrentFileIndex(currentFileIndex - 1);
                                  }
                                  if (newFiles.length === 0) {
                                    setActiveTab("upload");
                                  }
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "result" && (
                <div className="space-y-6">
                  {convertedUrl ? (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      <h3 className="font-semibold text-lg text-green-800 mb-4">Conversion Successful!</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Original Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.originalSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Converted Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.convertedSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
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
                            <span className="flex items-center text-slate-500 bg-slate-50 px-3 rounded border">
                              {activeDocFormat.split('-to-')[1]}
                            </span>
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
                            Download {activeDocFormat.split('-to-')[1].toUpperCase()}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : convertedFiles.length > 0 ? (
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
                                  {(item.file.size / 1024).toFixed(2)} KB → {(item.stats.convertedSize / 1024).toFixed(2)} KB
                                  <span className="ml-2 text-green-600">
                                    ({item.stats.reduction.toFixed(1)}% {item.stats.reduction > 0 ? 'saved' : 'increase'})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => window.open(item.convertedUrl, '_blank')}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Download size={16} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedFiles([]);
                          setCurrentFileIndex(0);
                          setActiveTab("upload");
                        }}
                        className="w-full mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        variant="outline"
                      >
                        Convert More Documents
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <File size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">No converted documents yet</h3>
                      <p className="text-slate-500 mt-2">
                        Go to the Preview tab to convert your documents
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
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Tabs>
      </div>
    );
  };

  // Render the audio converter UI
  const renderAudioConverterUI = (props: AudioConverterRenderProps) => {
    const {
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
      
      // Actions and setters
      setCustomFilename,
      handleFileChange,
      handleConvert,
      handleDownload,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      setActiveTab,
      setIsDragOver,
      setSelectedFiles,
      setCurrentFileIndex,
      setError,
      setActiveAudioFormat
    } = props;
    
    // Add state for ZIP handling
    const [zipFile, setZipFile] = React.useState<File | null>(null);
    const [analyzingZip, setAnalyzingZip] = React.useState(false);

    // Update the audio version of handleDrop to handle ZIP files
    const handleAudioDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(event.dataTransfer.files || []);
      
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
      const invalidFiles = files.filter(file => !validateFileType(file, 'audio'));
      
      if (invalidFiles.length > 0) {
        // Get recommended tab for the first invalid file
        const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
        
        // Set error message
        if (recommendedTab && recommendedTab !== 'zip') {
          const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
          setError(`This file is not a supported audio file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
        } else {
          setError('One or more files are not supported audio files. Please select only audio files (MP3, WAV, OGG, etc.).');
        }
        return;
      }
      
      // All files valid, proceed with handling
      handleFileChange(files);
    };

    return (
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
                <FileAudio size={18} className="mr-2" />
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
                <FileTypeErrorAlert
                  message={error}
                  onDismiss={() => setError(null)}
                  showSwitchButton={error.includes('Please use the') || error.includes('Converter')}
                  switchTabLabel={
                    error.includes('Image') ? 'Go to Image Converter' : 
                    error.includes('Audio') ? 'Go to Audio Converter' : 
                    error.includes('Video') ? 'Go to Video Converter' : 
                    error.includes('Archive') ? 'Go to Archive Converter' : ''
                  }
                  onSwitchTab={() => {
                    if (error.includes('Image')) {
                      setActiveConversionType('image');
                    } else if (error.includes('Audio')) {
                      setActiveConversionType('audio');
                    } else if (error.includes('Video')) {
                      setActiveConversionType('video');
                    } else if (error.includes('Archive')) {
                      setActiveConversionType('archive');
                    }
                    setError(null);
                  }}
                />
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
                      converterType="audio"
                      onSelect={(files) => {
                        setSelectedFiles(files);
                        setAnalyzingZip(false);
                        setZipFile(null);
                        setActiveTab("preview");
                      }} 
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
                      onDrop={handleAudioDrop}
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
                          <FileAudio size={42} />
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
                          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your audio files here</h3>
                          <p className="text-slate-500 mt-2">or click to browse files</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            onClick={() => document.getElementById('audio-file-input')?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            size="lg"
                          >
                            <Upload size={20} className="mr-2" />
                            Select Audio Files
                          </Button>
                          <input
                            id="audio-file-input"
                            type="file"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
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
                              const invalidFiles = files.filter(file => !validateFileType(file, 'audio'));
                              
                              if (invalidFiles.length > 0) {
                                // Get recommended tab for the first invalid file
                                const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
                                
                                // Set error message
                                if (recommendedTab && recommendedTab !== 'zip') {
                                  const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
                                  setError(`This file is not a supported audio file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
                                } else {
                                  setError('One or more files are not supported audio files. Please select only audio files (MP3, WAV, OGG, etc.).');
                                }
                                return;
                              }
                              
                              // All files valid, proceed with handling
                              handleFileChange(files);
                            }}
                            className="hidden"
                            accept=".mp3,.wav,.ogg,.flac,.aac,.m4a,.wma,.zip"
                            multiple={true}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            MP3, WAV, OGG and more
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            ZIP archives supported
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "preview" && selectedFile && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="aspect-square rounded-lg border bg-slate-50 overflow-hidden flex items-center justify-center text-center">
                        {previewUrl ? (
                          <div className="p-6 w-full flex flex-col items-center">
                            <FileAudio className="w-16 h-16 text-indigo-500 mb-3" />
                            <p className="font-medium text-lg text-slate-700 truncate max-w-[90%]">{selectedFile.name}</p>
                            <audio 
                              controls 
                              className="mt-6 w-full max-w-md" 
                              src={previewUrl}
                              controlsList="nodownload"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <FileAudio className="w-12 h-12 text-muted-foreground mb-2" />
                            <span className="text-sm text-slate-500">Loading preview...</span>
                          </div>
                        )}
                      </div>

                      {/* File Details Card */}
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">File Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File name:</span>
                            <span className="font-medium text-slate-800 truncate max-w-[200px]">{selectedFile?.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File size:</span>
                            <span className="font-medium text-slate-800">{selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File type:</span>
                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0">
                              {selectedFile?.type || selectedFile?.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-4">Conversion Options</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Output Format</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <Button 
                                variant={activeAudioFormat === 'mp3-to-wav' ? "default" : "outline"}
                                className={activeAudioFormat === 'mp3-to-wav' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveAudioFormat('mp3-to-wav')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.mp3')}
                              >
                                MP3 to WAV
                              </Button>
                              <Button 
                                variant={activeAudioFormat === 'wav-to-mp3' ? "default" : "outline"}
                                className={activeAudioFormat === 'wav-to-mp3' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveAudioFormat('wav-to-mp3')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.wav')}
                              >
                                WAV to MP3
                              </Button>
                              <Button 
                                variant={activeAudioFormat === 'ogg-to-mp3' ? "default" : "outline"}
                                className={activeAudioFormat === 'ogg-to-mp3' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveAudioFormat('ogg-to-mp3')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.ogg')}
                              >
                                OGG to MP3
                              </Button>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Custom Filename</label>
                            <input
                              type="text"
                              placeholder="Enter filename (without extension)"
                              value={customFilename}
                              onChange={(e) => setCustomFilename(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 justify-end">
                        {selectedFiles.length > 1 && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                              disabled={currentFileIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-slate-600">
                              {currentFileIndex + 1} / {selectedFiles.length}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentFileIndex(Math.min(selectedFiles.length - 1, currentFileIndex + 1))}
                              disabled={currentFileIndex === selectedFiles.length - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <Button 
                          onClick={handleConvert}
                          disabled={isLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Convert Now
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* File list for batch conversion */}
                      {selectedFiles.length > 1 && (
                        <div className="bg-slate-50 rounded-xl p-4 border">
                          <h4 className="font-medium text-slate-800 mb-3">Files to Convert</h4>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedFiles.map((file, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className={`flex items-center justify-between p-2 rounded ${
                                  currentFileIndex === index ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-100'
                                }`}
                              >
                                <div
                                  className="flex items-center gap-3 cursor-pointer flex-1"
                                  onClick={() => setCurrentFileIndex(index)}
                                >
                                  <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
                                    <FileAudio className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newFiles = [...selectedFiles];
                                    newFiles.splice(index, 1);
                                    setSelectedFiles(newFiles);
                                    if (currentFileIndex === index) {
                                      setCurrentFileIndex(0);
                                    } else if (currentFileIndex > index) {
                                      setCurrentFileIndex(currentFileIndex - 1);
                                    }
                                    if (newFiles.length === 0) {
                                      setActiveTab("upload");
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "result" && (
                <div className="space-y-6">
                  {convertedUrl ? (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      <h3 className="font-semibold text-lg text-green-800 mb-4">Conversion Successful!</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Original Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.originalSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Converted Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.convertedSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
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
                            <span className="flex items-center text-slate-500 bg-slate-50 px-3 rounded border">
                              {activeAudioFormat.split('-to-')[1]}
                            </span>
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
                            Download {activeAudioFormat.split('-to-')[1].toUpperCase()}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : convertedFiles.length > 0 ? (
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
                                  {(item.file.size / 1024).toFixed(2)} KB → {(item.stats.convertedSize / 1024).toFixed(2)} KB
                                  <span className="ml-2 text-green-600">
                                    ({item.stats.reduction.toFixed(1)}% {item.stats.reduction > 0 ? 'saved' : 'increase'})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => window.open(item.convertedUrl, '_blank')}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Download size={16} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedFiles([]);
                          setCurrentFileIndex(0);
                          setActiveTab("upload");
                        }}
                        className="w-full mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        variant="outline"
                      >
                        Convert More Audio Files
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FileAudio size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">No converted audio files yet</h3>
                      <p className="text-slate-500 mt-2">
                        Go to the Preview tab to convert your audio files
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
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Tabs>
      </div>
    );
  };

  // Render the video converter UI
  const renderVideoConverterUI = (props: VideoConverterRenderProps) => {
    const {
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
      
      // Actions and setters
      setQuality,
      setCustomFilename,
      handleFileChange,
      handleConvert,
      handleDownload,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      setActiveTab,
      setIsDragOver,
      setSelectedFiles,
      setCurrentFileIndex,
      setError,
      setActiveVideoFormat
    } = props;
    
    // Add state for ZIP handling
    const [zipFile, setZipFile] = React.useState<File | null>(null);
    const [analyzingZip, setAnalyzingZip] = React.useState(false);

    // Update the video version of handleDrop to handle ZIP files
    const handleVideoDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(event.dataTransfer.files || []);
      
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
      const invalidFiles = files.filter(file => !validateFileType(file, 'video'));
      
      if (invalidFiles.length > 0) {
        // Get recommended tab for the first invalid file
        const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
        
        // Set error message
        if (recommendedTab && recommendedTab !== 'zip') {
          const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
          setError(`This file is not a supported video file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
        } else {
          setError('One or more files are not supported video files. Please select only video files (MP4, WEBM, AVI, etc.).');
        }
        return;
      }
      
      // All files valid, proceed with handling
      handleFileChange(files);
    };

    return (
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
                <FileVideo size={18} className="mr-2" />
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
                <FileTypeErrorAlert
                  message={error}
                  onDismiss={() => setError(null)}
                  showSwitchButton={error.includes('Please use the') || error.includes('Converter')}
                  switchTabLabel={
                    error.includes('Image') ? 'Go to Image Converter' : 
                    error.includes('Audio') ? 'Go to Audio Converter' : 
                    error.includes('Video') ? 'Go to Video Converter' : 
                    error.includes('Archive') ? 'Go to Archive Converter' : ''
                  }
                  onSwitchTab={() => {
                    if (error.includes('Image')) {
                      setActiveConversionType('image');
                    } else if (error.includes('Audio')) {
                      setActiveConversionType('audio');
                    } else if (error.includes('Video')) {
                      setActiveConversionType('video');
                    } else if (error.includes('Archive')) {
                      setActiveConversionType('archive');
                    }
                    setError(null);
                  }}
                />
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
                      converterType="video"
                      onSelect={(files) => {
                        setSelectedFiles(files);
                        setAnalyzingZip(false);
                        setZipFile(null);
                        setActiveTab("preview");
                      }} 
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
                      onDrop={handleVideoDrop}
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
                          <FileVideo size={42} />
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
                          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your video files here</h3>
                          <p className="text-slate-500 mt-2">or click to browse files</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            onClick={() => document.getElementById('video-file-input')?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            size="lg"
                          >
                            <Upload size={20} className="mr-2" />
                            Select Video Files
                          </Button>
                          <input
                            id="video-file-input"
                            type="file"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
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
                              const invalidFiles = files.filter(file => !validateFileType(file, 'video'));
                              
                              if (invalidFiles.length > 0) {
                                // Get recommended tab for the first invalid file
                                const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
                                
                                // Set error message
                                if (recommendedTab && recommendedTab !== 'zip') {
                                  const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
                                  setError(`This file is not a supported video file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
                                } else {
                                  setError('One or more files are not supported video files. Please select only video files (MP4, WEBM, AVI, etc.).');
                                }
                                return;
                              }
                              
                              // All files valid, proceed with handling
                              handleFileChange(files);
                            }}
                            className="hidden"
                            accept=".mp4,.webm,.avi,.mov,.mkv,.flv,.wmv,.zip"
                            multiple={true}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            MP4, WEBM, AVI and more
                          </Badge>
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            ZIP archives supported
                          </Badge>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "preview" && selectedFile && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg border bg-slate-800 overflow-hidden flex items-center justify-center text-center">
                        {previewUrl ? (
                          <video 
                            controls 
                            className="w-full h-full" 
                            src={previewUrl}
                            controlsList="nodownload"
                          >
                            Your browser does not support the video element.
                          </video>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <FileVideo className="w-12 h-12 text-slate-500 mb-2" />
                            <span className="text-sm text-slate-400">Loading preview...</span>
                          </div>
                        )}
                      </div>

                      {/* File Details Card */}
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-3">File Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File name:</span>
                            <span className="font-medium text-slate-800 truncate max-w-[200px]">{selectedFile?.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File size:</span>
                            <span className="font-medium text-slate-800">{selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">File type:</span>
                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0">
                              {selectedFile?.type || selectedFile?.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-5 border">
                        <h3 className="font-semibold text-lg text-slate-800 mb-4">Conversion Options</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Output Format</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <Button 
                                variant={activeVideoFormat === 'mp4-to-webm' ? "default" : "outline"}
                                className={activeVideoFormat === 'mp4-to-webm' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveVideoFormat('mp4-to-webm')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.mp4')}
                              >
                                MP4 to WEBM
                              </Button>
                              <Button 
                                variant={activeVideoFormat === 'webm-to-mp4' ? "default" : "outline"}
                                className={activeVideoFormat === 'webm-to-mp4' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveVideoFormat('webm-to-mp4')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.webm')}
                              >
                                WEBM to MP4
                              </Button>
                              <Button 
                                variant={activeVideoFormat === 'mov-to-mp4' ? "default" : "outline"}
                                className={activeVideoFormat === 'mov-to-mp4' ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                onClick={() => setActiveVideoFormat('mov-to-mp4')}
                                disabled={!selectedFile?.name.toLowerCase().endsWith('.mov')}
                              >
                                MOV to MP4
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Quality</label>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Resolution</span>
                                <span className="text-sm font-medium text-indigo-600">{quality}p</span>
                              </div>
                              <input
                                type="range"
                                min="360"
                                max="1080"
                                step="360"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>360p</span>
                                <span>720p</span>
                                <span>1080p</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Custom Filename</label>
                            <input
                              type="text"
                              placeholder="Enter filename (without extension)"
                              value={customFilename}
                              onChange={(e) => setCustomFilename(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 justify-end">
                        {selectedFiles.length > 1 && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                              disabled={currentFileIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-slate-600">
                              {currentFileIndex + 1} / {selectedFiles.length}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentFileIndex(Math.min(selectedFiles.length - 1, currentFileIndex + 1))}
                              disabled={currentFileIndex === selectedFiles.length - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <Button 
                          onClick={handleConvert}
                          disabled={isLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Convert Now
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* File list for batch conversion */}
                      {selectedFiles.length > 1 && (
                        <div className="bg-slate-50 rounded-xl p-4 border">
                          <h4 className="font-medium text-slate-800 mb-3">Files to Convert</h4>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedFiles.map((file, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className={`flex items-center justify-between p-2 rounded ${
                                  currentFileIndex === index ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-100'
                                }`}
                              >
                                <div
                                  className="flex items-center gap-3 cursor-pointer flex-1"
                                  onClick={() => setCurrentFileIndex(index)}
                                >
                                  <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
                                    <FileVideo className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newFiles = [...selectedFiles];
                                    newFiles.splice(index, 1);
                                    setSelectedFiles(newFiles);
                                    if (currentFileIndex === index) {
                                      setCurrentFileIndex(0);
                                    } else if (currentFileIndex > index) {
                                      setCurrentFileIndex(currentFileIndex - 1);
                                    }
                                    if (newFiles.length === 0) {
                                      setActiveTab("upload");
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "result" && (
                <div className="space-y-6">
                  {convertedUrl ? (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      <h3 className="font-semibold text-lg text-green-800 mb-4">Conversion Successful!</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Original Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.originalSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-50">
                          <div className="text-sm text-green-700 mb-1">Converted Size</div>
                          <div className="font-semibold text-lg">{conversionStats ? `${(conversionStats.convertedSize / 1024).toFixed(2)} KB` : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
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
                            <span className="flex items-center text-slate-500 bg-slate-50 px-3 rounded border">
                              {activeVideoFormat.split('-to-')[1]}
                            </span>
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
                            Download {activeVideoFormat.split('-to-')[1].toUpperCase()} ({quality}p)
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : convertedFiles.length > 0 ? (
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
                                  {(item.file.size / 1024).toFixed(2)} KB → {(item.stats.convertedSize / 1024).toFixed(2)} KB
                                  <span className="ml-2 text-green-600">
                                    ({item.stats.reduction.toFixed(1)}% {item.stats.reduction > 0 ? 'saved' : 'increase'})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => window.open(item.convertedUrl, '_blank')}
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Download size={16} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedFiles([]);
                          setCurrentFileIndex(0);
                          setActiveTab("upload");
                        }}
                        className="w-full mt-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        variant="outline"
                      >
                        Convert More Videos
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FileVideo size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">No converted videos yet</h3>
                      <p className="text-slate-500 mt-2">
                        Go to the Preview tab to convert your videos
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
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Tabs>
      </div>
    );
  };

  // Render the archive converter UI
  const renderArchiveConverterUI = (props: ArchiveConverterRenderProps) => {
    const {
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
      
      // Actions and setters
      setCompressionLevel,
      setCustomFilename,
      handleFileChange,
      handleConvert,
      handleDownload,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      setActiveTab,
      setIsDragOver,
      setSelectedFiles,
      setCurrentFileIndex,
      setError,
      setActiveArchiveFormat,
      getFileType
    } = props;

    // Add state for ZIP handling
    const [zipFile, setZipFile] = React.useState<File | null>(null);
    const [analyzingZip, setAnalyzingZip] = React.useState(false);

    // Update the archive version of handleDrop to handle ZIP files
    const handleArchiveDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      
      const files = Array.from(event.dataTransfer.files || []);
      
      // Reset error state
      setError(null);
      
      // Check if special ZIP file is included
      const zipFiles = files.filter(file => file.name.toLowerCase().endsWith('.zip') && 
                                                                   file.name.toLowerCase().includes('archive'));
      if (zipFiles.length > 0) {
        // Only process ZIP files that contain archives
        setZipFile(zipFiles[0]);
        setAnalyzingZip(true);
        return;
      }
      
      // Validate all files are the correct type
      const invalidFiles = files.filter(file => !validateFileType(file, 'archive'));
      
      if (invalidFiles.length > 0) {
        // Get recommended tab for the first invalid file
        const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
        
        // Set error message
        if (recommendedTab && recommendedTab !== 'zip') {
          const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
          setError(`This file is not a supported archive file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
        } else {
          setError('One or more files are not supported archive files. Please select only archive files (ZIP, RAR, TAR, etc.).');
        }
        return;
      }
      
      // All files valid, proceed with handling
      handleFileChange(files);
    };

    return (
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
                <FileArchive size={18} className="mr-2" />
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
                <FileTypeErrorAlert
                  message={error}
                  onDismiss={() => setError(null)}
                  showSwitchButton={error.includes('Please use the') || error.includes('Converter')}
                  switchTabLabel={
                    error.includes('Image') ? 'Go to Image Converter' : 
                    error.includes('Audio') ? 'Go to Audio Converter' : 
                    error.includes('Video') ? 'Go to Video Converter' : 
                    error.includes('Archive') ? 'Go to Archive Converter' : ''
                  }
                  onSwitchTab={() => {
                    if (error.includes('Image')) {
                      setActiveConversionType('image');
                    } else if (error.includes('Audio')) {
                      setActiveConversionType('audio');
                    } else if (error.includes('Video')) {
                      setActiveConversionType('video');
                    } else if (error.includes('Archive')) {
                      setActiveConversionType('archive');
                    }
                    setError(null);
                  }}
                />
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
                      converterType="archive"
                      onSelect={(files) => {
                        setSelectedFiles(files);
                        setAnalyzingZip(false);
                        setZipFile(null);
                        setActiveTab("preview");
                      }} 
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
                      onDrop={handleArchiveDrop}
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
                          <FileArchive size={42} />
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
                          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your archive files here</h3>
                          <p className="text-slate-500 mt-2">or click to browse files</p>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            onClick={() => document.getElementById('archive-file-input')?.click()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
                            size="lg"
                          >
                            <Upload size={20} className="mr-2" />
                            Select Archive Files
                          </Button>
                          <input
                            id="archive-file-input"
                            type="file"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              
                              // Reset error state
                              setError(null);
                              
                              // Check if special ZIP file is included
                              const zipFiles = files.filter(file => file.name.toLowerCase().endsWith('.zip') && 
                                                                   file.name.toLowerCase().includes('archive'));
                              if (zipFiles.length > 0) {
                                setZipFile(zipFiles[0]);
                                setAnalyzingZip(true);
                                return;
                              }
                              
                              // Validate all files are the correct type
                              const invalidFiles = files.filter(file => !validateFileType(file, 'archive'));
                              
                              if (invalidFiles.length > 0) {
                                // Get recommended tab for the first invalid file
                                const recommendedTab = getRecommendedTabForFile(invalidFiles[0]);
                                
                                // Set error message
                                if (recommendedTab && recommendedTab !== 'zip') {
                                  const tabName = typeToTabMap[recommendedTab] || recommendedTab.charAt(0).toUpperCase() + recommendedTab.slice(1);
                                  setError(`This file is not a supported archive file. Please use the ${tabName} to convert "${invalidFiles[0].name}".`);
                                } else {
                                  setError('One or more files are not supported archive files. Please select only archive files (ZIP, RAR, TAR, etc.).');
                                }
                                return;
                              }
                              
                              // All files valid, proceed with handling
                              handleFileChange(files);
                            }}
                            className="hidden"
                            accept=".zip,.rar,.tar,.7z,.gz,.bz2"
                            multiple={true}
                          />
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex gap-2 items-center">
                          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
                            ZIP, RAR, TAR, 7Z, GZ files
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

              {activeTab === "preview" && selectedFile && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Archive Details</h3>
                      <div className="bg-slate-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center mb-2">
                          <FileArchive size={20} className="mr-2 text-indigo-500" />
                          <span className="font-medium">{selectedFile.name}</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Type: {getFileType(selectedFile).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Output Format</label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={activeArchiveFormat === 'zip-to-rar' ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => setActiveArchiveFormat('zip-to-rar')}
                            >
                              <FileArchive size={16} className="mr-2" />
                              ZIP to RAR
                            </Button>
                            <Button
                              type="button"
                              variant={activeArchiveFormat === 'rar-to-zip' ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => setActiveArchiveFormat('rar-to-zip')}
                            >
                              <FileArchive size={16} className="mr-2" />
                              RAR to ZIP
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Compression Level: {compressionLevel}</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500">Low</span>
                            <input
                              type="range"
                              min="1"
                              max="9"
                              value={compressionLevel}
                              onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-slate-500">High</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Output Filename</label>
                          <Input
                            type="text"
                            placeholder="Enter filename (without extension)"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <Button
                          onClick={handleConvert}
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <ArrowRight size={16} className="mr-2" />
                              Convert Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Files to Convert</h3>
                      <div className="bg-slate-50 rounded-lg p-4 h-[300px] overflow-y-auto">
                        {selectedFiles.length > 0 ? (
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div 
                                key={index}
                                className={`flex items-center justify-between p-2 rounded ${
                                  currentFileIndex === index ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-100'
                                }`}
                                onClick={() => setCurrentFileIndex(index)}
                              >
                                <div className="flex items-center">
                                  <FileArchive size={18} className="text-indigo-500 mr-2" />
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newFiles = [...selectedFiles];
                                    newFiles.splice(index, 1);
                                    setSelectedFiles(newFiles);
                                    if (currentFileIndex === index) {
                                      setCurrentFileIndex(0);
                                    } else if (currentFileIndex > index) {
                                      setCurrentFileIndex(currentFileIndex - 1);
                                    }
                                  }}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400">
                            No files selected
                          </div>
                        )}
                      </div>
                    </div>
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
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Conversion Complete!</h2>
                    <p className="text-slate-500 mb-6">Your archive has been successfully converted.</p>
                    
                    {conversionStats && (
                      <div className="bg-slate-50 p-6 rounded-lg mb-8 inline-block mx-auto">
                        <h3 className="font-semibold mb-4 text-left">Conversion Details:</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
                          <div className="text-slate-500">Original Size:</div>
                          <div className="font-medium">{(conversionStats.originalSize / 1024 / 1024).toFixed(2)} MB</div>
                          
                          <div className="text-slate-500">Converted Size:</div>
                          <div className="font-medium">{(conversionStats.convertedSize / 1024 / 1024).toFixed(2)} MB</div>
                          
                          <div className="text-slate-500">Size Reduction:</div>
                          <div className="font-medium text-green-600">{conversionStats.reduction.toFixed(1)}%</div>
                          
                          <div className="text-slate-500">Compression Level:</div>
                          <div className="font-medium">{compressionLevel} (out of 9)</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">File Name</label>
                        <div className="flex max-w-md mx-auto">
                          <Input
                            type="text"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            className="rounded-r-none"
                          />
                          <div className="bg-slate-100 px-3 flex items-center border border-l-0 rounded-r-md text-slate-500">
                            .{activeArchiveFormat.split('-to-')[1]}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 justify-center">
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('upload')}
                        >
                          <ArrowLeft size={16} className="mr-2" />
                          Convert Another
                        </Button>
                        
                        <Button 
                          onClick={handleDownload}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Tabs>
      </div>
    );
  };

  // Placeholder UI for when no conversion type is selected
  const renderPlaceholderUI = () => {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ImageIcon size={36} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Select a Conversion Type</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Choose a conversion type from the sidebar to start converting your files.
        </p>
        <Button onClick={() => setActiveConversionType('image')}>
          Get Started
        </Button>
      </div>
    );
  };

  return (
    <MainLayout
      activeConversionType={activeConversionType}
      onConversionTypeChange={setActiveConversionType}
    >
      {activeConversionType === 'image' ? (
        <ImageConverter renderUI={renderImageConverterUI} setActiveConversionType={setActiveConversionType} />
      ) : activeConversionType === 'document' ? (
        <DocumentConverter renderUI={renderDocumentConverterUI} />
      ) : activeConversionType === 'audio' ? (
        <AudioConverter renderUI={renderAudioConverterUI} />
      ) : activeConversionType === 'video' ? (
        <VideoConverter renderUI={renderVideoConverterUI} />
      ) : activeConversionType === 'archive' ? (
        <ArchiveConverter renderUI={renderArchiveConverterUI} />
      ) : (
        renderPlaceholderUI()
      )}
    </MainLayout>
  );
} 