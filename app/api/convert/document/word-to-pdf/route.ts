import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const bodyStream = true;

// Parse form data
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  const document = formData.get('document') as File;
  const quality = formData.get('quality') as string || 'high';

  return { document, quality };
}

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const { document, quality } = await parseForm(req);

    // Check if the document exists
    if (!document) {
      return NextResponse.json(
        { error: 'No document provided' },
        { status: 400 }
      );
    }

    // Check if the file is a Word document
    const isWordFile = /\.(doc|docx)$/i.test(document.name);
    if (!isWordFile) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a Word document (.doc or .docx)' },
        { status: 400 }
      );
    }

    // Read the document file as buffer
    const buffer = Buffer.from(await document.arrayBuffer());

    // Create a temporary directory to store the input/output files
    const tempDir = path.join(os.tmpdir(), 'word-to-pdf-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write the document to the temp directory
    const inputPath = path.join(tempDir, document.name);
    await fs.writeFile(inputPath, buffer);

    // For demo purposes, we'll create a PDF using pdf-lib
    // In a real implementation, you would use a proper conversion library
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Set text color based on quality
    let textColor = rgb(0, 0, 0);
    
    // Add content to the PDF
    page.drawText(`Document: ${document.name}`, {
      x: 50,
      y: height - 50,
      size: 16,
      font,
      color: textColor,
    });
    
    page.drawText(`Conversion Quality: ${quality}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: textColor,
    });

    // Add some dummy content
    page.drawText('This is a PDF converted from a Word document.', {
      x: 50,
      y: height - 120,
      size: fontSize,
      font,
      color: textColor,
    });
    
    // Add more dummy text based on quality
    let qualityText = '';
    
    if (quality === 'high') {
      qualityText = 'High quality conversion preserves all formatting, styles, images, and text layout.';
    } else if (quality === 'medium') {
      qualityText = 'Medium quality conversion balances file size and formatting quality.';
    } else {
      qualityText = 'Low quality conversion prioritizes smaller file size over perfect formatting.';
    }
    
    page.drawText(qualityText, {
      x: 50,
      y: height - 150,
      size: fontSize,
      font,
      color: textColor,
    });
    
    // Add a "watermark" for demo purposes
    page.drawText('Transform Factory | Word to PDF Conversion', {
      x: 150,
      y: 100,
      size: 12,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.5,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Prepare the output filename
    const outputFilename = document.name.replace(/\.(doc|docx)$/i, '.pdf');
    
    // Clean up temporary directory
    try {
      await fs.unlink(inputPath);
      await fs.rmdir(tempDir);
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    return NextResponse.json(
      { error: 'An error occurred while converting the document' },
      { status: 500 }
    );
  }
} 

