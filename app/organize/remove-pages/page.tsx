'use client'

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaFilePdf, FaDownload, FaTrash, FaSpinner } from 'react-icons/fa';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Document, Page, pdfjs } from 'react-pdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function RemovePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  
  // Reference to download link
  const downloadRef = useRef<HTMLAnchorElement>(null);
  
  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('File size should not exceed 20MB');
        return;
      }
      
      setFile(selectedFile);
      setDownloadUrl('');
      setDownloadFilename('');
      setPageRange('');
    }
  }, []);

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });
  
  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  // Handle removing the file
  const handleRemoveFile = () => {
    setFile(null);
    setNumPages(0);
    setPageRange('');
    setDownloadUrl('');
    setDownloadFilename('');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  };
  
  // Remove pages from PDF
  const handleRemovePages = async () => {
    if (!file || !pageRange.trim()) {
      toast.error('Please upload a PDF and specify pages to remove');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('pageRange', pageRange);
      
      setProgress(30);
      
      const response = await fetch('/api/pdf/remove-pages', {
        method: 'POST',
        body: formData
      });
      
      setProgress(80);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove pages');
      }
      
      const blob = await response.blob();
      
      // Check if blob is empty or invalid
      if (!blob || blob.size === 0) {
        throw new Error('Received empty response from server');
      }
      
      const url = URL.createObjectURL(blob);
      
      // Get content-disposition header to extract filename
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'modified_pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      filename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      
      setDownloadUrl(url);
      setDownloadFilename(filename);
      setProgress(100);
      
      toast.success('Pages removed successfully');
      
      // Trigger download automatically
      if (downloadRef.current) {
        downloadRef.current.click();
      }
    } catch (error) {
      console.error('Error removing pages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove pages');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Validate page range input
  const handlePageRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only valid characters: digits, commas, hyphens, and spaces
    if (/^[0-9,\-\s]*$/.test(value)) {
      setPageRange(value);
    }
  };
  
  return (
    <>
      <ToastContainer />
      <div className="container mx-auto py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Remove Pages from PDF</h1>
        
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <FaFileUpload className="mx-auto text-4xl mb-4 text-gray-400" />
            <p className="text-lg font-medium">Drag & drop a PDF file here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">Max file size: 20MB</p>
          </div>
        ) : (
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FaFilePdf className="text-2xl text-red-500" />
                  <div>
                    <CardTitle className="text-xl">{file.name}</CardTitle>
                    <CardDescription>
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {numPages} pages
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                  <FaTrash className="mr-2" />
                  Remove
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="remove">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="remove">Remove Pages</TabsTrigger>
                  <TabsTrigger value="preview">Preview PDF</TabsTrigger>
                </TabsList>
                
                <TabsContent value="remove">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pageRange">Pages to Remove</Label>
                      <Input
                        id="pageRange"
                        value={pageRange}
                        onChange={handlePageRangeChange}
                        placeholder="e.g., 1-3, 5, 7-9"
                        disabled={isProcessing}
                      />
                      <p className="text-sm text-gray-500">
                        Enter individual pages or ranges of pages to remove (e.g., 1-3, 5, 7-9).<br />
                        Total pages: {numPages}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <Document
                      file={file}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="flex flex-col items-center"
                      loading={<p className="text-center py-4">Loading PDF...</p>}
                      error={<p className="text-center py-4 text-red-500">Error loading PDF</p>}
                    >
                      {numPages > 0 && (
                        <div className="overflow-auto max-h-[500px] w-full">
                          <Page 
                            pageNumber={1} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={1.0}
                            className="mx-auto"
                          />
                          {numPages > 1 && (
                            <p className="text-center text-gray-500 mt-2">
                              Showing first page. Document has {numPages} pages.
                            </p>
                          )}
                        </div>
                      )}
                    </Document>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              {isProcessing && (
                <div className="w-full space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-gray-500">Processing...</p>
                </div>
              )}
              
              <div className="flex justify-between items-center w-full">
                <Button
                  onClick={handleRemovePages}
                  disabled={isProcessing || !pageRange.trim()}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" />
                      Remove Pages
                    </>
                  )}
                </Button>
              </div>
              
              {downloadUrl && (
                <a
                  ref={downloadRef}
                  href={downloadUrl}
                  download={downloadFilename}
                  className="hidden"
                >
                  Download
                </a>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
} 