import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const properties = await db.property.findMany({
      include: {
        units: { select: { id: true, unitNumber: true, status: true, monthlyRent: true } },
        _count: { select: { units: true, workOrders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = properties.map((p) => ({
      ...p,
      totalUnits: p.units.length,
      occupiedUnits: p.units.filter((u) => u.status === "OCCUPIED").length,
      occupancyRate: p.units.length > 0
        ? Math.round((p.units.filter((u) => u.status === "OCCUPIED").length / p.units.length) * 100)
        : 0,
      monthlyRevenue: p.units
        .filter((u) => u.status === "OCCUPIED")
        .reduce((sum, u) => sum + u.monthlyRent, 0),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[PROPERTIES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, type, address, city, state, country, description, gpsLat, gpsLng } = body;

    if (!name || !type || !address || !city || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const property = await db.property.create({
      data: { name, type, address, city, state, country: country || "Nigeria", description, gpsLat, gpsLng },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("[PROPERTIES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
