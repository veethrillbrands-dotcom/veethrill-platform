import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const workOrders = await db.workOrder.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        property: true,
        unit: true,
        vendor: { include: { user: true } },
      },
      orderBy: [{ priority: "asc" }, { raisedAt: "desc" }],
    });

    return NextResponse.json(workOrders);
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      propertyId, unitId, title, description, category, priority, estimatedCost, slaHours,
      vendorId, outsourcedVendorName, outsourcedVendorPhone, status,
    } = body;

    if (!propertyId || !title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const outsourcedNote = outsourcedVendorName
      ? `[EXT_VENDOR:${outsourcedVendorName}${outsourcedVendorPhone ? `|${outsourcedVendorPhone}` : ""}]`
      : undefined;

    const workOrder = await db.workOrder.create({
      data: {
        propertyId, unitId,
        title, description, category,
        priority: priority || "MEDIUM",
        estimatedCost,
        slaHours: slaHours || 24,
        status: status || "OPEN",
        ...(vendorId && { vendorId, assignedAt: new Date() }),
        ...(outsourcedNote && { completionNotes: outsourcedNote }),
      },
      include: { property: true, unit: true, vendor: { include: { user: true } } },
    });

    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error("[MAINTENANCE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
