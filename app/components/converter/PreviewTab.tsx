"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { motion } from "framer-motion";
import { Image, Settings2, X, Trash2, Check, Loader2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { formatFileSize } from "../utils/imageUtils";

interface PreviewTabProps {
  selectedFiles: File[];
  currentFileIndex: number;
  quality: number;
  setQuality: (value: number) => void;
  preserveTransparency: boolean;
  setPreserveTransparency: (value: boolean) => void;
  onConvert: () => void;
  onFileClick: (index: number) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onBatchConvert: () => void;
  isConverting: boolean;
}

export default function PreviewTab({
  selectedFiles,
  currentFileIndex,
  quality,
  setQuality,
  preserveTransparency,
  setPreserveTransparency,
  onConvert,
  onFileClick,
  onRemoveFile,
  onClearAll,
  onBatchConvert,
  isConverting,
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

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
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
          <div className="text-sm text-muted-foreground">
            <p>File: {currentFile?.name}</p>
            <p>Size: {currentFile ? formatFileSize(currentFile.size) : "N/A"}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Quality</Label>
              <span className="text-sm text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              id="quality"
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="transparency">Preserve Transparency</Label>
            <Switch
              id="transparency"
              checked={preserveTransparency}
              onCheckedChange={setPreserveTransparency}
            />
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={onConvert}
              disabled={!currentFile}
            >
              Convert to JPG
            </Button>
          </div>

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
        </div>
      </div>
    </div>
  );
}