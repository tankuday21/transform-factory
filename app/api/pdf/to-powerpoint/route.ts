import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { parseForm, readFileAsBuffer } from '@/app/lib/parse-form';

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const execPromise = util.promisify(exec);

/// Function to parse form data including file uploads
const parseForm = async (req: NextRequest) => {
  const formData = await req.formData();
  const pdf = formData.get('pdf') as File;
  const quality = formData.get('quality') as string;
  const pageRange = formData.get('pageRange') as string;
  const includeNotes = formData.get('includeNotes') as string;

  return {
    pdf,
    quality: quality || 'high',
    pageRange: pageRange || 'all',
    includeNotes: includeNotes === 'true',
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
    const { pdf, quality, pageRange, includeNotes } = await parseForm(req);

    // Check if PDF file is provided
    if (!pdf) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Read the PDF file as buffer
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    // Create temp file paths
    const pdfPath = path.join(tempDir, `${Date.now()}-input.pdf`);
    const outputPath = path.join(tempDir, `${Date.now()}-output.pptx`);

    // Write the PDF to a temp file
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Check if we need to extract specific pages first
    let processedPdfPath = pdfPath;
    
    if (pageRange !== 'all') {
      try {
        // Load the PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        
        // Create a new PDF with selected pages
        const newPdf = await PDFDocument.create();
        
        // Parse page range
        const selectedPages = new Set<number>();
        const ranges = pageRange.split(',').map(r => r.trim());
        
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              if (i > 0 && i <= totalPages) {
                selectedPages.add(i - 1); // Convert to 0-based index
              }
            }
          } else {
            const page = parseInt(range);
            if (page > 0 && page <= totalPages) {
              selectedPages.add(page - 1); // Convert to 0-based index
            }
          }
        }
        
        // If no valid pages were selected, use all pages
        if (selectedPages.size === 0) {
          return NextResponse.json(
            { error: 'Invalid page range provided' },
            { status: 400 }
          );
        }
        
        // Copy the selected pages
        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        for (const pageIndex of sortedPages) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
          newPdf.addPage(copiedPage);
        }
        
        // Save the new PDF with selected pages
        const processedPdfBuffer = await newPdf.save();
        processedPdfPath = path.join(tempDir, `${Date.now()}-processed.pdf`);
        fs.writeFileSync(processedPdfPath, processedPdfBuffer);
      } catch (err) {
        console.error('Error extracting pages:', err);
        // Fall back to using the full PDF
        processedPdfPath = pdfPath;
      }
    }

    // In a real-world implementation, you would call a PDF-to-PowerPoint conversion library or service here.
    // For simplicity, we're creating a placeholder PowerPoint document.
    // This should be replaced with an actual conversion service/library.
    
    // Create a simple .pptx file with placeholder text (in reality, this would be generated from the PDF content)
    const placeholderContent = Buffer.from(`
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>PDF to PowerPoint Conversion</title>
        </head>
        <body>
          <h1>PDF to PowerPoint Conversion</h1>
          <p>This file has been converted from PDF to PowerPoint format.</p>
          <p>File: ${pdf.name}</p>
          <p>Quality: ${quality}</p>
          <p>Page Range: ${pageRange}</p>
          <p>Include Notes: ${includeNotes ? 'Yes' : 'No'}</p>
          <p>Note: This is a placeholder document. In a real implementation, the actual PDF content would be converted here.</p>
        </body>
      </html>
    `);
    
    fs.writeFileSync(outputPath, placeholderContent);

    // Read the output file
    const pptxBuffer = fs.readFileSync(outputPath);

    // Clean up temp files
    try {
      fs.unlinkSync(pdfPath);
      if (processedPdfPath !== pdfPath) {
        fs.unlinkSync(processedPdfPath);
      }
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error('Error cleaning up temp files:', err);
    }

    // Return the PowerPoint document
    return new NextResponse(pptxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '.pptx')}"`,
      },
    });
  } catch (error) {
    console.error('Error converting PDF to PowerPoint:', error);
    return NextResponse.json(
      { error: 'Failed to convert PDF to PowerPoint' },
      { status: 500 }
    );
  }
}