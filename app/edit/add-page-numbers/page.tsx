'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiList, FiCheck, FiTrash2 } from 'react-icons/fi'

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Page number options
  const [startNumber, setStartNumber] = useState<number>(1)
  const [position, setPosition] = useState<string>('bottom-center')
  const [prefix, setPrefix] = useState<string>('')
  const [suffix, setSuffix] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(12)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
    }
  }

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
    }
  }

  // Process the PDF
  const processPDF = async () => {
    if (!file) {
      setError('Please select a PDF file.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('startNumber', startNumber.toString())
      formData.append('position', position)
      formData.append('prefix', prefix)
      formData.append('suffix', suffix)
      formData.append('fontSize', fontSize.toString())
      
      // Send request to API
      const response = await fetch('/api/pdf/add-page-numbers', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add page numbers')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = 'numbered.pdf'
        setIsComplete(true)
      }
    } catch (err: any) {
      console.error('Error adding page numbers:', err)
      setError(err.message || 'An error occurred while adding page numbers. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setStartNumber(1)
    setPosition('bottom-center')
    setPrefix('')
    setSuffix('')
    setFontSize(12)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add Page Numbers to PDF</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF</h2>
          
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
                  Maximum file size: 10MB
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
        </div>
        
        {/* Right column - Page number options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Page Number Options</h2>
          
          <div className="space-y-6">
            {/* Starting number */}
            <div>
              <label htmlFor="startNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Starting Number
              </label>
              <input
                type="number"
                id="startNumber"
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The first page will start with this number
              </p>
            </div>
            
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'top-left' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('top-left')}
                >
                  Top Left
                </button>
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'top-center' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('top-center')}
                >
                  Top Center
                </button>
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'top-right' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('top-right')}
                >
                  Top Right
                </button>
                
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'bottom-left' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('bottom-left')}
                >
                  Bottom Left
                </button>
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'bottom-center' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('bottom-center')}
                >
                  Bottom Center
                </button>
                <button
                  type="button"
                  className={`p-2 text-center rounded ${position === 'bottom-right' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setPosition('bottom-right')}
                >
                  Bottom Right
                </button>
              </div>
            </div>
            
            {/* Prefix and Suffix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g., 'Page '"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  id="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="e.g., ' of X'"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Font Size */}
            <div>
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <select
                id="fontSize"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="8">8 pt</option>
                <option value="10">10 pt</option>
                <option value="12">12 pt</option>
                <option value="14">14 pt</option>
                <option value="16">16 pt</option>
                <option value="18">18 pt</option>
              </select>
            </div>
            
            {/* Preview */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Preview: 
              </p>
              <div className="border border-dashed border-gray-300 dark:border-gray-600 p-3 relative rounded bg-white dark:bg-gray-800 flex items-center justify-center h-20">
                <div className={`absolute text-gray-800 dark:text-gray-200 ${
                  position.includes('top') ? 'top-1' : 'bottom-1'
                } ${
                  position.includes('left') ? 'left-1' : position.includes('right') ? 'right-1' : ''
                } ${
                  position.includes('center') ? 'left-1/2 transform -translate-x-1/2' : ''
                }`} style={{ fontSize: `${fontSize}px` }}>
                  {prefix}2{suffix}
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Page Content
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className={`py-2 px-6 rounded-lg font-medium flex items-center ${
            isProcessing || !file
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } text-white`}
          onClick={processPDF}
          disabled={isProcessing || !file}
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
            <>
              <FiList className="mr-2" />
              Add Page Numbers
            </>
          )}
        </button>
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Page Numbers Added Successfully</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully modified with page numbers as requested.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium"
              onClick={() => {
                // Automatically click the download link
                setTimeout(() => {
                  if (downloadLinkRef.current) {
                    downloadLinkRef.current.click()
                  }
                }, 100)
              }}
            >
              Download PDF with Page Numbers
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 