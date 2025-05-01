import React from "react";
import { Slider } from "@/app/components/ui/slider";
import { Badge } from "@/app/components/ui/badge";

interface QualitySettingsProps {
  quality: number;
  onQualityChange: (value: number[]) => void;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({ quality, onQualityChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-medium">JPG Quality</p>
        <Badge variant="outline">{quality}%</Badge>
      </div>
      <Slider
        value={[quality]}
        min={10}
        max={100}
        step={5}
        onValueChange={onQualityChange}
        className="w-full"
      />
      <p className="text-xs text-slate-500">
        Higher quality means larger file size, lower quality means smaller file size.
      </p>
    </div>
  );
};

export default QualitySettings;