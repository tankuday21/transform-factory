import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';
import { Readable } from 'stream';
import { Blob } from 'buffer';
import JSZip from 'jszip';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Function to parse form data with files
const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    req.arrayBuffer().then((arrayBuffer) => {
      // Convert arrayBuffer to buffer
      const buffer = Buffer.from(arrayBuffer);

      // Create a PassThrough stream
      const passThrough = new PassThrough();
      passThrough.end(buffer);

      form.parse(passThrough, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  });
};

export async function POST(req: NextRequest) {
  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Parse the form data
    const { fields, files } = await parseForm(req);
    
    // Get the uploaded PDF file
    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    
    if (!pdfFile || !pdfFile.filepath) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get split method and parameters
    const splitMethod = fields.splitMethod as string;
    
    // Read the PDF file
    const fileBuffer = await pdfFile.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Initialize ZIP to store split PDFs
    const zip = new JSZip();
    
    if (splitMethod === 'single') {
      // Split by single pages - one PDF per page
      for (let i = 0; i < pageCount; i++) {
        // Create a new PDF document
        const newPdf = await PDFDocument.create();
        
        // Copy the page
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        
        // Save the new PDF
        const newPdfBytes = await newPdf.save();
        
        // Add to ZIP
        zip.file(`page_${i + 1}.pdf`, newPdfBytes);
      }
    } else if (splitMethod === 'range') {
      // Get range parameters
      const ranges = JSON.parse(fields.ranges as string || '[]');
      
      // Process each range
      for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
        const range = ranges[rangeIndex];
        const { start, end } = range;
        
        // Validate page range
        if (start < 1 || end > pageCount || start > end) {
          continue;
        }
        
        // Convert to zero-based indices
        const startIndex = start - 1;
        const endIndex = end - 1;
        
        // Create a new PDF document
        const newPdf = await PDFDocument.create();
        
        // Copy the pages
        const pageIndices = Array.from(
          { length: endIndex - startIndex + 1 },
          (_, i) => startIndex + i
        );
        
        const pages = await newPdf.copyPages(pdfDoc, pageIndices);
        
        // Add the pages to the new PDF
        for (const page of pages) {
          newPdf.addPage(page);
        }
        
        // Save the new PDF
        const newPdfBytes = await newPdf.save();
        
        // Add to ZIP
        zip.file(`range_${start}-${end}.pdf`, newPdfBytes);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid split method' },
        { status: 400 }
      );
    }
    
    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="split_pdfs.zip"`,
      },
    });
  } catch (error) {
    console.error('Error splitting PDF:', error);
    return NextResponse.json(
      { error: 'Failed to split PDF' },
      { status: 500 }
    );
  }
} 

