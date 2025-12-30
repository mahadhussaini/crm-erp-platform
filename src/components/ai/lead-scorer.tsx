"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeadData {
  companyName: string
  industry: string
  companySize: string
  website: string
  description: string
  location: string
}

interface LeadScore {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  confidence: number
  reasons: string[]
  recommendations: string[]
}

interface LeadScorerProps {
  className?: string
  leadData: LeadData
  onScoreGenerated?: (score: LeadScore) => void
}

export function LeadScorer({
  className,
  leadData,
  onScoreGenerated
}: LeadScorerProps) {
  const [score, setScore] = React.useState<LeadScore | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const analyzeLead = async () => {
    setIsLoading(true)
    setError(null)
    setScore(null)

    try {
      const prompt = `
Analyze this lead for sales potential and provide a score from 0-100:

Company: ${leadData.companyName}
Industry: ${leadData.industry}
Company Size: ${leadData.companySize}
Website: ${leadData.website}
Location: ${leadData.location}
Description: ${leadData.description}

Please provide:
1. A score from 0-100
2. A letter grade (A, B, C, D, F)
3. Confidence level (0-100%)
4. 3-5 key reasons for this score
5. 2-3 recommendations for next steps

Format your response as JSON with keys: score, grade, confidence, reasons (array), recommendations (array)
      `

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          options: {
            temperature: 0.3, // Lower temperature for consistent scoring
            max_tokens: 500
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to analyze lead")
      }

      const data = await response.json()
      const aiResponse = data.data.choices[0]?.message?.content

      if (!aiResponse) {
        throw new Error("No analysis received from AI")
      }

      // Parse the JSON response
      const parsedResponse = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''))

      const leadScore: LeadScore = {
        score: Math.max(0, Math.min(100, parsedResponse.score || 0)),
        grade: parsedResponse.grade || 'C',
        confidence: Math.max(0, Math.min(100, parsedResponse.confidence || 50)),
        reasons: Array.isArray(parsedResponse.reasons) ? parsedResponse.reasons : [],
        recommendations: Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : []
      }

      setScore(leadScore)
      onScoreGenerated?.(leadScore)
    } catch (err) {
      console.error("Lead scoring error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-blue-100"
    if (score >= 40) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'B': return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'C': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'D':
      case 'F': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          AI Lead Scoring
        </CardTitle>
        <CardDescription>
          Get AI-powered insights on lead quality and potential
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lead Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">{leadData.companyName}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span>Industry: {leadData.industry}</span>
            <span>Size: {leadData.companySize}</span>
            <span>Location: {leadData.location}</span>
            {leadData.website && <span>Website: {leadData.website}</span>}
          </div>
          {leadData.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {leadData.description}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzeLead}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Lead...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Analyze Lead Quality
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Score Results */}
        {score && (
          <div className="space-y-4">
            {/* Score Overview */}
            <div className={cn("rounded-lg p-4", getScoreBgColor(score.score))}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getGradeIcon(score.grade)}
                  <span className="font-semibold">Grade {score.grade}</span>
                </div>
                <Badge variant="secondary">
                  {score.confidence}% confidence
                </Badge>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Lead Score</span>
                  <span className={cn("font-semibold", getScoreColor(score.score))}>
                    {score.score}/100
                  </span>
                </div>
                <Progress value={score.score} className="h-2" />
              </div>
            </div>

            {/* Reasons */}
            <div>
              <h4 className="font-medium mb-2">Analysis Reasons</h4>
              <ul className="space-y-1">
                {score.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2">Recommended Actions</h4>
              <ul className="space-y-1">
                {score.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t">
              Analysis generated by GPT-4.1-nano • {new Date().toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!score && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">🤖 How Lead Scoring Works</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• AI analyzes company data, industry, size, and description</li>
              <li>• Scores from 0-100 with letter grades (A-F)</li>
              <li>• Provides specific reasons and actionable recommendations</li>
              <li>• Higher scores indicate better sales potential</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
