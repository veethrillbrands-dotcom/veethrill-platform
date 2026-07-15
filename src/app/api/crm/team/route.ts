import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const members = await db.crmTeamMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const member = await db.crmTeamMember.create({
    data: {
      name: body.name,
      role: body.role,
      email: body.email,
      phone: body.phone || null,
      target: Number(body.target) || 0,
      achieved: Number(body.achieved) || 0,
      active: body.active !== false,
    },
  });
  return NextResponse.json(member);
}
