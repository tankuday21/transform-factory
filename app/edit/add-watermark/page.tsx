'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiType, FiTrash2, FiCheck, FiSliders } from 'react-icons/fi'

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL')
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3)
  const [watermarkPosition, setWatermarkPosition] = useState<string>('center')
  const [watermarkSize, setWatermarkSize] = useState<number>(50)
  const [watermarkRotation, setWatermarkRotation] = useState<number>(45)
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
    
    if (!watermarkText.trim()) {
      setError('Please enter watermark text.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('watermarkText', watermarkText)
      formData.append('watermarkOpacity', watermarkOpacity.toString())
      formData.append('watermarkPosition', watermarkPosition)
      formData.append('watermarkSize', watermarkSize.toString())
      formData.append('watermarkRotation', watermarkRotation.toString())
      
      // Send request to API
      const response = await fetch('/api/pdf/watermark', {
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
        downloadLinkRef.current.download = 'watermarked.pdf'
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
    setIsComplete(false)
    setError(null)
    setWatermarkText('CONFIDENTIAL')
    setWatermarkOpacity(0.3)
    setWatermarkPosition('center')
    setWatermarkSize(50)
    setWatermarkRotation(45)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Map of position options
  const positionOptions = [
    { value: 'topLeft', label: 'Top Left' },
    { value: 'topCenter', label: 'Top Center' },
    { value: 'topRight', label: 'Top Right' },
    { value: 'centerLeft', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'centerRight', label: 'Center Right' },
    { value: 'bottomLeft', label: 'Bottom Left' },
    { value: 'bottomCenter', label: 'Bottom Center' },
    { value: 'bottomRight', label: 'Bottom Right' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add Watermark to PDF</h1>
      
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
        
        {/* Right column - Watermark options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Watermark Options</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="watermarkText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Watermark Text
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <FiType size={16} />
                </span>
                <input
                  type="text"
                  id="watermarkText"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter watermark text"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="watermarkPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <select
                id="watermarkPosition"
                value={watermarkPosition}
                onChange={(e) => setWatermarkPosition(e.target.value)}
                className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {positionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opacity: {Math.round(watermarkOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size: {watermarkSize}px
              </label>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={watermarkSize}
                onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rotation: {watermarkRotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={watermarkRotation}
                onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 mt-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex flex-col">
            <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
              <FiSliders className="mr-2" />
              <p>Preview settings (approximate)</p>
            </div>
            
            <div className="mt-4 relative w-full h-32 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden"
                style={{
                  top: positionPosition('y'),
                  left: positionPosition('x'),
                  fontSize: `${watermarkSize / 3}px`,
                  opacity: watermarkOpacity,
                  transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)`,
                }}
              >
                {watermarkText || 'WATERMARK'}
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
            isProcessing || !file || !watermarkText.trim()
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } text-white`}
          onClick={processPDF}
          disabled={isProcessing || !file || !watermarkText.trim()}
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
            'Add Watermark'
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Watermark Added</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully watermarked.
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
              Download Watermarked PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )

  // Helper function to determine position
  function positionPosition(axis: 'x' | 'y'): string {
    const positions: Record<string, { x: string; y: string }> = {
      topLeft: { x: '25%', y: '25%' },
      topCenter: { x: '50%', y: '25%' },
      topRight: { x: '75%', y: '25%' },
      centerLeft: { x: '25%', y: '50%' },
      center: { x: '50%', y: '50%' },
      centerRight: { x: '75%', y: '50%' },
      bottomLeft: { x: '25%', y: '75%' },
      bottomCenter: { x: '50%', y: '75%' },
      bottomRight: { x: '75%', y: '75%' },
    }
    
    return positions[watermarkPosition]?.[axis] || (axis === 'x' ? '50%' : '50%')
  }
} 