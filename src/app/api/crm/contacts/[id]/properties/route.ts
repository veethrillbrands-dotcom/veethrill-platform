import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const links = await db.crmContactProperty.findMany({
    where: { contactId: id },
    include: { property: { include: { units: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const link = await db.crmContactProperty.upsert({
    where: { contactId_propertyId: { contactId: id, propertyId: body.propertyId } },
    create: { contactId: id, propertyId: body.propertyId, interest: body.interest ?? "Interested", notes: body.notes ?? null },
    update: { interest: body.interest ?? "Interested", notes: body.notes ?? null },
    include: { property: { include: { units: true } } },
  });
  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { propertyId } = await req.json();
  await db.crmContactProperty.delete({ where: { contactId_propertyId: { contactId: id, propertyId } } });
  return NextResponse.json({ ok: true });
}
