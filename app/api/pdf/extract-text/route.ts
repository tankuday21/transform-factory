import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as pdfjs from 'pdfjs-dist';

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
  const pageRange = formData.get('pageRange') as string;
  const format = formData.get('format') as string;

  return {
    pdf,
    pageRange: pageRange || 'all',
    format: format || 'text', // 'text' or 'json'
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
    const { pdf, pageRange, format } = await parseForm(req);

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

    // Determine which pages to extract
    let pagesToExtract: number[] = [];
    
    if (pageRange === 'all') {
      // Extract all pages
      pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
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
      
      pagesToExtract = Array.from(pageSet).sort((a, b) => a - b);
    }

    // Extract text from each page
    const result: Record<string, string> = {};
    let fullText = '';
    
    for (const pageNum of pagesToExtract) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them with spaces
      const pageText = textContent.items
        .map((item: any) => 'str' in item ? item.str : '')
        .join(' ');
      
      result[`page_${pageNum}`] = pageText;
      fullText += pageText + '\n\n';
    }

    // Clean up temporary files
    fs.unlinkSync(pdfPath);
    
    // Return the extracted text in the requested format
    if (format === 'json') {
      return NextResponse.json(result);
    } else {
      // Return as plain text file
      const textBuffer = Buffer.from(fullText);
      return new NextResponse(textBuffer, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '')}_text.txt"`,
        },
      });
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
} 

