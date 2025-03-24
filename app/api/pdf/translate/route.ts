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

// Parse form data from the request
async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  
  const file = formData.get('file') as File;
  const targetLanguage = formData.get('targetLanguage') as string || 'es';
  const preserveLayout = formData.get('preserveLayout') === 'true';
  const qualityLevel = formData.get('qualityLevel') as string || 'standard';
  const includeImages = formData.get('includeImages') === 'true';
  const pageRange = formData.get('pageRange') as string || 'all';
  
  return {
    file,
    targetLanguage,
    preserveLayout,
    qualityLevel,
    includeImages,
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
    // For this demo, we're simulating text extraction with sample text for each page
    const extractedTextByPage = pagesToExtract.map(pageIndex => {
      return {
        pageIndex,
        text: `This is sample text from page ${pageIndex + 1} of the PDF document. In a real implementation, this would be the actual text extracted from the PDF page.`
      };
    });
    
    return {
      pageCount,
      extractedTextByPage,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Helper function to translate text (simulated)
async function translateText(text: string, targetLanguage: string) {
  // In a real implementation, this would use a translation API like Google Translate,
  // DeepL, or Microsoft Translator API
  
  // For this demo, we'll simulate translation with sample text
  const languageSamples: Record<string, string> = {
    'es': 'Este es un texto traducido al español. En una implementación real, se utilizaría una API de traducción.',
    'fr': 'Ceci est un texte traduit en français. Dans une implémentation réelle, une API de traduction serait utilisée.',
    'de': 'Dies ist ein ins Deutsche übersetzter Text. In einer realen Implementierung würde eine Übersetzungs-API verwendet werden.',
    'it': 'Questo è un testo tradotto in italiano. In un\'implementazione reale, verrebbe utilizzata un\'API di traduzione.',
    'pt': 'Este é um texto traduzido para o português. Em uma implementação real, uma API de tradução seria usada.',
    'ja': 'これは日本語に翻訳されたテキストです。実際の実装では、翻訳APIが使用されます。',
    'zh': '这是翻译成中文的文本。在实际实现中，将使用翻译API。',
    'ru': 'Это текст, переведенный на русский язык. В реальной реализации будет использоваться API перевода.',
    'hi': 'यह हिंदी में अनुवादित पाठ है। वास्तविक कार्यान्वयन में, एक अनुवाद API का उपयोग किया जाएगा।',
    'ar': 'هذا نص مترجم إلى اللغة العربية. في التنفيذ الفعلي ، سيتم استخدام واجهة برمجة تطبيقات الترجمة.',
  };
  
  // Return translated text for the target language, or a default message if language not supported
  return languageSamples[targetLanguage] || 
    `This is simulated translated text for language code "${targetLanguage}". In a real implementation, a translation API would be used.`;
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const { file, targetLanguage, preserveLayout, qualityLevel, includeImages, pageRange } = await parseForm(req);
    
    // Check if file is provided
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    // Create a temporary directory to store files
    const tempDir = path.join(os.tmpdir(), 'pdf-translate-' + Date.now());
    await fs.mkdir(tempDir, { recursive: true });
    
    try {
      // Save uploaded file
      const filePath = path.join(tempDir, file.name);
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      
      // Extract text from PDF
      const pdfBuffer = await fs.readFile(filePath);
      const { pageCount, extractedTextByPage } = await extractTextFromPdf(pdfBuffer, pageRange);
      
      // Translate the extracted text
      const translatedPages = [];
      for (const page of extractedTextByPage) {
        const translatedText = await translateText(page.text, targetLanguage);
        translatedPages.push({
          pageIndex: page.pageIndex,
          translatedText,
        });
      }
      
      // Create a new PDF with the translated text
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add a cover page with translation details
      const coverPage = pdfDoc.addPage();
      const { width, height } = coverPage.getSize();
      
      // Title
      coverPage.drawText('Translated PDF Document', {
        x: 50,
        y: height - 100,
        size: 24,
        font: helveticaBold,
        color: rgb(0, 0.2, 0.4),
      });
      
      // Document info
      const languageNames: Record<string, string> = {
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ru': 'Russian',
        'hi': 'Hindi',
        'ar': 'Arabic',
      };
      
      const languageName = languageNames[targetLanguage] || targetLanguage;
      
      coverPage.drawText(`Original Document: ${file.name}`, {
        x: 50,
        y: height - 150,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      coverPage.drawText(`Translated to: ${languageName}`, {
        x: 50,
        y: height - 180,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      coverPage.drawText(`Total Pages: ${pageCount}`, {
        x: 50,
        y: height - 210,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      coverPage.drawText(`Translation Quality: ${qualityLevel.charAt(0).toUpperCase() + qualityLevel.slice(1)}`, {
        x: 50,
        y: height - 240,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Add translation date
      coverPage.drawText(`Translation Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: height - 270,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      // Add translated pages
      for (const translatedPage of translatedPages) {
        const page = pdfDoc.addPage();
        
        // Page header
        page.drawText(`Page ${translatedPage.pageIndex + 1}`, {
          x: 50,
          y: page.getHeight() - 50,
          size: 14,
          font: helveticaBold,
          color: rgb(0, 0.2, 0.4),
        });
        
        // Draw translated text
        const textLines = translatedPage.translatedText.split('\n');
        textLines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: 50,
            y: page.getHeight() - 100 - (lineIndex * 20),
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        });
        
        // Add a note about images if they're included
        if (includeImages) {
          page.drawText('Note: In a real implementation, images from the original document would be preserved here.', {
            x: 50,
            y: 100,
            size: 10,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }
      
      // Add a footer note
      const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
      lastPage.drawText('Translated by Transform Factory', {
        x: 50,
        y: 50,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Save the translated PDF
      const pdfBytes = await pdfDoc.save();
      
      // Clean up temporary files
      await fs.unlink(filePath);
      await fs.rmdir(tempDir);
      
      // Prepare filename for the translated PDF
      const fileNameParts = file.name.split('.');
      fileNameParts.pop(); // Remove extension
      const baseFileName = fileNameParts.join('.');
      const translatedFileName = `${baseFileName}_${targetLanguage}.pdf`;
      
      // Return the PDF
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${translatedFileName}"`,
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
    console.error('Error translating PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to translate PDF' },
      { status: 500 }
    );
  }
} 
