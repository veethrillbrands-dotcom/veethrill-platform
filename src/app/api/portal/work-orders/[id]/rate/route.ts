import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rating, review } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const order = await db.workOrder.findUnique({ where: { id } });
  if (!order || order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Can only rate completed work orders" }, { status: 400 });
  }

  const updated = await db.workOrder.update({
    where: { id },
    data: { rating: Number(rating), review: review ?? null },
  });

  return NextResponse.json(updated);
}
