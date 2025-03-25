import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';

// Route Handler Configuration
export const runtime = 'nodejs'; // Using nodejs runtime for file system operations
export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic
export const bodyParser = false; // Disable automatic body parsing for form data

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

      form.parse(passThrough as any, (err: any, fields: formidable.Fields, files: formidable.Files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  });
};

// Helper function to get position coordinates
const getPositionCoordinates = (position: string, pageWidth: number, pageHeight: number, textWidth: number, fontSize: number) => {
  let x: number, y: number;
  
  // Calculate margin based on font size
  const margin = fontSize;
  
  // Determine horizontal position
  if (position.includes('left')) {
    x = margin;
  } else if (position.includes('right')) {
    x = pageWidth - textWidth - margin;
  } else {
    // Center
    x = (pageWidth - textWidth) / 2;
  }
  
  // Determine vertical position
  if (position.includes('top')) {
    y = pageHeight - margin - fontSize;
  } else {
    // Bottom
    y = margin;
  }
  
  return { x, y };
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

    // Get options
    const startNumber = fields.startNumber ? parseInt(Array.isArray(fields.startNumber) ? fields.startNumber[0] : fields.startNumber as string, 10) || 1 : 1;
    const position = fields.position ? (Array.isArray(fields.position) ? fields.position[0] : fields.position as string) || 'bottom-center' : 'bottom-center';
    const prefix = fields.prefix ? (Array.isArray(fields.prefix) ? fields.prefix[0] : fields.prefix as string) || '' : '';
    const suffix = fields.suffix ? (Array.isArray(fields.suffix) ? fields.suffix[0] : fields.suffix as string) || '' : '';
    const fontSize = fields.fontSize ? parseInt(Array.isArray(fields.fontSize) ? fields.fontSize[0] : fields.fontSize as string, 10) || 12 : 12;

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
    
    // Embed the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Get pages
    const pages = pdfDoc.getPages();
    
    // Add page numbers to each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      // Calculate current page number
      const pageNumber = startNumber + i;
      
      // Create page number text
      const pageText = `${prefix}${pageNumber}${suffix}`;
      
      // Calculate text width
      const textWidth = font.widthOfTextAtSize(pageText, fontSize);
      
      // Get position coordinates
      const { x, y } = getPositionCoordinates(position, width, height, textWidth, fontSize);
      
      // Draw the page number
      page.drawText(pageText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="numbered.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error adding page numbers:', error);
    return NextResponse.json(
      { error: 'Failed to add page numbers to PDF' },
      { status: 500 }
    );
  }
} 