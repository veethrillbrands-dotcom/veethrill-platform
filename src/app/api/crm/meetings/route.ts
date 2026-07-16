import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const contactId = searchParams.get("contactId");
  const dealId = searchParams.get("dealId");
  const propertyId = searchParams.get("propertyId");
  const status = searchParams.get("status");

  const meetings = await db.crmMeeting.findMany({
    where: {
      ...(contactId ? { contactId } : {}),
      ...(dealId ? { dealId } : {}),
      ...(propertyId ? { propertyId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      contact: { select: { id: true, name: true, type: true } },
      deal: { select: { id: true, title: true, stage: true } },
      property: { select: { id: true, name: true, city: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const body = await req.json();

  const user = userId
    ? await db.user.findUnique({ where: { clerkId: userId }, select: { id: true, firstName: true, lastName: true } })
    : null;

  const meeting = await db.crmMeeting.create({
    data: {
      title: body.title,
      type: body.type ?? "PHYSICAL",
      status: "SCHEDULED",
      scheduledAt: new Date(body.scheduledAt),
      duration: Number(body.duration) || 60,
      location: body.location || null,
      meetingUrl: body.meetingUrl || null,
      brief: body.brief || null,
      attendees: body.attendees ?? [],
      contactId: body.contactId || null,
      dealId: body.dealId || null,
      propertyId: body.propertyId || null,
      createdByUserId: user?.id ?? null,
    },
    include: {
      contact: { select: { id: true, name: true, type: true } },
      deal: { select: { id: true, title: true, stage: true } },
      property: { select: { id: true, name: true, city: true } },
    },
  });
  return NextResponse.json(meeting, { status: 201 });
}
