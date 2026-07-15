import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenants = await db.tenant.findMany({
      include: {
        user: true,
        leases: {
          where: { status: "ACTIVE" },
          include: { unit: { include: { property: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        payments: { orderBy: { dueDate: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("[TENANTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { email, firstName, lastName, phone, employerName, emergencyContact, emergencyPhone } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const user = await db.user.create({
      data: {
        clerkId: `manual_${Date.now()}`,
        email, firstName, lastName, phone,
        role: "TENANT",
        tenant: { create: { employerName, emergencyContact, emergencyPhone } },
      },
      include: { tenant: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[TENANTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
