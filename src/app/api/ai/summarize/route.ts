import { NextRequest, NextResponse } from 'next/server'
import { summarizeText } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { text, maxLength = 150, options = {} } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text string is required' },
        { status: 400 }
      )
    }

    const summary = await summarizeText(text, maxLength, options)

    return NextResponse.json({
      success: true,
      data: { summary }
    })
  } catch (error: any) {
    console.error('Summarization API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to summarize text',
        message: error.message
      },
      { status: 500 }
    )
  }
}
