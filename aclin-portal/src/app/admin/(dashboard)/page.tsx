"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  totalEntries: number;
  today: {
    total: number;
    loginAttempts: number;
    loginSuccess: number;
    loginFailed: number;
    pdfDownloads: number;
    rateLimits: number;
  };
  lastHour: { total: number; loginAttempts: number };
}

interface IrisStatus {
  connected: boolean;
  lastChecked: string;
  responseTimeMs: number | null;
  error?: string;
  errorCode?: string;
  endpoint: string;
  mode: "mock" | "live";
}

function StatCard({
  label,
  value,
  icon,
  color = "gray",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "green" | "red" | "amber" | "blue" | "gray";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

function IrisLabWidget({ status, onRefresh, loading }: {
  status: IrisStatus | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          Estado IRIS Lab
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-[#0d7749] hover:text-[#0b6b42] font-medium flex items-center gap-1 disabled:opacity-40 transition"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Verificar
        </button>
      </div>

      {!status ? (
        <div className="flex items-center gap-3 py-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
          <span className="text-sm text-gray-400">Verificando conexión...</span>
        </div>
      ) : (
        <>
          {/* Status badge */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 ${
            status.connected ? "bg-green-50" : "bg-red-50"
          }`}>
            <div className={`w-3 h-3 rounded-full shrink-0 ${
              status.connected
                ? "bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]"
                : "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
            }`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                status.connected ? "text-green-700" : "text-red-700"
              }`}>
                {status.connected ? "Conectado" : "Desconectado"}
              </p>
              <p className={`text-xs truncate ${
                status.connected ? "text-green-600" : "text-red-600"
              }`}>
                {status.endpoint}
              </p>
            </div>
            {status.mode === "mock" && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                Mock
              </span>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-2 text-sm">
            {status.responseTimeMs !== null && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tiempo de respuesta</span>
                <span className={`font-medium ${
                  status.responseTimeMs < 300
                    ? "text-green-600"
                    : status.responseTimeMs < 1000
                    ? "text-amber-600"
                    : "text-red-600"
                }`}>
                  {status.responseTimeMs} ms
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Última verificación</span>
              <span className="text-gray-700 font-medium">
                {new Date(status.lastChecked).toLocaleTimeString("es-CL")}
              </span>
            </div>
          </div>

          {/* Error detail */}
          {!status.connected && status.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  {status.errorCode && (
                    <p className="text-xs font-mono font-bold text-red-600 mb-0.5">
                      [{status.errorCode}]
                    </p>
                  )}
                  <p className="text-xs text-red-700">{status.error}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [irisStatus, setIrisStatus] = useState<IrisStatus | null>(null);
  const [irisLoading, setIrisLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      /* silent */
    }
    setLastUpdated(new Date());
  }, []);

  const loadIrisStatus = useCallback(async () => {
    setIrisLoading(true);
    try {
      const res = await fetch("/api/admin/irislab-status");
      if (res.ok) setIrisStatus(await res.json());
    } catch {
      /* silent */
    } finally {
      setIrisLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadIrisStatus();
    const interval = setInterval(loadStats, 30_000);
    return () => clearInterval(interval);
  }, [loadStats, loadIrisStatus]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated
              ? `Actualizado a las ${lastUpdated.toLocaleTimeString("es-CL")}`
              : "Cargando..."}
          </p>
        </div>
        <button
          onClick={() => { loadStats(); loadIrisStatus(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Accesos hoy"
          value={stats?.today.loginAttempts ?? "—"}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Sesiones exitosas hoy"
          value={stats?.today.loginSuccess ?? "—"}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Fallos de login hoy"
          value={stats?.today.loginFailed ?? "—"}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="PDFs descargados hoy"
          value={stats?.today.pdfDownloads ?? "—"}
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Fila secundaria */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Eventos última hora"
          value={stats?.lastHour.total ?? "—"}
          color="gray"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Rate limits hoy"
          value={stats?.today.rateLimits ?? "—"}
          color={stats?.today.rateLimits ? "red" : "gray"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <StatCard
          label="Total registros auditoría"
          value={stats?.totalEntries ?? "—"}
          color="gray"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* IrisLab status */}
      <IrisLabWidget
        status={irisStatus}
        onRefresh={loadIrisStatus}
        loading={irisLoading}
      />
    </div>
  );
}
