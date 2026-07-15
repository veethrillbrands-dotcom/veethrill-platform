import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Sparkles, TrendingUp, Wrench, FileText, Home } from "lucide-react";

const AI_MODULES = [
  {
    icon: Home,
    label: "✦ AI Leasing",
    title: "Smart Leasing Assistant",
    sub: "Vacancy prediction, pricing optimization, applicant scoring",
    color: "var(--gold)",
    insights: [
      "📊 Unit 8C, Lekki — repricing from ₦180k to ₦165k reduces vacancy by 34 days",
      "⭐ Top applicant for Unit 2A: 98% creditworthiness score",
      "🏠 3 units approaching 60-day vacancy threshold — action recommended",
    ],
  },
  {
    icon: Wrench,
    label: "✦ AI Maintenance",
    title: "Predictive Maintenance Engine",
    sub: "Failure forecasting, vendor matching, priority triage",
    color: "var(--emerald)",
    insights: [
      "🔧 PH Waterfront generator: 94% failure probability within 45 days",
      "💰 Proactive service now saves ₦340,000 vs emergency repair",
      "📋 AC units in Veethrill Towers due for annual filter replacement",
    ],
  },
  {
    icon: TrendingUp,
    label: "✦ AI Finance",
    title: "Revenue & Risk Forecasting",
    sub: "Cash flow prediction, delinquency risk scoring",
    color: "#8B5CF6",
    insights: [
      "📈 July forecast: ₦51.4M (+6.6% MoM) — confidence 87%",
      "⚠️ 3 tenants flagged high-risk for non-payment next cycle",
      "💡 Enabling auto-reminders could improve collection rate by 4.2%",
    ],
  },
  {
    icon: FileText,
    label: "✦ AI Documents",
    title: "Smart Contract Intelligence",
    sub: "Lease extraction, clause analysis, compliance flagging",
    color: "#3B82F6",
    insights: [
      "📄 14 leases missing force majeure clause — auto-fix available",
      "🔍 Deposit terms inconsistent across 8 units — review suggested",
      "✅ 298 leases fully compliant with Lagos State tenancy law",
    ],
  },
];

export default function AIPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="AI Intelligence" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{ background: "var(--gold)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{ background: "var(--emerald)", transform: "translate(-30%, 30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: "var(--gold)" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Veethrill Intelligence</span>
            </div>
            <h2 className="text-[22px] font-black text-white mb-2">AI-Powered Property Management</h2>
            <p className="text-[13px] text-white/60 max-w-lg">
              Real-time insights, predictive analytics, and intelligent automation across your entire portfolio. Powered by GPT-4o.
            </p>
            <div className="flex gap-3 mt-5">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold"
                style={{ background: "var(--gold)", color: "var(--navy)" }}>
                <Sparkles size={13} /> Chat with AI
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors">
                View AI Reports
              </button>
            </div>
          </div>
        </div>

        {/* AI Modules Grid */}
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
                    <div key={i} className="flex items-start gap-2 bg-white/7 rounded-xl px-3 py-2 text-[11.5px] text-white/85">
                      {insight}
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: mod.color, color: "var(--navy)" }}>
                  Explore Module →
                </button>
              </div>
            );
          })}
        </div>

        {/* AI Chat */}
        <Card>
          <CardHeader>
            <CardTitle sub="Ask anything about your portfolio">AI Chat Assistant</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="bg-gray-50 rounded-xl p-4 mb-3 space-y-3 max-h-48 overflow-y-auto">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background: "var(--navy)" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} />
                </div>
                <div className="bg-white rounded-xl px-3 py-2 text-[12.5px] text-gray-800 max-w-[80%] shadow-sm border border-gray-100">
                  Hello! I'm your Veethrill AI assistant. I can help you analyze your portfolio, predict vacancies, review leases, and more. What would you like to know today?
                </div>
              </div>
              <div className="flex items-start gap-2.5 flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 flex-shrink-0">AO</div>
                <div className="rounded-xl px-3 py-2 text-[12.5px] text-white max-w-[80%]" style={{ background: "var(--navy)" }}>
                  Which property has the highest vacancy risk this month?
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background: "var(--navy)" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} />
                </div>
                <div className="bg-white rounded-xl px-3 py-2 text-[12.5px] text-gray-800 max-w-[80%] shadow-sm border border-gray-100">
                  Based on current data, <strong>Ikoyi Pearl Court</strong> has the highest vacancy risk — it's at 83% occupancy with 2 leases expiring in 45 days and no renewal discussions logged. I recommend pricing Unit 8A at ₦520k/mo (down from ₦580k) to accelerate leasing.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[12.5px] outline-none focus:border-yellow-400 transition-colors"
                placeholder="Ask about occupancy, revenue, maintenance, leases…"
              />
              <button className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold flex-shrink-0" style={{ background: "var(--gold)", color: "var(--navy)" }}>
                Send
              </button>
            </div>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {["Vacancy forecast", "Revenue summary", "Overdue rents", "Maintenance cost analysis"].map((q) => (
                <button key={q} className="text-[11px] font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
