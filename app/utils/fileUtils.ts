/**
 * File type validation utility functions
 */

// Define file type groups with MIME types
export const fileTypes = {
  image: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  audio: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/m4a',
    'audio/wma'
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/quicktime', // .mov
    'video/x-matroska', // .mkv
    'video/x-flv',
    'video/x-ms-wmv'
  ],
  archive: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-bzip2'
  ]
};

// Extension mappings for better detection when MIME type is not available
export const extensionToTypeMap: Record<string, string> = {
  // Images
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'svg': 'image/svg+xml',
  
  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'csv': 'text/csv',
  
  // Audio
  'mp3': 'audio/mp3',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'flac': 'audio/flac',
  'aac': 'audio/aac',
  'm4a': 'audio/m4a',
  'wma': 'audio/wma',
  
  // Video
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'avi': 'video/avi',
  'mov': 'video/quicktime',
  'mkv': 'video/x-matroska',
  'flv': 'video/x-flv',
  'wmv': 'video/x-ms-wmv',
  
  // Archives
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  'tar': 'application/x-tar',
  '7z': 'application/x-7z-compressed',
  'gz': 'application/gzip',
  'bz2': 'application/x-bzip2'
};

// User-friendly names for tab recommendations
export const typeToTabMap: Record<string, string> = {
  'image': 'Image Converter',
  'document': 'Document Converter',
  'audio': 'Audio Converter',
  'video': 'Video Converter',
  'archive': 'Archive Converter'
};

/**
 * Get file type category from MIME type
 */
export const getFileTypeCategory = (mimeType: string): string | null => {
  for (const [category, types] of Object.entries(fileTypes)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  return null;
};

/**
 * Validates if a file matches the expected type category
 */
export const validateFileType = (file: File, expectedType: 'image' | 'document' | 'audio' | 'video' | 'archive'): boolean => {
  // First try using the file's type property
  if (file.type && fileTypes[expectedType].includes(file.type)) {
    return true;
  }
  
  // If file.type is empty or not recognized, try using the file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = extensionToTypeMap[extension];
  
  if (mimeType && fileTypes[expectedType].includes(mimeType)) {
    return true;
  }
  
  // Special case for ZIP files which could be valid in any category
  // as they are containers that may contain the right files
  if (extension === 'zip') {
    return true;
  }
  
  return false;
};

/**
 * Gets the recommended tab for a file based on its type
 */
export const getRecommendedTabForFile = (file: File): string | null => {
  // First try using the file's type property
  if (file.type) {
    const category = getFileTypeCategory(file.type);
    if (category) return category;
  }
  
  // If file.type is empty or not recognized, try using the file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = extensionToTypeMap[extension];
  
  if (mimeType) {
    return getFileTypeCategory(mimeType);
  }
  
  // If it's a ZIP file, we can't determine without inspecting contents
  if (extension === 'zip') {
    return 'zip';
  }
  
  return null;
};

/**
 * Gets human-readable string of supported file types for a converter
 */
export const getSupportedFileTypesText = (converterType: 'image' | 'document' | 'audio' | 'video' | 'archive'): string => {
  switch (converterType) {
    case 'image':
      return 'PNG, JPEG, GIF, WebP, etc.';
    case 'document':
      return 'PDF, DOCX, TXT, etc.';
    case 'audio':
      return 'MP3, WAV, OGG, etc.';
    case 'video':
      return 'MP4, WebM, AVI, etc.';
    case 'archive':
      return 'ZIP, RAR, TAR, etc.';
    default:
      return '';
  }
}; 