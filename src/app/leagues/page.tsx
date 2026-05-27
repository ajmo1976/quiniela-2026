"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Users, Shield, Trophy, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import LeagueCard from "@/components/LeagueCard";
import { useTournament } from "@/lib/TournamentContext";

export default function LeaguesPage() {
  const { leagues } = useTournament();
  const leagueList = Object.values(leagues);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
              Mis <span className="text-amber-500">Ligas</span> Privadas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Compite contra tus amigos en ligas exclusivas.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/leagues/create"
              className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-sm rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
            >
              <Plus size={16} />
              Crear Liga
            </Link>
            <Link
              href="/leagues/join"
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-sm rounded-xl uppercase tracking-wider transition-colors"
            >
              <Users size={16} />
              Unirse
            </Link>
          </div>
        </div>

        {/* League Grid */}
        {leagueList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagueList.map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border border-white/10 p-16 text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="text-amber-500" size={36} />
            </div>
            <h3 className="text-xl font-black uppercase mb-3">
              No tienes ligas aún
            </h3>
            <p className="text-sm text-white/40 mb-8 max-w-md mx-auto">
              Crea una liga privada e invita a tus amigos, o únete a una liga existente con un código de invitación.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/leagues/create"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-sm rounded-xl uppercase transition-colors"
              >
                Crear mi primera liga
              </Link>
              <Link
                href="/leagues/join"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm rounded-xl uppercase transition-colors"
              >
                Tengo un código
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
