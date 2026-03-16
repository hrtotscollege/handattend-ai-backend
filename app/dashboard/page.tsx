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
      createdAt: {
        gte: startOfToday,
      }
    },
    select: {
      createdAt: true,
      updatedAt: true
    }
  });

  let avgProcessingTimeToday = 0;
  if (completedSheetsToday.length > 0) {
    const totalDiff = completedSheetsToday.reduce((acc, curr) => {
      return acc + (curr.updatedAt.getTime() - curr.createdAt.getTime());
    }, 0);
    avgProcessingTimeToday = totalDiff / completedSheetsToday.length / 1000; // in seconds
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sheets Processed</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSheets}</div>
          <p className="text-xs text-muted-foreground">+{sheetsProcessedToday} today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">+{employeesAddedToday} today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Accuracy (Today)</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgAccuracyToday > 0 ? `${avgAccuracyToday.toFixed(1)}%` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">Based on today&apos;s OCR</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time (Today)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProcessingTimeToday > 0 ? `${avgProcessingTimeToday.toFixed(1)}s` : 'N/A'}</div>
          <p className="text-xs text-muted-foreground">For completed sheets today</p>
        </CardContent>
      </Card>
    </div>
  )
}
