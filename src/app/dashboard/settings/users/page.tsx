"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
  UserPlus, Mail, Shield, RefreshCw, X, Check,
  ChevronDown, Search, Users, AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PlatformUser = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar: string | null;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = [
  { value: "SUPER_ADMIN",        label: "Super Admin",        desc: "Full platform access",                   color: "#7C3AED" },
  { value: "COMPANY_ADMIN",      label: "Company Admin",      desc: "Admin dashboard, no super controls",     color: "#1D4ED8" },
  { value: "PROPERTY_MANAGER",   label: "Property Manager",   desc: "Admin dashboard, operations access",     color: "#0369A1" },
  { value: "AGENT",              label: "Agent",              desc: "Agent portal — CRM, pipeline, training", color: "#0F766E" },
  { value: "TENANT",             label: "Tenant",             desc: "Tenant portal — lease, payments",        color: "#1E8E5A" },
  { value: "OWNER",              label: "Owner / Developer",  desc: "Owner portal — properties, revenue",     color: "#D97706" },
  { value: "VENDOR",             label: "Vendor",             desc: "Vendor portal — work orders, invoices",  color: "#EA580C" },
  { value: "GUEST",              label: "Guest",              desc: "Guest portal — shortlet bookings",       color: "#DB2777" },
  { value: "MAINTENANCE_STAFF",  label: "Maintenance Staff",  desc: "Staff portal — inspections, tasks",      color: "#64748B" },
];

const ROLE_PORTAL: Record<string, string> = {
  SUPER_ADMIN: "/dashboard",
  COMPANY_ADMIN: "/dashboard",
  PROPERTY_MANAGER: "/dashboard",
  AGENT: "/portal/agent",
  TENANT: "/portal/tenant",
  OWNER: "/portal/owner",
  VENDOR: "/portal/vendor",
  GUEST: "/portal/guest",
  MAINTENANCE_STAFF: "/portal/staff",
};

function roleMeta(role: string) {
  return ROLES.find((r) => r.value === role) ?? { label: role, color: "#64748B", desc: "" };
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const meta = roleMeta(role);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold text-white"
      style={{ background: meta.color }}>
      {meta.label}
    </span>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TENANT");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function send() {
    if (!email.trim() || !role) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invitation");
      setSuccess(true);
      setTimeout(() => { onDone(); onClose(); }, 1800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setSending(false);
  }

  const selected = roleMeta(role);
  const portal = ROLE_PORTAL[role] ?? "/portal/tenant";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
          <div>
            <div className="text-[15px] font-black text-white">Invite User</div>
            <div className="text-[11px] text-white/50 mt-0.5">Role is set before the invite goes out</div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600" />
              </div>
              <div className="text-[15px] font-bold text-gray-900">Invitation Sent!</div>
              <div className="text-[12.5px] text-gray-500 mt-1">{email} will receive an email to join as <strong>{selected.label}</strong>.</div>
            </div>
          ) : (
            <>
              {/* Email */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="user@example.com"
                    type="email"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Assign Role <span className="text-yellow-500">← set this first</span>
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-[13px] font-semibold outline-none focus:border-yellow-400 appearance-none transition-colors"
                    style={{ color: selected.color }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Role preview */}
                <div className="mt-2 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
                      style={{ background: selected.color }}>
                      {selected.label.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[12.5px] font-bold text-gray-900">{selected.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{selected.desc}</div>
                      <div className="text-[10.5px] text-gray-400 mt-1">
                        Portal: <span className="font-mono font-semibold text-gray-600">{portal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px]">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={send} disabled={!email.trim() || sending}
                  className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: "var(--navy)" }}>
                  {sending ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {sending ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({ user, onClose, onDone }: { user: PlatformUser; onClose: () => void; onDone: () => void }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (role === user.role) { onClose(); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetClerkId: user.clerkId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setSaving(false);
  }

  const selected = roleMeta(role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
          <div>
            <div className="text-[15px] font-black text-white">Change Role</div>
            <div className="text-[11px] text-white/50 mt-0.5">{user.firstName} {user.lastName}</div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">New Role</label>
            <div className="relative">
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-[13px] font-semibold outline-none focus:border-yellow-400 appearance-none"
                style={{ color: selected.color }}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="mt-2 text-[11px] text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              ⚠ This updates Clerk + DB immediately. The user will see the new portal on their next login.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px]">{error}</div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "var(--navy)" }}>
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Saving…" : "Update Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [inviting, setInviting] = useState(false);
  const [changingRole, setChangingRole] = useState<PlatformUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r.value] = users.filter((u) => u.role === r.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="User Management" />

      <div className="flex-1 p-4 sm:p-6 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[15px] font-black text-gray-900">Platform Users</div>
            <div className="text-[12.5px] text-gray-500 mt-0.5">{users.length} users · Invite with role pre-assigned</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setInviting(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: "var(--navy)" }}>
              <UserPlus size={14} /> Invite User
            </button>
          </div>
        </div>

        {/* Role summary chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterRole("ALL")}
            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold border transition-all ${filterRole === "ALL" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"}`}>
            All ({users.length})
          </button>
          {ROLES.filter((r) => roleCounts[r.value] > 0).map((r) => (
            <button key={r.value} onClick={() => setFilterRole(r.value)}
              className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold border transition-all ${filterRole === r.value ? "text-white border-transparent" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
              style={filterRole === r.value ? { background: r.color } : {}}>
              {r.label} ({roleCounts[r.value]})
            </button>
          ))}
        </div>

        {/* Search + table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-[13px] outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-[13px]">
              <RefreshCw size={20} className="animate-spin mx-auto mb-3 text-gray-300" />
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={28} className="mx-auto mb-3 text-gray-200" />
              <div className="text-[13px] font-semibold text-gray-500">No users found</div>
              <button onClick={() => setInviting(true)}
                className="mt-3 text-[12px] font-bold underline underline-offset-2"
                style={{ color: "var(--gold)" }}>
                Invite your first user →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || u.email[0].toUpperCase();
                    const meta = roleMeta(u.role);
                    return (
                      <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                              style={{ background: meta.color }}>
                              {initials}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[12.5px] text-gray-600">{u.email}</td>
                        <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-3">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => setChangingRole(u)}
                            className="flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-900 transition-all">
                            <Shield size={11} /> Change Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How it works box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-[12.5px] text-blue-800">
          <div className="font-bold mb-1 flex items-center gap-1.5"><Shield size={13} /> How role-based invitations work</div>
          <ol className="space-y-0.5 text-[12px] list-decimal list-inside text-blue-700">
            <li>Click <strong>Invite User</strong>, enter their email, and select their role.</li>
            <li>They receive an invitation email with a sign-up link.</li>
            <li>When they sign up, their role is automatically applied from the invite.</li>
            <li>They are immediately redirected to their correct portal — no manual setup needed.</li>
          </ol>
        </div>

      </div>

      {inviting && <InviteModal onClose={() => setInviting(false)} onDone={load} />}
      {changingRole && <ChangeRoleModal user={changingRole} onClose={() => setChangingRole(null)} onDone={load} />}
    </div>
  );
}
