import React from "react";
import { formatFileSize } from "../utils/imageUtils";

interface FileDetailsProps {
  file: File;
  dimensions: { width: number; height: number } | null;
}

const FileDetails: React.FC<FileDetailsProps> = ({ file, dimensions }) => {
  return (
    <div>
      <p className="font-medium">File details</p>
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Name:</span>
          <span className="font-medium truncate max-w-[250px]">{file.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Size:</span>
          <span className="font-medium">{formatFileSize(file.size)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Type:</span>
          <span className="font-medium">{file.type}</span>
        </div>
        {dimensions && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Dimensions:</span>
            <span className="font-medium">{dimensions.width} × {dimensions.height}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetails;