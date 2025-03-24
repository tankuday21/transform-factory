import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
      maxFileSize: 15 * 1024 * 1024, // 15MB
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

    // Get the signature image file
    const signatureFile = Array.isArray(files.signature) ? files.signature[0] : files.signature;

    if (!signatureFile || !signatureFile.originalFilename) {
      return NextResponse.json(
        { error: 'No signature image uploaded' },
        { status: 400 }
      );
    }

    // Get signature options
    const pageNumber = fields.pageNumber ? parseInt(Array.isArray(fields.pageNumber) ? fields.pageNumber[0] : fields.pageNumber as string) : 1;
    const posX = fields.posX ? parseFloat(Array.isArray(fields.posX) ? fields.posX[0] : fields.posX as string) : 50;
    const posY = fields.posY ? parseFloat(Array.isArray(fields.posY) ? fields.posY[0] : fields.posY as string) : 50;
    const width = fields.width ? parseFloat(Array.isArray(fields.width) ? fields.width[0] : fields.width as string) : 150;
    const includeDate = fields.includeDate ? (Array.isArray(fields.includeDate) ? fields.includeDate[0] === 'true' : fields.includeDate === 'true') : false;
    
    // Read PDF file as buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
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
    
    // Read signature image file as buffer
    const signatureBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffer = Buffer.alloc(signatureFile.size);
      const stream = require('fs').createReadStream(signatureFile.filepath);
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
    
    // Determine if it's PNG or JPEG
    const isPNG = signatureFile.originalFilename.toLowerCase().endsWith('.png');
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Get pages - ensure page number is valid
    const pages = pdfDoc.getPages();
    const pageIndex = Math.min(Math.max(0, pageNumber - 1), pages.length - 1);
    const page = pages[pageIndex];
    
    // Embed the signature image
    let signatureImage;
    if (isPNG) {
      signatureImage = await pdfDoc.embedPng(signatureBuffer);
    } else {
      signatureImage = await pdfDoc.embedJpg(signatureBuffer);
    }
    
    // Calculate dimensions
    const imgDims = signatureImage.scale(1);
    const scaleFactor = width / imgDims.width;
    const scaledHeight = imgDims.height * scaleFactor;
    
    // Draw signature on the page
    page.drawImage(signatureImage, {
      x: posX,
      y: posY,
      width: width,
      height: scaledHeight,
    });
    
    // Add date if requested
    if (includeDate) {
      // Embed font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Get current date
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      
      // Draw date text below signature
      page.drawText(`Date: ${dateStr}`, {
        x: posX,
        y: posY - 20, // Position below signature
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the signed PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="signed.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error signing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to sign PDF' },
      { status: 500 }
    );
  }
} 