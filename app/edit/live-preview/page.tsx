'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiFile, FiDownload, FiEdit, FiSliders, FiTrash2, FiCheck, FiImage, FiType, FiAlignCenter, FiSave } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import the PDF viewer with no SSR
const PDFViewer = dynamic(() => import('@/app/components/PDFViewer'), { ssr: false });

interface Watermark {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  rotation: number;
}

interface TextEdit {
  pageIndex: number;
  text: string;
  fontSize: number;
  x: number;
  y: number;
  color: string;
}

type EditMode = 'watermark' | 'text' | 'none';

export default function LivePreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Edit options
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [watermark, setWatermark] = useState<Watermark>({
    text: 'CONFIDENTIAL',
    fontSize: 30,
    opacity: 0.3,
    color: '#FF0000',
    position: 'center',
    rotation: 45
  });
  const [textEdits, setTextEdits] = useState<TextEdit[]>([]);
  const [currentEdit, setCurrentEdit] = useState<TextEdit | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Close all editing operations and reset to view mode
  const closeEditMode = () => {
    setEditMode('none');
    setCurrentEdit(null);
  };

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
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError(null);
      setIsComplete(false);
      setTextEdits([]);
      closeEditMode();
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
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError(null);
      setIsComplete(false);
      setTextEdits([]);
      closeEditMode();
    }
  };

  // Handle watermark change
  const handleWatermarkChange = (property: keyof Watermark, value: any) => {
    setWatermark(prev => ({
      ...prev,
      [property]: value
    }));
    
    // Generate preview with watermark
    generatePreview();
  };

  // Handle text edit
  const handleTextEditChange = (property: keyof TextEdit, value: any) => {
    if (!currentEdit) return;
    
    const updatedEdit = {
      ...currentEdit,
      [property]: value
    };
    
    setCurrentEdit(updatedEdit);
    
    // Update text edits array
    setTextEdits(prev => {
      const index = prev.findIndex(edit => 
        edit.pageIndex === currentEdit.pageIndex && 
        edit.x === currentEdit.x && 
        edit.y === currentEdit.y
      );
      
      if (index !== -1) {
        const newEdits = [...prev];
        newEdits[index] = updatedEdit;
        return newEdits;
      } else {
        return [...prev, updatedEdit];
      }
    });
    
    // Generate preview with text edit
    generatePreview();
  };

  // Add a new text edit
  const addTextEdit = (pageIndex: number, x: number, y: number) => {
    if (editMode !== 'text') return;
    
    const newEdit: TextEdit = {
      pageIndex,
      text: 'New Text',
      fontSize: 12,
      x,
      y,
      color: '#000000'
    };
    
    setCurrentEdit(newEdit);
    setTextEdits(prev => [...prev, newEdit]);
    
    // Focus the text input
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
    
    // Generate preview with text edit
    generatePreview();
  };

  // Handle canvas click for adding text
  const handleCanvasClick = (pageIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (editMode !== 'text') return;
    
    // Get click coordinates relative to the canvas
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    addTextEdit(pageIndex, x, y);
  };

  // Generate a preview based on the current edits
  const generatePreview = async () => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add watermark settings if in watermark mode
      if (editMode === 'watermark') {
        Object.entries(watermark).forEach(([key, value]) => {
          formData.append(`watermark_${key}`, value.toString());
        });
      }
      
      // Add text edits if any
      if (textEdits.length > 0) {
        formData.append('textEdits', JSON.stringify(textEdits));
      }
      
      // Send request to API
      const response = await fetch('/api/pdf/live-preview', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for the preview
      const url = URL.createObjectURL(blob);
      
      // Update preview URL
      setPreviewUrl(url);
    } catch (err: any) {
      console.error('Error generating preview:', err);
      setError(err.message || 'An error occurred while generating the preview. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save the edited PDF
  const saveEditedPdf = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add watermark settings if applicable
      if (editMode === 'watermark') {
        Object.entries(watermark).forEach(([key, value]) => {
          formData.append(`watermark_${key}`, value.toString());
        });
      }
      
      // Add text edits if any
      if (textEdits.length > 0) {
        formData.append('textEdits', JSON.stringify(textEdits));
      }
      
      // Send request to API
      const response = await fetch('/api/pdf/save-edits', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save edited PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create object URL for download
      const url = URL.createObjectURL(blob);
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = `edited_${file.name}`;
        
        setIsComplete(true);
      }
    } catch (err: any) {
      console.error('Error saving edited PDF:', err);
      setError(err.message || 'An error occurred while saving the edited PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsComplete(false);
    setError(null);
    setTextEdits([]);
    closeEditMode();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle document loaded event from the PDF viewer
  const handleDocumentLoaded = (numPages: number) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF Live Preview Editor</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Edit your PDF with real-time preview of changes
      </p>
      
      {!file ? (
        // File upload section
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
                Maximum file size: 30MB
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        // Editor section
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Edit tools */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiEdit className="mr-2 text-blue-500" />
              Edit Tools
            </h2>
            
            <div className="space-y-4">
              {/* Watermark option */}
              <div>
                <button
                  type="button"
                  className={`flex items-center w-full text-left px-3 py-2 rounded-md ${
                    editMode === 'watermark'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setEditMode(editMode === 'watermark' ? 'none' : 'watermark')}
                >
                  <FiImage className="mr-2" />
                  <span>Add Watermark</span>
                </button>
                
                {editMode === 'watermark' && (
                  <div className="mt-3 ml-6 space-y-3">
                    <div>
                      <label htmlFor="watermarkText" className="block text-xs font-medium mb-1">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        id="watermarkText"
                        value={watermark.text}
                        onChange={(e) => handleWatermarkChange('text', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="watermarkFontSize" className="block text-xs font-medium mb-1">
                        Font Size: {watermark.fontSize}px
                      </label>
                      <input
                        type="range"
                        id="watermarkFontSize"
                        min="10"
                        max="100"
                        value={watermark.fontSize}
                        onChange={(e) => handleWatermarkChange('fontSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="watermarkOpacity" className="block text-xs font-medium mb-1">
                        Opacity: {watermark.opacity * 100}%
                      </label>
                      <input
                        type="range"
                        id="watermarkOpacity"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={watermark.opacity}
                        onChange={(e) => handleWatermarkChange('opacity', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="watermarkColor" className="block text-xs font-medium mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        id="watermarkColor"
                        value={watermark.color}
                        onChange={(e) => handleWatermarkChange('color', e.target.value)}
                        className="w-full h-8 p-0 border border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="watermarkPosition" className="block text-xs font-medium mb-1">
                        Position
                      </label>
                      <select
                        id="watermarkPosition"
                        value={watermark.position}
                        onChange={(e) => handleWatermarkChange('position', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="center-left">Center Left</option>
                        <option value="center">Center</option>
                        <option value="center-right">Center Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="watermarkRotation" className="block text-xs font-medium mb-1">
                        Rotation: {watermark.rotation}°
                      </label>
                      <input
                        type="range"
                        id="watermarkRotation"
                        min="0"
                        max="359"
                        value={watermark.rotation}
                        onChange={(e) => handleWatermarkChange('rotation', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <button
                      type="button"
                      className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center"
                      onClick={generatePreview}
                    >
                      <FiCheck className="mr-1" size={12} />
                      Apply Watermark
                    </button>
                  </div>
                )}
              </div>
              
              {/* Text edit option */}
              <div>
                <button
                  type="button"
                  className={`flex items-center w-full text-left px-3 py-2 rounded-md ${
                    editMode === 'text'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setEditMode(editMode === 'text' ? 'none' : 'text')}
                >
                  <FiType className="mr-2" />
                  <span>Add Text</span>
                </button>
                
                {editMode === 'text' && (
                  <div className="mt-3 ml-6 space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Click anywhere on the document to add text
                    </p>
                    
                    {currentEdit && (
                      <>
                        <div>
                          <label htmlFor="textContent" className="block text-xs font-medium mb-1">
                            Text Content
                          </label>
                          <input
                            type="text"
                            id="textContent"
                            ref={textInputRef}
                            value={currentEdit.text}
                            onChange={(e) => handleTextEditChange('text', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="textFontSize" className="block text-xs font-medium mb-1">
                            Font Size: {currentEdit.fontSize}px
                          </label>
                          <input
                            type="range"
                            id="textFontSize"
                            min="8"
                            max="72"
                            value={currentEdit.fontSize}
                            onChange={(e) => handleTextEditChange('fontSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="textColor" className="block text-xs font-medium mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            id="textColor"
                            value={currentEdit.color}
                            onChange={(e) => handleTextEditChange('color', e.target.value)}
                            className="w-full h-8 p-0 border border-gray-300 dark:border-gray-700 rounded"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center justify-center"
                            onClick={() => {
                              // Apply the current edit and clear selection
                              setCurrentEdit(null);
                            }}
                          >
                            <FiCheck className="mr-1" size={12} />
                            Apply Text
                          </button>
                          
                          <button
                            type="button"
                            className="flex-1 py-1 px-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center justify-center"
                            onClick={() => {
                              // Remove the current edit
                              if (currentEdit) {
                                setTextEdits(prev => prev.filter(edit => 
                                  !(edit.pageIndex === currentEdit.pageIndex && 
                                  edit.x === currentEdit.x && 
                                  edit.y === currentEdit.y)
                                ));
                                setCurrentEdit(null);
                                generatePreview();
                              }
                            }}
                          >
                            <FiTrash2 className="mr-1" size={12} />
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
                  onClick={saveEditedPdf}
                  disabled={isProcessing}
                >
                  <FiSave className="mr-2" />
                  Save Edited PDF
                </button>
                
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md flex items-center justify-center"
                  onClick={resetForm}
                  disabled={isProcessing}
                >
                  <FiTrash2 className="mr-2" />
                  Remove File
                </button>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <h3 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Live Preview Tips</h3>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-4">
                  <li>Changes appear in real-time</li>
                  <li>Click on the document to add text when in text mode</li>
                  <li>Use the toolbar to customize watermarks and text</li>
                  <li>Save your edited PDF when satisfied with the changes</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* PDF preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FiFile className="mr-2 text-blue-500" />
                PDF Preview
                {isProcessing && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
              </h2>
              
              <div className="flex items-center space-x-2 text-sm">
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="mx-2">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                >
                  Next
                </button>
              </div>
            </div>
            
            <div className={`relative rounded-lg overflow-hidden ${isProcessing ? 'opacity-60' : ''}`}>
              {previewUrl && (
                <div 
                  className="min-h-[500px] border border-gray-300 dark:border-gray-700 rounded-lg overflow-auto bg-gray-100 dark:bg-gray-900"
                  onClick={(e) => handleCanvasClick(currentPage - 1, e)}
                >
                  <PDFViewer
                    file={previewUrl}
                    onDocumentLoaded={handleDocumentLoaded}
                    pageNumber={currentPage}
                    width={800}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Edited Successfully</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been edited with your changes. You can now download the edited PDF.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Edited PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 