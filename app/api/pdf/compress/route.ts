import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';

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
      maxFileSize: 50 * 1024 * 1024, // 50MB for larger PDFs
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

    // Get compression level
    const compressionLevel = fields.compressionLevel ? 
      (Array.isArray(fields.compressionLevel) ? fields.compressionLevel[0] : fields.compressionLevel as string) : 
      'medium';

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
    
    // Original file size for comparison
    const originalSize = fileBuffer.length;
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Apply compression strategy based on selected level
    const compressOptions: {
      [key: string]: {
        useObjectStreams: boolean;
        objectsPerStream?: number;
        useStreamCompression?: boolean;
      }
    } = {
      low: {
        useObjectStreams: true,
        objectsPerStream: 50,
        useStreamCompression: true,
      },
      medium: {
        useObjectStreams: true,
        objectsPerStream: 100,
        useStreamCompression: true,
      },
      high: {
        useObjectStreams: true,
        objectsPerStream: 200,
        useStreamCompression: true,
      }
    };
    
    // Apply compression options
    const options = compressOptions[compressionLevel] || compressOptions.medium;
    
    // Save the PDF with compression options
    const pdfBytes = await pdfDoc.save(options);
    
    // Calculate compression ratio for response headers
    const newSize = pdfBytes.length;
    const compressionRatio = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    // Return the compressed PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed.pdf"`,
        'X-Compression-Ratio': compressionRatio,
        'X-Original-Size': originalSize.toString(),
        'X-New-Size': newSize.toString(),
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