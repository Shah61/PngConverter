"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

interface UploadTabProps {
  onFilesSelected: (files: File[]) => void;
  isDragOver: boolean;
  setIsDragOver: (value: boolean) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  onFileClick: (index: number) => void;
  currentFileIndex: number;
}

export default function UploadTab({
  onFilesSelected,
  isDragOver,
  setIsDragOver,
  selectedFiles,
  onRemoveFile,
  onFileClick,
  currentFileIndex,
}: UploadTabProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  return (
    <div className="p-8">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Drag & drop your files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse your files
            </p>
          </div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Select Files
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
        >
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
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
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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
        </motion.div>
      )}
    </div>
  );
}