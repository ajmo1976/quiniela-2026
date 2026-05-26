"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Settings, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Zap,
  Users,
  Check,
  X,
  Eye,
  ShieldCheck,
  AlertCircle,
  Lock
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { ALL_MATCHES } from "@/app/matches/matchesData";
import { useTournament } from "@/lib/TournamentContext";

export default function AdminSimulatorPage() {
  const { data: session, status } = useSession();
  const { liveMatches, updateLiveMatch, resetSimulation, userPoints } = useTournament();
  const [filter, setFilter] = useState<"ALL" | "scheduled" | "live" | "finished">("ALL");

  // Loading state skeleton
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Verificando credenciales...</p>
        </div>
      </main>
    );
  }

  // Access check
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full glass-card border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Top warning icon */}
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <Lock size={36} className="animate-pulse" />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight mb-3 font-outfit">
            Acceso Restringido 🔒
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Lo sentimos, esta sección es exclusiva para administradores del sistema. No tienes los permisos necesarios para ver esta consola.
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] text-center"
            >
              Volver al Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center"
            >
              Ir al Inicio
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }
  const [activeTab, setActiveTab] = useState<"matches" | "users">("matches");

  // Admin users list states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Error loading users for admin:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local user list
        fetchUsers();
      } else {
        alert(data.error || "Error al actualizar estatus");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local user list
        fetchUsers();
      } else {
        alert(data.error || "Error al actualizar rol");
      }
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  // Reset all simulation to default
  const handleResetAll = () => {
    if (confirm("¿Estás seguro de que quieres reiniciar toda la simulación? Se borrarán tus marcadores en vivo actuales.")) {
      resetSimulation();
    }
  };

  const getMatchState = (id: number) => {
    return liveMatches[id] || { homeScore: null, awayScore: null, status: "scheduled" };
  };

  const filteredMatches = ALL_MATCHES.filter(match => {
    const state = getMatchState(match.id);
    if (filter === "ALL") return true;
    return state.status === filter;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="text-amber-500 animate-spin" size={24} style={{ animationDuration: '6s' }} />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">
            CONSOLA SIMULADOR
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-amber-500 transition-colors">Dashboard</Link>
          <Link href="/matches" className="text-sm font-medium hover:text-amber-500 transition-colors">Partidos</Link>
          <Link href="/groups" className="text-sm font-medium hover:text-amber-500 transition-colors">Grupos</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        {/* Header Control Panel */}
        <div className="glass-card p-6 border border-white/10 mb-8 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Settings size={180} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-black text-amber-500 uppercase tracking-widest mb-3">
                <Sparkles size={12} /> Sandbox de Pruebas
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
                Panel de Administración y Control
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm leading-relaxed">
                Cambia los resultados y aprueba las suscripciones de los participantes de la Quiniela Pro 2026.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="glass-card px-5 py-3 border border-white/10 text-center flex flex-col justify-center">
                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Puntos de Arnaldo</span>
                <span className="text-2xl font-black text-amber-500">{userPoints} pts</span>
              </div>
              
              <button 
                onClick={handleResetAll}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:scale-[1.02]"
              >
                <RotateCcw size={16} /> Reiniciar Todo
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border ${
              activeTab === "matches"
                ? "bg-amber-500 border-amber-500 text-black shadow-lg scale-105"
                : "glass-card border-white/5 hover:border-white/20 text-white/60 hover:text-white"
            }`}
          >
            Partidos y Simulación
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border ${
              activeTab === "users"
                ? "bg-amber-500 border-amber-500 text-black shadow-lg scale-105"
                : "glass-card border-white/5 hover:border-white/20 text-white/60 hover:text-white"
            }`}
          >
            Usuarios y Pagos ($5 USD)
          </button>
        </div>

        {activeTab === "matches" ? (
          /* =========================================================================
             TAB 1: MATCH SIMULATOR
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: "Todos los Juegos" },
                { id: "scheduled", label: "Programados" },
                { id: "live", label: "En Vivo 🔴" },
                { id: "finished", label: "Finalizados" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                    filter === tab.id
                    ? "bg-amber-500 border-amber-500 text-black shadow-lg scale-105"
                    : "glass-card border-white/5 hover:border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMatches.map(match => {
                  const state = getMatchState(match.id);
                  
                  return (
                    <motion.div
                      key={match.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`glass-card p-5 border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
                        state.status === "live"
                        ? "border-red-500/40 bg-gradient-to-r from-red-950/20 via-transparent to-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        : state.status === "finished"
                          ? "border-amber-500/20 opacity-80"
                          : "border-white/5"
                      }`}
                    >
                      {/* Game Meta & Teams */}
                      <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 w-full">
                        {/* Meta */}
                        <div className="flex flex-col text-center sm:text-left min-w-[120px]">
                          <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest font-outfit">
                            ID: #{match.id} • GRUPO {match.group}
                          </span>
                          <span className="text-xs font-bold text-white/50">{match.date} • {match.time}</span>
                          <div className="mt-2">
                            {state.status === "scheduled" && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-slate-800 text-slate-400 uppercase tracking-widest border border-slate-700">
                                Programado
                              </span>
                            )}
                            {state.status === "live" && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-red-500/20 text-red-400 uppercase tracking-widest border border-red-500/40 animate-pulse">
                                EN VIVO 🔴
                              </span>
                            )}
                            {state.status === "finished" && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-green-500/20 text-green-400 uppercase tracking-widest border border-green-500/40">
                                Finalizado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Flag vs Flag Display */}
                        <div className="flex-1 flex items-center justify-center sm:justify-start gap-4">
                          <div className="flex items-center gap-2 min-w-[140px] justify-end">
                            <span className="text-xs font-black uppercase truncate max-w-[100px] text-right">{match.homeTeam.name}</span>
                            <span className="text-3xl">{match.homeTeam.flag}</span>
                          </div>

                          {/* Scores */}
                          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-outfit">
                            {state.status === "scheduled" ? (
                              <span className="text-lg font-black text-white/30 italic">VS</span>
                            ) : (
                              <div className="flex items-center gap-3 font-black text-xl">
                                <span className={state.status === "live" ? "text-red-400" : "text-white"}>
                                  {state.homeScore ?? 0}
                                </span>
                                <span className="text-white/20">-</span>
                                <span className={state.status === "live" ? "text-red-400" : "text-white"}>
                                  {state.awayScore ?? 0}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 min-w-[140px] justify-start">
                            <span className="text-3xl">{match.awayTeam.flag}</span>
                            <span className="text-xs font-black uppercase truncate max-w-[100px] text-left">{match.awayTeam.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controller Action buttons */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                        {state.status === "scheduled" && (
                          <button
                            onClick={() => updateLiveMatch(match.id, 0, 0, "live")}
                            className="w-full md:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                          >
                            <Play size={12} fill="white" /> Iniciar Partido
                          </button>
                        )}

                        {state.status === "live" && (
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            {/* Gol Local */}
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-lg">
                              <span className="text-[10px] font-black uppercase px-2 text-white/40">Goles {match.homeTeam.code}</span>
                              <button
                                onClick={() => updateLiveMatch(match.id, Math.max(0, (state.homeScore ?? 0) - 1), state.awayScore, "live")}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded"
                              >
                                <Minus size={10} />
                              </button>
                              <button
                                onClick={() => updateLiveMatch(match.id, (state.homeScore ?? 0) + 1, state.awayScore, "live")}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* Gol Visitante */}
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-lg">
                              <span className="text-[10px] font-black uppercase px-2 text-white/40">Goles {match.awayTeam.code}</span>
                              <button
                                onClick={() => updateLiveMatch(match.id, state.homeScore, Math.max(0, (state.awayScore ?? 0) - 1), "live")}
                                className="p-1.5 bg-white/5 hover:bg-white/10 rounded"
                              >
                                <Minus size={10} />
                              </button>
                              <button
                                onClick={() => updateLiveMatch(match.id, state.homeScore, (state.awayScore ?? 0) + 1, "live")}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* Finalizar */}
                            <button
                              onClick={() => updateLiveMatch(match.id, state.homeScore ?? 0, state.awayScore ?? 0, "finished")}
                              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                            >
                              <CheckCircle size={12} /> Finalizar
                            </button>
                          </div>
                        )}

                        {state.status === "finished" && (
                          <button
                            onClick={() => updateLiveMatch(match.id, null, null, "scheduled")}
                            className="w-full md:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw size={10} /> Re-programar
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredMatches.length === 0 && (
                <div className="text-center py-16 glass-card border border-white/5 text-white/40 italic">
                  No hay partidos que coincidan con este filtro.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
             TAB 2: USER & SUBSCRIPTIONS MANAGEMENT
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Users size={18} className="text-amber-500" />
                Control de Participantes ({usersList.length})
              </h2>
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl uppercase transition-colors"
              >
                Actualizar Lista
              </button>
            </div>

            {loadingUsers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-white/5 animate-pulse rounded-2xl w-full border border-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usersList.map((player) => {
                  const getStatusStyle = (s: string) => {
                    if (s === "ACTIVO") return "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.05)]";
                    if (s === "RECHAZADO") return "bg-red-500/20 text-red-400 border border-red-500/30";
                    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse";
                  };

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card border border-white/10 p-6 flex flex-col justify-between gap-6 hover:border-amber-500/20 transition-all duration-300"
                    >
                      {/* Top section: Profile Info */}
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                              {player.image ? (
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                                  {player.name?.charAt(0).toUpperCase() ?? "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm leading-none">{player.name ?? "Invitado"}</h3>
                              <span className="text-[10px] text-white/40">{player.email}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getStatusStyle(player.status)}`}>
                              {player.status === "ACTIVO" ? "Activo" : player.status === "RECHAZADO" ? "Rechazado" : "Pendiente"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              player.role === "ADMIN" 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              {player.role || "USER"}
                            </span>
                          </div>
                        </div>

                        {/* Extra details (Fav team, Contact phone) */}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-white/30 block leading-none">Equipo Preferido</span>
                            <span className="font-bold text-white/80">{player.favoriteTeam || "No indicado"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-white/30 block leading-none">Contacto</span>
                            <span className="font-bold text-white/80">{player.phoneNumber || "No indicado"}</span>
                          </div>
                        </div>

                        {/* Payment details */}
                        <div className="space-y-1.5 text-xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-amber-500/70 border-b border-white/5 pb-1">Datos de Transferencia</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-white/60">
                            <p>👤 <span className="font-bold text-white/80">{player.bankOwner || "—"}</span></p>
                            <p>🏦 <span className="font-bold text-white/80">{player.bankName || "—"}</span></p>
                            <p>📱 <span className="font-bold text-white/80">{player.bankAccount || "—"}</span></p>
                            <p>🔢 Ref: <span className="font-bold text-amber-500 font-mono">{player.paymentRef || "—"}</span></p>
                          </div>
                        </div>

                        {/* Payment Receipt Image Support */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                          {player.paymentReceipt ? (
                            <div className="flex items-center gap-3">
                              <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                                <img src={player.paymentReceipt} alt="Comprobante" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => setSelectedReceipt(player.paymentReceipt)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold rounded-lg uppercase transition-all text-amber-500"
                              >
                                <Eye size={12} /> Ver Soporte Completo
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-white/30 italic">
                              <AlertCircle size={14} /> Sin comprobante de pago adjunto
                            </div>
                          )}
                        </div>

                        {/* System Role Management */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                          <div className="text-xs">
                            <span className="text-[10px] uppercase tracking-wider text-white/30 block leading-none mb-1">Permisos del Sistema</span>
                            <span className="font-black text-white/80">Rol: {player.role === "ADMIN" ? "Administrador 👑" : "Participante 👤"}</span>
                          </div>
                          <div>
                            {player.role === "ADMIN" ? (
                              <button
                                onClick={() => handleUpdateRole(player.id, "USER")}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase transition-all"
                              >
                                Quitar Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateRole(player.id, "ADMIN")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-black uppercase transition-all"
                              >
                                Hacer Admin
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Panel */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                        <button
                          onClick={() => handleUpdateStatus(player.id, "ACTIVO")}
                          disabled={player.status === "ACTIVO"}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            player.status === "ACTIVO"
                              ? "bg-green-500/10 border-green-500/20 text-green-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 border-green-500 text-black shadow-md"
                          }`}
                        >
                          <Check size={12} /> Aprobar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(player.id, "RECHAZADO")}
                          disabled={player.status === "RECHAZADO"}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            player.status === "RECHAZADO"
                              ? "bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed"
                              : "bg-transparent hover:bg-red-500/10 border-red-500/30 hover:border-red-500 text-red-400"
                          }`}
                        >
                          <X size={12} /> Rechazar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(player.id, "PENDIENTE")}
                          disabled={player.status === "PENDIENTE"}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            player.status === "PENDIENTE"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 cursor-not-allowed"
                              : "bg-transparent hover:bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500 text-yellow-400"
                          }`}
                        >
                          <RotateCcw size={10} /> Pendiente
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {usersList.length === 0 && (
                  <div className="col-span-2 text-center py-16 glass-card border border-white/5 text-white/40 italic">
                    No hay usuarios registrados en el sistema todavía.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Image Viewer Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReceipt(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center"
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-amber-500 transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={selectedReceipt}
                alt="Soporte de pago ampliado"
                className="max-w-full max-h-[80vh] object-contain rounded-xl border border-white/10 shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
