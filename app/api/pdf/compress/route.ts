import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';

// Disable default body parsing
export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';

// Function to parse form data with files
const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

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
    const { fields, files } = await parseForm(req);
    
    // Get the uploaded PDF file
    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    
    if (!pdfFile || !pdfFile.originalFilename) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get compression options
    const quality = fields.quality ? 
      (Array.isArray(fields.quality) ? fields.quality[0] : fields.quality as string) : 
      'medium';
    
    // Calculate compression level based on quality setting
    let compressionFactor = 0.7; // default medium compression
    if (quality === 'low') {
      compressionFactor = 0.5; // more compression, lower quality
    } else if (quality === 'high') {
      compressionFactor = 0.9; // less compression, higher quality
    }
    
    // Read file as buffer
    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffer = Buffer.alloc(pdfFile.size);
      const stream = require('fs').createReadStream(pdfFile.filepath);
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
    
    // Get original file size for comparison
    const originalSize = fileBuffer.length;
    
    // This is a simplified compression approach since pdf-lib doesn't have direct compression controls
    // We'll create a new PDF document and copy pages with potentially compressed resources
    const compressedPdf = await PDFDocument.create();
    
    // Copy pages from original document
    const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => {
      compressedPdf.addPage(page);
    });
    
    // Save the PDF with options that may help with compression
    const compressedBytes = await compressedPdf.save({
      useObjectStreams: true, // This can help reduce file size
      addDefaultPage: false,
    });
    
    // Get compressed file size
    const compressedSize = compressedBytes.length;
    
    // Calculate compression percentage
    const savingsPercent = Math.round((1 - (compressedSize / originalSize)) * 100);
    
    // Return the compressed PDF and metadata
    return new NextResponse(compressedBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed.pdf"`,
        'X-Original-Size': originalSize.toString(),
        'X-Compressed-Size': compressedSize.toString(),
        'X-Savings-Percent': savingsPercent.toString(),
      },
    });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to compress PDF' },
      { status: 500 }
    );
  }
} 

