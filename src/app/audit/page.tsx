"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Lock, 
  Unlock, 
  User as UserIcon, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Calendar,
  Globe,
  Star
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

interface AuditUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  status: string;
  role: string;
  _count: {
    predictions: number;
  };
}

interface AuditedPrediction {
  matchId: number;
  homeTeam: { name: string; flag: string; code: string };
  awayTeam: { name: string; flag: string; code: string };
  date: string;
  time: string;
  group: string;
  status: string;
  isLocked: boolean;
  hasPredicted: boolean;
  homeScore: number | null;
  awayScore: number | null;
  isDouble: boolean;
  updatedAt: string | null;
  auditHash: string | null;
  isHashValid: boolean | null;
}

interface SelectedUserDetail {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  maxScorer: string | null;
  isMaxScorerHidden: boolean;
  status: string;
}

export default function AuditPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [users, setUsers] = useState<AuditUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<SelectedUserDetail | null>(null);
  const [predictions, setPredictions] = useState<AuditedPrediction[]>([]);
  
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        if (data.success) {
          setUsers(data.users || []);
          // Pre-select current user or first user if available
          const currentId = (session?.user as any)?.id;
          const foundSelf = data.users.find((u: any) => u.id === currentId);
          if (foundSelf) {
            setSelectedUserId(foundSelf.id);
          } else if (data.users.length > 0) {
            setSelectedUserId(data.users[0].id);
          }
        } else {
          setErrorMsg(data.error || "Error al cargar los participantes");
        }
      } catch (err) {
        console.error("Error loading audit users:", err);
        setErrorMsg("Error de red al cargar los datos");
      } finally {
        setLoadingUsers(false);
      }
    };

    if (sessionStatus === "authenticated") {
      fetchUsers();
    }
  }, [sessionStatus, session]);

  // Load details whenever selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/audit?userId=${selectedUserId}`);
        const data = await res.json();
        if (data.success) {
          setUserDetail(data.user);
          setPredictions(data.predictions || []);
        } else {
          console.error("Error loading user detail:", data.error);
        }
      } catch (err) {
        console.error("Error loading user detail:", err);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedUserId]);

  const filteredUsers = users.filter((u) => {
    const name = u.name?.toLowerCase() || "";
    const email = u.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-center">
          <Globe className="text-amber-500 animate-spin mx-auto mb-4" size={48} />
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
        <Lock size={48} className="text-red-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-black uppercase mb-2">Acceso No Autorizado</h1>
        <p className="text-white/60 text-sm max-w-sm mb-6">
          Debes iniciar sesión con tu cuenta aprobada para poder acceder al sistema de auditoría pública.
        </p>
        <Link 
          href="/auth/login"
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black rounded-xl text-sm uppercase tracking-wider hover:opacity-95 transition-opacity"
        >
          Iniciar Sesión
        </Link>
      </main>
    );
  }

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
          <Link href="/audit" className="text-sm font-medium text-amber-500 underline decoration-2 underline-offset-4">Auditar</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-500 font-bold uppercase mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
              <ShieldCheck className="text-amber-500" size={36} />
              Auditoría <span className="text-amber-500">Pública</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Evidencia criptográfica e inalterable de los pronósticos registrados por cada participante. Transparencia total antes y después de cada partido.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-2xl mb-8">
            ❌ {errorMsg}
          </div>
        )}

        {/* Audit layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Participants List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card border border-white/10 p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-black uppercase text-slate-500 dark:text-white/40 tracking-wider">
                Participantes Activos
              </h2>
              
              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {loadingUsers ? (
                  [1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-16 bg-white/5 animate-pulse rounded-xl w-full" />
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    const letter = u.name?.charAt(0).toUpperCase() || "U";
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-700 dark:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {u.image ? (
                            <img src={u.image} alt={u.name || ""} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-800 dark:text-white flex-shrink-0">
                              {letter}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{u.name || "Usuario"}</p>
                            <p className="text-[10px] text-slate-400 dark:text-white/20 truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-400"
                          }`}>
                            {u._count.predictions} jugadas
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 italic">No se encontraron participantes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: User Predictions Audits */}
          <div className="lg:col-span-2 space-y-6">
            {loadingDetail ? (
              <div className="glass-card border border-white/10 p-12 text-center shadow-xl">
                <Globe className="text-amber-500 animate-spin mx-auto mb-4" size={32} />
                <p className="text-xs text-slate-500 dark:text-white/40 uppercase tracking-widest font-black">Cargando auditoría de pronósticos...</p>
              </div>
            ) : userDetail ? (
              <>
                {/* Participant Header Card */}
                <div className="glass-card border border-white/10 p-6 shadow-xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={180} />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                    <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                      {userDetail.image ? (
                        <img 
                          src={userDetail.image} 
                          alt={userDetail.name || ""} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/50 shadow-lg shadow-amber-500/10" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl font-black text-black border-2 border-amber-500/50 shadow-lg shadow-amber-500/10">
                          {userDetail.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                          {userDetail.name}
                          {userDetail.id === (session?.user as any)?.id && (
                            <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Tú</span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-white/40 mb-1">{userDetail.email}</p>
                        <p className="text-[11px] font-bold text-amber-500 flex items-center justify-center sm:justify-start gap-1">
                          <CheckCircle2 size={12} /> Cuenta de Participación Activa
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto items-center sm:items-end">
                      <span className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-black">
                        Elección Goleador
                      </span>
                      {userDetail.isMaxScorerHidden ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800/80 text-white/50 text-xs font-black rounded-xl border border-white/5 uppercase tracking-wide">
                          <Lock size={12} /> Oculto hasta kickoff
                        </span>
                      ) : userDetail.maxScorer ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-black rounded-xl border border-amber-500/20 uppercase tracking-wide">
                          ⚽ {userDetail.maxScorer}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-white/20 italic">No seleccionado</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Predictions Audit List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase text-slate-500 dark:text-white/40 tracking-wider">
                    Registro Detallado de Pronósticos ({predictions.filter(p => p.hasPredicted).length} / {predictions.length})
                  </h3>

                  <div className="space-y-4">
                    {predictions.map((pred) => {
                      return (
                        <div 
                          key={pred.matchId}
                          className="glass-card border border-white/10 p-5 shadow-lg bg-[#111119]/40 hover:bg-[#111119]/80 transition-all flex flex-col gap-4 relative"
                        >
                          {/* Row 1: Match metadata */}
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/5 pb-2">
                            <span className="text-[10px] text-slate-400 dark:text-white/30 font-black uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar size={12} className="text-amber-500" />
                              {pred.date} @ {pred.time} • Grupo {pred.group}
                            </span>
                            
                            {/* Match Lock Status Badge */}
                            {pred.isLocked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-red-500/20">
                                <Lock size={9} /> Partido Iniciado (Cerrado)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-green-500/20">
                                <Unlock size={9} /> Abierto para predicción
                              </span>
                            )}
                          </div>

                          {/* Row 2: Teams comparison and prediction box */}
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            
                            {/* Teams Flags and Names */}
                            <div className="flex items-center gap-4 flex-1 w-full justify-center md:justify-start">
                              <div className="text-right flex-1 min-w-[70px] hidden sm:block">
                                <p className="text-xs font-black uppercase truncate">{pred.homeTeam.name}</p>
                              </div>
                              <span className="text-3xl filter drop-shadow">{pred.homeTeam.flag}</span>
                              <span className="text-xs font-black text-slate-400">VS</span>
                              <span className="text-3xl filter drop-shadow">{pred.awayTeam.flag}</span>
                              <div className="text-left flex-1 min-w-[70px] hidden sm:block">
                                <p className="text-xs font-black uppercase truncate">{pred.awayTeam.name}</p>
                              </div>
                            </div>

                            {/* Prediction Box */}
                            <div className="flex items-center gap-3">
                              {pred.hasPredicted ? (
                                <div className="flex items-center gap-3">
                                  {pred.isDouble && (
                                    <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-[9px] font-black rounded-md border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
                                      <Zap size={9} className="fill-amber-500" />
                                      Doble
                                    </span>
                                  )}

                                  {pred.homeScore === null ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 text-white/50 text-xs font-black rounded-xl border border-white/5 uppercase tracking-wide">
                                      <Lock size={12} className="text-white/40" /> Oculto hasta kickoff
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center px-4 py-2 bg-amber-500 text-black font-black text-sm rounded-xl tracking-[0.2em] shadow-md shadow-amber-500/10 min-w-[75px] text-center border border-amber-400">
                                      {pred.homeScore} - {pred.awayScore}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 dark:text-white/20 italic">Sin pronóstico</span>
                              )}
                            </div>

                          </div>

                          {/* Row 3: Audit Trail Metadata */}
                          {pred.hasPredicted && (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/5 text-[10px] text-slate-400 dark:text-white/30 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-400" />
                                Registrado: <span className="font-bold text-slate-800 dark:text-white">{formatDate(pred.updatedAt)}</span>
                              </span>

                              {/* Cryptographic Hash Verification Badge */}
                              <div className="flex items-center gap-2">
                                {pred.auditHash ? (
                                  <>
                                    <span className="font-mono text-white/20 bg-black/30 px-2 py-1 rounded border border-white/5">
                                      Hash: {pred.auditHash.substring(0, 12)}...
                                    </span>
                                    {pred.isHashValid ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 font-black rounded-lg border border-green-500/20 uppercase tracking-wider text-[9px] shadow-[0_0_10px_rgba(34,197,94,0.05)]">
                                        <ShieldCheck size={11} /> Sello Válido
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/15 text-red-400 font-black rounded-lg border border-red-500/30 uppercase tracking-wider text-[9px] animate-pulse">
                                        <ShieldAlert size={11} /> Firma Inválida
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 font-black rounded-lg border border-yellow-500/20 uppercase tracking-wider text-[9px]">
                                    <HelpCircle size={11} /> Sin Validar
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card border border-white/10 p-12 text-center shadow-xl text-slate-500 dark:text-white/40 italic text-sm">
                Selecciona un participante de la lista para ver su registro de pronósticos y validar su evidencia criptográfica.
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
