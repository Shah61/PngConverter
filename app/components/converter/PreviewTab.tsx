import React from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import FileDetails from "./FileDetails";
import ConversionSettings from "./ConversionSettings";

interface PreviewTabProps {
  selectedFile: File | null;
  previewUrl: string | null;
  originalDimensions: { width: number; height: number } | null;
  quality: number;
  setQuality: (quality: number) => void;
  resizeEnabled: boolean;
  setResizeEnabled: (enabled: boolean) => void;
  resizeWidth: number;
  resizeHeight: number;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  handleWidthChange: (width: number) => void;
  handleHeightChange: (height: number) => void;
  preserveMetadata: boolean;
  setPreserveMetadata: (preserve: boolean) => void;
  handleConvert: () => void;
  isLoading: boolean;
  setActiveTab: (tab: string) => void;
}

const PreviewTab: React.FC<PreviewTabProps> = ({
  selectedFile,
  previewUrl,
  originalDimensions,
  quality,
  setQuality,
  resizeEnabled,
  setResizeEnabled,
  resizeWidth,
  resizeHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  handleWidthChange,
  handleHeightChange,
  preserveMetadata,
  setPreserveMetadata,
  handleConvert,
  isLoading,
  setActiveTab,
}) => {
  const handleQualityChange = (value: number[]) => {
    setQuality(value[0]);
  };

  if (!selectedFile || !previewUrl) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold">No image selected</h3>
        <p className="mt-1 text-slate-500">
          Go to the Upload tab to select a PNG image
        </p>
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => setActiveTab("upload")}
        >
          Select Image
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      <div className="space-y-4">
        <FileDetails file={selectedFile} dimensions={originalDimensions} />
        
        <ConversionSettings
          quality={quality}
          onQualityChange={handleQualityChange}
          resizeEnabled={resizeEnabled}
          setResizeEnabled={setResizeEnabled}
          originalDimensions={originalDimensions}
          resizeWidth={resizeWidth}
          resizeHeight={resizeHeight}
          maintainAspectRatio={maintainAspectRatio}
          setMaintainAspectRatio={setMaintainAspectRatio}
          handleWidthChange={handleWidthChange}
          handleHeightChange={handleHeightChange}
          preserveMetadata={preserveMetadata}
          setPreserveMetadata={setPreserveMetadata}
        />
        
        <div className="flex justify-between gap-4 mt-4">
          <Button variant="outline" onClick={() => setActiveTab("upload")}>
            Back
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={isLoading} 
            className="bg-indigo-600 hover:bg-indigo-700 flex-1"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Converting</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              'Convert to JPG'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;