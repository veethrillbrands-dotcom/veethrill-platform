"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, CheckCircle, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Unit = { id: string; unitNumber: string; property: { name: string } };
type Booking = {
  id: string; guestName: string; guestEmail: string; guestPhone: string;
  checkIn: string; checkOut: string; nights: number; nightlyRate: number;
  totalAmount: number; source: string; status: string; guestCount: number;
  specialRequests: string | null; unit: { unitNumber: string; property: { name: string } };
};

const STATUS_BADGE: Record<string, "success" | "info" | "warning" | "default" | "error"> = {
  CHECKED_IN: "success", CONFIRMED: "info", PENDING: "warning", CHECKED_OUT: "default", CANCELLED: "error", NO_SHOW: "error",
};

function NewBookingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState({
    unitId: "", guestName: "", guestEmail: "", guestPhone: "",
    checkIn: "", checkOut: "", nightlyRate: "", guestCount: "1",
    source: "DIRECT", specialRequests: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/units").then((r) => r.json()).then(setUnits);
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/shortlet-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nightlyRate: Number(form.nightlyRate), guestCount: Number(form.guestCount) }),
    });
    if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); router.refresh(); }, 1200); }
    else setSaving(false);
  }

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle size={32} className="text-emerald-600" /></div>
        <div className="text-[17px] font-bold text-gray-900">Booking Created!</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">New Guest Booking</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Unit</label>
            <select value={form.unitId} onChange={(e) => set("unitId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              <option value="">Select unit…</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber} — {u.property.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Guest Name</label>
              <input value={form.guestName} onChange={(e) => set("guestName", e.target.value)} placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Phone</label>
              <input value={form.guestPhone} onChange={(e) => set("guestPhone", e.target.value)} placeholder="+234 xxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email</label>
            <input type="email" value={form.guestEmail} onChange={(e) => set("guestEmail", e.target.value)} placeholder="guest@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Check-in</label>
              <input type="date" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Check-out</label>
              <input type="date" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Nightly Rate (₦)</label>
              <input type="number" value={form.nightlyRate} onChange={(e) => set("nightlyRate", e.target.value)} placeholder="25000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Guests</label>
              <input type="number" value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)} min="1"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Source</label>
            <select value={form.source} onChange={(e) => set("source", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {["DIRECT", "AIRBNB", "BOOKING_COM", "EXPEDIA", "OTHER"].map((s) => (
                <option key={s} value={s}>{s.replace("_", ".")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Special Requests</label>
            <textarea value={form.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} rows={2}
              placeholder="Any special requests..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.unitId || !form.guestName || !form.checkIn || !form.checkOut || !form.nightlyRate}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Creating…" : "✓ Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Booking Details</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[17px] font-bold text-gray-900">{booking.guestName}</div>
              <div className="text-[12px] text-gray-400">{booking.guestEmail}</div>
              <div className="text-[12px] text-gray-400">{booking.guestPhone}</div>
            </div>
            <Badge variant={STATUS_BADGE[booking.status] ?? "default"}>{booking.status.replace("_", " ")}</Badge>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Unit</span>
              <span className="font-semibold">{booking.unit.unitNumber} — {booking.unit.property.name}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Check-in</span>
              <span className="font-semibold">{formatDate(booking.checkIn)}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Check-out</span>
              <span className="font-semibold">{formatDate(booking.checkOut)}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Nights</span>
              <span className="font-semibold">{booking.nights}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Guests</span>
              <span className="font-semibold">{booking.guestCount}</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-gray-500">Nightly Rate</span>
              <span className="font-semibold">{formatCurrency(booking.nightlyRate)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-700">Total Amount</span>
              <span style={{ color: "var(--emerald)" }}>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
          {booking.specialRequests && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Special Requests</div>
              <div className="text-[12.5px] text-gray-700">{booking.specialRequests}</div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

function EditBookingModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    guestName: booking.guestName, guestEmail: booking.guestEmail, guestPhone: booking.guestPhone,
    guestCount: String(booking.guestCount), status: booking.status,
    specialRequests: booking.specialRequests ?? "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch(`/api/shortlet-bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onClose(); router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Edit Booking</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Guest Name", key: "guestName" }, { label: "Email", key: "guestEmail" },
            { label: "Phone", key: "guestPhone" }, { label: "No. of Guests", key: "guestCount", type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}</label>
              <input type={type ?? "text"} value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
            </div>
          ))}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"].map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Special Requests</label>
            <textarea value={form.specialRequests} onChange={(e) => set("specialRequests", e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuestsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Guests" action={{ label: "New Booking", onClick: () => setOpen(true) }} />
      {open && <NewBookingModal onClose={() => setOpen(false)} />}
    </>
  );
}

export function GuestRowActions({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [detail, setDetail] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete booking for "${booking.guestName}"?`)) return;
    setDeleting(true);
    await fetch(`/api/shortlet-bookings/${booking.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setDetail(true)} title="View details"
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
          <Eye size={12} className="text-blue-600" />
        </button>
        <button onClick={() => setEditing(true)} title="Edit booking"
          className="w-7 h-7 rounded-lg bg-yellow-50 hover:bg-yellow-100 flex items-center justify-center transition-colors">
          <Pencil size={12} className="text-yellow-600" />
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Delete booking"
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
          <Trash2 size={12} className="text-red-500" />
        </button>
      </div>
      {detail && <DetailModal booking={booking} onClose={() => setDetail(false)} />}
      {editing && <EditBookingModal booking={booking} onClose={() => setEditing(false)} />}
    </>
  );
}
