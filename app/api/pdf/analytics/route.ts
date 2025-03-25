import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PDFDocument } from 'pdf-lib';

// Configuration for the API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Parse the form data
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  return { file };
}

export async function POST(req: NextRequest) {
  try {
    const startTime = performance.now();
    
    // Parse form data
    const { file } = await parseForm(req);
    
    // Create temporary directory for file processing
    const tempDir = path.join(os.tmpdir(), 'pdf-analytics-' + Date.now());
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    try {
      // Write file to temp directory
      const filePath = path.join(tempDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, fileBuffer);
      
      // Load the PDF and extract information
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Get basic document info
      const pageCount = pdfDoc.getPageCount();
      const fileSize = formatFileSize(file.size);
      
      // In a real-world implementation, you would use a library to extract
      // more detailed information from the PDF. For this demo, we'll simulate some results.
      
      // Get document metadata (handling possible undefined values)
      const title = pdfDoc.getTitle() || 'Untitled';
      const author = pdfDoc.getAuthor() || 'Unknown';
      const subject = pdfDoc.getSubject() || '';
      const keywordsString = pdfDoc.getKeywords() || '';
      const keywords = keywordsString ? keywordsString.split(',').map(k => k.trim()) : [];
      
      // Handle date values safely
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();
      const createdDateFormatted = creationDate ? formatDate(creationDate) : 'Unknown';
      const modifiedDateFormatted = modificationDate ? formatDate(modificationDate) : 'Unknown';
      
      // Calculate simulated word count based on page count
      // In a real implementation, you would extract and count actual words
      const wordCount = simulateWordCount(pageCount);
      
      // Simulate image count and other stats based on the file size and page count
      const imageCount = simulateImageCount(file.size, pageCount);
      const fontCount = simulateFontCount(pageCount);
      
      // Check if the document is encrypted
      const isEncrypted = false; // In a real implementation, check PDF encryption status
      
      // Additional properties (simulated for this demo)
      const hasSignature = Math.random() > 0.7; // 30% chance of having a signature
      const isSearchable = Math.random() > 0.2; // 80% chance of being searchable
      const hasBookmarks = Math.random() > 0.5; // 50% chance of having bookmarks
      
      // Calculate processing time
      const endTime = performance.now();
      const processingTime = ((endTime - startTime) / 1000).toFixed(2) + ' seconds';
      
      // Create analytics object
      const analytics = {
        pageCount,
        fileSize,
        wordCount,
        imageCount,
        fontCount,
        author,
        title,
        subject,
        keywords,
        createdDate: createdDateFormatted,
        modifiedDate: modifiedDateFormatted,
        isEncrypted,
        hasSignature,
        isSearchable,
        hasBookmarks,
        processingTime,
      };
      
      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
      
      // Return the analytics data
      return NextResponse.json(analytics);
    } catch (error) {
      // Clean up on error
      if (existsSync(tempDir)) {
        await rm(tempDir, { recursive: true, force: true });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error analyzing PDF:', error);
    
    return NextResponse.json(
      { error: 'Failed to analyze PDF: ' + error.message },
      { status: 500 }
    );
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to simulate word count based on page count
function simulateWordCount(pageCount: number): number {
  // Assume average of 250-500 words per page
  const wordsPerPage = Math.floor(Math.random() * 250) + 250;
  return pageCount * wordsPerPage;
}

// Helper function to simulate image count based on file size and page count
function simulateImageCount(fileSize: number, pageCount: number): number {
  // Assume larger files and more pages might have more images
  // This is a simplified simulation
  const fileSizeFactor = Math.min(10, Math.floor(fileSize / (1024 * 1024)));
  return Math.min(pageCount * 2, Math.floor(Math.random() * (fileSizeFactor + 1)) + Math.floor(pageCount / 2));
}

// Helper function to simulate font count
function simulateFontCount(pageCount: number): number {
  // Most documents use 2-6 fonts
  return Math.min(8, Math.max(1, Math.floor(Math.random() * 4) + 2));
} 

