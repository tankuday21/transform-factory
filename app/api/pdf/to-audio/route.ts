import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { PDFDocument } from 'pdf-lib';
import { parseForm } from '@/app/lib/parse-form';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Parse form data from the request
async function parseToAudioForm(req: NextRequest) {
  const formData = await req.formData();
  
  const file = formData.get('file') as File;
  const voice = formData.get('voice') as string || 'en-US-Neural2-F';
  const speed = formData.get('speed') as string || '1.0';
  const language = formData.get('language') as string || 'en';
  const quality = formData.get('quality') as string || 'standard';
  const pageRange = formData.get('pageRange') as string || 'all';
  
  return {
    file,
    voice,
    speed,
    language,
    quality,
    pageRange,
  };
}

// Helper function to extract text from PDF
async function extractTextFromPdf(pdfBuffer: Buffer, pageRange: string) {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Parse page range
    let pagesToExtract: number[] = [];
    
    if (pageRange === 'all') {
      // Include all pages
      pagesToExtract = Array.from({ length: pageCount }, (_, i) => i);
    } else {
      // Parse page ranges like '1-3,5,7-9'
      const ranges = pageRange.split(',');
      
      for (const range of ranges) {
        const trimmedRange = range.trim();
        if (trimmedRange.includes('-')) {
          // Handle range like '1-3'
          const [start, end] = trimmedRange.split('-').map(num => parseInt(num.trim(), 10) - 1);
          
          if (!isNaN(start) && !isNaN(end) && start >= 0 && end < pageCount && start <= end) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.push(i);
            }
          }
        } else {
          // Handle single page like '5'
          const pageNum = parseInt(trimmedRange, 10) - 1;
          
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pageCount) {
            pagesToExtract.push(pageNum);
          }
        }
      }
    }
    
    // In a real implementation, we would use a PDF text extraction library
    // For this demo, we're simulating text extraction
    const extractedText = `This is simulated extracted text from the PDF.
    The actual implementation would use a proper PDF text extraction library.
    This text would then be converted to speech using a text-to-speech API.
    
    The PDF has ${pageCount} pages total, and you selected ${pagesToExtract.length} pages for conversion.
    
    This would include all the text content from those pages, formatted properly for speech synthesis.`;
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to convert text to speech (simulated)
async function convertTextToSpeech(
  text: string, 
  voice: string, 
  speed: string, 
  language: string,
  quality: string,
  outputPath: string
) {
  try {
    // In a real implementation, we would use a text-to-speech API like Google Text-to-Speech,
    // Amazon Polly, or similar service to convert the text to speech
    
    // For this demo, we'll create a simple audio file to simulate the conversion
    // This would be replaced with actual API calls in a production environment
    
    // Simulate the TTS processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a text file with the speech text (for demonstration purposes)
    // In a real implementation, this would be an MP3 file
    await fs.writeFile(
      outputPath,
      `AUDIO SPEECH CONTENT (Simulated)
      
      Voice: ${voice}
      Speed: ${speed}
      Language: ${language}
      Quality: ${quality}
      
      TEXT CONTENT:
      ${text}
      
      [This is a simulated audio file. In a real implementation, this would be an MP3 file
      generated by a text-to-speech service like Google TTS, Amazon Polly, or Microsoft Azure.]`
    );
    
    return true;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw new Error('Failed to convert text to speech');
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const { file, voice, speed, language, quality, pageRange } = await parseToAudioForm(req);
    
    // Check if file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    // Create a temporary directory to store files
    const tempDir = path.join(os.tmpdir(), 'pdf-to-audio-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    try {
      // Save uploaded file
      const filePath = path.join(tempDir, file.name);
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      
      // Extract text from PDF
      const pdfBuffer = await fs.readFile(filePath);
      const extractedText = await extractTextFromPdf(pdfBuffer, pageRange);
      
      // Convert text to speech
      const audioFilePath = path.join(tempDir, 'output.mp3');
      await convertTextToSpeech(extractedText, voice, speed, language, quality, audioFilePath);
      
      // Read the generated audio file
      const audioBuffer = await fs.readFile(audioFilePath);
      
      // Clean up temporary files
      await fs.unlink(filePath);
      await fs.unlink(audioFilePath);
      await fs.rmdir(tempDir);
      
      // Prepare filename for the audio file
      const fileNameParts = file.name.split('.');
      fileNameParts.pop(); // Remove extension
      const baseFileName = fileNameParts.join('.');
      const audioFileName = `${baseFileName}.mp3`;
      
      // Return the audio file
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${audioFileName}"`,
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
    console.error('Error converting PDF to audio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert PDF to audio' },
      { status: 500 }
    );
  }
} 

