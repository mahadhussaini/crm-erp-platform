import { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIChat } from "@/components/ai/ai-chat"
import { AITextGenerator } from "@/components/ai/ai-text-generator"
import { AISummarizer } from "@/components/ai/ai-summarizer"
import { AIImageGenerator } from "@/components/ai/ai-image-generator"
import { LeadScorer } from "@/components/ai/lead-scorer"
import { EmailGenerator } from "@/components/ai/email-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, FileText, BookOpen, Image, Target, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "AI Tools | CRM/ERP Platform",
  description: "Powerful AI tools to enhance your business productivity",
}

const sampleLeadData = {
  companyName: "TechCorp Solutions",
  industry: "Technology",
  companySize: "51-200 employees",
  website: "techcorp.com",
  description: "A leading technology company specializing in cloud solutions and digital transformation services.",
  location: "San Francisco, CA"
}

const sampleContact = {
  name: "John Smith",
  company: "TechCorp Solutions",
  position: "CTO",
  email: "john.smith@techcorp.com"
}

export default function AIToolsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">AI Tools</h1>
            <Badge variant="secondary" className="text-xs">
              Powered by GPT-4.1-nano
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Leverage AI to enhance productivity, generate content, analyze leads, and streamline communication.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conversational AI for answering questions, brainstorming ideas, and getting assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Text Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate emails, descriptions, social posts, and other business content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                Summarizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Condense long documents, meeting notes, and articles into key points.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4" />
                Image Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create professional images for marketing, presentations, and social media.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Lead Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered lead quality analysis with actionable recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                Email Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personalized business emails for introductions, follow-ups, and proposals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="text" className="text-xs">Text Gen</TabsTrigger>
            <TabsTrigger value="summarize" className="text-xs">Summarize</TabsTrigger>
            <TabsTrigger value="image" className="text-xs">Images</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs">Lead Scoring</TabsTrigger>
            <TabsTrigger value="email" className="text-xs">Email Gen</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <AIChat
              className="max-w-4xl mx-auto"
              systemPrompt="You are a helpful business assistant for a CRM/ERP platform. Provide professional, actionable advice for sales, marketing, and business operations."
              placeholder="Ask me about sales strategies, marketing ideas, or business advice..."
            />
          </TabsContent>

          <TabsContent value="text" className="mt-6">
            <AITextGenerator className="max-w-4xl mx-auto" />
          </TabsContent>

          <TabsContent value="summarize" className="mt-6">
            <AISummarizer className="max-w-4xl mx-auto" />
          </TabsContent>

          <TabsContent value="image" className="mt-6">
            <AIImageGenerator className="max-w-4xl mx-auto" />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Sample Lead Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This demonstrates AI-powered lead scoring. In a real application, you would connect this to your lead data.
                </p>
              </div>
              <LeadScorer leadData={sampleLeadData} />
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Email Generator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate personalized business emails with AI assistance.
                </p>
              </div>
              <EmailGenerator contact={sampleContact} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
