'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiUpload, FiDownload, FiCheckCircle } from 'react-icons/fi'
import { toolConfigData, ToolConfig } from '@/app/data/toolConfigData'

interface ToolPageProps {
  toolId: string;
  category: string;
}

export default function ToolPage({ toolId, category }: ToolPageProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  // Get tool configuration if it exists
  const toolConfig = toolConfigData[toolId] || {
    title: toolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: `This is a tool for ${toolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: ['Upload your files', 'Process them', 'Download the result'],
    features: ['File processing', 'High quality output']
  } as ToolConfig;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Filter files based on accepted extensions
      const validFiles = selectedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return toolConfig.acceptedFiles.includes(extension);
      });
      
      setFiles(validFiles);
      
      // If some files were filtered out, show alert
      if (validFiles.length < selectedFiles.length) {
        alert(`Some files were not added because they are not supported. Accepted formats: ${toolConfig.acceptedFiles.join(', ')}`);
      }
    }
  }

  const handleProcess = () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
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
          {toolConfig.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {toolConfig.description}
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 mb-8">
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
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Accepted formats: {toolConfig.acceptedFiles.join(', ')}
                </div>
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors cursor-pointer">
                  Choose Files
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    multiple 
                    accept={toolConfig.acceptedFiles.join(',')}
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
                  Your file is ready to download as {toolConfig.outputFormat}
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
                        <p className="text-gray-900 dark:text-white font-medium truncate">{file.name}</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                How it works
              </h2>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800">
              <div className="space-y-6">
                {toolConfig.steps.map((step: string, index: number) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Features
              </h2>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800">
              <ul className="space-y-3">
                {toolConfig.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <FiCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {toolConfig.relatedTools && toolConfig.relatedTools.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Related Tools
              </h2>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {toolConfig.relatedTools.map((relatedToolId: string, index: number) => {
                  const relatedTool = toolConfigData[relatedToolId];
                  if (!relatedTool) return null;
                  
                  return (
                    <Link 
                      key={index} 
                      href={`/${category}/${relatedToolId}`}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-blue-600 dark:text-blue-400">
                          {relatedTool.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{relatedTool.title}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {toolConfig.additionalInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {toolConfig.additionalInfo}
                </p>
              </div>
            </div>
          </div>
        )}
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