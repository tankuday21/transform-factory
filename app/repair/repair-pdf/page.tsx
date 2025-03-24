'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiDownload, FiSettings, FiTrash2, FiCheck, FiActivity } from 'react-icons/fi';
import { TbFileAlert } from 'react-icons/tb';

export default function RepairPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Repair options
  const [repairLevel, setRepairLevel] = useState<string>('standard');
  const [recoverImages, setRecoverImages] = useState<boolean>(true);
  const [recoverFonts, setRecoverFonts] = useState<boolean>(true);
  
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

  // Repair the PDF
  const repairPdf = async () => {
    if (!file) {
      setError('Please select a PDF file to repair');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('repairLevel', repairLevel);
      formData.append('recoverImages', recoverImages.toString());
      formData.append('recoverFonts', recoverFonts.toString());
      
      // Send request to API
      const response = await fetch('/api/pdf/repair', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to repair PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        
        // Create repaired file name
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts.pop();
        const baseName = fileNameParts.join('.');
        downloadLinkRef.current.download = `${baseName}_repaired.pdf`;
        
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error repairing PDF:', err);
      setError(err.message || 'An error occurred while repairing the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setRepairLevel('standard');
    setRecoverImages(true);
    setRecoverFonts(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Repair PDF Document</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Fix corrupted or damaged PDF files and recover content where possible
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TbFileAlert className="mr-2 text-amber-500" size={24} />
            Upload Corrupted PDF
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
                  Drag and drop your corrupted PDF file here, or{' '}
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
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
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
          
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">Important Note</h3>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              PDF repair attempts to recover as much content as possible, but cannot guarantee complete recovery
              for severely damaged files. For critical documents, professional data recovery services may be needed.
            </p>
          </div>
        </div>
        
        {/* Right column - Repair options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-6">
            <FiSettings className="mr-2 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Repair Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Repair Level */}
            <div>
              <label htmlFor="repairLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repair Level
              </label>
              <select
                id="repairLevel"
                value={repairLevel}
                onChange={(e) => setRepairLevel(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="basic">Basic (Fast, light repair)</option>
                <option value="standard">Standard (Balanced approach)</option>
                <option value="thorough">Thorough (Deep analysis, slower)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select how thoroughly the PDF should be analyzed and repaired
              </p>
            </div>
            
            {/* Recovery Options */}
            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Recovery Options
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="recoverImages"
                    type="checkbox"
                    checked={recoverImages}
                    onChange={(e) => setRecoverImages(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recoverImages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Attempt to recover images
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="recoverFonts"
                    type="checkbox"
                    checked={recoverFonts}
                    onChange={(e) => setRecoverFonts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recoverFonts" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Attempt to recover fonts and formatting
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Repair Features</h3>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
                <li>Fixes corrupted PDF structure</li>
                <li>Recovers damaged text content</li>
                <li>Attempts to restore broken links</li>
                <li>Rebuilds document hierarchy</li>
                <li>Creates detailed repair report</li>
              </ul>
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
              onClick={repairPdf}
              disabled={isProcessing || !file || !!error}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Repairing PDF...
                </>
              ) : (
                <>
                  <FiActivity className="mr-2" size={18} />
                  Repair PDF
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Repair Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been repaired and is ready to download. If some content could not be recovered,
            you'll find details and recommendations in the repaired file.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Repaired PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 