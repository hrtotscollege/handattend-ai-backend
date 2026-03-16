import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const prisma = new PrismaClient();
    
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

    await prisma.$disconnect();

    return NextResponse.json({
      sheetsProcessedToday,
      totalSheets,
      totalEmployees,
      employeesAddedToday,
      avgAccuracyToday: avgAccuracyToday.toFixed(1),
      avgProcessingTimeToday: avgProcessingTimeToday.toFixed(1)
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
