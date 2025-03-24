import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Disable body parser, we'll handle the form data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to parse form data including file uploads
const parseForm = async (req: NextRequest) => {
  const formData = await req.formData();
  const pdf = formData.get('pdf') as File;
  const pageRange = formData.get('pageRange') as string;

  return {
    pdf,
    pageRange: pageRange || '',
  };
};

export async function POST(req: NextRequest) {
  try {
    // Create a temp directory for processing if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'transform-factory-pdf');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Parse the form data
    const { pdf, pageRange } = await parseForm(req);

    // Check if PDF file is provided
    if (!pdf) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Check if page range is provided
    if (!pageRange || pageRange.trim() === '') {
      return NextResponse.json(
        { error: 'No page range provided' },
        { status: 400 }
      );
    }

    // Read the PDF file as buffer
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    // Load the original PDF
    const originalPdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = originalPdfDoc.getPageCount();

    // Parse page ranges to determine which pages to remove
    const pagesToRemove: number[] = [];
    const ranges = pageRange.split(',');
    
    for (const range of ranges) {
      const trimmedRange = range.trim();
      
      if (trimmedRange.includes('-')) {
        // It's a range like '1-5'
        const [start, end] = trimmedRange.split('-').map(n => parseInt(n.trim()));
        
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          return NextResponse.json(
            { error: `Invalid page range: ${trimmedRange}. Pages must be between 1 and ${totalPages}.` },
            { status: 400 }
          );
        }
        
        for (let i = start; i <= end; i++) {
          if (!pagesToRemove.includes(i)) {
            pagesToRemove.push(i);
          }
        }
      } else {
        // It's a single page like '3'
        const pageNum = parseInt(trimmedRange);
        
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          return NextResponse.json(
            { error: `Invalid page number: ${trimmedRange}. Pages must be between 1 and ${totalPages}.` },
            { status: 400 }
          );
        }
        
        if (!pagesToRemove.includes(pageNum)) {
          pagesToRemove.push(pageNum);
        }
      }
    }
    
    // Sort page numbers to remove
    pagesToRemove.sort((a, b) => a - b);
    
    if (pagesToRemove.length === 0) {
      return NextResponse.json(
        { error: 'No valid pages specified to remove' },
        { status: 400 }
      );
    }

    if (pagesToRemove.length >= totalPages) {
      return NextResponse.json(
        { error: 'Cannot remove all pages from the PDF' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Copy only the pages that are not in the pagesToRemove array
    for (let i = 0; i < totalPages; i++) {
      // PDF pages are 0-indexed in pdf-lib, but user input is 1-indexed
      const pageNum = i + 1;
      
      if (!pagesToRemove.includes(pageNum)) {
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
    }
    
    // Save the PDF
    const pdfBytes = await newPdfDoc.save();
    
    // Generate a descriptive filename
    let filename = pdf.name.replace('.pdf', '');
    if (pagesToRemove.length === 1) {
      filename += `_removed_page${pagesToRemove[0]}`;
    } else {
      filename += `_removed_${pagesToRemove.length}_pages`;
    }
    filename += '.pdf';
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error removing PDF pages:', error);
    return NextResponse.json(
      { error: 'Failed to remove pages from PDF' },
      { status: 500 }
    );
  }
} 
