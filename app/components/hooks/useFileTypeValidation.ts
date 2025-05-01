"use client";

import { useState, useCallback } from "react";
import { 
  ConverterType, 
  detectFileConverterType, 
  isFileValidForConverter, 
  filterFilesByConverterType 
} from "../utils/fileTypeUtils";

interface FileTypeValidationResult {
  // State
  wrongFileTypeData: { file: File; correctConverterType: ConverterType } | null;
  
  // Actions
  validateFiles: (files: File[], currentConverterType: ConverterType) => {
    validFiles: File[];
    allValid: boolean;
    hasInvalidFiles: boolean;
    hasFiles: boolean;
    invalidFiles: File[];
  };
  dismissWrongFileTypeAlert: () => void;
  clearWrongFileTypeData: () => void;
}

export function useFileTypeValidation(): FileTypeValidationResult {
  const [wrongFileTypeData, setWrongFileTypeData] = useState<{ 
    file: File; 
    correctConverterType: ConverterType 
  } | null>(null);

  const validateFiles = useCallback((files: File[], currentConverterType: ConverterType) => {
    // Filter out valid files for the current converter
    const validFiles = filterFilesByConverterType(files, currentConverterType);
    const allValid = validFiles.length === files.length && files.length > 0;
    const hasInvalidFiles = validFiles.length < files.length && files.length > 0;
    const hasFiles = files.length > 0;
    const invalidFiles = files.filter(file => !isFileValidForConverter(file, currentConverterType));
    
    // We always want to set or clear the wrong file type data based on the current files
    if (hasInvalidFiles && invalidFiles.length > 0) {
      // Find the first invalid file with a detectable type
      let foundValidType = false;
      
      for (const invalidFile of invalidFiles) {
        const correctType = detectFileConverterType(invalidFile);
        
        if (correctType && correctType !== currentConverterType) {
          setWrongFileTypeData({
            file: invalidFile,
            correctConverterType: correctType
          });
          foundValidType = true;
          break;
        }
      }
      
      // If we didn't find any file with a valid type but we have invalid files,
      // we'll clear any existing wrong file type alert
      if (!foundValidType) {
        setWrongFileTypeData(null);
      }
    } else {
      // No invalid files, clear any wrong file type data
      setWrongFileTypeData(null);
    }
    
    return { 
      validFiles, 
      allValid, 
      hasInvalidFiles,
      hasFiles,
      invalidFiles
    };
  }, []);

  const dismissWrongFileTypeAlert = useCallback(() => {
    setWrongFileTypeData(null);
  }, []);

  const clearWrongFileTypeData = useCallback(() => {
    setWrongFileTypeData(null);
  }, []);

  return {
    wrongFileTypeData,
    validateFiles,
    dismissWrongFileTypeAlert,
    clearWrongFileTypeData
  };
} 