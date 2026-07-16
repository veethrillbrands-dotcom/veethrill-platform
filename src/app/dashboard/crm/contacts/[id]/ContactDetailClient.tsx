"use client";

import { useState, useEffect } from "react";
import {
  Phone, Mail, MessageCircle, MapPin, Building2, Calendar,
  Clock, FileText, X, Plus, Trash2, ChevronRight,
  PhoneIncoming, PhoneOutgoing, MailOpen, Send, Users,
  StickyNote, MessageSquare, Car, Star, CheckCircle2, Circle,
  Sparkles, RefreshCw
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type Activity = {
  id: string; type: string; subject: string | null; body: string;
  outcome: string | null; duration: number | null; activityAt: string;
  loggedByName: string | null; attachments: string[];
};

type Deal = {
  id: string; title: string; value: number; stage: string;
  contactName: string; dueDate: string | null; notes: string | null;
};

type LinkedProperty = {
  id: string; contactId: string; propertyId: string; interest: string; notes: string | null;
  createdAt: string;
  property: {
    id: string; name: string; city: string; type: string;
    units: { id: string }[];
  };
};

type Invoice = {
  id: string; invoiceNumber: string; type: string; status: string;
  total: number; issuedAt: string; dueDate: string;
  description: string; recipientName: string;
};

type Document = {
  id: string; name: string; url: string; type: string;
  folder: string; size: number | null; createdAt: string; uploadedBy: string;
};

type Contact = {
  id: string; name: string; type: string; email: string | null; phone: string | null;
  company: string | null; location: string | null; source: string | null; notes: string | null;
  linkedRole: string | null; linkedUserId: string | null;
  createdAt: string;
  deals: Deal[];
  activities: Activity[];
  properties: LinkedProperty[];
};

type Prop = { id: string; name: string; city: string; type: string; unitCount: number };

// ─── Activity icons ──────────────────────────────────────────────────────────

const ACT_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  CALL_OUT:   { label: "Outbound Call",  icon: PhoneOutgoing,  color: "#3B82F6", bg: "bg-blue-50" },
  CALL_IN:    { label: "Inbound Call",   icon: PhoneIncoming,  color: "#10B981", bg: "bg-emerald-50" },
  EMAIL_OUT:  { label: "Email Sent",     icon: Send,           color: "#8B5CF6", bg: "bg-purple-50" },
  EMAIL_IN:   { label: "Email Received", icon: MailOpen,       color: "#6366F1", bg: "bg-indigo-50" },
  WHATSAPP:   { label: "WhatsApp",       icon: MessageCircle,  color: "#22C55E", bg: "bg-green-50" },
  SMS:        { label: "SMS",            icon: MessageSquare,  color: "#14B8A6", bg: "bg-teal-50" },
  MEETING:    { label: "Meeting",        icon: Users,          color: "#F59E0B", bg: "bg-yellow-50" },
  SITE_VISIT: { label: "Site Visit",     icon: Car,            color: "#EF4444", bg: "bg-red-50" },
  NOTE:       { label: "Note",           icon: StickyNote,     color: "#6B7280", bg: "bg-gray-50" },
};

const ACTIVITY_TYPES = Object.entries(ACT_META).map(([key, v]) => ({ key, label: v.label }));

const STAGE_COLOR: Record<string, string> = {
  Lead: "bg-gray-100 text-gray-600", Qualified: "bg-blue-100 text-blue-700",
  Proposal: "bg-yellow-100 text-yellow-700", Negotiation: "bg-orange-100 text-orange-700",
  "Closed Won": "bg-emerald-100 text-emerald-700", "Closed Lost": "bg-red-100 text-red-700",
};

const INV_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500", PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700", SENT: "bg-indigo-100 text-indigo-700",
  PAID: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-red-100 text-red-500",
};

const TYPE_COLORS: Record<string, string> = {
  Prospect: "bg-blue-100 text-blue-700", Client: "bg-emerald-100 text-emerald-700",
  Developer: "bg-purple-100 text-purple-700", Agent: "bg-yellow-100 text-yellow-700",
  Partner: "bg-indigo-100 text-indigo-700", Corporate: "bg-orange-100 text-orange-700",
  Diaspora: "bg-teal-100 text-teal-700", HNI: "bg-red-100 text-red-700",
};

// ─── AI Message Templates Modal ─────────────────────────────────────────────

function AIMessageModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("follow-up after initial enquiry");
  const [templates, setTemplates] = useState<{ channel: string; subject?: string; body: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "message_template",
          context: {
            recipient: `${contact.name} (${contact.type})`,
            purpose,
            additionalContext: `Contact type: ${contact.type}. Company: ${contact.company ?? "N/A"}. Location: ${contact.location ?? "N/A"}.`,
          },
        }),
      });
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const PURPOSES = [
    "follow-up after initial enquiry",
    "overdue rent reminder",
    "lease renewal offer",
    "property viewing invitation",
    "welcome new tenant",
    "invoice payment reminder",
    "meeting confirmation",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
          <div className="flex items-center gap-2.5">
            <Sparkles size={15} style={{ color: "var(--gold)" }} />
            <div className="text-[15px] font-bold text-white">AI Message Templates</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Message Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {PURPOSES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--navy)" }}>
            {loading ? "Generating templates…" : "✦ Generate with AI"}
          </button>
          {templates.length > 0 && (
            <div className="space-y-3">
              {templates.map((t, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-gray-500">{t.channel}</span>
                      {t.subject && <span className="text-[11px] text-gray-400">· {t.subject}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {t.channel === "WHATSAPP" && contact.phone && (
                        <a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(t.body)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[10.5px] font-bold text-green-600 px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100">
                          Open WhatsApp →
                        </a>
                      )}
                      {t.channel === "EMAIL" && contact.email && (
                        <a href={`mailto:${contact.email}?subject=${encodeURIComponent(t.subject ?? "")}&body=${encodeURIComponent(t.body)}`}
                          className="text-[10.5px] font-bold text-purple-600 px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100">
                          Open Email →
                        </a>
                      )}
                      <button onClick={() => copy(t.body, `${i}`)}
                        className="text-[10.5px] font-bold text-gray-500 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">
                        {copied === `${i}` ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-[12.5px] text-gray-700 whitespace-pre-line">{t.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Log Activity Modal ──────────────────────────────────────────────────────

function LogActivityModal({ contactId, onClose, onSaved }: { contactId: string; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "CALL_OUT", subject: "", body: "", outcome: "", duration: "",
    activityAt: new Date().toISOString().slice(0, 16),
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.body && !form.subject) return;
    setSaving(true);
    await fetch(`/api/crm/contacts/${contactId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration: form.duration ? Number(form.duration) : null }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  const meta = ACT_META[form.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Log Activity</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Type */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Activity Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map(({ key, label }) => {
                const m = ACT_META[key];
                const Icon = m.icon;
                return (
                  <button key={key} type="button" onClick={() => set("type", key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-[11.5px] font-bold transition-all ${form.type === key ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                    <Icon size={13} style={{ color: m.color }} />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date/time */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Date & Time</label>
            <input type="datetime-local" value={form.activityAt} onChange={(e) => set("activityAt", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Subject</label>
            <input value={form.subject} onChange={(e) => set("subject", e.target.value)}
              placeholder="e.g. Discussion about 3-bed unit at Lekki"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes / Summary *</label>
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={4}
              placeholder="What was discussed? What happened?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Outcome */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Outcome</label>
              <select value={form.outcome} onChange={(e) => set("outcome", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
                <option value="">— Select —</option>
                {["Interested", "Not Interested", "Follow Up", "Callback Requested", "Sent Proposal", "Site Visit Scheduled",
                  "Negotiating", "Closed", "No Answer", "Voicemail Left", "Meeting Scheduled"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            {["CALL_OUT", "CALL_IN", "MEETING", "SITE_VISIT"].includes(form.type) && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Duration (min)</label>
                <input type="number" min={0} value={form.duration} onChange={(e) => set("duration", e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || (!form.body && !form.subject)}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "✓ Log Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Link Property Modal ─────────────────────────────────────────────────────

function LinkPropertyModal({ contactId, allProperties, linked, onClose, onSaved }: {
  contactId: string;
  allProperties: Prop[];
  linked: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ propertyId: "", interest: "Interested", notes: "" });

  const available = allProperties.filter((p) => !linked.includes(p.id));

  async function save() {
    if (!form.propertyId) return;
    setSaving(true);
    await fetch(`/api/crm/contacts/${contactId}/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">Link Property</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Property</label>
            <select value={form.propertyId} onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              <option value="">— Select property —</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.city} ({p.unitCount} units)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Interest Type</label>
            <select value={form.interest} onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400">
              {["Buyer", "Tenant", "Investor", "Interested", "Viewing Requested"].map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
              placeholder="e.g. Looking for 3-bed unit, budget ₦5M"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
          <button onClick={save} disabled={saving || !form.propertyId}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Saving…" : "Link Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Props = {
  contact: Contact;
  allProperties: Prop[];
  invoices: Invoice[];
  documents: Document[];
};

type ContactTask = {
  id: string; title: string; type: string; status: string; priority: string;
  dueAt: string | null; tags: string[];
  deal: { id: string; title: string } | null;
  property: { id: string; name: string } | null;
};

type ContactMeeting = {
  id: string; title: string; type: string; status: string;
  scheduledAt: string; duration: number;
  location: string | null; meetingUrl: string | null; brief: string | null;
  attendees: { name: string; role?: string }[];
  deal: { id: string; title: string } | null;
  property: { id: string; name: string } | null;
};

export function ContactDetailClient({ contact, allProperties, invoices, documents }: Props) {
  const [tab, setTab] = useState<"activity" | "properties" | "invoices" | "files" | "tasks" | "meetings">("activity");
  const [activities, setActivities] = useState<Activity[]>(contact.activities);
  const [linkedProps, setLinkedProps] = useState<LinkedProperty[]>(contact.properties);
  const [tasks, setTasks] = useState<ContactTask[]>([]);
  const [meetings, setMeetings] = useState<ContactMeeting[]>([]);
  const [linkedRole, setLinkedRole] = useState<string | null>(contact.linkedRole);
  const [roleTagging, setRoleTagging] = useState(false);
  const [logModal, setLogModal] = useState(false);
  const [linkPropModal, setLinkPropModal] = useState(false);
  const [aiMsgModal, setAiMsgModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ title: string; description: string; type: string; priority: string }[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  async function loadTasks() {
    const res = await fetch(`/api/crm/tasks?contactId=${contact.id}`);
    setTasks(await res.json());
  }

  async function loadMeetings() {
    const res = await fetch(`/api/crm/meetings?contactId=${contact.id}`);
    setMeetings(await res.json());
  }

  useEffect(() => { loadTasks(); loadMeetings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function setRole(role: string | null) {
    setRoleTagging(true);
    const res = await fetch(`/api/crm/contacts/${contact.id}/link-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedRole: role }),
    });
    if (res.ok) setLinkedRole(role);
    setRoleTagging(false);
  }

  async function loadAISuggestions() {
    setLoadingAI(true);
    setAiLoaded(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", entityId: contact.id }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions ?? []);
    } catch { /* ignore */ }
    setLoadingAI(false);
  }

  async function refreshActivities() {
    const res = await fetch(`/api/crm/contacts/${contact.id}/activities`);
    setActivities(await res.json());
  }

  async function refreshProperties() {
    const res = await fetch(`/api/crm/contacts/${contact.id}/properties`);
    setLinkedProps(await res.json());
  }

  async function unlinkProperty(propertyId: string) {
    await fetch(`/api/crm/contacts/${contact.id}/properties`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    refreshProperties();
  }

  const tabs = [
    { key: "activity",  label: `Activity (${activities.length})` },
    { key: "meetings",  label: `Meetings (${meetings.length})` },
    { key: "tasks",     label: `Tasks (${tasks.length})` },
    { key: "properties",label: `Properties (${linkedProps.length})` },
    { key: "invoices",  label: `Invoices (${invoices.length})` },
    { key: "files",     label: `Files (${documents.length})` },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

      {/* Contact header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[20px] font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
            {getInitials(contact.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[20px] font-black text-gray-900">{contact.name}</div>
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[contact.type] ?? "bg-gray-100 text-gray-600"}`}>{contact.type}</span>
            </div>
            {contact.company && <div className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1"><Building2 size={12} /> {contact.company}</div>}
            {contact.location && <div className="text-[13px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={12} /> {contact.location}</div>}
            {contact.notes && <div className="text-[12.5px] text-gray-500 mt-2 p-3 bg-gray-50 rounded-xl">{contact.notes}</div>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {contact.phone && (
              <>
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[12px] font-semibold text-blue-700 transition-colors">
                  <Phone size={12} /> Call
                </a>
                <a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${contact.name.split(" ")[0]}, this is the Veethrill Realty team.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-[12px] font-semibold text-green-700 transition-colors">
                  <MessageCircle size={12} /> WhatsApp
                </a>
              </>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[12px] font-semibold text-purple-700 transition-colors">
                <Mail size={12} /> Email
              </a>
            )}
            <button onClick={() => setAiMsgModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white transition-colors"
              style={{ background: "var(--navy)" }}>
              <Sparkles size={12} style={{ color: "var(--gold)" }} /> AI Message
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Source", value: contact.source ?? "—" },
            { label: "Phone", value: contact.phone ?? "—" },
            { label: "Email", value: contact.email ?? "—" },
            { label: "Added", value: new Date(contact.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{f.label}</div>
              <div className="text-[13px] font-semibold text-gray-800 mt-0.5 truncate">{f.value}</div>
            </div>
          ))}
        </div>

        {/* Role tag */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tag as Platform Role</div>
          <div className="flex items-center gap-2 flex-wrap">
            {["TENANT", "OWNER", "VENDOR", "AGENT", "MAINTENANCE_STAFF"].map((r) => (
              <button key={r} disabled={roleTagging} onClick={() => setRole(linkedRole === r ? null : r)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border-2 transition-all ${linkedRole === r ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                {r === "MAINTENANCE_STAFF" ? "Maintenance" : r.charAt(0) + r.slice(1).toLowerCase()}
                {linkedRole === r && " ✓"}
              </button>
            ))}
            {linkedRole && (
              <span className="text-[11px] text-gray-400 ml-2">
                This contact will appear in the <strong>{linkedRole.charAt(0) + linkedRole.slice(1).toLowerCase()}s</strong> list.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Activities", value: activities.length, color: "var(--navy)" },
          { label: "Deals", value: contact.deals.length, color: "#3B82F6" },
          { label: "Properties", value: linkedProps.length, color: "var(--gold)" },
          { label: "Invoices", value: invoices.length, color: "var(--emerald)" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
          <div className="flex items-center gap-2.5">
            <Sparkles size={15} style={{ color: "var(--gold)" }} />
            <span className="text-[13px] font-bold text-white">AI Next Steps</span>
            <span className="text-[10.5px] text-white/50">Powered by Claude</span>
          </div>
          <button
            onClick={loadAISuggestions}
            disabled={loadingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all"
            style={{ background: "var(--gold)", color: "var(--navy)" }}>
            <RefreshCw size={11} className={loadingAI ? "animate-spin" : ""} />
            {aiLoaded ? "Refresh" : "Suggest Actions"}
          </button>
        </div>
        {aiLoaded && (
          <div className="p-4">
            {loadingAI ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-center py-6 text-[12px] text-gray-400">No suggestions generated. Try again.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiSuggestions.map((s, i) => {
                  const PRIORITY_COLORS: Record<string, string> = {
                    HIGH: "bg-red-50 border-red-200 text-red-700",
                    MEDIUM: "bg-yellow-50 border-yellow-200 text-yellow-700",
                    LOW: "bg-gray-50 border-gray-200 text-gray-600",
                  };
                  return (
                    <div key={i} className={`rounded-xl border p-3 ${PRIORITY_COLORS[s.priority] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}>
                      <div className="flex items-start gap-2">
                        <div className="text-[9px] font-black uppercase tracking-wider mt-0.5 flex-shrink-0 opacity-70">{s.type}</div>
                        <div>
                          <div className="text-[12.5px] font-bold">{s.title}</div>
                          <div className="text-[11px] opacity-75 mt-0.5">{s.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deals (always visible) */}
      {contact.deals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900 text-[14px]">Active Deals</div>
          <div className="divide-y divide-gray-50">
            {contact.deals.map((d) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">{d.title}</div>
                  {d.notes && <div className="text-[11.5px] text-gray-400 mt-0.5">{d.notes}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(d.value)}</div>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLOR[d.stage] ?? "bg-gray-100 text-gray-600"}`}>{d.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-5 py-3.5 text-[12.5px] font-bold transition-colors border-b-2 ${
                tab === t.key ? "border-yellow-400 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ACTIVITY TAB ── */}
        {tab === "activity" && (
          <div>
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="text-[12px] text-gray-500">{activities.length} interaction{activities.length !== 1 ? "s" : ""} recorded</div>
              <button onClick={() => setLogModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>
                <Plus size={13} /> Log Activity
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-[15px] font-bold text-gray-700">No Activities Yet</div>
                <div className="text-[12px] text-gray-400 mt-1 mb-4">Record calls, emails, meetings and more.</div>
                <button onClick={() => setLogModal(true)}
                  className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold text-white" style={{ background: "var(--navy)" }}>
                  + Log First Activity
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activities.map((a) => {
                  const meta = ACT_META[a.type] ?? { label: a.type, icon: StickyNote, color: "#6B7280", bg: "bg-gray-50" };
                  const Icon = meta.icon;
                  return (
                    <div key={a.id} className="px-5 py-4 flex gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <Icon size={16} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-gray-800">{meta.label}</span>
                            {a.subject && <span className="text-[12.5px] text-gray-600">— {a.subject}</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Calendar size={10} />
                            {new Date(a.activityAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            {" "}
                            {new Date(a.activityAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="text-[12.5px] text-gray-700 mt-1">{a.body}</div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {a.outcome && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                              <Star size={9} /> {a.outcome}
                            </span>
                          )}
                          {a.duration && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock size={10} /> {a.duration} min
                            </span>
                          )}
                          {a.loggedByName && (
                            <span className="text-[11px] text-gray-400">by {a.loggedByName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROPERTIES TAB ── */}
        {tab === "properties" && (
          <div>
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="text-[12px] text-gray-500">{linkedProps.length} propert{linkedProps.length !== 1 ? "ies" : "y"} linked</div>
              <button onClick={() => setLinkPropModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>
                <Plus size={13} /> Link Property
              </button>
            </div>

            {linkedProps.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">🏢</div>
                <div className="text-[15px] font-bold text-gray-700">No Properties Linked</div>
                <div className="text-[12px] text-gray-400 mt-1 mb-4">Link properties this contact is interested in.</div>
                <button onClick={() => setLinkPropModal(true)}
                  className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold text-white" style={{ background: "var(--navy)" }}>
                  + Link Property
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {linkedProps.map((lp) => (
                  <div key={lp.id} className="px-5 py-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[13px] font-bold text-gray-900">{lp.property.name}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{lp.interest}</span>
                      </div>
                      <div className="text-[11.5px] text-gray-400">{lp.property.city} · {lp.property.units.length} units · {lp.property.type.replace("_", " ")}</div>
                      {lp.notes && <div className="text-[11.5px] text-gray-500 mt-0.5 italic">{lp.notes}</div>}
                    </div>
                    <button onClick={() => unlinkProperty(lp.propertyId)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INVOICES TAB ── */}
        {tab === "invoices" && (
          <div>
            {invoices.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">🧾</div>
                <div className="text-[15px] font-bold text-gray-700">No Invoices Found</div>
                <div className="text-[12px] text-gray-400 mt-1">Invoices addressed to this contact will appear here.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Invoice #", "Description", "Type", "Issued", "Due", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-[12.5px] font-bold text-gray-900">{inv.invoiceNumber}</td>
                        <td className="px-5 py-3 text-[12.5px] text-gray-600 max-w-[180px] truncate">{inv.description}</td>
                        <td className="px-5 py-3 text-[11px] font-bold text-gray-500">{inv.type}</td>
                        <td className="px-5 py-3 text-[12px] text-gray-600">{new Date(inv.issuedAt).toLocaleDateString("en-GB")}</td>
                        <td className="px-5 py-3 text-[12px] text-gray-600">{new Date(inv.dueDate).toLocaleDateString("en-GB")}</td>
                        <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--navy)" }}>{formatCurrency(inv.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${INV_STATUS_COLOR[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {inv.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MEETINGS TAB ── */}
        {tab === "meetings" && (
          <div>
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="text-[12px] text-gray-500">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</div>
              <a href="/dashboard/crm/meetings"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>
                <Plus size={13} /> Schedule Meeting
              </a>
            </div>
            {meetings.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">📅</div>
                <div className="text-[15px] font-bold text-gray-700">No Meetings</div>
                <div className="text-[12px] text-gray-400 mt-1">Schedule a meeting and link it to this contact.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {meetings.map((m) => {
                  const STATUS_COLORS: Record<string, string> = {
                    SCHEDULED: "bg-blue-100 text-blue-700",
                    COMPLETED: "bg-emerald-100 text-emerald-700",
                    CANCELLED: "bg-red-100 text-red-600",
                    RESCHEDULED: "bg-yellow-100 text-yellow-700",
                  };
                  return (
                    <div key={m.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[14px] ${m.type === "VIRTUAL" ? "bg-blue-50" : "bg-orange-50"}`}>
                          {m.type === "VIRTUAL" ? "📹" : "📍"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-[13px] font-bold text-gray-900">{m.title}</div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status] ?? "bg-gray-100 text-gray-600"}`}>{m.status}</span>
                          </div>
                          <div className="text-[11.5px] text-gray-500 mt-0.5 flex items-center gap-2">
                            <Calendar size={10} />
                            {new Date(m.scheduledAt).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                            {" · "}
                            {new Date(m.scheduledAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            {" · "}{m.duration}min
                          </div>
                          {(m.location || m.meetingUrl) && (
                            <div className="text-[11.5px] text-gray-400 mt-0.5">{m.location ?? m.meetingUrl}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {tab === "tasks" && (
          <div>
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="text-[12px] text-gray-500">{tasks.length} task{tasks.length !== 1 ? "s" : ""} linked</div>
              <a href={`/dashboard/crm/tasks`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white" style={{ background: "var(--navy)" }}>
                <Plus size={13} /> Create in Tasks
              </a>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-[15px] font-bold text-gray-700">No Tasks Yet</div>
                <div className="text-[12px] text-gray-400 mt-1">Create a task in the Tasks module and link it to this contact.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tasks.map((t) => {
                  const isDone = t.status === "COMPLETED";
                  const isOverdue = !isDone && t.dueAt && new Date(t.dueAt) < new Date();
                  return (
                    <div key={t.id} className={`px-5 py-4 flex items-start gap-3 ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <div className={`mt-0.5 flex-shrink-0 ${isDone ? "text-emerald-500" : isOverdue ? "text-red-400" : "text-gray-300"}`}>
                        {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-bold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.type}</span>
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.priority}</span>
                          {t.dueAt && (
                            <span className={`flex items-center gap-1 text-[10.5px] font-semibold ${isOverdue ? "text-red-600" : "text-gray-400"}`}>
                              <Clock size={10} />
                              {new Date(t.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                              {isOverdue && " — OVERDUE"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FILES TAB ── */}
        {tab === "files" && (
          <div>
            {documents.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">📁</div>
                <div className="text-[15px] font-bold text-gray-700">No Files Yet</div>
                <div className="text-[12px] text-gray-400 mt-1">Documents attached to this contact from the Documents module will appear here.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">{doc.name}</div>
                      <div className="text-[11.5px] text-gray-400">{doc.type} · {doc.folder} · {new Date(doc.createdAt).toLocaleDateString("en-GB")}</div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11.5px] font-bold text-blue-600 hover:text-blue-800 flex-shrink-0">
                      Open <ChevronRight size={12} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {logModal && (
        <LogActivityModal contactId={contact.id} onClose={() => setLogModal(false)} onSaved={refreshActivities} />
      )}
      {aiMsgModal && (
        <AIMessageModal contact={contact} onClose={() => setAiMsgModal(false)} />
      )}
      {linkPropModal && (
        <LinkPropertyModal
          contactId={contact.id}
          allProperties={allProperties}
          linked={linkedProps.map((lp) => lp.propertyId)}
          onClose={() => setLinkPropModal(false)}
          onSaved={refreshProperties}
        />
      )}
    </div>
  );
}
