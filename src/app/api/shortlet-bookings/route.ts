import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const bookings = await db.shortletBooking.findMany({
      include: { unit: { include: { property: true } } },
      orderBy: { checkIn: "desc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { unitId, guestName, guestEmail, guestPhone, checkIn, checkOut, nightlyRate, source, guestCount, specialRequests } = body;

    if (!unitId || !guestName || !guestPhone || !checkIn || !checkOut || !nightlyRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cin = new Date(checkIn);
    const cout = new Date(checkOut);
    const nights = Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * Number(nightlyRate);
    const checkInCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const booking = await db.shortletBooking.create({
      data: {
        unitId, guestName, guestEmail: guestEmail ?? "", guestPhone,
        checkIn: cin, checkOut: cout, nights, nightlyRate: Number(nightlyRate),
        totalAmount, source: source ?? "DIRECT", status: "PENDING",
        guestCount: Number(guestCount ?? 1), specialRequests, checkInCode,
      },
      include: { unit: { include: { property: true } } },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[BOOKINGS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
