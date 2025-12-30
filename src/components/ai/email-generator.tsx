"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Copy, RefreshCw, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContactData {
  name: string
  company: string
  position?: string
  email: string
}

interface EmailData {
  subject: string
  body: string
}

interface EmailGeneratorProps {
  className?: string
  contact: ContactData
  context?: string
  emailType?: 'introduction' | 'followup' | 'proposal' | 'thankyou' | 'custom'
  onEmailGenerated?: (email: EmailData) => void
}

const emailTemplates = {
  introduction: {
    label: "Introduction",
    prompt: "Write a professional introduction email to introduce our services"
  },
  followup: {
    label: "Follow-up",
    prompt: "Write a professional follow-up email after our initial meeting"
  },
  proposal: {
    label: "Proposal",
    prompt: "Write a proposal email with our solution details"
  },
  thankyou: {
    label: "Thank You",
    prompt: "Write a thank you email after a successful interaction"
  },
  custom: {
    label: "Custom",
    prompt: "Write a custom email based on the provided context"
  }
}

export function EmailGenerator({
  className,
  contact,
  context = "",
  emailType = 'introduction',
  onEmailGenerated
}: EmailGeneratorProps) {
  const [selectedType, setSelectedType] = React.useState(emailType)
  const [customContext, setCustomContext] = React.useState(context)
  const [generatedEmail, setGeneratedEmail] = React.useState<EmailData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const generateEmail = async () => {
    setIsLoading(true)
    setError(null)
    setGeneratedEmail(null)

    try {
      const template = emailTemplates[selectedType]
      const fullContext = selectedType === 'custom' ? customContext : context

      const prompt = `
Generate a professional business email with the following details:

Recipient: ${contact.name}
Position: ${contact.position || 'Professional'}
Company: ${contact.company}
Email Type: ${template.label}

${fullContext ? `Additional Context: ${fullContext}` : ''}

Please provide:
1. A compelling subject line
2. A well-structured email body (greeting, introduction, main content, call-to-action, professional closing)

Make it personalized, professional, and persuasive. Keep it concise but comprehensive.

Format your response as JSON with keys: subject, body
      `

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          options: {
            max_tokens: 800,
            temperature: 0.7
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate email")
      }

      const data = await response.json()
      const aiResponse = data.data?.text

      if (!aiResponse) {
        throw new Error("No email content received from AI")
      }

      // Try to parse as JSON first, if that fails, extract manually
      let parsedEmail: EmailData
      try {
        const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim()
        parsedEmail = JSON.parse(cleanedResponse)
      } catch {
        // Manual extraction if JSON parsing fails
        const subjectMatch = aiResponse.match(/Subject:\s*(.+?)(?:\n|$)/i)
        const subject = subjectMatch ? subjectMatch[1].trim() : `Regarding our discussion with ${contact.company}`

        // Remove subject line from body
        const bodyContent = aiResponse.replace(/Subject:.*\n/i, '').trim()

        parsedEmail = {
          subject,
          body: bodyContent
        }
      }

      setGeneratedEmail(parsedEmail)
      onEmailGenerated?.(parsedEmail)
    } catch (err) {
      console.error("Email generation error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const regenerate = () => {
    generateEmail()
  }

  const sendEmail = () => {
    if (!generatedEmail) return

    // Create mailto link
    const subject = encodeURIComponent(generatedEmail.subject)
    const body = encodeURIComponent(generatedEmail.body)
    const mailtoLink = `mailto:${contact.email}?subject=${subject}&body=${body}`

    window.open(mailtoLink, '_blank')
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          AI Email Generator
        </CardTitle>
        <CardDescription>
          Generate personalized business emails with AI assistance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Email Recipient</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span><strong>Name:</strong> {contact.name}</span>
            <span><strong>Email:</strong> {contact.email}</span>
            <span><strong>Company:</strong> {contact.company}</span>
            {contact.position && <span><strong>Position:</strong> {contact.position}</span>}
          </div>
        </div>

        {/* Email Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Email Type</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(emailTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant={selectedType === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(key as keyof typeof emailTemplates)}
                className="text-xs"
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Context (only for custom type) */}
        {selectedType === 'custom' && (
          <div>
            <label htmlFor="context" className="text-sm font-medium mb-2 block">
              Custom Context
            </label>
            <Textarea
              id="context"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Describe what you want the email to be about..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateEmail}
          disabled={isLoading || (selectedType === 'custom' && !customContext.trim())}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Email...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Generate Email
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Generated Email */}
        {generatedEmail && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Email</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail.subject)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Subject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedEmail.body)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Body
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendEmail}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Send Email
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

            {/* Subject Line */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-sm font-medium text-blue-900">{generatedEmail.subject}</p>
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Body</label>
              <div className="bg-gray-50 border rounded p-4 min-h-[200px]">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
                  {generatedEmail.body}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <Badge variant="secondary">
                {emailTemplates[selectedType].label}
              </Badge>
              <span>Generated with GPT-4.1-nano</span>
            </div>
          </div>
        )}

        {/* Tips */}
        {!generatedEmail && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Email Generation Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• AI creates personalized, professional emails based on recipient details</li>
              <li>• Choose the right email type for your specific situation</li>
              <li>• Add custom context for more tailored content</li>
              <li>• Use the "Send Email" button to open in your default email client</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
