import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const deals = await db.crmDeal.findMany({ orderBy: { createdAt: "desc" }, include: { contact: true } });
    return NextResponse.json(deals);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { title, contactId, contactName, value, stage, probability, dueDate, notes } = body;
    if (!title || !contactName) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    const deal = await db.crmDeal.create({
      data: {
        title, contactId: contactId || undefined, contactName,
        value: Number(value) || 0, stage: stage || "Enquiry",
        probability: Number(probability) || 30,
        dueDate: dueDate ? new Date(dueDate) : undefined, notes,
      },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
