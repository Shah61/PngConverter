import React from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Image, FileText, FileArchive } from "lucide-react";

interface FileTypeDetectorProps {
  file: File;
  onFormatSelect: (format: string) => void;
  onCancel: () => void;
}

const getFileType = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type.includes('image/')) {
    return type.split('/')[1];
  }
  return file.name.split('.').pop()?.toLowerCase() || 'unknown';
};

const getAvailableConversions = (fileType: string): string[] => {
  const imageTypes = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt'];
  
  if (imageTypes.includes(fileType)) {
    return imageTypes.filter(t => t !== fileType);
  }
  if (documentTypes.includes(fileType)) {
    return documentTypes.filter(t => t !== fileType);
  }
  return [];
};

export const FileTypeDetector: React.FC<FileTypeDetectorProps> = ({
  file,
  onFormatSelect,
  onCancel,
}) => {
  const fileType = getFileType(file);
  const availableConversions = getAvailableConversions(fileType);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-full">
              {fileType === 'pdf' ? (
                <FileText className="w-6 h-6 text-indigo-600" />
              ) : fileType === 'zip' ? (
                <FileArchive className="w-6 h-6 text-indigo-600" />
              ) : (
                <Image className="w-6 h-6 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">{file.name}</h3>
              <p className="text-sm text-slate-500">
                {fileType.toUpperCase()} file
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Available Conversion Formats:</p>
            <div className="flex flex-wrap gap-2">
              {availableConversions.map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  className="capitalize"
                  onClick={() => onFormatSelect(format)}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 