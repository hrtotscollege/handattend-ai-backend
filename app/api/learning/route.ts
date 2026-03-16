import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const prisma = new PrismaClient();
    
    // Fetch recently corrected data (confidenceScore = 1.0 means it was manually edited/saved)
    const correctedData = await prisma.recognizedData.findMany({
      where: {
        confidenceScore: 1.0,
      },
      include: {
        employee: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json(correctedData);
  } catch (error) {
    console.error("Error fetching learning data:", error);
    return NextResponse.json([]);
  }
}
