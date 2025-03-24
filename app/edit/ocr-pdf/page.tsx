'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiSearch } from 'react-icons/fi';

export default function OcrPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // OCR options
  const [language, setLanguage] = useState<string>('eng');
  const [accuracy, setAccuracy] = useState<string>('high');
  const [outputFormat, setOutputFormat] = useState<string>('pdf');
  const [pageRange, setPageRange] = useState<string>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB');
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
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file');
        return;
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Validate page range input
  const validatePageRange = (value: string): boolean => {
    if (value === 'all') return true;
    
    // Regular expression to match patterns like "1-3,5,7-9"
    const pageRangeRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    return pageRangeRegex.test(value);
  };

  // Process OCR
  const processOcr = async () => {
    if (!file) {
      setError('Please select a PDF file to process');
      return;
    }
    
    // Validate page range
    if (pageRange !== 'all' && !validatePageRange(pageRange)) {
      setError('Invalid page range format. Please use format like "1-3,5,7-9"');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('accuracy', accuracy);
      formData.append('outputFormat', outputFormat);
      formData.append('pageRange', pageRange);
      
      // Send request to API
      const response = await fetch('/api/pdf/ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process OCR');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        
        // Create output file name
        const fileNameParts = file.name.split('.');
        fileNameParts.pop(); // Remove extension
        const baseName = fileNameParts.join('.');
        downloadLinkRef.current.download = `${baseName}_ocr.${outputFormat}`;
        
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error processing OCR:', err);
      setError(err.message || 'An error occurred while processing OCR. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setLanguage('eng');
    setAccuracy('high');
    setOutputFormat('pdf');
    setPageRange('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">OCR PDF (Make PDF Searchable)</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Convert scanned documents and images in PDFs to searchable, selectable text
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiFile className="mr-2 text-blue-500" size={24} />
            Upload PDF
          </h2>
          
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
                  Accepted format: PDF • Maximum file size: 30MB
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
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">What Is OCR?</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
              Optical Character Recognition (OCR) converts images of text into machine-readable text. This tool:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
              <li>Makes scanned PDFs searchable</li>
              <li>Enables text selection in image-based PDFs</li>
              <li>Improves accessibility for visually impaired users</li>
              <li>Supports multiple languages</li>
              <li>Preserves original layout and formatting</li>
            </ul>
          </div>
        </div>
        
        {/* Right column - OCR options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FiSettings className="mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">OCR Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Language selection */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OCR Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="eng">English</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="spa">Spanish</option>
                <option value="ita">Italian</option>
                <option value="por">Portuguese</option>
                <option value="rus">Russian</option>
                <option value="jpn">Japanese</option>
                <option value="chi_sim">Chinese Simplified</option>
                <option value="chi_tra">Chinese Traditional</option>
                <option value="ara">Arabic</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select the primary language of the text in your document
              </p>
            </div>
            
            {/* Accuracy level */}
            <div>
              <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OCR Accuracy
              </label>
              <select
                id="accuracy"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fast">Fast (Lower accuracy)</option>
                <option value="balanced">Balanced</option>
                <option value="high">High Quality (Slower)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Higher accuracy takes longer but produces better results
              </p>
            </div>
            
            {/* Output format */}
            <div>
              <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format
              </label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pdf">Searchable PDF</option>
                <option value="txt">Text File (TXT)</option>
                <option value="docx">Word Document (DOCX)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose how you want the OCR results to be delivered
              </p>
            </div>
            
            {/* Page Range */}
            <div>
              <label htmlFor="pageRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Range
              </label>
              <input
                type="text"
                id="pageRange"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g., 1-3,5,7-9 or 'all'"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Specify which pages to process, or 'all' for the entire document
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || !file || error
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={processOcr}
              disabled={isProcessing || !file || !!error}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing OCR...
                </>
              ) : (
                <>
                  <FiSearch className="mr-2" size={18} />
                  Make PDF Searchable
                </>
              )}
            </button>
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">OCR Processing Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully processed with OCR. The document is now searchable and the text is selectable.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download OCR {outputFormat.toUpperCase()}
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 