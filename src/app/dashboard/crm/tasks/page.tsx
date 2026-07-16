"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
  Plus, X, CheckCircle2, Circle, Clock, AlertTriangle, Tag,
  Phone, Mail, MessageCircle, Briefcase, Building2, Users,
  CalendarDays, Trash2, ChevronDown, Filter,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Task = {
  id: string; title: string; description: string | null; type: string;
  status: string; priority: string; dueAt: string | null; completedAt: string | null;
  tags: string[]; notes: string | null;
  assignedToName: string | null;
  contact: { id: string; name: string; type: string } | null;
  deal: { id: string; title: string; stage: string } | null;
  property: { id: string; name: string; city: string } | null;
  createdAt: string;
};

type ContactOption = { id: string; name: string; type: string };
type DealOption = { id: string; title: string; stage: string };
type PropertyOption = { id: string; name: string; city: string };

// ─── Constants ───────────────────────────────────────────────────────────────

const TASK_TYPES = [
  { key: "TASK", label: "Task", icon: CheckCircle2, color: "#6B7280" },
  { key: "CALL", label: "Call", icon: Phone, color: "#3B82F6" },
  { key: "EMAIL", label: "Email", icon: Mail, color: "#8B5CF6" },
  { key: "FOLLOW_UP", label: "Follow-up", icon: MessageCircle, color: "#10B981" },
  { key: "MEETING", label: "Meeting", icon: Users, color: "#F59E0B" },
  { key: "REMINDER", label: "Reminder", icon: Clock, color: "#EF4444" },
  { key: "SITE_VISIT", label: "Site Visit", icon: Building2, color: "#0EA5E9" },
  { key: "INSPECTION", label: "Inspection", icon: Briefcase, color: "#A855F7" },
];

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  URGENT: { label: "Urgent", color: "#EF4444", bg: "bg-red-100 text-red-700" },
  HIGH:   { label: "High",   color: "#F59E0B", bg: "bg-orange-100 text-orange-700" },
  MEDIUM: { label: "Medium", color: "#3B82F6", bg: "bg-blue-100 text-blue-700" },
  LOW:    { label: "Low",    color: "#10B981", bg: "bg-gray-100 text-gray-600" },
};

function urgencyClass(task: Task) {
  if (task.status === "COMPLETED" || task.status === "CANCELLED") return "completed";
  if (!task.dueAt) return "no-due";
  const diff = new Date(task.dueAt).getTime() - Date.now();
  if (diff < 0) return "overdue";
  if (diff < 3 * 60 * 60 * 1000) return "due-soon"; // within 3h
  if (diff < 24 * 60 * 60 * 1000) return "due-today";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "due-week";
  return "future";
}

const URGENCY_BADGE: Record<string, { label: string; class: string }> = {
  overdue:   { label: "OVERDUE",     class: "bg-red-100 text-red-700" },
  "due-soon": { label: "DUE SOON",   class: "bg-red-50 text-red-600" },
  "due-today": { label: "DUE TODAY", class: "bg-orange-100 text-orange-700" },
  "due-week":  { label: "THIS WEEK", class: "bg-yellow-100 text-yellow-700" },
  future:    { label: "",            class: "" },
  "no-due":  { label: "",            class: "" },
  completed: { label: "",            class: "" },
};

// ─── Create Task Modal ────────────────────────────────────────────────────────

function CreateTaskModal({
  contacts, deals, properties, onClose, onCreated,
}: {
  contacts: ContactOption[]; deals: DealOption[]; properties: PropertyOption[];
  onClose: () => void; onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", type: "TASK", priority: "MEDIUM",
    dueAt: "", contactId: "", dealId: "", propertyId: "",
    assignedToName: "", tags: [] as string[], notes: "",
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      set("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  async function save() {
    if (!form.title) return;
    setSaving(true);
    await fetch("/api/crm/tasks", {
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
          <div className="text-[15px] font-bold text-white">Create Task / Reminder</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="label-xs">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Follow up with Chidi about 3-bed apartment"
              className="field" />
          </div>

          {/* Type buttons */}
          <div>
            <label className="label-xs">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TASK_TYPES.map(({ key, label, icon: Icon, color }) => (
                <button key={key} type="button" onClick={() => set("type", key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-[11.5px] font-bold transition-all ${form.type === key ? "border-yellow-400 bg-yellow-50" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}>
                  <Icon size={12} style={{ color }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="label-xs">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="field">
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="label-xs">Due Date & Time</label>
              <input type="datetime-local" value={form.dueAt} onChange={(e) => set("dueAt", e.target.value)} className="field" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-xs">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
              placeholder="What needs to be done?"
              className="field resize-none" />
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-xs">Link Contact</label>
              <select value={form.contactId} onChange={(e) => set("contactId", e.target.value)} className="field">
                <option value="">— None —</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Link Deal</label>
              <select value={form.dealId} onChange={(e) => set("dealId", e.target.value)} className="field">
                <option value="">— None —</option>
                {deals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Link Property</label>
              <select value={form.propertyId} onChange={(e) => set("propertyId", e.target.value)} className="field">
                <option value="">— None —</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <label className="label-xs">Assigned To</label>
            <input value={form.assignedToName} onChange={(e) => set("assignedToName", e.target.value)}
              placeholder="e.g. Tunde (or leave blank for yourself)"
              className="field" />
          </div>

          {/* Tags */}
          <div>
            <label className="label-xs">Tags (press Enter to add)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  <Tag size={9} /> {t}
                  <button onClick={() => set("tags", form.tags.filter((_, j) => j !== i))} className="ml-0.5 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
              placeholder="e.g. urgent, lekki, buyer" className="field" />
          </div>

          {/* Notes */}
          <div>
            <label className="label-xs">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
              className="field resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || !form.title}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40" style={{ background: "var(--emerald)" }}>
            {saving ? "Creating…" : "✓ Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onToggle, onDelete }: {
  task: Task; onToggle: () => void; onDelete: () => void;
}) {
  const urgency = urgencyClass(task);
  const badge = URGENCY_BADGE[urgency];
  const isDone = task.status === "COMPLETED";
  const typeMeta = TASK_TYPES.find((t) => t.key === task.type) ?? TASK_TYPES[0];
  const TypeIcon = typeMeta.icon;
  const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.MEDIUM;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${isDone ? "opacity-60 border-gray-100" : urgency === "overdue" ? "border-red-200 bg-red-50/20" : "border-gray-100"}`}>
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button onClick={onToggle} className="flex-shrink-0 mt-0.5">
          {isDone
            ? <CheckCircle2 size={20} className="text-emerald-500" />
            : <Circle size={20} className="text-gray-300 hover:text-gray-400 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className={`text-[13.5px] font-bold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</div>
            <button onClick={onDelete} className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Trash2 size={11} className="text-red-400" />
            </button>
          </div>

          {task.description && <div className="text-[12px] text-gray-500 mt-0.5">{task.description}</div>}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Type */}
            <span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              <TypeIcon size={9} style={{ color: typeMeta.color }} /> {typeMeta.label}
            </span>

            {/* Priority */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityMeta.bg}`}>{priorityMeta.label}</span>

            {/* Urgency badge */}
            {badge.label && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badge.class}`}>{badge.label}</span>
            )}

            {/* Due date */}
            {task.dueAt && (
              <span className={`flex items-center gap-1 text-[10.5px] font-semibold ${urgency === "overdue" ? "text-red-600" : "text-gray-500"}`}>
                <Clock size={10} />
                {new Date(task.dueAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                {" "}
                {new Date(task.dueAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.contact && (
              <a href={`/dashboard/crm/contacts/${task.contact.id}`}
                className="flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 hover:underline">
                <Users size={9} /> {task.contact.name}
              </a>
            )}
            {task.deal && (
              <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
                <Briefcase size={9} /> {task.deal.title}
              </span>
            )}
            {task.property && (
              <span className="flex items-center gap-1 text-[10.5px] text-gray-500">
                <Building2 size={9} /> {task.property.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {task.tags.map((t) => (
                <span key={t} className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                  <Tag size={8} /> {t}
                </span>
              ))}
            </div>
          )}

          {task.assignedToName && (
            <div className="text-[10.5px] text-gray-400 mt-1">Assigned to: {task.assignedToName}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Pending", "Due Today", "Overdue", "This Week", "Completed"] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/crm/tasks");
    setTasks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
    Promise.all([
      fetch("/api/crm/contacts").then((r) => r.json()),
      fetch("/api/crm/deals").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ]).then(([c, d, p]) => {
      setContacts(c);
      setDeals(d);
      setProperties(p);
    });
  }, [loadTasks]);

  async function toggleStatus(task: Task) {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    await fetch(`/api/crm/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/crm/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  const now = new Date();
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.contact?.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All" && t.type !== typeFilter) return false;
    if (filter === "Pending") return t.status === "PENDING";
    if (filter === "Completed") return t.status === "COMPLETED";
    if (filter === "Overdue") return t.status !== "COMPLETED" && t.dueAt ? new Date(t.dueAt) < now : false;
    if (filter === "Due Today") return t.status !== "COMPLETED" && t.dueAt ? new Date(t.dueAt) <= todayEnd && new Date(t.dueAt) >= now : false;
    if (filter === "This Week") return t.status !== "COMPLETED" && t.dueAt ? new Date(t.dueAt) <= weekEnd && new Date(t.dueAt) >= now : false;
    return true;
  });

  // KPIs
  const overdue = tasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) < now).length;
  const dueToday = tasks.filter((t) => t.status !== "COMPLETED" && t.dueAt && new Date(t.dueAt) <= todayEnd && new Date(t.dueAt) >= now).length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Tasks & Reminders" action={{ label: "New Task", onClick: () => setCreating(true) }} />

      <style>{`
        .label-xs { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:6px; }
        .field { width:100%; border:1px solid #e5e7eb; border-radius:12px; padding:10px 14px; font-size:13px; outline:none; transition:border-color 0.15s; }
        .field:focus { border-color:#fbbf24; }
      `}</style>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Overdue",     value: overdue,    color: overdue > 0 ? "#EF4444" : "var(--emerald)", onClick: () => setFilter("Overdue") },
            { label: "Due Today",   value: dueToday,   color: dueToday > 0 ? "#F59E0B" : "var(--emerald)", onClick: () => setFilter("Due Today") },
            { label: "Pending",     value: pending,    color: "var(--navy)",    onClick: () => setFilter("Pending") },
            { label: "Completed",   value: completed,  color: "var(--emerald)", onClick: () => setFilter("Completed") },
          ].map((k) => (
            <button key={k.label} onClick={k.onClick}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-left hover:shadow-md transition-shadow">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</div>
              <div className="text-[24px] font-black" style={{ color: k.color }}>{k.value}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-yellow-400 w-52" />

          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[11.5px] font-bold px-3 py-1.5 rounded-xl transition-colors ${filter === f ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                style={filter === f ? { background: "var(--navy)" } : {}}>
                {f}
              </button>
            ))}
          </div>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-[12px] outline-none focus:border-yellow-400">
            <option value="All">All types</option>
            {TASK_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="text-center text-gray-400 py-16 text-[13px]">Loading tasks…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <div className="text-[16px] font-bold text-gray-700">No tasks found</div>
            <div className="text-[13px] text-gray-400 mt-1 mb-5">
              {filter === "All" ? "Create your first task to get started." : `No ${filter.toLowerCase()} tasks.`}
            </div>
            <button onClick={() => setCreating(true)}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white" style={{ background: "var(--navy)" }}>
              + Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 group">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task}
                onToggle={() => toggleStatus(task)}
                onDelete={() => deleteTask(task.id)} />
            ))}
          </div>
        )}

      </div>

      {creating && (
        <CreateTaskModal
          contacts={contacts} deals={deals} properties={properties}
          onClose={() => setCreating(false)} onCreated={loadTasks}
        />
      )}
    </div>
  );
}
