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
  const outputOption = formData.get('outputOption') as string;

  return {
    pdf,
    pageRange: pageRange || '',
    outputOption: outputOption || 'single' // 'single' or 'multiple'
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
    const { pdf, pageRange, outputOption } = await parseForm(req);

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

    // Parse page ranges
    const pageNumbers: number[] = [];
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
          if (!pageNumbers.includes(i)) {
            pageNumbers.push(i);
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
        
        if (!pageNumbers.includes(pageNum)) {
          pageNumbers.push(pageNum);
        }
      }
    }
    
    // Sort page numbers
    pageNumbers.sort((a, b) => a - b);
    
    if (pageNumbers.length === 0) {
      return NextResponse.json(
        { error: 'No valid pages specified in page range' },
        { status: 400 }
      );
    }

    if (outputOption === 'multiple' && pageNumbers.length > 1) {
      // Create a zip archive for multiple PDFs
      const JSZip = require('jszip');
      const zip = new JSZip();
      
      // Extract each page as a separate PDF
      for (const pageNum of pageNumbers) {
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
        
        const pdfBytes = await newPdfDoc.save();
        const pageName = `page_${pageNum.toString().padStart(pageNumbers.length.toString().length, '0')}.pdf`;
        
        zip.file(pageName, pdfBytes);
      }
      
      // Generate the zip file
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '')}_pages.zip"`,
        },
      });
    } else {
      // Create a single PDF with all selected pages
      const newPdfDoc = await PDFDocument.create();
      
      // Copy the selected pages
      for (const pageNum of pageNumbers) {
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }
      
      // Save the PDF
      const pdfBytes = await newPdfDoc.save();
      
      // Generate a descriptive filename
      let filename = pdf.name.replace('.pdf', '');
      if (pageNumbers.length === 1) {
        filename += `_page${pageNumbers[0]}`;
      } else {
        filename += `_pages${pageNumbers.length}`;
      }
      filename += '.pdf';
      
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Error extracting PDF pages:', error);
    return NextResponse.json(
      { error: 'Failed to extract pages from PDF' },
      { status: 500 }
    );
  }
} 