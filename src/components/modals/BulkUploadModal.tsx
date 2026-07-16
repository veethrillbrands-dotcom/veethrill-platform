"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, Download, CheckCircle2, AlertCircle, XCircle,
  ChevronRight, FileText, RefreshCw, Eye,
} from "lucide-react";

// ─── Schema definitions ───────────────────────────────────────────────────────

export type BulkUploadSchema = {
  entity: string;
  label: string;
  apiPath: string;
  fields: {
    key: string;
    label: string;
    required?: boolean;
    hint?: string;
    example: string;
  }[];
  icon: string;
};

export const BULK_SCHEMAS: BulkUploadSchema[] = [
  {
    entity: "contacts",
    label: "Contacts",
    apiPath: "/api/crm/contacts/bulk",
    icon: "👥",
    fields: [
      { key: "name",     label: "Name",     required: true,  example: "Adaeze Okafor",    hint: "Full name" },
      { key: "type",     label: "Type",                      example: "Prospect",          hint: "Prospect / Client / Developer / Agent / Partner / Corporate / Diaspora / HNI" },
      { key: "email",    label: "Email",                     example: "ada@email.com" },
      { key: "phone",    label: "Phone",                     example: "+2348012345678" },
      { key: "company",  label: "Company",                   example: "Zenith Ltd" },
      { key: "location", label: "Location",                  example: "Lekki, Lagos" },
      { key: "source",   label: "Source",                    example: "Referral",          hint: "Referral / Social Media / Walk-in / Website / Direct / Event" },
      { key: "notes",    label: "Notes",                     example: "Looking for 3-bed apartment" },
    ],
  },
  {
    entity: "deals",
    label: "Deals",
    apiPath: "/api/crm/deals/bulk",
    icon: "🤝",
    fields: [
      { key: "title",             label: "Deal Title",         required: true, example: "3-bed purchase at Victoria Garden City",   hint: "Short descriptive name for the deal" },
      { key: "contactName",       label: "Contact Name",                       example: "Adaeze Okafor",                              hint: "Must match an existing contact name" },
      { key: "value",             label: "Value (₦)",                          example: "15000000",                                   hint: "Numeric value in Naira, no commas" },
      { key: "stage",             label: "Stage",                              example: "Lead / Enquiry",                             hint: "Must match a pipeline stage name" },
      { key: "probability",       label: "Probability (%)",                    example: "25" },
      { key: "expectedCloseDate", label: "Expected Close Date",                example: "2026-09-30",                                 hint: "YYYY-MM-DD format" },
      { key: "notes",             label: "Notes",                              example: "Client prefers ground floor" },
    ],
  },
];

// ─── CSV utils ────────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim().replace(/^"|"$/g, ""); });
    return row;
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += line[i]; }
  }
  result.push(current);
  return result;
}

function buildCSVTemplate(schema: BulkUploadSchema): string {
  const header = schema.fields.map((f) => f.key).join(",");
  const example = schema.fields.map((f) => `"${f.example}"`).join(",");
  const example2 = schema.fields.map((f, i) => {
    // Slightly vary the second example row
    if (i === 0) return `"${f.example.split(" ")[0]} Obi"`;
    return `"${f.example}"`;
  }).join(",");
  return `${header}\n${example}\n${example2}`;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Validation ───────────────────────────────────────────────────────────────

type ParsedRow = { [key: string]: string | string[] | number; _errors: string[]; _rowNum: number };

function validateRows(rows: Record<string, string>[], schema: BulkUploadSchema): ParsedRow[] {
  return rows.map((row, i) => {
    const errors: string[] = [];
    for (const field of schema.fields) {
      if (field.required && !String(row[field.key] ?? "").trim()) {
        errors.push(`${field.label} is required`);
      }
    }
    return { ...row, _errors: errors, _rowNum: i + 2 };  // +2: 1-indexed + skip header
  });
}

// ─── Import result row ────────────────────────────────────────────────────────

type ImportResult = { row: number; status: "created" | "skipped" | "error"; title?: string; name?: string; reason?: string };

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = "select" | "upload" | "preview" | "importing" | "done";

// ─── Main component ───────────────────────────────────────────────────────────

export function BulkUploadModal({
  onClose,
  onImported,
  defaultEntity,
}: {
  onClose: () => void;
  onImported?: (entity: string, count: number) => void;
  defaultEntity?: string;
}) {
  const [step, setStep] = useState<Step>(defaultEntity ? "upload" : "select");
  const [schema, setSchema] = useState<BulkUploadSchema | null>(
    defaultEntity ? BULK_SCHEMAS.find((s) => s.entity === defaultEntity) ?? null : null
  );
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ created: number; errors: number; results: ImportResult[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function selectSchema(s: BulkUploadSchema) {
    setSchema(s);
    setStep("upload");
  }

  const processFile = useCallback((file: File) => {
    if (!schema) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      const validated = validateRows(rows, schema);
      setParsedRows(validated);
      setStep("preview");
    };
    reader.readAsText(file);
  }, [schema]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) processFile(file);
  }

  async function runImport() {
    if (!schema) return;
    setImporting(true);
    setStep("importing");
    const validRows = parsedRows.filter((r) => r._errors.length === 0).map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _errors, _rowNum, ...clean } = r;
      return clean;
    });
    try {
      const res = await fetch(schema.apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      setResults(data);
      onImported?.(schema.entity, data.created ?? 0);
    } catch {
      setResults({ created: 0, errors: validRows.length, results: [] });
    }
    setImporting(false);
    setStep("done");
  }

  const validCount = parsedRows.filter((r) => r._errors.length === 0).length;
  const errorCount = parsedRows.filter((r) => r._errors.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
          <div>
            <div className="text-[15px] font-bold text-white">Bulk Import</div>
            <div className="text-[11px] text-white/50 mt-0.5">
              {step === "select" && "Choose what to import"}
              {step === "upload" && schema && `Upload CSV for ${schema.label}`}
              {step === "preview" && `Preview — ${parsedRows.length} rows`}
              {step === "importing" && "Importing…"}
              {step === "done" && "Import complete"}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
            {[
              { key: "select", label: "Choose type" },
              { key: "upload", label: "Upload file" },
              { key: "preview", label: "Preview & validate" },
              { key: "importing", label: "Import" },
            ].map((s, i, arr) => {
              const steps: Step[] = ["select", "upload", "preview", "importing"];
              const current = steps.indexOf(step);
              const sIdx = steps.indexOf(s.key as Step);
              const isDone = sIdx < current;
              const isActive = sIdx === current;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 ${isActive ? "text-gray-900" : isDone ? "text-emerald-600" : "text-gray-400"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      isDone ? "bg-emerald-100" : isActive ? "text-white" : "bg-gray-100"
                    }`} style={isActive ? { background: "var(--navy)" } : {}}>
                      {isDone ? <CheckCircle2 size={12} className="text-emerald-600" /> : sIdx + 1}
                    </div>
                    <span className="text-[11.5px] font-semibold hidden sm:inline">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: Select entity ── */}
          {step === "select" && (
            <div className="p-6">
              <div className="text-[13px] text-gray-500 mb-4">What would you like to import?</div>
              <div className="grid grid-cols-2 gap-3">
                {BULK_SCHEMAS.map((s) => (
                  <button key={s.entity} onClick={() => selectSchema(s)}
                    className="flex items-start gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 text-left transition-all group">
                    <span className="text-[28px] flex-shrink-0">{s.icon}</span>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 group-hover:text-yellow-800">{s.label}</div>
                      <div className="text-[11.5px] text-gray-400 mt-0.5">{s.fields.filter((f) => f.required).map((f) => f.label).join(", ")} required</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{s.fields.length} columns</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Upload ── */}
          {step === "upload" && schema && (
            <div className="p-6 space-y-5">
              {/* Template download */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-bold text-blue-900">Download CSV Template</div>
                    <div className="text-[11.5px] text-blue-700 mt-1">
                      Use our template to ensure correct formatting. The file includes example data rows.
                    </div>
                  </div>
                  <button
                    onClick={() => downloadCSV(buildCSVTemplate(schema), `veethrill_${schema.entity}_template.csv`)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors">
                    <Download size={13} /> Template
                  </button>
                </div>
              </div>

              {/* Column guide */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Required columns</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 rounded-l-xl">Column</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Required</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Example</th>
                        <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 rounded-r-xl">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.fields.map((f) => (
                        <tr key={f.key} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-2 font-mono text-[11.5px] font-semibold text-gray-800">{f.key}</td>
                          <td className="px-3 py-2">
                            {f.required
                              ? <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Required</span>
                              : <span className="text-[10px] text-gray-400">Optional</span>}
                          </td>
                          <td className="px-3 py-2 text-gray-500 font-mono text-[11px]">{f.example}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-400">{f.hint ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <Upload size={28} className={`mx-auto mb-3 ${dragOver ? "text-yellow-500" : "text-gray-300"}`} />
                <div className="text-[14px] font-bold text-gray-700">Drop your CSV file here</div>
                <div className="text-[12px] text-gray-400 mt-1">or click to browse · CSV files only</div>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === "preview" && schema && parsedRows.length > 0 && (
            <div className="flex flex-col h-full">
              {/* Summary bar */}
              <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <FileText size={13} className="text-gray-400" />
                  <span className="text-[12px] text-gray-500 font-medium">{fileName}</span>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600">
                    <CheckCircle2 size={13} /> {validCount} valid
                  </span>
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-[12px] font-bold text-red-600">
                      <XCircle size={13} /> {errorCount} errors
                    </span>
                  )}
                  <button onClick={() => { setParsedRows([]); setStep("upload"); setFileName(""); }}
                    className="flex items-center gap-1 text-[11.5px] text-gray-400 hover:text-gray-600">
                    <RefreshCw size={11} /> Re-upload
                  </button>
                </div>
              </div>

              {/* Preview table */}
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-10">Row</th>
                      <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-20">Status</th>
                      {schema.fields.map((f) => (
                        <th key={f.key} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                          {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row) => (
                      <tr key={row._rowNum}
                        className={`border-b border-gray-50 last:border-0 ${row._errors.length > 0 ? "bg-red-50/50" : ""}`}>
                        <td className="px-3 py-2 text-gray-400 text-[11px]">{row._rowNum}</td>
                        <td className="px-3 py-2">
                          {row._errors.length === 0
                            ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><CheckCircle2 size={11} /> Valid</span>
                            : (
                              <div className="group relative">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 cursor-help">
                                  <XCircle size={11} /> Error
                                </span>
                                <div className="absolute bottom-full left-0 z-10 bg-gray-900 text-white text-[10.5px] rounded-lg px-3 py-2 mb-1.5 w-48 hidden group-hover:block shadow-xl">
                                  {row._errors.join(", ")}
                                </div>
                              </div>
                            )}
                        </td>
                        {schema.fields.map((f) => (
                          <td key={f.key} className={`px-3 py-2 max-w-[160px] truncate ${
                            f.required && !String(row[f.key] ?? "").trim() ? "text-red-500 font-semibold" : "text-gray-700"
                          }`}>
                            {row[f.key] || <span className="text-gray-300 italic text-[11px]">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
                <div className="text-[12px] text-gray-500">
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-yellow-500" />
                      {errorCount} row{errorCount > 1 ? "s" : ""} will be skipped due to validation errors
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[12.5px] font-bold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={runImport} disabled={validCount === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12.5px] font-bold text-white disabled:opacity-40 transition-opacity"
                    style={{ background: "var(--navy)" }}>
                    <Upload size={13} /> Import {validCount} record{validCount !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Importing ── */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, var(--navy), #1a3555)" }}>
                <Upload size={24} className="text-white animate-bounce" />
              </div>
              <div className="text-[16px] font-bold text-gray-900 mb-2">Importing records…</div>
              <div className="text-[13px] text-gray-400">Please wait — creating {validCount} {schema?.label.toLowerCase()}</div>
              <div className="mt-6 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full animate-pulse" style={{ background: "var(--navy)", width: "60%" }} />
              </div>
            </div>
          )}

          {/* ── STEP: Done ── */}
          {step === "done" && results && schema && (
            <div className="p-6 space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="text-[28px] font-black text-emerald-600">{results.created}</div>
                  <div className="text-[11.5px] font-bold text-emerald-700 mt-0.5">Successfully Imported</div>
                </div>
                <div className={`${results.errors > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} border rounded-2xl p-4 text-center`}>
                  <div className={`text-[28px] font-black ${results.errors > 0 ? "text-red-600" : "text-gray-400"}`}>{results.errors}</div>
                  <div className={`text-[11.5px] font-bold mt-0.5 ${results.errors > 0 ? "text-red-700" : "text-gray-500"}`}>
                    {results.errors > 0 ? "Failed / Skipped" : "No Errors"}
                  </div>
                </div>
              </div>

              {/* Per-row results */}
              {results.results.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <Eye size={11} /> Import Log
                  </div>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                    {results.results.map((r, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 ${
                        r.status === "created" ? "" : "bg-red-50/30"
                      }`}>
                        {r.status === "created"
                          ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                          : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                        <span className="text-[11.5px] font-semibold text-gray-800 flex-1 truncate">
                          Row {r.row}: {r.name ?? r.title ?? "—"}
                        </span>
                        {r.reason && <span className="text-[10.5px] text-red-600 flex-shrink-0">{r.reason}</span>}
                        <span className={`text-[10px] font-black uppercase ${
                          r.status === "created" ? "text-emerald-600" : "text-red-600"
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {results.created > 0 && (
                  <button
                    onClick={() => { setParsedRows([]); setResults(null); setFileName(""); setStep("upload"); }}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-[12.5px] font-bold text-gray-600 hover:bg-gray-50">
                    Import More
                  </button>
                )}
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-[12.5px] font-bold text-white"
                  style={{ background: "var(--navy)" }}>
                  {results.created > 0 ? "✓ Done" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
