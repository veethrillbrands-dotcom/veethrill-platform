import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const booking = await db.shortletBooking.findUnique({
      where: { id },
      include: { unit: { include: { property: true } }, payments: true },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { status, guestName, guestEmail, guestPhone, guestCount, specialRequests, checkIn, checkOut, nightlyRate } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (guestName) updateData.guestName = guestName;
    if (guestEmail !== undefined) updateData.guestEmail = guestEmail;
    if (guestPhone) updateData.guestPhone = guestPhone;
    if (guestCount !== undefined) updateData.guestCount = Number(guestCount);
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;

    if (checkIn && checkOut && nightlyRate) {
      const cin = new Date(checkIn);
      const cout = new Date(checkOut);
      const nights = Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)));
      updateData.checkIn = cin;
      updateData.checkOut = cout;
      updateData.nights = nights;
      updateData.nightlyRate = Number(nightlyRate);
      updateData.totalAmount = nights * Number(nightlyRate);
    }

    const booking = await db.shortletBooking.update({ where: { id }, data: updateData });
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.shortletBooking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[BOOKING_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
