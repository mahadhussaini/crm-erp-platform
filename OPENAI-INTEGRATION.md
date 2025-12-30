# OpenAI Integration Guide

This document provides comprehensive guidance for integrating and using OpenAI's API in the CRM/ERP platform.

## 🚀 Overview

The platform includes a robust OpenAI integration that provides:
- **Chat Completions**: Conversational AI interactions
- **Text Generation**: Content creation and summarization
- **Image Generation**: DALL-E image creation and variation
- **Embeddings**: Semantic search and similarity matching
- **Content Moderation**: Text safety and compliance checking

## 📋 Prerequisites

### 1. OpenAI Account Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key (starts with `sk-`)
5. Copy the API key securely

### 2. Environment Configuration

Add the following to your `.env.local` file:

```env
# Required
OPENAI_API_KEY="sk-your-api-key-here"

# Optional (with defaults)
OPENAI_DEFAULT_MODEL="gpt-4.1-nano"
OPENAI_MAX_TOKENS="4000"
OPENAI_TEMPERATURE="0.7"
OPENAI_TIMEOUT="30000"
```

### 3. Production Deployment

For production environments:
- Set environment variables in your deployment platform (Vercel, Railway, etc.)
- Never commit API keys to version control
- Use different API keys for development and production
- Monitor API usage and set up billing alerts

## 🛠️ Service Architecture

The OpenAI integration is centralized in `src/lib/openai.ts` and follows these principles:

- **Error Handling**: Graceful degradation when API is unavailable
- **Validation**: API key format validation
- **Configuration**: Environment-based configuration
- **Type Safety**: Full TypeScript support
- **Logging**: Comprehensive error logging

## 📖 Usage Examples

### Basic Chat Completion

```typescript
import { createChatCompletion, ChatMessage } from '@/lib/openai'

export async function generateResponse(userMessage: string) {
  try {
    const messages: ChatMessage[] = [
      { role: 'user', content: userMessage }
    ]

    const completion = await createChatCompletion({
      messages,
      max_tokens: 500,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Chat completion failed:', error)
    throw error
  }
}
```

### Conversational AI with Context

```typescript
import { converseWithAI, ChatMessage } from '@/lib/openai'

export async function chatWithAI(
  conversationHistory: ChatMessage[],
  userMessage: string,
  systemPrompt?: string
) {
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  return await converseWithAI(messages, systemPrompt, {
    model: 'gpt-4.1-nano',
    temperature: 0.8
  })
}
```

### Text Summarization

```typescript
import { summarizeText } from '@/lib/openai'

export async function summarizeDocument(text: string, maxLength: number = 150) {
  return await summarizeText(text, maxLength, {
    model: 'gpt-4o-mini',
    temperature: 0.3 // Lower temperature for more consistent summaries
  })
}
```

### Code Generation

```typescript
import { generateCode } from '@/lib/openai'

export async function generateTypeScriptFunction(description: string) {
  return await generateCode(description, 'typescript', {
    max_tokens: 1000,
    temperature: 0.2 // Lower temperature for more deterministic code
  })
}
```

### Image Generation

```typescript
import { generateImage } from '@/lib/openai'

export async function createProductImage(description: string) {
  return await generateImage({
    prompt: description,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural'
  })
}
```

### Content Moderation

```typescript
import { moderateContent } from '@/lib/openai'

export async function checkContentSafety(text: string) {
  const result = await moderateContent({
    input: text,
    model: 'text-moderation-latest'
  })

  return result.results[0]?.flagged || false
}
```

### Semantic Search with Embeddings

```typescript
import { createEmbedding } from '@/lib/openai'

export async function findSimilarContent(query: string, contentList: string[]) {
  // Create embedding for the query
  const queryEmbedding = await createEmbedding({
    input: query,
    model: 'text-embedding-3-small'
  })

  // Create embeddings for all content
  const contentEmbeddings = await createEmbedding({
    input: contentList,
    model: 'text-embedding-3-small'
  })

  // Calculate similarities and return most similar content
  const similarities = contentEmbeddings.data.map((embedding, index) => ({
    content: contentList[index],
    similarity: cosineSimilarity(queryEmbedding.data[0].embedding, embedding.embedding)
  }))

  return similarities.sort((a, b) => b.similarity - a.similarity)
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}
```

## 🌐 API Routes

### Chat Completion API

Create `src/app/api/ai/chat/route.ts`:

```typescript
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
```

### Text Generation API

Create `src/app/api/ai/generate/route.ts`:

```typescript
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
```

### Image Generation API

Create `src/app/api/ai/image/route.ts`:

```typescript
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
```

### Summarization API

Create `src/app/api/ai/summarize/route.ts`:

```typescript
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
```

## 🎯 Use Cases in CRM/ERP

### 1. Intelligent Lead Scoring

```typescript
// Use embeddings to score leads based on company description similarity
import { createEmbedding } from '@/lib/openai'

export async function scoreLeadFit(companyDescription: string, idealCustomerProfile: string[]) {
  const [companyEmbedding, ...profileEmbeddings] = await createEmbedding({
    input: [companyDescription, ...idealCustomerProfile],
    model: 'text-embedding-3-small'
  })

  // Calculate similarity scores
  const scores = profileEmbeddings.data.map(embedding =>
    cosineSimilarity(companyEmbedding.data[0].embedding, embedding.embedding)
  )

  return Math.max(...scores)
}
```

### 2. Automated Email Generation

```typescript
import { generateText } from '@/lib/openai'

export async function generateFollowUpEmail(leadName: string, company: string, lastInteraction: string) {
  const prompt = `
  Write a professional follow-up email to ${leadName} from ${company}.
  Last interaction: ${lastInteraction}
  Keep it concise and personalized.
  `

  return await generateText(prompt, {
    max_tokens: 300,
    temperature: 0.7
  })
}
```

### 3. Meeting Summaries

```typescript
import { summarizeText } from '@/lib/openai'

export async function summarizeMeetingNotes(notes: string) {
  const prompt = `Summarize these meeting notes, highlighting key decisions, action items, and next steps:`

  return await summarizeText(`${prompt}\n\n${notes}`, 200, {
    model: 'gpt-4.1-nano',
    temperature: 0.3
  })
}
```

### 4. Content Moderation

```typescript
import { moderateContent } from '@/lib/openai'

export async function validateUserInput(text: string): Promise<boolean> {
  const moderation = await moderateContent({ input: text })

  if (moderation.results[0]?.flagged) {
    console.warn('Content flagged by OpenAI moderation:', moderation.results[0])
    return false
  }

  return true
}
```

## 🔧 Configuration Options

### Model Selection

```typescript
// GPT-4o models (recommended for most use cases)
const models = {
  'gpt-4o': 'Most capable model, higher cost',
  'gpt-4.1-nano': 'Fast and cost-effective for most tasks',
  'gpt-4-turbo': 'Legacy GPT-4 with larger context',
  'gpt-3.5-turbo': 'Fast and inexpensive'
}

// Embedding models
const embeddingModels = {
  'text-embedding-3-small': 'Cost-effective for search',
  'text-embedding-3-large': 'Higher accuracy, higher cost',
  'text-embedding-ada-002': 'Legacy embedding model'
}
```

### Temperature Settings

```typescript
const temperatureSettings = {
  0.0: 'Deterministic, factual responses',
  0.3: 'Low creativity, consistent results',
  0.7: 'Balanced creativity and consistency (default)',
  1.0: 'High creativity, varied responses',
  2.0: 'Maximum creativity, unpredictable'
}
```

## 🛡️ Error Handling

The OpenAI service includes comprehensive error handling:

```typescript
import { isOpenAIAvailable, getOpenAIErrorMessage } from '@/lib/openai'

export async function safeAIRequest() {
  if (!isOpenAIAvailable()) {
    console.warn('OpenAI not available:', getOpenAIErrorMessage())
    return { fallback: true, message: 'AI features temporarily unavailable' }
  }

  try {
    // Your OpenAI API call here
    return await someOpenAIFunction()
  } catch (error: any) {
    if (error.status === 429) {
      // Rate limited - implement backoff
      return { retry: true, delay: 60000 }
    } else if (error.status === 401) {
      // Invalid API key
      console.error('OpenAI API key invalid')
      return { error: 'Configuration error' }
    } else {
      // Other errors
      console.error('OpenAI API error:', error)
      return { error: 'AI service temporarily unavailable' }
    }
  }
}
```

## 📊 Monitoring and Analytics

### API Usage Tracking

```typescript
// Track API usage for cost monitoring
export async function trackOpenAIUsage(response: any, operation: string) {
  const usage = response?.usage
  if (usage) {
    console.log(`OpenAI ${operation} usage:`, {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      estimatedCost: calculateCost(usage.total_tokens, operation)
    })
  }
}

function calculateCost(totalTokens: number, operation: string): number {
  // Implement cost calculation based on OpenAI pricing
  const rates = {
    'chat': 0.002,     // $0.002 per 1K tokens for GPT-4o-mini
    'embedding': 0.0001, // $0.0001 per 1K tokens for embeddings
    'image': 0.04      // $0.04 per image for DALL-E
  }

  return (totalTokens / 1000) * (rates[operation] || 0.002)
}
```

## 🔒 Security Best Practices

1. **API Key Management**
   - Store keys in environment variables only
   - Use different keys for development/production
   - Rotate keys regularly
   - Monitor usage for unauthorized access

2. **Input Validation**
   - Always validate user inputs before sending to OpenAI
   - Implement rate limiting on AI endpoints
   - Use content moderation for user-generated content

3. **Error Handling**
   - Don't expose internal errors to users
   - Implement graceful degradation
   - Log errors securely without exposing sensitive data

4. **Cost Control**
   - Set API usage limits
   - Monitor spending regularly
   - Implement caching for repeated requests

## 🚀 Deployment Considerations

### Environment Variables

```env
# Production environment variables
OPENAI_API_KEY="sk-production-key-here"
OPENAI_DEFAULT_MODEL="gpt-4.1-nano"
OPENAI_MAX_TOKENS="2000"  # Lower for cost control
OPENAI_TEMPERATURE="0.7"
OPENAI_TIMEOUT="25000"    # Shorter timeout for better UX
```

### Vercel Deployment

Add these variables in your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each OpenAI variable
3. Redeploy your application

### Docker Deployment

```dockerfile
# Add to your Dockerfile
ENV OPENAI_API_KEY="your-key-here"
ENV OPENAI_DEFAULT_MODEL="gpt-4.1-nano"
```

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/best-practices)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check if the API key starts with `sk-`
   - Verify the key is copied correctly
   - Ensure the key has credits

2. **Rate limiting errors**
   - Implement exponential backoff
   - Reduce request frequency
   - Consider upgrading your OpenAI plan

3. **Timeout errors**
   - Increase `OPENAI_TIMEOUT` value
   - Check your network connection
   - Consider using smaller models for faster responses

4. **High costs**
   - Monitor usage regularly
   - Use smaller models when possible
   - Implement caching for repeated requests
   - Set maximum token limits

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV="development"
```

This will provide more detailed error messages in the console.
