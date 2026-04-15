"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Download,

  User,
  Calendar,
  CreditCard,
  Stethoscope,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import type { PatientResults } from "@/services/irislab";
import { cn } from "@/lib/cn";

const statusConfig = {
  Disponible: {
    label: "Disponible",
    icon: CheckCircle2,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  "En Proceso": {
    label: "En Proceso",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  Entregado: {
    label: "Entregado",
    icon: CheckCircle2,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
};

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status] || statusConfig["En Proceso"];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.bg, config.text, config.border
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "#e8f5e9" }}>
        <Icon className="w-4 h-4" style={{ color: "#0d7749" }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight break-words">{value}</p>
      </div>
    </div>
  );
}

export default function ResultadosPage() {
  const router = useRouter();
  const [results, setResults] = useState<PatientResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | "Disponible" | "En Proceso">("todos");

  useEffect(() => {
    fetch("/api/examenes")
      .then((r) => {
        if (!r.ok) throw new Error("No autorizado");
        return r.json();
      })
      .then(setResults)
      .catch(() => router.push("/"))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/pdf");
      if (!res.ok) throw new Error("Error al generar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resultados-aclin.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo generar el PDF. Intente nuevamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredExamenes = results?.examenes.filter((e) => {
    if (filter === "todos") return true;
    return e.estado === filter;
  }) ?? [];

  const disponiblesCount = results?.examenes.filter((e) => e.estado === "Disponible").length ?? 0;
  const enProcesoCount = results?.examenes.filter((e) => e.estado === "En Proceso").length ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-gray-200 rounded-full"
          style={{ borderTopColor: "#0d7749", borderWidth: "3px" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo-aclin-green.png" alt="ACLIN Laboratorio Clínico" className="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPDF}
              disabled={isDownloading || disponiblesCount === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              )}
              style={{ background: "linear-gradient(135deg, #0b6b42, #0d7749)" }}
            >
              {isDownloading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isDownloading ? "Generando..." : "Descargar PDF"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {results && (
          <>
            {/* Patient info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #0b6b42, #0d7749)" }}>
                    {results.paciente.nombre.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{results.paciente.nombre}</h2>
                    <p className="text-xs text-gray-500">{results.paciente.rut}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">
                  Datos del paciente
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <InfoCard icon={User} label="Edad" value={`${results.paciente.edad} años`} />
                  <InfoCard icon={Calendar} label="Fecha de nacimiento" value={results.paciente.fechaNacimiento} />
                  <InfoCard icon={User} label="Sexo" value={results.paciente.sexo} />
                  <InfoCard icon={CreditCard} label="N° Orden" value={results.atencion.numeroOrden} />
                  <InfoCard icon={Stethoscope} label="Médico" value={results.atencion.medico} />
                  <InfoCard icon={Calendar} label="Fecha atención" value={results.atencion.fechaAtencion} />
                  <InfoCard icon={MapPin} label="Procedencia de muestra" value={results.atencion.tomaMuestras} />
                  <InfoCard icon={Shield} label="Previsión" value={results.atencion.prevision} />
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total exámenes", value: results.examenes.length, color: "#0d7749", bg: "#f0faf0" },
                { label: "Disponibles", value: disponiblesCount, color: "#0d7749", bg: "#e8f5e9" },
                { label: "En proceso", value: enProcesoCount, color: "#d97706", bg: "#fffbeb" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center"
                >
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Exams table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">Exámenes</h3>
                  <p className="text-xs text-gray-500">{results.atencion.fechaAtencion} · {results.atencion.tomaMuestras}</p>
                </div>
                {/* Filter tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                  {([
                    { key: "todos", label: "Todos" },
                    { key: "Disponible", label: "Disponibles" },
                    { key: "En Proceso", label: "En proceso" },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        filter === tab.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tipo de Pago</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {filteredExamenes.map((examen, i) => (
                        <motion.tr
                          key={`${examen.codigo}-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              {examen.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="text-sm font-medium text-gray-900">{examen.descripcion}</span>
                          </td>
                          <td className="px-6 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-gray-500">{examen.tipoPago}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <StatusBadge status={examen.estado} />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {filteredExamenes.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    No hay exámenes en esta categoría.
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  * Disponible en el plazo de entrega, sólo en sucursal/toma de muestra
                </p>
              </div>
            </motion.div>

            {/* Presential pickup notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold text-amber-800">Resultados no disponibles online</h3>
                </div>
              </div>

              <div className="px-6 py-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  Los resultados de exámenes derivados u otros que no es posible cargar de forma online
                  deben retirarse de manera presencial en sucursal, por el momento.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo-aclin-green.png" alt="ACLIN Laboratorio Clínico" className="h-7 w-auto" />
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> 323323600
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> consultas@aclin.cl
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
