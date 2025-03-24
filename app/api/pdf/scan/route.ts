import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  
  const images = formData.getAll('images') as File[];
  const quality = formData.get('quality') as string || 'medium';
  const colorMode = formData.get('colorMode') as string || 'color';
  const paperSize = formData.get('paperSize') as string || 'a4';
  const orientation = formData.get('orientation') as string || 'portrait';
  const margin = parseInt(formData.get('margin') as string || '20', 10);
  const includeImageInfo = formData.get('includeImageInfo') === 'true';

  return {
    images,
    quality,
    colorMode,
    paperSize,
    orientation,
    margin,
    includeImageInfo
  };
}

// Helper function to determine page dimensions based on paper size and orientation
function getPageDimensions(paperSize: string, orientation: string) {
  let width, height;
  
  // Set dimensions based on selected paper size
  switch (paperSize.toLowerCase()) {
    case 'a3':
      [width, height] = PageSizes.A3;
      break;
    case 'a4':
      [width, height] = PageSizes.A4;
      break;
    case 'a5':
      [width, height] = PageSizes.A5;
      break;
    case 'letter':
      [width, height] = PageSizes.Letter;
      break;
    case 'legal':
      [width, height] = PageSizes.Legal;
      break;
    default:
      [width, height] = PageSizes.A4;
  }
  
  // Swap dimensions if landscape orientation
  if (orientation.toLowerCase() === 'landscape') {
    [width, height] = [height, width];
  }
  
  return { width, height };
}

export async function POST(req: NextRequest) {
  try {
    const { 
      images, 
      quality, 
      colorMode, 
      paperSize, 
      orientation,
      margin,
      includeImageInfo
    } = await parseForm(req);
    
    // Validate that at least one image is uploaded
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }
    
    // Create temporary directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-'));
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Get page dimensions based on selected paper size and orientation
      const { width, height } = getPageDimensions(paperSize, orientation);
      
      // Process each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        const imagePath = path.join(tmpDir, image.name);
        
        // Write the image to disk
        fs.writeFileSync(imagePath, imageBuffer);
        
        // Determine image type and embed it
        let embeddedImage;
        if (image.name.toLowerCase().endsWith('.jpg') || image.name.toLowerCase().endsWith('.jpeg')) {
          embeddedImage = await pdfDoc.embedJpg(imageBuffer);
        } else if (image.name.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(imageBuffer);
        } else {
          // For unsupported formats, we'd normally convert them, but for this simulation
          // we'll just create a placeholder
          const page = pdfDoc.addPage([width, height]);
          page.drawText(`Image format not supported: ${image.name}`, {
            x: margin,
            y: height - margin - 20,
            size: 14,
            font: helveticaBold,
            color: rgb(0.8, 0.2, 0.2),
          });
          continue;
        }
        
        // Add a new page for this image
        const page = pdfDoc.addPage([width, height]);
        
        // Calculate dimensions to fit image within margins
        const contentWidth = width - 2 * margin;
        const contentHeight = height - 2 * margin;
        
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        
        // Calculate scaling to fit image within content area while maintaining aspect ratio
        const widthRatio = contentWidth / imgWidth;
        const heightRatio = contentHeight / imgHeight;
        const scale = Math.min(widthRatio, heightRatio);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center the image on the page
        const x = margin + (contentWidth - scaledWidth) / 2;
        const y = margin + (contentHeight - scaledHeight) / 2;
        
        // Draw the image
        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
        
        // Add image info if requested
        if (includeImageInfo) {
          const infoY = margin / 2;
          page.drawText(`File: ${image.name} | Size: ${Math.round(image.size / 1024)} KB | Page ${i+1} of ${images.length}`, {
            x: margin,
            y: infoY,
            size: 8,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }
      
      // Create a cover page with scan information
      const coverPage = pdfDoc.insertPage(0, [width, height]);
      
      // Draw title
      coverPage.drawText('Scanned Document', {
        x: width / 2 - 100,
        y: height - margin - 40,
        size: 24,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      
      // Draw horizontal line
      coverPage.drawLine({
        start: { x: margin, y: height - margin - 60 },
        end: { x: width - margin, y: height - margin - 60 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      
      // Draw document information
      const infoY = height - margin - 100;
      coverPage.drawText('Document Information:', {
        x: margin,
        y: infoY,
        size: 14,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText(`Date Created: ${new Date().toLocaleString()}`, {
        x: margin,
        y: infoY - 25,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText(`Number of Pages: ${images.length}`, {
        x: margin,
        y: infoY - 45,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText(`Paper Size: ${paperSize.toUpperCase()} (${orientation})`, {
        x: margin,
        y: infoY - 65,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText(`Quality: ${quality}`, {
        x: margin,
        y: infoY - 85,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText(`Color Mode: ${colorMode}`, {
        x: margin,
        y: infoY - 105,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Add notes section
      const notesY = infoY - 145;
      coverPage.drawText('Notes:', {
        x: margin,
        y: notesY,
        size: 14,
        font: helveticaBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText('This PDF was created using the Scan to PDF feature.', {
        x: margin,
        y: notesY - 25,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      coverPage.drawText('The document contains scanned images converted to PDF format.', {
        x: margin,
        y: notesY - 45,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Add a watermark
      coverPage.drawText('Transform Factory', {
        x: width / 2 - 70,
        y: 100,
        size: 16,
        font: helveticaFont,
        opacity: 0.2,
        color: rgb(0, 0, 0),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Clean up temporary files
      fs.rmSync(tmpDir, { recursive: true, force: true });
      
      // Return the PDF
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="scanned_document.pdf"',
        },
      });
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error in Scan to PDF API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during PDF creation' },
      { status: 500 }
    );
  }
} 
