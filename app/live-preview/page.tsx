'use client';

import { useState, useRef, useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { 
  FiFileText, FiUpload, FiEye, FiSettings, FiRotateCw, FiPlus, FiMinus, 
  FiChevronLeft, FiChevronRight, FiDownload, FiType, FiImage, FiCrop, 
  FiAlertCircle, FiCheck, FiGlobe, FiX
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TextOperation {
  type: 'watermark' | 'text';
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

interface ImageOperation {
  type: 'image';
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

type Operation = TextOperation | ImageOperation;

export default function LivePreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<Operation[]>([
    {
      type: 'watermark',
      text: 'DRAFT',
      x: 50,
      y: 50,
      size: 72,
      color: '#FF000033',
      opacity: 0.3,
      rotation: -45
    }
  ]);
  const [activeOperation, setActiveOperation] = useState<number | null>(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  
  // Accept only PDF files with max size of 30MB
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 30MB.');
      } else if (errors[0]?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PDF file.');
      } else {
        toast.error(errors[0]?.message || 'Error uploading file.');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setCurrentPage(1);
      setError(null);
      toast.success('File uploaded successfully');
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
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  // Navigation functions
  const goToPrevPage = () => setCurrentPage(page => (page > 1 ? page - 1 : page));
  const goToNextPage = () => setCurrentPage(page => (page < numPages ? page + 1 : page));
  
  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);
  
  // Add new operation
  const addOperation = (type: 'watermark' | 'text' | 'image') => {
    let newOperation: Operation;
    
    switch (type) {
      case 'watermark':
        newOperation = {
          type: 'watermark',
          text: 'CONFIDENTIAL',
          x: 50,
          y: 50,
          size: 72,
          color: '#FF000033',
          opacity: 0.3,
          rotation: -45
        };
        break;
      case 'text':
        newOperation = {
          type: 'text',
          text: 'Sample Text',
          x: 100,
          y: 100,
          size: 16,
          color: '#000000',
          opacity: 1,
          rotation: 0
        };
        break;
      case 'image':
        newOperation = {
          type: 'image',
          imageUrl: 'https://via.placeholder.com/100',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          opacity: 1,
          rotation: 0
        };
        break;
    }
    
    setOperations(prev => [...prev, newOperation]);
    setActiveOperation(operations.length);
  };
  
  // Update operation property
  const updateOperation = (index: number, property: string, value: any) => {
    setOperations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [property]: value };
      return updated;
    });
  };
  
  // Delete operation
  const deleteOperation = (index: number) => {
    setOperations(prev => prev.filter((_, i) => i !== index));
    setActiveOperation(null);
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Apply changes and download the edited PDF
  const downloadEditedPDF = () => {
    // In a real implementation, this would send the file and operations to an API
    // that would apply the changes and return an edited PDF
    setIsLoading(true);
    
    // Simulate API processing delay
    setTimeout(() => {
      alert('In a real implementation, this would download the edited PDF with all applied changes.');
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-2">Live PDF Preview</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Edit PDFs and preview changes in real-time
      </p>
      
      {!file ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-2xl mx-auto">
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
          
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">What can you do with Live Preview?</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-center">
                <FiType className="mr-2 text-gray-400" size={14} />
                Add text and watermarks to your PDF
              </li>
              <li className="flex items-center">
                <FiImage className="mr-2 text-gray-400" size={14} />
                Insert images and logos
              </li>
              <li className="flex items-center">
                <FiCrop className="mr-2 text-gray-400" size={14} />
                Precisely position elements
              </li>
              <li className="flex items-center">
                <FiEye className="mr-2 text-gray-400" size={14} />
                See changes in real-time before saving
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PDF Preview section */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <div className="flex justify-between mb-4">
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-2"
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                >
                  <FiChevronLeft size={20} />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg ml-2"
                  onClick={goToNextPage}
                  disabled={currentPage >= numPages}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                >
                  <FiMinus size={20} />
                </button>
                <span className="text-sm">{Math.round(scale * 100)}%</span>
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
                  onClick={zoomIn}
                  disabled={scale >= 3}
                >
                  <FiPlus size={20} />
                </button>
                <button
                  type="button"
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg ml-2"
                  onClick={resetZoom}
                >
                  <FiGlobe size={20} />
                </button>
              </div>
            </div>
            
            <div 
              className="overflow-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex justify-center p-4"
              style={{ height: '75vh' }}
              ref={canvasRef}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>}
                >
                  <div className="relative">
                    <Page
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                    />
                    
                    {/* Render all operations */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {operations.map((op, index) => {
                        if (op.type === 'watermark' || op.type === 'text') {
                          return (
                            <div 
                              key={index}
                              className={`absolute cursor-move ${activeOperation === index ? 'ring-2 ring-blue-500' : ''}`}
                              style={{
                                left: `${op.x}px`,
                                top: `${op.y}px`,
                                transform: `rotate(${op.rotation}deg)`,
                                opacity: op.opacity,
                                pointerEvents: 'auto'
                              }}
                              onClick={() => setActiveOperation(index)}
                            >
                              <div 
                                style={{
                                  fontSize: `${op.size}px`,
                                  color: op.color,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {op.text}
                              </div>
                            </div>
                          );
                        } else if (op.type === 'image') {
                          return (
                            <div 
                              key={index}
                              className={`absolute cursor-move ${activeOperation === index ? 'ring-2 ring-blue-500' : ''}`}
                              style={{
                                left: `${op.x}px`,
                                top: `${op.y}px`,
                                width: `${op.width}px`,
                                height: `${op.height}px`,
                                transform: `rotate(${op.rotation}deg)`,
                                opacity: op.opacity,
                                pointerEvents: 'auto'
                              }}
                              onClick={() => setActiveOperation(index)}
                            >
                              <img 
                                src={op.imageUrl} 
                                alt="Added Element" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </Document>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
                onClick={() => {
                  setFile(null);
                  setOperations([]);
                  setActiveOperation(null);
                }}
              >
                Change PDF
              </button>
              
              <button
                type="button"
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isLoading
                    ? 'bg-blue-400 dark:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                }`}
                onClick={downloadEditedPDF}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FiRotateCw className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiDownload className="mr-2" />
                    Download Edited PDF
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Editor controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiFileText className="mr-2 text-blue-500" />
                PDF Details
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="font-medium">{formatFileSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                  <span className="font-medium">{numPages}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiSettings className="mr-2 text-purple-500" />
                Add Elements
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded flex items-center"
                  onClick={() => addOperation('watermark')}
                >
                  <FiType className="mr-1" size={14} />
                  Add Watermark
                </button>
                
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded flex items-center"
                  onClick={() => addOperation('text')}
                >
                  <FiType className="mr-1" size={14} />
                  Add Text
                </button>
                
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded flex items-center"
                  onClick={() => addOperation('image')}
                >
                  <FiImage className="mr-1" size={14} />
                  Add Image
                </button>
              </div>
              
              {operations.length > 0 && (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Elements ({operations.length})</h3>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {operations.map((op, index) => (
                          <li 
                            key={index}
                            className={`py-2 px-2 cursor-pointer rounded ${
                              activeOperation === index 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setActiveOperation(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {op.type === 'watermark' && <FiType className="text-red-500 mr-2" size={16} />}
                                {op.type === 'text' && <FiType className="text-green-500 mr-2" size={16} />}
                                {op.type === 'image' && <FiImage className="text-purple-500 mr-2" size={16} />}
                                <span className="text-sm truncate max-w-[180px]">
                                  {op.type === 'watermark' || op.type === 'text' 
                                    ? op.text 
                                    : 'Image'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOperation(index);
                                }}
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {activeOperation !== null && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Element Properties
                      </h3>
                      
                      {(operations[activeOperation].type === 'watermark' || operations[activeOperation].type === 'text') && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Text
                            </label>
                            <input
                              type="text"
                              value={(operations[activeOperation] as TextOperation).text}
                              onChange={(e) => updateOperation(activeOperation, 'text', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                X Position
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as TextOperation).x}
                                onChange={(e) => updateOperation(activeOperation, 'x', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Y Position
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as TextOperation).y}
                                onChange={(e) => updateOperation(activeOperation, 'y', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Font Size
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as TextOperation).size}
                                onChange={(e) => updateOperation(activeOperation, 'size', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Color
                              </label>
                              <input
                                type="color"
                                value={(operations[activeOperation] as TextOperation).color.substring(0, 7)}
                                onChange={(e) => updateOperation(activeOperation, 'color', e.target.value)}
                                className="w-full px-1 py-1 h-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Opacity: {(operations[activeOperation] as TextOperation).opacity.toFixed(1)}
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={(operations[activeOperation] as TextOperation).opacity}
                                onChange={(e) => updateOperation(activeOperation, 'opacity', parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Rotation: {(operations[activeOperation] as TextOperation).rotation}°
                              </label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="5"
                                value={(operations[activeOperation] as TextOperation).rotation}
                                onChange={(e) => updateOperation(activeOperation, 'rotation', parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {operations[activeOperation].type === 'image' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Image URL
                            </label>
                            <input
                              type="text"
                              value={(operations[activeOperation] as ImageOperation).imageUrl}
                              onChange={(e) => updateOperation(activeOperation, 'imageUrl', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                X Position
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as ImageOperation).x}
                                onChange={(e) => updateOperation(activeOperation, 'x', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Y Position
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as ImageOperation).y}
                                onChange={(e) => updateOperation(activeOperation, 'y', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Width
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as ImageOperation).width}
                                onChange={(e) => updateOperation(activeOperation, 'width', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Height
                              </label>
                              <input
                                type="number"
                                value={(operations[activeOperation] as ImageOperation).height}
                                onChange={(e) => updateOperation(activeOperation, 'height', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Opacity: {(operations[activeOperation] as ImageOperation).opacity.toFixed(1)}
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={(operations[activeOperation] as ImageOperation).opacity}
                                onChange={(e) => updateOperation(activeOperation, 'opacity', parseFloat(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                Rotation: {(operations[activeOperation] as ImageOperation).rotation}°
                              </label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="5"
                                value={(operations[activeOperation] as ImageOperation).rotation}
                                onChange={(e) => updateOperation(activeOperation, 'rotation', parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-medium mb-3">Live Preview Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                  <span>Click on an element in the PDF preview to select it</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                  <span>Adjust properties in real-time to see immediate changes</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                  <span>Use zoom controls to get a better view of fine details</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-0.5" size={16} />
                  <span>Click the download button when you're satisfied with your edits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden" download></a>
    </div>
  );
} 