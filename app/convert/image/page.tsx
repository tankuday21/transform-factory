'use client'

import { useState } from 'react'
import Link from 'next/link'
import FileUploader from '@/app/components/FileUploader'

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'gif', label: 'GIF' },
  { value: 'bmp', label: 'BMP' }
]

export default function ImageConverterPage() {
  const [outputFormat, setOutputFormat] = useState('png')
  
  // Define accepted MIME types based on common image formats
  const acceptedFileTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
    'image/webp': ['.webp']
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Image Converter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert your images between different formats including PNG, JPEG, GIF, BMP, and more. 
          Maintain quality while optimizing file size.
        </p>
      </div>
      
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <div className="mb-6">
          <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {IMAGE_FORMATS.map((format) => (
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
            conversionType="image"
          />
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Image Conversion</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            Our image converter supports all major image formats and preserves the quality of your 
            images while optimizing file size.
          </p>
          <p>
            <strong>PNG</strong> - Best for graphics, logos, and images with transparency.
            <br />
            <strong>JPEG/JPG</strong> - Ideal for photographs and realistic images.
            <br />
            <strong>WEBP</strong> - Modern format with excellent compression and quality.
            <br />
            <strong>GIF</strong> - Perfect for simple animations and images with limited colors.
            <br />
            <strong>BMP</strong> - Uncompressed format that preserves all image data.
          </p>
        </div>
      </div>
    </div>
  )
} 