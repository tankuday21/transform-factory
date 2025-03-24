'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { FiUploadCloud, FiDownload, FiX, FiCheck } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/card';

const SignPDFPage = () => {
  // State for file handling
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  
  // State for signature options
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [positionX, setPositionX] = useState<number>(50);
  const [positionY, setPositionY] = useState<number>(50);
  const [signatureWidth, setSignatureWidth] = useState<number>(150);
  const [includeDate, setIncludeDate] = useState<boolean>(false);
  
  // Refs for file inputs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  // Handle PDF file change
  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a valid PDF file.');
        setPdfFile(null);
      }
    }
  };
  
  // Handle signature image change
  const handleSignatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        setSignatureFile(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Signature must be a JPG or PNG image.');
        setSignatureFile(null);
      }
    }
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Check if it's PDF
      if (files[0].type === 'application/pdf') {
        setPdfFile(files[0]);
        setErrorMessage('');
      } else if (files[0].type === 'image/jpeg' || files[0].type === 'image/png') {
        setSignatureFile(files[0]);
        setErrorMessage('');
      } else {
        setErrorMessage('Please drop a valid PDF file or a JPG/PNG signature image.');
      }
    }
  };
  
  // Process the PDF with signature
  const handleProcess = async () => {
    if (!pdfFile || !signatureFile) {
      setErrorMessage('Please select both a PDF file and a signature image.');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('signature', signatureFile);
      formData.append('pageNumber', pageNumber.toString());
      formData.append('posX', positionX.toString());
      formData.append('posY', positionY.toString());
      formData.append('width', signatureWidth.toString());
      formData.append('includeDate', includeDate.toString());
      
      const response = await fetch('/api/pdf/sign', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setSignedPdfUrl(url);
      setIsComplete(true);
    } catch (error) {
      console.error('Error signing PDF:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign PDF');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setPdfFile(null);
    setSignatureFile(null);
    setIsComplete(false);
    setErrorMessage('');
    setSignedPdfUrl(null);
    
    // Reset file inputs
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    if (signatureInputRef.current) signatureInputRef.current.value = '';
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Sign PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Add your signature image to a PDF document
      </p>
      
      {!isComplete ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
              
              {/* PDF Upload */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-700'
                } ${pdfFile ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  {pdfFile ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm font-medium">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button 
                        onClick={() => setPdfFile(null)}
                        className="text-red-500 dark:text-red-400 text-xs flex items-center"
                      >
                        <FiX className="mr-1" /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <FiUploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Drop your PDF here or</p>
                      <input
                        type="file"
                        ref={pdfInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handlePdfChange}
                      />
                      <button
                        type="button"
                        className="text-blue-500 dark:text-blue-400 text-sm font-medium"
                        onClick={() => pdfInputRef.current?.click()}
                      >
                        Browse
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Signature Upload */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-700'
                } ${signatureFile ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  {signatureFile ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm font-medium">{signatureFile.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(signatureFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button 
                        onClick={() => setSignatureFile(null)}
                        className="text-red-500 dark:text-red-400 text-xs flex items-center"
                      >
                        <FiX className="mr-1" /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <FiUploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Drop your signature image here or</p>
                      <input
                        type="file"
                        ref={signatureInputRef}
                        className="hidden"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleSignatureChange}
                      />
                      <button
                        type="button"
                        className="text-blue-500 dark:text-blue-400 text-sm font-medium"
                        onClick={() => signatureInputRef.current?.click()}
                      >
                        Browse
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG or PNG format
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {errorMessage && (
                <div className="text-red-500 dark:text-red-400 text-sm mt-2">
                  {errorMessage}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Signature Options</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Page Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position X (from left)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={positionX}
                    onChange={(e) => setPositionX(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {positionX} points
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position Y (from bottom)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="700"
                    value={positionY}
                    onChange={(e) => setPositionY(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {positionY} points
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Signature Width
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    value={signatureWidth}
                    onChange={(e) => setSignatureWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {signatureWidth} points
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeDate"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="includeDate" className="text-sm font-medium">
                    Include Date
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !pdfFile || !signatureFile}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                    isProcessing || !pdfFile || !signatureFile
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Add Signature'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center mb-4">
                <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">PDF Signed Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your signature has been added to the PDF document
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {signedPdfUrl && (
                  <a
                    href={signedPdfUrl}
                    download="signed-document.pdf"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiDownload className="mr-2" />
                    Download Signed PDF
                  </a>
                )}
                
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign Another Document
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignPDFPage; 