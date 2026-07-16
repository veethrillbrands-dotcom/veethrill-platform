"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, CreditCard, Wrench, FileText, Star, X, Menu, LogOut, User } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ElementType };

const NAV_BY_PORTAL: Record<string, NavItem[]> = {
  tenant: [
    { label: "My Home", href: "/portal/tenant", icon: Home },
    { label: "My Lease", href: "/portal/tenant/lease", icon: FileText },
    { label: "Payments", href: "/portal/tenant/payments", icon: CreditCard },
    { label: "Maintenance", href: "/portal/tenant/maintenance", icon: Wrench },
    { label: "Invoices", href: "/portal/tenant/invoices", icon: FileText },
  ],
  owner: [
    { label: "Overview", href: "/portal/owner", icon: Home },
    { label: "My Properties", href: "/portal/owner/properties", icon: Home },
    { label: "Revenue", href: "/portal/owner/revenue", icon: CreditCard },
    { label: "Invoices", href: "/portal/owner/invoices", icon: FileText },
  ],
  agent: [
    { label: "Overview", href: "/portal/agent", icon: Home },
    { label: "My Contacts", href: "/portal/agent/contacts", icon: User },
    { label: "Pipeline", href: "/portal/agent/pipeline", icon: FileText },
    { label: "Commissions", href: "/portal/agent/commissions", icon: CreditCard },
    { label: "Training", href: "/portal/agent/training", icon: Star },
  ],
  vendor: [
    { label: "Overview", href: "/portal/vendor", icon: Home },
    { label: "Work Orders", href: "/portal/vendor/work-orders", icon: Wrench },
    { label: "Invoices", href: "/portal/vendor/invoices", icon: FileText },
  ],
  guest: [
    { label: "My Booking", href: "/portal/guest", icon: Home },
    { label: "Invoices", href: "/portal/guest/invoices", icon: FileText },
  ],
  staff: [
    { label: "Overview", href: "/portal/staff", icon: Home },
    { label: "My Contacts", href: "/portal/staff/contacts", icon: User },
    { label: "Properties", href: "/portal/staff/properties", icon: Home },
    { label: "Tenants", href: "/portal/staff/tenants", icon: User },
    { label: "Agents / Team", href: "/portal/staff/agents", icon: Star },
    { label: "Work Orders", href: "/portal/staff/work-orders", icon: Wrench },
    { label: "Inspections", href: "/portal/staff/inspections", icon: Star },
    { label: "Invoices", href: "/portal/staff/invoices", icon: FileText },
  ],
};

const PORTAL_LABEL: Record<string, string> = {
  tenant: "Tenant Portal", owner: "Owner Portal", agent: "Agent Portal",
  vendor: "Vendor Portal", guest: "Guest Portal", staff: "Staff Portal",
};

export function PortalSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const segment = pathname.split("/")[2] ?? "tenant";
  const navItems = NAV_BY_PORTAL[segment] ?? [];
  const portalLabel = PORTAL_LABEL[segment] ?? "Portal";

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => href === `/portal/${segment}` ? pathname === href : pathname.startsWith(href);

  function SidebarContent() {
    return (
      <aside className="w-full h-full flex flex-col" style={{ background: "var(--navy)" }}>
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-1">
              <Image src="/logo.png" alt="Veethrill" width={48} height={48} className="object-contain" />
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-[11px]">Veethrill Realty</div>
              <div className="text-[var(--gold)] text-[10px] font-semibold mt-0.5">{portalLabel}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mb-1",
                  active
                    ? "text-[var(--gold)] bg-[var(--gold)]/10 border-l-2 border-[var(--gold)]"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                )}>
                <Icon size={15} className="flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 bg-[var(--gold)] text-[var(--navy)]">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-[11.5px] truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-white/40 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </div>
          <button onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-white/50 hover:text-white hover:bg-white/8 transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex w-[220px] min-w-[220px] flex-col overflow-hidden">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X size={16} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile trigger */}
      <button id="portal-menu-btn" onClick={() => setMobileOpen(true)} className="hidden" />
    </>
  );
}

export function PortalMobileMenuButton() {
  return (
    <button onClick={() => document.getElementById("portal-menu-btn")?.click()}
      className="lg:hidden w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
      <Menu size={16} className="text-gray-700" />
    </button>
  );
}
