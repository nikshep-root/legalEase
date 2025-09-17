import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { messages, documentAnalysis } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ""

    console.log("[v0] Processing chat request with Gemini AI...")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const chatPrompt = `
You are an expert legal assistant with deep knowledge of contract law and document analysis. You have thoroughly analyzed the user's legal document and now you're helping them understand it through conversation.

DOCUMENT ANALYSIS CONTEXT:
${JSON.stringify(documentAnalysis, null, 2)}

USER'S CURRENT QUESTION: ${lastMessage}

CONVERSATION HISTORY:
${messages
  .slice(0, -1)
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}

INSTRUCTIONS FOR YOUR RESPONSE:
1. Be conversational, helpful, and professional - like talking to a knowledgeable colleague
2. Provide specific, detailed answers based on the actual document analysis
3. Reference specific information from the document whenever possible (amounts, dates, parties, clauses)
4. Give practical, actionable advice and explanations
5. If discussing risks, obligations, or deadlines, be specific about what the document says
6. NEVER give generic responses like "consult an attorney" - provide actual insights and analysis
7. If you don't have specific information, acknowledge it but still provide helpful guidance based on what you do know
8. Use examples from the document to illustrate your points
9. Keep responses focused but comprehensive - aim for 2-4 paragraphs depending on the question complexity
10. End with a follow-up question or offer to explain related topics

TONE: Professional but approachable, like an experienced legal professional explaining things to a client

Provide a detailed, helpful response that directly addresses their question using the document analysis.
`

    let response
    try {
      const result = await model.generateContent(chatPrompt)
      const aiResponse = await result.response
      response = aiResponse.text()
      console.log("[v0] Gemini AI chat response generated")
    } catch (error) {
      console.log("[v0] Gemini AI error, using enhanced fallback:", error)
      response = generateEnhancedFallbackResponse(lastMessage, documentAnalysis)
    }

    return NextResponse.json({ content: response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}

function generateEnhancedFallbackResponse(question: string, documentAnalysis: any): string {
  const lowerQuestion = question.toLowerCase()

  // Document overview
  if (lowerQuestion.includes("what") && (lowerQuestion.includes("document") || lowerQuestion.includes("this"))) {
    return `Based on my analysis, this is ${documentAnalysis?.documentType || "a legal document"} that ${documentAnalysis?.summary ? documentAnalysis.summary.substring(0, 200) + "..." : "contains important legal terms and obligations"}. 

The key aspects include the main parties involved, their respective obligations, and important deadlines or conditions. Would you like me to explain any specific section in more detail?`
  }

  // Summary requests
  if (lowerQuestion.includes("summary") || lowerQuestion.includes("summarize") || lowerQuestion.includes("overview")) {
    return `Here's a comprehensive summary of your document:

${documentAnalysis?.summary || "This legal document establishes important relationships and obligations between the parties involved. It contains specific terms that define rights, responsibilities, and procedures that all parties must follow."}

The document covers several key areas including financial obligations, performance requirements, and important deadlines. Is there a particular aspect you'd like me to dive deeper into?`
  }

  // Risk analysis
  if (
    lowerQuestion.includes("risk") ||
    lowerQuestion.includes("danger") ||
    lowerQuestion.includes("problem") ||
    lowerQuestion.includes("concern")
  ) {
    if (documentAnalysis?.risks?.length > 0) {
      let riskResponse = "I've identified several important risks in your document:\n\n"
      documentAnalysis.risks.forEach((risk: any, index: number) => {
        riskResponse += `${index + 1}. **${risk.level} Risk**: ${risk.description}\n   *Recommendation*: ${risk.recommendation}\n\n`
      })
      riskResponse +=
        "These risks should be carefully considered before proceeding. Would you like me to explain any of these in more detail?"
      return riskResponse
    }
    return "While I can see this is a complex legal document, I'd recommend focusing on understanding your specific obligations, any financial commitments, and important deadlines. These are typically the areas where issues arise. What specific concerns do you have about the document?"
  }

  // Obligations and responsibilities
  if (
    lowerQuestion.includes("obligation") ||
    lowerQuestion.includes("responsibility") ||
    lowerQuestion.includes("duty") ||
    lowerQuestion.includes("must") ||
    lowerQuestion.includes("have to")
  ) {
    if (documentAnalysis?.obligations?.length > 0) {
      let obligationResponse = "Here are the key obligations I found in your document:\n\n"
      documentAnalysis.obligations.forEach((obligation: any, index: number) => {
        obligationResponse += `${index + 1}. **${obligation.party}**: ${obligation.description}\n   *Deadline*: ${obligation.deadline}\n\n`
      })
      obligationResponse +=
        "Make sure you understand each of these requirements and can fulfill them within the specified timeframes. Do you have questions about any specific obligation?"
      return obligationResponse
    }
    return "Your document contains various obligations for different parties. These typically include performance requirements, payment obligations, compliance duties, and reporting requirements. The key is understanding exactly what you're responsible for and when. What specific obligations are you concerned about?"
  }

  // Deadlines and timing
  if (
    lowerQuestion.includes("deadline") ||
    lowerQuestion.includes("date") ||
    lowerQuestion.includes("when") ||
    lowerQuestion.includes("time") ||
    lowerQuestion.includes("due")
  ) {
    if (documentAnalysis?.deadlines?.length > 0) {
      let deadlineResponse = "Here are the important deadlines I found:\n\n"
      documentAnalysis.deadlines.forEach((deadline: any, index: number) => {
        deadlineResponse += `${index + 1}. **${deadline.description}**\n   *Date*: ${deadline.date}\n   *Consequence*: ${deadline.consequence}\n\n`
      })
      deadlineResponse +=
        "I recommend adding these dates to your calendar with reminders well in advance. Missing deadlines can have serious consequences. Do you need help understanding any of these deadlines?"
      return deadlineResponse
    }
    return "Timing is crucial in legal documents. Look for specific dates, notice periods, performance deadlines, and renewal dates. Even if exact dates aren't specified, there may be timeframes like '30 days notice' or 'within a reasonable time.' What specific timing requirements are you looking for?"
  }

  // Payment and financial terms
  if (
    lowerQuestion.includes("pay") ||
    lowerQuestion.includes("money") ||
    lowerQuestion.includes("cost") ||
    lowerQuestion.includes("fee") ||
    lowerQuestion.includes("price") ||
    lowerQuestion.includes("financial")
  ) {
    const keyPoints = documentAnalysis?.keyPoints || []
    const financialPoints = keyPoints.filter(
      (point: string) =>
        point.toLowerCase().includes("payment") ||
        point.toLowerCase().includes("fee") ||
        point.toLowerCase().includes("cost") ||
        point.toLowerCase().includes("financial"),
    )

    if (financialPoints.length > 0) {
      return `Here's what I found regarding financial terms:\n\n${financialPoints.join("\n\n")}\n\nMake sure you understand all payment amounts, due dates, late fees, and any conditions that might affect costs. Are there specific financial terms you'd like me to clarify?`
    }
    return "Financial terms are critical to understand fully. Look for payment amounts, due dates, late fees, penalties, reimbursement provisions, and any conditions that might change the costs. Even small details like who pays for what expenses can be important. What specific financial aspects concern you?"
  }

  // Termination and cancellation
  if (
    lowerQuestion.includes("cancel") ||
    lowerQuestion.includes("terminate") ||
    lowerQuestion.includes("end") ||
    lowerQuestion.includes("exit") ||
    lowerQuestion.includes("quit")
  ) {
    const clauses = documentAnalysis?.importantClauses || []
    const terminationClause = clauses.find(
      (clause: any) =>
        clause.title.toLowerCase().includes("termination") || clause.title.toLowerCase().includes("cancel"),
    )

    if (terminationClause) {
      return `Here's what I found about termination:\n\n**${terminationClause.title}**\n${terminationClause.content}\n\n*Why this matters*: ${terminationClause.importance}\n\nPay special attention to notice requirements, any penalties for early termination, and what happens to your obligations after termination. Do you have specific questions about ending this agreement?`
    }
    return "Termination provisions are very important to understand before you enter any agreement. Look for notice requirements (how much advance notice you need to give), any penalties or fees for early termination, conditions that allow termination, and what happens to ongoing obligations. What's your specific situation regarding termination?"
  }

  // Key terms and important clauses
  if (
    lowerQuestion.includes("key") ||
    lowerQuestion.includes("important") ||
    lowerQuestion.includes("main") ||
    lowerQuestion.includes("clause")
  ) {
    if (documentAnalysis?.importantClauses?.length > 0) {
      let clauseResponse = "Here are the most important clauses in your document:\n\n"
      documentAnalysis.importantClauses.forEach((clause: any, index: number) => {
        clauseResponse += `${index + 1}. **${clause.title}**\n   ${clause.content.substring(0, 150)}...\n   *Why it matters*: ${clause.importance}\n\n`
      })
      clauseResponse +=
        "These clauses form the foundation of your legal relationship. Would you like me to explain any of these in more detail?"
      return clauseResponse
    }
    return "The most important aspects of any legal document typically include: the main purpose and scope, who the parties are and their roles, key obligations and responsibilities, financial terms, deadlines and timeframes, termination conditions, and dispute resolution procedures. Which of these areas would you like to focus on?"
  }

  // General help and guidance
  if (lowerQuestion.includes("help") || lowerQuestion.includes("explain") || lowerQuestion.includes("understand")) {
    return `I'm here to help you understand your legal document! I can provide detailed information about:

• **Document Summary** - What this document is and its main purpose
• **Your Obligations** - What you're required to do and when
• **Risks & Concerns** - Potential issues to be aware of
• **Important Deadlines** - Time-sensitive requirements
• **Financial Terms** - Costs, payments, and fees
• **Key Clauses** - The most important provisions
• **Termination** - How and when the agreement can end

Just ask me about any of these topics, or feel free to ask specific questions about anything in the document. What would you like to know more about?`
  }

  // Default response
  return `That's a great question! Based on the document analysis, I can see this is ${documentAnalysis?.documentType || "a legal document"} with several important provisions.

To give you the most helpful answer, could you be more specific about what aspect you're interested in? For example:
- Are you concerned about your obligations or responsibilities?
- Do you want to understand the risks involved?
- Are you looking for important deadlines or dates?
- Do you have questions about financial terms?
- Are you wondering about termination or cancellation?

I have detailed information about all these aspects and can provide specific insights based on your document.`
}
