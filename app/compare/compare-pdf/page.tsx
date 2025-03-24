'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiExternalLink } from 'react-icons/fi';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import { BsArrowLeftRight } from 'react-icons/bs';

export default function ComparePdfPage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isDraggingFile1, setIsDraggingFile1] = useState(false);
  const [isDraggingFile2, setIsDraggingFile2] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comparison options
  const [comparisonMode, setComparisonMode] = useState<string>('visual');
  const [highlightChanges, setHighlightChanges] = useState<boolean>(true);
  
  const file1InputRef = useRef<HTMLInputElement>(null);
  const file2InputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle file input change for File 1
  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file for Document 1');
        return;
      }
      
      // Check file size (max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('Document 1 exceeds the maximum file size limit of 15MB');
        return;
      }
      
      setFile1(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Handle file input change for File 2
  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file for Document 2');
        return;
      }
      
      // Check file size (max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('Document 2 exceeds the maximum file size limit of 15MB');
        return;
      }
      
      setFile2(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Handle drag and drop events for File 1
  const handleDragEnterFile1 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(true);
  };

  const handleDragLeaveFile1 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(false);
  };

  const handleDragOverFile1 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropFile1 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile1(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file for Document 1');
        return;
      }
      
      // Check file size (max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('Document 1 exceeds the maximum file size limit of 15MB');
        return;
      }
      
      setFile1(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Handle drag and drop events for File 2
  const handleDragEnterFile2 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(true);
  };

  const handleDragLeaveFile2 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(false);
  };

  const handleDragOverFile2 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropFile2 = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile2(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file for Document 2');
        return;
      }
      
      // Check file size (max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('Document 2 exceeds the maximum file size limit of 15MB');
        return;
      }
      
      setFile2(selectedFile);
      setError(null);
      setIsComplete(false);
    }
  };

  // Compare the PDFs
  const comparePdfs = async () => {
    if (!file1 || !file2) {
      setError('Please select two PDF files to compare');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);
      formData.append('comparisonMode', comparisonMode);
      formData.append('highlightChanges', highlightChanges.toString());
      
      // Send request to API
      const response = await fetch('/api/pdf/compare', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare PDFs');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = 'pdf_comparison_report.pdf';
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error comparing PDFs:', err);
      setError(err.message || 'An error occurred while comparing the PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile1(null);
    setFile2(null);
    setIsComplete(false);
    setError(null);
    setComparisonMode('visual');
    setHighlightChanges(true);
    if (file1InputRef.current) {
      file1InputRef.current.value = '';
    }
    if (file2InputRef.current) {
      file2InputRef.current.value = '';
    }
  };
  
  // Swap the files
  const swapFiles = () => {
    if (file1 && file2) {
      const temp = file1;
      setFile1(file2);
      setFile2(temp);
      setIsComplete(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Compare PDF Documents</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Compare two PDF documents to identify differences in content, format, and structure
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Files */}
        <div className="space-y-6">
          {/* File 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm mr-2">1</span>
              Upload Document 1
            </h2>
            
            {!file1 ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDraggingFile1
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                }`}
                onDragEnter={handleDragEnterFile1}
                onDragLeave={handleDragLeaveFile1}
                onDragOver={handleDragOverFile1}
                onDrop={handleDropFile1}
              >
                <input
                  type="file"
                  ref={file1InputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFile1Change}
                />
                
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your first PDF file here, or{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      onClick={() => file1InputRef.current?.click()}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-600">
                    Accepted format: PDF • Maximum file size: 15MB
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
                    <p className="font-medium text-gray-900 dark:text-white truncate">{file1.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(file1.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => {
                    setFile1(null);
                    setIsComplete(false);
                    if (file1InputRef.current) {
                      file1InputRef.current.value = '';
                    }
                  }}
                  aria-label="Remove file"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            )}
          </div>
          
          {/* Swap button between files */}
          <div className="flex justify-center">
            <button
              type="button"
              className={`p-3 rounded-full ${
                file1 && file2
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
              onClick={swapFiles}
              disabled={!file1 || !file2}
              aria-label="Swap files"
            >
              <BsArrowLeftRight size={20} />
            </button>
          </div>
          
          {/* File 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm mr-2">2</span>
              Upload Document 2
            </h2>
            
            {!file2 ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDraggingFile2
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                }`}
                onDragEnter={handleDragEnterFile2}
                onDragLeave={handleDragLeaveFile2}
                onDragOver={handleDragOverFile2}
                onDrop={handleDropFile2}
              >
                <input
                  type="file"
                  ref={file2InputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFile2Change}
                />
                
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your second PDF file here, or{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      onClick={() => file2InputRef.current?.click()}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-600">
                    Accepted format: PDF • Maximum file size: 15MB
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
                    <p className="font-medium text-gray-900 dark:text-white truncate">{file2.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(file2.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => {
                    setFile2(null);
                    setIsComplete(false);
                    if (file2InputRef.current) {
                      file2InputRef.current.value = '';
                    }
                  }}
                  aria-label="Remove file"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Comparison options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FiSettings className="mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Comparison Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Comparison Mode */}
            <div>
              <label htmlFor="comparisonMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comparison Mode
              </label>
              <select
                id="comparisonMode"
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="visual">Visual (Side by Side)</option>
                <option value="text">Text Content Only</option>
                <option value="detailed">Detailed (Structure & Content)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select how you want to compare the documents
              </p>
            </div>
            
            {/* Highlight Changes */}
            <div className="flex items-center">
              <input
                id="highlightChanges"
                type="checkbox"
                checked={highlightChanges}
                onChange={(e) => setHighlightChanges(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="highlightChanges" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Highlight changes in report
              </label>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Comparison Features</h3>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
                <li>Identifies text differences between documents</li>
                <li>Detects added or removed pages</li>
                <li>Compares document structure</li>
                <li>Shows side-by-side visual comparison</li>
                <li>Generates detailed PDF comparison report</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">Important Note</h3>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                For best results, compare documents with similar content. Very large documents may take longer to process.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || !file1 || !file2 || error
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={comparePdfs}
              disabled={isProcessing || !file1 || !file2 || !!error}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Comparing PDFs...
                </>
              ) : (
                <>
                  <HiOutlineDocumentDuplicate className="mr-2" size={18} />
                  Compare Documents
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Comparison Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF comparison report is ready. The report contains a detailed analysis of the differences between the two documents.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Comparison Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 