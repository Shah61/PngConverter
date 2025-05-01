"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { motion } from "framer-motion";
import { Image, Settings2, Trash2, Loader2, Check, X } from "lucide-react";
import { formatFileSize } from "../utils/imageUtils";

interface PreviewTabProps {
  selectedFiles: File[];
  currentFileIndex: number;
  quality: number;
  setQuality: (value: number) => void;
  preserveMetadata: boolean;
  setPreserveMetadata: (value: boolean) => void;
  onConvert: () => void;
  onFileClick: (index: number) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onBatchConvert: () => void;
  isConverting: boolean;
  resizeEnabled: boolean;
  setResizeEnabled: (enabled: boolean) => void;
  resizeWidth: number;
  setResizeWidth: (width: number) => void;
  resizeHeight: number;
  setResizeHeight: (height: number) => void;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  originalDimensions: { width: number; height: number } | null;
  activeImageFormat: string;
}

export default function PreviewTab({
  selectedFiles,
  currentFileIndex,
  quality,
  setQuality,
  preserveMetadata,
  setPreserveMetadata,
  onConvert,
  onFileClick,
  onRemoveFile,
  onClearAll,
  onBatchConvert,
  isConverting,
  resizeEnabled,
  setResizeEnabled,
  resizeWidth,
  setResizeWidth,
  resizeHeight,
  setResizeHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  originalDimensions,
  activeImageFormat,
}: PreviewTabProps) {
  const currentFile = selectedFiles[currentFileIndex];
  const [previewUrl, setPreviewUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (currentFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(currentFile);
    }
  }, [currentFile]);

  const handleWidthChange = (width: number) => {
    setResizeWidth(width);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeHeight(Math.round(width / aspectRatio));
    }
  };

  const handleHeightChange = (height: number) => {
    setResizeHeight(height);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(height * aspectRatio));
    }
  };

  // Get the target format from the activeImageFormat string (format is like "png-to-jpg")
  const targetFormat = React.useMemo(() => {
    if (!activeImageFormat) return "JPG";
    const parts = activeImageFormat.split('-to-');
    return parts.length > 1 ? parts[1].toUpperCase() : "JPG";
  }, [activeImageFormat]);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File Details Card */}
          <div className="bg-slate-50 rounded-xl p-5 border">
            <h3 className="font-semibold text-lg text-slate-800 mb-3">File Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">File name:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">{currentFile?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">File size:</span>
                <span className="font-medium text-slate-800">{currentFile ? formatFileSize(currentFile.size) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">File type:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {currentFile?.type || 'Unknown'}
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
        </div>

        <div className="space-y-6">
          {/* JPG Quality Control */}
          <div className="bg-slate-50 rounded-xl p-5 border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">JPG Quality</Label>
                <Badge variant="outline" className="bg-white">{quality}%</Badge>
              </div>
              <Slider
                id="quality"
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <p className="text-sm text-slate-500">
                Higher quality results in larger file size. Lower quality creates smaller files.
              </p>
            </div>
          </div>

          {/* Resize Image Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="resize-toggle" className="text-lg font-semibold">
                Resize Image
              </Label>
              <Switch
                id="resize-toggle"
                checked={resizeEnabled}
                onCheckedChange={setResizeEnabled}
              />
            </div>

            {resizeEnabled && (
              <div className="bg-slate-50 rounded-xl p-5 border space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                  <Label htmlFor="aspect-ratio" className="text-sm font-medium">
                    Maintain aspect ratio
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="width">Width</Label>
                    <input
                      type="number"
                      id="width"
                      value={resizeWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 50)}
                      className="w-full px-3 py-2 border rounded-md"
                      min={50}
                      max={originalDimensions ? originalDimensions.width * 2 : 2000}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="height">Height</Label>
                    <input
                      type="number"
                      id="height"
                      value={resizeHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 50)}
                      className="w-full px-3 py-2 border rounded-md"
                      min={50}
                      max={originalDimensions ? originalDimensions.height * 2 : 2000}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <span className="text-slate-600 text-sm">New dimensions:</span>
                  <span className="font-medium text-slate-800 font-mono">
                    {resizeWidth} × {resizeHeight}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="metadata" className="flex items-center gap-2">
              Preserve Metadata
              <span className="text-sm text-slate-500">(EXIF, ICC profile)</span>
            </Label>
            <Switch
              id="metadata"
              checked={preserveMetadata}
              onCheckedChange={setPreserveMetadata}
            />
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
                  onClick={onClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button
                  onClick={onBatchConvert}
                  disabled={isConverting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Convert All
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
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => onFileClick(index)}
                  >
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Image className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={onConvert}
              disabled={!currentFile || isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                `Convert to ${targetFormat}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}