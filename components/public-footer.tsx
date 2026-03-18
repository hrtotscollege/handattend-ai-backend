"use client"

import Link from "next/link"
import { FileText } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-6 md:px-10 border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <p className="text-sm font-medium text-slate-600">
          © 2026 HandAttend AI. All rights reserved.
        </p>
      </div>
      <nav className="sm:ml-auto flex gap-6">
        <Link className="text-sm text-slate-500 hover:text-slate-900 transition-colors" href="#" suppressHydrationWarning>
          Terms of Service
        </Link>
        <Link className="text-sm text-slate-500 hover:text-slate-900 transition-colors" href="#" suppressHydrationWarning>
          Privacy Policy
        </Link>
      </nav>
    </footer>
  )
}
