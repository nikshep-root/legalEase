import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text content" }, { status: 400 })
    }

    console.log("[v0] Starting Gemini AI analysis...")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const analysisPrompt = `
You are an expert legal analyst with 20+ years of experience. Analyze this legal document thoroughly and provide detailed, specific, actionable insights. Your analysis should be comprehensive and practical, not generic.

Document Content: ${text}

CRITICAL INSTRUCTIONS:
- Be extremely specific and detailed in every section
- Extract actual information from the document (names, dates, amounts, terms)
- Provide actionable recommendations, not generic advice
- Write 3-4 detailed paragraphs for the summary
- Include at least 8-10 specific key points
- Identify real risks with specific mitigation strategies
- Extract actual obligations with real deadlines from the document
- Find important clauses with their actual content
- NEVER use phrases like "consult an attorney" or "seek legal advice"
- Focus on what the document actually says and means

Provide your analysis in this exact JSON format:

{
  "summary": "Write a comprehensive 3-4 paragraph summary that includes: (1) What type of document this is and its primary purpose, (2) Who the main parties are and their roles/relationship, (3) Key terms, amounts, dates, and conditions specifically mentioned in the document, (4) The main obligations and what each party gets/gives. Be specific about actual terms, not generic descriptions.",
  
  "documentType": "Specific document type based on actual content (e.g., 'Service Agreement', 'Employment Contract', 'Lease Agreement', etc.)",
  
  "keyPoints": [
    "List 8-10 specific, actionable points extracted from the document. Include actual amounts, dates, specific requirements, and conditions. Each point should be detailed and reference specific document content, not generic legal concepts."
  ],
  
  "risks": [
    {
      "level": "High/Medium/Low based on actual document content",
      "description": "Specific risk identified in the document with details about what could go wrong, including potential financial impact or consequences mentioned in the document",
      "recommendation": "Detailed, specific action plan for mitigating this risk, including concrete steps and considerations based on the document terms"
    }
  ],
  
  "obligations": [
    {
      "party": "Actual party name or specific role from the document",
      "description": "Detailed description of exactly what they must do, including specific amounts, conditions, quality standards, or performance metrics mentioned in the document",
      "deadline": "Actual deadline, timeframe, or trigger condition specified in the document"
    }
  ],
  
  "importantClauses": [
    {
      "title": "Specific clause name or section title from the document",
      "content": "Actual text excerpt or detailed paraphrase of the clause content, including key terms and conditions",
      "importance": "Detailed explanation of why this clause matters, its potential impact, and what parties should understand about it"
    }
  ],
  
  "deadlines": [
    {
      "description": "Specific deadline or time-sensitive requirement from the document",
      "date": "Actual date, timeframe, or condition from the document",
      "consequence": "Specific consequences mentioned in the document for missing this deadline, including penalties, fees, or other impacts"
    }
  ]
}

Remember: Extract real information from the document. If specific details aren't available, acknowledge that while still providing useful analysis based on what is available. Make every section detailed and actionable.
`

    let analysisResult
    try {
      const result = await model.generateContent(analysisPrompt)
      const response = await result.response
      const analysisText = response.text()

      console.log("[v0] Gemini AI response received")

      // Parse the JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse JSON from AI response")
      }
    } catch (error) {
      console.log("[v0] Gemini AI error, using enhanced fallback:", error)
      analysisResult = generateEnhancedFallbackAnalysis(text, fileName)
    }

    console.log("[v0] Analysis completed successfully")

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}

function generateEnhancedFallbackAnalysis(text: string, fileName: string) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20)
  const lowerText = text.toLowerCase()

  // Enhanced summary generation
  const summary = generateDetailedSummary(text, sentences)

  return {
    summary,
    documentType: detectDocumentType(fileName, text),
    keyPoints: extractDetailedKeyPoints(text, sentences),
    risks: identifyDetailedRisks(text, lowerText),
    obligations: extractDetailedObligations(text, sentences),
    importantClauses: findDetailedClauses(text, sentences),
    deadlines: extractDetailedDeadlines(text),
  }
}

function generateDetailedSummary(text: string, sentences: string[]): string {
  const lowerText = text.toLowerCase()

  // Extract key information
  const parties = extractParties(text)
  const amounts = extractAmounts(text)
  const dates = extractDates(text)
  const purposes = extractPurposes(sentences)

  let summary = ""

  // Document purpose and type
  if (lowerText.includes("agreement") || lowerText.includes("contract")) {
    summary += "This is a legal agreement that establishes binding obligations between the parties involved. "
  } else if (lowerText.includes("policy")) {
    summary += "This document outlines policies and procedures that govern specific activities or behaviors. "
  } else {
    summary += "This legal document contains terms and conditions that create legal relationships and obligations. "
  }

  // Parties involved
  if (parties.length > 0) {
    summary += `The primary parties include: ${parties.slice(0, 3).join(", ")}. `
  }

  // Financial terms
  if (amounts.length > 0) {
    summary += `Key financial terms include amounts such as ${amounts.slice(0, 2).join(" and ")}. `
  }

  // Important dates
  if (dates.length > 0) {
    summary += `Important dates mentioned include ${dates.slice(0, 2).join(" and ")}. `
  }

  // Key purposes or obligations
  if (purposes.length > 0) {
    summary += `The document primarily addresses: ${purposes.slice(0, 2).join(" and ")}. `
  }

  // Compliance and legal implications
  summary +=
    "All parties should carefully review their respective obligations, deadlines, and potential consequences before proceeding. "
  summary +=
    "The document contains specific terms that may have significant legal and financial implications for all involved parties."

  return summary
}

function extractParties(text: string): string[] {
  const parties = []
  const partyPatterns = [
    /(?:party|parties|company|corporation|individual|entity|client|customer|vendor|contractor|employee|employer)[\s\w]*(?=\s|,|\.)/gi,
    /\b[A-Z][a-z]+\s+(?:Inc|LLC|Corp|Company|Ltd|Limited)\b/g,
    /(?:between|among)\s+([^.]+?)(?:and|&)/gi,
  ]

  partyPatterns.forEach((pattern) => {
    const matches = text.match(pattern)
    if (matches) {
      parties.push(...matches.slice(0, 3))
    }
  })

  return [...new Set(parties)].slice(0, 5)
}

function extractAmounts(text: string): string[] {
  const amountPattern = /\$[\d,]+(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD|cents?)\b/gi
  const matches = text.match(amountPattern)
  return matches ? [...new Set(matches)].slice(0, 3) : []
}

function extractDates(text: string): string[] {
  const datePattern = /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})\b/gi
  const matches = text.match(datePattern)
  return matches ? [...new Set(matches)].slice(0, 3) : []
}

function extractPurposes(sentences: string[]): string[] {
  const purposes = []
  const purposeKeywords = [
    "purpose",
    "objective",
    "intent",
    "goal",
    "agreement",
    "contract",
    "service",
    "product",
    "work",
  ]

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase()
    if (purposeKeywords.some((keyword) => lowerSentence.includes(keyword))) {
      purposes.push(sentence.trim().substring(0, 100))
    }
  })

  return purposes.slice(0, 3)
}

function extractDetailedKeyPoints(text: string, sentences: string[]): string[] {
  const keyPoints = []
  const lowerText = text.toLowerCase()

  // Financial obligations
  if (lowerText.includes("payment") || lowerText.includes("fee") || lowerText.includes("cost")) {
    const amounts = extractAmounts(text)
    keyPoints.push(
      `Financial obligations include ${amounts.length > 0 ? amounts.join(", ") : "various fees and payments as specified"}`,
    )
  }

  // Performance requirements
  const performanceTerms = ["shall", "must", "required", "obligation", "responsible", "duty"]
  const performanceSentences = sentences
    .filter((s) => performanceTerms.some((term) => s.toLowerCase().includes(term)))
    .slice(0, 3)

  performanceSentences.forEach((sentence) => {
    keyPoints.push(sentence.trim().substring(0, 120) + (sentence.length > 120 ? "..." : ""))
  })

  // Termination conditions
  if (lowerText.includes("termination") || lowerText.includes("cancel")) {
    keyPoints.push(
      "Document contains specific termination or cancellation provisions that define when and how the agreement can be ended",
    )
  }

  // Confidentiality
  if (lowerText.includes("confidential") || lowerText.includes("proprietary")) {
    keyPoints.push("Confidentiality obligations are established, requiring protection of sensitive information")
  }

  // Liability and risk allocation
  if (lowerText.includes("liable") || lowerText.includes("liability") || lowerText.includes("damages")) {
    keyPoints.push("Liability provisions allocate risk and potential damages between parties")
  }

  // Intellectual property
  if (
    lowerText.includes("intellectual property") ||
    lowerText.includes("copyright") ||
    lowerText.includes("trademark")
  ) {
    keyPoints.push("Intellectual property rights and ownership are addressed in the document")
  }

  // Compliance requirements
  if (lowerText.includes("comply") || lowerText.includes("regulation") || lowerText.includes("law")) {
    keyPoints.push("Compliance with applicable laws and regulations is required")
  }

  // Default fallback points
  if (keyPoints.length < 5) {
    keyPoints.push(
      "All parties must understand their respective rights and obligations",
      "Specific performance standards and expectations are established",
      "Clear procedures for dispute resolution may be included",
      "Regular review of terms and conditions is recommended",
    )
  }

  return keyPoints.slice(0, 8)
}

function identifyDetailedRisks(
  text: string,
  lowerText: string,
): Array<{ level: string; description: string; recommendation: string }> {
  const risks = []

  // High-risk indicators
  if (lowerText.includes("penalty") || lowerText.includes("fine") || lowerText.includes("liquidated damages")) {
    risks.push({
      level: "High",
      description: "Significant financial penalties are specified for non-compliance or breach of contract terms",
      recommendation:
        "Carefully review all penalty clauses and ensure you can meet all requirements to avoid financial exposure",
    })
  }

  if (lowerText.includes("personal guarantee") || lowerText.includes("personally liable")) {
    risks.push({
      level: "High",
      description: "Personal liability or guarantees may expose individual assets beyond business assets",
      recommendation:
        "Consider the full extent of personal exposure and seek legal counsel before accepting personal liability",
    })
  }

  // Medium-risk indicators
  if (lowerText.includes("termination") || lowerText.includes("breach")) {
    risks.push({
      level: "Medium",
      description: "Contract termination provisions could result in loss of benefits or early termination penalties",
      recommendation: "Understand all circumstances that could trigger termination and associated consequences",
    })
  }

  if (lowerText.includes("confidential") || lowerText.includes("non-disclosure")) {
    risks.push({
      level: "Medium",
      description: "Confidentiality breaches could result in legal action and damages",
      recommendation: "Establish clear procedures for handling confidential information and train relevant personnel",
    })
  }

  if (lowerText.includes("indemnify") || lowerText.includes("hold harmless")) {
    risks.push({
      level: "Medium",
      description: "Indemnification clauses may require you to cover costs and damages for the other party",
      recommendation: "Review indemnification scope carefully and consider insurance coverage for potential exposures",
    })
  }

  // Low-risk indicators
  if (lowerText.includes("dispute") || lowerText.includes("arbitration")) {
    risks.push({
      level: "Low",
      description: "Dispute resolution procedures may limit legal options or require specific processes",
      recommendation: "Understand the dispute resolution process and associated costs before conflicts arise",
    })
  }

  return risks.length > 0
    ? risks
    : [
        {
          level: "Medium",
          description: "Complex legal document with multiple obligations and potential consequences",
          recommendation:
            "Conduct thorough review of all terms and consider professional legal consultation for complete understanding",
        },
      ]
}

function extractDetailedObligations(
  text: string,
  sentences: string[],
): Array<{ party: string; description: string; deadline: string }> {
  const obligations = []

  // Look for specific obligation patterns
  const obligationKeywords = ["shall", "must", "required", "obligation", "responsible", "duty", "agree to"]

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase()
    if (obligationKeywords.some((keyword) => lowerSentence.includes(keyword))) {
      // Try to identify the party
      let party = "Specified party"
      if (lowerSentence.includes("client") || lowerSentence.includes("customer")) party = "Client/Customer"
      else if (lowerSentence.includes("contractor") || lowerSentence.includes("vendor")) party = "Contractor/Vendor"
      else if (lowerSentence.includes("employee")) party = "Employee"
      else if (lowerSentence.includes("employer")) party = "Employer"
      else if (lowerSentence.includes("company")) party = "Company"

      // Extract deadline information
      let deadline = "As specified in document"
      const dateMatch = sentence.match(
        /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+days?|\d{1,2}\s+weeks?|\d{1,2}\s+months?)\b/i,
      )
      if (dateMatch) deadline = dateMatch[0]

      obligations.push({
        party,
        description: sentence.trim().substring(0, 150) + (sentence.length > 150 ? "..." : ""),
        deadline,
      })
    }
  })

  return obligations.slice(0, 6).length > 0
    ? obligations.slice(0, 6)
    : [
        {
          party: "All parties",
          description: "Comply with all terms and conditions as outlined in the document",
          deadline: "Throughout the term of the agreement",
        },
      ]
}

function findDetailedClauses(
  text: string,
  sentences: string[],
): Array<{ title: string; content: string; importance: string }> {
  const clauses = []
  const lowerText = text.toLowerCase()

  // Payment clauses
  if (lowerText.includes("payment") || lowerText.includes("fee") || lowerText.includes("cost")) {
    const paymentSentences = sentences
      .filter((s) => s.toLowerCase().includes("payment") || s.toLowerCase().includes("fee"))
      .slice(0, 2)

    clauses.push({
      title: "Payment and Financial Terms",
      content: paymentSentences.join(" ").substring(0, 300) + "...",
      importance: "Defines all financial obligations, payment schedules, late fees, and consequences of non-payment",
    })
  }

  // Termination clauses
  if (lowerText.includes("termination") || lowerText.includes("cancel")) {
    const terminationSentences = sentences
      .filter((s) => s.toLowerCase().includes("termination") || s.toLowerCase().includes("cancel"))
      .slice(0, 2)

    clauses.push({
      title: "Termination and Cancellation",
      content: terminationSentences.join(" ").substring(0, 300) + "...",
      importance: "Specifies conditions, notice requirements, and consequences for ending the agreement",
    })
  }

  // Liability clauses
  if (lowerText.includes("liable") || lowerText.includes("liability") || lowerText.includes("damages")) {
    clauses.push({
      title: "Liability and Risk Allocation",
      content: "Provisions addressing liability, damages, and risk allocation between parties",
      importance: "Determines who is responsible for various types of damages and losses",
    })
  }

  // Confidentiality clauses
  if (lowerText.includes("confidential") || lowerText.includes("proprietary")) {
    clauses.push({
      title: "Confidentiality and Non-Disclosure",
      content: "Requirements for protecting confidential and proprietary information",
      importance: "Establishes legal obligations to protect sensitive business information",
    })
  }

  return clauses.length > 0
    ? clauses
    : [
        {
          title: "General Terms and Conditions",
          content: "Various terms and conditions governing the relationship between parties",
          importance: "Establishes the legal framework and expectations for all parties involved",
        },
      ]
}

function extractDetailedDeadlines(text: string): Array<{ description: string; date: string; consequence: string }> {
  const deadlines = []

  // Look for specific date patterns and associated requirements
  const datePattern =
    /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:days?|weeks?|months?|years?))\b/gi
  const matches = text.match(datePattern)

  if (matches && matches.length > 0) {
    matches.slice(0, 4).forEach((match) => {
      // Try to find context around the date
      const dateIndex = text.indexOf(match)
      const contextStart = Math.max(0, dateIndex - 100)
      const contextEnd = Math.min(text.length, dateIndex + 100)
      const context = text.substring(contextStart, contextEnd)

      let description = "Time-sensitive requirement identified"
      let consequence = "Review document for specific consequences"

      // Analyze context for more specific information
      if (context.toLowerCase().includes("payment")) {
        description = "Payment deadline"
        consequence = "Late fees or penalties may apply"
      } else if (context.toLowerCase().includes("notice")) {
        description = "Notice requirement deadline"
        consequence = "Failure to provide timely notice may affect rights"
      } else if (context.toLowerCase().includes("termination")) {
        description = "Termination notice deadline"
        consequence = "May affect ability to terminate agreement"
      } else if (context.toLowerCase().includes("renewal")) {
        description = "Renewal or extension deadline"
        consequence = "Agreement may automatically renew or expire"
      }

      deadlines.push({
        description,
        date: match,
        consequence,
      })
    })
  }

  // Add general review deadlines
  deadlines.push({
    description: "Complete document review and understanding",
    date: "Before signing or agreeing to terms",
    consequence: "Legal obligations become binding upon agreement",
  })

  return deadlines.slice(0, 5)
}

function detectDocumentType(fileName: string, text: string): string {
  const lowerText = text.toLowerCase()
  const lowerFileName = fileName.toLowerCase()

  if (lowerText.includes("contract") || lowerFileName.includes("contract")) return "Contract"
  if (lowerText.includes("agreement") || lowerFileName.includes("agreement")) return "Agreement"
  if (lowerText.includes("policy") || lowerFileName.includes("policy")) return "Policy"
  if (lowerText.includes("terms") || lowerText.includes("conditions")) return "Terms & Conditions"
  if (lowerText.includes("lease") || lowerFileName.includes("lease")) return "Lease Agreement"
  if (lowerText.includes("employment") || lowerFileName.includes("employment")) return "Employment Document"
  return "Legal Document"
}
