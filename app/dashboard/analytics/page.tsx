import { prisma } from "@/lib/prisma"
import AnalyticsDashboard from "./AnalyticsDashboard"

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Fetch data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Attendance Trends (Grouped by date)
  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
      }
    },
    select: {
      date: true,
      status: true,
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Process data for chart
  const attendanceByDate = attendanceRecords.reduce((acc, record) => {
    const dateStr = record.date.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, PRESENT: 0, ABSENT: 0, LATE: 0 };
    }
    acc[dateStr][record.status as "PRESENT" | "ABSENT" | "LATE"]++;
    return acc;
  }, {} as Record<string, { date: string, PRESENT: number, ABSENT: number, LATE: number }>);

  const attendanceData = Object.values(attendanceByDate);

  // 2. OCR Accuracy Trends
  const recognizedData = await prisma.recognizedData.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      }
    },
    select: {
      createdAt: true,
      confidenceScore: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const accuracyByDate = recognizedData.reduce((acc, record) => {
    const dateStr = record.createdAt.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, totalScore: 0, count: 0 };
    }
    acc[dateStr].totalScore += record.confidenceScore;
    acc[dateStr].count++;
    return acc;
  }, {} as Record<string, { date: string, totalScore: number, count: number }>);

  const accuracyData = Object.values(accuracyByDate).map((item) => ({
    date: item.date,
    accuracy: Math.round((item.totalScore / item.count) * 100)
  }));

  // 3. Top Absent/Late Employees
  const employeeStats = await prisma.attendanceRecord.groupBy({
    by: ['employeeId', 'status'],
    where: {
      status: {
        in: ['ABSENT', 'LATE']
      },
      date: {
        gte: thirtyDaysAgo,
      }
    },
    _count: {
      status: true
    }
  });

  // Need to fetch employee names
  const employeeIds = [...new Set(employeeStats.map(s => s.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, nameArabic: true }
  });

  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.nameArabic;
    return acc;
  }, {} as Record<string, string>);

  const processedEmployeeStats = employeeStats.map(stat => ({
    name: employeeMap[stat.employeeId] || 'Unknown',
    status: stat.status,
    count: stat._count.status
  }));

  // Sort by count descending
  processedEmployeeStats.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Reports</h2>
        <p className="text-slate-500">View attendance trends and AI processing accuracy over the last 30 days.</p>
      </div>
      
      <AnalyticsDashboard 
        attendanceData={attendanceData} 
        accuracyData={accuracyData} 
        employeeStats={processedEmployeeStats}
      />
    </div>
  )
}
