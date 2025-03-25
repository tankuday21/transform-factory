import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { parseSimpleForm } from '@/app/lib/parse-form';

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
    const formData = await parseSimpleForm(req);
    
    // Get the uploaded images
    const images = formData.images as File[];
    
    // Check if we have a File array or a single File
    const imageFiles = Array.isArray(images) ? images : [images];
    
    if (!imageFiles || imageFiles.length < 1 || !imageFiles[0]) {
      console.error('scan: No image files uploaded');
      return NextResponse.json(
        { error: 'No image files uploaded' },
        { status: 400 }
      );
    }

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Process each image file
      for (const image of imageFiles) {
        try {
          // Read image as buffer
          const imageBuffer = Buffer.from(await image.arrayBuffer());
          
          // Create a new page
          const page = pdfDoc.addPage();
          
          // Embed the image
          let pdfImage;
          const imageType = image.type?.toLowerCase() || '';
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
          console.error(`Error processing image file ${image.name}:`, error);
          // Continue with other images
        }
      }
      
      // Check if we have any pages
      if (pdfDoc.getPageCount() === 0) {
        console.error('scan: No valid images to convert to PDF');
        return NextResponse.json(
          { error: 'No valid images to convert to PDF' },
          { status: 400 }
        );
      }
      
      // Save the PDF as a buffer
      const pdfBuffer = await pdfDoc.save();
      
      // Return the PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="scan.pdf"`,
        },
      });
    } catch (pdfError) {
      console.error('Error creating PDF document:', pdfError);
      return NextResponse.json(
        { error: 'Failed to create PDF from images' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating PDF from scanned images:', error);
    return NextResponse.json(
      { error: 'Failed to create PDF from scanned images' },
      { status: 500 }
    );
  }
}