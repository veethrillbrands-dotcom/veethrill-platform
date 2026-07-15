import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tenantId = searchParams.get("tenantId");

    const payments = await db.payment.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(tenantId && { tenantId }),
      },
      include: {
        tenant: { include: { user: true } },
        lease: { include: { unit: { include: { property: true } } } },
        booking: { include: { unit: { include: { property: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tenantId, leaseId, amount, type, method, dueDate, notes } = body;

    if (!tenantId || !amount || !type || !method || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reference = `VT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const payment = await db.payment.create({
      data: {
        tenantId, leaseId,
        amount, type, method,
        status: "PAID",
        reference,
        dueDate: new Date(dueDate),
        paidAt: new Date(),
        notes,
      },
      include: { tenant: { include: { user: true } }, lease: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("[PAYMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
