import React from 'react';
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ResizeControlsProps {
  resizeEnabled: boolean;
  setResizeEnabled: (enabled: boolean) => void;
  resizeWidth: number;
  setResizeWidth: (width: number) => void;
  resizeHeight: number;
  setResizeHeight: (height: number) => void;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  originalDimensions: { width: number; height: number } | null;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  resizeEnabled,
  setResizeEnabled,
  resizeWidth,
  setResizeWidth,
  resizeHeight,
  setResizeHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  originalDimensions,
}) => {
  const handleWidthChange = (value: number) => {
    setResizeWidth(value);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setResizeHeight(value);
    if (maintainAspectRatio && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setResizeWidth(Math.round(value * aspectRatio));
    }
  };

  return (
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

      <AnimatePresence>
        {resizeEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 space-y-4"
          >
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
                <Input
                  type="number"
                  id="width"
                  value={resizeWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 50)}
                  min={50}
                  max={originalDimensions ? originalDimensions.width * 2 : 2000}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="height">Height</Label>
                <Input
                  type="number"
                  id="height"
                  value={resizeHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 50)}
                  min={50}
                  max={originalDimensions ? originalDimensions.height * 2 : 2000}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-50">
              <span className="text-slate-600 text-sm">New dimensions:</span>
              <span className="font-medium text-indigo-700 font-mono">
                {resizeWidth} × {resizeHeight}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 