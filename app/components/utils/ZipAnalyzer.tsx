"use client";

import React, { useState, useEffect } from 'react';
import { FileArchive, CheckCircle, XCircle, FileImage, FileText, FilePdf, FileSpreadsheet, File, FileAudio, FileVideo } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { Checkbox } from '@/app/components/ui/checkbox';
import { motion } from 'framer-motion';
import JSZip from 'jszip';

// Converter type
export type ConverterType = 'image' | 'document' | 'audio' | 'video' | 'archive';

interface ZipAnalyzerProps {
  zipFile: File;
  converterType: ConverterType;
  onSelect: (selectedFiles: File[]) => void;
  onCancel: () => void;
}

interface FileDetail {
  name: string;
  path: string;
  type: string;
  size: number;
  supported: boolean;
  selected: boolean;
  blob?: Blob;
}

interface FileStatistics {
  total: number;
  supported: number;
  byType: Record<string, number>;
}

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ZipAnalyzer: React.FC<ZipAnalyzerProps> = ({ zipFile, converterType, onSelect, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileDetail[]>([]);
  const [stats, setStats] = useState<FileStatistics>({
    total: 0,
    supported: 0,
    byType: {}
  });
  const [selectAll, setSelectAll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'supported' | 'unsupported'>('all');

  // Get supported extensions based on converter type
  const getSupportedExtensions = (): string[] => {
    switch (converterType) {
      case 'image':
        return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'];
      case 'document':
        return ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt'];
      case 'audio':
        return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
      case 'video':
        return ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv'];
      case 'archive':
        return ['zip', 'rar', 'tar', '7z', 'gz', 'bz2', 'xz'];
      default:
        return [];
    }
  };

  // Check if a file is supported based on converterType
  const isSupported = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return getSupportedExtensions().includes(ext);
  };

  // Get the MIME type from filename
  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }
    
    // Document types
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'doc') return 'application/msword';
    if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === 'txt') return 'text/plain';
    if (ext === 'rtf') return 'application/rtf';
    if (ext === 'odt') return 'application/vnd.oasis.opendocument.text';
    
    // Audio types
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'flac') return 'audio/flac';
    if (ext === 'aac') return 'audio/aac';
    if (ext === 'm4a') return 'audio/mp4';
    
    // Video types
    if (ext === 'mp4') return 'video/mp4';
    if (ext === 'webm') return 'video/webm';
    if (ext === 'avi') return 'video/x-msvideo';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'mkv') return 'video/x-matroska';
    
    // Archive types
    if (ext === 'zip') return 'application/zip';
    if (ext === 'rar') return 'application/vnd.rar';
    if (ext === 'tar') return 'application/x-tar';
    if (ext === '7z') return 'application/x-7z-compressed';
    if (ext === 'gz') return 'application/gzip';
    
    return 'application/octet-stream';
  };

  // Get file type display name
  const getFileTypeName = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    if (ext === 'png') return 'PNG Image';
    if (ext === 'jpg' || ext === 'jpeg') return 'JPEG Image';
    if (ext === 'gif') return 'GIF Image';
    if (ext === 'webp') return 'WebP Image';
    if (ext === 'bmp') return 'BMP Image';
    
    // Document types
    if (ext === 'pdf') return 'PDF Document';
    if (ext === 'doc' || ext === 'docx') return 'Word Document';
    if (ext === 'txt') return 'Text File';
    if (ext === 'rtf') return 'Rich Text Format';
    if (ext === 'odt') return 'OpenDocument Text';
    
    // Audio types
    if (ext === 'mp3') return 'MP3 Audio';
    if (ext === 'wav') return 'WAV Audio';
    if (ext === 'ogg') return 'OGG Audio';
    if (ext === 'flac') return 'FLAC Audio';
    if (ext === 'aac') return 'AAC Audio';
    if (ext === 'm4a') return 'M4A Audio';
    
    // Video types
    if (ext === 'mp4') return 'MP4 Video';
    if (ext === 'webm') return 'WebM Video';
    if (ext === 'avi') return 'AVI Video';
    if (ext === 'mov') return 'MOV Video';
    if (ext === 'mkv') return 'MKV Video';
    
    // Archive types
    if (ext === 'zip') return 'ZIP Archive';
    if (ext === 'rar') return 'RAR Archive';
    if (ext === 'tar') return 'TAR Archive';
    if (ext === '7z') return '7Z Archive';
    if (ext === 'gz') return 'GZIP Archive';
    
    return ext.toUpperCase() || 'Unknown';
  };

  // Update statistics based on files
  const updateStatistics = (fileList: FileDetail[]) => {
    const newStats: FileStatistics = {
      total: fileList.length,
      supported: 0,
      byType: {}
    };

    fileList.forEach(file => {
      // Update supported count
      if (isSupported(file.name)) {
        newStats.supported++;
      }

      // Update by type category
      const typeKey = getFileTypeName(file.name);
      newStats.byType[typeKey] = (newStats.byType[typeKey] || 0) + 1;
    });

    setStats(newStats);
  };

  // Toggle selection of all files
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    setFiles(prev => prev.map(file => ({
      ...file,
      selected: newSelectAll && (filter === 'all' || 
                              (filter === 'supported' && file.supported) || 
                              (filter === 'unsupported' && !file.supported))
    })));
  };

  // Toggle selection of a single file
  const toggleFileSelection = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        selected: !newFiles[index].selected
      };
      return newFiles;
    });
  };

  // Apply filter to the file list
  const applyFilter = (newFilter: 'all' | 'supported' | 'unsupported') => {
    setFilter(newFilter);
    
    setFiles(prev => prev.map(file => ({
      ...file,
      selected: selectAll && (newFilter === 'all' || 
                          (newFilter === 'supported' && file.supported) || 
                          (newFilter === 'unsupported' && !file.supported))
    })));
  };

  // Extract and analyze the ZIP file content
  useEffect(() => {
    const analyzeZip = async () => {
      try {
        setLoading(true);
        
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(zipFile);
        
        const filePromises: Promise<FileDetail | null>[] = [];
        
        loadedZip.forEach((relativePath, zipEntry) => {
          // Skip directories and hidden files
          if (zipEntry.dir || relativePath.startsWith('__MACOSX/') || relativePath.startsWith('.')) {
            return;
          }
          
          // Process file
          const promise = zipEntry.async('blob').then(blob => {
            const fileName = zipEntry.name.split('/').pop() || zipEntry.name;
            const supported = isSupported(fileName);
            
            return {
              name: fileName,
              path: relativePath,
              type: getMimeType(fileName),
              size: blob.size,
              supported,
              selected: supported, // Select supported files by default
              blob
            };
          }).catch(err => {
            console.error(`Error extracting ${zipEntry.name}:`, err);
            return null;
          });
          
          filePromises.push(promise);
        });
        
        const fileResults = await Promise.all(filePromises);
        const extractedFiles = fileResults.filter(file => file !== null) as FileDetail[];
        
        if (extractedFiles.length === 0) {
          setError('No valid files found in the ZIP archive.');
          setLoading(false);
          return;
        }
        
        setFiles(extractedFiles);
        updateStatistics(extractedFiles);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing ZIP file:', err);
        setError('Failed to analyze the ZIP file. It may be corrupted or in an unsupported format.');
        setLoading(false);
      }
    };
    
    analyzeZip();
  }, [zipFile, converterType]);

  // Handle selection of files
  const handleSelectFiles = () => {
    const selectedFiles = files
      .filter(file => file.selected && file.supported && file.blob)
      .map(file => new window.File([file.blob!], file.name, { type: file.type }));
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one supported file.');
      return;
    }
    
    onSelect(selectedFiles);
  };

  // Render file icon based on file type
  const renderFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
      return <FileImage size={20} className="text-indigo-500" />;
    }
    
    // Document types
    if (ext === 'pdf') {
      return <FilePdf size={20} className="text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      return <FileText size={20} className="text-blue-500" />;
    }
    
    // Audio types
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
      return <FileAudio size={20} className="text-green-500" />;
    }
    
    // Video types
    if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) {
      return <FileVideo size={20} className="text-purple-500" />;
    }
    
    // Archive types
    if (['zip', 'rar', 'tar', '7z', 'gz'].includes(ext)) {
      return <FileArchive size={20} className="text-amber-500" />;
    }
    
    return <File size={20} className="text-slate-500" />;
  };

  // Get title and description based on converter type
  const getTitle = () => {
    switch (converterType) {
      case 'image': return 'ZIP File Analysis (Images)';
      case 'document': return 'ZIP File Analysis (Documents)';
      case 'audio': return 'ZIP File Analysis (Audio Files)';
      case 'video': return 'ZIP File Analysis (Video Files)';
      case 'archive': return 'ZIP File Analysis (Archives)';
      default: return 'ZIP File Analysis';
    }
  };

  // Get alert message based on converter type
  const getAlertMessage = () => {
    switch (converterType) {
      case 'image':
        return (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Supported image formats: PNG, JPG, JPEG, GIF, WebP
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Only supported image formats can be processed for conversion.
            </AlertDescription>
          </Alert>
        );
      case 'document':
        return (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Supported document formats: PDF, DOCX, TXT, RTF
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Only supported document formats can be processed for conversion.
            </AlertDescription>
          </Alert>
        );
      case 'audio':
        return (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Supported audio formats: MP3, WAV, OGG, FLAC, AAC
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Only supported audio formats can be processed for conversion.
            </AlertDescription>
          </Alert>
        );
      case 'video':
        return (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Supported video formats: MP4, WebM, AVI, MOV, MKV
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Only supported video formats can be processed for conversion.
            </AlertDescription>
          </Alert>
        );
      case 'archive':
        return (
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Supported archive formats: ZIP, RAR, TAR, 7Z, GZ
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Only supported archive formats can be processed for conversion.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-16 h-16 border-4 border-t-transparent border-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xl font-medium text-slate-700">Analyzing ZIP file...</p>
            <p className="text-slate-500">Extracting and scanning files from {zipFile.name}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error analyzing ZIP file</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button onClick={onCancel} variant="outline">Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter files based on current filter
  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'supported') return file.supported;
    if (filter === 'unsupported') return !file.supported;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">
                {getTitle()}
              </CardTitle>
              <CardDescription className="mt-1">
                Analyzing content of <span className="font-medium">{zipFile.name}</span> ({formatFileSize(zipFile.size)})
              </CardDescription>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FileArchive size={24} className="text-indigo-600" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-slate-500">Total Files</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600">Supported Files</p>
              <p className="text-2xl font-bold text-green-700">{stats.supported}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-600">Unsupported Files</p>
              <p className="text-2xl font-bold text-amber-700">{stats.total - stats.supported}</p>
            </div>
          </div>

          {/* File Type Breakdown */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h3 className="font-medium text-slate-700 mb-3">File Types</h3>
            <div className="space-y-2">
              {Object.entries(stats.byType).map(([type, count]) => {
                const isFileTypeSupported = getSupportedExtensions().some(ext => 
                  type.toLowerCase().includes(ext.toLowerCase())
                );
                
                return (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isFileTypeSupported ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-slate-400" />
                      )}
                      <span className="text-sm">{type}</span>
                    </div>
                    <Badge 
                      variant={isFileTypeSupported ? "default" : "outline"} 
                      className={isFileTypeSupported ? "bg-green-100 text-green-800 border-0" : ""}
                    >
                      {count} {count === 1 ? 'file' : 'files'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* File Selection Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all" 
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select all {filter !== 'all' ? filter : ''} files
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? "default" : "outline"} 
                size="sm"
                onClick={() => applyFilter('all')}
                className={filter === 'all' ? "bg-indigo-600" : ""}
              >
                All ({stats.total})
              </Button>
              <Button 
                variant={filter === 'supported' ? "default" : "outline"} 
                size="sm"
                onClick={() => applyFilter('supported')}
                className={filter === 'supported' ? "bg-green-600" : ""}
              >
                Supported ({stats.supported})
              </Button>
              <Button 
                variant={filter === 'unsupported' ? "default" : "outline"} 
                size="sm"
                onClick={() => applyFilter('unsupported')}
                className={filter === 'unsupported' ? "bg-slate-600" : ""}
              >
                Unsupported ({stats.total - stats.supported})
              </Button>
            </div>
          </div>

          {/* File List */}
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                    Select
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    File
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No files match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file, index) => (
                    <tr key={file.path} className={file.supported ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Checkbox 
                          checked={file.selected}
                          disabled={!file.supported}
                          onCheckedChange={() => toggleFileSelection(files.indexOf(file))}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {renderFileIcon(file.name)}
                          <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {getFileTypeName(file.name)}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {file.supported ? (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            Supported
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-600">
                            Unsupported
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Alert based on converter type */}
          {getAlertMessage()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            className="bg-indigo-600"
            onClick={handleSelectFiles}
            disabled={!files.some(f => f.selected && f.supported)}
          >
            Extract {files.filter(f => f.selected && f.supported).length} File(s)
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ZipAnalyzer; 