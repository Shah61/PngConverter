import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Download, Check, Image as LucideImage } from "lucide-react";
import { formatFileSize } from "../utils/imageUtils";

interface ResultTabProps {
  convertedUrl: string | null;
  previewUrl: string | null;
  showBeforeAfter: boolean;
  setShowBeforeAfter: (show: boolean) => void;
  conversionStats: {
    originalSize: number;
    convertedSize: number;
    reduction: number;
  } | null;
  originalDimensions: { width: number; height: number } | null;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  preserveMetadata: boolean;
  customFilename: string;
  setCustomFilename: (filename: string) => void;
  handleDownload: () => void;
  setActiveTab: (tab: string) => void;
  convertedFiles: {
    file: File;
    convertedUrl: string;
    stats: {
      originalSize: number;
      convertedSize: number;
      reduction: number;
    };
  }[];
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  currentFileIndex: number;
  setCurrentFileIndex: (index: number) => void;
  loadPreview: (file: File) => void;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  convertedUrl,
  previewUrl,
  showBeforeAfter,
  setShowBeforeAfter,
  conversionStats,
  originalDimensions,
  resizeEnabled,
  resizeWidth,
  resizeHeight,
  preserveMetadata,
  customFilename,
  setCustomFilename,
  handleDownload,
  setActiveTab,
  convertedFiles,
  selectedFiles,
  setSelectedFiles,
  currentFileIndex,
  setCurrentFileIndex,
  loadPreview,
}) => {
  const handleDownloadAll = async () => {
    if (convertedFiles.length === 0) return;
    
    try {
      for (const item of convertedFiles) {
        const response = await fetch(item.convertedUrl);
        const blob = await response.blob();
        
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${item.file.name.replace(/\.png$/i, "")}.jpg`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (err) {
      console.error('Batch download failed:', err);
    }
  };

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
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
                      const fileIndex = selectedFiles.findIndex(f => f.name === item.file.name && f.size === item.file.size);
                      if (fileIndex >= 0) {
                        setCurrentFileIndex(fileIndex);
                      } else {
                        setSelectedFiles([item.file, ...selectedFiles]);
                        setCurrentFileIndex(0);
                      }
                      loadPreview(item.file);
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
  );
};