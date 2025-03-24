'use client';

import { useState, useRef, useCallback } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiX, FiLoader, FiList } from 'react-icons/fi';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

interface BatchOperation {
  id: string;
  name: string;
  apiPath: string;
  description: string;
  icon: JSX.Element;
  options?: Record<string, any>;
}

export default function BatchProcessorPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string>('compress');
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');
  const [mergeStrategy, setMergeStrategy] = useState<string>('sequential');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Define batch operations
  const operations: BatchOperation[] = [
    {
      id: 'compress',
      name: 'Compress PDFs',
      apiPath: '/api/pdf/compress',
      description: 'Reduce file size of multiple PDFs',
      icon: <FiFile className="text-blue-500" />,
      options: {
        compressionLevel
      }
    },
    {
      id: 'merge',
      name: 'Merge PDFs',
      apiPath: '/api/pdf/merge',
      description: 'Combine multiple PDFs into one document',
      icon: <FiList className="text-green-500" />,
      options: {
        mergeStrategy
      }
    }
  ];

  // Get the current selected operation
  const currentOperation = operations.find(op => op.id === selectedOperation) || operations[0];

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => {
        // Check if file is a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are accepted');
          return false;
        }
        
        // Check file size (max 30MB per file)
        if (file.size > 30 * 1024 * 1024) {
          setError(`File ${file.name} exceeds the maximum limit of 30MB`);
          return false;
        }
        
        return true;
      });
      
      const batchFiles: BatchFile[] = newFiles.map(file => ({
        id: generateId(),
        file,
        status: 'pending',
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...batchFiles]);
      setError(null);
      setIsComplete(false);
    }
  };

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => {
        // Check if file is a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are accepted');
          return false;
        }
        
        // Check file size (max 30MB per file)
        if (file.size > 30 * 1024 * 1024) {
          setError(`File ${file.name} exceeds the maximum limit of 30MB`);
          return false;
        }
        
        return true;
      });
      
      const batchFiles: BatchFile[] = newFiles.map(file => ({
        id: generateId(),
        file,
        status: 'pending',
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...batchFiles]);
      setError(null);
      setIsComplete(false);
    }
  };

  // Remove a file from the batch
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setIsComplete(false);
  };

  // Remove all files
  const removeAllFiles = () => {
    setFiles([]);
    setIsComplete(false);
  };

  // Process a single file
  const processFile = async (file: BatchFile, operation: BatchOperation): Promise<BatchFile> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file.file);
      
      // Add operation options
      if (operation.options) {
        Object.entries(operation.options).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
      }
      
      // Send request to API
      const response = await fetch(operation.apiPath, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to process ${file.file.name}`);
      }
      
      // Get the processed file
      const result = await response.blob();
      
      return {
        ...file,
        status: 'complete',
        progress: 100,
        result
      };
    } catch (err: any) {
      console.error(`Error processing ${file.file.name}:`, err);
      return {
        ...file,
        status: 'error',
        progress: 0,
        error: err.message
      };
    }
  };

  // Process all files for the merge operation
  const processMerge = async (files: BatchFile[], operation: BatchOperation): Promise<BatchFile[]> => {
    try {
      // Create form data with all files
      const formData = new FormData();
      
      // Add files
      files.forEach((file, index) => {
        formData.append(`file${index}`, file.file);
      });
      
      // Add operation options
      if (operation.options) {
        Object.entries(operation.options).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
      }
      
      // Update status to processing for all files
      const updatedFiles = files.map(file => ({
        ...file,
        status: 'processing' as const,
        progress: 0
      }));
      setFiles(updatedFiles);
      
      // Send request to API
      const response = await fetch(operation.apiPath, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process files');
      }
      
      // Get the processed file
      const result = await response.blob();
      
      // Return all files with complete status and the same result
      return updatedFiles.map(file => ({
        ...file,
        status: 'complete' as const,
        progress: 100,
        result
      }));
    } catch (err: any) {
      console.error('Error processing merge:', err);
      return files.map(file => ({
        ...file,
        status: 'error' as const,
        progress: 0,
        error: err.message
      }));
    }
  };

  // Process all files
  const processFiles = async () => {
    if (files.length === 0) {
      setError('Please add at least one PDF file');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      let processedFiles: BatchFile[] = [...files];
      
      // Different processing based on operation type
      if (selectedOperation === 'merge') {
        // For merge, process all files at once
        processedFiles = await processMerge(files, currentOperation);
      } else {
        // For other operations, process files individually
        for (let i = 0; i < files.length; i++) {
          // Update status to processing
          processedFiles[i] = {
            ...processedFiles[i],
            status: 'processing',
            progress: 0
          };
          setFiles([...processedFiles]);
          
          // Process file
          processedFiles[i] = await processFile(processedFiles[i], currentOperation);
          
          // Update files state
          setFiles([...processedFiles]);
        }
      }
      
      setIsComplete(true);
    } catch (err: any) {
      console.error('Error processing files:', err);
      setError(err.message || 'An error occurred while processing the files.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download all processed files as a zip
  const downloadAllFiles = async () => {
    if (!isComplete) return;
    
    // If it's a merge operation, download the single file
    if (selectedOperation === 'merge' && files.length > 0 && files[0].result) {
      const url = URL.createObjectURL(files[0].result);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'merged.pdf';
      downloadLink.click();
      
      return;
    }
    
    // Otherwise, process multiple files
    const completedFiles = files.filter(file => file.status === 'complete' && file.result);
    
    if (completedFiles.length === 0) {
      setError('No completed files to download');
      return;
    }
    
    try {
      // Load the JSZip library dynamically
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add each file to the zip
      completedFiles.forEach(file => {
        if (file.result) {
          const fileName = file.file.name.replace('.pdf', '_processed.pdf');
          zip.file(fileName, file.result);
        }
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link
      const url = URL.createObjectURL(zipBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'processed_files.zip';
      downloadLink.click();
    } catch (err: any) {
      console.error('Error creating zip file:', err);
      setError('Failed to create download package. Please try downloading files individually.');
    }
  };

  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    if (files.length === 0) return 0;
    
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0);
    return Math.round(totalProgress / files.length);
  }, [files]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Batch PDF Processor</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Process multiple PDF files simultaneously to save time
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2 text-blue-500" size={24} />
            Upload PDF Files
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
            } mb-4`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
              multiple
            />
            
            <div className="flex flex-col items-center justify-center">
              <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop multiple PDF files here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-600">
                Accepted format: PDF • Maximum file size: 30MB per file
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Files ({files.length})</h3>
            {files.length > 0 && (
              <button
                type="button"
                className="text-sm text-red-500 hover:text-red-700"
                onClick={removeAllFiles}
              >
                Remove all
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-md">
            {files.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No files added yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map(file => (
                  <li key={file.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <FiFile className={`
                            ${file.status === 'complete' ? 'text-green-500' : 
                              file.status === 'error' ? 'text-red-500' : 
                              file.status === 'processing' ? 'text-blue-500' : 'text-gray-500'}
                          `} size={18} />
                        </div>
                        <div className="ml-2 truncate">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            {file.status === 'complete' && ' • Processed'}
                            {file.status === 'error' && ` • Error: ${file.error}`}
                            {file.status === 'processing' && ' • Processing...'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeFile(file.id)}
                        disabled={isProcessing}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    
                    {(file.status === 'processing' || file.status === 'complete') && (
                      <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            file.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Middle column - Operation Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiSettings className="mr-2 text-purple-500" size={24} />
            Batch Operation
          </h2>
          
          <div className="mb-6">
            <label htmlFor="operation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Operation
            </label>
            <select
              id="operation"
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            >
              {operations.map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {currentOperation.description}
            </p>
          </div>
          
          {/* Operation-specific settings */}
          {selectedOperation === 'compress' && (
            <div className="mb-6">
              <label htmlFor="compressionLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compression Level
              </label>
              <select
                id="compressionLevel"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                <option value="low">Low (Faster, Larger Files)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Slower, Smaller Files)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Higher compression takes longer but produces smaller files
              </p>
            </div>
          )}
          
          {selectedOperation === 'merge' && (
            <div className="mb-6">
              <label htmlFor="mergeStrategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Merge Strategy
              </label>
              <select
                id="mergeStrategy"
                value={mergeStrategy}
                onChange={(e) => setMergeStrategy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                <option value="sequential">Sequential (Preserve File Order)</option>
                <option value="alphabetical">Alphabetical (Sort by Filename)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how files will be ordered in the merged document
              </p>
            </div>
          )}
          
          {/* Batch processing settings */}
          <div>
            <h3 className="font-medium mb-3">Batch Processing Information</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Process multiple files simultaneously to save time</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Files are processed in background to prevent browser freezing</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Download all processed files as a single ZIP archive</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Maximum 30 files per batch for optimal performance</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || files.length === 0
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={processFiles}
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Batch... {calculateProgress()}%
                </>
              ) : (
                <>
                  <FiList className="mr-2" size={18} />
                  Process {files.length} Files
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Right column - Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiDownload className="mr-2 text-green-500" size={24} />
            Batch Results
          </h2>
          
          {!isComplete ? (
            <div className="flex items-center justify-center h-80 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <FiLoader size={48} className="mx-auto mb-4" />
                <p>Process files to see results</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Batch Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                    <p className="text-2xl font-bold">{files.length}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {files.filter(f => f.status === 'complete').length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {files.filter(f => f.status === 'error').length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((files.filter(f => f.status === 'complete').length / files.length) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex flex-col">
                <button
                  type="button"
                  className="py-2 px-4 mb-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center"
                  onClick={downloadAllFiles}
                  disabled={files.filter(f => f.status === 'complete').length === 0}
                >
                  <FiDownload className="mr-2" />
                  {selectedOperation === 'merge' ? 'Download Merged PDF' : 'Download All Files (ZIP)'}
                </button>
                
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium flex items-center justify-center"
                  onClick={removeAllFiles}
                >
                  Start a New Batch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Limitations section */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-medium mb-2">Batch Processing Limitations:</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
          <li>Maximum 30 files per batch</li>
          <li>Maximum file size: 30MB per file</li>
          <li>Only PDF files are supported</li>
          <li>For better performance, process fewer large files at once</li>
          <li>Processing time depends on file size, complexity, and selected options</li>
        </ul>
      </div>
    </div>
  );
} 