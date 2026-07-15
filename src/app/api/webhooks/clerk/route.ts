import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Clerk webhook — auto-creates user in DB when someone signs up
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address;

      if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

      await db.user.upsert({
        where: { clerkId: id },
        update: { email, firstName: first_name || "", lastName: last_name || "", avatar: image_url },
        create: {
          clerkId: id,
          email,
          firstName: first_name || "",
          lastName: last_name || "",
          avatar: image_url,
          role: "TENANT",
        },
      });
    }

    if (type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address;

      await db.user.update({
        where: { clerkId: id },
        data: { email, firstName: first_name || "", lastName: last_name || "", avatar: image_url },
      });
    }

    if (type === "user.deleted") {
      await db.user.updateMany({
        where: { clerkId: data.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLERK_WEBHOOK]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
