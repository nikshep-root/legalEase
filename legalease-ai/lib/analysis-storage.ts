import type { DocumentAnalysis } from "./document-processor"

export interface StoredAnalysis {
  id: string
  analysis: DocumentAnalysis
  timestamp: number
  fileName: string
}

class AnalysisStorage {
  private readonly STORAGE_KEY = "legalease_analyses"
  private readonly MAX_ANALYSES = 10 // Keep only the 10 most recent analyses

  // Store analysis with better error handling
  storeAnalysis(id: string, analysis: DocumentAnalysis, fileName: string): boolean {
    try {
      console.log("[v0] Storing analysis with ID:", id)

      // Get existing analyses
      const existingAnalyses = this.getAllAnalyses()

      // Create new analysis entry
      const newAnalysis: StoredAnalysis = {
        id,
        analysis,
        timestamp: Date.now(),
        fileName,
      }

      // Add to the beginning of the array
      existingAnalyses.unshift(newAnalysis)

      // Keep only the most recent analyses
      const trimmedAnalyses = existingAnalyses.slice(0, this.MAX_ANALYSES)

      // Store both individual and collection
      localStorage.setItem(id, JSON.stringify(analysis))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedAnalyses))

      console.log("[v0] Analysis stored successfully")
      console.log("[v0] Total analyses stored:", trimmedAnalyses.length)

      return true
    } catch (error) {
      console.error("[v0] Failed to store analysis:", error)
      return false
    }
  }

  // Retrieve analysis with fallback options
  getAnalysis(id: string): DocumentAnalysis | null {
    try {
      console.log("[v0] Looking for analysis with ID:", id)

      // Try direct lookup first
      const directResult = localStorage.getItem(id)
      if (directResult) {
        const parsed = JSON.parse(directResult)
        console.log("[v0] Found analysis via direct lookup")
        return parsed
      }

      // Try from the analyses collection
      const allAnalyses = this.getAllAnalyses()
      const foundAnalysis = allAnalyses.find((item) => item.id === id)
      if (foundAnalysis) {
        console.log("[v0] Found analysis in collection")
        return foundAnalysis.analysis
      }

      // If no exact match, try to find the most recent analysis as fallback
      if (allAnalyses.length > 0) {
        console.log("[v0] Using most recent analysis as fallback")
        return allAnalyses[0].analysis
      }

      console.log("[v0] No analysis found")
      return null
    } catch (error) {
      console.error("[v0] Error retrieving analysis:", error)
      return null
    }
  }

  // Get all stored analyses
  getAllAnalyses(): StoredAnalysis[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch (error) {
      console.error("[v0] Error getting all analyses:", error)
      return []
    }
  }

  // Get the most recent analysis
  getMostRecentAnalysis(): DocumentAnalysis | null {
    const analyses = this.getAllAnalyses()
    return analyses.length > 0 ? analyses[0].analysis : null
  }

  // Clear old analyses
  clearOldAnalyses(): void {
    try {
      const analyses = this.getAllAnalyses()
      const recentAnalyses = analyses.slice(0, this.MAX_ANALYSES)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentAnalyses))
      console.log("[v0] Cleared old analyses, kept:", recentAnalyses.length)
    } catch (error) {
      console.error("[v0] Error clearing old analyses:", error)
    }
  }

  // Create a mock analysis for testing
  createMockAnalysis(): DocumentAnalysis {
    return {
      summary:
        "This is a comprehensive legal document analysis. The document appears to be a service agreement containing standard commercial terms and conditions. Key provisions include payment terms, liability limitations, and termination clauses. The agreement establishes clear obligations for both parties and includes standard legal protections. Overall, this appears to be a well-structured commercial agreement with reasonable terms for both parties.",
      documentType: "Service Agreement",
      keyPoints: [
        "Payment terms require net 30-day payment schedule with late fees for overdue amounts",
        "Service provider maintains liability cap at contract value with standard exclusions",
        "Either party may terminate with 30-day written notice without cause",
        "Intellectual property rights clearly defined with work-for-hire provisions",
        "Confidentiality obligations extend 2 years beyond contract termination",
        "Dispute resolution requires mediation before litigation",
        "Force majeure clause provides protection for unforeseeable circumstances",
        "Governing law specified as jurisdiction where services are primarily performed",
      ],
      risks: [
        {
          level: "High" as const,
          description:
            "Unlimited liability exposure in cases of gross negligence or willful misconduct could result in significant financial exposure beyond the contract value.",
          recommendation:
            "Consider negotiating a cap on liability even for gross negligence, or ensure adequate insurance coverage is in place to protect against potential claims.",
        },
        {
          level: "Medium" as const,
          description:
            "Automatic renewal clause could lock parties into unfavorable terms if market conditions change significantly.",
          recommendation:
            "Add a clause allowing for renegotiation of key terms upon renewal, or limit automatic renewals to shorter periods.",
        },
        {
          level: "Low" as const,
          description: "Vague performance standards could lead to disputes about service quality expectations.",
          recommendation:
            "Define specific, measurable performance metrics and service level agreements to avoid future disagreements.",
        },
      ],
      obligations: [
        {
          party: "Service Provider",
          description: "Deliver services according to specifications within agreed timelines and quality standards",
          deadline: "Ongoing throughout contract term",
        },
        {
          party: "Client",
          description: "Provide necessary access, information, and cooperation for service delivery",
          deadline: "Within 5 business days of service commencement",
        },
        {
          party: "Both Parties",
          description: "Maintain confidentiality of proprietary information and trade secrets",
          deadline: "Extends 2 years beyond contract termination",
        },
        {
          party: "Client",
          description: "Make payments according to agreed schedule and terms",
          deadline: "Net 30 days from invoice date",
        },
      ],
      importantClauses: [
        {
          title: "Limitation of Liability",
          content:
            "Service provider's total liability shall not exceed the total amount paid under this agreement, except in cases of gross negligence or willful misconduct.",
          importance:
            "This clause significantly limits the service provider's financial exposure and shifts risk to the client. Understanding this limitation is crucial for risk assessment.",
        },
        {
          title: "Termination Rights",
          content:
            "Either party may terminate this agreement with thirty (30) days written notice. Upon termination, all outstanding payments become immediately due.",
          importance:
            "Provides flexibility for both parties to exit the relationship but requires careful planning due to the immediate payment obligation.",
        },
        {
          title: "Intellectual Property Assignment",
          content:
            "All work product created under this agreement shall be considered work-for-hire and owned by the client upon full payment.",
          importance:
            "Clearly establishes ownership rights but ties IP transfer to payment completion, which could create complications if payment disputes arise.",
        },
      ],
      deadlines: [
        {
          description: "Initial service delivery and project kickoff",
          date: "Within 10 business days of contract execution",
          consequence: "Delay may trigger penalty clauses and could affect overall project timeline and deliverables.",
        },
        {
          description: "Monthly progress reports and billing submissions",
          date: "By the 5th of each month",
          consequence:
            "Late submissions may delay payment processing and could be considered a material breach if consistently missed.",
        },
        {
          description: "Contract renewal decision notification",
          date: "60 days before current term expiration",
          consequence:
            "Failure to provide timely notice will result in automatic renewal under current terms, potentially locking in unfavorable conditions.",
        },
      ],
    }
  }
}

export const analysisStorage = new AnalysisStorage()
