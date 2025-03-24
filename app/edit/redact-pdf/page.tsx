'use client'

import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiFile, FiDownload, FiTrash2, FiCheck, FiPlus } from 'react-icons/fi';

// Define redaction area interface
interface RedactionArea {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactionAreas, setRedactionAreas] = useState<RedactionArea[]>([]);
  const [currentArea, setCurrentArea] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [redactionColor, setRedactionColor] = useState<string>('black');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
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
      
      setFile(selectedFile);
      setError(null);
      
      // In a real implementation, we would analyze the PDF to get the actual page count
      // For this example, we'll set a random number between 1 and 5
      const mockPageCount = Math.floor(Math.random() * 5) + 1;
      setNumPages(mockPageCount);
      setCurrentPage(1);
      
      // Reset redaction areas
      setRedactionAreas([]);
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
      
      setFile(selectedFile);
      setError(null);
      
      // In a real implementation, we would analyze the PDF to get the actual page count
      // For this example, we'll set a random number between 1 and 5
      const mockPageCount = Math.floor(Math.random() * 5) + 1;
      setNumPages(mockPageCount);
      setCurrentPage(1);
      
      // Reset redaction areas
      setRedactionAreas([]);
      setIsComplete(false);
    }
  };

  // Mouse handlers for drawing redaction areas
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    
    // Get canvas position relative to viewport
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentArea({
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
    
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentArea || !canvasRef.current) return;
    
    // Get canvas position relative to viewport
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentArea({
      ...currentArea,
      endX: x,
      endY: y
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentArea) return;
    
    // Calculate the width and height (absolute values to handle drawing from any direction)
    const width = Math.abs(currentArea.endX - currentArea.startX);
    const height = Math.abs(currentArea.endY - currentArea.startY);
    
    // Ensure we get the top-left position regardless of drawing direction
    const x = Math.min(currentArea.startX, currentArea.endX);
    const y = Math.min(currentArea.startY, currentArea.endY);
    
    // Only add if the area is big enough (avoid accidental clicks)
    if (width > 5 && height > 5) {
      const newArea: RedactionArea = {
        id: `area_${Date.now()}`,
        page: currentPage,
        x,
        y,
        width,
        height
      };
      
      setRedactionAreas([...redactionAreas, newArea]);
    }
    
    // Reset current area and drawing state
    setCurrentArea(null);
    setIsDrawing(false);
  };

  // Remove a redaction area
  const removeRedactionArea = (id: string) => {
    setRedactionAreas(redactionAreas.filter(area => area.id !== id));
  };

  // Process the PDF
  const processPDF = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    
    if (redactionAreas.length === 0) {
      setError('Please define at least one redaction area.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('redactionAreas', JSON.stringify(redactionAreas));
      formData.append('redactionColor', redactionColor);
      
      // Send request to API
      const response = await fetch('/api/pdf/redact', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to redact PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = file.name.replace('.pdf', '_redacted.pdf');
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error redacting PDF:', err);
      setError(err.message || 'An error occurred while redacting PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setIsComplete(false);
    setError(null);
    setRedactionAreas([]);
    setRedactionColor('black');
    setCurrentPage(1);
    setNumPages(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Redact PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Block out sensitive information from your PDF documents
      </p>
      
      {!file ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select PDF File</h2>
          
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
                Maximum file size: 20MB
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : !isComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - PDF preview and redaction */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">PDF Preview - Page {currentPage} of {numPages}</h2>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                  disabled={currentPage === numPages}
                  onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                >
                  Next
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 dark:bg-gray-900">
              <div 
                className="relative bg-white dark:bg-gray-800 shadow-md mx-auto w-[595px] h-[842px] cursor-crosshair"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* PDF page placeholder - in a real implementation, this would be a PDF.js canvas */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <p>PDF Page {currentPage} (Click and drag to add redaction areas)</p>
                </div>
                
                {/* Current area being drawn */}
                {isDrawing && currentArea && (
                  <div
                    className={`absolute border-2 border-red-500 bg-${redactionColor} bg-opacity-20`}
                    style={{
                      left: `${Math.min(currentArea.startX, currentArea.endX)}px`,
                      top: `${Math.min(currentArea.startY, currentArea.endY)}px`,
                      width: `${Math.abs(currentArea.endX - currentArea.startX)}px`,
                      height: `${Math.abs(currentArea.endY - currentArea.startY)}px`,
                    }}
                  ></div>
                )}
                
                {/* Existing redaction areas for current page */}
                {redactionAreas
                  .filter(area => area.page === currentPage)
                  .map(area => (
                    <div
                      key={area.id}
                      className={`absolute border-2 border-${redactionColor === 'black' ? 'gray-600' : redactionColor}-500 bg-${redactionColor} bg-opacity-70`}
                      style={{
                        left: `${area.x}px`,
                        top: `${area.y}px`,
                        width: `${area.width}px`,
                        height: `${area.height}px`,
                      }}
                    >
                      <button
                        type="button"
                        className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={() => removeRedactionArea(area.id)}
                        aria-label="Remove redaction area"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          
          {/* Right column - Redaction options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4">
              <h2 className="font-semibold">File Information</h2>
              
              <div className="mt-2 flex items-center">
                <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  <FiFile size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {numPages} page{numPages !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h2 className="font-semibold mb-3">Redaction Options</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Redaction Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['black', 'red', 'blue', 'green', 'gray'].map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-full aspect-square rounded-lg ${
                        redactionColor === color 
                          ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' 
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setRedactionColor(color)}
                      aria-label={`${color} redaction color`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">Redaction Areas</h3>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {redactionAreas.length} area{redactionAreas.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {redactionAreas.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    <p>No redaction areas defined yet.</p>
                    <p>Click and drag on the PDF to add areas.</p>
                  </div>
                ) : (
                  redactionAreas.map(area => (
                    <div 
                      key={area.id} 
                      className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-center"
                    >
                      <div className="text-sm">
                        <span className="font-medium">Page {area.page}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                          {Math.round(area.width)} × {Math.round(area.height)} px
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => removeRedactionArea(area.id)}
                        aria-label="Remove redaction area"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center ${
                    isProcessing || redactionAreas.length === 0
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  }`}
                  onClick={processPDF}
                  disabled={isProcessing || redactionAreas.length === 0}
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
                    'Apply Redactions'
                  )}
                </button>
                
                <button
                  type="button"
                  className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fadeIn">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">PDF Redacted Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your PDF has been redacted with {redactionAreas.length} area{redactionAreas.length !== 1 ? 's' : ''}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                ref={downloadLinkRef}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiDownload className="mr-2" />
                Download Redacted PDF
              </a>
              
              <button
                onClick={resetForm}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Redact Another Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 