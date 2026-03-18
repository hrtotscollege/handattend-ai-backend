import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    // Get start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Total Sheets Processed (Today)
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

    return NextResponse.json({
      sheetsProcessedToday,
      totalSheets,
      totalEmployees,
      employeesAddedToday,
      avgAccuracyToday: avgAccuracyToday.toFixed(1),
      avgProcessingTimeToday: formattedProcessingTime
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
