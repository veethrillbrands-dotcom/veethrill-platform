"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
  X, Plus, Video, MapPin, Clock, Users, Calendar,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Trash2,
  Building2, Briefcase, Link2, Edit3, ChevronRight, Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Attendee = { name: string; email?: string; role?: string };

type Meeting = {
  id: string; title: string; type: string; status: string;
  scheduledAt: string; duration: number;
  location: string | null; meetingUrl: string | null;
  brief: string | null; outcome: string | null;
  attendees: Attendee[];
  contact: { id: string; name: string; type: string } | null;
  deal: { id: string; title: string; stage: string } | null;
  property: { id: string; name: string; city: string } | null;
  createdAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  SCHEDULED:   { label: "Scheduled",   icon: Clock,        class: "bg-blue-100 text-blue-700" },
  COMPLETED:   { label: "Completed",   icon: CheckCircle2, class: "bg-emerald-100 text-emerald-700" },
  CANCELLED:   { label: "Cancelled",   icon: XCircle,      class: "bg-red-100 text-red-600" },
  RESCHEDULED: { label: "Rescheduled", icon: RefreshCw,    class: "bg-yellow-100 text-yellow-700" },
};

function isPast(dt: string) { return new Date(dt) < new Date(); }
function isToday(dt: string) {
  const d = new Date(dt); const now = new Date();
  return d.toDateString() === now.toDateString();
}

// ─── Create Meeting Modal ─────────────────────────────────────────────────────

function CreateMeetingModal({ contacts, deals, properties, onClose, onCreated }: {
  contacts: { id: string; name: string; type: string }[];
  deals: { id: string; title: string; stage: string }[];
  properties: { id: string; name: string; city: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [generatingAgenda, setGeneratingAgenda] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState({ name: "", email: "", role: "" });
  const [form, setForm] = useState({
    title: "",
    type: "PHYSICAL" as "PHYSICAL" | "VIRTUAL",
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    duration: "60",
    location: "",
    meetingUrl: "",
    brief: "",
    contactId: "",
    dealId: "",
    propertyId: "",
    attendees: [] as Attendee[],
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function generateAgenda() {
    if (!form.title) return;
    setGeneratingAgenda(true);
    try {
      const linkedContact = contacts.find((c) => c.id === form.contactId);
      const linkedDeal = deals.find((d) => d.id === form.dealId);
      const linkedProperty = properties.find((p) => p.id === form.propertyId);
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "meeting_agenda",
          context: {
            meetingTitle: form.title,
            attendees: form.attendees,
            duration: Number(form.duration),
            linkedContact: linkedContact ? `${linkedContact.name} (${linkedContact.type})` : null,
            linkedDeal: linkedDeal ? `${linkedDeal.title} (${linkedDeal.stage})` : null,
            linkedProperty: linkedProperty ? `${linkedProperty.name}, ${linkedProperty.city}` : null,
          },
        }),
      });
      const data = await res.json();
      if (data.agenda) {
        const { openingPoints, mainAgendaItems, closingPoints } = data.agenda;
        const agendaText = [
          openingPoints?.length ? `Opening:\n${openingPoints.map((p: string) => `• ${p}`).join("\n")}` : "",
          mainAgendaItems?.length ? `\nAgenda:\n${mainAgendaItems.map((a: { item: string; duration_minutes?: number; owner?: string }) => `• ${a.item}${a.duration_minutes ? ` (${a.duration_minutes}min)` : ""}${a.owner ? ` — ${a.owner}` : ""}`).join("\n")}` : "",
          closingPoints?.length ? `\nClosing:\n${closingPoints.map((p: string) => `• ${p}`).join("\n")}` : "",
        ].filter(Boolean).join("\n").trim();
        set("brief", agendaText);
      }
    } catch { /* ignore */ }
    setGeneratingAgenda(false);
  }

  function addAttendee() {
    if (!attendeeInput.name) return;
    set("attendees", [...form.attendees, { ...attendeeInput }]);
    setAttendeeInput({ name: "", email: "", role: "" });
  }

  async function save() {
    if (!form.title || !form.scheduledAt) return;
    setSaving(true);
    await fetch("/api/crm/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Schedule Meeting</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="label-xs">Meeting Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} autoFocus
              placeholder="e.g. Property Viewing with Chidi at Lekki Phase 1"
              className="field" />
          </div>

          {/* Type toggle */}
          <div>
            <label className="label-xs">Meeting Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["PHYSICAL", "VIRTUAL"] as const).map((t) => (
                <button key={t} type="button" onClick={() => set("type", t)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${form.type === t ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}>
                  {t === "VIRTUAL" ? <Video size={16} className="text-blue-500" /> : <MapPin size={16} className="text-orange-500" />}
                  {t === "VIRTUAL" ? "Virtual (Online)" : "Physical (In-Person)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-xs">Date & Time *</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className="field" />
            </div>
            <div>
              <label className="label-xs">Duration (minutes)</label>
              <select value={form.duration} onChange={(e) => set("duration", e.target.value)} className="field">
                {[15, 30, 45, 60, 90, 120, 180].map((d) => (
                  <option key={d} value={d}>{d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}`}</option>
                ))}
              </select>
            </div>
          </div>

          {form.type === "PHYSICAL" ? (
            <div>
              <label className="label-xs">Location / Address</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. 5 Admiralty Way, Lekki Phase 1, Lagos"
                className="field" />
            </div>
          ) : (
            <div>
              <label className="label-xs">Meeting Link (Zoom / Google Meet / Teams)</label>
              <input value={form.meetingUrl} onChange={(e) => set("meetingUrl", e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="field" />
            </div>
          )}

          {/* Brief / Agenda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-xs">Agenda / Brief</label>
              <button type="button" onClick={generateAgenda} disabled={generatingAgenda || !form.title}
                className="flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-lg disabled:opacity-40 transition-all"
                style={{ background: "var(--navy)", color: "var(--gold)" }}>
                <Sparkles size={10} />
                {generatingAgenda ? "Generating…" : "AI Generate Agenda"}
              </button>
            </div>
            <textarea value={form.brief} onChange={(e) => set("brief", e.target.value)} rows={4}
              placeholder="What will be discussed? Any prep notes for attendees? Or click 'AI Generate Agenda' above."
              className="field resize-none" />
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-xs">Linked Contact</label>
              <select value={form.contactId} onChange={(e) => set("contactId", e.target.value)} className="field">
                <option value="">— None —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Linked Deal</label>
              <select value={form.dealId} onChange={(e) => set("dealId", e.target.value)} className="field">
                <option value="">— None —</option>
                {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Linked Property</label>
              <select value={form.propertyId} onChange={(e) => set("propertyId", e.target.value)} className="field">
                <option value="">— None —</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="label-xs">Attendees</label>
            {form.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.attendees.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-blue-800">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-[9px] font-black">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    {a.name}
                    {a.role && <span className="text-[10px] text-blue-500">({a.role})</span>}
                    <button onClick={() => set("attendees", form.attendees.filter((_, j) => j !== i))}
                      className="text-blue-400 hover:text-red-500 ml-0.5">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <input value={attendeeInput.name} onChange={(e) => setAttendeeInput((f) => ({ ...f, name: e.target.value }))}
                placeholder="Name *" className="field" />
              <input value={attendeeInput.email} onChange={(e) => setAttendeeInput((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email (optional)" className="field" />
              <div className="flex gap-2">
                <input value={attendeeInput.role} onChange={(e) => setAttendeeInput((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Role (e.g. Owner)" className="field flex-1" />
                <button onClick={addAttendee} disabled={!attendeeInput.name}
                  className="px-3 rounded-xl text-white text-[12px] font-bold disabled:opacity-40" style={{ background: "var(--navy)" }}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.title}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Scheduling…" : "✓ Schedule Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────

function MeetingCard({ meeting, onStatusChange, onDelete }: {
  meeting: Meeting;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = STATUS_META[meeting.status] ?? STATUS_META.SCHEDULED;
  const StatusIcon = meta.icon;
  const past = isPast(meeting.scheduledAt);
  const today = isToday(meeting.scheduledAt);

  const endTime = new Date(new Date(meeting.scheduledAt).getTime() + meeting.duration * 60000);
  const attendees = (meeting.attendees ?? []) as Attendee[];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-shadow ${meeting.status === "CANCELLED" ? "opacity-60 border-gray-100" : today && meeting.status === "SCHEDULED" ? "border-yellow-300" : "border-gray-100"}`}>
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meeting.type === "VIRTUAL" ? "bg-blue-50" : "bg-orange-50"}`}>
          {meeting.type === "VIRTUAL"
            ? <Video size={18} className="text-blue-500" />
            : <MapPin size={18} className="text-orange-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[14px] font-bold text-gray-900 leading-tight">{meeting.title}</div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {today && meeting.status === "SCHEDULED" && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">TODAY</span>
              )}
              <span className={`flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${meta.class}`}>
                <StatusIcon size={9} /> {meta.label}
              </span>
            </div>
          </div>

          {/* Date/time/duration */}
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(meeting.scheduledAt).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(meeting.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              {" "}
              <span className="text-gray-400">({meeting.duration}min)</span>
            </span>
          </div>

          {/* Location / URL */}
          {meeting.type === "PHYSICAL" && meeting.location && (
            <div className="flex items-center gap-1 mt-1 text-[12px] text-gray-500">
              <MapPin size={11} className="flex-shrink-0" /> {meeting.location}
            </div>
          )}
          {meeting.type === "VIRTUAL" && meeting.meetingUrl && (
            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1 text-[12px] text-blue-600 hover:underline">
              <Link2 size={11} className="flex-shrink-0" /> Join Meeting
            </a>
          )}

          {/* Brief */}
          {meeting.brief && (
            <div className="text-[12px] text-gray-500 mt-2 p-2.5 bg-gray-50 rounded-xl line-clamp-2">{meeting.brief}</div>
          )}

          {/* Outcome (for completed meetings) */}
          {meeting.outcome && (
            <div className="text-[12px] text-emerald-700 mt-2 p-2.5 bg-emerald-50 rounded-xl">
              <span className="font-bold">Outcome:</span> {meeting.outcome}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {meeting.contact && (
              <a href={`/dashboard/crm/contacts/${meeting.contact.id}`}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                <Users size={10} /> {meeting.contact.name}
              </a>
            )}
            {meeting.deal && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Briefcase size={10} /> {meeting.deal.title}
              </span>
            )}
            {meeting.property && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Building2 size={10} /> {meeting.property.name}
              </span>
            )}
          </div>

          {/* Attendees */}
          {attendees.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10.5px] text-gray-400">Attendees:</span>
              {attendees.map((a, i) => (
                <span key={i} className="text-[10.5px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {a.name}{a.role ? ` (${a.role})` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {meeting.status !== "CANCELLED" && (
            <div className="flex items-center gap-2 mt-3">
              {meeting.status === "SCHEDULED" && (
                <>
                  <button onClick={() => onStatusChange(meeting.id, "COMPLETED")}
                    className="flex items-center gap-1 text-[11.5px] font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors">
                    <CheckCircle2 size={11} /> Mark Complete
                  </button>
                  <button onClick={() => onStatusChange(meeting.id, "RESCHEDULED")}
                    className="flex items-center gap-1 text-[11.5px] font-bold px-3 py-1.5 rounded-xl bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors">
                    <RefreshCw size={11} /> Reschedule
                  </button>
                  <button onClick={() => onStatusChange(meeting.id, "CANCELLED")}
                    className="flex items-center gap-1 text-[11.5px] font-bold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                    <XCircle size={11} /> Cancel
                  </button>
                </>
              )}
              {meeting.status === "RESCHEDULED" && (
                <button onClick={() => onStatusChange(meeting.id, "SCHEDULED")}
                  className="flex items-center gap-1 text-[11.5px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
                  <Clock size={11} /> Re-confirm
                </button>
              )}
              <button onClick={() => onDelete(meeting.id)}
                className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ["Upcoming", "Today", "All", "Completed", "Cancelled"] as const;

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; title: string; stage: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string; city: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("Upcoming");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/meetings");
    setMeetings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    Promise.all([
      fetch("/api/crm/contacts").then((r) => r.json()),
      fetch("/api/crm/deals").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ]).then(([c, d, p]) => { setContacts(c); setDeals(d); setProperties(p); });
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    await fetch(`/api/crm/meetings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function deleteMeeting(id: string) {
    await fetch(`/api/crm/meetings/${id}`, { method: "DELETE" });
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }

  const now = new Date();
  const filtered = meetings.filter((m) => {
    if (filter === "Today") return isToday(m.scheduledAt);
    if (filter === "Upcoming") return new Date(m.scheduledAt) >= now && m.status === "SCHEDULED";
    if (filter === "Completed") return m.status === "COMPLETED";
    if (filter === "Cancelled") return m.status === "CANCELLED";
    return true;
  });

  const todayCount = meetings.filter((m) => isToday(m.scheduledAt) && m.status === "SCHEDULED").length;
  const upcomingCount = meetings.filter((m) => new Date(m.scheduledAt) >= now && m.status === "SCHEDULED").length;
  const completedCount = meetings.filter((m) => m.status === "COMPLETED").length;
  const virtualCount = meetings.filter((m) => m.type === "VIRTUAL").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Meetings" action={{ label: "Schedule Meeting", onClick: () => setCreating(true) }} />

      <style>{`
        .label-xs { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:6px; }
        .field { width:100%; border:1px solid #e5e7eb; border-radius:12px; padding:10px 14px; font-size:13px; outline:none; transition:border-color 0.15s; }
        .field:focus { border-color:#fbbf24; }
      `}</style>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today",      value: todayCount,    color: "#F59E0B", onClick: () => setFilter("Today") },
            { label: "Upcoming",   value: upcomingCount, color: "var(--navy)", onClick: () => setFilter("Upcoming") },
            { label: "Completed",  value: completedCount,color: "var(--emerald)", onClick: () => setFilter("Completed") },
            { label: "Virtual",    value: virtualCount,  color: "#3B82F6", onClick: () => setFilter("All") },
          ].map((k) => (
            <button key={k.label} onClick={k.onClick}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[24px] font-black" style={{ color: k.color }}>{k.value}</div>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[12px] font-bold px-4 py-2 rounded-xl transition-colors ${filter === f ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              style={filter === f ? { background: "var(--navy)" } : {}}>
              {f}
            </button>
          ))}
        </div>

        {/* Meetings list */}
        {loading ? (
          <div className="text-center text-gray-400 py-16 text-[13px]">Loading meetings…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <div className="text-[16px] font-bold text-gray-700">No meetings found</div>
            <div className="text-[13px] text-gray-400 mt-1 mb-5">
              {filter === "Upcoming" ? "No upcoming meetings scheduled." : `No ${filter.toLowerCase()} meetings.`}
            </div>
            <button onClick={() => setCreating(true)}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ background: "var(--navy)" }}>
              + Schedule Meeting
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting}
                onStatusChange={updateStatus}
                onDelete={deleteMeeting} />
            ))}
          </div>
        )}
      </div>

      {creating && (
        <CreateMeetingModal
          contacts={contacts} deals={deals} properties={properties}
          onClose={() => setCreating(false)} onCreated={load}
        />
      )}
    </div>
  );
}
