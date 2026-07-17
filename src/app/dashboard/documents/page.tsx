"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Topbar } from "@/components/layout/Topbar";
import { FolderOpen, FileText, Upload, Search, Download, Trash2, File, X, CheckSquare } from "lucide-react";

const FOLDERS = [
  { name: "Lease Agreements", icon: "📄" },
  { name: "KYC Documents", icon: "🪪" },
  { name: "Property Photos", icon: "📷" },
  { name: "Maintenance Reports", icon: "🔧" },
  { name: "Financial Statements", icon: "📊" },
  { name: "Legal & Compliance", icon: "⚖️" },
  { name: "Inspection Reports", icon: "🔍" },
  { name: "Insurance Policies", icon: "🛡️" },
  { name: "General", icon: "📁" },
];

type Doc = { id: string; name: string; url: string; type: string; folder: string; size: number | null; uploadedBy: string; createdAt: string };

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  image: <File size={16} className="text-blue-500" />,
  doc: <File size={16} className="text-blue-700" />,
  xls: <File size={16} className="text-emerald-600" />,
};

function fmtSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  return "file";
}

function UploadModal({ onClose, onUploaded, uploaderName }: { onClose: () => void; onUploaded: () => void; uploaderName: string }) {
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number; type: string; file: File }[]>([]);
  const [folder, setFolder] = useState("General");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...[...fileList].map((f) => ({ name: f.name, size: f.size, type: getFileType(f.name), file: f }))]);
  }

  async function upload() {
    if (!files.length) return;
    setSaving(true);
    setUploadError("");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      await Promise.all(files.map(async (f) => {
        let fileUrl = "";

        if (cloudName && uploadPreset) {
          const fd = new FormData();
          fd.append("file", f.file);
          fd.append("upload_preset", uploadPreset);
          fd.append("folder", "veethrill-docs");
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: "POST", body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            fileUrl = data.secure_url ?? "";
          } else {
            throw new Error("Cloudinary upload failed");
          }
        } else {
          throw new Error("File storage not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.");
        }

        return fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: f.name, url: fileUrl, type: f.type, folder, size: f.size, uploadedBy: uploaderName }),
        });
      }));
      onUploaded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed — please try again.";
      setUploadError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="flex items-center gap-3"><Upload size={18} className="text-yellow-400" /><div className="text-[15px] font-bold text-white">Upload Documents</div></div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${dragging ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-yellow-300 hover:bg-gray-50"}`}>
            <Upload size={24} className={dragging ? "text-yellow-500" : "text-gray-400"} />
            <div className="text-[13px] font-bold text-gray-700">Drop files or click to browse</div>
            <div className="text-[11.5px] text-gray-400">PDF, JPG, PNG, DOCX, XLSX — up to 50MB each</div>
          </div>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />

          {files.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                  {TYPE_ICON[f.type] ?? <File size={14} className="text-gray-400" />}
                  <span className="text-[12.5px] text-gray-800 flex-1 truncate">{f.name}</span>
                  <span className="text-[11px] text-gray-400">{fmtSize(f.size)}</span>
                  <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-400"><X size={13} /></button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Folder</label>
            <select value={folder} onChange={(e) => setFolder(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {FOLDERS.map((f) => <option key={f.name} value={f.name}>{f.icon} {f.name}</option>)}
            </select>
          </div>

          {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-[12px] text-yellow-800">
              <strong>File storage not configured.</strong> Add <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to your Netlify environment variables to enable real uploads.
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12.5px] text-red-700 font-semibold">
              {uploadError}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={upload} disabled={saving || !files.length}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--navy)" }}>
            {saving ? "Uploading…" : `↑ Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { user } = useUser();
  const uploaderName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function del(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} documents?`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/documents/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAll() {
    setSelected(filtered.length > 0 && filtered.every((d) => selected.has(d.id)) ? new Set() : new Set(filtered.map((d) => d.id)));
  }

  const filtered = docs.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchFolder = !activeFolder || d.folder === activeFolder;
    return matchSearch && matchFolder;
  });

  const allChecked = filtered.length > 0 && filtered.every((d) => selected.has(d.id));

  const folderCounts = FOLDERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.name] = docs.filter((d) => d.folder === f.name).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Documents" action={{ label: "Upload File", onClick: () => setUploading(true) }} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Files", value: docs.length, color: "var(--navy)" },
            { label: "Folders", value: FOLDERS.length, color: "var(--gold)" },
            { label: "PDF Files", value: docs.filter((d) => d.type === "pdf").length, color: "#EF4444" },
            { label: "Images", value: docs.filter((d) => d.type === "image").length, color: "#3B82F6" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[22px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setUploading(true); }}
          className="border-2 border-dashed rounded-2xl p-6 flex items-center gap-4 cursor-pointer border-gray-200 hover:border-yellow-300 hover:bg-gray-50 transition-colors"
          onClick={() => setUploading(true)}>
          <Upload size={24} className="text-gray-400 flex-shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-gray-800">Drop files here or click to upload</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">PDF, JPG, PNG, DOCX, XLSX — up to 50MB each</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Folders</div>
              <button onClick={() => setActiveFolder(null)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold mb-1 transition-colors ${!activeFolder ? "bg-yellow-50 text-yellow-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <FolderOpen size={14} /> All Files <span className="ml-auto text-[10px] text-gray-400">{docs.length}</span>
              </button>
              {FOLDERS.map((f) => (
                <button key={f.name} onClick={() => setActiveFolder(f.name === activeFolder ? null : f.name)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-colors ${activeFolder === f.name ? "bg-yellow-50 text-yellow-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span>{f.icon}</span>
                  <span className="flex-1 text-left truncate">{f.name}</span>
                  <span className="text-[10px] text-gray-400">{folderCounts[f.name] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="col-span-3 space-y-3">
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…"
                className="flex-1 text-[13px] outline-none text-gray-700 placeholder-gray-400" />
              {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <CheckSquare size={14} className="text-red-600" />
                <span className="text-[13px] font-semibold text-red-700">{selected.size} selected</span>
                <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={12} />Delete Selected
                </button>
                <button onClick={() => setSelected(new Set())} className="text-[12px] text-red-500 hover:text-red-700">Clear</button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pl-5 pr-2 py-3 w-8">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                    </th>
                    {["File", "Folder", "Size", "Uploaded", "By", ""].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-12 text-[13px]">Loading documents…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-12 text-[13px]">{docs.length === 0 ? "No documents yet — upload your first file." : "No files match your search."}</td></tr>
                  ) : filtered.map((d) => (
                    <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-50/50 group transition-colors ${selected.has(d.id) ? "bg-blue-50/40" : ""}`}>
                      <td className="pl-5 pr-2 py-3">
                        <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} className="w-3.5 h-3.5 rounded accent-yellow-500" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {TYPE_ICON[d.type] ?? <File size={16} className="text-gray-400" />}
                          <span className="text-[12.5px] font-semibold text-gray-900 max-w-[240px] truncate">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">{d.folder}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{fmtSize(d.size)}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{d.uploadedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={d.url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                            <Download size={13} />
                          </a>
                          <button onClick={() => del(d.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
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
      {uploading && <UploadModal onClose={() => setUploading(false)} onUploaded={load} uploaderName={uploaderName} />}
    </div>
  );
}
