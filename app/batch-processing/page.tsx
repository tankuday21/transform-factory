'use client';

import { useState, useCallback, useRef } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { FiFileText, FiUpload, FiDownload, FiSettings, FiTrash, FiX, FiCheck, FiRotateCw, FiAlertCircle, FiInfo, FiZap } from 'react-icons/fi';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: Blob;
  error?: string;
}

interface BatchProcessingOptions {
  operation: 'compress' | 'convert-to-jpg' | 'extract-text' | 'add-watermark';
  quality?: 'low' | 'medium' | 'high';
  dpi?: number;
  watermarkText?: string;
  watermarkOpacity?: number;
  outputFormat?: 'pdf' | 'jpg' | 'png' | 'txt';
}

export default function BatchProcessingPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<BatchProcessingOptions>({
    operation: 'compress',
    quality: 'medium',
    dpi: 150,
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 30,
    outputFormat: 'pdf',
  });
  
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  
  // Accept only PDF files with max size of 30MB
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === 'file-too-large') {
        setError('One or more files are too large. Maximum size is 30MB per file.');
      } else if (errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload only PDF files.');
      } else {
        setError(errors[0]?.message || 'Error uploading files.');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        status: 'pending' as const,
        progress: 0,
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 30 * 1024 * 1024, // 30MB
  });
  
  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  
  // Clear all files from the list
  const clearAllFiles = () => {
    setFiles([]);
    setProcessingComplete(false);
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Start processing all files
  const startProcessing = async () => {
    if (files.length === 0) {
      setError('Please add files to process.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingComplete(false);
    setError(null);
    
    try {
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        // Skip already processed files
        if (files[i].status === 'completed') continue;
        
        // Update file status to processing
        setFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'processing', progress: 0 };
          return updated;
        });
        
        try {
          // Simulate processing with a delay
          await processFile(i);
          
          // Update file status to completed
          setFiles(prev => {
            const updated = [...prev];
            updated[i] = { 
              ...updated[i], 
              status: 'completed', 
              progress: 100,
              result: new Blob([`Processed content for ${prev[i].file.name}`], { type: 'application/pdf' })
            };
            return updated;
          });
        } catch (err: any) {
          // Update file status to error
          setFiles(prev => {
            const updated = [...prev];
            updated[i] = { 
              ...updated[i], 
              status: 'error', 
              progress: 0,
              error: err.message || 'Error processing file.'
            };
            return updated;
          });
        }
      }
      
      setProcessingComplete(true);
    } catch (err: any) {
      console.error('Error during batch processing:', err);
      setError(err.message || 'An error occurred during batch processing.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process a single file
  const processFile = async (index: number) => {
    return new Promise<void>((resolve, reject) => {
      let progress = 0;
      
      // Simulate processing progress
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
          setFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
          
          // Add a small delay before resolving to simulate final processing
          setTimeout(() => resolve(), 500);
        } else {
          setFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
        }
      }, 200);
      
      // Simulate random errors (10% chance)
      if (Math.random() < 0.1) {
        clearInterval(interval);
        reject(new Error('Random processing error for demonstration purposes.'));
      }
    });
  };
  
  // Download a processed file
  const downloadFile = (file: BatchFile) => {
    if (!file.result) return;
    
    const url = URL.createObjectURL(file.result);
    
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = `processed_${file.file.name}`;
      downloadLinkRef.current.click();
    }
  };
  
  // Download all processed files as a ZIP
  const downloadAllAsZip = () => {
    const successfulFiles = files.filter(file => file.status === 'completed');
    
    if (successfulFiles.length === 0) {
      setError('No successfully processed files to download.');
      return;
    }
    
    // In a real application, this would create a ZIP file containing all processed files
    alert(`In a real implementation, this would download a ZIP file containing all ${successfulFiles.length} processed files.`);
  };
  
  // Handle option changes
  const handleOptionChange = (key: keyof BatchProcessingOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Batch Processing</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Process multiple PDF files at once to save time
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - File Upload */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiUpload className="mr-2 text-blue-500" size={24} />
              Upload Files
            </h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <input {...getInputProps()} />
              <FiFileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              
              {isDragActive ? (
                <p className="text-blue-500">Drop the PDF files here...</p>
              ) : (
                <>
                  <p className="mb-2 font-medium">Drag &amp; drop PDF files here, or click to select</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Process multiple PDFs at once. Maximum 30MB per file.
                  </p>
                </>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start">
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Files to Process ({files.length})</h3>
                  <button 
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                    onClick={clearAllFiles}
                    disabled={isProcessing}
                  >
                    <FiTrash className="mr-1" size={14} />
                    Clear All
                  </button>
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {files.map(file => (
                      <li key={file.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FiFileText className="text-gray-400 mr-3" size={20} />
                            <div>
                              <p className="font-medium truncate max-w-[260px]">{file.file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.file.size)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {file.status === 'pending' && (
                              <span className="text-xs text-gray-500 mr-3">Pending</span>
                            )}
                            
                            {file.status === 'processing' && (
                              <div className="mr-3 w-20">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${file.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {file.status === 'completed' && (
                              <button 
                                type="button"
                                className="mr-3 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-400 py-1 px-2 rounded flex items-center"
                                onClick={() => downloadFile(file)}
                              >
                                <FiDownload className="mr-1" size={12} />
                                Download
                              </button>
                            )}
                            
                            {file.status === 'error' && (
                              <span className="text-xs text-red-600 dark:text-red-400 mr-3">
                                Error: {file.error}
                              </span>
                            )}
                            
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                              onClick={() => removeFile(file.id)}
                              disabled={isProcessing && file.status === 'processing'}
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {processingComplete && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg flex items-center">
                    <FiCheck className="mr-2 flex-shrink-0" />
                    <p className="text-sm">All files processed successfully!</p>
                  </div>
                )}
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    className={`w-full sm:w-auto py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                      isProcessing
                        ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    } text-white`}
                    onClick={startProcessing}
                    disabled={isProcessing || files.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <FiRotateCw className="mr-2 animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiZap className="mr-2" size={18} />
                        Start Batch Processing
                      </>
                    )}
                  </button>
                  
                  {processingComplete && (
                    <button
                      type="button"
                      className="w-full sm:w-auto py-2 px-4 rounded-lg font-medium flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                      onClick={downloadAllAsZip}
                    >
                      <FiDownload className="mr-2" size={18} />
                      Download All as ZIP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Processing Options */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiSettings className="mr-2 text-purple-500" size={24} />
              Processing Options
            </h2>
            
            <div className="space-y-6">
              {/* Operation selector */}
              <div>
                <label htmlFor="operation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operation
                </label>
                <select
                  id="operation"
                  value={options.operation}
                  onChange={(e) => handleOptionChange('operation', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isProcessing}
                >
                  <option value="compress">Compress PDFs</option>
                  <option value="convert-to-jpg">Convert to JPG</option>
                  <option value="extract-text">Extract Text</option>
                  <option value="add-watermark">Add Watermark</option>
                </select>
              </div>
              
              {/* Quality selector (for compress and convert operations) */}
              {(options.operation === 'compress' || options.operation === 'convert-to-jpg') && (
                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quality
                  </label>
                  <select
                    id="quality"
                    value={options.quality}
                    onChange={(e) => handleOptionChange('quality', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="low">Low (smaller file size)</option>
                    <option value="medium">Medium (balanced)</option>
                    <option value="high">High (better quality)</option>
                  </select>
                </div>
              )}
              
              {/* DPI selector (for image conversion) */}
              {options.operation === 'convert-to-jpg' && (
                <div>
                  <label htmlFor="dpi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    DPI
                  </label>
                  <select
                    id="dpi"
                    value={options.dpi}
                    onChange={(e) => handleOptionChange('dpi', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="72">72 DPI (web)</option>
                    <option value="150">150 DPI (standard)</option>
                    <option value="300">300 DPI (print)</option>
                    <option value="600">600 DPI (high quality)</option>
                  </select>
                </div>
              )}
              
              {/* Watermark options */}
              {options.operation === 'add-watermark' && (
                <>
                  <div>
                    <label htmlFor="watermarkText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      id="watermarkText"
                      value={options.watermarkText}
                      onChange={(e) => handleOptionChange('watermarkText', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isProcessing}
                      placeholder="Enter watermark text"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="watermarkOpacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Opacity: {options.watermarkOpacity}%
                    </label>
                    <input
                      type="range"
                      id="watermarkOpacity"
                      min="10"
                      max="100"
                      step="5"
                      value={options.watermarkOpacity}
                      onChange={(e) => handleOptionChange('watermarkOpacity', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={isProcessing}
                    />
                  </div>
                </>
              )}
              
              {/* Output format selector (for certain operations) */}
              {options.operation === 'extract-text' && (
                <div>
                  <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    id="outputFormat"
                    value={options.outputFormat}
                    onChange={(e) => handleOptionChange('outputFormat', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="txt">Text File (.txt)</option>
                  </select>
                </div>
              )}
              
              {/* Information about the selected operation */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                  <FiInfo className="mr-2" size={16} />
                  About {getOperationName(options.operation)}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {getOperationDescription(options.operation)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Batch Processing Info */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-medium mb-3">Batch Processing Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                <span>Process multiple files at once to save time</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                <span>Apply the same settings to all documents</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                <span>Download individual files or get everything in a ZIP</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                <span>Perfect for processing entire folders of documents</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden"></a>
    </div>
  );
}

// Helper function to get operation display name
function getOperationName(operation: string): string {
  switch (operation) {
    case 'compress':
      return 'PDF Compression';
    case 'convert-to-jpg':
      return 'PDF to JPG Conversion';
    case 'extract-text':
      return 'Text Extraction';
    case 'add-watermark':
      return 'Watermark Addition';
    default:
      return 'Operation';
  }
}

// Helper function to get operation description
function getOperationDescription(operation: string): string {
  switch (operation) {
    case 'compress':
      return 'Reduces the file size of your PDFs while maintaining reasonable quality. Perfect for email attachments or uploading to websites.';
    case 'convert-to-jpg':
      return 'Converts each page of your PDF documents into JPG images. You can choose the quality and DPI to balance size and image clarity.';
    case 'extract-text':
      return 'Extracts all text content from your PDFs into plain text files. Useful for indexing, searching, or editing the content in a text editor.';
    case 'add-watermark':
      return 'Adds a text watermark to all pages of your PDF files. You can customize the text and adjust opacity to make it more or less visible.';
    default:
      return 'Select an operation to see more information.';
  }
} 