import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const units = await db.unit.findMany({
      include: { property: true, leases: { where: { status: "ACTIVE" }, include: { tenant: { include: { user: true } } } } },
      orderBy: [{ propertyId: "asc" }, { unitNumber: "asc" }],
    });
    return NextResponse.json(units);
  } catch (error) {
    console.error("[UNITS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { propertyId, unitNumber, floor, bedrooms, bathrooms, sqMeters, monthlyRent, depositAmount, nightlyRate, isShortlet } = body;

    if (!propertyId || !unitNumber || bedrooms === undefined || bathrooms === undefined || !monthlyRent || !depositAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const unit = await db.unit.create({
      data: {
        propertyId, unitNumber,
        floor: floor ?? 1,
        bedrooms, bathrooms,
        sqMeters: sqMeters ? Number(sqMeters) : null,
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
        nightlyRate: nightlyRate ? Number(nightlyRate) : null,
        status: "VACANT",
      },
      include: { property: true },
    });
    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("[UNITS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
