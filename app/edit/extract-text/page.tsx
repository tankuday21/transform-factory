'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiCopy, FiDownload, FiCheck, FiTrash2 } from 'react-icons/fi'

export default function ExtractTextPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
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
      // Reset previous results
      setExtractedText('')
      setIsComplete(false)
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
      // Reset previous results
      setExtractedText('')
      setIsComplete(false)
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
      formData.append('format', 'json')
      
      // Send request to API
      const response = await fetch('/api/pdf/extract-text', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract text')
      }
      
      // Parse the JSON response
      const data = await response.json()
      setExtractedText(data.text)
      
      // Create blob for download
      const textBlob = new Blob([data.text], { type: 'text/plain' })
      const downloadUrl = URL.createObjectURL(textBlob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = downloadUrl
        downloadLinkRef.current.download = file.name.replace('.pdf', '.txt')
      }
      
      setIsComplete(true)
    } catch (err: any) {
      console.error('Error extracting text:', err)
      setError(err.message || 'An error occurred while extracting text. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select()
      document.execCommand('copy')
      setIsCopied(true)
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setExtractedText('')
    setIsCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Extract Text from PDF</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload PDF File</h2>
        
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
                Maximum file size: 20MB
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
            
            <div className="flex space-x-2">
              <button
                type="button"
                className={`py-2 px-4 rounded-lg font-medium flex items-center ${
                  isProcessing
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                } text-white`}
                onClick={processPDF}
                disabled={isProcessing}
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
                  'Extract Text'
                )}
              </button>
              
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                onClick={resetForm}
                aria-label="Remove file"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Extracted text results */}
      {isComplete && extractedText && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Extracted Text</h2>
            
            <div className="flex space-x-2">
              <button
                type="button"
                className={`py-2 px-4 rounded-lg font-medium flex items-center ${
                  isCopied
                    ? 'bg-green-600 dark:bg-green-700'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                } ${isCopied ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <>
                    <FiCheck className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="mr-2" />
                    Copy
                  </>
                )}
              </button>
              
              <a
                ref={downloadLinkRef}
                className="py-2 px-4 rounded-lg font-medium flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <FiDownload className="mr-2" />
                Download
              </a>
            </div>
          </div>
          
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-[60vh]">
            <textarea
              ref={textAreaRef}
              className="w-full h-full min-h-[300px] bg-transparent font-mono text-sm text-gray-800 dark:text-gray-200 focus:outline-none resize-y"
              value={extractedText}
              readOnly
            ></textarea>
          </div>
        </div>
      )}
    </div>
  )
} 