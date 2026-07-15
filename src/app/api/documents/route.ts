import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const documents = await db.document.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(documents);
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { name, url, type, folder, size, entityType, entityId, uploadedBy } = body;
    if (!name || !url) return NextResponse.json({ error: "Name and URL required" }, { status: 400 });
    const document = await db.document.create({
      data: {
        name, url, type: type || "pdf",
        folder: folder || "General",
        size: size ? Number(size) : undefined,
        entityType, entityId,
        uploadedBy: uploadedBy || "System",
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
