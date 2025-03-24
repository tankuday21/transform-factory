'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiDownload, FiCheck, FiTrash2 } from 'react-icons/fi'

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quality, setQuality] = useState<string>('medium')
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savingsPercent: number;
  } | null>(null)
  
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
      
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 50MB.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      // Reset previous results
      setIsComplete(false)
      setCompressionStats(null)
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
      
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 50MB.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      // Reset previous results
      setIsComplete(false)
      setCompressionStats(null)
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
      formData.append('quality', quality)
      
      // Send request to API
      const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to compress PDF')
      }
      
      // Get compression stats from response headers
      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0')
      const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0')
      const savingsPercent = parseInt(response.headers.get('X-Savings-Percent') || '0')
      
      setCompressionStats({
        originalSize,
        compressedSize,
        savingsPercent
      })
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = file.name.replace('.pdf', '_compressed.pdf')
        setIsComplete(true)
      }
    } catch (err: any) {
      console.error('Error compressing PDF:', err)
      setError(err.message || 'An error occurred while compressing PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Format file size display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' bytes'
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB'
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setCompressionStats(null)
    setQuality('medium')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Compress PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Reduce the file size of your PDF documents while maintaining quality
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - File upload */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF File</h2>
          
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
                  Maximum file size: 50MB
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
                    {formatFileSize(file.size)}
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
        
        {/* Right column - Compression options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Compression Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Compression Quality
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border ${
                    quality === 'low'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('low')}
                >
                  <div className="font-medium mb-1">Low</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Smallest file size</div>
                </button>
                
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border ${
                    quality === 'medium'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('medium')}
                >
                  <div className="font-medium mb-1">Medium</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Balanced</div>
                </button>
                
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg border ${
                    quality === 'high'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setQuality('high')}
                >
                  <div className="font-medium mb-1">High</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Best quality</div>
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              <h3 className="font-medium mb-2">About PDF Compression:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Low:</span> Maximum compression, suitable for basic documents
                </li>
                <li>
                  <span className="font-medium">Medium:</span> Balanced compression, good for most PDFs
                </li>
                <li>
                  <span className="font-medium">High:</span> Minimal compression, preserves high quality
                </li>
              </ul>
              <p className="mt-3">
                Note: Compression results may vary depending on the content of your PDF.
              </p>
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
            'Compress PDF'
          )}
        </button>
      </div>
      
      {/* Results section */}
      {isComplete && compressionStats && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Compressed Successfully</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Original Size</div>
                <div className="font-medium">{formatFileSize(compressionStats.originalSize)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Compressed Size</div>
                <div className="font-medium">{formatFileSize(compressionStats.compressedSize)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reduced By</div>
                <div className="font-medium text-green-600 dark:text-green-400">{compressionStats.savingsPercent}%</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download Compressed PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 