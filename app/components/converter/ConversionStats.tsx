import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "../utils/imageUtils";

interface ConversionStatsProps {
  conversionStats: {
    originalSize: number;
    convertedSize: number;
    reduction: number;
  };
  originalDimensions: { width: number; height: number } | null;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  preserveMetadata: boolean;
}

const ConversionStats: React.FC<ConversionStatsProps> = ({
  conversionStats,
  originalDimensions,
  resizeEnabled,
  resizeWidth,
  resizeHeight,
  preserveMetadata,
}) => {
  return (
    <div className="rounded-lg bg-slate-50 p-4 border">
      <p className="font-medium mb-3">Conversion Results</p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Original Size:</span>
          <span>{formatFileSize(conversionStats.originalSize)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Converted Size:</span>
          <span>{formatFileSize(conversionStats.convertedSize)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Reduction:</span>
          <Badge 
            variant={conversionStats.reduction > 0 ? "secondary" : "default"}
            className={conversionStats.reduction > 0 ? "bg-green-100 text-green-800" : ""}
          >
            {conversionStats.reduction.toFixed(1)}%
          </Badge>
        </div>
        {resizeEnabled && originalDimensions && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Resized From:</span>
            <span>{originalDimensions.width} × {originalDimensions.height} → {resizeWidth} × {resizeHeight}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Metadata:</span>
          <span>{preserveMetadata ? "Preserved" : "Removed"}</span>
        </div>
      </div>
    </div>
  );
};

export default ConversionStats;