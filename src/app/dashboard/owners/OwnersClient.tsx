"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { X, CheckCircle, Pencil, Trash2, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Owner = {
  id: string; bankName: string | null; bankAccountNumber: string | null; bankAccountName: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
};

function AddOwnerModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", bankName: "", bankAccountNumber: "", bankAccountName: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    const res = await fetch("/api/owners", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); router.refresh(); }, 1200); }
    else setSaving(false);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <CheckCircle size={32} className="text-emerald-600" />
        <div className="text-[17px] font-bold text-gray-900">Owner Added!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Add Property Owner</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" }].map(({ label, key }) => (
              <div key={key}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
                <input value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
              </div>
            ))}
          </div>
          {[
            { label: "Email Address", key: "email", type: "email" },
            { label: "Phone", key: "phone", type: "tel" },
            { label: "Bank Name", key: "bankName" },
            { label: "Account Number", key: "bankAccountNumber" },
            { label: "Account Name", key: "bankAccountName" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input type={type ?? "text"} value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.firstName || !form.email}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Adding…" : "✓ Add Owner"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatementModal({ owner, onClose }: { owner: Owner; onClose: () => void }) {
  const name = `${owner.user.firstName} ${owner.user.lastName}`;
  const mockData = [
    { month: "Jul 2026", gross: 1460000, fee: 87600, net: 1372400, status: "PENDING" },
    { month: "Jun 2026", gross: 1460000, fee: 87600, net: 1372400, status: "PAID" },
    { month: "May 2026", gross: 1210000, fee: 72600, net: 1137400, status: "PAID" },
    { month: "Apr 2026", gross: 1460000, fee: 87600, net: 1372400, status: "PAID" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div>
            <div className="text-[15px] font-bold text-white">{name}</div>
            <div className="text-[11px] text-white/50">Owner Statement</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[18px] font-black" style={{ color: "var(--navy)" }}>4</div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase">Months</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[15px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(mockData.reduce((s, r) => s + r.gross, 0))}</div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase">Gross Revenue</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-[15px] font-black" style={{ color: "var(--gold)" }}>{formatCurrency(mockData.reduce((s, r) => s + r.net, 0))}</div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase">Net Remittance</div>
            </div>
          </div>
          {owner.bankName && (
            <div className="bg-blue-50 rounded-xl p-3 mb-4 text-[12px] text-blue-700">
              <strong>Bank:</strong> {owner.bankName} · {owner.bankAccountName} · {owner.bankAccountNumber}
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Month", "Gross Revenue", "Mgmt Fee (6%)", "Net Remittance", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 py-2 first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row) => (
                <tr key={row.month} className="border-b border-gray-50">
                  <td className="py-2.5 text-[12.5px] font-semibold text-gray-900">{row.month}</td>
                  <td className="py-2.5 text-[12.5px] text-gray-700">{formatCurrency(row.gross)}</td>
                  <td className="py-2.5 text-[12.5px] text-red-500">({formatCurrency(row.fee)})</td>
                  <td className="py-2.5 text-[13px] font-bold" style={{ color: "var(--emerald)" }}>{formatCurrency(row.net)}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-6 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

export function OwnersTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Owner Portal" action={{ label: "Add Owner", onClick: () => setOpen(true) }} />
      {open && <AddOwnerModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function OwnerRowActions({ owner }: { owner: Owner }) {
  const router = useRouter();
  const [statement, setStatement] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove owner "${owner.user.firstName} ${owner.user.lastName}"?`)) return;
    setDeleting(true);
    await fetch(`/api/owners/${owner.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setStatement(true)} title="View statement"
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
          <FileText size={12} className="text-blue-600" />
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Remove owner"
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
      {statement && <StatementModal owner={owner} onClose={() => setStatement(false)} />}
    </>
  );
}
