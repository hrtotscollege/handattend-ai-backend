"use client"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Upload, Zap, ShieldCheck, FileSpreadsheet, Users, BarChart3 } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Simply upload photos or scans of your attendance sheets. We handle skewed images and bad lighting automatically."
    },
    {
      icon: Zap,
      title: "Smart Arabic OCR",
      description: "Our consensus engine uses multiple OCR models to accurately read cursive Arabic names and mixed numerals."
    },
    {
      icon: ShieldCheck,
      title: "Fuzzy Matching",
      description: "Automatically matches recognized names to your employee database to eliminate typos and ensure clean data."
    },
    {
      icon: FileSpreadsheet,
      title: "Excel Export",
      description: "Export processed attendance records directly to Excel or CSV formats ready for your payroll system."
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure your data with Admin and User roles. Admins can manage settings and approve new users."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Visualize attendance trends, processing times, and department statistics in a comprehensive dashboard."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Powerful Features</h1>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to digitize attendance and streamline your HR processes.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
