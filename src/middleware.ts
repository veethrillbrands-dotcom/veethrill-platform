import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const ADMIN_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "PROPERTY_MANAGER"];

// Maps each role to its home portal path
const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/dashboard",
  COMPANY_ADMIN: "/dashboard",
  PROPERTY_MANAGER: "/dashboard",
  TENANT: "/portal/tenant",
  OWNER: "/portal/owner",
  GUEST: "/portal/guest",
  VENDOR: "/portal/vendor",
  AGENT: "/portal/agent",
  MAINTENANCE_STAFF: "/portal/staff",
};

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth.protect();
  if (!userId) return;

  const pathname = req.nextUrl.pathname;

  // Role is stored in Clerk publicMetadata and synced via webhook
  const role = ((sessionClaims?.publicMetadata as Record<string, unknown>)?.role as string | undefined)
    ?? "TENANT";

  const home = ROLE_HOME[role] ?? "/portal/tenant";
  const isAdmin = ADMIN_ROLES.includes(role);

  // Block non-admins from /dashboard
  if (pathname.startsWith("/dashboard") && !isAdmin) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Block portal cross-access (e.g. tenant hitting /portal/vendor)
  if (pathname.startsWith("/portal/")) {
    const portalSegment = pathname.split("/")[2]; // "tenant", "owner", etc.
    const expectedSegment = home.split("/")[2];
    if (portalSegment !== expectedSegment && !isAdmin) {
      return NextResponse.redirect(new URL(home, req.url));
    }
  }

  // Redirect root to the right home
  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL(home, req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
