'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

interface FileUploaderProps {
  acceptedFileTypes: Record<string, string[]>
  maxFileSize?: number
  outputFormat: string
  conversionType: 'image' | 'document' | 'video'
}

export default function FileUploader({
  acceptedFileTypes,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  outputFormat,
  conversionType
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    setConvertedFileUrl(null)
    
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      
      if (selectedFile.size > maxFileSize) {
        setError(`File is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`)
        return
      }
      
      setFile(selectedFile)
    }
  }, [maxFileSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1
  })

  const handleConversion = async () => {
    if (!file) return
    
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('outputFormat', outputFormat)
    
    try {
      const response = await axios.post(`/api/convert/${conversionType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      })
      
      // Create a download URL
      const url = URL.createObjectURL(response.data)
      setConvertedFileUrl(url)
      setLoading(false)
    } catch (err) {
      console.error('Conversion error:', err)
      setError('An error occurred during conversion. Please try again.')
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!convertedFileUrl) return
    
    const link = document.createElement('a')
    link.href = convertedFileUrl
    
    // Get file extension from outputFormat
    const extension = outputFormat.toLowerCase().replace('.', '')
    
    // Create a proper file name
    const fileName = file ? `${file.name.split('.')[0]}.${extension}` : `converted.${extension}`
    
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetForm = () => {
    setFile(null)
    setConvertedFileUrl(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {!convertedFileUrl ? (
        <>
          <div 
            {...getRootProps()} 
            className={`file-upload-area ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-1 text-gray-500">
                {isDragActive 
                  ? 'Drop the file here...' 
                  : 'Drag & drop your file here, or click to select'}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {Object.keys(acceptedFileTypes).map(type => type.replace('application/', '').replace('image/', '')).join(', ')} files up to {maxFileSize / (1024 * 1024)}MB
              </p>
            </div>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center max-w-[80%]">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="ml-2 truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleConversion}
              disabled={!file || loading}
              className={`btn btn-primary w-full ${!file || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </span>
              ) : (
                `Convert to ${outputFormat.toUpperCase()}`
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Conversion Complete!</h3>
            <p className="mt-1 text-sm text-gray-500">Your file has been successfully converted</p>
          </div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button
              onClick={handleDownload}
              className="btn btn-primary"
            >
              Download File
            </button>
            <button
              onClick={resetForm}
              className="btn btn-outline"
            >
              Convert Another File
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 