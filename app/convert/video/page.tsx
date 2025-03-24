'use client'

import { useState } from 'react'
import Link from 'next/link'
import FileUploader from '@/app/components/FileUploader'

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4' },
  { value: 'avi', label: 'AVI' },
  { value: 'mov', label: 'MOV' },
  { value: 'wmv', label: 'WMV' },
  { value: 'mkv', label: 'MKV' },
  { value: 'webm', label: 'WEBM' }
]

export default function VideoConverterPage() {
  const [outputFormat, setOutputFormat] = useState('mp4')
  
  // Define accepted MIME types based on common video formats
  const acceptedFileTypes = {
    'video/mp4': ['.mp4'],
    'video/x-msvideo': ['.avi'],
    'video/quicktime': ['.mov'],
    'video/x-ms-wmv': ['.wmv'],
    'video/x-matroska': ['.mkv'],
    'video/webm': ['.webm']
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Video Converter</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Convert your videos between different formats including MP4, AVI, MOV, WMV, and more.
          Maintain quality while optimizing file size and compatibility.
        </p>
      </div>
      
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <div className="mb-6">
          <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {VIDEO_FORMATS.map((format) => (
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
            conversionType="video"
            maxFileSize={100 * 1024 * 1024} // 100MB limit for videos
          />
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Video Conversion</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            Our video converter supports all major video formats and preserves the quality of your 
            videos while optimizing file size for easy sharing and playback.
          </p>
          <p>
            <strong>MP4</strong> - Most widely supported video format, ideal for web and mobile.
            <br />
            <strong>AVI</strong> - Container format that can contain both audio and video data.
            <br />
            <strong>MOV</strong> - QuickTime movie format developed by Apple.
            <br />
            <strong>WMV</strong> - Windows Media Video format with good compression.
            <br />
            <strong>MKV</strong> - Matroska Video file that can hold multiple audio and subtitle tracks.
            <br />
            <strong>WEBM</strong> - Open, royalty-free format designed for the web.
          </p>
        </div>
      </div>
    </div>
  )
} 