'use client'

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck } from 'react-icons/fi';

export default function PdfToPowerPointPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Conversion options
  const [quality, setQuality] = useState<string>('high');
  const [pageRange, setPageRange] = useState<string>('all');
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB.');
        return;
      }
      
      setFile(selectedFile);
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
      const selectedFile = e.dataTransfer.files[0];
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Process the PDF
  const processPDF = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('quality', quality);
      formData.append('pageRange', pageRange);
      formData.append('includeNotes', includeNotes.toString());
      
      // Send request to API
      const response = await fetch('/api/pdf/to-powerpoint', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert PDF to PowerPoint');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = file.name.replace('.pdf', '.pptx');
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error converting PDF:', err);
      setError(err.message || 'An error occurred while converting PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate page range input
  const validatePageRange = (input: string) => {
    if (input === 'all') return true;
    
    // Allow digits, commas, hyphens, and spaces
    const validChars = /^[\d,\-\s]+$/;
    if (!validChars.test(input)) return false;
    
    // Check each part of the range
    const parts = input.split(',');
    return parts.every(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        return !isNaN(start) && !isNaN(end) && start > 0 && end > 0 && start <= end;
      } else {
        const page = parseInt(part);
        return !isNaN(page) && page > 0;
      }
    });
  };

  // Handle page range input change
  const handlePageRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageRange(value);
    
    if (value && !validatePageRange(value)) {
      setError('Invalid page range. Use format like "1,3,5-7" or "all".');
    } else {
      setError(null);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setQuality('high');
    setPageRange('all');
    setIncludeNotes(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Convert PDF to PowerPoint</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Transform your PDF documents into editable PowerPoint presentations
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF File</h2>
          
          {!file ? (
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
                accept=".pdf"
                onChange={handleFileChange}
              />
              
              <div className="flex flex-col items-center justify-center">
                <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your PDF file here, or{' '}
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-600">
                  Maximum file size: 30MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <FiFile size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                onClick={resetForm}
                aria-label="Remove file"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Right column - Conversion options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">2. Conversion Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Quality selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversion Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border text-center ${
                    quality === 'draft'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('draft')}
                >
                  <div className="font-medium">Draft</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Faster conversion</div>
                </button>
                
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border text-center ${
                    quality === 'standard'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('standard')}
                >
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Balanced</div>
                </button>
                
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border text-center ${
                    quality === 'high'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('high')}
                >
                  <div className="font-medium">High</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Best accuracy</div>
                </button>
              </div>
            </div>
            
            {/* Page range */}
            <div>
              <label htmlFor="page-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Range
              </label>
              <input
                type="text"
                id="page-range"
                placeholder="e.g. 1,3,5-7 or 'all'"
                value={pageRange}
                onChange={handlePageRangeChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter 'all' for all pages, or specify pages/ranges like "1,3,5-7"
              </p>
            </div>
            
            {/* Include notes checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-notes"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="include-notes" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Include space for notes on each slide
              </label>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">About This Conversion</h3>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Converts your PDF into an editable PowerPoint presentation (.pptx)</li>
                <li>• Each PDF page becomes a slide in your presentation</li>
                <li>• Preserves images, basic text layout, and formatting</li>
                <li>• Complex animations and interactive elements will be simplified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className={`py-2 px-6 rounded-lg font-medium flex items-center ${
            isProcessing || !file || error
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } text-white`}
          onClick={processPDF}
          disabled={isProcessing || !file || !!error}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Convert to PowerPoint'
          )}
        </button>
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Conversion Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been converted to a PowerPoint presentation.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download PowerPoint
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 