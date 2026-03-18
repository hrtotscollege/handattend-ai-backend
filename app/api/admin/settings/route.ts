import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: "default",
          name: "HandAttend AI",
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);

    const { name, logoUrl } = await req.json();

    const settings = await prisma.companySettings.upsert({
      where: { id: "default" },
      update: {
        name: name !== undefined ? name : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      },
      create: {
        id: "default",
        name: name || "HandAttend AI",
        logoUrl: logoUrl || null,
      }
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
