"use client";

import { Bell } from "lucide-react";
import { PortalMobileMenuButton } from "./PortalSidebar";

export function PortalTopbar({ title }: { title: string }) {
  return (
    <header className="h-14 min-h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shadow-sm z-10">
      <PortalMobileMenuButton />
      <h1 className="text-sm sm:text-base font-bold text-gray-900 flex-1 truncate">{title}</h1>
      <button className="relative w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
        <Bell size={15} className="text-gray-600" />
      </button>
    </header>
  );
}
