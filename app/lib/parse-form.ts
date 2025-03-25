import { NextRequest } from 'next/server';
import * as formidable from 'formidable';
import { PassThrough } from 'stream';

// Function to parse form data with files
export const parseForm = async (req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      multiples: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      keepExtensions: true,
    });

    req.arrayBuffer().then((arrayBuffer) => {
      // Convert arrayBuffer to buffer
      const buffer = Buffer.from(arrayBuffer);

      // Create a PassThrough stream
      const passThrough = new PassThrough();
      passThrough.end(buffer);

      form.parse(passThrough as any, (err: any, fields: formidable.Fields, files: formidable.Files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    }).catch(err => {
      console.error('ArrayBuffer error:', err);
      reject(err);
    });
  });
};

// Function to parse simplified form data
export const parseSimpleForm = async (req: NextRequest) => {
  const formData = await req.formData();
  const entries = Array.from(formData.entries());
  
  const result: Record<string, any> = {};
  
  for (const [key, value] of entries) {
    if (value instanceof File) {
      result[key] = value;
    } else {
      result[key] = value.toString();
    }
  }
  
  return result;
};

// Helper to read file as buffer
export const readFileAsBuffer = async (filePath: string, fileSize: number): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const buffer = Buffer.alloc(fileSize);
      const stream = require('fs').createReadStream(filePath);
      let pos = 0;
      
      stream.on('data', (chunk: Buffer) => {
        chunk.copy(buffer, pos);
        pos += chunk.length;
      });
      
      stream.on('end', () => {
        resolve(buffer);
      });
      
      stream.on('error', (err: Error) => {
        console.error('File read error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('Buffer creation error:', error);
      reject(error);
    }
  });
}; 