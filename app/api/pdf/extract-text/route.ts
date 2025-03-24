import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';
import * as pdfjs from 'pdfjs-dist';

// Set up the worker for pdf.js
const pdfjsWorker = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js');
if (typeof window === 'undefined') {
  // We're on the server
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to parse form data with files
const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB
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
    
    // Load the PDF document using pdf.js for text extraction
    const pdfData = new Uint8Array(fileBuffer);
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    
    const pageCount = pdfDoc.numPages;
    const extractedText: string[] = [];
    
    // Extract text from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      const pageText = strings.join(' ');
      extractedText.push(pageText);
    }
    
    // Combine text from all pages
    const fullText = extractedText.join('\n\n--- Page Break ---\n\n');
    
    // Determine the format to return
    const format = fields.format ? 
      (Array.isArray(fields.format) ? fields.format[0] : fields.format as string) : 
      'text';
    
    if (format === 'json') {
      return NextResponse.json({
        text: fullText,
        pages: extractedText,
        pageCount,
        filename: pdfFile.originalFilename,
      });
    } else {
      // Return as text file
      return new NextResponse(fullText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${pdfFile.originalFilename.replace('.pdf', '.txt')}"`,
        },
      });
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
} 