import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const bodyStream = true;

// Parse the form data from the request
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  
  const htmlFile = formData.get('htmlFile') as File | null;
  const htmlContent = formData.get('htmlContent') as string | null;
  const includeStyles = formData.get('includeStyles') === 'true';
  const pageSize = formData.get('pageSize') as string || 'a4';
  const margins = formData.get('margins') as string || 'normal';

  return {
    htmlFile,
    htmlContent,
    includeStyles,
    pageSize,
    margins,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const { htmlFile, htmlContent, includeStyles, pageSize, margins } = await parseForm(req);

    // Validate input: at least one of htmlFile or htmlContent must be provided
    if (!htmlFile && !htmlContent) {
      return NextResponse.json(
        { error: 'Either an HTML file or HTML content must be provided' },
        { status: 400 }
      );
    }

    // Create a temporary directory to store files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'html-to-pdf-'));
    let htmlFilePath: string | null = null;

    // If an HTML file was uploaded, save it to the temp directory
    if (htmlFile) {
      const buffer = Buffer.from(await htmlFile.arrayBuffer());
      htmlFilePath = path.join(tempDir, htmlFile.name);
      fs.writeFileSync(htmlFilePath, buffer);
    }

    // For actual implementation, you would use a library like puppeteer or wkhtmltopdf
    // For this demo, we'll create a simple PDF that simulates the conversion

    // Determine page dimensions based on selected size
    let width = 595; // A4 width in points (default)
    let height = 842; // A4 height in points (default)

    switch (pageSize) {
      case 'letter':
        width = 612;
        height = 792;
        break;
      case 'legal':
        width = 612;
        height = 1008;
        break;
      case 'tabloid':
        width = 792;
        height = 1224;
        break;
      case 'a3':
        width = 842;
        height = 1191;
        break;
      case 'a5':
        width = 420;
        height = 595;
        break;
      // A4 is default
    }

    // Determine margins based on selection
    let marginSize = 50; // Normal margins by default
    switch (margins) {
      case 'narrow':
        marginSize = 25;
        break;
      case 'wide':
        marginSize = 75;
        break;
      case 'none':
        marginSize = 10; // Minimal margin for readability
        break;
      // Normal is default
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([width, height]);
    
    // Add fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    // Set drawing parameters
    const { width: pageWidth, height: pageHeight } = page.getSize();
    
    // Add a title
    page.drawText('HTML to PDF Conversion', {
      x: marginSize,
      y: pageHeight - marginSize,
      font: helveticaBold,
      size: 24,
      color: rgb(0.1, 0.1, 0.7),
    });

    // Add conversion details
    page.drawText(`Source: ${htmlFile ? htmlFile.name : 'Direct HTML Input'}`, {
      x: marginSize,
      y: pageHeight - marginSize - 40,
      font: helveticaFont,
      size: 12,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Page Size: ${pageSize.toUpperCase()} | Margins: ${margins} | Styles: ${includeStyles ? 'Included' : 'Excluded'}`, {
      x: marginSize,
      y: pageHeight - marginSize - 60,
      font: helveticaFont,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Draw a separator line
    page.drawLine({
      start: { x: marginSize, y: pageHeight - marginSize - 80 },
      end: { x: pageWidth - marginSize, y: pageHeight - marginSize - 80 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Preview of the HTML content (simplified for demo)
    const contentToDisplay = htmlContent || (htmlFile ? `Content from ${htmlFile.name}` : '');
    
    // Simplified content preview
    const contentPreview = contentToDisplay.substring(0, 1000)
      .replace(/<[^>]*>/g, '') // Remove HTML tags for preview
      .trim();
    
    // Draw the content preview
    const contentY = pageHeight - marginSize - 100;
    const contentX = marginSize;
    const lineHeight = 16;
    
    // Split preview into lines
    const contentLines = [];
    let currentLine = '';
    const words = contentPreview.split(' ');
    const maxLineWidth = pageWidth - (marginSize * 2);
    
    for (const word of words) {
      const potentialLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = timesRoman.widthOfTextAtSize(potentialLine, 11);
      
      if (lineWidth <= maxLineWidth) {
        currentLine = potentialLine;
      } else {
        contentLines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      contentLines.push(currentLine);
    }
    
    // Draw each line
    for (let i = 0; i < Math.min(contentLines.length, 30); i++) {
      page.drawText(contentLines[i], {
        x: contentX,
        y: contentY - (i * lineHeight),
        font: timesRoman,
        size: 11,
        color: rgb(0, 0, 0),
      });
    }
    
    // If there are more lines than we displayed, add an ellipsis
    if (contentLines.length > 30) {
      page.drawText('...', {
        x: contentX,
        y: contentY - (30 * lineHeight),
        font: timesRoman,
        size: 11,
        color: rgb(0, 0, 0),
      });
    }
    
    // Add a footer
    const footerText = 'Generated with Transform Factory HTML to PDF converter';
    page.drawText(footerText, {
      x: pageWidth / 2 - timesRoman.widthOfTextAtSize(footerText, 9) / 2,
      y: marginSize / 2,
      font: timesRoman,
      size: 9,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add a watermark diagonally across the page
    page.drawText('TRANSFORM FACTORY', {
      x: pageWidth / 2 - helveticaFont.widthOfTextAtSize('TRANSFORM FACTORY', 60) / 2,
      y: pageHeight / 2,
      font: helveticaFont,
      size: 60,
      color: rgb(0.95, 0.95, 0.95),
      rotate: degrees(45),
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Clean up temporary files
    if (htmlFilePath) {
      fs.unlinkSync(htmlFilePath);
    }
    fs.rmdirSync(tempDir);
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="converted-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error converting HTML to PDF:', error);
    
    return NextResponse.json(
      { error: 'Failed to convert HTML to PDF: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}