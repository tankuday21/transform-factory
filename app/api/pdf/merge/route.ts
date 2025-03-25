import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';
import os from 'os';

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

    const chunks: Buffer[] = [];
    req.arrayBuffer().then((arrayBuffer) => {
      // Convert arrayBuffer to buffer
      const buffer = Buffer.from(arrayBuffer);

      // Create a PassThrough stream
      const passThrough = new PassThrough();
      passThrough.end(buffer);

      form.parse(passThrough as any, (err: any, fields: formidable.Fields, files: formidable.Files) => {
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
    const { files } = await parseForm(req);
    
    // Get the file buffers
    const pdfFiles = Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs];
    
    if (!pdfFiles || pdfFiles.length < 1 || !pdfFiles[0]) {
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
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
          const buffer = Buffer.alloc(file.size);
          const stream = require('fs').createReadStream(file.filepath);
          let pos = 0;
          
          stream.on('data', (chunk: Buffer) => {
            chunk.copy(buffer, pos);
            pos += chunk.length;
          });
          
          stream.on('end', () => {
            resolve(buffer);
          });
          
          stream.on('error', (err: Error) => {
            reject(err);
          });
        });
        
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
    console.error('Error merging PDFs:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDFs' },
      { status: 500 }
    );
  }
} 

