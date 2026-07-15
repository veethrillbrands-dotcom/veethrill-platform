import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const bookings = await db.shortletBooking.findMany({
      where: { ...(status && { status: status as any }) },
      include: { unit: { include: { property: true } }, payments: true },
      orderBy: { checkIn: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[SHORTLETS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { unitId, guestName, guestEmail, guestPhone, checkIn, checkOut, nightlyRate, source, guestCount, specialRequests } = body;

    if (!unitId || !guestName || !guestEmail || !checkIn || !checkOut || !nightlyRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);

    if (nights <= 0) return NextResponse.json({ error: "Invalid dates" }, { status: 400 });

    // Check availability
    const conflict = await db.shortletBooking.findFirst({
      where: {
        unitId,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        OR: [
          { checkIn: { lte: checkOutDate }, checkOut: { gte: checkInDate } },
        ],
      },
    });
    if (conflict) return NextResponse.json({ error: "Unit not available for selected dates" }, { status: 409 });

    const booking = await db.shortletBooking.create({
      data: {
        unitId, guestName, guestEmail, guestPhone,
        checkIn: checkInDate, checkOut: checkOutDate,
        nights, nightlyRate,
        totalAmount: nights * nightlyRate,
        source: source || "DIRECT",
        status: "CONFIRMED",
        guestCount: guestCount || 1,
        specialRequests,
        checkInCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
      include: { unit: { include: { property: true } } },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[SHORTLETS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
