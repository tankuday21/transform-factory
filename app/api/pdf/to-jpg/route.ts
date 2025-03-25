import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { Canvas } from 'canvas';

// Set up the worker for pdf.js
const pdfjsWorker = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js');
if (typeof window === 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Function to parse form data including file uploads
const parseForm = async (req: NextRequest) => {
  const formData = await req.formData();
  const pdf = formData.get('pdf') as File;
  const quality = formData.get('quality') as string;
  const dpi = formData.get('dpi') as string;
  const pageRange = formData.get('pageRange') as string;

  return {
    pdf,
    quality: parseInt(quality) || 90,
    dpi: parseInt(dpi) || 150,
    pageRange: pageRange || 'all',
  };
};

export async function POST(req: NextRequest) {
  try {
    // Create a temp directory for processing if it doesn't exist
    const tempDir = path.join(os.tmpdir(), 'transform-factory-pdf');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Parse the form data
    const { pdf, quality, dpi, pageRange } = await parseForm(req);

    // Check if PDF file is provided
    if (!pdf) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Read the PDF file as buffer
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const pdfPath = path.join(tempDir, `${Date.now()}-input.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

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
      // Get the page
      const page = await pdfDocument.getPage(pageNum);
      
      // Get page dimensions
      const viewport = page.getViewport({ scale: scaleFactor });
      
      // Create a canvas
      const canvas = new Canvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      // Render the page to the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext as any).promise;
      
      // Convert canvas to JPG image buffer with specified quality
      const imageBuffer = canvas.toBuffer('image/jpeg', { quality: quality / 100 });
      
      // Add the image to the zip archive
      const padding = pagesToConvert.length > 9 ? 2 : 1;
      const pageNumStr = pageNum.toString().padStart(padding, '0');
      zip.file(`page_${pageNumStr}.jpg`, imageBuffer);
    }
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Clean up temporary files
    fs.unlinkSync(pdfPath);
    
    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '')}_jpg.zip"`,
      },
    });
  } catch (error) {
    console.error('Error converting PDF to JPG:', error);
    return NextResponse.json(
      { error: 'Failed to convert PDF to JPG' },
      { status: 500 }
    );
  }
} 

