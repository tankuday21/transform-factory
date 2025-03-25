'use client'

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaFilePdf, FaDownload, FaTrash, FaSpinner } from 'react-icons/fa';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Progress } from '@/app/components/ui/progress';
import { Document, Page, pdfjs } from 'react-pdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ExtractPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('');
  const [outputOption, setOutputOption] = useState<'single' | 'multiple'>('single');
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
    // Default to first page
    setPageRange('1');
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
  
  // Extract pages from PDF
  const handleExtractPages = async () => {
    if (!file || !pageRange.trim()) {
      toast.error('Please upload a PDF and specify page range');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('pageRange', pageRange);
      formData.append('outputOption', outputOption);
      
      setProgress(30);
      
      const response = await fetch('/api/pdf/extract-pages', {
        method: 'POST',
        body: formData
      });
      
      setProgress(80);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract pages');
      }
      
      const blob = await response.blob();
      
      // Check if blob is empty or invalid
      if (!blob || blob.size === 0) {
        throw new Error('Received empty response from server');
      }
      
      const url = URL.createObjectURL(blob);
      
      // Get content-disposition header to extract filename
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'extracted_pages';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      if (blob.type === 'application/zip') {
        filename = filename.endsWith('.zip') ? filename : `${filename}.zip`;
      } else {
        filename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      }
      
      setDownloadUrl(url);
      setDownloadFilename(filename);
      setProgress(100);
      
      toast.success('Pages extracted successfully');
      
      // Trigger download automatically
      if (downloadRef.current) {
        downloadRef.current.click();
      }
    } catch (error) {
      console.error('Error extracting pages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract pages';
      toast.error(errorMessage);
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
        <h1 className="text-3xl font-bold mb-6 text-center">Extract Pages from PDF</h1>
        
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
              <Tabs defaultValue="extract">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="extract">Extract Pages</TabsTrigger>
                  <TabsTrigger value="preview">Preview PDF</TabsTrigger>
                </TabsList>
                
                <TabsContent value="extract">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pageRange">Page Range</Label>
                      <Input
                        id="pageRange"
                        value={pageRange}
                        onChange={handlePageRangeChange}
                        placeholder="e.g., 1-3, 5, 7-9"
                        disabled={isProcessing}
                      />
                      <p className="text-sm text-gray-500">
                        Enter individual pages or ranges (e.g., 1-3, 5, 7-9). Total pages: {numPages}
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label>Output Options</Label>
                      <RadioGroup 
                        value={outputOption} 
                        onValueChange={(value: string) => setOutputOption(value as 'single' | 'multiple')}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="single" id="single" />
                          <Label htmlFor="single" className="cursor-pointer">
                            Single PDF (All selected pages in one file)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple" id="multiple" />
                          <Label htmlFor="multiple" className="cursor-pointer">
                            Multiple PDFs (One file per page, as ZIP archive)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview">
                  <div className="border rounded-lg p-4">
                    <Document
                      file={file}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="flex justify-center"
                    >
                      <Page pageNumber={1} />
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
                  onClick={handleExtractPages}
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
                      Extract Pages
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