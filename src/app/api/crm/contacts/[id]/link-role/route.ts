import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { linkedRole } = await req.json();

  const contact = await db.crmContact.findUnique({ where: { id } });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find existing User by email
  let linkedUserId: string | null = null;
  if (contact.email) {
    const existingUser = await db.user.findUnique({ where: { email: contact.email } });
    if (existingUser) linkedUserId = existingUser.id;
  }

  const updated = await db.crmContact.update({
    where: { id },
    data: { linkedRole: linkedRole || null, linkedUserId },
  });

  return NextResponse.json(updated);
}
