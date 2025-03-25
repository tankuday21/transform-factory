import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/ Function to parse form data with files
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
    const { fields, files } = await parseForm(req);
    
    // Get the file buffer
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || !file.filepath) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get split method from fields
    const splitMethod = Array.isArray(fields.splitMethod)
      ? fields.splitMethod[0]
      : (fields.splitMethod as unknown as string) || 'single';

    // Read the PDF file
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
    const numPages = pdfDoc.getPageCount();

    if (numPages === 0) {
      return NextResponse.json(
        { error: 'PDF file is empty' },
        { status: 400 }
      );
    }

    // Create a new PDF for each page
    const pdfBuffers: Buffer[] = [];

    for (let i = 0; i < numPages; i++) {
      const newPdfDoc = await PDFDocument.create();
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
      const pdfBytes = await newPdfDoc.save();
      pdfBuffers.push(Buffer.from(pdfBytes));
    }

    // Return the split PDFs
    return new NextResponse(pdfBuffers[0], {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="split.pdf"`,
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