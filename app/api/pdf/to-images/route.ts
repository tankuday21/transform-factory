import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as pdfjs from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import JSZip from 'jszip';
import { parseSimpleForm } from '@/app/lib/parse-form';

// Set up the worker for pdf.js
const pdfjsWorker = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js');
if (typeof window === 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Create a temp directory for processing if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'transform-factory-pdf');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Parse the form data
    const formData = await parseSimpleForm(req);
    const pdf = formData.pdf as File;
    const format = (formData.format as string) || 'jpg';
    const dpi = parseInt(formData.dpi as string) || 150;
    const pageRange = (formData.pageRange as string) || 'all';

    // Check if PDF file is provided
    if (!pdf) {
      console.error('To Images: No PDF file provided');
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    try {
      // Read the PDF file as buffer
      const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
      
      // Save to temp file for pdf.js to process
      const pdfPath = path.join(tempDir, `${Date.now()}-input.pdf`);
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      try {
        // Load the PDF using pdf.js
        const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
        const pdfDocument = await loadingTask.promise;
        const totalPages = pdfDocument.numPages;

        // Determine which pages to convert
        let pagesToConvert: number[] = [];
        
        if (pageRange === 'all') {
          // Convert all pages
          pagesToConvert = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
          // Parse page range
          const ranges = pageRange.split(',').map(r => r.trim());
          const pageSet = new Set<number>();
          
          for (const range of ranges) {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(n => parseInt(n.trim()));
              for (let i = start; i <= end; i++) {
                if (i > 0 && i <= totalPages) {
                  pageSet.add(i);
                }
              }
            } else {
              const page = parseInt(range);
              if (page > 0 && page <= totalPages) {
                pageSet.add(page);
              }
            }
          }
          
          if (pageSet.size === 0) {
            console.error('To Images: Invalid page range provided');
            return NextResponse.json(
              { error: 'Invalid page range provided' },
              { status: 400 }
            );
          }
          
          pagesToConvert = Array.from(pageSet).sort((a, b) => a - b);
        }

        // Calculate scale factor based on DPI
        // PDF standard resolution is 72 DPI
        const scaleFactor = dpi / 72;

        // Create a zip archive to store the images
        const zip = new JSZip();
        
        // Convert each page to an image
        for (const pageNum of pagesToConvert) {
          try {
            // Get the page
            const page = await pdfDocument.getPage(pageNum);
            
            // Get page dimensions
            const viewport = page.getViewport({ scale: scaleFactor });
            
            // Create a canvas using createCanvas
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');
            
            // Render the page to the canvas
            const renderContext = {
              canvasContext: context as any,
              viewport: viewport,
            };
            
            await page.render(renderContext).promise;
            
            // Convert canvas to image buffer
            let imageBuffer;
            if (format === 'png') {
              imageBuffer = canvas.toBuffer('image/png');
            } else {
              imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
            }
            
            // Add the image to the zip archive
            const padding = pagesToConvert.length > 9 ? 2 : 1;
            const pageNumStr = pageNum.toString().padStart(padding, '0');
            zip.file(`page_${pageNumStr}.${format}`, imageBuffer);
          } catch (pageError) {
            console.error(`Error processing page ${pageNum}:`, pageError);
            // Continue with other pages
          }
        }
        
        // Check if any pages were processed
        if (Object.keys(zip.files).length === 0) {
          console.error('To Images: No pages could be converted');
          return NextResponse.json(
            { error: 'Failed to convert any pages to images' },
            { status: 500 }
          );
        }
        
        // Generate the zip file
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        
        // Clean up temporary files
        try {
          fs.unlinkSync(pdfPath);
        } catch (cleanupError) {
          console.error('Error cleaning up temporary files:', cleanupError);
          // Continue despite cleanup errors
        }
        
        // Return the zip file
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '')}_images.zip"`,
          },
        });
      } catch (pdfJsError) {
        console.error('Error with pdf.js processing:', pdfJsError);
        return NextResponse.json(
          { error: 'Failed to process PDF with pdf.js' },
          { status: 500 }
        );
      }
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      return NextResponse.json(
        { error: 'Failed to read PDF file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    return NextResponse.json(
      { error: 'Failed to convert PDF to images' },
      { status: 500 }
    );
  }
} 

