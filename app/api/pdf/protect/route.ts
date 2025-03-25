import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';
import os from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Function to parse form data with files
const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
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
    const { fields, files } = await parseForm(req);
    
    // Get the uploaded PDF file
    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    
    if (!pdfFile || !pdfFile.originalFilename) {
      return NextResponse.json(
        { error: 'No PDF file uploaded' },
        { status: 400 }
      );
    }

    // Get protection options
    const userPassword = fields.userPassword && Array.isArray(fields.userPassword) 
      ? fields.userPassword[0] 
      : fields.userPassword as string || '';
    const ownerPassword = fields.ownerPassword && Array.isArray(fields.ownerPassword) 
      ? fields.ownerPassword[0] 
      : fields.ownerPassword as string || '';
    
    // Get permissions
    const canPrint = fields.canPrint && Array.isArray(fields.canPrint) 
      ? fields.canPrint[0] === 'true' 
      : fields.canPrint === 'true';
    const canModify = fields.canModify && Array.isArray(fields.canModify) 
      ? fields.canModify[0] === 'true' 
      : fields.canModify === 'true';
    const canCopy = fields.canCopy && Array.isArray(fields.canCopy) 
      ? fields.canCopy[0] === 'true' 
      : fields.canCopy === 'true';
    const canAnnotate = fields.canAnnotate && Array.isArray(fields.canAnnotate) 
      ? fields.canAnnotate[0] === 'true' 
      : fields.canAnnotate === 'true';

    if (!userPassword && !ownerPassword) {
      return NextResponse.json(
        { error: 'At least one password (user or owner) is required' },
        { status: 400 }
      );
    }

    // Read file as buffer
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
    
    // Encrypt the PDF
    const encryptOptions = {
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: canPrint ? 'highResolution' : 'none',
        modifying: canModify,
        copying: canCopy,
        annotating: canAnnotate,
        fillingForms: canAnnotate,
        contentAccessibility: true,
        documentAssembly: canModify,
      },
    };
    
    // Apply encryption
    pdfDoc.encrypt(encryptOptions);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="protected.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error protecting PDF:', error);
    return NextResponse.json(
      { error: 'Failed to protect PDF' },
      { status: 500 }
    );
  }
} 

