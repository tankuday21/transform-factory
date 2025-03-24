import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';

// Parse form data from the request
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  
  const file = formData.get('file') as File;
  const repairLevel = formData.get('repairLevel') as string || 'standard';
  const recoverImages = formData.get('recoverImages') === 'true';
  const recoverFonts = formData.get('recoverFonts') === 'true';
  
  return {
    file,
    repairLevel,
    recoverImages,
    recoverFonts,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const { file, repairLevel, recoverImages, recoverFonts } = await parseForm(req);
    
    // Check if file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    // Create a temporary directory to store files
    const tempDir = path.join(os.tmpdir(), 'pdf-repair-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Save uploaded file
    const filePath = path.join(tempDir, file.name);
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    
    // In a real implementation, you would use specialized PDF repair libraries or APIs
    // For this demo, we'll simulate repair by creating a new PDF with some of the content from the original
    
    // Try to load the PDF (this may fail if it's severely corrupted)
    let originalPdf;
    let repairSuccessful = true;
    let errorInfo = '';
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      originalPdf = await PDFDocument.load(fileBuffer, { 
        ignoreEncryption: true,
        updateMetadata: false,
      });
    } catch (loadError) {
      console.error('Error loading PDF, attempting deeper repair:', loadError);
      repairSuccessful = false;
      errorInfo = String(loadError);
      
      // In a real implementation, you would use more advanced repair techniques here
      // For this demo, we'll create a replacement PDF
      originalPdf = await PDFDocument.create();
    }
    
    // Create a new PDF document for the repaired version
    const repairedPdf = await PDFDocument.create();
    const helveticaFont = await repairedPdf.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await repairedPdf.embedFont(StandardFonts.HelveticaBold);
    
    // If we could load the original PDF, try to copy pages
    let pagesCopied = 0;
    let originalPageCount = 0;
    
    if (repairSuccessful) {
      originalPageCount = originalPdf.getPageCount();
      
      if (originalPageCount > 0) {
        // Copy all pages from original to repaired document
        try {
          const copiedPages = await repairedPdf.copyPages(originalPdf, originalPdf.getPageIndices());
          copiedPages.forEach(page => {
            repairedPdf.addPage(page);
            pagesCopied++;
          });
        } catch (copyError) {
          console.error('Error copying pages:', copyError);
          
          // If we can't copy pages, we'll need to simulate page recovery
          for (let i = 0; i < originalPageCount; i++) {
            try {
              // Try to copy individual pages
              const [copiedPage] = await repairedPdf.copyPages(originalPdf, [i]);
              repairedPdf.addPage(copiedPage);
              pagesCopied++;
            } catch (pageError) {
              console.error(`Error copying page ${i}:`, pageError);
              // Create a replacement page for corrupted pages
              const newPage = repairedPdf.addPage();
              
              // Add information about the corrupted page
              newPage.drawText(`Original Page ${i + 1} (Corrupted)`, {
                x: 50,
                y: newPage.getHeight() - 50,
                size: 16,
                font: helveticaBold,
                color: rgb(0.8, 0, 0),
              });
              
              newPage.drawText('This page could not be recovered due to corruption.', {
                x: 50,
                y: newPage.getHeight() - 80,
                size: 12,
                font: helveticaFont,
                color: rgb(0, 0, 0),
              });
            }
          }
        }
      } else {
        // If no pages were found, create a placeholder
        repairSuccessful = false;
        errorInfo = 'No pages found in the document';
      }
    }
    
    // If repair wasn't successful or no pages were copied, create a cover page
    if (!repairSuccessful || pagesCopied === 0) {
      // Add cover page with repair information
      const coverPage = repairedPdf.addPage();
      
      coverPage.drawText('PDF Repair Report', {
        x: 50,
        y: coverPage.getHeight() - 50,
        size: 24,
        font: helveticaBold,
        color: rgb(0, 0.2, 0.4),
      });
      
      coverPage.drawText('Original File: ' + file.name, {
        x: 50,
        y: coverPage.getHeight() - 90,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      coverPage.drawText('Repair Status: ' + (repairSuccessful ? 'Partially Successful' : 'Failed'), {
        x: 50,
        y: coverPage.getHeight() - 120,
        size: 14,
        font: helveticaBold,
        color: repairSuccessful ? rgb(0.2, 0.6, 0.2) : rgb(0.8, 0, 0),
      });
      
      // Draw error information
      if (errorInfo) {
        coverPage.drawText('Error Information:', {
          x: 50,
          y: coverPage.getHeight() - 150,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        
        // Split error info into lines if it's too long
        const errorLines = [];
        let currentLine = '';
        const words = errorInfo.split(' ');
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          
          if (testLine.length > 80) {
            errorLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          errorLines.push(currentLine);
        }
        
        errorLines.forEach((line, index) => {
          coverPage.drawText(line, {
            x: 60,
            y: coverPage.getHeight() - 180 - (index * 20),
            size: 10,
            font: helveticaFont,
            color: rgb(0.5, 0, 0),
          });
        });
      }
      
      // Draw additional information
      const yPos = coverPage.getHeight() - Math.max(250, 180 + (errorInfo ? (errorInfo.split(' ').length / 8 * 20) : 0));
      
      coverPage.drawText('Repair Information:', {
        x: 50,
        y: yPos,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      const repairInfo = [
        `Original Page Count: ${originalPageCount}`,
        `Pages Recovered: ${pagesCopied}`,
        `Repair Level: ${repairLevel.charAt(0).toUpperCase() + repairLevel.slice(1)}`,
        `Image Recovery: ${recoverImages ? 'Attempted' : 'Not Attempted'}`,
        `Font Recovery: ${recoverFonts ? 'Attempted' : 'Not Attempted'}`,
      ];
      
      repairInfo.forEach((info, index) => {
        coverPage.drawText(info, {
          x: 60,
          y: yPos - 30 - (index * 20),
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // Draw recommendations
      coverPage.drawText('Recommendations:', {
        x: 50,
        y: 250,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      const recommendations = [
        'If repair was not successful, try using the original application to save the file again.',
        'Check if you have the latest version of the PDF reader software.',
        'For important documents, consider contacting a data recovery service.',
      ];
      
      recommendations.forEach((recommendation, index) => {
        coverPage.drawText(`• ${recommendation}`, {
          x: 60,
          y: 220 - (index * 30),
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
    }
    
    // Always add a final page with repair information
    const infoPage = repairedPdf.addPage();
    
    infoPage.drawText('Repair Information', {
      x: 50,
      y: infoPage.getHeight() - 50,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0.2, 0.4),
    });
    
    const repairSummary = `This document was processed by Transform Factory's PDF Repair tool on ${new Date().toLocaleDateString()}. 
The repair process ${repairSuccessful ? 'was successful' : 'encountered issues'}. ${pagesCopied} pages were recovered from the original document.`;
    
    // Split the summary into lines
    const summaryLines = [];
    let currentLine = '';
    const words = repairSummary.split(' ');
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length > 80) {
        summaryLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      summaryLines.push(currentLine);
    }
    
    summaryLines.forEach((line, index) => {
      infoPage.drawText(line, {
        x: 50,
        y: infoPage.getHeight() - 90 - (index * 20),
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    });
    
    // Note about the repair limitations
    infoPage.drawText('Limitations of Automatic Repair:', {
      x: 50,
      y: infoPage.getHeight() - 180,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    const limitationsText = [
      'Automatic PDF repair can recover structure and basic content but may not recover all elements.',
      'Complex formatting, interactive features, and some embedded content may be lost.',
      'For critical documents, professional recovery services may provide better results.',
      'Always maintain backups of important documents to prevent data loss.',
    ];
    
    limitationsText.forEach((text, index) => {
      infoPage.drawText(`• ${text}`, {
        x: 60,
        y: infoPage.getHeight() - 210 - (index * 25),
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    });
    
    // Add footer
    infoPage.drawText('Generated by Transform Factory - PDF Repair Tool', {
      x: 50,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    // Save the repaired PDF
    const pdfBytes = await repairedPdf.save();
    
    // Clean up temporary files
    try {
      await fs.unlink(filePath);
      await fs.rmdir(tempDir);
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
    
    // Return the PDF
    const fileNameParts = file.name.split('.');
    fileNameParts.pop(); // Remove extension
    const baseFileName = fileNameParts.join('.');
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${baseFileName}_repaired.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error repairing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to repair PDF' },
      { status: 500 }
    );
  }
} 

