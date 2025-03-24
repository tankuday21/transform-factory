'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiFile, FiTrash2, FiCheck, FiPlus, FiMinus } from 'react-icons/fi'

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number>(0)
  const [splitMethod, setSplitMethod] = useState<'single' | 'range'>('single')
  const [ranges, setRanges] = useState<{ start: number; end: number }[]>([{ start: 1, end: 1 }])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Reset ranges when page count changes
  useEffect(() => {
    if (pageCount > 0) {
      if (splitMethod === 'range') {
        setRanges([{ start: 1, end: pageCount }])
      }
    }
  }, [pageCount, splitMethod])

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
      } else {
        setError('Could not read the PDF file. Please try another file.')
        setFile(null)
      }
    }
  }

  // Add a new range
  const addRange = () => {
    if (ranges.length < 10) { // Limit to 10 ranges for simplicity
      setRanges([...ranges, { start: 1, end: pageCount }])
    }
  }

  // Remove a range
  const removeRange = (index: number) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter((_, i) => i !== index))
    }
  }

  // Update a range
  const updateRange = (index: number, field: 'start' | 'end', value: number) => {
    const newRanges = [...ranges]
    
    if (field === 'start') {
      // Ensure start is not less than 1 and not greater than end
      const validValue = Math.max(1, Math.min(value, newRanges[index].end))
      newRanges[index].start = validValue
    } else {
      // Ensure end is not greater than pageCount and not less than start
      const validValue = Math.max(newRanges[index].start, Math.min(value, pageCount))
      newRanges[index].end = validValue
    }
    
    setRanges(newRanges)
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
      formData.append('splitMethod', splitMethod)
      
      if (splitMethod === 'range') {
        formData.append('ranges', JSON.stringify(ranges))
      }
      
      // Send request to API
      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to process PDF')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = 'split_pdfs.zip'
        setIsComplete(true)
      }
    } catch (err) {
      console.error('Error processing PDF:', err)
      setError('An error occurred while processing the PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setPageCount(0)
    setSplitMethod('single')
    setRanges([{ start: 1, end: 1 }])
    setIsComplete(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Split PDF File</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        {!file ? (
          // File upload section
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
          </div>
        ) : (
          // Split options section
          <div>
            <div className="mb-6 flex items-center space-x-4">
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
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Split Method</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    splitMethod === 'single'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => setSplitMethod('single')}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <line x1="12" y1="4" x2="12" y2="20" />
                      </svg>
                    </div>
                    <div className="font-medium">Split by Page</div>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      Each page becomes a separate PDF
                    </p>
                  </div>
                </button>
                
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    splitMethod === 'range'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => setSplitMethod('range')}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="6" height="12" rx="1" />
                        <rect x="10" y="6" width="6" height="12" rx="1" />
                        <rect x="18" y="6" width="4" height="12" rx="1" />
                      </svg>
                    </div>
                    <div className="font-medium">Split by Range</div>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      Specify custom page ranges
                    </p>
                  </div>
                </button>
              </div>
            </div>
            
            {splitMethod === 'range' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Page Ranges</h2>
                  
                  <button
                    type="button"
                    className="py-1 px-3 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg flex items-center hover:bg-blue-200 dark:hover:bg-blue-800/50"
                    onClick={addRange}
                    disabled={ranges.length >= 10}
                  >
                    <FiPlus size={16} className="mr-1" />
                    Add Range
                  </button>
                </div>
                
                <div className="space-y-3">
                  {ranges.map((range, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 mr-2">From:</span>
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={range.start}
                          onChange={(e) => updateRange(index, 'start', parseInt(e.target.value) || 1)}
                          className="w-16 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400 mr-2">To:</span>
                        <input
                          type="number"
                          min={range.start}
                          max={pageCount}
                          value={range.end}
                          onChange={(e) => updateRange(index, 'end', parseInt(e.target.value) || range.start)}
                          className="w-16 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      {ranges.length > 1 && (
                        <button
                          type="button"
                          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => removeRange(index)}
                          aria-label="Remove range"
                        >
                          <FiMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {ranges.length >= 10 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Maximum of 10 ranges allowed.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                className={`py-2 px-6 rounded-lg font-medium flex items-center ${
                  isProcessing
                    ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
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
                  'Split PDF'
                )}
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Split Complete</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully split. The files are packaged in a ZIP archive.
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
              Download Split PDFs
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 