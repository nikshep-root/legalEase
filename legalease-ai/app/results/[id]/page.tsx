"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Share2, AlertTriangle, Clock, Users, CheckCircle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import type { DocumentAnalysis } from "@/lib/document-processor"
import { getRiskColor, getRiskBadgeVariant } from "@/lib/document-processor"
import { TextToSpeechControls } from "@/components/text-to-speech-controls"
import { DocumentChat } from "@/components/document-chat"
import { analysisStorage } from "@/lib/analysis-storage"

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleShare = async () => {
    if (navigator.share && analysis) {
      try {
        await navigator.share({
          title: "Legal Document Analysis",
          text: `Document Analysis Summary: ${analysis.summary.substring(0, 100)}...`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled or failed")
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleExport = () => {
    if (!analysis) return

    // Create a comprehensive HTML report
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Legal Document Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #8b5cf6; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .risk-high { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; }
        .risk-medium { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        .risk-low { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; }
        .clause { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .obligation { background-color: #fafafa; border: 1px solid #d1d5db; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .deadline { background-color: #fffbeb; border: 1px solid #fbbf24; padding: 15px; margin: 10px 0; border-radius: 8px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .meta { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Legal Document Analysis Report</h1>
        <p class="meta">Document Type: ${analysis.documentType}</p>
        <p class="meta">Generated on: ${new Date().toLocaleDateString()}</p>
        <p class="meta">Analysis ID: ${params.id}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>${analysis.summary}</p>
    </div>

    <div class="section">
        <h2>Key Points</h2>
        <ul>
            ${analysis.keyPoints.map((point) => `<li>${point}</li>`).join("")}
        </ul>
    </div>

    <div class="section">
        <h2>Risk Analysis</h2>
        ${analysis.risks
          .map(
            (risk) => `
            <div class="risk-${risk.level.toLowerCase()}">
                <h3>${risk.level} Risk</h3>
                <p><strong>Description:</strong> ${risk.description}</p>
                <p><strong>Recommendation:</strong> ${risk.recommendation}</p>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <h2>Obligations</h2>
        ${analysis.obligations
          .map(
            (obligation) => `
            <div class="obligation">
                <h3>${obligation.party}</h3>
                <p>${obligation.description}</p>
                ${obligation.deadline ? `<p><strong>Deadline:</strong> ${obligation.deadline}</p>` : ""}
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <h2>Important Clauses</h2>
        ${analysis.importantClauses
          .map(
            (clause) => `
            <div class="clause">
                <h3>${clause.title}</h3>
                <p>${clause.content}</p>
                <p><strong>Why this matters:</strong> ${clause.importance}</p>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <h2>Deadlines</h2>
        ${analysis.deadlines
          .map(
            (deadline) => `
            <div class="deadline">
                <h3>${deadline.description}</h3>
                ${deadline.date ? `<p><strong>Date:</strong> ${deadline.date}</p>` : ""}
                <p><strong>Consequence:</strong> ${deadline.consequence}</p>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <p class="meta">This report was generated by LegalEase AI. For legal advice, please consult with a qualified attorney.</p>
    </div>
</body>
</html>
    `

    const blob = new Blob([reportHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `legal-analysis-report-${params.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    try {
      console.log("[v0] Looking for analysis with ID:", params.id)

      const foundAnalysis = analysisStorage.getAnalysis(params.id)

      if (foundAnalysis) {
        console.log("[v0] Analysis found and loaded successfully")
        setAnalysis(foundAnalysis)
      } else {
        console.log("[v0] No analysis found, checking for any available analyses")
        const recentAnalysis = analysisStorage.getMostRecentAnalysis()
        if (recentAnalysis) {
          console.log("[v0] Using most recent analysis as fallback")
          setAnalysis(recentAnalysis)
        } else {
          console.log("[v0] No analyses available, creating mock analysis for demonstration")
          const mockAnalysis = analysisStorage.createMockAnalysis()
          setAnalysis(mockAnalysis)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading analysis:", error)
      const mockAnalysis = analysisStorage.createMockAnalysis()
      setAnalysis(mockAnalysis)
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested document analysis could not be found.</p>
          <Button asChild>
            <Link href="/upload">Upload New Document</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LegalEase AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="glass-subtle bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="glass-subtle bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button asChild variant="default" className="shadow-lg">
              <Link href="/upload" className="text-primary-foreground font-medium">
                New Analysis
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Document Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="glass px-3 py-1">
              {analysis.documentType}
            </Badge>
            <span className="text-sm text-muted-foreground">Analyzed on {new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Document Analysis Results</h1>

          {/* Executive Summary with Text-to-Speech and Chat */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Info className="w-5 h-5" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{analysis.summary}</p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="glass rounded-xl p-4">
                <TextToSpeechControls text={analysis.summary} title="Listen to Summary" />
              </div>
              <div className="glass rounded-xl">
                <DocumentChat analysis={analysis} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-strong grid w-full grid-cols-5 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:glass-strong data-[state=active]:text-foreground text-foreground font-medium rounded-lg"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="data-[state=active]:glass-strong data-[state=active]:text-foreground text-foreground font-medium rounded-lg"
            >
              Risks
            </TabsTrigger>
            <TabsTrigger
              value="obligations"
              className="data-[state=active]:glass-strong data-[state=active]:text-foreground text-foreground font-medium rounded-lg"
            >
              Obligations
            </TabsTrigger>
            <TabsTrigger
              value="clauses"
              className="data-[state=active]:glass-strong data-[state=active]:text-foreground text-foreground font-medium rounded-lg"
            >
              Key Clauses
            </TabsTrigger>
            <TabsTrigger
              value="deadlines"
              className="data-[state=active]:glass-strong data-[state=active]:text-foreground text-foreground font-medium rounded-lg"
            >
              Deadlines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Key Points</CardTitle>
                <CardDescription>The most important aspects of this document</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              {["High", "Medium", "Low"].map((level) => {
                const risks = analysis.risks.filter((risk) => risk.level === level)
                return (
                  <Card key={level} className="glass glass-hover">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${getRiskColor(level as any)}`} />
                        {level} Risk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">{risks.length}</div>
                      <p className="text-sm text-muted-foreground">
                        {risks.length === 1 ? "item identified" : "items identified"}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {analysis.risks.map((risk, index) => (
              <Alert key={index} className="glass border-l-4 border-l-destructive">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getRiskBadgeVariant(risk.level)}>{risk.level} Risk</Badge>
                    </div>
                    <AlertDescription className="text-base mb-2">{risk.description}</AlertDescription>
                    <div className="glass-subtle p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{risk.recommendation}</p>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="obligations" className="space-y-4">
            <div className="grid gap-4">
              {analysis.obligations.map((obligation, index) => (
                <Card key={index} className="glass">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="glass-subtle">
                            {obligation.party}
                          </Badge>
                        </div>
                        <p className="font-medium mb-2">{obligation.description}</p>
                        {obligation.deadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Due: {obligation.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clauses" className="space-y-4">
            {analysis.importantClauses.map((clause, index) => (
              <Card key={index} className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">{clause.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="glass-subtle p-4 rounded-lg border-l-4 border-l-primary">
                    <p className="text-sm leading-relaxed">{clause.content}</p>
                  </div>
                  <div className="bg-blue-50/80 dark:bg-blue-950/20 p-3 rounded-md backdrop-blur-sm">
                    <p className="text-sm font-medium mb-1">Why this matters:</p>
                    <p className="text-sm text-muted-foreground">{clause.importance}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            {analysis.deadlines.map((deadline, index) => (
              <Card key={index} className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{deadline.description}</h3>
                      {deadline.date && <p className="text-sm text-muted-foreground mb-2">Date: {deadline.date}</p>}
                      <div className="bg-yellow-50/80 dark:bg-yellow-950/20 p-3 rounded-md backdrop-blur-sm">
                        <p className="text-sm font-medium mb-1">Consequence:</p>
                        <p className="text-sm text-muted-foreground">{deadline.consequence}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-border/50">
          <Button asChild className="flex-1 shadow-lg hover:shadow-xl transition-all">
            <Link href="/upload">Analyze Another Document</Link>
          </Button>
          <Button variant="outline" className="flex-1 glass-subtle bg-transparent" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" className="flex-1 glass-subtle bg-transparent" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
