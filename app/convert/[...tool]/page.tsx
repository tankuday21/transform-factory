'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiUpload, FiDownload } from 'react-icons/fi'

export default function ToolPage() {
  const params = useParams()
  const toolId = Array.isArray(params.tool) ? params.tool.join('/') : params.tool
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleProcess = () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/pdf" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <FiArrowLeft className="mr-2" />
          Back to PDF Tools
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {toolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center">
            {!files.length && !isComplete ? (
              <div className="py-12">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiUpload size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upload Files
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Drag and drop files here, or click to browse your device
                </p>
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer">
                  Choose Files
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    multiple 
                  />
                </label>
              </div>
            ) : isComplete ? (
              <div className="py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiDownload size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Conversion Complete!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Your file is ready to download
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Download
                </button>
              </div>
            ) : (
              <div className="py-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
                </h2>
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-6">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center py-2">
                      <div className="mr-3 text-gray-600 dark:text-gray-400">
                        <FiFileType file={file} />
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-900 dark:text-white font-medium">{file.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  onClick={handleProcess}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              About this tool
            </h2>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is a placeholder for the {toolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} tool. In a real application, this would contain the actual conversion functionality.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              For demonstration purposes, you can upload files and see a simulated conversion process.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get file icon based on type
function FiFileType({ file }: { file: File }) {
  const type = file.type
  
  if (type.includes('pdf')) {
    return <span className="text-red-500">PDF</span>
  } else if (type.includes('word') || type.includes('document')) {
    return <span className="text-blue-500">DOC</span>
  } else if (type.includes('sheet') || type.includes('excel')) {
    return <span className="text-green-500">XLS</span>
  } else if (type.includes('image')) {
    return <span className="text-purple-500">IMG</span>
  } else {
    return <span className="text-gray-500">FILE</span>
  }
}

// Helper function to format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 