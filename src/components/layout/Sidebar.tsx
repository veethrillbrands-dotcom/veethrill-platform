"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, BarChart2, Building2, Home, Users, UserCheck,
  Briefcase, Wrench, FileText, CalendarDays, CreditCard, Cog,
  Search, BookOpen, TrendingUp, FolderOpen, MessageSquare, Sparkles,
  Settings, FileCheck, UserCircle2, GitMerge, CheckSquare, Award, BookMarked,
  X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, BarChart2, Building2, Home, Users, UserCheck,
  Briefcase, Wrench, FileText, CalendarDays, CreditCard, Cog,
  Search, BookOpen, TrendingUp, FolderOpen, MessageSquare, Sparkles,
  FileCheck, UserCircle2, GitMerge, CheckSquare, Award, BookMarked,
};

const NAV = [
  { group: "Overview", items: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart2" },
  ]},
  { group: "CRM", items: [
    { label: "Contacts", href: "/dashboard/crm/contacts", icon: "UserCircle2" },
    { label: "Pipeline", href: "/dashboard/crm/pipeline", icon: "GitMerge" },
    { label: "Team & Agents", href: "/dashboard/crm/team", icon: "Award" },
    { label: "Commissions", href: "/dashboard/crm/commissions", icon: "TrendingUp" },
    { label: "Training", href: "/dashboard/crm/training", icon: "BookMarked" },
    { label: "Inv. Dossiers", href: "/dashboard/crm/dossiers", icon: "FolderOpen" },
    { label: "Market Alerts", href: "/dashboard/crm/subscriptions", icon: "CheckSquare" },
  ]},
  { group: "Portfolio", items: [
    { label: "Properties", href: "/dashboard/properties", icon: "Building2" },
    { label: "Units", href: "/dashboard/units", icon: "Home" },
  ]},
  { group: "People", items: [
    { label: "Tenants", href: "/dashboard/tenants", icon: "Users" },
    { label: "Guests", href: "/dashboard/guests", icon: "UserCheck" },
    { label: "Owners", href: "/dashboard/owners", icon: "Briefcase" },
    { label: "Vendors", href: "/dashboard/vendors", icon: "Wrench" },
  ]},
  { group: "Operations", items: [
    { label: "Leases", href: "/dashboard/leases", icon: "FileText" },
    { label: "Shortlets", href: "/dashboard/shortlets", icon: "CalendarDays" },
    { label: "Rent & Payments", href: "/dashboard/payments", icon: "CreditCard" },
    { label: "Invoices", href: "/dashboard/invoices", icon: "FileCheck" },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: "Cog" },
    { label: "Inspections", href: "/dashboard/inspections", icon: "Search" },
  ]},
  { group: "Finance", items: [
    { label: "Accounting", href: "/dashboard/accounting", icon: "BookOpen" },
    { label: "Reports", href: "/dashboard/reports", icon: "TrendingUp" },
  ]},
  { group: "Tools", items: [
    { label: "Documents", href: "/dashboard/documents", icon: "FolderOpen" },
    { label: "Communications", href: "/dashboard/communications", icon: "MessageSquare" },
    { label: "AI Assistant", href: "/dashboard/ai", icon: "Sparkles" },
  ]},
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="w-full flex flex-col overflow-y-auto h-full" style={{ background: "var(--navy)" }}>
      {/* Brand */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-1.5 flex-shrink-0">
            <Image src="/logo.png" alt="Veethrill" width={56} height={56} className="object-contain" />
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-[11px] leading-tight">Veethrill Realty</div>
            <div className="text-white/40 text-[9.5px] mt-0.5">Property Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.group} className="mb-1">
            <div className="px-4 pt-4 pb-1.5 text-[9.5px] font-bold uppercase tracking-widest text-white/30">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onNav}
                  className={cn(
                    "flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all",
                    active
                      ? "text-[var(--gold)] border-l-2 border-[var(--gold)] bg-[var(--gold)]/10 ml-[5px] pl-[10px]"
                      : "text-white/60 hover:text-white hover:bg-white/7"
                  )}>
                  {Icon && <Icon size={14} className="flex-shrink-0" />}
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 cursor-pointer hover:bg-white/8 transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
            AO
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[11.5px] truncate">Amara Okonkwo</div>
            <div className="text-white/40 text-[10px]">Super Admin</div>
          </div>
          <Settings size={13} className="text-white/30 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[220px] min-w-[220px] flex-col overflow-hidden">
        <SidebarContent />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col shadow-2xl">
            <div className="absolute top-3 right-3 z-10">
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                <X size={16} />
              </button>
            </div>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile hamburger trigger — exposed via MobileMenuButton */}
      <button
        id="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        className="hidden"
        aria-label="Open menu"
      />
    </>
  );
}

export function MobileMenuButton() {
  return (
    <button
      onClick={() => document.getElementById("mobile-menu-btn")?.click()}
      className="lg:hidden w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
      <Menu size={16} className="text-gray-700" />
    </button>
  );
}
