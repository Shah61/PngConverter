import React, { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ProBadge } from "@/app/components/ui/ProBadge";
import { Save, Trash2, Star, Settings } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  settings: {
    quality: number;
    resizeEnabled: boolean;
    resizeWidth: number;
    resizeHeight: number;
    preserveMetadata: boolean;
    watermarkEnabled?: boolean;
    watermarkSettings?: any;
  };
}

interface PresetManagerProps {
  onApplyPreset: (preset: Preset) => void;
  onSavePreset: (preset: Preset) => void;
  onDeletePreset: (presetId: string) => void;
  currentSettings: any;
}

export const PresetManager = ({
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  currentSettings
}: PresetManagerProps) => {
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Web Optimized',
      settings: {
        quality: 80,
        resizeEnabled: true,
        resizeWidth: 1200,
        resizeHeight: 800,
        preserveMetadata: false
      }
    },
    {
      id: '2',
      name: 'High Quality Print',
      settings: {
        quality: 100,
        resizeEnabled: false,
        resizeWidth: 0,
        resizeHeight: 0,
        preserveMetadata: true
      }
    }
  ]);

  const [newPresetName, setNewPresetName] = useState('');

  const handleSaveNewPreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      settings: currentSettings
    };

    setPresets([...presets, newPreset]);
    onSavePreset(newPreset);
    setNewPresetName('');
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Saved Presets</h3>
          <ProBadge />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New preset name"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
          <Button onClick={handleSaveNewPreset}>
            <Save className="w-4 h-4 mr-2" />
            Save Current
          </Button>
        </div>

        <div className="space-y-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{preset.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApplyPreset(preset)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeletePreset(preset.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 