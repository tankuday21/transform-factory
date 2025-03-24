'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: string | File;
  pageNumber?: number;
  width?: number;
  onDocumentLoaded?: (numPages: number) => void;
}

export default function PDFViewer({ file, pageNumber = 1, width = 800, onDocumentLoaded }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Reset loading state when file changes
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [file]);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    if (onDocumentLoaded) {
      onDocumentLoaded(numPages);
    }
  };

  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    setError(error);
    setLoading(false);
    console.error('Error loading PDF:', error);
  };

  return (
    <div className="pdf-viewer">
      {loading && (
        <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading PDF...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center text-red-600 dark:text-red-400 p-6">
            <p className="font-bold mb-2">Error loading PDF</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      )}
      
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading=""
        error=""
        className="document-container"
      >
        <Page 
          pageNumber={pageNumber} 
          width={width}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="mx-auto shadow-md"
        />
      </Document>
      
      {!loading && !error && numPages && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>
        </div>
      )}
    </div>
  );
} 