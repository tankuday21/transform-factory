import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';

// Disable default body parsing
export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';

// Redaction area interface
interface RedactionArea {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

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

    // Parse redaction areas from the request
    const redactionAreas = fields.redactionAreas ? 
      JSON.parse(Array.isArray(fields.redactionAreas) ? fields.redactionAreas[0] : fields.redactionAreas as string) as RedactionArea[] : 
      [];

    if (redactionAreas.length === 0) {
      return NextResponse.json(
        { error: 'No redaction areas provided' },
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
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Get redaction color from fields or use default black
    const redactionColor = fields.redactionColor ? 
      (Array.isArray(fields.redactionColor) ? fields.redactionColor[0] : fields.redactionColor as string) : 
      'black';
    
    // Map color name to RGB values
    const colorMap: Record<string, [number, number, number]> = {
      'black': [0, 0, 0],
      'red': [1, 0, 0],
      'blue': [0, 0, 1],
      'green': [0, 0.5, 0],
      'gray': [0.5, 0.5, 0.5]
    };
    
    // Get RGB color values (default to black if unknown color)
    const [r, g, b] = colorMap[redactionColor] || colorMap['black'];
    
    // Process each redaction area
    for (const area of redactionAreas) {
      const pageIndex = area.page - 1; // Convert 1-indexed to 0-indexed
      const page = pdfDoc.getPages()[pageIndex];
      
      if (!page) {
        console.warn(`Page ${area.page} not found, skipping redaction.`);
        continue;
      }
      
      // The PDF coordinate system starts from the bottom-left
      // Convert from top-left coordinates to bottom-left
      const pageHeight = page.getHeight();
      const yPos = pageHeight - area.y - area.height;
      
      // Draw a filled rectangle over the redaction area
      page.drawRectangle({
        x: area.x,
        y: yPos,
        width: area.width,
        height: area.height,
        color: rgb(r, g, b),
        opacity: 1,
        borderWidth: 0,
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the redacted PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="redacted.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error redacting PDF:', error);
    return NextResponse.json(
      { error: 'Failed to redact PDF' },
      { status: 500 }
    );
  }
} 

