import OpenAI from "openai"

// Validate OpenAI API key format
function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys start with 'sk-' for secret keys
  return apiKey.startsWith('sk-') && apiKey.length > 20
}

// Check if OpenAI is properly configured
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not configured. OpenAI features will not work.")
} else if (!validateApiKey(process.env.OPENAI_API_KEY)) {
  console.warn("OPENAI_API_KEY appears to be invalid. Please check your API key format.")
}

// Initialize OpenAI client conditionally
const openai = process.env.OPENAI_API_KEY && validateApiKey(process.env.OPENAI_API_KEY)
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null as OpenAI | null

export default openai

// Configuration constants
export const OPENAI_CONFIG = {
  defaultModel: process.env.OPENAI_DEFAULT_MODEL || "gpt-4.1-nano",
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  timeout: parseInt(process.env.OPENAI_TIMEOUT || "30000"), // 30 seconds
}

// Helper function to check if OpenAI is available
export function isOpenAIAvailable(): boolean {
  return openai !== null
}

// Helper function to get OpenAI configuration error message
export function getOpenAIErrorMessage(): string {
  if (!process.env.OPENAI_API_KEY) {
    return "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable."
  }
  if (!validateApiKey(process.env.OPENAI_API_KEY)) {
    return "OpenAI API key appears to be invalid. Please check your API key format (should start with 'sk-')."
  }
  return "OpenAI service is not available."
}

// Chat completion functions
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  name?: string
  tool_calls?: any[]
  tool_call_id?: string
}

export interface ChatCompletionOptions {
  model?: string
  messages: ChatMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
  user?: string
  stream?: boolean
}

export async function createChatCompletion(options: ChatCompletionOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const completion = await openai.chat.completions.create({
      model: options.model || OPENAI_CONFIG.defaultModel,
      messages: options.messages,
      max_tokens: options.max_tokens || OPENAI_CONFIG.maxTokens,
      temperature: options.temperature ?? OPENAI_CONFIG.temperature,
      ...options,
    })

    return completion
  } catch (error: any) {
    console.error("OpenAI chat completion error:", error)

    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API. Please check your parameters.")
    } else {
      throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`)
    }
  }
}

// Text completion (legacy GPT-3 models)
export interface TextCompletionOptions {
  model?: string
  prompt: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
  user?: string
}

export async function createTextCompletion(options: TextCompletionOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const completion = await openai.completions.create({
      model: options.model || "text-davinci-003",
      prompt: options.prompt,
      max_tokens: options.max_tokens || OPENAI_CONFIG.maxTokens,
      temperature: options.temperature ?? OPENAI_CONFIG.temperature,
      ...options,
    })

    return completion
  } catch (error: any) {
    console.error("OpenAI text completion error:", error)

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API. Please check your parameters.")
    } else {
      throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`)
    }
  }
}

// Image generation with DALL-E
export interface ImageGenerationOptions {
  prompt: string
  n?: number
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
  style?: "vivid" | "natural"
  user?: string
}

export async function generateImage(options: ImageGenerationOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: options.prompt,
      n: options.n || 1,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      style: options.style || "vivid",
      user: options.user,
    })

    return image
  } catch (error: any) {
    console.error("OpenAI image generation error:", error)

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 400) {
      throw new Error("Invalid image generation request. Please check your prompt and parameters.")
    } else {
      throw new Error(`OpenAI image generation error: ${error.message || "Unknown error"}`)
    }
  }
}

// Image variation
export interface ImageVariationOptions {
  image: File | Buffer
  n?: number
  size?: "256x256" | "512x512" | "1024x1024"
  user?: string
}

export async function createImageVariation(options: ImageVariationOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const variation = await openai.images.createVariation({
      image: options.image,
      n: options.n || 1,
      size: options.size || "1024x1024",
      user: options.user,
    })

    return variation
  } catch (error: any) {
    console.error("OpenAI image variation error:", error)

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 400) {
      throw new Error("Invalid image variation request. Please check your image and parameters.")
    } else {
      throw new Error(`OpenAI image variation error: ${error.message || "Unknown error"}`)
    }
  }
}

// Embeddings for semantic search
export interface EmbeddingOptions {
  input: string | string[]
  model?: string
  encoding_format?: "float" | "base64"
  dimensions?: number
  user?: string
}

export async function createEmbedding(options: EmbeddingOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const embedding = await openai.embeddings.create({
      model: options.model || "text-embedding-3-small",
      input: options.input,
      encoding_format: options.encoding_format,
      dimensions: options.dimensions,
      user: options.user,
    })

    return embedding
  } catch (error: any) {
    console.error("OpenAI embedding error:", error)

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 400) {
      throw new Error("Invalid embedding request. Please check your input and parameters.")
    } else {
      throw new Error(`OpenAI embedding error: ${error.message || "Unknown error"}`)
    }
  }
}

// Moderation API
export interface ModerationOptions {
  input: string | string[]
  model?: string
}

export async function moderateContent(options: ModerationOptions) {
  if (!openai) {
    throw new Error(getOpenAIErrorMessage())
  }

  try {
    const moderation = await openai.moderations.create({
      model: options.model || "text-moderation-latest",
      input: options.input,
    })

    return moderation
  } catch (error: any) {
    console.error("OpenAI moderation error:", error)

    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your credentials.")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else {
      throw new Error(`OpenAI moderation error: ${error.message || "Unknown error"}`)
    }
  }
}

// Utility functions for common use cases

// Simple text generation
export async function generateText(
  prompt: string,
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "user", content: prompt }
  ]

  const completion = await createChatCompletion({
    messages,
    ...options,
  })

  return completion.choices[0]?.message?.content || ""
}

// Conversational AI with context
export async function converseWithAI(
  messages: ChatMessage[],
  systemPrompt?: string,
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const conversationMessages = systemPrompt
    ? [{ role: "system" as const, content: systemPrompt }, ...messages]
    : messages

  const completion = await createChatCompletion({
    messages: conversationMessages,
    ...options,
  })

  return completion.choices[0]?.message?.content || ""
}

// Code generation helper
export async function generateCode(
  description: string,
  language: string = "javascript",
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const prompt = `Generate ${language} code for: ${description}. Provide only the code without explanation.`

  const messages: ChatMessage[] = [
    { role: "user", content: prompt }
  ]

  const completion = await createChatCompletion({
    messages,
    ...options,
  })

  return completion.choices[0]?.message?.content || ""
}

// Summarization helper
export async function summarizeText(
  text: string,
  maxLength: number = 150,
  options: Partial<ChatCompletionOptions> = {}
): Promise<string> {
  const prompt = `Summarize the following text in ${maxLength} words or less:\n\n${text}`

  const messages: ChatMessage[] = [
    { role: "user", content: prompt }
  ]

  const completion = await createChatCompletion({
    messages,
    max_tokens: Math.min(maxLength * 2, OPENAI_CONFIG.maxTokens),
    ...options,
  })

  return completion.choices[0]?.message?.content || ""
}
