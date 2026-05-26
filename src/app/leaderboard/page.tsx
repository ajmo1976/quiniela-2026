"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Medal, TrendingUp, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

interface LeaderboardUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
  points: number;
  predictionCount: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "from-amber-400 to-yellow-600 ring-amber-500/50 shadow-amber-500/20";
    if (rank === 2) return "from-slate-300 to-slate-500 ring-slate-400/50 shadow-slate-400/20";
    if (rank === 3) return "from-amber-600 to-amber-800 ring-amber-700/50 shadow-amber-700/20";
    return "from-white/10 to-white/5 ring-white/5";
  };

  const currentUserId = (session?.user as any)?.id;

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
          <Link href="/leagues" className="text-sm font-medium hover:text-amber-500 transition-colors">Ligas</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-500 font-bold uppercase mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
            <Trophy className="text-amber-500 animate-bounce" size={36} style={{ animationDuration: '3s' }} />
            Ranking <span className="text-amber-500">Global</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Clasificación general en tiempo real de todos los participantes.
          </p>
        </div>

        {isLoading ? (
          // Loading Skeleton
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-10 items-end h-64">
              <div className="bg-white/5 dark:bg-white/5 animate-pulse rounded-t-xl h-32 w-full"></div>
              <div className="bg-white/5 dark:bg-white/5 animate-pulse rounded-t-xl h-44 w-full"></div>
              <div className="bg-white/5 dark:bg-white/5 animate-pulse rounded-t-xl h-24 w-full"></div>
            </div>
            <div className="glass-card border border-white/10 p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-14 bg-white/5 dark:bg-white/5 animate-pulse rounded-xl w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-14 items-end pt-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  {leaderboard[1] ? (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="relative">
                        {leaderboard[1].image ? (
                          <img
                            src={leaderboard[1].image}
                            alt={leaderboard[1].name}
                            className={`w-16 h-16 rounded-full object-cover ring-4 ${
                              leaderboard[1].id === currentUserId ? "ring-amber-500" : "ring-slate-400"
                            } shadow-xl`}
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-white ring-4 ${
                            leaderboard[1].id === currentUserId ? "ring-amber-500" : "ring-slate-400"
                          } shadow-xl`}>
                            <UserIcon size={24} />
                          </div>
                        )}
                        <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white font-black text-sm flex items-center justify-center border border-white/20 shadow-md">
                          2
                        </span>
                      </div>
                      <span className={`text-sm font-black mt-3 mb-1 truncate max-w-[120px] text-center ${
                        leaderboard[1].id === currentUserId ? "text-amber-500 font-bold" : ""
                      }`}>
                        {leaderboard[1].name}
                      </span>
                      <span className="text-2xl font-black text-amber-500">{leaderboard[1].points}</span>
                      <span className="text-[10px] text-slate-500 dark:text-white/30 uppercase font-black tracking-wider">puntos</span>
                      <div className="w-full h-24 bg-gradient-to-t from-slate-400/20 to-slate-400/5 dark:from-slate-400/10 dark:to-transparent rounded-t-2xl mt-4 border-t border-slate-400/30 flex justify-center items-center">
                        <span className="text-4xl font-black text-slate-400/40 font-outfit">2º</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-24 w-full" />
                  )}
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  {leaderboard[0] ? (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="relative">
                        {leaderboard[0].image ? (
                          <img
                            src={leaderboard[0].image}
                            alt={leaderboard[0].name}
                            className={`w-20 h-20 rounded-full object-cover ring-4 ${
                              leaderboard[0].id === currentUserId ? "ring-amber-500" : "ring-yellow-500"
                            } shadow-[0_0_25px_rgba(245,158,11,0.25)]`}
                          />
                        ) : (
                          <div className={`w-20 h-20 rounded-full bg-amber-600 flex items-center justify-center text-white ring-4 ${
                            leaderboard[0].id === currentUserId ? "ring-amber-500" : "ring-yellow-500"
                          } shadow-[0_0_25px_rgba(245,158,11,0.25)]`}>
                            <UserIcon size={30} />
                          </div>
                        )}
                        <span className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-black text-base flex items-center justify-center border-2 border-white/20 shadow-md">
                          1
                        </span>
                      </div>
                      <span className={`text-base font-black mt-3 mb-1 truncate max-w-[140px] text-center ${
                        leaderboard[0].id === currentUserId ? "text-amber-500 font-bold" : ""
                      }`}>
                        {leaderboard[0].name}
                      </span>
                      <span className="text-3xl font-black text-amber-500">{leaderboard[0].points}</span>
                      <span className="text-[10px] text-slate-500 dark:text-white/30 uppercase font-black tracking-wider">puntos</span>
                      <div className="w-full h-32 bg-gradient-to-t from-amber-500/20 to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-t-2xl mt-4 border-t border-amber-500/30 flex justify-center items-center shadow-[0_-5px_15px_rgba(245,158,11,0.05)]">
                        <span className="text-5xl font-black text-amber-500/40 font-outfit">1º</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-32 w-full" />
                  )}
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  {leaderboard[2] ? (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="relative">
                        {leaderboard[2].image ? (
                          <img
                            src={leaderboard[2].image}
                            alt={leaderboard[2].name}
                            className={`w-16 h-16 rounded-full object-cover ring-4 ${
                              leaderboard[2].id === currentUserId ? "ring-amber-500" : "ring-amber-700"
                            } shadow-xl`}
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full bg-amber-900 flex items-center justify-center text-white ring-4 ${
                            leaderboard[2].id === currentUserId ? "ring-amber-500" : "ring-amber-700"
                          } shadow-xl`}>
                            <UserIcon size={24} />
                          </div>
                        )}
                        <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-sm flex items-center justify-center border border-white/20 shadow-md">
                          3
                        </span>
                      </div>
                      <span className={`text-sm font-black mt-3 mb-1 truncate max-w-[120px] text-center ${
                        leaderboard[2].id === currentUserId ? "text-amber-500 font-bold" : ""
                      }`}>
                        {leaderboard[2].name}
                      </span>
                      <span className="text-2xl font-black text-amber-500">{leaderboard[2].points}</span>
                      <span className="text-[10px] text-slate-500 dark:text-white/30 uppercase font-black tracking-wider">puntos</span>
                      <div className="w-full h-20 bg-gradient-to-t from-amber-700/20 to-amber-700/5 dark:from-amber-700/10 dark:to-transparent rounded-t-2xl mt-4 border-t border-amber-700/30 flex justify-center items-center">
                        <span className="text-3xl font-black text-amber-700/40 font-outfit">3º</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-20 w-full" />
                  )}
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-500" />
                  Clasificación Completa
                </h2>
                <span className="text-xs text-slate-500 dark:text-white/40 font-bold uppercase">
                  {leaderboard.length} Participantes
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {leaderboard.map((player) => {
                  const isMe = player.id === currentUserId;
                  return (
                    <motion.div
                      key={player.id}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                        isMe ? "bg-amber-500/10 border-l-4 border-amber-500" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                        player.rank <= 3
                          ? `bg-gradient-to-br ${getMedalColor(player.rank)} text-white shadow-lg`
                          : "bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-white/30"
                      }`}>
                        {player.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                        {player.image ? (
                          <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-600 dark:bg-slate-700 flex items-center justify-center text-white">
                            <UserIcon size={18} />
                          </div>
                        )}
                      </div>

                      {/* Name & Pronósticos Count */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm truncate flex items-center gap-2 ${isMe ? "text-amber-500" : ""}`}>
                          {player.name}
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-black uppercase tracking-wider">
                              Tú
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 dark:text-white/30 font-medium">
                          {player.predictionCount} {player.predictionCount === 1 ? "pronóstico" : "pronósticos"}
                        </span>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-800 dark:text-white">{player.points}</span>
                        <span className="text-[10px] text-slate-400 dark:text-white/30 ml-1 uppercase font-bold">pts</span>
                      </div>
                    </motion.div>
                  );
                })}

                {leaderboard.length === 0 && (
                  <div className="text-center py-12 text-slate-500 dark:text-white/40 italic text-sm">
                    No hay participantes registrados todavía.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
