import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_STAGES = [
  { name: "Lead / Enquiry",      order: 1, color: "#94A3B8", probability: 10 },
  { name: "Viewing Scheduled",   order: 2, color: "#3B82F6", probability: 25 },
  { name: "Site Inspection",     order: 3, color: "#8B5CF6", probability: 35 },
  { name: "Proposal Sent",       order: 4, color: "#F59E0B", probability: 50 },
  { name: "Negotiation",         order: 5, color: "#F97316", probability: 65 },
  { name: "Agreement Signing",   order: 6, color: "#10B981", probability: 80 },
  { name: "Due Diligence",       order: 7, color: "#06B6D4", probability: 90 },
  { name: "Closed Won",          order: 8, color: "#22C55E", probability: 100, isWon: true },
  { name: "Closed Lost",         order: 9, color: "#EF4444", probability: 0,   isLost: true },
];

export async function GET() {
  const pipelines = await db.crmPipeline.findMany({
    include: {
      stages: { orderBy: { order: "asc" } },
      _count: { select: { deals: true } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  // Auto-create default pipeline if none exist
  if (pipelines.length === 0) {
    const created = await db.crmPipeline.create({
      data: {
        name: "Real Estate Sales",
        description: "Default pipeline for property sales and lettings",
        isDefault: true,
        color: "#1e3a5f",
        stages: { create: DEFAULT_STAGES },
      },
      include: {
        stages: { orderBy: { order: "asc" } },
        _count: { select: { deals: true } },
      },
    });
    return NextResponse.json([created]);
  }

  return NextResponse.json(pipelines);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, color, stages } = body;

  const pipeline = await db.crmPipeline.create({
    data: {
      name,
      description: description || null,
      color: color || "#1e3a5f",
      stages: {
        create: (stages && stages.length > 0 ? stages : DEFAULT_STAGES).map(
          (s: { name: string; order: number; color?: string; probability?: number; isWon?: boolean; isLost?: boolean }) => ({
            name: s.name,
            order: s.order,
            color: s.color ?? "#6B7280",
            probability: s.probability ?? 30,
            isWon: s.isWon ?? false,
            isLost: s.isLost ?? false,
          })
        ),
      },
    },
    include: { stages: { orderBy: { order: "asc" } }, _count: { select: { deals: true } } },
  });

  return NextResponse.json(pipeline, { status: 201 });
}
