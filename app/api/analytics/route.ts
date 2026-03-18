import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from "date-fns";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") || "6");
    
    const now = new Date();
    const startDate = startOfMonth(subMonths(now, months - 1));
    const endDate = endOfMonth(now);

    // 1. Summary Stats
    const totalEmployees = await prisma.employee.count();
    const totalRecords = await prisma.attendanceRecord.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const lateRecords = await prisma.attendanceRecord.count({
      where: {
        status: "LATE",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const absentRecords = await prisma.attendanceRecord.count({
      where: {
        status: "ABSENT",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 2. Attendance Trend (Last 30 days)
    const thirtyDaysAgo = subMonths(now, 1);
    const trendRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const trendMap = new Map();
    trendRecords.forEach(record => {
      const dateStr = format(record.date, 'MMM dd');
      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, { date: dateStr, present: 0, late: 0, absent: 0 });
      }
      const dayData = trendMap.get(dateStr);
      if (record.status === "PRESENT") dayData.present++;
      else if (record.status === "LATE") dayData.late++;
      else if (record.status === "ABSENT") dayData.absent++;
    });
    const attendanceTrend = Array.from(trendMap.values());

    // 3. Department Stats
    const employees = await prisma.employee.findMany({
      include: {
        AttendanceRecord: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const deptMap = new Map();
    employees.forEach(emp => {
      const dept = emp.department || "Unassigned";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { name: dept, total: 0, present: 0 });
      }
      const deptData = deptMap.get(dept);
      deptData.total += emp.AttendanceRecord.length;
      deptData.present += emp.AttendanceRecord.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
    });

    const departmentStats = Array.from(deptMap.values()).map(d => ({
      name: d.name,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    }));

    // 4. Top Latecomers
    const latecomers = await prisma.employee.findMany({
      select: {
        id: true,
        nameArabic: true,
        department: true,
        _count: {
          select: {
            AttendanceRecord: {
              where: {
                status: "LATE",
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        AttendanceRecord: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topLatecomers = latecomers.map(l => ({
      id: l.id,
      name: l.nameArabic,
      department: l.department,
      count: l._count.AttendanceRecord,
    })).filter(l => l.count > 0);

    return NextResponse.json({
      summary: {
        totalEmployees,
        totalRecords,
        lateRecords,
        absentRecords,
        attendanceRate: totalRecords > 0 ? Math.round(((totalRecords - absentRecords) / totalRecords) * 100) : 0,
      },
      attendanceTrend,
      departmentStats,
      topLatecomers,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
