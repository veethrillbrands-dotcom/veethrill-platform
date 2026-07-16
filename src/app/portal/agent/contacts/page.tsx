import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { Phone, Mail, MessageCircle, Users } from "lucide-react";

export default async function AgentContactsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const contacts = await db.crmContact.findMany({
    where: { createdByUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const TYPE_COLORS: Record<string, string> = {
    Prospect: "bg-blue-100 text-blue-700",
    Client: "bg-emerald-100 text-emerald-700",
    Developer: "bg-purple-100 text-purple-700",
    Agent: "bg-yellow-100 text-yellow-700",
    HNI: "bg-red-100 text-red-700",
  };

  const byType = contacts.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PortalTopbar title="My Contacts" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: contacts.length, color: "var(--navy)" },
            { label: "Prospects", value: byType["Prospect"] ?? 0, color: "#3B82F6" },
            { label: "Clients", value: byType["Client"] ?? 0, color: "var(--emerald)" },
            { label: "HNI", value: byType["HNI"] ?? 0, color: "#EF4444" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[20px] font-black" style={{ color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <div className="font-bold text-gray-900 text-[14px]">All Contacts ({contacts.length})</div>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👥</div>
              <div className="text-[15px] font-bold text-gray-700">No Contacts Yet</div>
              <div className="text-[12px] text-gray-400 mt-1">Contacts you add will appear here.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Name", "Type", "Phone", "Email", "Actions"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 group">
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-gray-900">{c.name}</div>
                        {c.company && <div className="text-[11px] text-gray-400">{c.company}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600"}`}>{c.type}</span>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{c.phone ?? "—"}</td>
                      <td className="px-5 py-3 text-[12px] text-gray-600">{c.email ?? "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.phone && (
                            <>
                              <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center" title="Call">
                                <Phone size={11} className="text-blue-600" />
                              </a>
                              <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${c.name.split(" ")[0]}, this is ${user.firstName} from Veethrill Realty.`)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center" title="WhatsApp">
                                <MessageCircle size={11} className="text-green-600" />
                              </a>
                            </>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center" title="Email">
                              <Mail size={11} className="text-purple-600" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
