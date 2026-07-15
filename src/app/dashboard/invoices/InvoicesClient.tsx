"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Plus, Trash2, Eye, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type LineItem = { description: string; qty: number; unitPrice: number };
type Invoice = {
  id: string; invoiceNumber: string; type: string; status: string;
  recipientName: string; recipientEmail: string | null; description: string;
  lineItems: LineItem[]; subtotal: number; taxRate: number; total: number;
  dueDate: string; issuedAt: string; approvedAt: string | null; approvedBy: string | null;
  sentAt: string | null; paidAt: string | null; notes: string | null;
};

const STATUS_BADGE: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  DRAFT: "default", PENDING_APPROVAL: "warning", APPROVED: "info", SENT: "info", PAID: "success", CANCELLED: "error",
};

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [form, setForm] = useState({
    type: "RENT", recipientName: "", recipientEmail: "", description: "",
    taxRate: "0", dueDate: "", notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function addItem() { setLineItems((items) => [...items, { description: "", qty: 1, unitPrice: 0 }]); }
  function removeItem(i: number) { setLineItems((items) => items.filter((_, j) => j !== i)); }
  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setLineItems((items) => items.map((item, j) => j === i ? { ...item, [field]: field === "description" ? value : Number(value) } : item));
  }

  const subtotal = lineItems.reduce((s, item) => s + item.qty * item.unitPrice, 0);
  const tax = subtotal * (Number(form.taxRate) / 100);
  const total = subtotal + tax;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lineItems }),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); router.refresh(); }, 1200); }
    else setSaving(false);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <CheckCircle size={32} className="text-emerald-600" />
        <div className="text-[17px] font-bold text-gray-900">Invoice Created!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Create Invoice</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Invoice Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                {["RENT", "SHORTLET", "SERVICE", "MAINTENANCE", "OTHER"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Recipient Name</label>
              <input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} placeholder="e.g. Chidi Okafor"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Recipient Email</label>
              <input type="email" value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Rent for Unit 7C — July 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Line Items</label>
              <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ color: "var(--gold)" }}>
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Unit Price</div>
                <div className="col-span-1"></div>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Service description" className="col-span-6 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
                  <input type="number" value={item.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} min="1"
                    className="col-span-2 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
                  <input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    className="col-span-3 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
                  <button onClick={() => removeItem(i)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-500">Tax Rate (%)</span>
              <input type="number" value={form.taxRate} onChange={(e) => set("taxRate", e.target.value)} min="0" max="100"
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-[12px] text-right outline-none focus:border-yellow-400" />
            </div>
            {Number(form.taxRate) > 0 && (
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-500">Tax ({form.taxRate}%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-[14px] font-black border-t border-gray-200 pt-2">
              <span>Total</span>
              <span style={{ color: "var(--emerald)" }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              placeholder="Payment instructions or additional notes..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.recipientName || !form.description || !form.dueDate}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Creating…" : "✓ Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, approvedBy: "Admin" }),
    });
    setUpdating(false);
    onClose(); router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div>
            <div className="text-[15px] font-bold text-white">{invoice.invoiceNumber}</div>
            <div className="text-[11px] text-white/50">{invoice.type} Invoice</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[16px] font-bold text-gray-900">{invoice.recipientName}</div>
              {invoice.recipientEmail && <div className="text-[12px] text-gray-400">{invoice.recipientEmail}</div>}
            </div>
            <Badge variant={STATUS_BADGE[invoice.status] ?? "default"}>{invoice.status.replace("_", " ")}</Badge>
          </div>
          <div className="text-[13px] text-gray-600">{invoice.description}</div>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Description", "Qty", "Unit Price", "Total"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2.5 text-[12.5px] text-gray-700">{item.description}</td>
                    <td className="px-4 py-2.5 text-[12.5px] text-gray-700">{item.qty}</td>
                    <td className="px-4 py-2.5 text-[12.5px] text-gray-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2.5 text-[12.5px] font-semibold text-gray-900">{formatCurrency(item.qty * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-[12px] font-bold text-right text-gray-500">Subtotal</td>
                  <td className="px-4 py-2.5 text-[12.5px] font-bold text-gray-900">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {invoice.taxRate > 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-1.5 text-[12px] text-right text-gray-400">Tax ({invoice.taxRate}%)</td>
                    <td className="px-4 py-1.5 text-[12px] text-gray-600">{formatCurrency(invoice.subtotal * invoice.taxRate / 100)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-[13px] font-black text-right" style={{ color: "var(--navy)" }}>Total</td>
                  <td className="px-4 py-2.5 text-[14px] font-black" style={{ color: "var(--emerald)" }}>{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {invoice.notes && (
            <div className="bg-yellow-50 rounded-xl p-3 text-[12px] text-gray-700">
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
          <div className="text-[11.5px] text-gray-400">
            Due: {new Date(invoice.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {invoice.approvedBy && ` · Approved by ${invoice.approvedBy}`}
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-2 flex-shrink-0 flex-wrap">
          {invoice.status === "DRAFT" && (
            <button onClick={() => updateStatus("PENDING_APPROVAL")} disabled={updating}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border border-yellow-200 text-yellow-700 hover:bg-yellow-50">
              Submit for Approval
            </button>
          )}
          {invoice.status === "PENDING_APPROVAL" && (
            <button onClick={() => updateStatus("APPROVED")} disabled={updating}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--emerald)" }}>
              ✓ Approve
            </button>
          )}
          {invoice.status === "APPROVED" && (
            <button onClick={() => updateStatus("SENT")} disabled={updating}
              className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>
              <Send size={12} /> Send to Client
            </button>
          )}
          {invoice.status === "SENT" && (
            <button onClick={() => updateStatus("PAID")} disabled={updating}
              className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--emerald)" }}>
              ✓ Mark as Paid
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Invoices" action={{ label: "Create Invoice", onClick: () => setOpen(true) }} />
      {open && <CreateInvoiceModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function InvoiceRowActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [detail, setDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    setDeleting(true);
    await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setDetail(true)} title="View invoice"
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
          <Eye size={12} className="text-blue-600" />
        </button>
        {invoice.status === "DRAFT" && (
          <button onClick={handleDelete} disabled={deleting} title="Delete"
            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
            <Trash2 size={12} className="text-red-500" />
          </button>
        )}
      </div>
      {detail && <InvoiceDetailModal invoice={invoice} onClose={() => setDetail(false)} />}
    </>
  );
}
