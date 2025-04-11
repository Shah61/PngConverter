"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface UploadTabProps {
  onFilesSelected: (files: File[]) => void;
  isDragOver: boolean;
  setIsDragOver: (value: boolean) => void;
}

export default function UploadTab({
  onFilesSelected,
  isDragOver,
  setIsDragOver,
}: UploadTabProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
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
    </div>
  );
}