'use client'

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiBarChart2, FiFileText, FiImage, FiClock, FiCalendar, FiTrash2, FiCheck, FiInfo } from 'react-icons/fi';

interface PDFAnalytics {
  pageCount: number;
  fileSize: string;
  wordCount: number;
  imageCount: number;
  fontCount: number;
  createdDate: string;
  modifiedDate: string;
  author: string;
  title: string;
  subject: string;
  keywords: string[];
  isEncrypted: boolean;
  hasSignature: boolean;
  isSearchable: boolean;
  hasBookmarks: boolean;
  processingTime: string;
}

export default function PdfAnalyticsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PDFAnalytics | null>(null);
  
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
      
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 50MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setIsComplete(false);
      setAnalytics(null);
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
      
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 50MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setIsComplete(false);
      setAnalytics(null);
    }
  };

  // Analyze PDF
  const analyzePdf = async () => {
    if (!file) {
      setError('Please select a PDF file to analyze');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Send request to API
      const response = await fetch('/api/pdf/analytics', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze PDF');
      }
      
      // Get the analytics data from the response
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
      setIsComplete(true);
      
    } catch (err: any) {
      console.error('Error analyzing PDF:', err);
      setError(err.message || 'An error occurred while analyzing the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format the analytics data into a report
  const generateReport = () => {
    if (!analytics || !file) return;
    
    const report = `
PDF ANALYTICS REPORT
===================
File Name: ${file.name}
Generated: ${new Date().toLocaleString()}

BASIC INFORMATION
----------------
Title: ${analytics.title || 'Not specified'}
Author: ${analytics.author || 'Not specified'}
Subject: ${analytics.subject || 'Not specified'}
Keywords: ${analytics.keywords?.join(', ') || 'None'}
Created: ${analytics.createdDate || 'Unknown'}
Modified: ${analytics.modifiedDate || 'Unknown'}

DOCUMENT STATISTICS
-----------------
Page Count: ${analytics.pageCount}
File Size: ${analytics.fileSize}
Word Count: ${analytics.wordCount}
Image Count: ${analytics.imageCount}
Font Count: ${analytics.fontCount}

DOCUMENT PROPERTIES
-----------------
Encrypted: ${analytics.isEncrypted ? 'Yes' : 'No'}
Digitally Signed: ${analytics.hasSignature ? 'Yes' : 'No'}
Searchable Text: ${analytics.isSearchable ? 'Yes' : 'No'}
Has Bookmarks: ${analytics.hasBookmarks ? 'Yes' : 'No'}

Analysis completed in ${analytics.processingTime}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = `${file.name.replace('.pdf', '')}_analytics.txt`;
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setAnalytics(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF Analytics</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Analyze your PDF to get detailed information about its content and structure
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
                  Accepted format: PDF • Maximum file size: 50MB
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
          
          <div className="mt-6">
            <button
              type="button"
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing || !file
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={analyzePdf}
              disabled={isProcessing || !file}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <FiBarChart2 className="mr-2" size={18} />
                  Analyze PDF
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">About PDF Analytics</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              This tool analyzes your PDF files and provides detailed information about their content, 
              structure, and metadata. Use it to gain insights about page count, word count, 
              image count, and other important properties of your documents.
            </p>
          </div>
        </div>
        
        {/* Right column - Analytics Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-purple-500" size={24} />
            PDF Analytics Results
          </h2>
          
          {!isComplete ? (
            <div className="flex items-center justify-center h-80 text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <FiInfo size={48} className="mx-auto mb-4" />
                <p>Upload and analyze a PDF to see detailed analytics</p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Document Info */}
              <div>
                <h3 className="text-lg font-medium mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Document Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</p>
                    <p className="font-medium">{analytics.title || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Author</p>
                    <p className="font-medium">{analytics.author || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                    <p className="font-medium">{analytics.createdDate || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modified</p>
                    <p className="font-medium">{analytics.modifiedDate || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              {/* Document Statistics */}
              <div>
                <h3 className="text-lg font-medium mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Document Statistics</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pages</p>
                      <p className="text-lg font-bold">{analytics.pageCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                      <FiFile size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Size</p>
                      <p className="text-lg font-bold">{analytics.fileSize}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mr-3">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                      <p className="text-lg font-bold">{analytics.wordCount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                      <FiImage size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
                      <p className="text-lg font-bold">{analytics.imageCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 mr-3">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fonts</p>
                      <p className="text-lg font-bold">{analytics.fontCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-3">
                      <FiClock size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</p>
                      <p className="text-lg font-bold">{analytics.processingTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Document Properties */}
              <div>
                <h3 className="text-lg font-medium mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">Document Properties</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${analytics.isEncrypted ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <p>Encrypted: {analytics.isEncrypted ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${analytics.hasSignature ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Digitally Signed: {analytics.hasSignature ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${analytics.isSearchable ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <p>Searchable Text: {analytics.isSearchable ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${analytics.hasBookmarks ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <p>Has Bookmarks: {analytics.hasBookmarks ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <a
                  ref={downloadLinkRef}
                  onClick={generateReport}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium flex items-center cursor-pointer"
                >
                  <FiDownload className="mr-2" />
                  Download Analytics Report
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-red-400">
              <p>Analytics failed to load. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 