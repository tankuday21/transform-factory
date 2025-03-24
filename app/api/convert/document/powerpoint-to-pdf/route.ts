import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse form data
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  const presentation = formData.get('presentation') as File;
  const quality = formData.get('quality') as string || 'high';
  const includeNotes = formData.get('includeNotes') === 'true';
  const pageRange = formData.get('pageRange') as string || 'all';

  return { presentation, quality, includeNotes, pageRange };
}

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const { presentation, quality, includeNotes, pageRange } = await parseForm(req);

    // Check if the presentation exists
    if (!presentation) {
      return NextResponse.json(
        { error: 'No presentation provided' },
        { status: 400 }
      );
    }

    // Check if the file is a PowerPoint presentation
    const isPowerPointFile = /\.(ppt|pptx)$/i.test(presentation.name);
    if (!isPowerPointFile) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a PowerPoint presentation (.ppt or .pptx)' },
        { status: 400 }
      );
    }

    // Read the presentation file as buffer
    const buffer = Buffer.from(await presentation.arrayBuffer());

    // Create a temporary directory to store the input/output files
    const tempDir = path.join(os.tmpdir(), 'powerpoint-to-pdf-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write the presentation to the temp directory
    const inputPath = path.join(tempDir, presentation.name);
    await fs.writeFile(inputPath, buffer);

    // Parse page range (for demonstration, we'll create 5 slides, but only show those in the range)
    let slidesToInclude: number[] = [];
    const totalSlides = 5; // In a real scenario, we would get this from the actual presentation
    
    if (pageRange === 'all') {
      slidesToInclude = Array.from({ length: totalSlides }, (_, i) => i + 1);
    } else {
      try {
        // Parse ranges like "1-3,5,7-9"
        const ranges = pageRange.split(',');
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start; i <= end; i++) {
              if (i > 0 && i <= totalSlides && !slidesToInclude.includes(i)) {
                slidesToInclude.push(i);
              }
            }
          } else {
            const slide = parseInt(range, 10);
            if (slide > 0 && slide <= totalSlides && !slidesToInclude.includes(slide)) {
              slidesToInclude.push(slide);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing page range:", error);
        slidesToInclude = Array.from({ length: totalSlides }, (_, i) => i + 1);
      }
    }
    
    // Sort the slides in ascending order
    slidesToInclude.sort((a, b) => a - b);

    // For demo purposes, we'll create a PDF with sample slides using pdf-lib
    // In a real implementation, you would use a proper conversion library
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Create sample slides based on the page range
    for (const slideNumber of slidesToInclude) {
      // Create a slide (PDF page)
      const page = pdfDoc.addPage([792, 612]); // Landscape slide
      const { width, height } = page.getSize();
      
      // Add slide number in the corner
      page.drawText(`Slide ${slideNumber}`, {
        x: width - 80,
        y: 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Add a slide title
      page.drawText(`Sample Slide ${slideNumber}`, {
        x: 50,
        y: height - 80,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Add slide content based on slide number
      switch (slideNumber) {
        case 1:
          // Title slide
          page.drawText('Presentation Title', {
            x: width / 2 - 100,
            y: height / 2 + 50,
            size: 30,
            font: boldFont,
            color: rgb(0, 0.3, 0.6),
          });
          
          page.drawText('Presented by Transform Factory', {
            x: width / 2 - 100,
            y: height / 2,
            size: 16,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          break;
          
        case 2:
          // Content slide with bullet points
          page.drawText('Key Points:', {
            x: 50,
            y: height - 120,
            size: 16,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          
          const bulletPoints = [
            'First important point about the topic',
            'Second key consideration to remember',
            'Third element with supporting details',
            'Final conclusion and summary'
          ];
          
          bulletPoints.forEach((point, index) => {
            page.drawText('•', {
              x: 50,
              y: height - 160 - index * 30,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            });
            
            page.drawText(point, {
              x: 70,
              y: height - 160 - index * 30,
              size: 14,
              font,
              color: rgb(0, 0, 0),
            });
          });
          break;
          
        case 3:
          // Chart slide
          page.drawText('Sample Chart', {
            x: 50,
            y: height - 120,
            size: 16,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          
          // Draw a simple bar chart
          const barWidth = 60;
          const barSpacing = 30;
          const barMaxHeight = 200;
          const barValues = [0.3, 0.7, 0.5, 0.9];
          const barColors = [
            rgb(0.2, 0.4, 0.6),
            rgb(0.8, 0.3, 0.3),
            rgb(0.3, 0.7, 0.3),
            rgb(0.7, 0.5, 0.2)
          ];
          
          // Draw bars
          barValues.forEach((value, index) => {
            const barHeight = value * barMaxHeight;
            const barX = 150 + index * (barWidth + barSpacing);
            const barY = 150;
            
            page.drawRectangle({
              x: barX,
              y: barY,
              width: barWidth,
              height: barHeight,
              color: barColors[index],
            });
            
            // Draw value
            page.drawText((value * 100).toFixed(0) + '%', {
              x: barX + barWidth / 2 - 10,
              y: barY + barHeight + 10,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            });
            
            // Draw label
            page.drawText(`Item ${index + 1}`, {
              x: barX + barWidth / 2 - 20,
              y: barY - 20,
              size: 10,
              font,
              color: rgb(0, 0, 0),
            });
          });
          break;
          
        case 4:
          // Image placeholder slide
          page.drawText('Image Slide', {
            x: 50,
            y: height - 120,
            size: 16,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          
          // Draw image placeholder
          const imgX = width / 2 - 150;
          const imgY = height / 2 - 100;
          const imgWidth = 300;
          const imgHeight = 200;
          
          page.drawRectangle({
            x: imgX,
            y: imgY,
            width: imgWidth,
            height: imgHeight,
            color: rgb(0.9, 0.9, 0.9),
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1,
          });
          
          page.drawText('Image Placeholder', {
            x: imgX + imgWidth / 2 - 60,
            y: imgY + imgHeight / 2,
            size: 14,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          
          page.drawText('Caption: Sample image description', {
            x: imgX + imgWidth / 2 - 100,
            y: imgY - 20,
            size: 12,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          break;
          
        case 5:
          // Conclusion slide
          page.drawText('Conclusion', {
            x: 50,
            y: height - 120,
            size: 16,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          
          page.drawText('Thank you for your attention!', {
            x: width / 2 - 120,
            y: height / 2,
            size: 20,
            font: boldFont,
            color: rgb(0, 0.5, 0.3),
          });
          
          page.drawText('Questions?', {
            x: width / 2 - 40,
            y: height / 2 - 40,
            size: 16,
            font,
            color: rgb(0, 0, 0),
          });
          
          page.drawText('contact@example.com', {
            x: width / 2 - 70,
            y: height / 2 - 70,
            size: 12,
            font,
            color: rgb(0, 0, 0.8),
          });
          break;
      }
      
      // Add speaker notes if requested
      if (includeNotes) {
        // Add a line to separate notes
        page.drawLine({
          start: { x: 0, y: 100 },
          end: { x: width, y: 100 },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        page.drawText('Speaker Notes:', {
          x: 50,
          y: 80,
          size: 10,
          font: boldFont,
          color: rgb(0.4, 0.4, 0.4),
        });
        
        // Add different notes for each slide
        const notes = [
          'Welcome the audience and introduce the presentation topic.',
          'Emphasize the first point and relate it to real-world examples.',
          'Explain the data represented in the chart and its significance.',
          'Describe the image in detail and explain its relevance.',
          'Summarize key points and open the floor for questions.'
        ];
        
        page.drawText(notes[slideNumber - 1], {
          x: 50,
          y: 60,
          size: 9,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }
    
    // Add conversion information at the end
    const infoPage = pdfDoc.addPage([612, 792]);
    const { width: infoWidth, height: infoHeight } = infoPage.getSize();
    
    infoPage.drawText('Conversion Information', {
      x: 50,
      y: infoHeight - 50,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText(`Presentation: ${presentation.name}`, {
      x: 50,
      y: infoHeight - 100,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText(`Quality: ${quality}`, {
      x: 50,
      y: infoHeight - 120,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText(`Speaker Notes: ${includeNotes ? 'Included' : 'Not included'}`, {
      x: 50,
      y: infoHeight - 140,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText(`Page Range: ${pageRange}`, {
      x: 50,
      y: infoHeight - 160,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText(`Included Slides: ${slidesToInclude.join(', ')}`, {
      x: 50,
      y: infoHeight - 180,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    
    infoPage.drawText('Note: This is a demonstration of PowerPoint to PDF conversion.', {
      x: 50,
      y: infoHeight - 220,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    infoPage.drawText('In a production environment, all graphics, animations, and formatting would be preserved.', {
      x: 50,
      y: infoHeight - 240,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add a "watermark"
    infoPage.drawText('Transform Factory | PowerPoint to PDF Conversion', {
      x: 150,
      y: 50,
      size: 12,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.5,
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Prepare the output filename
    const outputFilename = presentation.name.replace(/\.(ppt|pptx)$/i, '.pdf');
    
    // Clean up temporary directory
    try {
      await fs.unlink(inputPath);
      await fs.rmdir(tempDir);
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
    
    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (error) {
    console.error('Error converting PowerPoint to PDF:', error);
    return NextResponse.json(
      { error: 'An error occurred while converting the presentation' },
      { status: 500 }
    );
  }
} 