import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { PDFDocument } from 'pdf-lib'
import { Document, Packer, Paragraph } from 'docx'
import * as XLSX from 'xlsx'

// Utility to parse multipart/form-data
async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const outputFormat = formData.get('outputFormat') as string | null

  if (!file || !outputFormat) {
    throw new Error('File and output format are required')
  }

  return { file, outputFormat }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const { file, outputFormat } = await parseFormData(request)
    
    // Generate temp file paths
    const tempDir = os.tmpdir()
    const tempInputPath = path.join(tempDir, `${uuidv4()}.${file.name.split('.').pop()}`)
    const tempOutputPath = path.join(tempDir, `${uuidv4()}.${outputFormat}`)
    
    // Get file buffer and save to temp location
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempInputPath, buffer)
    
    // Variables for response
    let convertedFileBuffer: Buffer
    let contentType = 'application/octet-stream'
    
    // Process document based on input and output formats
    const inputFormat = file.name.split('.').pop()?.toLowerCase()
    
    if (inputFormat === 'pdf' && outputFormat === 'docx') {
      // PDF to DOCX conversion
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPages()
      
      // Simple extraction (basic text only)
      const doc = new Document()
      
      // Extract text from PDF (simplified)
      // In a real app, this would be more sophisticated with better text extraction
      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            text: `Converted from PDF (${pages.length} pages)`,
          }),
        ],
      })
      
      convertedFileBuffer = await Packer.toBuffer(doc)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } 
    else if (inputFormat === 'docx' && outputFormat === 'pdf') {
      // DOCX to PDF (simplified)
      // In a real app, this would use a more sophisticated conversion library
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      page.drawText('Converted from DOCX', {
        x: 50,
        y: page.getHeight() - 50,
      })
      
      convertedFileBuffer = await pdfDoc.save()
      contentType = 'application/pdf'
    }
    else if ((inputFormat === 'xlsx' || inputFormat === 'xls') && outputFormat === 'csv') {
      // Excel to CSV
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheet = workbook.SheetNames[0]
      const csvOutput = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet])
      
      convertedFileBuffer = Buffer.from(csvOutput)
      contentType = 'text/csv'
    }
    else if (inputFormat === 'csv' && (outputFormat === 'xlsx' || outputFormat === 'xls')) {
      // CSV to Excel
      const workbook = XLSX.utils.book_new()
      const csvData = buffer.toString('utf8')
      const worksheet = XLSX.utils.csv_to_sheet(csvData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      convertedFileBuffer = Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: outputFormat }))
      contentType = outputFormat === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel'
    }
    else {
      throw new Error(`Conversion from ${inputFormat} to ${outputFormat} is not supported yet`)
    }
    
    // Clean up temp files
    await fs.unlink(tempInputPath).catch(console.error)
    
    // Return the converted file
    return new NextResponse(convertedFileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    })
  } catch (error) {
    console.error('Document conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert document', details: (error as Error).message },
      { status: 500 }
    )
  }
} 