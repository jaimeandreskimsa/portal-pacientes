"use client";

import { useState, useEffect, useCallback } from "react";

type AuditEventType =
  | "LOGIN_ATTEMPT"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OTP_SENT"
  | "OTP_SUCCESS"
  | "OTP_FAILED"
  | "LOGOUT"
  | "PDF_DOWNLOAD"
  | "EXAM_VIEW"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "RATE_LIMIT";

interface AuditEntry {
  id: string;
  timestamp: string;
  event: AuditEventType;
  ip: string;
  userAgent: string;
  rut?: string;
  folio?: string;
  success: boolean;
  error?: string;
  details?: string;
}

const EVENT_LABELS: Record<AuditEventType, string> = {
  LOGIN_ATTEMPT: "Intento de acceso",
  LOGIN_SUCCESS: "Acceso exitoso",
  LOGIN_FAILED: "Acceso fallido",
  OTP_SENT: "OTP enviado",
  OTP_SUCCESS: "OTP verificado",
  OTP_FAILED: "OTP fallido",
  LOGOUT: "Cierre de sesión",
  PDF_DOWNLOAD: "Descarga PDF",
  EXAM_VIEW: "Consulta exámenes",
  ADMIN_LOGIN: "Login admin",
  ADMIN_LOGOUT: "Logout admin",
  RATE_LIMIT: "Rate limit",
};

const EVENT_COLORS: Record<AuditEventType, string> = {
  LOGIN_ATTEMPT: "bg-blue-100 text-blue-700",
  LOGIN_SUCCESS: "bg-green-100 text-green-700",
  LOGIN_FAILED: "bg-red-100 text-red-700",
  OTP_SENT: "bg-purple-100 text-purple-700",
  OTP_SUCCESS: "bg-green-100 text-green-700",
  OTP_FAILED: "bg-red-100 text-red-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  PDF_DOWNLOAD: "bg-amber-100 text-amber-700",
  EXAM_VIEW: "bg-cyan-100 text-cyan-700",
  ADMIN_LOGIN: "bg-indigo-100 text-indigo-700",
  ADMIN_LOGOUT: "bg-gray-100 text-gray-600",
  RATE_LIMIT: "bg-red-100 text-red-700",
};

const PAGE_SIZE = 50;

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Todos los eventos" },
  ...Object.entries(EVENT_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function UAIcon({ ua }: { ua: string }) {
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return (
      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function AuditoriaPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [eventFilter, setEventFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (eventFilter) params.set("event", eventFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, eventFilter, search]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registro de Auditoría</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} registros en total · actualización automática cada 15s
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex flex-wrap gap-3">
        <select
          value={eventFilter}
          onChange={(e) => { setEventFilter(e.target.value); setPage(0); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d7749] bg-white"
        >
          {EVENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por IP, RUT o folio..."
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d7749]"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[#0d7749] text-white rounded-lg hover:bg-[#0b6b42] transition font-medium"
          >
            Buscar
          </button>
          {(search || eventFilter) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchInput(""); setEventFilter(""); setPage(0); }}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && entries.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <svg className="w-6 h-6 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando registros...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No hay registros de auditoría todavía.
            <br />
            <span className="text-xs text-gray-400">Los eventos aparecerán aquí en tiempo real</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Fecha / Hora
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Evento
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    IP
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    RUT
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Folio
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry) => (
                  <>
                    <tr
                      key={entry.id}
                      onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition ${
                        !entry.success ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${EVENT_COLORS[entry.event]}`}>
                          {EVENT_LABELS[entry.event] ?? entry.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-mono whitespace-nowrap">
                        {entry.ip}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-mono">
                        {entry.rut ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-mono">
                        {entry.folio ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {entry.success ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                        {entry.error ?? entry.details ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded === entry.id && (
                      <tr key={`${entry.id}-expanded`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-gray-500 mb-1">ID de registro</p>
                              <p className="font-mono text-gray-700 break-all">{entry.id}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                <UAIcon ua={entry.userAgent} />
                                User Agent
                              </p>
                              <p className="text-gray-700 break-all leading-relaxed">{entry.userAgent || "—"}</p>
                            </div>
                            {entry.error && (
                              <div className="sm:col-span-2">
                                <p className="font-semibold text-red-500 mb-1">Error</p>
                                <p className="text-red-700 bg-red-50 rounded px-2 py-1 font-mono">{entry.error}</p>
                              </div>
                            )}
                            {entry.details && (
                              <div className="sm:col-span-2">
                                <p className="font-semibold text-gray-500 mb-1">Detalles</p>
                                <p className="text-gray-700">{entry.details}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {page + 1} de {totalPages} ({total} registros)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
