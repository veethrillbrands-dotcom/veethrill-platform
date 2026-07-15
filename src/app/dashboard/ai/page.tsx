"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Sparkles, TrendingUp, Wrench, FileText, Home, Send, Bot } from "lucide-react";

const AI_MODULES = [
  { icon: Home, label: "✦ AI Leasing", title: "Smart Leasing Assistant", sub: "Vacancy prediction, pricing optimisation, applicant scoring", color: "var(--gold)", insights: ["📊 Unit 8C, Lekki — repricing to ₦165k reduces vacancy by 34 days", "⭐ Top applicant for Unit 2A: 98% creditworthiness score", "🏠 3 units approaching 60-day vacancy threshold — action required"] },
  { icon: Wrench, label: "✦ AI Maintenance", title: "Predictive Maintenance Engine", sub: "Failure forecasting, vendor matching, priority triage", color: "var(--emerald)", insights: ["🔧 PH generator: 94% failure probability within 45 days", "💰 Proactive service saves ₦340,000 vs emergency repair cost", "📋 Veethrill Towers AC units due for annual filter replacement"] },
  { icon: TrendingUp, label: "✦ AI Finance", title: "Revenue & Risk Forecasting", sub: "Cash flow prediction, delinquency risk scoring", color: "#8B5CF6", insights: ["📈 August forecast: ₦51.4M (+6.6% MoM) — confidence 87%", "⚠️ 2 tenants flagged high-risk for non-payment next cycle", "💡 Auto-reminders could improve collection rate by 4.2%"] },
  { icon: FileText, label: "✦ AI Documents", title: "Smart Contract Intelligence", sub: "Lease extraction, clause analysis, compliance flagging", color: "#3B82F6", insights: ["📄 5 leases missing force majeure clause — auto-fix available", "🔍 Deposit terms inconsistent across 3 units — review suggested", "✅ All active leases comply with Lagos State tenancy law"] },
];

const INITIAL_MESSAGES = [
  { role: "ai" as const, text: "Hello! I'm your Veethrill AI assistant. I can analyse your portfolio, predict vacancies, review leases, flag maintenance risks, and generate reports. What would you like to know today?" },
];

const SUGGESTIONS = [
  "Which property has the highest vacancy risk?",
  "Show me overdue rent summary",
  "What maintenance should I prioritise?",
  "Forecast revenue for next month",
  "Which tenants are likely to renew?",
  "Analyse my expense breakdown",
];

const AI_RESPONSES: Record<string, string> = {
  "vacancy": "Based on current data, **Lekki Gardens Phase 3** has the highest vacancy risk — Block C-3 has been vacant for 18 days and no applications are in pipeline. I recommend repricing from ₦380k to ₦355k and promoting on PropertyPro. Also monitor **Ikoyi Residences Villa B** (vacant, premium pricing may need review).",
  "overdue": "You have **2 overdue rent payments** totalling ₦1,060,000:\n\n• Emeka Bello — Unit 5B, Veethrill Towers — ₦260,000 (45 days overdue)\n• Tunde Fashola — PH1, Abuja Heights — ₦800,000 (14 days overdue)\n\nI recommend sending an SMS reminder to Tunde immediately and initiating the formal notice process for Emeka.",
  "maintenance": "Priority maintenance actions this week:\n\n🔴 **URGENT**: AC failure Unit 4B (Veethrill Towers) — tenant comfort affected, SLA at risk\n🟠 **HIGH**: Smart TV Suite 2B (Shortlet) — guest experience impacted, book technician today\n🟡 **HIGH**: Pool pump Villa A (Ikoyi) — estimated ₦280k repair, get 3 quotes\n\nTotal estimated maintenance spend: ₦745,000",
  "revenue": "**August 2026 Revenue Forecast**\n\nProjected: ₦51.4M (+6.6% vs July)\nConfidence: 87%\n\nKey drivers:\n• 2 new lease activations expected\n• Shortlet season peak (Lagos August demand)\n• Overdue collections from Emeka + Tunde\n\nRisk factors: Tunde non-payment (-₦800k), Block C-3 continued vacancy (-₦380k)",
  "renew": "Lease renewal analysis for active tenants:\n\n🟢 **High probability (>80%)**: Ngozi Adeyemi (GTBank), Fatima Abubakar (FBN) — stable employment, no complaints\n🟡 **Medium (50-80%)**: Chidi Okafor — good payment history but lease expires Jul 31, no response yet\n🔴 **Low (<50%)**: Emeka Bello — payment issues, consider proactive outreach",
  "expense": "**July 2026 Expense Analysis**\n\nTotal: ₦1,160,000\n• Maintenance: ₦345k (30%) — above target\n• Payroll: ₦420k (36%) — on target\n• Insurance: ₦350k (30%) — annual premium\n• Technology: ₦45k (4%) — platform subscriptions\n\n💡 Maintenance is running 18% over budget. Consider a preventive maintenance contract with a single vendor to reduce emergency call-out costs.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("vacanc")) return AI_RESPONSES["vacancy"];
  if (lower.includes("overdue") || lower.includes("rent")) return AI_RESPONSES["overdue"];
  if (lower.includes("maintenanc") || lower.includes("priorit")) return AI_RESPONSES["maintenance"];
  if (lower.includes("revenue") || lower.includes("forecast") || lower.includes("next month")) return AI_RESPONSES["revenue"];
  if (lower.includes("renew")) return AI_RESPONSES["renew"];
  if (lower.includes("expense") || lower.includes("breakdown") || lower.includes("cost")) return AI_RESPONSES["expense"];
  return "I've analysed your portfolio data. Could you be more specific? You can ask about vacancies, overdue rent, maintenance priorities, revenue forecasts, lease renewals, or expense breakdowns.";
}

export default function AIPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send(text?: string) {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    setMessages((m) => [...m, { role: "user" as const, text: msg }]);
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai" as const, text: getAIResponse(msg) }]);
      setThinking(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="AI Intelligence" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3555 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "var(--gold)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{ background: "var(--emerald)", transform: "translate(-30%, 30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: "var(--gold)" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Veethrill Intelligence · Powered by Claude AI</span>
            </div>
            <h2 className="text-[22px] font-black text-white mb-2">AI-Powered Property Management</h2>
            <p className="text-[13px] text-white/60 max-w-lg">Real-time insights, predictive analytics, and intelligent automation across your entire portfolio.</p>
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { v: "87%", l: "Forecast Accuracy" },
                { v: "₦340k", l: "Savings Identified" },
                { v: "4.2%", l: "Collection Uplift" },
                { v: "34 days", l: "Leasing Time Saved" },
              ].map((s) => (
                <div key={s.l} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-[18px] font-black" style={{ color: "var(--gold)" }}>{s.v}</div>
                  <div className="text-[10px] text-white/60 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Modules */}
        <div className="grid grid-cols-2 gap-4">
          {AI_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.title} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3555 100%)" }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: mod.color, transform: "translate(30%, -30%)" }} />
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} style={{ color: mod.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: mod.color }}>{mod.label}</span>
                </div>
                <h3 className="text-[15px] font-bold text-white mb-1">{mod.title}</h3>
                <p className="text-[11.5px] text-white/60 mb-4">{mod.sub}</p>
                <div className="space-y-2">
                  {mod.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/7 rounded-xl px-3 py-2 text-[11.5px] text-white/85">{insight}</div>
                  ))}
                </div>
                <button onClick={() => send(`Tell me more about ${mod.title.toLowerCase()}`)}
                  className="mt-4 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: mod.color, color: "var(--navy)" }}>
                  Ask AI →
                </button>
              </div>
            );
          })}
        </div>

        {/* AI Chat */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--navy)" }}>
                <Bot size={14} style={{ color: "var(--gold)" }} />
              </div>
              <CardTitle sub="Powered by Claude AI · Knows your portfolio">Veethrill AI Chat</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-600">Online</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3 h-64 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${m.role === "ai" ? "" : "rounded-full bg-yellow-100 text-yellow-700"}`}
                    style={m.role === "ai" ? { background: "var(--navy)" } : {}}>
                    {m.role === "ai" ? <Sparkles size={12} style={{ color: "var(--gold)" }} /> : "AO"}
                  </div>
                  <div className={`rounded-xl px-3 py-2 text-[12.5px] max-w-[80%] shadow-sm whitespace-pre-line ${m.role === "ai" ? "bg-white border border-gray-100 text-gray-800" : "text-white"}`}
                    style={m.role === "user" ? { background: "var(--navy)" } : {}}
                    dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </div>
              ))}
              {thinking && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--navy)" }}>
                    <Sparkles size={12} style={{ color: "var(--gold)" }} />
                  </div>
                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[12.5px] outline-none focus:border-yellow-400"
                placeholder="Ask about occupancy, revenue, maintenance, leases…" />
              <button onClick={() => send()} className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold flex items-center gap-1.5"
                style={{ background: "var(--gold)", color: "var(--navy)" }}>
                <Send size={13} /> Send
              </button>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
