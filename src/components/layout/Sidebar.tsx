"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart2, Building2, Home, Users, UserCheck,
  Briefcase, Wrench, FileText, CalendarDays, CreditCard, Cog,
  Search, BookOpen, TrendingUp, FolderOpen, MessageSquare, Sparkles,
  Settings, LogOut, ChevronDown,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, BarChart2, Building2, Home, Users, UserCheck,
  Briefcase, Wrench, FileText, CalendarDays, CreditCard, Cog,
  Search, BookOpen, TrendingUp, FolderOpen, MessageSquare, Sparkles,
};

const NAV = [
  { group: "Overview", items: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart2" },
  ]},
  { group: "Portfolio", items: [
    { label: "Properties", href: "/dashboard/properties", icon: "Building2", badge: "47" },
    { label: "Units", href: "/dashboard/units", icon: "Home" },
  ]},
  { group: "People", items: [
    { label: "Tenants", href: "/dashboard/tenants", icon: "Users", badge: "312" },
    { label: "Guests", href: "/dashboard/guests", icon: "UserCheck" },
    { label: "Owners", href: "/dashboard/owners", icon: "Briefcase" },
    { label: "Vendors", href: "/dashboard/vendors", icon: "Wrench" },
  ]},
  { group: "Operations", items: [
    { label: "Leases", href: "/dashboard/leases", icon: "FileText" },
    { label: "Shortlets", href: "/dashboard/shortlets", icon: "CalendarDays" },
    { label: "Rent & Payments", href: "/dashboard/payments", icon: "CreditCard", badge: "12" },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: "Cog", badge: "8" },
    { label: "Inspections", href: "/dashboard/inspections", icon: "Search" },
  ]},
  { group: "Finance", items: [
    { label: "Accounting", href: "/dashboard/accounting", icon: "BookOpen" },
    { label: "Reports", href: "/dashboard/reports", icon: "TrendingUp" },
  ]},
  { group: "Tools", items: [
    { label: "Documents", href: "/dashboard/documents", icon: "FolderOpen" },
    { label: "Communications", href: "/dashboard/communications", icon: "MessageSquare", badge: "3" },
    { label: "AI Assistant", href: "/dashboard/ai", icon: "Sparkles" },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] min-w-[220px] flex flex-col overflow-y-auto" style={{ background: "var(--navy)" }}>
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--gold) 0%, #b8960a 100%)", color: "var(--navy)" }}>
            V
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-[11.5px] leading-tight">Veethrill Realty</div>
            <div className="text-white/40 text-[10px] mt-0.5">Property Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {NAV.map((section) => (
          <div key={section.group} className="mb-1">
            <div className="px-4 pt-4 pb-1.5 text-[9.5px] font-bold uppercase tracking-widest text-white/30">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all",
                    active
                      ? "text-[var(--gold)] border-l-2 border-[var(--gold)] bg-[var(--gold)]/10 ml-[5px] pl-[10px]"
                      : "text-white/60 hover:text-white hover:bg-white/7"
                  )}>
                  {Icon && <Icon size={14} className="flex-shrink-0" />}
                  <span className="flex-1 truncate">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="text-[9px] font-bold bg-[var(--emerald)] text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
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
