import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

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
    
    return NextResponse.json(correctedData);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error fetching learning data:", error);
    return NextResponse.json([]);
  }
}
