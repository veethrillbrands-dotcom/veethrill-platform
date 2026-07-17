import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const dossiers = await db.crmDossier.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(dossiers);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { title, type, location, totalUnits, priceFrom, priceTo, developer, completionDate, yieldEstimate, targetInvestor, highlights, requesterName, amountPaid, status } = body;
    if (!title || !location) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    const dossier = await db.crmDossier.create({
      data: {
        title, type: type || "Residential", location,
        totalUnits: Number(totalUnits) || 0,
        priceFrom: Number(priceFrom) || 0, priceTo: Number(priceTo) || 0,
        developer: developer || "", completionDate,
        yieldEstimate: Number(yieldEstimate) || 0,
        targetInvestor, highlights,
        requesterName: requesterName || undefined,
        amountPaid: amountPaid ? Number(amountPaid) : undefined,
        status: status || "Active",
      },
    });
    return NextResponse.json(dossier, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
