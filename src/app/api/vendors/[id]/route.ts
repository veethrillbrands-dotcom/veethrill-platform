import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { companyName, specialization, bankName, bankAccount, isVerified, phone } = body;

    const vendor = await db.vendor.findUnique({ where: { id } });
    if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (phone !== undefined) {
      await db.user.update({ where: { id: vendor.userId }, data: { phone } });
    }

    const updated = await db.vendor.update({
      where: { id },
      data: {
        ...(companyName && { companyName }),
        ...(specialization && { specialization: Array.isArray(specialization) ? specialization : [specialization] }),
        ...(bankName !== undefined && { bankName }),
        ...(bankAccount !== undefined && { bankAccount }),
        ...(isVerified !== undefined && { isVerified }),
      },
      include: { user: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[VENDOR_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const vendor = await db.vendor.findUnique({ where: { id } });
    if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.user.delete({ where: { id: vendor.userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[VENDOR_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
