"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Loader2, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { useTournament } from "@/lib/TournamentContext";

export default function JoinLeaguePage() {
  const { joinLeague } = useTournament();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code.trim()) {
      setError("El código de invitación es obligatorio");
      setLoading(false);
      return;
    }

    try {
      const result = await joinLeague(code.trim().toUpperCase(), password || undefined);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/leagues"), 1500);
      } else {
        setError(result.error || "Código no válido o ya eres miembro de esta liga");
      }
    } catch {
      setError("Error al unirse a la liga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/world-cup-logo.png" alt="WC 2026" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">
            QUINIELA 2026
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-amber-500 transition-colors">Dashboard</Link>
          <Link href="/matches" className="text-sm font-medium hover:text-amber-500 transition-colors">Partidos</Link>
          <Link href="/groups" className="text-sm font-medium hover:text-amber-500 transition-colors">Grupos</Link>
          <Link href="/leagues" className="text-sm font-medium text-amber-500 underline decoration-2 underline-offset-4">Ligas</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 pt-28 pb-20">
        <Link
          href="/leagues"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-amber-500 font-bold uppercase mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Ligas
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <UserPlus className="text-blue-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Unirse a Liga</h1>
              <p className="text-xs text-white/40">Ingresa el código de invitación</p>
            </div>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-black mb-2">¡Te has unido!</h3>
              <p className="text-sm text-white/50">Redirigiendo a tus ligas...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                  Código de Invitación *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: AB3X9K"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono text-lg tracking-[0.3em] text-center uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                  Contraseña (si aplica)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Solo si la liga tiene contraseña"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uniéndose...
                  </>
                ) : (
                  "Unirse a la Liga"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}
