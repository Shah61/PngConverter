// Format file size to human-readable format
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Get dimensions from an image URL
  export const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        resolve({width: img.width, height: img.height});
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };
  
  // Create a preview URL from a file
  export const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };
  
  // Clean up a preview URL
  export const revokePreviewUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };
  
  // Calculate aspect ratio
  export const calculateAspectRatio = (width: number, height: number): number => {
    return width / height;
  };
  
  // Validate file is PNG
  export const isPngFile = (file: File): boolean => {
    return file.type.includes('png');
  };
  
  // Generate a default filename from original
  export const generateDefaultFilename = (originalName: string): string => {
    return originalName.replace(/\.png$/i, "");
  };