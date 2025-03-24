import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

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

// Convert image using sharp
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const { file, outputFormat } = await parseFormData(request)
    
    // Generate temp file path
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `${uuidv4()}.${outputFormat}`)
    
    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Process image with sharp
    let sharpInstance = sharp(buffer)
    
    // Convert to the requested format
    switch (outputFormat.toLowerCase()) {
      case 'png':
        sharpInstance = sharpInstance.png()
        break
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg()
        break
      case 'webp':
        sharpInstance = sharpInstance.webp()
        break
      case 'gif':
        sharpInstance = sharpInstance.gif()
        break
      case 'bmp':
        // Sharp doesn't have a direct bmp() method
        // Convert to PNG instead as BMP is not directly supported
        sharpInstance = sharpInstance.png()
        // Note: In a real app, you might use a different library or approach for BMP conversion
        console.warn('BMP format requested but not directly supported by Sharp - using PNG instead')
        break
      default:
        throw new Error(`Unsupported output format: ${outputFormat}`)
    }
    
    // Convert and save to temp file
    const outputBuffer = await sharpInstance.toBuffer()
    await fs.writeFile(tempFilePath, outputBuffer)
    
    // Read the file and return it
    const convertedFile = await fs.readFile(tempFilePath)
    
    // Clean up the temp file
    await fs.unlink(tempFilePath).catch(console.error)
    
    // Return the converted file
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Type': `image/${outputFormat}`,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    })
  } catch (error) {
    console.error('Image conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert image' },
      { status: 500 }
    )
  }
} 