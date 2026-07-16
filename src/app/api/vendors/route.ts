import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const vendors = await db.vendor.findMany({
      include: { user: true, workOrders: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error("[VENDORS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, email, phone, companyName, specialization, bankName, bankAccount } = body;

    if (!companyName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email }, include: { vendor: true } });
    if (existingUser?.vendor) {
      return NextResponse.json({ error: "Vendor already registered for this email" }, { status: 409 });
    }

    const user = existingUser ?? await db.user.create({
      data: {
        clerkId: `manual_vendor_${Date.now()}`, email,
        firstName: firstName ?? companyName.split(" ")[0],
        lastName: lastName ?? "Vendor",
        phone, role: "VENDOR",
      },
    });

    const vendor = await db.vendor.create({
      data: {
        userId: user.id, companyName,
        specialization: Array.isArray(specialization) ? specialization : [specialization ?? "General"],
        bankName, bankAccount,
      },
      include: { user: true },
    });
    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("[VENDORS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
