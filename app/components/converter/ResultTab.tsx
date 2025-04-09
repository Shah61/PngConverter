import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConversionStats from "./ConversionStats";

interface ResultTabProps {
  convertedUrl: string | null;
  conversionStats: {
    originalSize: number;
    convertedSize: number;
    reduction: number;
  } | null;
  originalDimensions: { width: number; height: number } | null;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  preserveMetadata: boolean;
  customFilename: string;
  setCustomFilename: (filename: string) => void;
  handleDownload: () => void;
  setActiveTab: (tab: string) => void;
}

const ResultTab: React.FC<ResultTabProps> = ({
  convertedUrl,
  conversionStats,
  originalDimensions,
  resizeEnabled,
  resizeWidth,
  resizeHeight,
  preserveMetadata,
  customFilename,
  setCustomFilename,
  handleDownload,
  setActiveTab,
}) => {
  if (!convertedUrl || !conversionStats) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold">No converted image available</p>
        <p className="mt-2 text-slate-500">
          Please go to the Preview tab to convert an image
        </p>
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => setActiveTab("preview")}
        >
          Go to Preview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
        <img 
          src={convertedUrl} 
          alt="Converted JPG" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      <ConversionStats 
        conversionStats={conversionStats}
        originalDimensions={originalDimensions}
        resizeEnabled={resizeEnabled}
        resizeWidth={resizeWidth}
        resizeHeight={resizeHeight}
        preserveMetadata={preserveMetadata}
      />
      
      <div className="space-y-4">
        <div>
          <p className="font-medium mb-2">Custom Filename</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter filename (without extension)"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-slate-500">.jpg</span>
          </div>
        </div>
        
        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => setActiveTab("preview")}>
            Back
          </Button>
          <Button 
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 flex gap-2 flex-1"
          >
            <Download size={16} />
            Download JPG
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultTab;