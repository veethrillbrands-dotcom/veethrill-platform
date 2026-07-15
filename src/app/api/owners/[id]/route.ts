import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, phone, bankName, bankAccountNumber, bankAccountName } = body;

    const owner = await db.owner.findUnique({ where: { id }, include: { user: true } });
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (firstName || lastName || phone) {
      await db.user.update({
        where: { id: owner.userId },
        data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone !== undefined && { phone }) },
      });
    }

    const updated = await db.owner.update({
      where: { id },
      data: {
        ...(bankName !== undefined && { bankName }),
        ...(bankAccountNumber !== undefined && { bankAccountNumber }),
        ...(bankAccountName !== undefined && { bankAccountName }),
      },
      include: { user: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[OWNER_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const owner = await db.owner.findUnique({ where: { id } });
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.user.delete({ where: { id: owner.userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[OWNER_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
