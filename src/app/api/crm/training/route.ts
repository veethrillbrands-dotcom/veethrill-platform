import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const programs = await db.crmTrainingProgram.findMany({ orderBy: { startDate: "desc" } });
    return NextResponse.json(programs);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { title, category, trainer, targetRole, startDate, endDate, venue, capacity, description, feePerPerson, billingContact, billingCompany } = body;
    if (!title || !startDate) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    const program = await db.crmTrainingProgram.create({
      data: {
        title, category: category || "Sales", trainer: trainer || "",
        targetRole: targetRole || "All",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        venue, capacity: Number(capacity) || 20, enrolled: 0,
        status: "Upcoming", description,
        feePerPerson: feePerPerson ? Number(feePerPerson) : undefined,
        billingContact: billingContact || undefined,
        billingCompany: billingCompany || undefined,
      },
    });
    return NextResponse.json(program, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
