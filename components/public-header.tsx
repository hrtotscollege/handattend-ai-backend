"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export function PublicHeader() {
  return (
    <header className="px-6 lg:px-10 h-20 flex items-center border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-3" href="/" suppressHydrationWarning>
        <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900">HandAttend AI</span>
      </Link>
      <nav className="ml-auto flex gap-6 items-center">
        <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden md:block" href="/features" suppressHydrationWarning>
          Features
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden md:block" href="/how-it-works" suppressHydrationWarning>
          How it Works
        </Link>
        <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden md:block" href="/contact" suppressHydrationWarning>
          Contact Us
        </Link>
        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        <Link className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden sm:block" href="/login" suppressHydrationWarning>
          Sign In
        </Link>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-full px-6">
          <Link href="/register" suppressHydrationWarning>
            Get Started
          </Link>
        </Button>
      </nav>
    </header>
  )
}
