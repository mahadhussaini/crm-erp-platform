"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Copy, RefreshCw, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISummarizerProps {
  className?: string
  title?: string
  description?: string
  placeholder?: string
  defaultMaxLength?: number
  onSummarized?: (summary: string, originalLength: number) => void
}

export function AISummarizer({
  className,
  title = "AI Text Summarizer",
  description = "Condense long texts into concise summaries",
  placeholder = "Paste your text here to summarize...",
  defaultMaxLength = 150,
  onSummarized
}: AISummarizerProps) {
  const [text, setText] = React.useState("")
  const [summary, setSummary] = React.useState("")
  const [maxLength, setMaxLength] = React.useState(defaultMaxLength)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSummarize = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)
    setSummary("")

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          maxLength,
          options: {
            temperature: 0.3 // Lower temperature for more consistent summaries
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to summarize text")
      }

      const data = await response.json()
      const summaryText = data.data?.summary || ""

      setSummary(summaryText)
      onSummarized?.(summaryText, text.length)
    } catch (err) {
      console.error("AI Summarization error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const regenerate = () => {
    handleSummarize()
  }

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const summaryWordCount = summary.trim().split(/\s+/).filter(word => word.length > 0).length
  const compressionRatio = wordCount > 0 ? ((wordCount - summaryWordCount) / wordCount * 100).toFixed(1) : "0"

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="text" className="text-sm font-medium">
              Text to Summarize
            </label>
            {wordCount > 0 && (
              <Badge variant="secondary">
                {wordCount} words
              </Badge>
            )}
          </div>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Length Control */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Summary Length
          </label>
          <div className="flex gap-2 mb-3">
            <Button
              variant={maxLength === 50 ? "default" : "outline"}
              size="sm"
              onClick={() => setMaxLength(50)}
              className="text-xs"
            >
              Short (50 words)
            </Button>
            <Button
              variant={maxLength === 150 ? "default" : "outline"}
              size="sm"
              onClick={() => setMaxLength(150)}
              className="text-xs"
            >
              Medium (150 words)
            </Button>
            <Button
              variant={maxLength === 300 ? "default" : "outline"}
              size="sm"
              onClick={() => setMaxLength(300)}
              className="text-xs"
            >
              Long (300 words)
            </Button>
          </div>
        </div>

        {/* Summarize Button */}
        <Button
          onClick={handleSummarize}
          disabled={!text.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Summarize Text
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Output */}
        {summary && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Summary</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!summary}
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 leading-relaxed">
                {summary}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>Original: {wordCount} words</span>
                <span>Summary: {summaryWordCount} words</span>
                <Badge variant="outline" className="text-green-600">
                  {compressionRatio}% shorter
                </Badge>
              </div>
              <span>Generated with GPT-4.1-nano</span>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {!summary && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Summarization Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Works best with articles, emails, meeting notes, and documents</li>
              <li>• Adjust summary length using the slider for different use cases</li>
              <li>• Longer texts may take more time to process</li>
              <li>• Regenerate if you want a different perspective</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
