"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Shield, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTournament } from "@/lib/TournamentContext";

export default function CreateLeaguePage() {
  const { createLeague } = useTournament();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("El nombre de la liga es obligatorio");
      setLoading(false);
      return;
    }

    try {
      const result = await createLeague(name.trim(), password || undefined);
      if (result.success) {
        setCreatedCode(result.inviteCode || "CREADA");
        setName("");
        setPassword("");
      } else {
        setError(result.error || "Ya existe una liga con ese nombre o error al crearla");
      }
    } catch {
      setError("Error al crear la liga");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

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
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Shield className="text-amber-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Crear Liga</h1>
              <p className="text-xs text-white/40">Crea tu liga y compite con amigos</p>
            </div>
          </div>

          {createdCode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-black mb-2">¡Liga Creada!</h3>
              <p className="text-sm text-white/50 mb-6">
                Comparte el código de invitación con tus amigos para que se unan.
              </p>
              <p className="text-xs text-white/30 mb-6">
                Puedes ver el código de invitación en la página de tus ligas.
              </p>
              <Link
                href="/leagues"
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-sm rounded-xl uppercase transition-colors"
              >
                Ver Mis Ligas
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                  Nombre de la Liga *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Los Panas del Bloque"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white/40 uppercase tracking-widest mb-2">
                  Contraseña (Opcional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar vacío para liga abierta"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <p className="text-[10px] text-white/20 mt-1">
                  Si estableces una contraseña, los miembros deberán ingresarla para unirse.
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-sm rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Liga"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}
