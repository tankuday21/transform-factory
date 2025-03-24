import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';

// Define form field types
interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'dropdown';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  required?: boolean;
  options?: string[]; // For dropdown fields
}

// Parse form data from the request
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  
  const baseFile = formData.get('baseFile') as File | null;
  const formFieldsJson = formData.get('formFields') as string;
  const pageSize = formData.get('pageSize') as string || 'a4';
  const orientation = formData.get('orientation') as string || 'portrait';
  const title = formData.get('title') as string || 'PDF Form';
  
  // Parse the form fields JSON
  let formFields: FormField[] = [];
  try {
    formFields = JSON.parse(formFieldsJson);
  } catch (error) {
    console.error('Error parsing form fields JSON:', error);
    throw new Error('Invalid form fields data');
  }
  
  return {
    baseFile,
    formFields,
    pageSize,
    orientation,
    title,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const { baseFile, formFields, pageSize, orientation, title } = await parseForm(req);
    
    // Create a temporary directory to store files
    const tempDir = path.join(os.tmpdir(), 'pdf-form-creator-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    try {
      // Create a new PDF or load the base file if provided
      let pdfDoc;
      
      if (baseFile) {
        // If a base file is provided, load it
        const baseFilePath = path.join(tempDir, baseFile.name);
        await fs.writeFile(baseFilePath, Buffer.from(await baseFile.arrayBuffer()));
        const baseFileBuffer = await fs.readFile(baseFilePath);
        pdfDoc = await PDFDocument.load(baseFileBuffer);
      } else {
        // Otherwise, create a new PDF with the specified page size
        pdfDoc = await PDFDocument.create();
        
        // Determine page dimensions based on the page size and orientation
        let width, height;
        switch (pageSize.toLowerCase()) {
          case 'a4':
            width = 595;
            height = 842;
            break;
          case 'letter':
            width = 612;
            height = 792;
            break;
          case 'legal':
            width = 612;
            height = 1008;
            break;
          default:
            width = 595;
            height = 842; // Default to A4
        }
        
        // Swap dimensions for landscape orientation
        if (orientation.toLowerCase() === 'landscape') {
          [width, height] = [height, width];
        }
        
        // Add a page to the PDF
        pdfDoc.addPage([width, height]);
      }
      
      // Get the first page (we'll add form fields to this page)
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();
      
      // Embed fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add title to the form
      page.drawText(title, {
        x: 50,
        y: height - 50,
        size: 20,
        font: helveticaBold,
        color: rgb(0, 0.2, 0.4),
      });
      
      // In a real implementation, we would add actual form fields using a PDF library that supports forms
      // For this demo, we'll simulate form fields by drawing rectangles and text
      
      // Draw each form field
      formFields.forEach((field, index) => {
        // Calculate actual position on the page (flip y-coordinate since PDF origin is at bottom-left)
        const fieldX = field.x;
        const fieldY = height - field.y - field.height;
        
        // Draw field border
        page.drawRectangle({
          x: fieldX,
          y: fieldY,
          width: field.width,
          height: field.height,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 1,
          color: rgb(0.98, 0.98, 0.98),
        });
        
        // Draw field label
        page.drawText(field.label, {
          x: fieldX,
          y: fieldY + field.height + 10,
          size: 10,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        // Draw additional elements based on field type
        if (field.type === 'checkbox') {
          // Draw checkbox placeholder
          page.drawRectangle({
            x: fieldX + 5,
            y: fieldY + 5,
            width: 12,
            height: 12,
            borderColor: rgb(0.5, 0.5, 0.5),
            borderWidth: 1,
          });
        } else if (field.type === 'dropdown' && field.options && field.options.length > 0) {
          // Draw dropdown indicator
          page.drawText('▼', {
            x: fieldX + field.width - 15,
            y: fieldY + field.height / 2 - 5,
            size: 8,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          // Draw first option as placeholder
          page.drawText(field.options[0], {
            x: fieldX + 5,
            y: fieldY + field.height / 2 - 5,
            size: 10,
            font: helveticaFont,
            color: rgb(0.6, 0.6, 0.6),
          });
        }
        
        // Add 'Required' indicator if the field is required
        if (field.required) {
          page.drawText('*', {
            x: fieldX - 10,
            y: fieldY + field.height / 2 - 5,
            size: 12,
            font: helveticaBold,
            color: rgb(0.8, 0.2, 0.2),
          });
        }
      });
      
      // Add a note about the form fields
      page.drawText('Note: This is a simulated form. In a real implementation, interactive form fields would be added.', {
        x: 50,
        y: 50,
        size: 9,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Clean up temporary files if a base file was provided
      if (baseFile) {
        const baseFilePath = path.join(tempDir, baseFile.name);
        await fs.unlink(baseFilePath);
      }
      
      await fs.rmdir(tempDir);
      
      // Return the PDF
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="form.pdf"`,
        },
      });
    } catch (error) {
      // Clean up in case of error
      try {
        await fs.rmdir(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating PDF form:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PDF form' },
      { status: 500 }
    );
  }
} 

