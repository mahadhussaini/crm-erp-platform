import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024', quality = 'standard', style = 'natural' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt string is required' },
        { status: 400 }
      )
    }

    const image = await generateImage({
      prompt,
      size,
      quality,
      style
    })

    return NextResponse.json({
      success: true,
      data: image
    })
  } catch (error: any) {
    console.error('Image generation API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        message: error.message
      },
      { status: 500 }
    )
  }
}
