import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No webhook secret configured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: { type: string; data: Record<string, unknown> };
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "user.created") {
      const data = evt.data as {
        id: string;
        email_addresses: { email_address: string }[];
        first_name: string | null;
        last_name: string | null;
        phone_numbers: { phone_number: string }[];
        image_url: string | null;
        public_metadata: { role?: string };
      };

      const email = data.email_addresses[0]?.email_address;
      if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

      const firstName = data.first_name ?? "User";
      const lastName = data.last_name ?? "";
      const phone = data.phone_numbers?.[0]?.phone_number ?? null;
      const avatar = data.image_url ?? null;

      // Role can be pre-assigned in Clerk publicMetadata (e.g. via admin invite); defaults to TENANT
      const rawRole = ((data.public_metadata?.role as string) ?? "TENANT").toUpperCase();
      const role: UserRole = (Object.values(UserRole) as string[]).includes(rawRole)
        ? (rawRole as UserRole)
        : UserRole.TENANT;

      const user = await db.user.upsert({
        where: { clerkId: data.id },
        update: {},
        create: { clerkId: data.id, email, firstName, lastName, phone, avatar, role },
      });

      // Auto-create role profile records so portal queries work immediately
      if (role === UserRole.TENANT) {
        await db.tenant.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
      }
      if (role === UserRole.OWNER) {
        await db.owner.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
      }
    }

    if (evt.type === "user.updated") {
      const data = evt.data as {
        id: string;
        first_name: string | null;
        last_name: string | null;
        phone_numbers: { phone_number: string }[];
        image_url: string | null;
        public_metadata: { role?: string };
      };

      const rawRole = ((data.public_metadata?.role as string) ?? "").toUpperCase();
      const role = (Object.values(UserRole) as string[]).includes(rawRole) ? (rawRole as UserRole) : undefined;

      await db.user.updateMany({
        where: { clerkId: data.id },
        data: {
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          phone: data.phone_numbers?.[0]?.phone_number ?? null,
          avatar: data.image_url ?? null,
          ...(role ? { role } : {}),
        },
      });
    }

    if (evt.type === "user.deleted") {
      const data = evt.data as { id: string };
      await db.user.updateMany({ where: { clerkId: data.id }, data: { isActive: false } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[CLERK_WEBHOOK]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
