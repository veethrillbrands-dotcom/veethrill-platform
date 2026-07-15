import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, approvedBy, notes } = body;

    const data: Record<string, unknown> = {};
    if (status) {
      data.status = status;
      if (status === "APPROVED") { data.approvedAt = new Date(); data.approvedBy = approvedBy ?? "Admin"; }
      if (status === "SENT") data.sentAt = new Date();
      if (status === "PAID") data.paidAt = new Date();
    }
    if (notes !== undefined) data.notes = notes;

    const invoice = await db.invoice.update({ where: { id }, data });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[INVOICE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
