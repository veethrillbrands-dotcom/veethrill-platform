import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/(.*)",
]);

const ADMIN_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "PROPERTY_MANAGER"];

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

  const { userId } = await auth.protect();
  if (!userId) return;

  const pathname = req.nextUrl.pathname;

  // Fetch role directly from DB via internal API to avoid sessionClaims caching issues
  let role = "TENANT";
  try {
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/auth/role?clerkId=${userId}`, {
      headers: { "x-middleware-secret": process.env.MIDDLEWARE_SECRET ?? "" },
    });
    if (res.ok) {
      const data = await res.json();
      role = data.role ?? "TENANT";
    }
  } catch {
    // fallback to TENANT
  }

  const home = ROLE_HOME[role] ?? "/portal/tenant";
  const isAdmin = ADMIN_ROLES.includes(role);

  // Block non-admins from /dashboard
  if (pathname.startsWith("/dashboard") && !isAdmin) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Block portal cross-access
  if (pathname.startsWith("/portal/")) {
    const portalSegment = pathname.split("/")[2];
    const expectedSegment = home.split("/")[2];
    if (portalSegment !== expectedSegment && !isAdmin) {
      return NextResponse.redirect(new URL(home, req.url));
    }
  }

  // Redirect root to right home
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
