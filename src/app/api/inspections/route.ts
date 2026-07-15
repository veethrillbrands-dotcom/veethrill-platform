import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const inspections = await db.inspection.findMany({
      include: { property: true, unit: true },
      orderBy: { scheduledAt: "desc" },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    console.error("[INSPECTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { propertyId, unitId, type, scheduledAt, inspectorId, findings, rating } = body;

    if (!propertyId || !type || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inspection = await db.inspection.create({
      data: {
        propertyId, unitId: unitId || null, type,
        scheduledAt: new Date(scheduledAt),
        inspectorId: inspectorId || null,
        findings: findings || null,
        rating: rating ? Number(rating) : null,
      },
      include: { property: true, unit: true },
    });
    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("[INSPECTIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
