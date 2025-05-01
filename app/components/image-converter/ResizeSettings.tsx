import React from "react";
import Toggle from "../ui/Toggle";

interface ResizeSettingsProps {
  resizeEnabled: boolean;
  setResizeEnabled: (enabled: boolean) => void;
  originalDimensions: { width: number; height: number } | null;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  handleWidthChange: (width: number) => void;
  handleHeightChange: (height: number) => void;
}

const ResizeSettings: React.FC<ResizeSettingsProps> = ({
  resizeEnabled,
  setResizeEnabled,
  originalDimensions,
  resizeWidth,
  resizeHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  handleWidthChange,
  handleHeightChange,
}) => {
  if (!originalDimensions) return null;

  return (
    <div className="space-y-3">
      <Toggle
        enabled={resizeEnabled}
        onChange={() => setResizeEnabled(!resizeEnabled)}
        label="Resize Image"
      />

      {resizeEnabled && (
        <div className="rounded-md border p-4 bg-slate-50 space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aspectRatio"
              checked={maintainAspectRatio}
              onChange={() => setMaintainAspectRatio(!maintainAspectRatio)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="aspectRatio" className="text-sm font-medium text-slate-700">
              Maintain aspect ratio
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="width" className="text-sm font-medium text-slate-700">
                  Width
                </label>
                <span className="text-sm text-slate-500">{resizeWidth}px</span>
              </div>
              <input
                type="range"
                id="width"
                min={50}
                max={originalDimensions.width * 2}
                value={resizeWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 50)}
                className="w-full px-2 py-1 text-sm border rounded"
                min={50}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="height" className="text-sm font-medium text-slate-700">
                  Height
                </label>
                <span className="text-sm text-slate-500">{resizeHeight}px</span>
              </div>
              <input
                type="range"
                id="height"
                min={50}
                max={originalDimensions.height * 2}
                value={resizeHeight}
                onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 50)}
                className="w-full px-2 py-1 text-sm border rounded"
                min={50}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">New dimensions:</span>
            <span className="font-medium">{resizeWidth} × {resizeHeight}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResizeSettings;