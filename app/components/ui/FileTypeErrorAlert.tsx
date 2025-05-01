"use client"

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';
import { motion } from 'framer-motion';

interface FileTypeErrorAlertProps {
  message: string;
  onDismiss: () => void;
  onSwitchTab?: () => void;
  showSwitchButton?: boolean;
  switchTabLabel?: string;
}

/**
 * A component for displaying file type error messages with an option to switch tabs
 */
const FileTypeErrorAlert: React.FC<FileTypeErrorAlertProps> = ({
  message,
  onDismiss,
  onSwitchTab,
  showSwitchButton = false,
  switchTabLabel = 'Switch Tab'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Alert variant="destructive">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <AlertTitle className="text-base font-semibold mb-1">Incorrect File Type</AlertTitle>
            <AlertDescription className="text-sm">{message}</AlertDescription>
            
            <div className="flex items-center gap-2 mt-3">
              {showSwitchButton && onSwitchTab && (
                <Button 
                  size="sm" 
                  onClick={onSwitchTab} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {switchTabLabel}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </motion.div>
  );
};

export default FileTypeErrorAlert; 