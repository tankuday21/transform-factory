import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import ffmpegStatic from 'ffmpeg-static'

const execPromise = promisify(exec)

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
    const tempInputPath = path.join(tempDir, `input-${uuidv4()}.${file.name.split('.').pop()}`)
    const tempOutputPath = path.join(tempDir, `output-${uuidv4()}.${outputFormat}`)
    
    // Get file buffer and save to temp location
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempInputPath, buffer)
    
    // Check if ffmpeg is available
    if (!ffmpegStatic) {
      throw new Error('FFmpeg is not available')
    }
    
    // Convert video using FFmpeg
    const ffmpegCmd = `"${ffmpegStatic}" -i "${tempInputPath}" -y "${tempOutputPath}"`
    
    try {
      await execPromise(ffmpegCmd)
    } catch (error) {
      console.error('FFmpeg error:', error)
      throw new Error('Video conversion failed')
    }
    
    // Read the converted file
    const convertedFile = await fs.readFile(tempOutputPath)
    
    // Clean up temp files
    await fs.unlink(tempInputPath).catch(console.error)
    await fs.unlink(tempOutputPath).catch(console.error)
    
    // Map output format to content type
    const contentTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm'
    }
    
    const contentType = contentTypeMap[outputFormat.toLowerCase()] || 'video/mp4'
    
    // Return the converted file
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    })
  } catch (error) {
    console.error('Video conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert video', details: (error as Error).message },
      { status: 500 }
    )
  }
} 