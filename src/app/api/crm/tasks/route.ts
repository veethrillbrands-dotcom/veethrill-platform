import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const assignedToUserId = searchParams.get("assignedToUserId");
  const status = searchParams.get("status");
  const contactId = searchParams.get("contactId");
  const dealId = searchParams.get("dealId");
  const propertyId = searchParams.get("propertyId");

  const tasks = await db.crmTask.findMany({
    where: {
      ...(assignedToUserId ? { assignedToUserId } : {}),
      ...(status ? { status } : {}),
      ...(contactId ? { contactId } : {}),
      ...(dealId ? { dealId } : {}),
      ...(propertyId ? { propertyId } : {}),
    },
    include: {
      contact: { select: { id: true, name: true, type: true } },
      deal: { select: { id: true, title: true, stage: true } },
      property: { select: { id: true, name: true, city: true } },
    },
    orderBy: [{ dueAt: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const body = await req.json();

  const user = userId
    ? await db.user.findUnique({ where: { clerkId: userId }, select: { id: true, firstName: true, lastName: true } })
    : null;

  const task = await db.crmTask.create({
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type ?? "TASK",
      status: "PENDING",
      priority: body.priority ?? "MEDIUM",
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      tags: body.tags ?? [],
      notes: body.notes || null,
      contactId: body.contactId || null,
      dealId: body.dealId || null,
      propertyId: body.propertyId || null,
      createdByUserId: user?.id ?? null,
      assignedToUserId: body.assignedToUserId || user?.id || null,
      assignedToName: body.assignedToName || (user ? `${user.firstName} ${user.lastName}` : null),
    },
    include: {
      contact: { select: { id: true, name: true, type: true } },
      deal: { select: { id: true, title: true, stage: true } },
      property: { select: { id: true, name: true, city: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
