import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const contact = await db.crmContact.update({ where: { id }, data: body });
    return NextResponse.json(contact);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.crmContact.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
