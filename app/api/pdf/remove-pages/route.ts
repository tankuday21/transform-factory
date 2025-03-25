import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { parseSimpleForm } from '@/app/lib/parse-form';

// Disable body parser, we'll handle the form data manually
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Create a temp directory for processing if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'transform-factory-pdf');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Parse the form data
    const formData = await parseSimpleForm(req);
    const pdf = formData.pdf as File;
    const pageRange = formData.pageRange as string || '';

    // Check if PDF file is provided
    if (!pdf) {
      console.error('Remove pages: No PDF file provided');
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Check if page range is provided
    if (!pageRange || pageRange.trim() === '') {
      console.error('Remove pages: No page range provided');
      return NextResponse.json(
        { error: 'No page range provided' },
        { status: 400 }
      );
    }

    try {
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
            console.error(`Remove pages: Invalid page range: ${trimmedRange}`);
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
            console.error(`Remove pages: Invalid page number: ${trimmedRange}`);
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
        console.error('Remove pages: No valid pages specified');
        return NextResponse.json(
          { error: 'No valid pages specified to remove' },
          { status: 400 }
        );
      }

      if (pagesToRemove.length >= totalPages) {
        console.error('Remove pages: Cannot remove all pages');
        return NextResponse.json(
          { error: 'Cannot remove all pages from the PDF' },
          { status: 400 }
        );
      }

      try {
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
        console.error('Error creating PDF with removed pages:', error);
        return NextResponse.json(
          { error: 'Failed to create PDF with removed pages' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error processing PDF for page removal:', error);
      return NextResponse.json(
        { error: 'Failed to process PDF for page removal' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error removing PDF pages:', error);
    return NextResponse.json(
      { error: 'Failed to remove pages from PDF' },
      { status: 500 }
    );
  }
} 

