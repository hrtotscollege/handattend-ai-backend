'use client';

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Users, LayoutDashboard, Settings, LogOut, UploadCloud, CheckSquare, BarChart3, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("HandAttend AI");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.role) {
          setUserRole(data.role);
        }
      })
      .catch(console.error);

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setCompanyName(data.name);
        if (data && data.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/upload", icon: UploadCloud, label: "Upload Sheets" },
    { href: "/dashboard/review", icon: CheckSquare, label: "Review & Correct" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/employees", icon: Users, label: "Employees" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ href: "/dashboard/admin", icon: ShieldAlert, label: "Admin Module" });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col bg-slate-900 text-slate-300 sm:flex shadow-xl">
        <div className="flex h-16 items-center px-6 bg-slate-950/50 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3 font-bold text-white tracking-tight" suppressHydrationWarning>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-md object-contain bg-white" />
            ) : (
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-lg truncate">{companyName}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-6 flex flex-col justify-between">
          <nav className="grid items-start px-4 text-sm font-medium gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                  suppressHydrationWarning
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {navItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
