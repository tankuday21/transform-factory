'use client'

import { useState } from 'react'
import Link from 'next/link'
import FileUploader from '@/app/components/FileUploader'

const DOCUMENT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'doc', label: 'DOC' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'csv', label: 'CSV' },
  { value: 'txt', label: 'TXT' }
]

export default function DocumentConverterPage() {
  const [outputFormat, setOutputFormat] = useState('pdf')
  
  // Define accepted MIME types based on common document formats
  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt']
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Converter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert your documents between different formats including PDF, Word, Excel, CSV, and more.
          Preserve formatting while ensuring compatibility.
        </p>
      </div>
      
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <div className="mb-6">
          <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DOCUMENT_FORMATS.map((format) => (
              <button
                key={format.value}
                type="button"
                className={`py-2 px-3 rounded-md text-sm font-medium ${
                  outputFormat === format.value
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setOutputFormat(format.value)}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <FileUploader
            acceptedFileTypes={acceptedFileTypes}
            outputFormat={outputFormat}
            conversionType="document"
          />
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Document Conversion</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            Our document converter supports all major document formats and preserves the formatting
            of your documents while ensuring compatibility across different applications.
          </p>
          <p>
            <strong>PDF</strong> - Universal format that preserves layout and formatting across all devices.
            <br />
            <strong>DOCX/DOC</strong> - Microsoft Word formats for text documents with rich formatting.
            <br />
            <strong>XLSX/XLS</strong> - Microsoft Excel spreadsheet formats for data and calculations.
            <br />
            <strong>CSV</strong> - Simple text format for tabular data, compatible with all spreadsheet applications.
            <br />
            <strong>TXT</strong> - Basic text format without formatting, universally compatible.
          </p>
        </div>
      </div>
    </div>
  )
} 