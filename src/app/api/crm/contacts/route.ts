import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const contacts = await db.crmContact.findMany({ orderBy: { createdAt: "desc" }, include: { deals: true } });
    return NextResponse.json(contacts);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, type, email, phone, company, location, source, notes } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const contact = await db.crmContact.create({ data: { name, type: type || "Prospect", email, phone, company, location, source, notes } });
    return NextResponse.json(contact, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
