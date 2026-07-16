import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-middleware-secret");
  if (secret !== (process.env.MIDDLEWARE_SECRET ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkId = req.nextUrl.searchParams.get("clerkId");
  if (!clerkId) return NextResponse.json({ role: "TENANT" });

  const user = await db.user.findUnique({ where: { clerkId }, select: { role: true } });
  return NextResponse.json({ role: user?.role ?? "TENANT" });
}
