"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";

interface WrongFileTypeAlertProps {
  fileType: string;
  correctConverterType: string;
  onDismiss: () => void;
  onSwitchConverter: (converterType: string) => void;
}

const fileTypesToNames: Record<string, string> = {
  'image': 'Image',
  'document': 'Document',
  'audio': 'Audio',
  'video': 'Video',
  'archive': 'Archive'
};

export function WrongFileTypeAlert({
  fileType,
  correctConverterType,
  onDismiss,
  onSwitchConverter
}: WrongFileTypeAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Alert variant="destructive" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 font-medium">Wrong File Type</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-amber-700 mb-4">
            It looks like you're trying to convert a {fileTypesToNames[correctConverterType].toLowerCase()} file, 
            but you're in the {fileTypesToNames[fileType].toLowerCase()} converter. 
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-slate-50 border-amber-200 text-amber-700"
              onClick={onDismiss}
            >
              Continue anyway
            </Button>
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => onSwitchConverter(correctConverterType)}
            >
              Switch to {fileTypesToNames[correctConverterType]} Converter
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
} 