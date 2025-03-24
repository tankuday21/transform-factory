'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiCamera } from 'react-icons/fi';
import { BiImageAdd } from 'react-icons/bi';
import { MdOutlineSettingsSuggest } from 'react-icons/md';

export default function ScanToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PDF options
  const [quality, setQuality] = useState<string>('medium');
  const [colorMode, setColorMode] = useState<string>('color');
  const [paperSize, setPaperSize] = useState<string>('a4');
  const [orientation, setOrientation] = useState<string>('portrait');
  const [margin, setMargin] = useState<string>('20');
  const [includeImageInfo, setIncludeImageInfo] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      
      // Check each file
      selectedFiles.forEach(file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          invalidFiles.push(`${file.name} is not an image file`);
          return;
        }
        
        // Check file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(`${file.name} exceeds the maximum size limit of 10MB`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (invalidFiles.length > 0) {
        setError(invalidFiles.join('. '));
        return;
      }
      
      setFiles([...files, ...validFiles]);
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
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      
      // Check each file
      droppedFiles.forEach(file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          invalidFiles.push(`${file.name} is not an image file`);
          return;
        }
        
        // Check file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(`${file.name} exceeds the maximum size limit of 10MB`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (invalidFiles.length > 0) {
        setError(invalidFiles.join('. '));
        return;
      }
      
      setFiles([...files, ...validFiles]);
      setError(null);
      setIsComplete(false);
    }
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setIsComplete(false);
  };

  // Process scan to PDF
  const createPdf = async () => {
    if (files.length === 0) {
      setError('Please select at least one image to scan');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Append all image files
      files.forEach(file => {
        formData.append('images', file);
      });
      
      // Append options
      formData.append('quality', quality);
      formData.append('colorMode', colorMode);
      formData.append('paperSize', paperSize);
      formData.append('orientation', orientation);
      formData.append('margin', margin);
      formData.append('includeImageInfo', includeImageInfo.toString());
      
      // Send request to API
      const response = await fetch('/api/pdf/scan', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create PDF from images');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = `scanned_document_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error creating PDF:', err);
      setError(err.message || 'An error occurred while creating the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFiles([]);
    setIsComplete(false);
    setError(null);
    setQuality('medium');
    setColorMode('color');
    setPaperSize('a4');
    setOrientation('portrait');
    setMargin('20');
    setIncludeImageInfo(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Scan to PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Convert your scanned images or photos into a professional PDF document
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiCamera className="mr-2 text-blue-500" size={24} />
            Upload Images
          </h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center">
              <BiImageAdd className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your images here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-600">
                Accepted formats: JPG, PNG, GIF, BMP • Maximum file size: 10MB per image
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Images ({files.length})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 mr-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        <FiFile size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - PDF options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <MdOutlineSettingsSuggest className="mr-2 text-gray-500 dark:text-gray-400" size={24} />
            <h2 className="text-xl font-semibold">PDF Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Paper size selection */}
            <div>
              <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paper Size
              </label>
              <select
                id="paperSize"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="a3">A3</option>
                <option value="a4">A4</option>
                <option value="a5">A5</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            
            {/* Orientation selection */}
            <div>
              <label htmlFor="orientation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center justify-center p-4 border ${
                    orientation === 'portrait'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700'
                  } rounded-md cursor-pointer`}
                  onClick={() => setOrientation('portrait')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-12 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <span className="text-sm">Portrait</span>
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center p-4 border ${
                    orientation === 'landscape'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700'
                  } rounded-md cursor-pointer`}
                  onClick={() => setOrientation('landscape')}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <span className="text-sm">Landscape</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quality selection */}
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low (Smaller file size)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Better quality)</option>
              </select>
            </div>
            
            {/* Color mode selection */}
            <div>
              <label htmlFor="colorMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Mode
              </label>
              <select
                id="colorMode"
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="color">Full Color</option>
                <option value="grayscale">Grayscale</option>
                <option value="blackwhite">Black & White</option>
              </select>
            </div>
            
            {/* Margin selection */}
            <div>
              <label htmlFor="margin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Margin (mm)
              </label>
              <input
                id="margin"
                type="number"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Extra options */}
            <div>
              <div className="flex items-center">
                <input
                  id="includeImageInfo"
                  type="checkbox"
                  checked={includeImageInfo}
                  onChange={(e) => setIncludeImageInfo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeImageInfo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Include image information in the footer
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || files.length === 0
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={createPdf}
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating PDF...
                </>
              ) : (
                <>
                  Create PDF
                </>
              )}
            </button>
            
            {files.length > 0 && (
              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                onClick={resetForm}
                disabled={isProcessing}
              >
                Reset Form
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Created Successfully</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your images have been successfully converted to a PDF document.
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 dark:text-green-400">
              {files.length} {files.length === 1 ? 'image' : 'images'} converted • {paperSize.toUpperCase()} {orientation}
            </p>
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 