"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Clock, FileText, MessageSquare, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { autoFormatRut } from "@/lib/rut";

const loginSchema = z.object({
  identifier: z.string().min(1, "Este campo es requerido"),
  folio: z.string().min(1, "El número de folio es requerido"),
  type: z.enum(["rut", "dni"]),
  terms: z.boolean().refine((v) => v === true, "Debe aceptar los términos y condiciones"),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Shield, text: "Acceso seguro y privado" },
  { icon: Clock, text: "Disponible las 24 horas" },
  { icon: FileText, text: "Resultados en PDF" },
];

// ─── OTP Step ─────────────────────────────────────────────────────────────────

function OTPStep({
  mfaToken,
  onBack,
  onSuccess,
}: {
  mfaToken: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Ingrese el código completo de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, otp: code }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Código incorrecto.");
        setOtp(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }

      onSuccess();
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      {/* Mobile logo */}
      <div className="lg:hidden mb-8">
        <div className="inline-flex items-center px-5 py-2.5 rounded-2xl" style={{ background: "#0d7749" }}>
          <img src="/logo-aclin.png" alt="ACLIN Laboratorio Clínico" className="h-10 w-auto" />
        </div>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#f0faf0" }}>
          <MessageSquare className="w-6 h-6" style={{ color: "#0d7749" }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificación</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Ingrese el código de 6 dígitos enviado a su contacto registrado.
          Válido por <span className="font-semibold text-gray-700">5 minutos</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP inputs */}
        <div>
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={cn(
                  "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none",
                  error
                    ? "border-red-300 bg-red-50"
                    : digit
                      ? "border-green-400 bg-green-50 text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-900 focus:border-green-400 focus:bg-white"
                )}
                autoComplete="one-time-code"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs text-red-600 font-medium text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className={cn(
            "w-full py-3.5 px-6 rounded-xl text-white text-sm font-bold",
            "transition-all duration-200 shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
          style={{ background: "linear-gradient(135deg, #0b6b42, #0d7749)" }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </>
          ) : (
            "VERIFICAR CÓDIGO"
          )}
        </motion.button>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">¿No recibió el código?</p>
          <button
            type="button"
            disabled={resending}
            onClick={async () => {
              setResending(true);
              onBack();
            }}
            className="text-xs font-semibold flex items-center gap-1 mx-auto transition-colors disabled:opacity-50"
            style={{ color: "#0d7749" }}
          >
            <RotateCcw className="w-3 h-3" />
            Volver a intentar
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Casa Matriz: 9 Norte 795, Viña del Mar ·{" "}
        <span className="font-medium">323323600</span>
      </p>
    </motion.div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFolioHint, setShowFolioHint] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { type: "rut" },
  });

  const identifierType = watch("type");

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: data.identifier,
          folio: data.folio,
          type: data.type,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al iniciar sesión.");
        return;
      }

      if (json.mfaRequired && json.mfaToken) {
        setMfaToken(json.mfaToken);
        return;
      }

      router.push("/resultados");
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #095e3a 0%, #0d7749 50%, #0f9a5a 100%)" }}>

        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${200 + i * 80}px`,
                height: `${200 + i * 80}px`,
                background: "rgba(255,255,255,0.05)",
                top: `${-10 + i * 15}%`,
                left: `${-10 + i * 10}%`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <img
            src="/logo-aclin.png"
            alt="ACLIN Laboratorio Clínico"
            className="h-16 w-auto"
          />
        </motion.div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Sus resultados,<br />
            <span className="text-green-200">cuando los necesita</span>
          </h2>
          <p className="text-green-100 text-lg leading-relaxed mb-8">
            Acceda a sus exámenes de laboratorio de forma segura y confidencial desde cualquier dispositivo.
          </p>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-green-50 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10"
        >
          <p className="text-green-200 text-sm">
            Casa Matriz: 9 Norte 795, Viña del Mar
          </p>
          <p className="text-green-200 text-sm">
            Call Center: 323323600 · consultas@aclin.cl
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {mfaToken ? (
            <OTPStep
              key="otp-step"
              mfaToken={mfaToken}
              onBack={() => setMfaToken(null)}
              onSuccess={() => router.push("/resultados")}
            />
          ) : (
        <motion.div
          key="login-step"
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <div className="inline-flex items-center px-5 py-2.5 rounded-2xl" style={{ background: "#0d7749" }}>
              <img src="/logo-aclin.png" alt="ACLIN Laboratorio Clínico" className="h-10 w-auto" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultar resultados</h2>
            <p className="text-gray-500 text-sm">Revise sus exámenes en línea de forma segura</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Identifier type toggle */}
            <div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(["rut", "dni"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("type", t)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                      identifierType === t
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {t === "rut" ? "RUT" : "DNI / Pasaporte"}
                  </button>
                ))}
              </div>
            </div>

            {/* Identifier field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {identifierType === "rut" ? "RUT" : "DNI / Pasaporte"}
              </label>
              <input
                {...register("identifier")}
                type="text"
                placeholder={identifierType === "rut" ? "12.345.678-9" : "Número de documento"}
                onChange={(e) => {
                  if (identifierType === "rut") {
                    const formatted = autoFormatRut(e.target.value);
                    setValue("identifier", formatted);
                  } else {
                    setValue("identifier", e.target.value);
                  }
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  "placeholder:text-gray-400 placeholder:font-normal",
                  "focus:outline-none focus:ring-2 focus:border-transparent",
                  errors.identifier
                    ? "border-red-300 bg-red-50 focus:ring-red-200"
                    : "border-gray-200 bg-gray-50 focus:ring-green-200 focus:bg-white"
                )}
                style={!errors.identifier ? { "--tw-ring-color": "rgba(58,170,53,0.3)" } as React.CSSProperties : undefined}
                autoComplete="username"
                inputMode={identifierType === "rut" ? "text" : "numeric"}
              />
              {errors.identifier && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-red-500 font-medium"
                >
                  {errors.identifier.message}
                </motion.p>
              )}
            </div>

            {/* Folio field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Número de Folio
                </label>
                <button
                  type="button"
                  onClick={() => setShowFolioHint(!showFolioHint)}
                  className="text-xs font-medium"
                  style={{ color: "#0d7749" }}
                >
                  ¿Dónde lo encuentro?
                </button>
              </div>
              <AnimatePresence>
                {showFolioHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 p-3 rounded-lg text-xs text-gray-600 overflow-hidden"
                    style={{ background: "#f0faf0", borderLeft: "3px solid #0d7749" }}
                  >
                    El número de folio está en la boleta o comprobante de atención entregado en la sucursal.
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                {...register("folio")}
                type="text"
                placeholder="Ej: 019886940"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  "placeholder:text-gray-400 placeholder:font-normal",
                  "focus:outline-none focus:ring-2 focus:border-transparent",
                  errors.folio
                    ? "border-red-300 bg-red-50 focus:ring-red-200"
                    : "border-gray-200 bg-gray-50 focus:ring-green-200 focus:bg-white"
                )}
                autoComplete="off"
                inputMode="numeric"
              />
              {errors.folio && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-red-500 font-medium"
                >
                  {errors.folio.message}
                </motion.p>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    {...register("terms")}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
                    "peer-checked:border-0",
                    errors.terms ? "border-red-300" : "border-gray-300 group-hover:border-green-400"
                  )}
                    style={{ background: watch("terms") ? "#0d7749" : "white" }}>
                    {watch("terms") && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-snug">
                  Declaro conocer los{" "}
                  <span className="font-semibold cursor-pointer hover:underline" style={{ color: "#0d7749" }}>
                    Términos y condiciones de uso
                  </span>
                </span>
              </label>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-red-500 font-medium ml-8"
                >
                  {errors.terms.message}
                </motion.p>
              )}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className={cn(
                "w-full py-3.5 px-6 rounded-xl text-white text-sm font-bold",
                "transition-all duration-200 shadow-md",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
              style={{ background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #0b6b42, #0d7749)" }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Consultando...
                </>
              ) : (
                "CONSULTAR"
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Casa Matriz: 9 Norte 795, Viña del Mar ·{" "}
            <span className="font-medium">323323600</span>
          </p>
        </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
