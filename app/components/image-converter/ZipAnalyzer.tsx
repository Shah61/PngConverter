"use client";
import React, { useState, useEffect } from 'react';
import { FileArchive, CheckCircle, XCircle, FileImage, FileText, File } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { Checkbox } from '@/app/components/ui/checkbox';
import { motion } from 'framer-motion';
import { formatFileSize } from '../utils/imageUtils';
import JSZip from 'jszip';

interface ZipAnalyzerProps {
  zipFile: File;
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
  png: number;
  jpeg: number;
  other: number;
  byType: Record<string, number>;
}

const ZipAnalyzer: React.FC<ZipAnalyzerProps> = ({ zipFile, onSelect, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileDetail[]>([]);
  const [stats, setStats] = useState<FileStatistics>({
    total: 0,
    supported: 0,
    png: 0,
    jpeg: 0,
    other: 0,
    byType: {}
  });
  const [selectAll, setSelectAll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'supported' | 'unsupported'>('all');

  // Check if a file type is supported (only PNG is fully supported in this app)
  const isSupported = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ext === 'png';
  };

  // Get the MIME type from filename
  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'pdf': return 'application/pdf';
      case 'doc':
      case 'docx': return 'application/msword';
      case 'xls':
      case 'xlsx': return 'application/vnd.ms-excel';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };

  // Get file type display name
  const getFileTypeName = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'png': return 'PNG Image';
      case 'jpg':
      case 'jpeg': return 'JPEG Image';
      case 'gif': return 'GIF Image';
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Spreadsheet';
      case 'txt': return 'Text File';
      case 'zip': return 'ZIP Archive';
      default: return ext.toUpperCase() || 'Unknown';
    }
  };

  // Update statistics based on files
  const updateStatistics = (fileList: FileDetail[]) => {
    const newStats: FileStatistics = {
      total: fileList.length,
      supported: 0,
      png: 0,
      jpeg: 0,
      other: 0,
      byType: {}
    };

    fileList.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      
      // Update by extension
      if (ext === 'png') {
        newStats.png++;
        newStats.supported++;
      } else if (ext === 'jpg' || ext === 'jpeg') {
        newStats.jpeg++;
      } else {
        newStats.other++;
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
        setAnalyzing(true);
        
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
        setAnalyzing(false);
      } catch (err) {
        console.error('Error analyzing ZIP file:', err);
        setError('Failed to analyze the ZIP file. It may be corrupted or in an unsupported format.');
        setLoading(false);
        setAnalyzing(false);
      }
    };
    
    analyzeZip();
  }, [zipFile]);

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
    
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileImage size={20} className="text-indigo-500" />;
      case 'txt':
        return <FileText size={20} className="text-blue-500" />;
      default:
        return <File size={20} className="text-slate-500" />;
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
              <CardTitle className="text-xl font-bold text-slate-800">ZIP File Analysis</CardTitle>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-slate-500">Total Files</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600">Supported (PNG)</p>
              <p className="text-2xl font-bold text-green-700">{stats.png}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-600">JPEG Files</p>
              <p className="text-2xl font-bold text-amber-700">{stats.jpeg}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-slate-500">Other Files</p>
              <p className="text-2xl font-bold text-slate-800">{stats.other}</p>
            </div>
          </div>

          {/* File Type Breakdown */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h3 className="font-medium text-slate-700 mb-3">File Types</h3>
            <div className="space-y-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {type.includes('PNG') ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-slate-400" />
                    )}
                    <span className="text-sm">{type}</span>
                  </div>
                  <Badge variant={type.includes('PNG') ? "default" : "outline"} className={type.includes('PNG') ? "bg-green-100 text-green-800 border-0" : ""}>
                    {count} {count === 1 ? 'file' : 'files'}
                  </Badge>
                </div>
              ))}
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
                Supported ({stats.png})
              </Button>
              <Button 
                variant={filter === 'unsupported' ? "default" : "outline"} 
                size="sm"
                onClick={() => applyFilter('unsupported')}
                className={filter === 'unsupported' ? "bg-slate-600" : ""}
              >
                Unsupported ({stats.total - stats.png})
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

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-100">
            <AlertTitle className="text-blue-800">
              Only PNG files are fully supported
            </AlertTitle>
            <AlertDescription className="text-blue-700">
              Other file formats in the ZIP archive were detected but can't be processed. Only select PNG files for conversion.
            </AlertDescription>
          </Alert>
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
            Extract & Convert {files.filter(f => f.selected && f.supported).length} File(s)
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ZipAnalyzer;