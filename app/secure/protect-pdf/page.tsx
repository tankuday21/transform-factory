'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiLock, FiCheck, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi'

export default function ProtectPDFPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Password states
  const [userPassword, setUserPassword] = useState<string>('')
  const [ownerPassword, setOwnerPassword] = useState<string>('')
  const [showUserPassword, setShowUserPassword] = useState<boolean>(false)
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false)
  
  // Permission states
  const [canPrint, setCanPrint] = useState<boolean>(true)
  const [canModify, setCanModify] = useState<boolean>(false)
  const [canCopy, setCanCopy] = useState<boolean>(true)
  const [canAnnotate, setCanAnnotate] = useState<boolean>(true)
  
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
    
    if (!userPassword && !ownerPassword) {
      setError('Please enter at least one password (user or owner).')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)
      
      // Add passwords
      if (userPassword) formData.append('userPassword', userPassword)
      if (ownerPassword) formData.append('ownerPassword', ownerPassword)
      
      // Add permissions
      formData.append('canPrint', canPrint.toString())
      formData.append('canModify', canModify.toString())
      formData.append('canCopy', canCopy.toString())
      formData.append('canAnnotate', canAnnotate.toString())
      
      // Send request to API
      const response = await fetch('/api/pdf/protect', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to protect PDF')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = 'protected.pdf'
        setIsComplete(true)
      }
    } catch (err) {
      console.error('Error protecting PDF:', err)
      setError('An error occurred while protecting the PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setUserPassword('')
    setOwnerPassword('')
    setShowUserPassword(false)
    setShowOwnerPassword(false)
    setCanPrint(true)
    setCanModify(false)
    setCanCopy(true)
    setCanAnnotate(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Protect PDF with Password</h1>
      
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
        
        {/* Right column - Protection options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">2. Protection Options</h2>
          
          <div className="space-y-6">
            {/* Password section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password Protection</h3>
              
              <div>
                <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Password (to open document)
                </label>
                <div className="relative">
                  <input
                    type={showUserPassword ? "text" : "password"}
                    id="userPassword"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter user password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                  >
                    {showUserPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Required to open the document
                </p>
              </div>
              
              <div>
                <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Owner Password (for full access)
                </label>
                <div className="relative">
                  <input
                    type={showOwnerPassword ? "text" : "password"}
                    id="ownerPassword"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter owner password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                  >
                    {showOwnerPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Provides full access to the document
                </p>
              </div>
            </div>
            
            {/* Permissions section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Permissions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set what users with the user password can do with the document:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canPrint"
                    checked={canPrint}
                    onChange={(e) => setCanPrint(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canPrint" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Allow printing
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canModify"
                    checked={canModify}
                    onChange={(e) => setCanModify(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canModify" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Allow document modification
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canCopy"
                    checked={canCopy}
                    onChange={(e) => setCanCopy(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canCopy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Allow content copying
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canAnnotate"
                    checked={canAnnotate}
                    onChange={(e) => setCanAnnotate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="canAnnotate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Allow annotations and form filling
                  </label>
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
            isProcessing || !file || (!userPassword && !ownerPassword)
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          } text-white`}
          onClick={processPDF}
          disabled={isProcessing || !file || (!userPassword && !ownerPassword)}
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
              <FiLock className="mr-2" />
              Protect PDF
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
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">PDF Protected Successfully</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF has been successfully protected with the specified passwords and permissions.
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
              Download Protected PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 