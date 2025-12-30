"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Copy, RefreshCw, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AITextGeneratorProps {
  className?: string
  title?: string
  description?: string
  placeholder?: string
  templates?: { label: string; prompt: string }[]
  onGenerated?: (text: string) => void
}

const defaultTemplates = [
  {
    label: "Email Draft",
    prompt: "Write a professional email about"
  },
  {
    label: "Product Description",
    prompt: "Write a compelling product description for"
  },
  {
    label: "Meeting Summary",
    prompt: "Summarize the key points from this meeting:"
  },
  {
    label: "Social Media Post",
    prompt: "Create an engaging social media post about"
  }
]

export function AITextGenerator({
  className,
  title = "AI Text Generator",
  description = "Generate high-quality content with AI assistance",
  placeholder = "Describe what you want to generate...",
  templates = defaultTemplates,
  onGenerated
}: AITextGeneratorProps) {
  const [prompt, setPrompt] = React.useState("")
  const [generatedText, setGeneratedText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setGeneratedText("")

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: {
            max_tokens: 1000,
            temperature: 0.7
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate text")
      }

      const data = await response.json()
      const text = data.data?.text || ""

      setGeneratedText(text)
      onGenerated?.(text)
    } catch (err) {
      console.error("AI Text Generation error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt)
    setSelectedTemplate(templatePrompt)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const regenerate = () => {
    handleGenerate()
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Buttons */}
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template.prompt)}
                className={cn(
                  "text-xs",
                  selectedTemplate === template.prompt && "bg-blue-50 border-blue-200 text-blue-700"
                )}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="text-sm font-medium mb-2 block">
            What would you like to generate?
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Text
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Generated Text */}
        {generatedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Content</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!generatedText}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerate}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                {generatedText}
              </pre>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Generated with GPT-4.1-nano</span>
              <Badge variant="secondary">
                {generatedText.split(' ').length} words
              </Badge>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {!generatedText && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Tips for Better Results</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be specific about the tone, length, and purpose</li>
              <li>• Include context and examples when possible</li>
              <li>• Use the templates above for common use cases</li>
              <li>• You can regenerate if you're not satisfied with the result</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
