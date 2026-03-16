import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, rawName, matchedId, checkIn, checkOut } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const prisma = new PrismaClient();

    // Find employee if matchedId is provided
    let employeeId = null;
    if (matchedId) {
      const employee = await prisma.employee.findUnique({
        where: { employeeId: matchedId }
      });
      if (employee) {
        employeeId = employee.id;
      }
    }

    const updatedRecord = await prisma.recognizedData.update({
      where: { id },
      data: {
        rawNameText: rawName,
        employeeId: employeeId,
        checkIn: checkIn,
        checkOut: checkOut,
        confidenceScore: 1.0 // Set to 1.0 since it was manually reviewed
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error("Error updating review data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    // Get user ID from cookie
    const token = req.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {
        console.error("JWT verification failed:", e);
      }
    }

    const prisma = new PrismaClient();
    
    let recognizedData: any[] = [];
    
    if (userId) {
      // Fetch latest pending sheet for this user
      const latestSheet = await prisma.attendanceSheet.findFirst({
        where: { 
          userId: userId,
          status: "REVIEW_NEEDED"
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (latestSheet) {
        recognizedData = await prisma.recognizedData.findMany({
          where: { sheetId: latestSheet.id },
          include: { employee: true }
        });
      }
    }
    
    // Fallback if no user or no sheets
    if (recognizedData.length === 0) {
      // Just fetch the latest recognized data globally
      recognizedData = await prisma.recognizedData.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { employee: true }
      });
    }
    
    let data: any[] = [];
    if (recognizedData.length > 0) {
      data = recognizedData.map((item) => ({
        id: item.id,
        rawName: item.rawNameText,
        matchedId: item.employee?.employeeId || null,
        date: item.date ? item.date.toISOString().split('T')[0] : null,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        confidence: item.confidenceScore
      }));
    } else {
      data = [];
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching review data:", error);
    return NextResponse.json([]);
  }
}
