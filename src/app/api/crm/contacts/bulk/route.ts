import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { rows } = await req.json() as { rows: Record<string, string>[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const results: { row: number; status: "created" | "skipped" | "error"; name: string; reason?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.name?.trim();
    if (!name) {
      results.push({ row: i + 1, status: "skipped", name: row.name ?? "", reason: "Name is required" });
      continue;
    }
    try {
      await db.crmContact.create({
        data: {
          name,
          type: row.type?.trim() || "Prospect",
          email: row.email?.trim() || null,
          phone: row.phone?.trim() || null,
          company: row.company?.trim() || null,
          location: row.location?.trim() || null,
          source: row.source?.trim() || null,
          notes: row.notes?.trim() || null,
          createdByUserId: user.id,
        },
      });
      results.push({ row: i + 1, status: "created", name });
    } catch (e) {
      results.push({ row: i + 1, status: "error", name, reason: e instanceof Error ? e.message : "DB error" });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const errors = results.filter((r) => r.status === "error" || r.status === "skipped").length;
  return NextResponse.json({ created, errors, results });
}
