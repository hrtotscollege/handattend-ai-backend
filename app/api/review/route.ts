import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function PUT(req: Request) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const { id, rawName, matchedId, checkIn, checkOut } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

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
        confidenceScore: 1.0, // Set to 1.0 since it was manually reviewed
        isManuallyCorrected: true
      }
    });

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error updating review data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const { sheetId } = body;

    if (!sheetId) {
      return NextResponse.json({ error: "Missing Sheet ID" }, { status: 400 });
    }

    const recognizedData = await prisma.recognizedData.findMany({
      where: { sheetId },
      include: { employee: true }
    });

    const records = [];
    for (const item of recognizedData) {
      if (item.employeeId && item.date) {
        // Determine status
        let status = "PRESENT";
        if (item.checkIn) {
          const [hours, minutes] = item.checkIn.split(':').map(Number);
          if (hours > 8 || (hours === 8 && minutes > 0)) {
            status = "LATE";
          }
        } else {
          status = "ABSENT";
        }

        const record = await prisma.attendanceRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: item.employeeId,
              date: item.date,
            },
          },
          update: {
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            status: status,
          },
          create: {
            employeeId: item.employeeId,
            date: item.date,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            status: status,
          },
        });
        records.push(record);
      }
    }

    await prisma.attendanceSheet.update({
      where: { id: sheetId },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error finalizing review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    
    let recognizedData: any[] = [];
    
    // Fetch latest pending sheet for this user
    const latestSheet = await prisma.attendanceSheet.findFirst({
      where: { 
        userId: user.id,
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
    
    let data: any[] = [];
    if (recognizedData.length > 0) {
      data = recognizedData.map((item) => ({
        id: item.id,
        sheetId: item.sheetId,
        rawName: item.rawNameText,
        matchedId: item.employee?.employeeId || null,
        date: item.date ? item.date.toISOString().split('T')[0] : null,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        confidence: item.confidenceScore,
        isEdited: item.isManuallyCorrected
      }));
    } else {
      data = [];
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error fetching review data:", error);
    return NextResponse.json([]);
  }
}
