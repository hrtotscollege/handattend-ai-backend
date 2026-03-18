"use client"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { UploadCloud, Cpu, UserCheck, Download } from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UploadCloud,
      title: "1. Upload Sheets",
      description: "Take a photo or scan your handwritten Arabic attendance sheets and upload them to the dashboard."
    },
    {
      icon: Cpu,
      title: "2. AI Processing",
      description: "Our advanced AI models analyze the handwriting, extracting names, arrival times, and departure times."
    },
    {
      icon: UserCheck,
      title: "3. Review & Match",
      description: "The system automatically matches names to your employee database. You can quickly review and correct any uncertainties."
    },
    {
      icon: Download,
      title: "4. Export Data",
      description: "Once verified, export the structured data to Excel or CSV for seamless integration with your payroll software."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">How It Works</h1>
            <p className="mt-4 text-xl text-slate-600">Transform your manual attendance process in four simple steps.</p>
          </div>
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex-shrink-0 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <step.icon className="h-10 w-10" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
