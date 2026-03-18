import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);

    const body = await req.json();
    const { fileName, extractedData } = body;

    if (!fileName || !extractedData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch actual employees from the database to match names
    const employees = await prisma.employee.findMany();
    
    // Create attendance sheet
    const sheet = await prisma.attendanceSheet.create({
      data: {
        userId: user.id,
        fileUrl: "uploaded-file",
        fileName: fileName,
        status: "REVIEW_NEEDED",
      }
    });

    // Match extracted names with employees and save to RecognizedData
    const recognizedDataPromises = extractedData.map(async (item: any) => {
      // Simple exact match or includes match
      const matchedEmployee = employees.find(emp => 
        emp.nameArabic === item.raw_name || 
        emp.nameArabic.includes(item.raw_name) || 
        item.raw_name.includes(emp.nameArabic)
      );
      
      let dateObj = null;
      try {
        if (item.date) {
          dateObj = new Date(item.date);
          if (isNaN(dateObj.getTime())) dateObj = null;
        }
      } catch (e) {}

      return prisma.recognizedData.create({
        data: {
          sheetId: sheet.id,
          employeeId: matchedEmployee ? matchedEmployee.id : null,
          rawNameText: item.raw_name,
          date: dateObj,
          checkIn: item.check_in,
          checkOut: item.check_out,
          confidenceScore: item.confidence || 0.8,
        }
      });
    });

    await Promise.all(recognizedDataPromises);

    return NextResponse.json({ 
      message: "Data saved successfully",
      data: extractedData
    })

  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
