"use client";

import { Bell, Search, Plus } from "lucide-react";

interface TopbarProps {
  title: string;
  action?: { label: string; onClick?: () => void };
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-14 min-h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shadow-sm z-10">
      <h1 className="text-base font-bold text-gray-900 flex-1">{title}</h1>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 w-60">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          placeholder="Search properties, tenants…"
          className="bg-transparent outline-none text-[12.5px] text-gray-600 w-full placeholder:text-gray-400"
        />
      </div>

      {/* Notification */}
      <button className="relative w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors">
        <Bell size={15} className="text-gray-600" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
      </button>

      {/* CTA */}
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
          style={{ background: "var(--gold)", color: "var(--navy)" }}>
          <Plus size={14} />
          {action.label}
        </button>
      )}
    </header>
  );
}
