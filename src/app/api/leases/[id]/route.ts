import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, endDate, rentAmount, autoRenew, escalationRate } = body;

    const lease = await db.lease.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(rentAmount !== undefined && { rentAmount }),
        ...(autoRenew !== undefined && { autoRenew }),
        ...(escalationRate !== undefined && { escalationRate }),
      },
    });
    return NextResponse.json(lease);
  } catch (error) {
    console.error("[LEASE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
