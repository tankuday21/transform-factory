'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiGlobe } from 'react-icons/fi';

export default function PdfTranslatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Translation options
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [preserveLayout, setPreserveLayout] = useState<boolean>(true);
  const [qualityLevel, setQualityLevel] = useState<string>('standard');
  const [includeImages, setIncludeImages] = useState<boolean>(true);
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

  // Translate the PDF
  const translatePdf = async () => {
    if (!file) {
      setError('Please select a PDF file to translate');
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
      formData.append('targetLanguage', targetLanguage);
      formData.append('preserveLayout', preserveLayout.toString());
      formData.append('qualityLevel', qualityLevel);
      formData.append('includeImages', includeImages.toString());
      formData.append('pageRange', pageRange);
      
      // Send request to API
      const response = await fetch('/api/pdf/translate', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        
        // Create translated file name
        const fileNameParts = file.name.split('.');
        fileNameParts.pop(); // Remove extension
        const baseName = fileNameParts.join('.');
        downloadLinkRef.current.download = `${baseName}_${targetLanguage}.pdf`;
        
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error translating PDF:', err);
      setError(err.message || 'An error occurred while translating the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setTargetLanguage('es');
    setPreserveLayout(true);
    setQualityLevel('standard');
    setIncludeImages(true);
    setPageRange('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Language name mapping
  const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ru': 'Russian',
      'hi': 'Hindi',
      'ar': 'Arabic',
    };
    
    return languageNames[code] || code;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Translate PDF Documents</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Convert your PDF documents from one language to another while preserving structure and formatting
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiFile className="mr-2 text-indigo-500" size={24} />
            Upload PDF
          </h2>
          
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
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
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
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
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
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
          
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">PDF Translator Features</h3>
            <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 list-disc pl-5">
              <li>Translate text while preserving document structure</li>
              <li>Support for 10+ languages including Spanish, French, German</li>
              <li>Option to maintain original images and formatting</li>
              <li>Choose specific pages to translate</li>
              <li>Quality settings for accuracy vs. speed trade-offs</li>
            </ul>
          </div>
        </div>
        
        {/* Right column - Translation options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FiSettings className="mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Translation Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Target language selection */}
            <div>
              <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Language
              </label>
              <select
                id="targetLanguage"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
                <option value="ru">Russian</option>
                <option value="hi">Hindi</option>
                <option value="ar">Arabic</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select the language you want to translate the PDF into
              </p>
            </div>
            
            {/* Quality selection */}
            <div>
              <label htmlFor="qualityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Translation Quality
              </label>
              <select
                id="qualityLevel"
                value={qualityLevel}
                onChange={(e) => setQualityLevel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Draft (Faster)</option>
                <option value="standard">Standard</option>
                <option value="professional">Professional (Higher Quality)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Higher quality provides more accurate translation but may take longer
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
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Specify which pages to translate, or 'all' for the entire document
              </p>
            </div>
            
            {/* Additional options */}
            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Additional Options
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="preserveLayout"
                    type="checkbox"
                    checked={preserveLayout}
                    onChange={(e) => setPreserveLayout(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="preserveLayout" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Preserve original document layout
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeImages"
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeImages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Include original images in translated document
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || !file || error
                  ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              } text-white`}
              onClick={translatePdf}
              disabled={isProcessing || !file || !!error}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating...
                </>
              ) : (
                <>
                  <FiGlobe className="mr-2" size={18} />
                  Translate to {getLanguageName(targetLanguage)}
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Translation Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully translated to {getLanguageName(targetLanguage)}. You can now download the translated document.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Translated PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 