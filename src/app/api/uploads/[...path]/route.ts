import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params
    const imagePath = params.path.join('/')
    
    if (!imagePath || imagePath.includes('..') || !imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', imagePath)
    
    if (!existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    const extension = imagePath.split('.').pop()?.toLowerCase()
    let contentType = 'image/jpeg'
    
    switch (extension) {
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      default:
        contentType = 'image/jpeg'
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 