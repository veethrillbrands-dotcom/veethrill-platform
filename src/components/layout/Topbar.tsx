"use client";

import { Bell, Search, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MobileMenuButton } from "./Sidebar";

interface TopbarProps {
  title: string;
  action?: { label: string; onClick?: () => void };
  backHref?: string;
}

export function Topbar({ title, action, backHref }: TopbarProps) {
  return (
    <header className="h-14 min-h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shadow-sm z-10">
      {/* Hamburger — mobile only */}
      {!backHref && <MobileMenuButton />}

      {backHref && (
        <Link href={backHref} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
          <ArrowLeft size={15} className="text-gray-600" />
        </Link>
      )}

      <h1 className="text-sm sm:text-base font-bold text-gray-900 flex-1 truncate">{title}</h1>

      {/* Search — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 w-52 lg:w-60">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          placeholder="Search properties, tenants…"
          className="bg-transparent outline-none text-[12.5px] text-gray-600 w-full placeholder:text-gray-400"
        />
      </div>

      {/* Mobile search icon */}
      <button className="sm:hidden w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors">
        <Search size={15} className="text-gray-600" />
      </button>

      {/* Notification */}
      <button className="relative w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
        <Bell size={15} className="text-gray-600" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
      </button>

      {/* CTA */}
      {action && (
        <button
          onClick={action.onClick}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors flex-shrink-0"
          style={{ background: "var(--gold)", color: "var(--navy)" }}>
          <Plus size={14} />
          {action.label}
        </button>
      )}
    </header>
  );
}
