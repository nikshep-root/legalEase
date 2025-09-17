import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Shield, Clock, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { DemoModal } from "@/components/demo-modal"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LegalEase AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
          </nav>
          <Button asChild className="shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/upload">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <Badge
            variant="default"
            className="mb-6 bg-primary/90 text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg"
          >
            ✨ Powered by Advanced AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 leading-tight">
            Simplify Legal Documents with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Analysis
            </span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload contracts, policies, and legal documents to get instant summaries, risk analysis, and key clause
            identification. No legal expertise required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" asChild className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
              <Link href="/upload">Analyze Document</Link>
            </Button>
            <DemoModal />
          </div>
          <p className="text-sm text-muted-foreground">Free trial • No credit card required • Secure & confidential</p>
        </div>
        <div className="absolute top-20 left-10 w-32 h-32 glass-subtle rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 glass-subtle rounded-full opacity-30 animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LegalEase AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform complex legal documents into clear, actionable insights in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered Summaries</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get concise, clear summaries of complex legal documents in plain English
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">Risk Analysis</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Identify potential risks, liabilities, and red flags before you sign
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-chart-2" />
                </div>
                <CardTitle className="text-xl">Key Clause Detection</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Automatically highlight important clauses, deadlines, and obligations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle className="text-xl">Instant Results</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Upload and analyze documents in seconds, not hours of manual review
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-chart-5/20 to-chart-5/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-chart-5" />
                </div>
                <CardTitle className="text-xl">For Everyone</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Perfect for students, professionals, and businesses of all sizes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass glass-hover group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Your documents are processed securely and never stored permanently
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to understand any legal document
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Document</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag and drop your PDF or text document. We support contracts, policies, agreements, and more.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our advanced AI processes your document, extracting key information and identifying important clauses.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive a clear summary, risk analysis, and highlighted key clauses in an easy-to-understand format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="glass-strong rounded-3xl mx-4 py-16 px-8 relative">
          <div className="container mx-auto text-center max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your Legal Documents?</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of users who trust LegalEase AI to make sense of complex legal language.
            </p>
            <Button size="lg" asChild className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
              <Link href="/upload">Start Analyzing Now</Link>
            </Button>
          </div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-border/50 py-12 px-4 mt-20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">LegalEase AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors font-medium">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 LegalEase AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
