"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { ArrowLeft, Copy, Check, Trash2, Users, Crown, Shield, Edit2, X, User as UserIcon, Eye, Lock, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTournament } from "@/lib/TournamentContext";
import { ALL_MATCHES } from "@/app/matches/matchesData";

interface Member {
  userId: string;
  name: string;
  image: string | null;
  email: string;
  points?: number;
  rank?: number;
}

interface LeagueDetails {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  memberCount: number;
  members: Member[];
  createdAt: string;
}

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  
  const { data: session } = useSession();

  const getRankBadgeStyle = (rank?: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black shadow-amber-500/20";
    if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-500 text-black font-black shadow-slate-400/20";
    if (rank === 3) return "bg-gradient-to-r from-amber-700 to-amber-950 text-white font-black shadow-amber-900/20";
    return "bg-white/10 text-white/60 font-bold border border-white/5";
  };

  const { leagues, deleteLeague, removeMember, renameLeague } = useTournament();
  
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Renaming state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  // Audit modal states
  const [selectedAuditUser, setSelectedAuditUser] = useState<Member | null>(null);
  const [auditPredictions, setAuditPredictions] = useState<Record<number, any>>({});
  const [auditMaxScorer, setAuditMaxScorer] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleOpenAuditModal = async (member: Member) => {
    setSelectedAuditUser(member);
    setLoadingAudit(true);
    setAuditPredictions({});
    setAuditMaxScorer(null);
    try {
      const res = await fetch(`/api/predictions?userId=${member.userId}`);
      const data = await res.json();
      if (data.success) {
        setAuditPredictions(data.predictions || {});
        setAuditMaxScorer(data.maxScorer || null);
      }
    } catch (err) {
      console.error("Error loading predictions for audit:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const currentUserId = (session?.user as any)?.id;

  const fetchLeagueDetails = async () => {
    try {
      const res = await fetch(`/api/leagues/${leagueId}`);
      const data = await res.json();
      if (data.success) {
        setLeagueDetails(data.league);
        setNewName(data.league.name);
      }
    } catch (err) {
      console.error("Error fetching league details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const league = leagues[leagueId] || leagueDetails;
  const isOwner = league?.ownerId === currentUserId;

  const handleCopy = () => {
    if (league) {
      navigator.clipboard.writeText(league.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === leagueDetails?.name) {
      setIsEditingName(false);
      return;
    }
    setUpdatingName(true);
    const res = await renameLeague(leagueId, newName.trim());
    if (res.success) {
      setLeagueDetails((prev) => prev ? { ...prev, name: newName.trim() } : null);
    } else {
      alert(res.error || "Error al renombrar la liga");
    }
    setUpdatingName(false);
    setIsEditingName(false);
  };

  const handleDelete = async () => {
    const success = await deleteLeague(leagueId);
    if (success) {
      router.push("/leagues");
    } else {
      alert("No se pudo eliminar la liga");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeMember(leagueId, memberId);
    if (success) {
      // Refresh local details
      fetchLeagueDetails();
    } else {
      alert("No se pudo expulsar al participante");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Users className="text-amber-500 animate-pulse mx-auto mb-4" size={48} />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">Cargando liga...</p>
        </div>
      </main>
    );
  }

  if (!league) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="text-white/10 mx-auto mb-4" size={64} />
          <h2 className="text-xl font-black mb-2">Liga no encontrada</h2>
          <p className="text-white/40 text-sm mb-6">Esta liga no existe o fue eliminada.</p>
          <Link href="/leagues" className="px-6 py-3 bg-amber-500 text-black font-black text-sm rounded-xl uppercase">
            Volver a Ligas
          </Link>
        </div>
      </main>
    );
  }

  const memberList = leagueDetails?.members || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <Link
          href="/leagues"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-500 font-bold uppercase mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Ligas
        </Link>

        {/* League Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-white/10 p-8 shadow-2xl mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 text-2xl font-black focus:outline-none focus:border-amber-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                  />
                  <button
                    onClick={handleRename}
                    disabled={updatingName}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black uppercase tracking-tight truncate max-w-[400px]">
                    {leagueDetails?.name ?? league.name}
                  </h1>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setNewName(leagueDetails?.name ?? league.name);
                        setIsEditingName(true);
                      }}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                      title="Editar nombre de la liga"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-white/40 mt-1">
                {memberList.length} {memberList.length === 1 ? "miembro" : "miembros"}
              </p>
            </div>
            {isOwner && (
              <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-black rounded-full uppercase">
                <Crown size={12} />
                Creador 👑
              </span>
            )}
          </div>

          {/* Invite Code */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex-1">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">
                Código de Invitación
              </p>
              <p className="text-2xl font-mono font-black text-amber-500 tracking-[0.3em]">
                {league.inviteCode}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg font-bold text-xs uppercase transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        </motion.div>

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/10 p-8 shadow-2xl mb-8"
        >
          <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <Users size={18} className="text-amber-500" />
            Miembros de la Liga
          </h2>

          <div className="space-y-3">
            {memberList.map((member, i) => {
              const isMemberOwner = member.userId === league.ownerId;
              const isMe = member.userId === currentUserId;
              return (
                <div
                  key={member.userId}
                  onClick={() => handleOpenAuditModal(member)}
                  className={`flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors cursor-pointer group/member ${
                    isMe ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10" : ""
                  }`}
                  title="Haga clic para auditar pronósticos de este miembro"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${getRankBadgeStyle(member.rank)}`}>
                      #{member.rank ?? (i + 1)}
                    </div>

                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-600 dark:bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`font-bold text-sm flex items-center gap-2 group-hover/member:text-amber-500 transition-colors ${isMe ? "text-amber-500" : ""}`}>
                        {member.name}
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500 text-black uppercase tracking-wider">
                            Tú
                          </span>
                        )}
                        {isMemberOwner && <Crown size={12} className="text-amber-500 fill-amber-500/20" />}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-white/30 block leading-tight">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Points display */}
                    <div className="text-right font-black flex items-center">
                      <span className="text-base text-amber-500">{member.points ?? 0}</span>
                      <span className="text-[9px] text-slate-500 dark:text-white/40 uppercase ml-1">pts</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/20 group-hover/member:text-amber-500/60 font-black transition-colors flex items-center gap-1">
                        <Eye size={12} /> Auditar
                      </span>
                      {isOwner && !isMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(member.userId);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar miembro"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Admin Danger Zone */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card border border-red-500/10 p-6 shadow-xl"
          >
            <h3 className="text-sm font-black text-red-500/60 uppercase tracking-widest mb-4">
              Zona de Peligro
            </h3>

            {memberList.length > 1 ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 font-bold mb-4 leading-relaxed flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  No puedes eliminar la liga porque hay otros participantes. Expulsa a los demás miembros si deseas borrarla.
                </span>
              </div>
            ) : null}

            {showDeleteConfirm ? (
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-500 dark:text-white/60 flex-1">
                  ¿Estás seguro? Esta acción eliminará permanentemente la liga y no se puede deshacer.
                </p>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg uppercase transition-colors"
                >
                  Sí, Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 font-bold text-xs rounded-lg uppercase transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={memberList.length > 1}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg uppercase transition-colors ${
                  memberList.length > 1
                    ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                    : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                }`}
              >
                <Trash2 size={14} />
                Eliminar Liga
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Transparency / Audit Modal */}
      <AnimatePresence>
        {selectedAuditUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAuditUser(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl w-full bg-[#13131f]/95 border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] text-white"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    {selectedAuditUser.image ? (
                      <img src={selectedAuditUser.image} alt={selectedAuditUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold">
                        {selectedAuditUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-amber-500">Auditoría Transparente 🔍</h3>
                    <p className="text-xs text-white/60">Pronósticos de: <span className="font-bold text-white">{selectedAuditUser.name}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAuditUser(null)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scorer Choice (Transparent once started) */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 mb-4 text-xs flex justify-between items-center">
                <span className="text-white/40 font-bold uppercase tracking-wider">Goleador Campeón Elegido:</span>
                <span className="font-black text-amber-500 text-sm">
                  {loadingAudit ? "Cargando..." : (auditMaxScorer || "— No seleccionado —")}
                </span>
              </div>

              {/* Predictions List Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4 scrollbar-thin scrollbar-thumb-white/10">
                {loadingAudit ? (
                  <div className="space-y-3 py-10 text-center">
                    <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Cargando pronósticos de base de datos...</p>
                  </div>
                ) : (
                  <>
                    {ALL_MATCHES.map((match) => {
                      const pred = auditPredictions[match.id];
                      const hasPrediction = !!pred;
                      const isHidden = pred?.isHidden;

                      return (
                        <div
                          key={match.id}
                          className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                            hasPrediction
                              ? isHidden
                                ? "bg-white/5 border-white/5"
                                : "bg-amber-500/5 border-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.02)]"
                              : "bg-white/[0.02] border-white/5 opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] text-white/30 font-bold uppercase tracking-wider">
                            <span>ID: #{match.id} • GRUPO {match.group}</span>
                            <span>{match.date} • {match.time}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Home flag + code */}
                            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                              <span className="text-xs font-bold text-white truncate max-w-[90px]">{match.homeTeam.name}</span>
                              <span className="text-2xl">{match.homeTeam.flag}</span>
                            </div>

                            {/* Center predictions display */}
                            <div className="mx-6 px-4 py-2 bg-black/40 border border-white/5 rounded-xl min-w-[100px] flex items-center justify-center">
                              {hasPrediction ? (
                                isHidden ? (
                                  <div className="flex items-center gap-1 text-[10px] font-black text-amber-500/80 uppercase tracking-widest" title="El partido no ha comenzado. El pronóstico está oculto por seguridad.">
                                    <Lock size={10} /> Oculto
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 font-black text-sm text-white">
                                    <span>{pred.homeScore}</span>
                                    <span className="text-white/20">-</span>
                                    <span>{pred.awayScore}</span>
                                    {pred.isDouble && <Zap size={12} className="text-amber-500 fill-amber-500/10" />}
                                  </div>
                                )
                              ) : (
                                <span className="text-[10px] font-bold text-white/20 italic">Sin jugar</span>
                              )}
                            </div>

                            {/* Away flag + code */}
                            <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                              <span className="text-2xl">{match.awayTeam.flag}</span>
                              <span className="text-xs font-bold text-white truncate max-w-[90px]">{match.awayTeam.name}</span>
                            </div>
                          </div>

                          {/* Date details */}
                          {hasPrediction && pred.updatedAt && (
                            <div className="text-[8px] font-black text-white/30 italic flex items-center justify-center gap-1 border-t border-white/5 pt-1.5 mt-0.5">
                              <span>📝 Registrado el:</span>
                              <span className="text-white/50 font-mono">
                                {new Date(pred.updatedAt).toLocaleString("es-VE", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-4 text-center">
                <p className="text-[9.5px] text-white/30 font-medium leading-relaxed">
                  🔒 Los pronósticos se revelan automáticamente cuando empieza el respectivo partido.<br />
                  La marca de tiempo 📝 garantiza que la jugada se registró antes del cierre del sistema.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
