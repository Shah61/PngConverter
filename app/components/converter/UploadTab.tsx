import React, { useRef } from "react";
import { Upload, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface UploadTabProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
  error: string | null;
  isDragOver?: boolean;
}

const UploadTab: React.FC<UploadTabProps> = ({ 
  onFileChange, 
  onDrop, 
  onDragOver,
  onDragLeave,
  error,
  isDragOver = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
        isDragOver 
          ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' 
          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <motion.div 
        className="flex flex-col items-center justify-center space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className={`relative p-6 rounded-full ${isDragOver ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 text-indigo-500'} transition-colors duration-300`}
        >
          {isDragOver ? (
            <FileArchive size={42} />
          ) : (
            <Upload size={42} />
          )}
          {isDragOver && (
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-indigo-400"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            ></motion.div>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-slate-800">Drag & drop your files here</h3>
          <p className="text-slate-500 mt-2">PNG files or ZIP archives</p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button 
            onClick={handleUploadClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
            size="lg"
          >
            <Upload size={20} className="mr-2" />
            Select Files
          </Button>
          <input
            id="file-input"
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept=".png,.zip,application/zip,application/x-zip-compressed"
            multiple={true}
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex gap-2 items-center">
          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
            PNG files
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white">
            ZIP archives
          </Badge>
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-sm text-slate-500 max-w-md">
          Upload PNG files directly or ZIP archives containing multiple images. ZIP files will be scanned for supported formats.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UploadTab;