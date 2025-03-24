'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiFile, FiRotateCw, FiRotateCcw, FiCheck, FiTrash2 } from 'react-icons/fi'

export default function RotatePDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Rotation options
  const [rotationAngle, setRotationAngle] = useState<number>(90)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [allPages, setAllPages] = useState<boolean>(true)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Get page count from the PDF file
  const getPageCount = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Use pdfjsLib to get the page count
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      return pdf.numPages
    } catch (err) {
      console.error('Error getting page count:', err)
      return 0
    }
  }

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      
      // Get page count
      const count = await getPageCount(selectedFile)
      if (count > 0) {
        setPageCount(count)
        setSelectedPages([])
      } else {
        setError('Could not read the PDF file. Please try another file.')
        setFile(null)
      }
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
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
      
      // Get page count
      const count = await getPageCount(selectedFile)
      if (count > 0) {
        setPageCount(count)
        setSelectedPages([])
      } else {
        setError('Could not read the PDF file. Please try another file.')
        setFile(null)
      }
    }
  }

  // Toggle page selection
  const togglePageSelection = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      setSelectedPages(selectedPages.filter(p => p !== pageNum))
    } else {
      setSelectedPages([...selectedPages, pageNum])
    }
  }

  // Handle rotation type change
  const handleRotationTypeChange = (useAllPages: boolean) => {
    setAllPages(useAllPages)
    if (useAllPages) {
      setSelectedPages([])
    }
  }

  // Process the PDF
  const processPDF = async () => {
    if (!file) {
      setError('Please select a PDF file.')
      return
    }
    
    if (!allPages && selectedPages.length === 0) {
      setError('Please select at least one page to rotate.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('rotationAngle', rotationAngle.toString())
      formData.append('allPages', allPages.toString())
      
      if (!allPages) {
        formData.append('pageNumbers', JSON.stringify(selectedPages))
      }
      
      // Send request to API
      const response = await fetch('/api/pdf/rotate', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to rotate PDF')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = 'rotated.pdf'
        setIsComplete(true)
      }
    } catch (err) {
      console.error('Error rotating PDF:', err)
      setError('An error occurred while rotating the PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setPageCount(0)
    setIsComplete(false)
    setError(null)
    setRotationAngle(90)
    setSelectedPages([])
    setAllPages(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate an array of page numbers from 1 to pageCount
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rotate PDF Pages</h1>
      
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
                    {pageCount} page{pageCount !== 1 ? 's' : ''} • {(file.size / 1024 / 1024).toFixed(2)} MB
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
        
        {/* Right column - Rotation options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Rotation Options</h2>
          
          {file && pageCount > 0 ? (
            <div className="space-y-6">
              {/* Rotation angle selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Rotation Angle</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer ${
                      rotationAngle === 90
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                    onClick={() => setRotationAngle(90)}
                  >
                    <FiRotateCw size={24} className="mb-2" />
                    <span>90° Clockwise</span>
                  </div>
                  
                  <div
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer ${
                      rotationAngle === -90
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                    onClick={() => setRotationAngle(-90)}
                  >
                    <FiRotateCcw size={24} className="mb-2" />
                    <span>90° Counter-clockwise</span>
                  </div>
                  
                  <div
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer ${
                      rotationAngle === 180
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                    onClick={() => setRotationAngle(180)}
                  >
                    <div className="flex mb-2">
                      <FiRotateCw size={24} />
                      <FiRotateCw size={24} />
                    </div>
                    <span>180° Rotate</span>
                  </div>
                </div>
              </div>
              
              {/* Page selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Page Selection</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="allPages"
                      name="pageSelection"
                      checked={allPages}
                      onChange={() => handleRotationTypeChange(true)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="allPages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      All pages ({pageCount})
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="selectedPages"
                      name="pageSelection"
                      checked={!allPages}
                      onChange={() => handleRotationTypeChange(false)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="selectedPages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Selected pages ({selectedPages.length})
                    </label>
                  </div>
                  
                  {!allPages && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Select pages to rotate:
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        {pageNumbers.map(pageNum => (
                          <div
                            key={pageNum}
                            className={`text-center py-1 px-2 rounded cursor-pointer text-sm ${
                              selectedPages.includes(pageNum)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => togglePageSelection(pageNum)}
                          >
                            {pageNum}
                          </div>
                        ))}
                      </div>
                      
                      {pageCount > 25 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                          {selectedPages.length} of {pageCount} pages selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              Upload a PDF file to see rotation options
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className={`py-2 px-6 rounded-lg font-medium flex items-center ${
            isProcessing || !file || (!allPages && selectedPages.length === 0)
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } text-white`}
          onClick={processPDF}
          disabled={isProcessing || !file || (!allPages && selectedPages.length === 0)}
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
            'Rotate PDF'
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Rotation Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully rotated as requested.
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
              Download Rotated PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 