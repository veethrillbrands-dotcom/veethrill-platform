"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
  Sparkles, Send, Bot, User, Copy, CheckCheck,
  Home, Wrench, TrendingUp, FileText, Users, MessageCircle,
  CalendarDays, AlertTriangle, RefreshCw, Lightbulb,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = { role: "ai" | "user"; text: string; ts: number };
type Insight = { priority: number; category: string; headline: string; detail: string; action: string };

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: AlertTriangle, label: "Overdue rent summary",      text: "Give me a summary of all overdue rent payments and recommend next steps for each." },
  { icon: Home,          label: "Vacancy risk analysis",     text: "Which properties or units have the highest vacancy risk and what should I do?" },
  { icon: Wrench,        label: "Maintenance priorities",    text: "What maintenance should I prioritise this week and what's the estimated cost impact?" },
  { icon: TrendingUp,    label: "Revenue forecast",          text: "Forecast revenue for the next 30 days based on current data." },
  { icon: FileText,      label: "Lease renewals",            text: "Which leases are expiring soon? Draft renewal outreach messages for each tenant." },
  { icon: Users,         label: "CRM next steps",            text: "Which CRM deals need attention? What are the recommended next actions for each?" },
  { icon: MessageCircle, label: "Draft tenant message",      text: "Draft a WhatsApp message to remind a tenant about overdue rent — warm but firm." },
  { icon: CalendarDays,  label: "Meeting agenda",            text: "Help me prepare a meeting agenda for a property owner discussion about portfolio performance." },
];

const AI_MODULES = [
  { icon: Home,       label: "AI Leasing",     color: "var(--gold)",    desc: "Vacancy prediction, pricing optimisation, applicant scoring" },
  { icon: Wrench,     label: "AI Maintenance", color: "var(--emerald)", desc: "Failure forecasting, vendor matching, priority triage" },
  { icon: TrendingUp, label: "AI Finance",     color: "#8B5CF6",        desc: "Cash flow prediction, delinquency risk scoring" },
  { icon: FileText,   label: "AI Contracts",   color: "#3B82F6",        desc: "Lease extraction, clause analysis, compliance flagging" },
];

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === "ai";

  function copy() {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Convert **bold** markdown and newlines
  function format(text: string) {
    return text
      .split("\n")
      .map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
            {i < text.split("\n").length - 1 && <br />}
          </span>
        );
      });
  }

  return (
    <div className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isAI ? "text-white" : "bg-gray-100"}`}
        style={isAI ? { background: "linear-gradient(135deg, var(--navy), var(--navy-mid))" } : {}}>
        {isAI ? <Bot size={15} className="text-white" /> : <User size={15} className="text-gray-600" />}
      </div>

      <div className={`max-w-[80%] ${isAI ? "" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${isAI
          ? "bg-white border border-gray-100 shadow-sm text-gray-800"
          : "text-white"}`}
          style={!isAI ? { background: "var(--navy)" } : {}}>
          {format(msg.text)}
        </div>
        {isAI && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <span className="text-[10.5px] text-gray-400">
              {new Date(msg.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button onClick={copy} className="flex items-center gap-1 text-[10.5px] text-gray-400 hover:text-gray-600 transition-colors">
              {copied ? <CheckCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I'm your Veethrill AI assistant, powered by Claude.\n\nI have real-time access to your portfolio data — properties, tenants, leases, payments, maintenance, CRM deals, tasks, and more. Ask me anything about your business or request specific drafts (messages, agendas, reports).\n\nWhat would you like to work on today?",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const loadInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dashboard_insights" }),
      });
      const data = await res.json();
      if (data.error?.includes("not configured")) setAiAvailable(false);
      setInsights(data.insights ?? []);
    } catch { /* ignore */ }
    setLoadingInsights(false);
  }, []);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  async function send(text?: string) {
    const msg = text ?? input;
    if (!msg.trim() || thinking) return;
    setInput("");

    const userMsg: Message = { role: "user", text: msg, ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, text: m.text })) }),
      });
      const data = await res.json();
      if (data.error?.includes("not configured")) {
        setAiAvailable(false);
        setMessages((prev) => [...prev, {
          role: "ai",
          text: "⚠️ AI is not yet configured. Please add your ANTHROPIC_API_KEY to the environment variables to enable real AI responses.",
          ts: Date.now(),
        }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.text ?? "I could not generate a response.", ts: Date.now() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Network error. Please try again.", ts: Date.now() }]);
    }
    setThinking(false);
  }

  const SEVERITY_CLASS: Record<string, string> = {
    "RENT": "bg-red-50 border-red-200 text-red-700",
    "LEASE": "bg-orange-50 border-orange-200 text-orange-700",
    "MAINTENANCE": "bg-yellow-50 border-yellow-200 text-yellow-700",
    "FINANCE": "bg-purple-50 border-purple-200 text-purple-700",
    "CRM": "bg-blue-50 border-blue-200 text-blue-700",
    "INSPECTION": "bg-teal-50 border-teal-200 text-teal-700",
    "DEAL": "bg-indigo-50 border-indigo-200 text-indigo-700",
    "TASK": "bg-gray-50 border-gray-200 text-gray-600",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="AI Intelligence" />

      <div className="flex-1 overflow-hidden flex gap-0">

        {/* ── Left: Chat ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-gray-100">
          {/* Hero strip */}
          <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gold)" }}>
              <Sparkles size={18} style={{ color: "var(--navy)" }} />
            </div>
            <div>
              <div className="text-[13px] font-black text-white">Veethrill Intelligence</div>
              <div className="text-[10.5px] text-white/50">Powered by Claude AI · Live portfolio context</div>
            </div>
            {!aiAvailable && (
              <div className="ml-auto bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-1.5 text-[10.5px] font-bold text-red-300">
                ⚠ ANTHROPIC_API_KEY not set
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0">
            {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
              <button key={label} onClick={() => send(text)}
                className="flex-shrink-0 flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-yellow-50 hover:text-yellow-800 border border-gray-200 hover:border-yellow-300 text-gray-600 transition-all">
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "var(--navy)" }}>
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--navy)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                    <span className="text-[11.5px] text-gray-400 ml-1">Analysing your portfolio…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask anything about your portfolio, tenants, deals, or request drafts…"
                rows={2}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-[13px] outline-none resize-none focus:border-yellow-400 transition-colors"
              />
              <button onClick={() => send()} disabled={!input.trim() || thinking}
                className="w-12 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                style={{ background: "var(--navy)" }}>
                <Send size={16} />
              </button>
            </div>
            <div className="text-[10.5px] text-gray-400 mt-1.5 text-center">Shift+Enter for new line · Enter to send</div>
          </div>
        </div>

        {/* ── Right: Insights panel ────────────────────────────── */}
        <div className="w-72 flex-shrink-0 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {/* AI Modules */}
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 mb-2">AI Capabilities</div>
            <div className="space-y-2">
              {AI_MODULES.map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold text-gray-900">{label}</div>
                    <div className="text-[10.5px] text-gray-400 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Business Insights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400">Priority Actions</div>
              <button onClick={loadInsights} disabled={loadingInsights}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <RefreshCw size={12} className={loadingInsights ? "animate-spin" : ""} />
              </button>
            </div>

            {!aiAvailable ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-[11.5px] text-yellow-800">
                Add ANTHROPIC_API_KEY to enable live AI insights.
              </div>
            ) : loadingInsights ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center text-[11.5px] text-gray-400">
                <Lightbulb size={20} className="mx-auto mb-2 text-gray-300" />
                No critical actions found — things look good!
              </div>
            ) : (
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className={`bg-white rounded-xl border p-3 ${SEVERITY_CLASS[ins.category] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-black">{ins.category}</span>
                      <span className="text-[9px] font-bold opacity-60">#{ins.priority}</span>
                    </div>
                    <div className="text-[12px] font-bold mb-0.5">{ins.headline}</div>
                    <div className="text-[10.5px] opacity-80 mb-1.5">{ins.detail}</div>
                    <button onClick={() => send(`Give me specific details and a step-by-step action plan for: ${ins.headline}`)}
                      className="text-[10px] font-bold underline underline-offset-2 opacity-70 hover:opacity-100">
                      → {ins.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
