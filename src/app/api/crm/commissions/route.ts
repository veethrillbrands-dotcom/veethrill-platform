import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const commissions = await db.crmCommission.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(commissions);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { agent, agentContactId, property, dealId, dealValue, commissionRate, partPaymentAmount, type, saleDate, dueDate } = body;
    if (!agent) return NextResponse.json({ error: "Agent is required" }, { status: 400 });
    const dv = Number(dealValue) || 0;
    const cr = Number(commissionRate) || 3;
    const commission = await db.crmCommission.create({
      data: {
        agent, agentContactId: agentContactId || undefined,
        property: property || "", dealId: dealId || undefined,
        dealValue: dv, commissionRate: cr,
        commissionAmount: dv * (cr / 100),
        partPaymentAmount: partPaymentAmount ? Number(partPaymentAmount) : undefined,
        type: type || "Sale", status: "Pending",
        saleDate: saleDate ? new Date(saleDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    return NextResponse.json(commission, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
