import React from 'react';
import { Badge } from "@/app/components/ui/badge";
import { Slider } from "@/app/components/ui/slider";

interface QualityControlsProps {
  quality: number;
  setQuality: (quality: number) => void;
}

export const QualityControls: React.FC<QualityControlsProps> = ({
  quality,
  setQuality,
}) => {
  const getQualityColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-slate-50 rounded-xl p-5 border space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">JPG Quality</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Quality:</span>
          <Badge className={`bg-white px-3 py-1 ${getQualityColor(quality)}`}>
            {quality}%
          </Badge>
        </div>
        
        <div className="relative pt-1">
          <Slider
            min={10}
            max={100}
            step={5}
            value={[quality]}
            onValueChange={([value]) => setQuality(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        <p className="text-sm text-slate-500">
          Higher quality results in larger file size. Lower quality creates smaller files.
        </p>
      </div>
    </div>
  );
}; 