import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const owners = await db.owner.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(owners);
  } catch (error) {
    console.error("[OWNERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, email, phone, bankName, bankAccountNumber, bankAccountName } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email }, include: { owner: true } });
    if (existingUser?.owner) {
      return NextResponse.json({ error: "Owner already exists for this email" }, { status: 409 });
    }

    const user = existingUser ?? await db.user.create({
      data: { clerkId: `manual_${Date.now()}`, email, firstName, lastName, phone, role: "OWNER" },
    });

    const owner = await db.owner.create({
      data: { userId: user.id, bankName, bankAccountNumber, bankAccountName },
      include: { user: true },
    });
    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error("[OWNERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
