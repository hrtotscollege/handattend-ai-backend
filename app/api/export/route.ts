import { NextResponse } from "next/server"
import { write, utils } from "xlsx"
import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sheetId = searchParams.get("sheetId")

    if (!sheetId) {
      return NextResponse.json({ error: "Sheet ID required" }, { status: 400 })
    }

    // 1. Fetch RecognizedData from DB
    /*
    const recognizedData = await prisma.recognizedData.findMany({
      where: { sheetId },
      include: { employee: true }
    })
    */

    // Mock data for demonstration
    const recognizedData = [
      { employee: { employeeId: "EMP001", nameArabic: "أحمد محمد" }, date: new Date("2026-02-24"), checkIn: "07:30", checkOut: "15:00" },
      { employee: { employeeId: "EMP002", nameArabic: "سارة خالد" }, date: new Date("2026-02-24"), checkIn: "08:00", checkOut: "16:00" },
    ]

    // 2. Format data for Excel
    const excelData = recognizedData.map(item => ({
      "Employee ID": item.employee?.employeeId || "UNKNOWN",
      "Employee Name": item.employee?.nameArabic || "UNKNOWN",
      "Date": item.date ? item.date.toISOString().split('T')[0] : "",
      "Check-in": item.checkIn || "",
      "Check-out": item.checkOut || ""
    }))

    // 3. Create Excel workbook
    const worksheet = utils.json_to_sheet(excelData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Attendance")

    // 4. Generate buffer
    const buffer = write(workbook, { type: "buffer", bookType: "xlsx" })

    // 5. Return as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="attendance_${sheetId}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
