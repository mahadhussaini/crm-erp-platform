import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, options = {} } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt string is required' },
        { status: 400 }
      )
    }

    const generatedText = await generateText(prompt, options)

    return NextResponse.json({
      success: true,
      data: { text: generatedText }
    })
  } catch (error: any) {
    console.error('Text generation API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate text',
        message: error.message
      },
      { status: 500 }
    )
  }
}
