import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, extractedData } = body;

    if (!fileName || !extractedData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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
    
    // Fallback to first user if no token
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      } else {
        // Create a dummy user if none exists
        const dummyUser = await prisma.user.create({
          data: {
            email: 'dummy@example.com',
            passwordHash: 'dummy',
          }
        });
        userId = dummyUser.id;
      }
    }

    // Fetch actual employees from the database to match names
    const employees = await prisma.employee.findMany();
    
    // Create attendance sheet
    const sheet = await prisma.attendanceSheet.create({
      data: {
        userId: userId,
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

  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
