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
    const { agent, property, dealValue, commissionRate, type, saleDate } = body;
    if (!agent || !property) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    const dv = Number(dealValue) || 0;
    const cr = Number(commissionRate) || 3;
    const commission = await db.crmCommission.create({
      data: {
        agent, property,
        dealValue: dv, commissionRate: cr,
        commissionAmount: dv * (cr / 100),
        type: type || "Sale", status: "Pending",
        saleDate: saleDate ? new Date(saleDate) : undefined,
      },
    });
    return NextResponse.json(commission, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
