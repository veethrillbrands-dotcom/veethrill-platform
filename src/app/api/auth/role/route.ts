import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const VALID_ROLES = Object.values(UserRole) as string[];

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-middleware-secret");
  if ((process.env.MIDDLEWARE_SECRET ?? "") && secret !== process.env.MIDDLEWARE_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clerkId = req.nextUrl.searchParams.get("clerkId");
  if (!clerkId) return NextResponse.json({ role: "TENANT" });

  try {
    // 1. Try DB first
    const dbUser = await db.user.findUnique({ where: { clerkId }, select: { id: true, role: true } });

    // 2. Get Clerk publicMetadata role (source of truth for admins)
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);
    const clerkRole = ((clerkUser.publicMetadata?.role as string) ?? "").toUpperCase();
    const resolvedClerkRole = VALID_ROLES.includes(clerkRole) ? (clerkRole as UserRole) : null;

    // 3. If Clerk has a different (higher-authority) role, sync it to DB
    if (resolvedClerkRole && dbUser && dbUser.role !== resolvedClerkRole) {
      await db.user.update({ where: { id: dbUser.id }, data: { role: resolvedClerkRole } });
      return NextResponse.json({ role: resolvedClerkRole });
    }

    // 4. If no DB user yet (webhook missed), create one from Clerk data
    if (!dbUser && resolvedClerkRole) {
      const emails = clerkUser.emailAddresses;
      const email = emails[0]?.emailAddress ?? "";
      if (email) {
        await db.user.upsert({
          where: { clerkId },
          update: { role: resolvedClerkRole },
          create: {
            clerkId,
            email,
            firstName: clerkUser.firstName ?? "User",
            lastName: clerkUser.lastName ?? "",
            role: resolvedClerkRole,
          },
        });
      }
      return NextResponse.json({ role: resolvedClerkRole });
    }

    return NextResponse.json({ role: dbUser?.role ?? resolvedClerkRole ?? "TENANT" });
  } catch (e) {
    console.error("[/api/auth/role]", e);
    return NextResponse.json({ role: "TENANT" });
  }
}
