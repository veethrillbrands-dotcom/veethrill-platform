import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const vendorId = searchParams.get("vendorId");
  const staffId = searchParams.get("staffId");

  const where = tenantId
    ? { raisedByUserId: (await db.user.findUnique({ where: { clerkId: userId } }))?.id }
    : vendorId
    ? { vendor: { userId: (await db.user.findUnique({ where: { clerkId: userId } }))?.id ?? "" } }
    : staffId
    ? { vendor: { userId: (await db.user.findUnique({ where: { clerkId: userId } }))?.id ?? "" } }
    : {};

  const orders = await db.workOrder.findMany({
    where,
    include: { property: true, unit: true, vendor: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map((o) => ({
    ...o,
    raisedAt: o.raisedAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    assignedAt: o.assignedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  })));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { title, description, category, priority, propertyId, unitId } = await req.json();
  if (!title || !description || !propertyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await db.workOrder.create({
    data: { title, description, category, priority, propertyId, unitId: unitId || undefined, raisedByUserId: user.id },
  });

  return NextResponse.json(order, { status: 201 });
}
