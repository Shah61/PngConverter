import React from "react";
import { Info } from "lucide-react";
import { Separator } from "@/app/components/ui/separator";
import QualitySettings from "./QualitySettings";
import ResizeSettings from "./ResizeSettings";
import Toggle from "../ui/Toggle";
import Tooltip from "../ui/Tooltip";

interface ConversionSettingsProps {
  quality: number;
  onQualityChange: (value: number[]) => void;
  resizeEnabled: boolean;
  setResizeEnabled: (enabled: boolean) => void;
  originalDimensions: { width: number; height: number } | null;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  handleWidthChange: (width: number) => void;
  handleHeightChange: (height: number) => void;
  preserveMetadata: boolean;
  setPreserveMetadata: (preserve: boolean) => void;
}

const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  quality,
  onQualityChange,
  resizeEnabled,
  setResizeEnabled,
  originalDimensions,
  resizeWidth,
  resizeHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  handleWidthChange,
  handleHeightChange,
  preserveMetadata,
  setPreserveMetadata,
}) => {
  return (
    <div className="space-y-4">
      <Separator />
      
      <QualitySettings quality={quality} onQualityChange={onQualityChange} />

      <Separator />

      <ResizeSettings
        resizeEnabled={resizeEnabled}
        setResizeEnabled={setResizeEnabled}
        originalDimensions={originalDimensions}
        resizeWidth={resizeWidth}
        resizeHeight={resizeHeight}
        maintainAspectRatio={maintainAspectRatio}
        setMaintainAspectRatio={setMaintainAspectRatio}
        handleWidthChange={handleWidthChange}
        handleHeightChange={handleHeightChange}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium">Preserve Metadata</p>
            <Tooltip content="Maintain EXIF data like camera settings, date/time, and location information if present in the original PNG.">
              <div className="cursor-help text-slate-400 hover:text-slate-600">
                <Info size={14} />
              </div>
            </Tooltip>
          </div>
          <Toggle
            enabled={preserveMetadata}
            onChange={() => setPreserveMetadata(!preserveMetadata)}
          />
        </div>
        <p className="text-xs text-slate-500">
          Preserving metadata may slightly increase file size, but maintains important image information.
        </p>
      </div>
    </div>
  );
};

export default ConversionSettings;