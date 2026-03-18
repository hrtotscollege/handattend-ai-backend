import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, CheckCircle, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get start of today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 1. Total Sheets Processed
  const sheetsProcessedToday = await prisma.attendanceSheet.count({
    where: {
      createdAt: {
        gte: startOfToday,
      }
    }
  });

  const totalSheets = await prisma.attendanceSheet.count();

  // 2. Total Employees
  const totalEmployees = await prisma.employee.count();
  const employeesAddedToday = await prisma.employee.count({
    where: {
      createdAt: {
        gte: startOfToday,
      }
    }
  });

  // 3. Average Accuracy (Today)
  const recognizedDataToday = await prisma.recognizedData.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      }
    },
    select: {
      confidenceScore: true
    }
  });

  let avgAccuracyToday = 0;
  if (recognizedDataToday.length > 0) {
    const sum = recognizedDataToday.reduce((acc, curr) => acc + curr.confidenceScore, 0);
    avgAccuracyToday = (sum / recognizedDataToday.length) * 100;
  }

  // 4. Avg Processing Time (Today)
  const completedSheetsToday = await prisma.attendanceSheet.findMany({
    where: {
      status: "COMPLETED",
      updatedAt: {
        gte: startOfToday,
      }
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  });

  let avgProcessingTimeToday = 0;
  let formattedProcessingTime = 'N/A';
  if (completedSheetsToday.length > 0) {
    const totalDiff = completedSheetsToday.reduce((acc, curr) => {
      return acc + (curr.updatedAt.getTime() - curr.createdAt.getTime());
    }, 0);
    avgProcessingTimeToday = totalDiff / completedSheetsToday.length / 1000; // in seconds
    
    if (avgProcessingTimeToday < 60) {
      formattedProcessingTime = `${avgProcessingTimeToday.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(avgProcessingTimeToday / 60);
      const seconds = Math.round(avgProcessingTimeToday % 60);
      formattedProcessingTime = `${minutes}m ${seconds}s`;
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Sheets Processed</CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{totalSheets}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            <span className="text-emerald-600 font-semibold">+{sheetsProcessedToday}</span> today
          </p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Employees</CardTitle>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{totalEmployees}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            <span className="text-emerald-600 font-semibold">+{employeesAddedToday}</span> today
          </p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Average Accuracy (Today)</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{recognizedDataToday.length > 0 ? `${avgAccuracyToday.toFixed(1)}%` : 'N/A'}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Based on today&apos;s OCR</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Avg Processing Time (Today)</CardTitle>
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{formattedProcessingTime}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">For completed sheets today</p>
        </CardContent>
      </Card>
    </div>
  )
}
