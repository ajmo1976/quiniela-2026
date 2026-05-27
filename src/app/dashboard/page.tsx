"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Target,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Medal,
  Zap,
  Users,
  Shield,
  PlusCircle,
  LogIn,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTournament } from "@/lib/TournamentContext";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { userPoints, liveMatches, predictions, maxScorer, chooseMaxScorer, isTournamentStarted, leagues, userImage: ctxUserImage } =
    useTournament();
  const [showScorerModal, setShowScorerModal] = useState(false);
  const [customScorer, setCustomScorer] = useState("");
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const user = session?.user;
  const userName = user?.name?.split(" ")[0] ?? "Invitado";
  const userImage = ctxUserImage || user?.image || null;
  const userId = (user as any)?.id ?? null;

  const handleSelectScorer = (name: string) => {
    if (!isTournamentStarted) chooseMaxScorer(name);
    setShowScorerModal(false);
  };
  const handleCustomSelect = () => {
    if (customScorer.trim() && !isTournamentStarted) {
      chooseMaxScorer(customScorer.trim());
      setCustomScorer("");
    }
    setShowScorerModal(false);
  };

  const players = [
    "Lionel Messi","Kylian Mbappé","Neymar Jr.","Luka Modrić","Harry Kane",
    "Cristiano Ronaldo","Erling Haaland","Vinícius Júnior","Lamine Yamal",
    "Lautaro Martínez","Michael Olise","Jude Bellingham","Luis Díaz",
  ];

  useEffect(() => {
    import("@/app/matches/matchesData").then((mod) => setAllMatches(mod.ALL_MATCHES));

    fetch("/api/leaderboard?t=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
        }
      })
      .catch((err) => console.error("Error loading leaderboard in dashboard:", err))
      .finally(() => setLoadingLeaderboard(false));
  }, []);

  const [countdownText, setCountdownText] = useState("00:00:00");
  const [countdownLabel, setCountdownLabel] = useState("Buscando partido...");

  useEffect(() => {
    if (allMatches.length === 0) return;

    const updateTimer = () => {
      const now = new Date();
      const nextMatch = allMatches.find((m) => {
        const live = liveMatches[m.id] || { status: "scheduled" };
        const kickoffDate = new Date(m.kickoff);
        return live.status === "scheduled" && kickoffDate > now;
      });

      if (!nextMatch) {
        setCountdownText("--:--:--");
        setCountdownLabel("Fase de grupos finalizada");
        return;
      }

      const diffMs = new Date(nextMatch.kickoff).getTime() - now.getTime();
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (num: number) => String(num).padStart(2, "0");

      if (days > 0) {
        setCountdownText(`${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setCountdownText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
      setCountdownLabel(`Para ${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name} (${nextMatch.group})`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [allMatches, liveMatches]);

  const finishedMatches = allMatches.filter((m) => {
    const live = liveMatches[m.id];
    return live && live.status === "finished";
  });

  const pointsTrend = userPoints === 0 ? "0 esta semana" : `+${userPoints} esta semana`;
  const myRankingInfo = leaderboard.find((player) => player.id === userId);
  const rankingVal = loadingLeaderboard ? "Cargando..." : (myRankingInfo ? `#${myRankingInfo.rank}` : "—");
  const rankingTrend = myRankingInfo ? `¡Puesto #${myRankingInfo.rank} global!` : "Predice para entrar al ranking";
  const arnaldoRank = myRankingInfo?.rank ?? "—";

  let totalFinishedPredicted = 0;
  let correctOutcomePredicted = 0;
  finishedMatches.forEach((m) => {
    const pred = predictions[m.id];
    if (!pred) return;
    const live = liveMatches[m.id];
    if (!live || live.status !== "finished") return;
    const predHome = parseInt(pred.homeScore);
    const predAway = parseInt(pred.awayScore);
    const realHome = live.homeScore;
    const realAway = live.awayScore;
    if (isNaN(predHome) || isNaN(predAway) || realHome === null || realAway === null) return;
    totalFinishedPredicted++;
    const predOutcome = predHome > predAway ? "home" : predHome < predAway ? "away" : "draw";
    const realOutcome = realHome > realAway ? "home" : realHome < realAway ? "away" : "draw";
    if (predOutcome === realOutcome) correctOutcomePredicted++;
  });

  const effectiveness =
    totalFinishedPredicted > 0
      ? Math.round((correctOutcomePredicted / totalFinishedPredicted) * 100)
      : 0;
  const effectivenessTrendStr =
    totalFinishedPredicted === 0
      ? "Sin partidos finalizados"
      : `${correctOutcomePredicted} de ${totalFinishedPredicted} aciertos`;

  let levelVal = "Novato";
  let levelTrend = "Próximo: Bronce";
  if (userPoints >= 30) { levelVal = "Leyenda"; levelTrend = "¡Nivel máximo!"; }
  else if (userPoints >= 15) { levelVal = "Veterano"; levelTrend = "Próximo: Leyenda"; }
  else if (userPoints >= 5) { levelVal = "Bronce"; levelTrend = "Próximo: Veterano"; }

  const myLeagues = Object.values(leagues);

  // Greeting by time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "¡Buenos días" : hour < 19 ? "¡Buenas tardes" : "¡Buenas noches";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">

        {/* ── Hero Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 glass-card border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* background glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between flex-wrap gap-6">
            {/* Left: Avatar + greeting */}
            <div className="flex items-center gap-5">
              {/* Avatar */}
              {userImage ? (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  src={userImage}
                  alt={userName}
                  className="w-20 h-20 rounded-full border-4 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex-shrink-0"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl font-black text-black border-4 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex-shrink-0"
                >
                  {userName.charAt(0).toUpperCase()}
                </motion.div>
              )}

              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/50 text-sm font-medium mb-1"
                >
                  {greeting},
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-4xl font-black tracking-tight"
                >
                  <span className="text-amber-500">{userName}</span>! 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/40 text-sm mt-1"
                >
                  {user?.email ?? ""}
                </motion.p>
              </div>
            </div>

            {/* Right: Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-6 flex-wrap"
            >
              <div className="text-center">
                <p className="text-3xl font-black text-amber-500">{userPoints}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Puntos</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-teal-400">{myLeagues.length}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Ligas</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-black text-purple-400">{rankingVal}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Ranking</p>
              </div>
            </motion.div>
          </div>

          {/* Level progress bar */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Medal size={14} className="text-purple-400" />
                <span className="text-xs font-black uppercase text-white/60">Nivel: <span className="text-purple-400">{levelVal}</span></span>
              </div>
              <span className="text-xs text-white/30">{levelTrend}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (userPoints / 30) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Puntos Totales" value={String(userPoints)} icon={<Trophy className="text-amber-500" />} trend={pointsTrend} color="amber" />
          <StatCard title="Ranking Global" value={rankingVal} icon={<Target className="text-blue-500" />} trend={rankingTrend} color="blue" />
          <StatCard title="Efectividad" value={`${effectiveness}%`} icon={<TrendingUp className="text-green-500" />} trend={effectivenessTrendStr} color="green" />
          <StatCard title="Nivel" value={levelVal} icon={<Medal className="text-purple-500" />} trend={levelTrend} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Results */}
            <div className="glass-card border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={120} />
              </div>
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-wider">
                <Star className="text-amber-500" size={20} />
                Últimos Resultados
              </h2>
              <div className="space-y-3">
                {finishedMatches.length > 0 ? (
                  finishedMatches.map((m) => {
                    const live = liveMatches[m.id];
                    const pred = predictions[m.id] || { homeScore: "", awayScore: "", isDouble: false };
                    const scoreHome = live.homeScore;
                    const scoreAway = live.awayScore;
                    const predHome = pred.homeScore !== "" ? parseInt(pred.homeScore) : null;
                    const predAway = pred.awayScore !== "" ? parseInt(pred.awayScore) : null;
                    let pointsStr = "0";
                    let statusStr = "none";
                    if (predHome !== null && predAway !== null && scoreHome !== null && scoreAway !== null) {
                      const isExact = predHome === scoreHome && predAway === scoreAway;
                      const predOutcome = predHome > predAway ? "home" : predHome < predAway ? "away" : "draw";
                      const realOutcome = scoreHome > scoreAway ? "home" : scoreHome < scoreAway ? "away" : "draw";
                      const isOutcomeCorrect = predOutcome === realOutcome;
                      let pts = 0;
                      if (isOutcomeCorrect) {
                        if (pred.isDouble) {
                          pts = isExact ? 6 : 2;
                        } else {
                          pts = isExact ? 3 : 1;
                        }
                      }
                      pointsStr = pts > 0 ? `+${pts}` : `${pts}`;
                      statusStr = isExact ? "exact" : isOutcomeCorrect ? "winner" : "none";
                    }
                    return (
                      <ResultRow
                        key={m.id}
                        date={m.date}
                        home={m.homeTeam.name}
                        homeFlag={m.homeTeam.flag}
                        away={m.awayTeam.name}
                        awayFlag={m.awayTeam.flag}
                        pred={predHome !== null ? `${predHome}-${predAway}` : "-"}
                        result={`${scoreHome}-${scoreAway}`}
                        points={pointsStr}
                        status={statusStr}
                        isDouble={pred.isDouble}
                      />
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-white/30 italic">
                    No hay resultados aún. ¡Simula partidos en el panel de admin!
                  </p>
                )}
              </div>
              <Link href="/leaderboard" className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-all text-slate-400 uppercase tracking-widest text-center block">
                Ver ranking completo
              </Link>
            </div>

            {/* My Leagues */}
            {myLeagues.length > 0 && (
              <div className="glass-card border border-white/10 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-wider">
                    <Shield className="text-teal-400" size={20} />
                    Mis Ligas
                  </h2>
                  <Link href="/leagues" className="text-xs text-teal-400 hover:underline font-bold flex items-center gap-1">
                    Ver todas <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {myLeagues.slice(0, 4).map((league) => {
                    const isOwner = league.ownerId === userId;
                    const count = league.memberIds?.length ?? 0;
                    return (
                      <Link key={league.id} href={`/leagues/${league.id}`}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 flex items-center justify-center border border-teal-500/20">
                              <Shield size={18} className="text-teal-400" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{league.name}</p>
                              <p className="text-[11px] text-white/40">
                                {count} miembro{count !== 1 ? "s" : ""}
                                {isOwner && <span className="ml-2 text-amber-500 font-black">👑 Creador</span>}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-mono text-white/20 group-hover:text-teal-400 transition-colors">
                              {league.inviteCode}
                            </p>
                            <ChevronRight size={14} className="text-white/20 group-hover:text-teal-400 ml-auto transition-colors" />
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}

                  {myLeagues.length > 4 && (
                    <Link href="/leagues" className="block text-center text-xs text-teal-400 hover:underline font-bold pt-2">
                      Ver {myLeagues.length - 4} más...
                    </Link>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Link href="/leagues/create" className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-black text-xs rounded-xl border border-teal-500/20 transition-colors">
                      <PlusCircle size={14} /> Crear Liga
                    </Link>
                    <Link href="/leagues/join" className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 font-black text-xs rounded-xl border border-white/10 transition-colors">
                      <LogIn size={14} /> Unirse a Liga
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Bonos */}
            <div className="glass-card border border-white/10 p-6 shadow-xl bg-gradient-to-br from-amber-500/10 to-transparent">
              <h3 className="text-sm font-black text-amber-500/60 mb-4 uppercase tracking-widest">Bonos Especiales</h3>
              <p className="text-xs text-white/60 mb-4 italic">No olvides elegir a tu Máximo Goleador antes del 11 de Junio.</p>
              {maxScorer && <p className="text-xs text-amber-500 mb-2">Goleador seleccionado: <span className="font-bold">{maxScorer}</span></p>}
              <button onClick={() => setShowScorerModal(true)} className="px-4 py-2 bg-amber-500 rounded-lg text-xs font-black uppercase">
                Elegir ahora
              </button>
            </div>

            {showScorerModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                <div className="glass-card p-6 max-w-sm w-full">
                  <h3 className="text-lg font-black mb-4">Elige tu Máximo Goleador</h3>
                  <input
                    type="text"
                    placeholder="Otro nombre"
                    value={customScorer}
                    onChange={(e) => setCustomScorer(e.target.value)}
                    className="w-full mb-2 px-2 py-1 bg-white/5 border border-white/20 rounded"
                  />
                  <button onClick={handleCustomSelect} className="w-full mb-2 px-2 py-1 bg-amber-500 rounded text-xs font-bold">
                    Seleccionar Nombre Personalizado
                  </button>
                  <ul className="space-y-2 mb-4">
                    {players.map((p) => (
                      <li key={p} className="flex justify-between items-center">
                        <span>{p}</span>
                        <button onClick={() => handleSelectScorer(p)} className="px-2 py-1 bg-amber-500 rounded text-xs font-bold">
                          Seleccionar
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowScorerModal(false)} className="mt-2 text-sm underline">Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Global */}
            <div className="glass-card border border-white/10 p-6 shadow-xl">
              <h2 className="text-lg font-black mb-6 flex items-center gap-3 uppercase">
                <Trophy className="text-amber-500" size={18} />
                Top Global
              </h2>
              <div className="space-y-3">
                {loadingLeaderboard ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="h-10 bg-white/5 animate-pulse rounded-lg w-full" />
                  ))
                ) : (
                  <>
                    {/* Render top 3 users from DB */}
                    {leaderboard.slice(0, 3).map((player) => {
                      const isMe = player.id === userId;
                      return (
                        <RankingUser
                          key={player.id}
                          rank={player.rank}
                          name={player.name}
                          points={player.points}
                          isMe={isMe}
                          avatar={player.image}
                        />
                      );
                    })}

                    {/* Show current user if they are not in the top 3 */}
                    {userId && !leaderboard.slice(0, 3).some((player) => player.id === userId) && (() => {
                      const myInfo = leaderboard.find((player) => player.id === userId);
                      if (!myInfo) return null;
                      return (
                        <>
                          <div className="h-px bg-white/5 my-2" />
                          <RankingUser
                            rank={myInfo.rank}
                            name={`${myInfo.name} (Tú)`}
                            points={myInfo.points}
                            isMe={true}
                            avatar={myInfo.image}
                          />
                        </>
                      );
                    })()}

                    {leaderboard.length === 0 && (
                      <p className="text-center py-4 text-xs text-white/30 italic">
                        Sin participantes
                      </p>
                    )}
                  </>
                )}
              </div>
              <Link href="/leaderboard" className="mt-6 flex items-center justify-center gap-2 text-xs font-black text-amber-500 uppercase hover:underline">
                Ver ranking completo <ChevronRight size={14} />
              </Link>
            </div>

            {/* Countdown */}
            <div className="glass-card border border-white/10 p-6 shadow-xl text-center relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-amber-500" />
              </div>
              <h3 className="font-black text-sm uppercase mb-2 tracking-wider text-amber-500">Próximo Cierre</h3>
              <p className="text-2xl font-black text-white tracking-widest font-mono">{countdownText}</p>
              <p className="text-[10px] text-white/50 uppercase mt-1.5 font-bold tracking-wide">{countdownLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function StatCard({ title, value, icon, trend, color }: any) {
  const colorMap: any = {
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    green: "from-green-500/20 to-green-500/5 border-green-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  };
  return (
    <motion.div whileHover={{ y: -5 }} className={`glass-card p-6 border bg-gradient-to-br ${colorMap[color]} shadow-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black tracking-tighter mb-1">{value}</span>
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">{title}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <span className="text-[10px] font-bold text-white/60">{trend}</span>
      </div>
    </motion.div>
  );
}

function ResultRow({ date, home, homeFlag, away, awayFlag, pred, result, points, status, isDouble }: any) {
  const statusColors: any = {
    exact: isDouble
      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-400 font-black scale-105"
      : "bg-amber-500 text-white shadow-lg shadow-amber-500/20",
    winner: isDouble
      ? "bg-green-600 text-white ring-2 ring-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-black"
      : "bg-green-500 text-white",
    none: isDouble
      ? "bg-slate-800/80 text-white/20 ring-1 ring-white/5"
      : "bg-slate-800 text-white/30",
  };
  if (!date || !result) return null;
  const [scoreHome, scoreAway] = result.split("-");
  return (
    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
      <div className="flex flex-col items-center justify-center min-w-[45px] py-1 border-r border-white/10">
        <span className="text-[10px] font-black text-white/30 uppercase leading-none">{date.split(" ")[1] || ""}</span>
        <span className="text-sm font-black leading-none">{date.split(" ")[0] || ""}</span>
      </div>
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="text-xs font-black uppercase truncate hidden sm:block">{home}</span>
          <span className="text-2xl">{homeFlag}</span>
          <span className="text-xl font-black text-white">{scoreHome}</span>
        </div>
        <span className="text-[10px] font-black text-white/10">VS</span>
        <div className="flex items-center gap-3 flex-1 justify-start">
          <span className="text-xl font-black text-white">{scoreAway}</span>
          <span className="text-2xl">{awayFlag}</span>
          <span className="text-xs font-black uppercase truncate hidden sm:block">{away}</span>
        </div>
      </div>
      <div className="flex flex-col items-end px-4 border-l border-white/5">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1">
          {isDouble && <Zap size={10} className="text-amber-500 fill-amber-500 animate-pulse" />}
          Tu Pronóstico
        </span>
        <span className="text-sm font-black text-amber-500/80 tracking-[0.2em]">{pred}</span>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${statusColors[status]}`}>
        {points}
      </div>
    </div>
  );
}

function RankingUser({ rank, name, points, isMe, avatar }: any) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${isMe ? "bg-amber-500/10 border border-amber-500/20" : ""}`}>
      <div className="flex items-center gap-3">
        <span className={`w-6 text-xs font-black ${rank <= 3 ? "text-amber-500" : "text-white/20"}`}>#{rank}</span>
        {isMe && avatar ? (
          <img src={avatar} alt={name} className="w-6 h-6 rounded-full ring-1 ring-amber-500/40" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
            {name.charAt(0)}
          </div>
        )}
        <span className={`text-sm font-bold ${isMe ? "text-amber-500" : ""}`}>{name}</span>
      </div>
      <span className="text-sm font-black italic">{points} pts</span>
    </div>
  );
}
