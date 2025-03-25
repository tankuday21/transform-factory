import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Parse the form data
    const { files } = await parseForm(req);
    
    // Get the file buffers
    const pdfFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];
    
    if (!pdfFiles || pdfFiles.length < 1 || !pdfFiles[0]) {
      console.error('PDF merge: No PDF files uploaded');
      return NextResponse.json(
        { error: 'No PDF files uploaded' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each PDF file
    for (const file of pdfFiles) {
      if (!file || !file.filepath) continue;
      
      try {
        // Read file as buffer
        const fileBuffer = await readFileAsBuffer(file.filepath, file.size);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(fileBuffer);
        
        // Copy all pages from the source PDF to the merged PDF
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        // Add each page to the merged PDF
        for (const page of pages) {
          mergedPdf.addPage(page);
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalFilename}:`, error);
      }
    }
    
    // Check if any pages were added
    if (mergedPdf.getPageCount() === 0) {
      console.error('PDF merge: No valid pages to merge');
      return NextResponse.json(
        { error: 'No valid PDF files to merge' },
        { status: 400 }
      );
    }
    
    try {
      // Save the merged PDF as a buffer
      const mergedPdfBuffer = await mergedPdf.save();
      
      // Return the merged PDF
      return new NextResponse(mergedPdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="merged.pdf"`,
        },
      });
    } catch (error) {
      console.error('Error saving merged PDF:', error);
      return NextResponse.json(
        { error: 'Failed to save merged PDF' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error merging PDFs:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDFs' },
      { status: 500 }
    );
  }
} 

