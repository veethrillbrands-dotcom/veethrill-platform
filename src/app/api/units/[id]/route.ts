import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, monthlyRent, depositAmount, nightlyRate, unitNumber, floor, bedrooms, bathrooms, sqMeters } = body;

    const unit = await db.unit.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(monthlyRent !== undefined && { monthlyRent: Number(monthlyRent) }),
        ...(depositAmount !== undefined && { depositAmount: Number(depositAmount) }),
        ...(nightlyRate !== undefined && { nightlyRate: nightlyRate ? Number(nightlyRate) : null }),
        ...(unitNumber && { unitNumber }),
        ...(floor !== undefined && { floor }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(sqMeters !== undefined && { sqMeters: sqMeters ? Number(sqMeters) : null }),
      },
    });
    return NextResponse.json(unit);
  } catch (error) {
    console.error("[UNIT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.unit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UNIT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
