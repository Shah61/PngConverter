import React from 'react';
import { motion } from 'framer-motion';
import { Image, FileImage, FileArchive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageConversionOptionsProps {
  activeFormat: string;
  onFormatChange: (format: string) => void;
}

const imageFormats = [
  {
    id: 'png-to-jpg',
    label: 'PNG to JPG',
    description: 'Convert PNG images to JPG format',
    icon: Image,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'jpg-to-png',
    label: 'JPG to PNG',
    description: 'Convert JPG images to PNG format',
    icon: FileImage,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'webp-to-png',
    label: 'WebP to PNG',
    description: 'Convert WebP images to PNG format',
    icon: Image,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'png-to-webp',
    label: 'PNG to WebP',
    description: 'Convert PNG images to WebP format',
    icon: Image,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'heic-to-jpg',
    label: 'HEIC to JPG',
    description: 'Convert HEIC images to JPG format',
    icon: FileImage,
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'batch-convert',
    label: 'Batch Convert',
    description: 'Convert multiple images at once',
    icon: FileArchive,
    color: 'from-violet-500 to-fuchsia-500',
  },
];

const ImageConversionOptions: React.FC<ImageConversionOptionsProps> = ({
  activeFormat,
  onFormatChange,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Image Conversion</h2>
        <p className="text-slate-600">
          Choose the type of image conversion you need. All conversions are done securely and maintain image quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageFormats.map((format) => {
          const Icon = format.icon;
          return (
            <motion.button
              key={format.id}
              onClick={() => onFormatChange(format.id)}
              className={`relative p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
                activeFormat === format.id
                  ? 'ring-2 ring-indigo-500'
                  : 'hover:ring-1 hover:ring-slate-200'
              }`}
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col items-start">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${format.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{format.label}</h3>
                <p className="text-sm text-slate-600 mb-3">{format.description}</p>
                <Badge variant="outline" className="bg-slate-50">
                  {format.id === 'batch-convert' ? 'Multiple Files' : 'Single File'}
                </Badge>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Features</h3>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            High-quality conversion with minimal quality loss
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Support for batch processing multiple files
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Preserve image metadata and EXIF data
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Secure file handling with automatic deletion
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImageConversionOptions; 