import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';
import * as XLSX from 'xlsx';

// Modern Next.js App Router configuration
export const dynamic = 'force-dynamic';
export const bodyStream = true;

// Function to parse form data including file uploads
const parseForm = async (req: NextRequest) => {
  const formData = await req.formData();
  const pdf = formData.get('pdf') as File;
  const quality = formData.get('quality') as string;
  const pageRange = formData.get('pageRange') as string;

  return {
    pdf,
    quality: quality || 'medium', // 'low', 'medium', 'high'
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
    const { pdf, quality, pageRange } = await parseForm(req);

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

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();

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

    // In a real-world implementation, we'd use a dedicated PDF to Excel conversion library
    // or service like Tabula, PDFTables, or similar.
    // Here we'll create a simple Excel file with simulated data extraction.

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // For each page to convert, create a worksheet with sample data
    // In a real implementation, this would use the extracted tables from the PDF
    for (const pageNum of pagesToConvert) {
      // Simulate table data that might be extracted from the PDF
      // Quality setting would affect extraction accuracy in a real implementation
      const worksheetData = [];
      
      // Create header row based on "quality" (just for demonstration)
      const headerRow = ['Column A', 'Column B', 'Column C'];
      if (quality === 'medium' || quality === 'high') {
        headerRow.push('Column D');
      }
      if (quality === 'high') {
        headerRow.push('Column E', 'Column F');
      }
      worksheetData.push(headerRow);
      
      // Add some sample data rows
      const numRows = 5 + (quality === 'high' ? 5 : (quality === 'medium' ? 3 : 0));
      for (let i = 1; i <= numRows; i++) {
        const row = [`A${i}`, `B${i}`, `C${i}`];
        if (quality === 'medium' || quality === 'high') {
          row.push(`D${i}`);
        }
        if (quality === 'high') {
          row.push(`E${i}`, `F${i}`);
        }
        worksheetData.push(row);
      }
      
      // Create a worksheet for this page
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
    }
    
    // Write the workbook to a buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Clean up temporary files
    fs.unlinkSync(pdfPath);
    
    // Return the Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${pdf.name.replace('.pdf', '')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    return NextResponse.json(
      { error: 'Failed to convert PDF to Excel' },
      { status: 500 }
    );
  }
} 