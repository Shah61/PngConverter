"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Download, Settings, FileImage, FileArchive } from "lucide-react";
import UploadTab from "./UploadTab";
import PreviewTab from "./PreviewTab";
import { ResultTab } from "./ResultTab";
import ConversionSettings from "./ConversionSettings";
import { isPngFile, generateDefaultFilename, formatFileSize } from "../utils/imageUtils";

interface ImageConverterProps {
  format: string;
  onFormatChange: (format: string) => void;
}

export default function ImageConverter({ format, onFormatChange }: ImageConverterProps) {
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

  // Handler functions
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setCurrentFileIndex(0);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setError(null);
    setActiveTab("preview");
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (currentFileIndex === index) {
      setCurrentFileIndex(0);
    } else if (currentFileIndex > index) {
      setCurrentFileIndex(prev => prev - 1);
    }
  };

  const handleFileClick = (index: number) => {
    setCurrentFileIndex(index);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedFiles[currentFileIndex]) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Your conversion logic here
      // This is a placeholder - implement your actual conversion logic
      const convertedBlob = new Blob([selectedFiles[currentFileIndex]], { type: 'image/jpeg' });
      const convertedUrl = URL.createObjectURL(convertedBlob);
      
      setConvertedUrl(convertedUrl);
      setConversionStats({
        originalSize: selectedFiles[currentFileIndex].size,
        convertedSize: convertedBlob.size,
        reduction: ((selectedFiles[currentFileIndex].size - convertedBlob.size) / selectedFiles[currentFileIndex].size) * 100
      });
      
      setActiveTab("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during conversion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!convertedUrl) return;
    
    try {
      const response = await fetch(convertedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = customFilename || generateDefaultFilename(selectedFiles[currentFileIndex].name);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during download");
    }
  };

  // Get current file
  const selectedFile = selectedFiles[currentFileIndex] || null;

  return (
    <Card className="overflow-hidden shadow-xl border-0 rounded-xl">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8 pt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">
                <FileImage className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!selectedFile}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="result" disabled={!convertedUrl}>
                <Download className="w-4 h-4 mr-2" />
                Result
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="mt-6">
            <UploadTab
              onFilesSelected={handleFilesSelected}
              isDragOver={isDragOver}
              setIsDragOver={setIsDragOver}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
              onFileClick={handleFileClick}
              currentFileIndex={currentFileIndex}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <PreviewTab
              selectedFiles={selectedFiles}
              currentFileIndex={currentFileIndex}
              quality={quality}
              setQuality={setQuality}
              preserveTransparency={false}
              setPreserveTransparency={() => {}}
              onConvert={handleConvert}
              onFileClick={handleFileClick}
              onRemoveFile={handleRemoveFile}
              onClearAll={() => {
                setSelectedFiles([]);
                setCurrentFileIndex(0);
              }}
              onBatchConvert={handleConvert}
              isConverting={isLoading}
            />
          </TabsContent>

          <TabsContent value="result" className="mt-6">
            <ResultTab
              convertedUrl={convertedUrl}
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
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 