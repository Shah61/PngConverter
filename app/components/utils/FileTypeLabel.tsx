"use client";

import React from "react";
import { Badge } from "@/app/components/ui/badge";
import { ConverterType } from "./fileTypeUtils";

interface FileTypeLabelProps {
  converterType: ConverterType;
}

const supportedExtensions: Record<ConverterType, string> = {
  'image': 'JPG, PNG, WEBP, GIF, etc.',
  'document': 'PDF, DOCX, TXT, XLS, CSV, etc.',
  'audio': 'MP3, WAV, FLAC, AAC, etc.',
  'video': 'MP4, AVI, MOV, MKV, etc.',
  'archive': 'ZIP, RAR, 7Z, TAR, etc.'
};

export function FileTypeLabel({ converterType }: FileTypeLabelProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
        {converterType === 'image' ? 'Image' :
         converterType === 'document' ? 'Document' :
         converterType === 'audio' ? 'Audio' :
         converterType === 'video' ? 'Video' : 'Archive'} files only ({supportedExtensions[converterType]})
      </Badge>
      <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
        Batch processing supported
      </Badge>
    </div>
  );
} 