import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activities = await db.crmContactActivity.findMany({
    where: { contactId: id },
    orderBy: { activityAt: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const body = await req.json();

  const user = userId ? await db.user.findUnique({ where: { clerkId: userId }, select: { id: true, firstName: true, lastName: true } }) : null;

  const activity = await db.crmContactActivity.create({
    data: {
      contactId: id,
      loggedByUserId: user?.id,
      loggedByName: user ? `${user.firstName} ${user.lastName}` : body.loggedByName ?? "Staff",
      type: body.type,
      subject: body.subject || null,
      body: body.body,
      outcome: body.outcome || null,
      duration: body.duration ? Number(body.duration) : null,
      attachments: body.attachments ?? [],
      activityAt: body.activityAt ? new Date(body.activityAt) : new Date(),
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
