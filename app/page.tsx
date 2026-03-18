"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Upload, Zap, ShieldCheck } from "lucide-react"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600 mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="font-medium">Powered by Gemini 3.1 Pro</span>
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-slate-900">
                  Automate Arabic <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Handwritten Attendance</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
                  Convert messy, handwritten Arabic attendance sheets into structured digital records with 99% accuracy using advanced AI and OCR.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Button size="lg" className="h-14 px-8 text-base rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20" asChild>
                  <Link href="/register" suppressHydrationWarning>
                    Start for free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-300 text-slate-700 hover:bg-slate-100" asChild>
                  <Link href="/login" suppressHydrationWarning>
                    Sign In to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-20 md:py-32 bg-white border-t border-slate-100">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to digitize attendance</h2>
              <p className="mt-4 text-lg text-slate-600">Stop manual data entry and let AI do the heavy lifting.</p>
            </div>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                  <Upload className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Easy Upload</h3>
                <p className="text-slate-600 leading-relaxed">
                  Simply upload photos or scans of your attendance sheets. We handle skewed images and bad lighting automatically.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Smart Arabic OCR</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our consensus engine uses multiple OCR models to accurately read cursive Arabic names and mixed numerals.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Fuzzy Matching</h3>
                <p className="text-slate-600 leading-relaxed">
                  Automatically matches recognized names to your employee database to eliminate typos and ensure clean data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
