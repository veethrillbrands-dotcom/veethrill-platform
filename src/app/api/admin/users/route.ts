import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(UserRole) as string[];
const ADMIN_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN"];

export async function GET(req: NextRequest) {
  void req;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await db.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, clerkId: true, email: true, firstName: true, lastName: true,
      role: true, isActive: true, createdAt: true, avatar: true,
    },
  });

  return NextResponse.json({ users });
}

// Update an existing user's role
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await db.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!caller || !ADMIN_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetClerkId, role } = await req.json();
  if (!targetClerkId || !role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "targetClerkId and valid role required" }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();

    // Update Clerk publicMetadata
    await clerk.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { role },
    });

    // Sync DB
    await db.user.updateMany({
      where: { clerkId: targetClerkId },
      data: { role: role as UserRole },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update role";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
