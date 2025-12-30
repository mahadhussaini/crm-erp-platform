import { NextRequest, NextResponse } from 'next/server'
import { isOpenAIAvailable, getOpenAIErrorMessage, OPENAI_CONFIG } from '@/lib/openai'

export async function GET(request: NextRequest) {
  try {
    const available = isOpenAIAvailable()

    const healthStatus: any = {
      service: 'OpenAI Integration',
      status: available ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      available,
      config: {
        defaultModel: OPENAI_CONFIG.defaultModel,
        maxTokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        timeout: OPENAI_CONFIG.timeout
      }
    }

    if (!available) {
      healthStatus.error = getOpenAIErrorMessage()
      return NextResponse.json(healthStatus, { status: 503 })
    }

    return NextResponse.json(healthStatus)
  } catch (error: any) {
    console.error('AI Health check error:', error)

    return NextResponse.json(
      {
        service: 'OpenAI Integration',
        status: 'error',
        timestamp: new Date().toISOString(),
        available: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
