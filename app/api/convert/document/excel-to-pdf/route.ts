import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Parse form data
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  const spreadsheet = formData.get('spreadsheet') as File;
  const quality = formData.get('quality') as string || 'high';
  const includeGridlines = formData.get('includeGridlines') === 'true';
  const fitToPage = formData.get('fitToPage') === 'true';

  return { spreadsheet, quality, includeGridlines, fitToPage };
}

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const { spreadsheet, quality, includeGridlines, fitToPage } = await parseForm(req);

    // Check if the spreadsheet exists
    if (!spreadsheet) {
      return NextResponse.json(
        { error: 'No spreadsheet provided' },
        { status: 400 }
      );
    }

    // Check if the file is an Excel spreadsheet
    const isExcelFile = /\.(xls|xlsx|csv)$/i.test(spreadsheet.name);
    if (!isExcelFile) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload an Excel spreadsheet (.xls, .xlsx, .csv)' },
        { status: 400 }
      );
    }

    // Read the spreadsheet file as buffer
    const buffer = Buffer.from(await spreadsheet.arrayBuffer());

    // Create a temporary directory to store the input/output files
    const tempDir = path.join(os.tmpdir(), 'excel-to-pdf-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write the spreadsheet to the temp directory
    const inputPath = path.join(tempDir, spreadsheet.name);
    await fs.writeFile(inputPath, buffer);

    // For demo purposes, we'll create a PDF using pdf-lib
    // In a real implementation, you would use a proper conversion library
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;

    // Set text color based on quality
    let textColor = rgb(0, 0, 0);
    
    // Add header with the original spreadsheet name
    page.drawText(`Spreadsheet: ${spreadsheet.name}`, {
      x: 50,
      y: height - 50,
      size: 16,
      font: boldFont,
      color: textColor,
    });
    
    page.drawText(`Conversion Quality: ${quality} | Gridlines: ${includeGridlines ? 'Yes' : 'No'} | Fit to Page: ${fitToPage ? 'Yes' : 'No'}`, {
      x: 50,
      y: height - 80,
      size: 10,
      font,
      color: textColor,
    });

    // Create a simple spreadsheet mockup with gridlines
    const cellWidth = 100;
    const cellHeight = 30;
    const startX = 50;
    const startY = height - 120;
    const rows = 10;
    const cols = 7;
    
    // Draw table header
    for (let col = 0; col < cols; col++) {
      // Draw header cell background
      page.drawRectangle({
        x: startX + col * cellWidth,
        y: startY,
        width: cellWidth,
        height: cellHeight,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: includeGridlines ? rgb(0.7, 0.7, 0.7) : undefined,
        borderWidth: includeGridlines ? 1 : 0,
      });
      
      // Draw header text (A, B, C, etc.)
      const colLetter = String.fromCharCode(65 + col);
      page.drawText(colLetter, {
        x: startX + col * cellWidth + cellWidth / 2 - 5,
        y: startY + cellHeight / 2 - 5,
        size: 12,
        font: boldFont,
        color: textColor,
      });
    }
    
    // Draw table rows
    for (let row = 0; row < rows; row++) {
      // Row header
      page.drawRectangle({
        x: startX - 30,
        y: startY - (row + 1) * cellHeight,
        width: 30,
        height: cellHeight,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: includeGridlines ? rgb(0.7, 0.7, 0.7) : undefined,
        borderWidth: includeGridlines ? 1 : 0,
      });
      
      page.drawText((row + 1).toString(), {
        x: startX - 20,
        y: startY - (row + 1) * cellHeight + cellHeight / 2 - 5,
        size: 10,
        font: boldFont,
        color: textColor,
      });
      
      for (let col = 0; col < cols; col++) {
        // Draw cell
        page.drawRectangle({
          x: startX + col * cellWidth,
          y: startY - (row + 1) * cellHeight,
          width: cellWidth,
          height: cellHeight,
          color: rgb(1, 1, 1), // White
          borderColor: includeGridlines ? rgb(0.7, 0.7, 0.7) : undefined,
          borderWidth: includeGridlines ? 1 : 0,
        });
        
        // Add some sample data for demonstration
        if (row === 0 && col === 0) {
          page.drawText("Sample Data", {
            x: startX + col * cellWidth + 5,
            y: startY - (row + 1) * cellHeight + cellHeight / 2 - 5,
            size: fontSize,
            font,
            color: textColor,
          });
        } else if (row === 1 && col === 1) {
          page.drawText("123.45", {
            x: startX + col * cellWidth + 5,
            y: startY - (row + 1) * cellHeight + cellHeight / 2 - 5,
            size: fontSize,
            font,
            color: textColor,
          });
        } else if (row === 2 && col === 2) {
          page.drawText("2023-01-15", {
            x: startX + col * cellWidth + 5,
            y: startY - (row + 1) * cellHeight + cellHeight / 2 - 5,
            size: fontSize,
            font,
            color: textColor,
          });
        }
      }
    }
    
    // Add conversion notes
    page.drawText('Note: This is a demonstration of Excel to PDF conversion.', {
      x: 50,
      y: 100,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText('In a production environment, all data, formulas, and formatting would be preserved.', {
      x: 50,
      y: 80,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add a "watermark" for demo purposes
    page.drawText('Transform Factory | Excel to PDF Conversion', {
      x: 250,
      y: 50,
      size: 12,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.5,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Prepare the output filename
    const outputFilename = spreadsheet.name.replace(/\.(xls|xlsx|csv)$/i, '.pdf');
    
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
    console.error('Error converting Excel to PDF:', error);
    return NextResponse.json(
      { error: 'An error occurred while converting the spreadsheet' },
      { status: 500 }
    );
  }
} 

