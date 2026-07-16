"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Portal Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-100">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <div className="text-[16px] font-bold text-gray-800 mb-2">Something went wrong</div>
      <div className="text-[13px] text-gray-500 max-w-sm mb-6">
        {error.message || "An unexpected error occurred loading this page."}
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
        style={{ background: "var(--navy)" }}
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}
