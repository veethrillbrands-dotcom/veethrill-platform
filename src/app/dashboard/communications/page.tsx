"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { MessageSquare, Bell, Mail, Phone, Send, Users, CheckCheck, Clock, MessageCircle, PhoneCall, Trash2, X, Plus } from "lucide-react";

type Message = {
  id: string; subject: string; body: string; type: string; createdAt: string;
  sender: { id: string; firstName: string; lastName: string; role: string };
};

function initials(m: Message) {
  return `${m.sender.firstName[0]}${m.sender.lastName[0]}`.toUpperCase();
}
function displayName(m: Message) { return `${m.sender.firstName} ${m.sender.lastName}`; }
function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ComposeModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function send() {
    if (!form.subject || !form.body) return;
    setSending(true); setError("");
    const res = await fetch("/api/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: "DIRECT" }),
    });
    if (res.ok) { onSent(); onClose(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed to send"); setSending(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "var(--navy)" }}>
          <div className="text-[15px] font-bold text-white">New Message</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Subject</label>
            <input value={form.subject} onChange={(e) => set("subject", e.target.value)}
              placeholder="Message subject…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Message</label>
            <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={5}
              placeholder="Type your message…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-yellow-400 resize-none" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-700">{error}</div>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={send} disabled={sending || !form.subject || !form.body}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "var(--navy)" }}>
            <Send size={14} /> {sending ? "Sending…" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ANNOUNCEMENTS = [
  { id: 1, title: "Generator Maintenance — Lekki Gardens", body: "Scheduled maintenance on Saturday July 19th from 10AM–2PM. Generator will be offline. Apologies for any inconvenience.", sent: "Jul 14, 2026", recipients: 12, opened: 9 },
  { id: 2, title: "Rent Reminder — July 2026", body: "This is a reminder that July rent is due on the 1st. Please ensure payment is made via Paystack or bank transfer.", sent: "Jun 28, 2026", recipients: 5, opened: 5 },
  { id: 3, title: "Welcome to Veethrill Platform", body: "Dear tenant, welcome to our new digital property management platform. You can now pay rent, raise maintenance requests, and more.", sent: "Jun 1, 2026", recipients: 5, opened: 4 },
];

type Notif = { icon: string; text: string; time: string; color: string; severity: "critical" | "warning" | "info" };

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"inbox" | "announcements" | "notifications">("inbox");
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [composing, setComposing] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : [];
      setMessages(msgs);
      if (msgs.length > 0 && !selected) setSelected(msgs[0]);
    }
  }, []);

  const loadNotifs = useCallback(async () => {
    setNotifsLoading(true);
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifs(await res.json());
    setNotifsLoading(false);
  }, []);

  useEffect(() => { loadMessages(); loadNotifs(); }, [loadMessages, loadNotifs]);

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const unread = 0;
  const criticalCount = notifs.filter((n) => n.severity === "critical").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Communications" action={{ label: "New Message", onClick: () => setComposing(true) }} />
      {composing && <ComposeModal onClose={() => setComposing(false)} onSent={loadMessages} />}
      <div className="flex-1 overflow-hidden p-3 sm:p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1">
              {([
                { key: "inbox", label: "Inbox", count: unread },
                { key: "announcements", label: "Blast", count: null },
                { key: "notifications", label: "Alerts", count: criticalCount || null },
              ] as const).map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 ${tab === t.key ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={{ background: tab === t.key ? "var(--navy)" : "" }}>
                  {t.label}
                  {t.count ? <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{t.count}</span> : null}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Messages", value: messages.length, icon: <Mail size={13} />, color: "var(--gold)" },
                { label: "Total", value: messages.length, icon: <Users size={13} />, color: "var(--emerald)" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="text-[16px] font-black text-gray-900">{s.value}</div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Message List */}
            <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-y-auto">
              {tab === "inbox" && (messages.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px] text-gray-400">No messages yet. Click "New Message" to send one.</div>
              ) : messages.map((m) => (
                <div key={m.id} onClick={() => setSelected(m)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === m.id ? "bg-yellow-50 border-l-2 border-l-yellow-400" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                      {initials(m)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-gray-700 truncate">{displayName(m)}</span>
                        <span className="text-[10px] text-gray-400 ml-1 whitespace-nowrap">{relTime(m.createdAt)}</span>
                      </div>
                      <div className="text-[11px] truncate text-gray-500">{m.subject}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteMessage(m.id); }}
                      className="ml-1 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )))}


              {tab === "notifications" && (
                notifsLoading ? (
                  <div className="px-4 py-6 text-center text-[12px] text-gray-400">Loading alerts…</div>
                ) : notifs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[12px] text-gray-400">No active alerts — everything looks good!</div>
                ) : notifs.map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${n.color} flex items-center justify-center text-sm flex-shrink-0`}>{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-gray-900">{n.text}</div>
                        <div className="text-[10.5px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={9} /> {n.time}
                          {n.severity === "critical" && <span className="ml-2 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">CRITICAL</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {tab === "announcements" && ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <div className="text-[12.5px] font-bold text-gray-900 mb-0.5">{a.title}</div>
                  <div className="text-[11px] text-gray-500 truncate mb-1.5">{a.body}</div>
                  <div className="flex items-center gap-3 text-[10.5px] text-gray-400">
                    <span className="flex items-center gap-1"><Users size={10} /> {a.recipients} recipients</span>
                    <span className="flex items-center gap-1"><CheckCheck size={10} className="text-emerald-500" /> {a.opened} opened</span>
                    <span>{a.sent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-9 flex flex-col gap-3">
            {tab === "inbox" && selected && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-1 overflow-y-auto">
                  <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-black"
                        style={{ background: "linear-gradient(135deg, var(--gold), #b8960a)", color: "var(--navy)" }}>
                        {initials(selected)}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-gray-900">{displayName(selected)}</div>
                        <div className="text-[11.5px] text-gray-400">Re: {selected.subject}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {selected.sender.role}
                      </span>
                      <span className="text-[11px] text-gray-400">{relTime(selected.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[14px] font-bold text-gray-900 mb-3">{selected.subject}</h3>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{selected.body}</p>
                  </div>

                  {/* Suggested Replies */}
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-2">✦ AI Quick Replies</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Thank you for reaching out. We are looking into this.",
                        "Our maintenance team will be with you within 24 hours.",
                        "Payment confirmed. Thank you!",
                        "We will contact you shortly to arrange a meeting.",
                      ].map((s) => (
                        <button key={s} onClick={() => setReply(s)}
                          className="text-[11.5px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reply Box */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply to ${displayName(selected)}...`}
                    rows={3}
                    className="w-full text-[13px] text-gray-800 placeholder-gray-400 resize-none outline-none border-none bg-transparent"
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button className="text-[11.5px] text-gray-500 hover:text-gray-700 flex items-center gap-1"><Phone size={12} /> Call</button>
                      <button className="text-[11.5px] text-gray-500 hover:text-gray-700 flex items-center gap-1 ml-2"><Bell size={12} /> Notify</button>
                      <a href={`https://wa.me/?text=${encodeURIComponent(reply || `Hi ${selected.sender.firstName}, this is Veethrill Realty. `)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11.5px] text-green-600 hover:text-green-700 ml-2 font-semibold">
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    </div>
                    <button
                      onClick={() => setReply("")}
                      className="flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-xl text-white transition-colors"
                      style={{ background: "var(--navy)" }}>
                      <Send size={13} /> Send Reply
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "announcements" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1">
                <div className="max-w-xl">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">Send Announcement</h3>
                  <p className="text-[12px] text-gray-500 mb-5">Blast a message to all tenants, a specific property, or selected recipients.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Recipients</label>
                      <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-yellow-400">
                        <option>All Tenants (5)</option>
                        <option>Veethrill Towers Tenants (3)</option>
                        <option>Lekki Properties (2)</option>
                        <option>Abuja Heights Tenants (1)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Channel</label>
                      <div className="flex gap-2">
                        {["SMS", "Email", "In-App", "WhatsApp"].map((ch) => (
                          <button key={ch} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Subject</label>
                      <input placeholder="Announcement title..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-yellow-400" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Message</label>
                      <textarea rows={5} placeholder="Type your message..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] resize-none outline-none focus:border-yellow-400" />
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white"
                      style={{ background: "var(--navy)" }}>
                      <Send size={14} /> Send Announcement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === "notifications" && (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader>
                  <div>
                    <CardTitle sub={`${notifs.length} active alerts from your portfolio`}>Notification Centre</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] text-gray-500">{criticalCount} critical · {notifs.filter((n) => n.severity === "warning").length} warnings</div>
                    <button onClick={loadNotifs} className="text-[11.5px] font-semibold text-gray-500 hover:text-gray-700">Refresh</button>
                  </div>
                </CardHeader>
                <CardBody className="overflow-y-auto flex-1">
                  {notifsLoading ? (
                    <div className="text-center text-gray-400 py-8 text-[13px]">Loading alerts…</div>
                  ) : notifs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">✅</div>
                      <div className="text-[14px] font-bold text-gray-700">All clear!</div>
                      <div className="text-[12px] text-gray-400 mt-1">No overdue payments, expiring leases, or urgent work orders.</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifs.map((n, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${n.color}`}>
                          <span className="text-xl flex-shrink-0">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-gray-900">{n.text}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                              <Clock size={10} /> {n.time}
                              {n.severity === "critical" && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">CRITICAL</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
