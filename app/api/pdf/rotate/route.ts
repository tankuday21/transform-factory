import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import os from 'os';
import { PDFDocument, RotationTypes } from 'pdf-lib';
import { join } from 'path';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      console.error('PDF rotation: No PDF file uploaded');
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get rotation options
    const rotationAngle = fields.rotationAngle && Array.isArray(fields.rotationAngle)
      ? parseInt(fields.rotationAngle[0])
      : parseInt((fields.rotationAngle as string | undefined) || '90'); // Default to 90 degrees

    const pageNumbers = fields.pageNumbers && Array.isArray(fields.pageNumbers)
      ? JSON.parse(fields.pageNumbers[0])
      : fields.pageNumbers ? JSON.parse(fields.pageNumbers as string) : []; // Default to empty array (all pages)

    const allPages = fields.allPages && Array.isArray(fields.allPages)
      ? fields.allPages[0] === 'true'
      : fields.allPages === 'true';

    try {
      // Read file as buffer
      const fileBuffer = await readFileAsBuffer(pdfFile.filepath, pdfFile.size);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Get page count
      const pageCount = pdfDoc.getPageCount();
      
      // Apply rotation to selected pages
      if (allPages) {
        // Rotate all pages
        for (let i = 0; i < pageCount; i++) {
          const page = pdfDoc.getPage(i);
          const currentRotation = page.getRotation().angle;
          const newRotation = (currentRotation + rotationAngle) % 360;
          page.setRotation({ type: RotationTypes.Degrees, angle: newRotation });
        }
      } else if (pageNumbers.length > 0) {
        // Rotate specific pages
        for (const pageNumber of pageNumbers) {
          if (pageNumber >= 1 && pageNumber <= pageCount) {
            const page = pdfDoc.getPage(pageNumber - 1);
            page.setRotation({
              type: RotationTypes.Degrees,
              angle: rotationAngle,
            });
          }
        }
      } else {
        // No pages selected, return error
        console.error('PDF rotation: No pages selected');
        return NextResponse.json(
          { error: 'No pages selected for rotation' },
          { status: 400 }
        );
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Return the PDF
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="rotated.pdf"`,
        },
      });
    } catch (error) {
      console.error('Error processing PDF file:', error);
      return NextResponse.json(
        { error: 'Failed to process the PDF file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error rotating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to rotate PDF' },
      { status: 500 }
    );
  }
} 

