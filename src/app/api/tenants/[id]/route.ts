import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, phone, employerName, emergencyContact, emergencyPhone } = body;

    const tenant = await db.tenant.update({
      where: { id },
      data: {
        ...(employerName !== undefined && { employerName }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(emergencyPhone !== undefined && { emergencyPhone }),
        user: {
          update: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone !== undefined && { phone }),
          },
        },
      },
      include: { user: true },
    });
    return NextResponse.json(tenant);
  } catch (error) {
    console.error("[TENANT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const tenant = await db.tenant.findUnique({ where: { id }, select: { userId: true } });
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.user.delete({ where: { id: tenant.userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TENANT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
