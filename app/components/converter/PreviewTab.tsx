"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Image, Settings2 } from "lucide-react";

interface PreviewTabProps {
  selectedFiles: File[];
  currentFileIndex: number;
  quality: number;
  setQuality: (value: number) => void;
  preserveTransparency: boolean;
  setPreserveTransparency: (value: boolean) => void;
  onConvert: () => void;
}

export default function PreviewTab({
  selectedFiles,
  currentFileIndex,
  quality,
  setQuality,
  preserveTransparency,
  setPreserveTransparency,
  onConvert,
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
          <div className="text-sm text-muted-foreground">
            <p>File: {currentFile?.name}</p>
            <p>Size: {(currentFile?.size / 1024 / 1024).toFixed(2)} MB</p>
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
        </div>
      </div>
    </div>
  );
}