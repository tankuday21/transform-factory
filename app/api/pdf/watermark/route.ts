import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';
import formidable from 'formidable';
import { PassThrough } from 'stream';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/// Function to parse form data with files
const parseWatermarkForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
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
    const { fields, files } = await parseWatermarkForm(req);
    
    // Get the file buffer
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || !file.filepath) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get watermark parameters
    const watermarkText = Array.isArray(fields.watermarkText)
      ? fields.watermarkText[0]
      : (fields.watermarkText as unknown as string);

    const watermarkOpacity = Array.isArray(fields.watermarkOpacity)
      ? parseFloat(fields.watermarkOpacity[0])
      : parseFloat((fields.watermarkOpacity as unknown as string) || '0.5');

    const watermarkSize = Array.isArray(fields.watermarkSize)
      ? parseInt(fields.watermarkSize[0])
      : parseInt((fields.watermarkSize as unknown as string) || '50');

    const watermarkRotation = Array.isArray(fields.watermarkRotation)
      ? parseInt(fields.watermarkRotation[0])
      : parseInt((fields.watermarkRotation as unknown as string) || '-45');

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
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add watermark to each page
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = watermarkSize;

      // Draw watermark text
      page.drawText(watermarkText, {
        x: width / 2,
        y: height / 2,
        font: helveticaFont,
        size: fontSize,
        opacity: watermarkOpacity,
        color: rgb(0.5, 0.5, 0.5),
        rotate: degrees(watermarkRotation),
        xSkew: degrees(0),
        ySkew: degrees(0),
      });
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Return the watermarked PDF
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