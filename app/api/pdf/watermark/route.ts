import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';
import fontkit from '@pdf-lib/fontkit';

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
    
    if (!pdfFile || !pdfFile.filepath) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get watermark options
    const watermarkText = Array.isArray(fields.watermarkText) 
      ? fields.watermarkText[0] 
      : fields.watermarkText as string;

    const watermarkOpacity = Array.isArray(fields.watermarkOpacity) 
      ? parseFloat(fields.watermarkOpacity[0]) 
      : parseFloat(fields.watermarkOpacity as string) || 0.3;

    const watermarkPosition = Array.isArray(fields.watermarkPosition) 
      ? fields.watermarkPosition[0] 
      : fields.watermarkPosition as string || 'center';

    const watermarkSize = Array.isArray(fields.watermarkSize) 
      ? parseInt(fields.watermarkSize[0]) 
      : parseInt(fields.watermarkSize as string) || 50;

    const watermarkRotation = Array.isArray(fields.watermarkRotation) 
      ? parseInt(fields.watermarkRotation[0]) 
      : parseInt(fields.watermarkRotation as string) || 45;
    
    if (!watermarkText) {
      return NextResponse.json(
        { error: 'Watermark text is required' },
        { status: 400 }
      );
    }

    // Read the PDF file
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
    const pdfDoc = await PDFDocument.create();
    
    // Register fontkit
    pdfDoc.registerFontkit(fontkit);
    
    // Load the PDF
    const originalPdf = await PDFDocument.load(fileBuffer);
    
    // Get the number of pages
    const pageCount = originalPdf.getPageCount();
    
    // Copy all pages from the original PDF
    const pages = await pdfDoc.copyPages(originalPdf, originalPdf.getPageIndices());
    pages.forEach(page => pdfDoc.addPage(page));
    
    // Embed the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add watermark to each page
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Set text properties
      const textWidth = font.widthOfTextAtSize(watermarkText, watermarkSize);
      const textHeight = font.heightAtSize(watermarkSize);
      
      // Calculate position
      let x = width / 2 - textWidth / 2;
      let y = height / 2 - textHeight / 2;
      
      // Adjust based on position
      switch (watermarkPosition) {
        case 'topLeft':
          x = 50;
          y = height - 50;
          break;
        case 'topCenter':
          x = width / 2 - textWidth / 2;
          y = height - 50;
          break;
        case 'topRight':
          x = width - textWidth - 50;
          y = height - 50;
          break;
        case 'centerLeft':
          x = 50;
          y = height / 2;
          break;
        case 'center':
          // Default
          break;
        case 'centerRight':
          x = width - textWidth - 50;
          y = height / 2;
          break;
        case 'bottomLeft':
          x = 50;
          y = 50;
          break;
        case 'bottomCenter':
          x = width / 2 - textWidth / 2;
          y = 50;
          break;
        case 'bottomRight':
          x = width - textWidth - 50;
          y = 50;
          break;
      }
      
      // Draw the watermark text with rotation
      page.drawText(watermarkText, {
        x,
        y,
        size: watermarkSize,
        font,
        color: rgb(0, 0, 0).setAlpha(watermarkOpacity),
        rotate: degrees(watermarkRotation),
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="watermarked.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error adding watermark to PDF:', error);
    return NextResponse.json(
      { error: 'Failed to add watermark to PDF' },
      { status: 500 }
    );
  }
} 

