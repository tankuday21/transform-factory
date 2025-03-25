import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';

// Disable default body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Form field interface
interface FormField {
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  label: string;
  required: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  options?: string[];
  page: number;
}

//// Function to parse form data with files
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

    // Parse form fields from the request
    const formFields = fields.fields ? 
      JSON.parse(Array.isArray(fields.fields) ? fields.fields[0] : fields.fields as string) as FormField[] : 
      [];

    if (formFields.length === 0) {
      return NextResponse.json(
        { error: 'No form fields provided' },
        { status: 400 }
      );
    }

    // Read PDF file as buffer
    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
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
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Get the font for field labels
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Process each form field
    for (const field of formFields) {
      const page = pdfDoc.getPages()[field.page - 1]; // Convert 1-indexed to 0-indexed
      
      if (!page) {
        console.warn(`Page ${field.page} not found, skipping field ${field.id}`);
        continue;
      }
      
      // The PDF coordinate system starts from the bottom-left
      // Convert from top-left coordinates to bottom-left
      const pageHeight = page.getHeight();
      const yPos = pageHeight - field.y - field.height;
      
      // Add form field based on type
      switch (field.type) {
        case 'text': {
          // Create a text field
          const textField = pdfDoc.getForm().createTextField(field.id);
          textField.setText('');
          textField.addToPage(page, {
            x: field.x,
            y: yPos,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
          });
          
          // Set field properties
          textField.setMaxLength(1000);
          
          // Add label above the field
          page.drawText(field.label, {
            x: field.x,
            y: yPos + field.height + 10,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          break;
        }
        
        case 'checkbox': {
          // Create a checkbox field
          const checkboxField = pdfDoc.getForm().createCheckBox(field.id);
          checkboxField.addToPage(page, {
            x: field.x,
            y: yPos,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
          });
          
          // Add label to the right of the checkbox
          page.drawText(field.label, {
            x: field.x + field.width + 5,
            y: yPos + (field.height / 2) - 5,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          break;
        }
        
        case 'radio': {
          // Group all radio buttons with the same name
          const radioGroup = pdfDoc.getForm().createRadioGroup(field.id);
          
          // Process each option
          if (field.options && field.options.length > 0) {
            const optionSpacing = 25; // Vertical spacing between options
            
            for (let i = 0; i < field.options.length; i++) {
              const option = field.options[i];
              const optionValue = `option_${i}`;
              const optionY = yPos - (i * optionSpacing);
              
              // Add radio button
              radioGroup.addOptionToPage(optionValue, page, {
                x: field.x,
                y: optionY,
                width: field.height, // Use height for both dimensions for a circle
                height: field.height,
                borderWidth: 1,
                borderColor: rgb(0, 0, 0),
              });
              
              // Add option label
              page.drawText(option, {
                x: field.x + field.height + 5,
                y: optionY + (field.height / 2) - 5,
                size: 10,
                font,
                color: rgb(0, 0, 0),
              });
            }
            
            // Add group label above
            page.drawText(field.label, {
              x: field.x,
              y: yPos + field.height + 10,
              size: 10,
              font,
              color: rgb(0, 0, 0),
            });
          }
          break;
        }
        
        case 'dropdown': {
          // Create a dropdown field
          const dropdownField = pdfDoc.getForm().createDropdown(field.id);
          dropdownField.addToPage(page, {
            x: field.x,
            y: yPos,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
          });
          
          // Set options
          if (field.options && field.options.length > 0) {
            dropdownField.setOptions(field.options);
          }
          
          // Add label above the dropdown
          page.drawText(field.label, {
            x: field.x,
            y: yPos + field.height + 10,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          break;
        }
      }
    }
    
    // Flatten the form to prevent further editing of the form structure (not the fields)
    pdfDoc.getForm().updateFieldAppearances();
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the fillable PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fillable.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error creating PDF form:', error);
    return NextResponse.json(
      { error: 'Failed to create PDF form' },
      { status: 500 }
    );
  }
}