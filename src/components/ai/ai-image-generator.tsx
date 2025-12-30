"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Image as ImageIcon, Download, RefreshCw, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

interface GeneratedImage {
  url: string
  revisedPrompt: string
}

interface AIImageGeneratorProps {
  className?: string
  title?: string
  description?: string
  placeholder?: string
  templates?: { label: string; prompt: string }[]
  onImageGenerated?: (image: GeneratedImage) => void
}

const defaultTemplates = [
  {
    label: "Product Photo",
    prompt: "Professional product photography of"
  },
  {
    label: "Logo Design",
    prompt: "Modern logo design for"
  },
  {
    label: "Infographic",
    prompt: "Clean infographic design about"
  },
  {
    label: "Social Media",
    prompt: "Eye-catching social media graphic for"
  }
]

export function AIImageGenerator({
  className,
  title = "AI Image Generator",
  description = "Create stunning images with AI using DALL-E",
  placeholder = "Describe the image you want to create...",
  templates = defaultTemplates,
  onImageGenerated
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = React.useState("")
  const [generatedImage, setGeneratedImage] = React.useState<GeneratedImage | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [imageSize, setImageSize] = React.useState<"1024x1024" | "1792x1024" | "1024x1792">("1024x1024")
  const [imageStyle, setImageStyle] = React.useState<"vivid" | "natural">("vivid")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: imageSize,
          style: imageStyle,
          quality: "standard"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate image")
      }

      const data = await response.json()
      const image = data.data?.data?.[0]

      if (!image) {
        throw new Error("No image data received")
      }

      const generatedImageData: GeneratedImage = {
        url: image.url,
        revisedPrompt: image.revised_prompt || prompt
      }

      setGeneratedImage(generatedImageData)
      onImageGenerated?.(generatedImageData)
    } catch (err) {
      console.error("AI Image Generation error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt)
    setSelectedTemplate(templatePrompt)
  }

  const downloadImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-generated-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download image:", err)
    }
  }

  const regenerate = () => {
    handleGenerate()
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
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
            Image Description
          </label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
          />
        </div>

        {/* Image Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Size</label>
            <div className="flex gap-2">
              <Button
                variant={imageSize === "1024x1024" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageSize("1024x1024")}
                className="text-xs"
              >
                Square
              </Button>
              <Button
                variant={imageSize === "1792x1024" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageSize("1792x1024")}
                className="text-xs"
              >
                Landscape
              </Button>
              <Button
                variant={imageSize === "1024x1792" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageSize("1024x1792")}
                className="text-xs"
              >
                Portrait
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Style</label>
            <div className="flex gap-2">
              <Button
                variant={imageStyle === "vivid" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageStyle("vivid")}
                className="text-xs"
              >
                Vivid
              </Button>
              <Button
                variant={imageStyle === "natural" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageStyle("natural")}
                className="text-xs"
              >
                Natural
              </Button>
            </div>
          </div>
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
              Generating Image...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Image</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
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

            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={generatedImage.url}
                alt={generatedImage.revisedPrompt}
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                loading="lazy"
              />
            </div>

            {generatedImage.revisedPrompt !== prompt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">AI-Enhanced Prompt</h4>
                <p className="text-xs text-blue-800">{generatedImage.revisedPrompt}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <Badge variant="secondary">
                  {imageSize.replace('x', '×')}
                </Badge>
                <Badge variant="secondary">
                  {imageStyle}
                </Badge>
              </div>
              <span>Generated with DALL-E</span>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {!generatedImage && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Image Generation Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be specific about subjects, styles, lighting, and composition</li>
              <li>• Try different sizes for various use cases (square for social, landscape for banners)</li>
              <li>• "Vivid" style creates more colorful/artistic images, "Natural" is more realistic</li>
              <li>• DALL-E will enhance your prompt for better results</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
