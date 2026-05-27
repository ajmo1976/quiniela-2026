"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MatchCard from "@/components/MatchCard";
import { ChevronLeft, Filter, Calendar, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTournament } from "@/lib/TournamentContext";
import { ALL_MATCHES } from "./matchesData";

const GROUPS = ["TODOS", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function MatchesPage() {
  const [viewMode, setViewMode] = useState<"group" | "date">("date");
  const [activeTab, setActiveTab] = useState("TODOS");
  const { predictions } = useTournament();

  const predictedCount = Object.values(predictions).filter(
    (pred) => pred.homeScore !== "" && pred.awayScore !== ""
  ).length;

  const filteredMatches = activeTab === "TODOS" 
    ? ALL_MATCHES 
    : ALL_MATCHES.filter(m => m.group === activeTab);

  const groupedMatches = viewMode === "group" 
    ? filteredMatches.reduce((acc: any, match) => {
        (acc[match.group] = acc[match.group] || []).push(match);
        return acc;
      }, {})
    : filteredMatches.reduce((acc: any, match) => {
        (acc[match.date] = acc[match.date] || []).push(match);
        return acc;
      }, {});

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 glass-card hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Calendar className="text-amber-500" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Calendario de Partidos</h1>
                <p className="text-slate-500 dark:text-slate-400">Fase de Grupos • Hora VET</p>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setViewMode("date")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "date" ? "bg-amber-500 text-white shadow-lg" : "hover:bg-white/10"
              }`}
            >
              <Calendar size={18} />
              <span>Cronológico</span>
            </button>
            <button 
              onClick={() => setViewMode("group")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === "group" ? "bg-amber-500 text-white shadow-lg" : "hover:bg-white/10"
              }`}
            >
              <LayoutGrid size={18} />
              <span>Por Grupo</span>
            </button>
          </div>
        </div>

        {/* Filters - Precise Grid Alignment */}
        <div className="flex flex-col gap-4 mb-12 max-w-5xl mx-auto">
          {/* Row 1: TODOS */}
          <div className="flex justify-center">
            <button
              onClick={() => setActiveTab("TODOS")}
              className={`w-full md:w-auto px-12 py-3 rounded-xl text-sm font-black transition-all border ${
                activeTab === "TODOS" 
                ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105" 
                : "glass-card border-white/5 hover:border-amber-500/50"
              }`}
            >
              TODOS LOS JUEGOS
            </button>
          </div>

          {/* Grid: A-F above G-L */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {GROUPS.filter(g => g !== "TODOS").map((group) => (
              <button
                key={group}
                onClick={() => setActiveTab(group)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  activeTab === group 
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105" 
                  : "glass-card border-white/5 hover:border-amber-500/50"
                }`}
              >
                {`GRUPO ${group}`}
              </button>
            ))}
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-12">
          {Object.entries(groupedMatches).map(([label, matches]: [string, any]) => (
            <div key={label}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold px-4 py-1 bg-amber-500 rounded-lg text-white min-w-[100px] text-center">
                  {viewMode === "group" ? `GRUPO ${label}` : label}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match: any, i: number) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MatchCard {...match} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-8">
            <div className="text-sm">
              <span className="text-slate-500 dark:text-slate-400">Total Partidos:</span>
              <span className="ml-2 font-bold">{ALL_MATCHES.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500 dark:text-slate-400">Pronósticos Listos:</span>
              <span className="ml-2 font-bold text-green-500">{predictedCount}</span>
            </div>
          </div>
          <div className="w-48 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${(predictedCount / ALL_MATCHES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
