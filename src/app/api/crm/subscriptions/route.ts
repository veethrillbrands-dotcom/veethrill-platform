import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const subs = await db.crmSubscription.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(subs);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { subscriber, email, phone, type, interests, budget, preferredLocations, frequency } = body;
    if (!subscriber || !email) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    const sub = await db.crmSubscription.create({
      data: {
        subscriber, email, phone, type: type || "Prospect",
        interests: interests || [], budget, preferredLocations,
        frequency: frequency || "Weekly", status: "Active",
      },
    });
    return NextResponse.json(sub, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
