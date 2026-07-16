import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(UserRole) as string[];
const ADMIN_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN"];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can invite
  const caller = await db.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, role } = await req.json();

  if (!email || !role) {
    return NextResponse.json({ error: "email and role are required" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role },
      ...(appUrl ? { redirectUrl: `${appUrl}/sign-up` } : {}),
      ignoreExisting: false,
    });

    return NextResponse.json({ ok: true, invitationId: invitation.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send invitation";
    console.error("[INVITE]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
