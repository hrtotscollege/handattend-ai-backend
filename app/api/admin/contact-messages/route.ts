import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    const messages = await prisma.log.findMany({
      where: {
        action: "CONTACT_MESSAGE",
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Failed to fetch contact messages", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
