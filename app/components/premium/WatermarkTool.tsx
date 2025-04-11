import React, { useState } from 'react';
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { ProBadge } from "@/app/components/ui/ProBadge";
import { ImageIcon, Type } from 'lucide-react';

interface WatermarkToolProps {
  onApplyWatermark: (settings: WatermarkSettings) => void;
}

export interface WatermarkSettings {
  text: string;
  opacity: number;
  position: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  size: number;
}

export const WatermarkTool = ({ onApplyWatermark }: WatermarkToolProps) => {
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: '',
    opacity: 0.5,
    position: 'bottomRight',
    size: 24
  });

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Watermark</h3>
          <ProBadge />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button size="sm" variant="outline">
            <ImageIcon className="w-4 h-4 mr-2" />
            Image
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Watermark Text</label>
          <Input
            type="text"
            placeholder="Enter watermark text"
            value={settings.text}
            onChange={(e) => setSettings({ ...settings, text: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Opacity</label>
          <Slider
            value={[settings.opacity * 100]}
            onValueChange={(value) => setSettings({ ...settings, opacity: value[0] / 100 })}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Size</label>
          <Slider
            value={[settings.size]}
            onValueChange={(value) => setSettings({ ...settings, size: value[0] })}
            min={12}
            max={72}
            step={1}
            className="mt-2"
          />
        </div>

        <Button 
          className="w-full"
          onClick={() => onApplyWatermark(settings)}
        >
          Apply Watermark
        </Button>
      </div>
    </div>
  );
}; 