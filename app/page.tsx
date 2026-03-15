import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Upload, CheckCircle, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#" suppressHydrationWarning>
          <FileText className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl">HandAttend AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features" suppressHydrationWarning>
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works" suppressHydrationWarning>
            How it Works
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Automate Arabic Handwritten Attendance
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Convert messy, handwritten Arabic attendance sheets into structured Excel files with 99% accuracy using advanced AI and OCR.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard" suppressHydrationWarning>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Easy Upload</h3>
                <p className="text-muted-foreground">
                  Simply upload photos or scans of your attendance sheets. We handle skewed images and bad lighting.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Arabic OCR</h3>
                <p className="text-muted-foreground">
                  Our consensus engine uses multiple OCR models to accurately read Arabic names and mixed numbers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Fuzzy Matching</h3>
                <p className="text-muted-foreground">
                  Automatically matches recognized names to your employee database to eliminate typos and errors.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 HandAttend AI. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#" suppressHydrationWarning>
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#" suppressHydrationWarning>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
