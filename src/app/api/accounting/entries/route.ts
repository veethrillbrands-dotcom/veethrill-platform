import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const entries = await db.accountingEntry.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("[ACCOUNTING_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { date, description, category, amount, type, reference, notes } = body;
    if (!description || !category || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const entry = await db.accountingEntry.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description, category, amount: Number(amount), type, reference, notes,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[ACCOUNTING_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
