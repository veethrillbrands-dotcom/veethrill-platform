import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { BookOpen, Calendar, MapPin } from "lucide-react";

export default async function AgentTrainingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const trainings = await db.crmTrainingProgram.findMany({
    orderBy: { startDate: "asc" },
  });

  const upcoming = trainings.filter((t) => t.status === "Upcoming");
  const completed = trainings.filter((t) => t.status === "Completed");

  const STATUS_COLOR: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-700",
    Ongoing: "bg-orange-100 text-orange-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="Training Programs" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Programs", value: trainings.length, color: "var(--navy)" },
            { label: "Upcoming", value: upcoming.length, color: "#3B82F6" },
            { label: "Completed", value: completed.length, color: "var(--emerald)" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {trainings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📚</div>
            <div className="text-[15px] font-bold text-gray-700">No Training Programs</div>
            <div className="text-[12px] text-gray-400 mt-1">Upcoming training sessions will appear here.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {trainings.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--navy)18" }}>
                    <BookOpen size={18} style={{ color: "var(--navy)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-[14px] font-bold text-gray-900">{t.title}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status] ?? "bg-gray-100 text-gray-600"}`}>{t.status}</span>
                    </div>
                    <div className="text-[12px] text-gray-500 mt-1">Trainer: {t.trainer}</div>
                    {t.description && <div className="text-[12px] text-gray-500 mt-0.5">{t.description}</div>}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-[11.5px] text-gray-500">
                        <Calendar size={11} />
                        <span>{new Date(t.startDate).toLocaleDateString("en-GB")}{t.endDate ? ` → ${new Date(t.endDate).toLocaleDateString("en-GB")}` : ""}</span>
                      </div>
                      {t.venue && (
                        <div className="flex items-center gap-1 text-[11.5px] text-gray-500">
                          <MapPin size={11} />
                          <span>{t.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {t.capacity && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-gray-400">Capacity</div>
                      <div className="text-[14px] font-bold text-gray-700">{t.capacity}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
