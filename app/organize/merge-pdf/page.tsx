'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiX, FiArrowDown, FiCheck } from 'react-icons/fi'

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Filter for only PDF files
      const pdfFiles = Array.from(e.target.files).filter(
        file => file.type === 'application/pdf'
      )
      
      if (pdfFiles.length === 0) {
        setError('Please select PDF files only.')
        return
      }
      
      setFiles(prev => [...prev, ...pdfFiles])
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
      // Filter for only PDF files
      const pdfFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      )
      
      if (pdfFiles.length === 0) {
        setError('Please select PDF files only.')
        return
      }
      
      setFiles(prev => [...prev, ...pdfFiles])
      setError(null)
    }
  }

  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // Handle file order change (move up)
  const moveFileUp = (index: number) => {
    if (index === 0) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index - 1]
    newFiles[index - 1] = temp
    setFiles(newFiles)
  }

  // Handle file order change (move down)
  const moveFileDown = (index: number) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    const temp = newFiles[index]
    newFiles[index] = newFiles[index + 1]
    newFiles[index + 1] = temp
    setFiles(newFiles)
  }

  // Process the files
  const processPDFs = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file.')
      return
    }
    
    if (files.length === 1) {
      setError('Please select at least two PDF files to merge.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      files.forEach(file => {
        formData.append('pdfs', file)
      })
      
      // Send request to API
      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to process PDFs')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = 'merged.pdf'
        setIsComplete(true)
      }
    } catch (err) {
      console.error('Error processing PDFs:', err)
      setError('An error occurred while processing the PDFs. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFiles([])
    setIsComplete(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Merge PDF Files</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="mb-6">
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
              multiple
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center">
              <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your PDF files here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-600">
                Maximum file size: 10MB per file
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        
        {files.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Files to Merge ({files.length})</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              The files will be merged in the order shown below. Use the arrows to change the order.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              {files.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className={`flex items-center justify-between p-3 ${
                    index !== files.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      <FiFile size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className={`p-1 rounded-full ${
                        index > 0
                          ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      onClick={() => moveFileUp(index)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <FiArrowDown className="rotate-180" size={16} />
                    </button>
                    
                    <button
                      type="button"
                      className={`p-1 rounded-full ${
                        index < files.length - 1
                          ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      onClick={() => moveFileDown(index)}
                      disabled={index === files.length - 1}
                      aria-label="Move down"
                    >
                      <FiArrowDown size={16} />
                    </button>
                    
                    <button
                      type="button"
                      className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={resetForm}
          >
            Reset
          </button>
          
          <button
            type="button"
            className={`py-2 px-6 rounded-lg font-medium flex items-center ${
              isProcessing
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            } text-white`}
            onClick={processPDFs}
            disabled={isProcessing || files.length < 2}
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
              'Merge PDFs'
            )}
          </button>
        </div>
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Merge Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF files have been successfully merged into a single document.
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
              Download Merged PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 