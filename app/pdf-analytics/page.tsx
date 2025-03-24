'use client';

import { useState, useRef, useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { FiFileText, FiUpload, FiDownload, FiInfo, FiAlertCircle, FiFile, FiImage, FiClock, FiCalendar, FiType } from 'react-icons/fi';

interface PDFMetadata {
  fileName: string;
  fileSize: number;
  pageCount: number;
  encrypted: boolean;
  version: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  imageCount?: number;
  fontCount?: number;
  hasText?: boolean;
  hasAnnotations?: boolean;
  hasSignatures?: boolean;
  hasAcroForms?: boolean;
  hasAttachments?: boolean;
}

export default function PDFAnalyticsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  
  // Accept only PDF files with max size of 30MB
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 30MB.');
      } else if (errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PDF file.');
      } else {
        setError(errors[0]?.message || 'Error uploading file.');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setError(null);
      
      // Analyze the PDF
      await analyzePDF(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 30 * 1024 * 1024, // 30MB
    maxFiles: 1
  });
  
  // Analyze PDF file to extract metadata
  const analyzePDF = async (file: File) => {
    setIsLoading(true);
    setMetadata(null);
    
    try {
      // Normally we would send the file to an API for analysis
      // For this example, we'll simulate a response with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate random metadata for demonstration
      const pageCount = Math.floor(Math.random() * 50) + 1;
      const imageCount = Math.floor(Math.random() * pageCount * 3);
      const fontCount = Math.floor(Math.random() * 10) + 1;
      
      const mockMetadata: PDFMetadata = {
        fileName: file.name,
        fileSize: file.size,
        pageCount: pageCount,
        encrypted: Math.random() > 0.7,
        version: `1.${Math.floor(Math.random() * 7) + 3}`,
        title: Math.random() > 0.3 ? 'Sample Document' : undefined,
        author: Math.random() > 0.3 ? 'John Doe' : undefined,
        subject: Math.random() > 0.5 ? 'Business Report' : undefined,
        keywords: Math.random() > 0.5 ? 'sample, document, pdf' : undefined,
        creator: 'Adobe InDesign',
        producer: 'Adobe PDF Library 15.0',
        creationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        modificationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        imageCount: imageCount,
        fontCount: fontCount,
        hasText: Math.random() > 0.1,
        hasAnnotations: Math.random() > 0.6,
        hasSignatures: Math.random() > 0.8,
        hasAcroForms: Math.random() > 0.7,
        hasAttachments: Math.random() > 0.8
      };
      
      setMetadata(mockMetadata);
    } catch (err: any) {
      console.error('Error analyzing PDF:', err);
      setError(err.message || 'An error occurred while analyzing the PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Format date to human-readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };
  
  // Generate a report with the metadata
  const generateReport = () => {
    if (!metadata) return;
    
    const report = `
PDF Analytics Report
===================

File Information:
----------------
Filename: ${metadata.fileName}
File Size: ${formatFileSize(metadata.fileSize)}
PDF Version: ${metadata.version}
Encrypted: ${metadata.encrypted ? 'Yes' : 'No'}

Document Properties:
------------------
Title: ${metadata.title || 'Not specified'}
Author: ${metadata.author || 'Not specified'}
Subject: ${metadata.subject || 'Not specified'}
Keywords: ${metadata.keywords || 'Not specified'}
Creator: ${metadata.creator || 'Not specified'}
Producer: ${metadata.producer || 'Not specified'}
Creation Date: ${formatDate(metadata.creationDate)}
Modification Date: ${formatDate(metadata.modificationDate)}

Content Analysis:
---------------
Page Count: ${metadata.pageCount}
Image Count: ${metadata.imageCount}
Font Count: ${metadata.fontCount}
Contains Text: ${metadata.hasText ? 'Yes' : 'No'}
Contains Annotations: ${metadata.hasAnnotations ? 'Yes' : 'No'}
Contains Signatures: ${metadata.hasSignatures ? 'Yes' : 'No'}
Contains AcroForms: ${metadata.hasAcroForms ? 'Yes' : 'No'}
Contains Attachments: ${metadata.hasAttachments ? 'Yes' : 'No'}

Generated: ${new Date().toLocaleString()}
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.fileName.replace('.pdf', '')}_analytics.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF Analytics</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Analyze PDF files to get detailed information about their content and structure
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - File Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiUpload className="mr-2 text-blue-500" size={24} />
              Upload PDF
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
                <p className="text-blue-500">Drop the PDF file here...</p>
              ) : (
                <>
                  <p className="mb-2 font-medium">Drag &amp; drop a PDF file here, or click to select</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Maximum file size: 30MB
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
            
            {file && !error && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium flex items-center text-blue-700 dark:text-blue-300 mb-2">
                  <FiFile className="mr-2" /> 
                  Selected File
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{file.name}</p>
                <p className="text-xs text-blue-500 dark:text-blue-500">{formatFileSize(file.size)}</p>
              </div>
            )}
            
            {/* Information about PDF analytics */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">What information can you get?</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center">
                  <FiInfo className="mr-2 text-gray-400" size={14} />
                  Document properties (title, author, creation date)
                </li>
                <li className="flex items-center">
                  <FiFile className="mr-2 text-gray-400" size={14} />
                  Page count and PDF version
                </li>
                <li className="flex items-center">
                  <FiImage className="mr-2 text-gray-400" size={14} />
                  Embedded images count
                </li>
                <li className="flex items-center">
                  <FiType className="mr-2 text-gray-400" size={14} />
                  Font information
                </li>
                <li className="flex items-center">
                  <FiAlertCircle className="mr-2 text-gray-400" size={14} />
                  Security information
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right column - Analytics Results */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiInfo className="mr-2 text-green-500" size={24} />
              PDF Analytics
            </h2>
            
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Analyzing PDF...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a moment for large files</p>
              </div>
            ) : !metadata ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <FiFileText size={64} className="mx-auto mb-4" />
                <p className="text-lg mb-2">No PDF analyzed yet</p>
                <p className="text-sm">Upload a PDF file to see detailed analytics</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* File Information */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      File Information
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Filename:</span>
                        <span className="text-sm font-medium">{metadata.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">File Size:</span>
                        <span className="text-sm font-medium">{formatFileSize(metadata.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">PDF Version:</span>
                        <span className="text-sm font-medium">{metadata.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Encrypted:</span>
                        <span className={`text-sm font-medium ${metadata.encrypted ? 'text-orange-500' : 'text-green-500'}`}>
                          {metadata.encrypted ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Analysis */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Content Analysis
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Pages:</span>
                        <span className="text-sm font-medium">{metadata.pageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Images:</span>
                        <span className="text-sm font-medium">{metadata.imageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Fonts:</span>
                        <span className="text-sm font-medium">{metadata.fontCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Contains Text:</span>
                        <span className={`text-sm font-medium ${metadata.hasText ? 'text-green-500' : 'text-gray-500'}`}>
                          {metadata.hasText ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Document Properties */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Document Properties
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Title:</span>
                          <span className="text-sm font-medium">{metadata.title || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Author:</span>
                          <span className="text-sm font-medium">{metadata.author || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Subject:</span>
                          <span className="text-sm font-medium">{metadata.subject || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Keywords:</span>
                          <span className="text-sm font-medium">{metadata.keywords || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Creator:</span>
                          <span className="text-sm font-medium">{metadata.creator || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Producer:</span>
                          <span className="text-sm font-medium">{metadata.producer || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Creation Date:</span>
                          <span className="text-sm font-medium">{formatDate(metadata.creationDate)}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Modification Date:</span>
                          <span className="text-sm font-medium">{formatDate(metadata.modificationDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Features */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Advanced Features
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Annotations</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            metadata.hasAnnotations 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {metadata.hasAnnotations ? 'Present' : 'None'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Signatures</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            metadata.hasSignatures 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {metadata.hasSignatures ? 'Present' : 'None'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AcroForms</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            metadata.hasAcroForms 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {metadata.hasAcroForms ? 'Present' : 'None'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Attachments</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            metadata.hasAttachments 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {metadata.hasAttachments ? 'Present' : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      className="py-2 px-4 rounded-lg font-medium flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      onClick={generateReport}
                    >
                      <FiDownload className="mr-2" size={18} />
                      Download Analytics Report
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Information section */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-medium mb-4">About PDF Analytics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          PDF Analytics helps you understand the structure and content of your PDF files. This can be useful for:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiInfo className="mr-2 text-blue-500" />
              Document Management
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Understand your document properties and metadata to better organize and manage your PDF files.
            </p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiAlertCircle className="mr-2 text-orange-500" />
              Security Assessment
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Check if your PDF is encrypted, contains signatures, or has other security features enabled.
            </p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiClock className="mr-2 text-green-500" />
              Content Analysis
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify the amount of content, images, and fonts in your document to estimate processing time for other tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 