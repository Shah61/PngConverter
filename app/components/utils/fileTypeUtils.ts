export type ConverterType = 'image' | 'document' | 'audio' | 'video' | 'archive';

// File extensions organized by converter type
const fileExtensionMap: Record<ConverterType, string[]> = {
  'image': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'ico', 'heic', 'heif'],
  'document': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp', 'csv'],
  'audio': ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'aiff'],
  'video': ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'm4v', '3gp'],
  'archive': ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
};

// MIME types organized by converter type
const mimeTypePatterns: Record<ConverterType, string[]> = {
  'image': ['image/'],
  'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'text/plain', 'text/csv'],
  'audio': ['audio/'],
  'video': ['video/'],
  'archive': ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip']
};

/**
 * Detects the correct converter type for a given file
 * @param file The file to analyze
 * @returns The converter type that should be used for this file
 */
export function detectFileConverterType(file: File): ConverterType | null {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();
  
  // Handle special case for JPEG files
  if (extension === 'jpg' || extension === 'jpeg' || mimeType === 'image/jpeg') {
    return 'image';
  }
  
  // Handle special case for PNG files
  if (extension === 'png' || mimeType === 'image/png') {
    return 'image';
  }
  
  // Handle special case for WebP files
  if (extension === 'webp' || mimeType === 'image/webp') {
    return 'image';
  }
  
  // Handle special case for GIF files
  if (extension === 'gif' || mimeType === 'image/gif') {
    return 'image';
  }
  
  // Handle special case for BMP files
  if (extension === 'bmp' || mimeType === 'image/bmp') {
    return 'image';
  }
  
  // Handle special case for TIFF files
  if (extension === 'tiff' || extension === 'tif' || mimeType === 'image/tiff') {
    return 'image';
  }
  
  // Handle special case for SVG files
  if (extension === 'svg' || mimeType === 'image/svg+xml') {
    return 'image';
  }
  
  // Handle common document types
  if (
    extension === 'pdf' || 
    extension === 'doc' || 
    extension === 'docx' || 
    extension === 'xls' || 
    extension === 'xlsx' || 
    extension === 'csv' || 
    extension === 'txt' || 
    extension === 'rtf' || 
    mimeType.includes('application/pdf') || 
    mimeType.includes('application/msword') || 
    mimeType.includes('officedocument.wordprocessingml') ||
    mimeType.includes('officedocument.spreadsheetml') ||
    mimeType.includes('text/plain') ||
    mimeType.includes('text/csv')
  ) {
    return 'document';
  }
  
  // Handle common audio types
  if (
    extension === 'mp3' ||
    extension === 'wav' ||
    extension === 'ogg' ||
    extension === 'flac' ||
    extension === 'aac' ||
    extension === 'm4a' ||
    mimeType.includes('audio/')
  ) {
    return 'audio';
  }
  
  // Handle common video types
  if (
    extension === 'mp4' ||
    extension === 'mov' ||
    extension === 'avi' ||
    extension === 'mkv' ||
    extension === 'webm' ||
    extension === 'flv' ||
    mimeType.includes('video/')
  ) {
    return 'video';
  }
  
  // Handle common archive types
  if (
    extension === 'zip' ||
    extension === 'rar' ||
    extension === '7z' ||
    extension === 'tar' ||
    extension === 'gz' ||
    mimeType.includes('application/zip') ||
    mimeType.includes('application/x-rar') ||
    mimeType.includes('application/x-7z') ||
    mimeType.includes('application/x-tar') ||
    mimeType.includes('application/gzip')
  ) {
    return 'archive';
  }
  
  // If no direct match was found, try the extension and MIME type lists
  
  // First try to match by extension
  for (const [converterType, extensions] of Object.entries(fileExtensionMap)) {
    if (extensions.includes(extension)) {
      return converterType as ConverterType;
    }
  }

  // Then try to match by MIME type pattern
  for (const [converterType, patterns] of Object.entries(mimeTypePatterns)) {
    for (const pattern of patterns) {
      if (mimeType.includes(pattern)) {
        return converterType as ConverterType;
      }
    }
  }

  return null; // Unknown file type
}

/**
 * Checks if a file is valid for a specific converter type
 * @param file The file to check
 * @param converterType The converter type to validate against
 * @returns Boolean indicating if the file is valid for the converter
 */
export function isFileValidForConverter(file: File, converterType: ConverterType): boolean {
  const detectedType = detectFileConverterType(file);
  return detectedType === converterType;
}

/**
 * Filters an array of files to only include those valid for a specific converter
 * @param files Array of files to filter
 * @param converterType The converter type to filter by
 * @returns An array containing only valid files for the converter
 */
export function filterFilesByConverterType(files: File[], converterType: ConverterType): File[] {
  return files.filter(file => isFileValidForConverter(file, converterType));
}

/**
 * Groups files by their converter type
 * @param files Array of files to group
 * @returns A record with converter types as keys and arrays of files as values
 */
export function groupFilesByConverterType(files: File[]): Record<ConverterType, File[]> {
  const result: Record<ConverterType, File[]> = {
    'image': [],
    'document': [],
    'audio': [],
    'video': [],
    'archive': []
  };

  for (const file of files) {
    const type = detectFileConverterType(file);
    if (type) {
      result[type].push(file);
    }
  }

  return result;
} 