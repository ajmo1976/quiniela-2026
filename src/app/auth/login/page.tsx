"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) {
        setError("Credenciales de emergencia inválidas");
        setLoading(false);
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080810] flex items-center justify-center overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/50">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              {/* Ball glow */}
              <div className="absolute inset-0 blur-2xl bg-amber-500/40 rounded-full scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30">
                <span className="text-3xl">⚽</span>
              </div>
              {/* Crown badge */}
              <motion.div
                className="absolute -top-2 -right-2 bg-teal-400 rounded-full w-7 h-7 flex items-center justify-center shadow-lg shadow-teal-500/50"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-sm">👑</span>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black tracking-tight text-white text-center"
            >
              QUINIELA{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                2026
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm text-center mt-2 font-medium"
            >
              Compite en ligas privadas del Mundial
            </motion.p>
          </div>

          {/* Divider with text */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-bold uppercase tracking-wider">
              Accede con
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {showEmergency ? (
            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-4 rounded-xl text-center font-bold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-white/40 mb-1.5">
                  Correo de Soporte
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@quiniela.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors animate-pulse-subtle"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-white/40 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(245,158,11,0.2)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
              >
                {loading ? "Conectando..." : "Iniciar Sesión"}
              </motion.button>
            </form>
          ) : (
            /* Google Sign-in Button */
            <motion.button
              id="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(234,179,8,0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="text-base">
                {loading ? "Conectando..." : "Continuar con Google"}
              </span>
            </motion.button>
          )}

          {/* Toggle Support Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowEmergency(!showEmergency);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className="text-[10px] text-white/30 hover:text-amber-500 transition-colors uppercase font-black tracking-widest"
            >
              {showEmergency ? "Volver a Google" : "Acceso de Soporte / Emergencia"}
            </button>
          </div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-3"
          >
            {[
              { icon: "🏆", text: "Ligas privadas con código de invitación" },
              { icon: "🔒", text: "Ligas protegidas con contraseña" },
              { icon: "⚡", text: "Pronósticos con Doble o Nada" },
              { icon: "📊", text: "Ranking global en tiempo real" },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-white/50"
              >
                <span className="text-base">{feature.icon}</span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <p className="text-center text-white/20 text-[10px] mt-6">
            Al acceder, aceptas las reglas del juego.
            <br />
            No se comparten tus datos con terceros.
          </p>

          {/* Branding */}
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center justify-center gap-1 opacity-40 hover:opacity-75 transition-opacity">
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">Desarrollado por</span>
            <span className="text-[10px] font-black text-white uppercase tracking-tight">A&G System Solutions, C.A.</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
