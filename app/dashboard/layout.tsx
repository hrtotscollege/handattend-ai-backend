'use client';

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Users, LayoutDashboard, Settings, LogOut } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold" suppressHydrationWarning>
            <FileText className="h-6 w-6 text-primary" />
            <span className="">HandAttend AI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2 flex flex-col justify-between">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              suppressHydrationWarning
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              suppressHydrationWarning
            >
              <FileText className="h-4 w-4" />
              Upload Sheets
            </Link>
            <Link
              href="/dashboard/review"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              suppressHydrationWarning
            >
              <FileText className="h-4 w-4" />
              Review & Correct
            </Link>
            <Link
              href="/dashboard/employees"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              suppressHydrationWarning
            >
              <Users className="h-4 w-4" />
              Employees
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              suppressHydrationWarning
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
