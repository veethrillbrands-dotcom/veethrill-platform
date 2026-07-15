import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leases = await db.lease.findMany({
      include: {
        unit: { include: { property: true } },
        tenant: { include: { user: true } },
        payments: { orderBy: { dueDate: "desc" }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error("[LEASES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { unitId, tenantId, startDate, endDate, rentAmount, depositAmount, autoRenew, escalationRate } = body;

    if (!unitId || !tenantId || !startDate || !endDate || !rentAmount || !depositAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check unit availability
    const existing = await db.lease.findFirst({
      where: { unitId, status: { in: ["ACTIVE", "PENDING"] } },
    });
    if (existing) return NextResponse.json({ error: "Unit already has an active lease" }, { status: 409 });

    const lease = await db.lease.create({
      data: {
        unitId, tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount, depositAmount,
        autoRenew: autoRenew ?? false,
        escalationRate,
        status: "ACTIVE",
      },
      include: { unit: { include: { property: true } }, tenant: { include: { user: true } } },
    });

    // Update unit status
    await db.unit.update({ where: { id: unitId }, data: { status: "OCCUPIED" } });

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    console.error("[LEASES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
