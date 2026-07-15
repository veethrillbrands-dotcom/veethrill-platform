import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const invoices = await db.invoice.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, tenantId, bookingId, recipientName, recipientEmail, description, lineItems, taxRate, dueDate, notes } = body;

    if (!type || !recipientName || !description || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const items = Array.isArray(lineItems) ? lineItems : [];
    const subtotal = items.reduce((s: number, item: { qty: number; unitPrice: number }) => s + (item.qty * item.unitPrice), 0);
    const tax = subtotal * (Number(taxRate ?? 0) / 100);
    const total = subtotal + tax;
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber, type, tenantId: tenantId || null, bookingId: bookingId || null,
        recipientName, recipientEmail: recipientEmail || null,
        description, lineItems: items, subtotal, taxRate: Number(taxRate ?? 0),
        total, dueDate: new Date(dueDate), notes,
      },
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
