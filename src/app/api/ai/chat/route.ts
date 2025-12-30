import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion, ChatMessage } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { messages, options = {} } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const completion = await createChatCompletion({
      messages: messages as ChatMessage[],
      ...options
    })

    return NextResponse.json({
      success: true,
      data: completion
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate chat response',
        message: error.message
      },
      { status: 500 }
    )
  }
}
