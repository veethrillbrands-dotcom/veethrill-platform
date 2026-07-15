"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { FolderOpen, FileText, Upload, Search, Download, Eye, MoreHorizontal, File, Image, Shield } from "lucide-react";

const FOLDERS = [
  { name: "Lease Agreements", count: 5, icon: "📄", color: "bg-blue-50 text-blue-600" },
  { name: "KYC Documents", count: 12, icon: "🪪", color: "bg-purple-50 text-purple-600" },
  { name: "Property Photos", count: 48, icon: "📷", color: "bg-yellow-50 text-yellow-600" },
  { name: "Maintenance Reports", count: 18, icon: "🔧", color: "bg-red-50 text-red-600" },
  { name: "Financial Statements", count: 24, icon: "📊", color: "bg-emerald-50 text-emerald-600" },
  { name: "Legal & Compliance", count: 9, icon: "⚖️", color: "bg-gray-50 text-gray-600" },
  { name: "Inspection Reports", count: 14, icon: "🔍", color: "bg-orange-50 text-orange-600" },
  { name: "Insurance Policies", count: 7, icon: "🛡️", color: "bg-teal-50 text-teal-600" },
];

const FILES = [
  { name: "Chidi Okafor — Lease Agreement Unit 7C.pdf", size: "2.4 MB", type: "pdf", folder: "Lease Agreements", uploaded: "Jul 1, 2026", by: "Amara Okonkwo" },
  { name: "Ngozi Adeyemi — National ID.jpg", size: "1.1 MB", type: "image", folder: "KYC Documents", uploaded: "Sep 1, 2025", by: "System" },
  { name: "Veethrill Towers — Front Exterior.jpg", size: "4.8 MB", type: "image", folder: "Property Photos", uploaded: "Jun 15, 2026", by: "Amara Okonkwo" },
  { name: "Q2 2026 Financial Statement.pdf", size: "890 KB", type: "pdf", folder: "Financial Statements", uploaded: "Jul 5, 2026", by: "Amara Okonkwo" },
  { name: "AC Failure Unit 4B — Work Order Report.pdf", size: "340 KB", type: "pdf", folder: "Maintenance Reports", uploaded: "Jul 14, 2026", by: "System" },
  { name: "Emeka Bello — Lease Agreement Unit 5B.pdf", size: "2.1 MB", type: "pdf", folder: "Lease Agreements", uploaded: "Jan 1, 2026", by: "Amara Okonkwo" },
  { name: "Lekki Gardens — Property Insurance Policy.pdf", size: "1.6 MB", type: "pdf", folder: "Insurance Policies", uploaded: "Jan 1, 2026", by: "Amara Okonkwo" },
  { name: "July 2026 Inspection — Ikoyi Residences.pdf", size: "3.2 MB", type: "pdf", folder: "Inspection Reports", uploaded: "Jul 12, 2026", by: "System" },
  { name: "Lagos Tenancy Law Compliance Checklist.pdf", size: "520 KB", type: "pdf", folder: "Legal & Compliance", uploaded: "Jan 1, 2026", by: "Amara Okonkwo" },
  { name: "Tunde Fashola — Lease Agreement PH1.pdf", size: "2.3 MB", type: "pdf", folder: "Lease Agreements", uploaded: "Dec 1, 2025", by: "Amara Okonkwo" },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  image: <Image size={16} className="text-blue-500" />,
  doc: <File size={16} className="text-blue-700" />,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const filtered = FILES.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = !activeFolder || f.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Documents" action={{ label: "Upload File" }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Files", value: FILES.length + 127, icon: <FolderOpen size={16} />, color: "var(--navy)" },
            { label: "Total Size", value: "1.2 GB", icon: <File size={16} />, color: "var(--gold)" },
            { label: "Folders", value: FOLDERS.length, icon: <Shield size={16} />, color: "var(--emerald)" },
            { label: "Shared Files", value: 23, icon: <Eye size={16} />, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); }}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer ${dragging ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-yellow-300 hover:bg-gray-50"}`}>
          <Upload size={28} className={dragging ? "text-yellow-500" : "text-gray-400"} />
          <div className="text-center">
            <div className="text-[13px] font-bold text-gray-800">Drop files here or click to upload</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">PDF, JPG, PNG, DOCX up to 50MB</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {/* Folder Tree */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Folders</div>
              <button onClick={() => setActiveFolder(null)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold mb-1 transition-colors ${!activeFolder ? "bg-yellow-50 text-yellow-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <FolderOpen size={14} /> All Files <span className="ml-auto text-[10px] text-gray-400">{FILES.length + 127}</span>
              </button>
              {FOLDERS.map((f) => (
                <button key={f.name} onClick={() => setActiveFolder(f.name === activeFolder ? null : f.name)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-colors ${activeFolder === f.name ? "bg-yellow-50 text-yellow-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span>{f.icon}</span>
                  <span className="flex-1 text-left truncate">{f.name}</span>
                  <span className="text-[10px] text-gray-400">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Grid */}
          <div className="col-span-3 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
              <Search size={14} className="text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents…"
                className="flex-1 text-[13px] outline-none text-gray-700 placeholder-gray-400" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["File", "Folder", "Size", "Uploaded", "By", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3 first:pl-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-10 text-[13px]">No files found.</td></tr>
                  ) : filtered.map((f, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <div className="flex items-center gap-2.5">
                          {TYPE_ICON[f.type] ?? <File size={16} className="text-gray-400" />}
                          <span className="text-[12.5px] font-semibold text-gray-900 max-w-[240px] truncate">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{f.folder}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{f.size}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{f.uploaded}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{f.by}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Eye size={13} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Download size={13} /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700"><MoreHorizontal size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
