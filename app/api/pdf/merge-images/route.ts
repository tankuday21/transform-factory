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

/// Function to parse form data with files
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
    const images = Array.isArray(files.images) ? files.images : [files.images];
    
    if (!images || images.length < 1 || !images[0]) {
      return NextResponse.json(
        { error: 'No image files uploaded' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Process each image file
    for (const image of images) {
      if (!image || !image.filepath) continue;
      
      try {
        // Read file as buffer
        const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
          const buffer = Buffer.alloc(image.size);
          const stream = require('fs').createReadStream(image.filepath);
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
        
        // Create a new page
        const page = pdfDoc.addPage();
        
        // Embed the image
        let pdfImage;
        const imageType = image.mimetype?.toLowerCase() || '';
        if (imageType.includes('jpeg') || imageType.includes('jpg')) {
          pdfImage = await pdfDoc.embedJpg(imageBuffer);
        } else if (imageType.includes('png')) {
          pdfImage = await pdfDoc.embedPng(imageBuffer);
        } else {
          console.warn(`Unsupported image type: ${imageType}`);
          continue;
        }
        
        // Get page dimensions
        const { width, height } = page.getSize();
        
        // Calculate scaling to fit the image within the page while maintaining aspect ratio
        const imageRatio = pdfImage.width / pdfImage.height;
        const pageRatio = width / height;
        
        let scaledWidth = width;
        let scaledHeight = height;
        
        if (imageRatio > pageRatio) {
          // Image is wider than the page ratio
          scaledHeight = width / imageRatio;
        } else {
          // Image is taller than the page ratio
          scaledWidth = height * imageRatio;
        }
        
        // Calculate position to center the image
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        // Draw the image
        page.drawImage(pdfImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      } catch (error) {
        console.error(`Error processing file ${image.originalFilename}:`, error);
      }
    }
    
    // Save the PDF as a buffer
    const pdfBuffer = await pdfDoc.save();
    
    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="images.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error creating PDF from images:', error);
    return NextResponse.json(
      { error: 'Failed to create PDF from images' },
      { status: 500 }
    );
  }
}