// Utility functions for document processing

export interface DocumentAnalysis {
  summary: string
  documentType: string
  keyPoints: string[]
  risks: Array<{
    level: "High" | "Medium" | "Low"
    description: string
    recommendation: string
  }>
  obligations: Array<{
    party: string
    description: string
    deadline?: string
  }>
  importantClauses: Array<{
    title: string
    content: string
    importance: string
  }>
  deadlines: Array<{
    description: string
    date?: string
    consequence: string
  }>
}

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist")

        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            console.log("[v0] Starting PDF text extraction...")
            const arrayBuffer = event.target?.result as ArrayBuffer
            if (!arrayBuffer) {
              reject(new Error("Failed to read PDF file"))
              return
            }

            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

            console.log("[v0] Loading PDF document...")
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            let fullText = ""

            console.log("[v0] PDF loaded, extracting text from", pdf.numPages, "pages...")

            // Extract text from all pages
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i)
              const textContent = await page.getTextContent()
              const pageText = textContent.items.map((item: any) => item.str).join(" ")
              fullText += pageText + "\n"
              console.log("[v0] Extracted text from page", i)
            }

            const text = fullText.trim()

            if (text.length === 0) {
              console.log("[v0] PDF appears to be empty or image-based")
              reject(new Error("PDF appears to be empty or contains no extractable text"))
              return
            }

            console.log("[v0] Successfully extracted text from PDF:", text.substring(0, 100) + "...")
            resolve(text)
          } catch (error) {
            console.error("[v0] PDF parsing error:", error)
            reject(new Error("Failed to extract text from PDF"))
          }
        }
        reader.onerror = () => reject(new Error("Error reading PDF file"))
        reader.readAsArrayBuffer(file)
      } catch (error) {
        console.error("[v0] Failed to load PDF.js:", error)
        reject(new Error("Failed to load PDF processing library"))
      }
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          if (result.trim().length === 0) {
            reject(new Error("Document appears to be empty"))
            return
          }
          resolve(result)
        } else {
          reject(new Error("Failed to read file as text"))
        }
      }
      reader.onerror = () => reject(new Error("Error reading file"))
      reader.readAsText(file)
    }
  })
}

export async function analyzeDocument(text: string, fileName: string): Promise<DocumentAnalysis> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, fileName }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Analysis failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return result.analysis
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Analysis request timed out")
    }
    throw error
  }
}

export function getRiskColor(level: "High" | "Medium" | "Low"): string {
  switch (level) {
    case "High":
      return "text-destructive"
    case "Medium":
      return "text-yellow-600"
    case "Low":
      return "text-green-600"
    default:
      return "text-muted-foreground"
  }
}

export function getRiskBadgeVariant(level: "High" | "Medium" | "Low"): "destructive" | "secondary" | "default" {
  switch (level) {
    case "High":
      return "destructive"
    case "Medium":
      return "secondary"
    case "Low":
      return "default"
    default:
      return "secondary"
  }
}
