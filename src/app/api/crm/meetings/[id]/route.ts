import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const meeting = await db.crmMeeting.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt) }),
      ...(body.duration !== undefined && { duration: Number(body.duration) }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.meetingUrl !== undefined && { meetingUrl: body.meetingUrl || null }),
      ...(body.brief !== undefined && { brief: body.brief || null }),
      ...(body.outcome !== undefined && { outcome: body.outcome || null }),
      ...(body.attendees !== undefined && { attendees: body.attendees }),
      ...(body.contactId !== undefined && { contactId: body.contactId || null }),
      ...(body.dealId !== undefined && { dealId: body.dealId || null }),
      ...(body.propertyId !== undefined && { propertyId: body.propertyId || null }),
    },
    include: {
      contact: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      property: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(meeting);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.crmMeeting.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
