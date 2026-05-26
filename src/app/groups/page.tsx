"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy, ListOrdered, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { useTournament } from "@/lib/TournamentContext";
import { ALL_MATCHES } from "@/app/matches/matchesData";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface TeamStats {
  name: string;
  flag: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

const GROUP_DATA: Record<string, TeamStats[]> = {
  A: [
    { name: "México", flag: "🇲🇽", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Sudáfrica", flag: "🇿🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Rep. de Corea", flag: "🇰🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Chequia", flag: "🇨🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  B: [
    { name: "Canadá", flag: "🇨🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Suiza", flag: "🇨🇭", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Bosnia y Herz.", flag: "🇧🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Catar", flag: "🇶🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  C: [
    { name: "Brasil", flag: "🇧🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Marruecos", flag: "🇲🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Haití", flag: "🇭🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  D: [
    { name: "EE. UU.", flag: "🇺🇸", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Australia", flag: "🇦🇺", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Paraguay", flag: "🇵🇾", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Turquía", flag: "🇹🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  E: [
    { name: "Alemania", flag: "🇩🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Ecuador", flag: "🇪🇨", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Costa de Marfil", flag: "🇨🇮", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Curazao", flag: "🇨🇼", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  F: [
    { name: "Países Bajos", flag: "🇳🇱", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Japón", flag: "🇯🇵", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Suecia", flag: "🇸🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Túnez", flag: "🇹🇳", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  G: [
    { name: "Bélgica", flag: "🇧🇪", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Egipto", flag: "🇪🇬", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Irán", flag: "🇮🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Nva. Zelanda", flag: "🇳🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  H: [
    { name: "España", flag: "🇪🇸", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Uruguay", flag: "🇺🇾", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Arabia Saudí", flag: "🇸🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "I. Cabo Verde", flag: "🇨🇻", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  I: [
    { name: "Francia", flag: "🇫🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Senegal", flag: "🇸🇳", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Irak", flag: "🇮🇶", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Noruega", flag: "🇳🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Austria", flag: "🇦🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Argelia", flag: "🇩🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Jordania", flag: "🇯🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  K: [
    { name: "Portugal", flag: "🇵🇹", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Colombia", flag: "🇨🇴", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "RD Congo", flag: "🇨🇩", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Uzbekistán", flag: "🇺🇿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
  L: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Croacia", flag: "🇭🇷", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Ghana", flag: "🇬🇭", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
    { name: "Panamá", flag: "🇵🇦", pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 },
  ],
};

// === BRACKET DATA (Official FIFA 2026 structure) ===
const LEFT_R32 = [
  ["1E", "3 ABCDF"],
  ["1I", "3 CDFGH"],
  ["2A", "2C"],
  ["1F", "2B"],
  ["2K", "2L"],
  ["1H", "2J"],
  ["1D", "3 BEFIJ"],
  ["1G", "3 AEHIJ"],
];

const RIGHT_R32 = [
  ["1C", "2F"],
  ["2E", "2I"],
  ["1A", "3 CEFHI"],
  ["1L", "3 EHIJK"],
  ["1J", "2H"],
  ["2D", "2G"],
  ["1B", "3 EFGIJ"],
  ["1K", "3 DEIJL"],
];

const BRACKET_GROUPS_LEFT = [
  { letter: "A", color: "bg-red-500", teams: ["🇲🇽", "🇿🇦", "🇰🇷", "🇨🇿"] },
  { letter: "B", color: "bg-rose-600", teams: ["🇨🇦", "🇧🇦", "🇨🇭", "🇶🇦"] },
  { letter: "C", color: "bg-orange-500", teams: ["🇧🇷", "🇲🇦", "🇭🇹", "🏴"] },
  { letter: "D", color: "bg-amber-600", teams: ["🇺🇸", "🇵🇾", "🇦🇺", "🇹🇷"] },
  { letter: "E", color: "bg-emerald-500", teams: ["🇩🇪", "🇨🇼", "🇨🇮", "🇪🇨"] },
  { letter: "F", color: "bg-lime-500", teams: ["🇳🇱", "🇯🇵", "🇸🇪", "🇹🇳"] },
];

const BRACKET_GROUPS_RIGHT = [
  { letter: "G", color: "bg-fuchsia-500", teams: ["🇧🇪", "🇪🇬", "🇮🇷", "🇳🇿"] },
  { letter: "H", color: "bg-orange-500", teams: ["🇪🇸", "🇨🇻", "🇸🇦", "🇺🇾"] },
  { letter: "I", color: "bg-purple-500", teams: ["🇫🇷", "🇸🇳", "🇮🇶", "🇳🇴"] },
  { letter: "J", color: "bg-green-500", teams: ["🇦🇷", "🇩🇿", "🇦🇹", "🇯🇴"] },
  { letter: "K", color: "bg-red-600", teams: ["🇵🇹", "🇨🇩", "🇺🇿", "🇨🇴"] },
  { letter: "L", color: "bg-lime-400", teams: ["🏴", "🇭🇷", "🇬🇭", "🇵🇦"] },
];


export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"tables" | "bracket">("tables");
  const { liveMatches } = useTournament();

  // Clone template GROUP_DATA to calculate dynamic standings from live matches
  const dynamicGroupData: Record<string, TeamStats[]> = {};
  Object.keys(GROUP_DATA).forEach(g => {
    dynamicGroupData[g] = GROUP_DATA[g].map(team => ({ ...team }));
  });

  // Calculate live group statistics
  ALL_MATCHES.forEach(match => {
    const live = liveMatches[match.id];
    if (!live || live.status === "scheduled") return;

    const homeScore = live.homeScore ?? 0;
    const awayScore = live.awayScore ?? 0;
    const group = match.group;

    const groupTeams = dynamicGroupData[group];
    if (!groupTeams) return;

    const homeTeamStats = groupTeams.find(t => t.name === match.homeTeam.name);
    const awayTeamStats = groupTeams.find(t => t.name === match.awayTeam.name);

    if (homeTeamStats && awayTeamStats) {
      // PJ
      homeTeamStats.pj += 1;
      awayTeamStats.pj += 1;

      // GF & GC
      homeTeamStats.gf += homeScore;
      homeTeamStats.gc += awayScore;
      awayTeamStats.gf += awayScore;
      awayTeamStats.gc += homeScore;

      // DG
      homeTeamStats.dg = homeTeamStats.gf - homeTeamStats.gc;
      awayTeamStats.dg = awayTeamStats.gf - awayTeamStats.gc;

      // G, E, P & Pts
      if (homeScore > awayScore) {
        homeTeamStats.g += 1;
        homeTeamStats.pts += 3;
        awayTeamStats.p += 1;
      } else if (homeScore < awayScore) {
        awayTeamStats.g += 1;
        awayTeamStats.pts += 3;
        homeTeamStats.p += 1;
      } else {
        homeTeamStats.e += 1;
        homeTeamStats.pts += 1;
        awayTeamStats.e += 1;
        awayTeamStats.pts += 1;
      }
    }
  });

  // Sort groups by official rules: Pts -> DG -> GF -> Name
  Object.keys(dynamicGroupData).forEach(g => {
    dynamicGroupData[g].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
  });

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
          <Link href="/groups" className="text-sm font-medium text-amber-500 underline decoration-2 underline-offset-4">Grupos</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 glass-card hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Trophy className="text-amber-500" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Grupos y Posiciones</h1>
                <p className="text-slate-500 dark:text-slate-400">Seguimiento en tiempo real</p>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setActiveTab("tables")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                activeTab === "tables" ? "bg-amber-500 text-white shadow-lg" : "hover:bg-white/10"
              }`}
            >
              <ListOrdered size={18} />
              <span>Tablas</span>
            </button>
            <button 
              onClick={() => setActiveTab("bracket")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                activeTab === "bracket" ? "bg-amber-500 text-white shadow-lg" : "hover:bg-white/10"
              }`}
            >
              <Share2 size={18} />
              <span>Bracket</span>
            </button>
          </div>
        </div>

        {activeTab === "tables" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GROUPS.map((group) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card overflow-hidden border border-white/10 shadow-lg flex flex-col"
              >
                <div className="bg-amber-500/90 px-4 py-2 flex justify-between items-center">
                  <h3 className="font-black text-sm text-white tracking-widest">GRUPO {group}</h3>
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-full text-[9px] border-collapse">
                    <thead>
                      
                      <tr className="bg-slate-100 dark:bg-white/5 font-black text-slate-500 dark:text-slate-400 uppercase border-b border-white/5">
                        <th className="px-2 py-2 text-left">Equipo</th>
                        <th className="px-1 py-2 text-center">PJ</th>
                        <th className="px-1 py-2 text-center">G</th>
                        <th className="px-1 py-2 text-center">E</th>
                        <th className="px-1 py-2 text-center">P</th>
                        <th className="px-1 py-2 text-center">GF</th>
                        <th className="px-1 py-2 text-center">GC</th>
                        <th className="px-1 py-2 text-center">DG</th>
                        <th className="px-2 py-2 text-center text-amber-500">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dynamicGroupData[group].map((team, idx) => (
                        <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                          <td className="px-2 py-2 flex items-center gap-1.5 min-w-[90px]">
                            <span className={`w-0.5 h-3 ${idx < 2 ? "bg-green-500" : "bg-transparent"}`} />
                            <span className="text-base leading-none">{team.flag}</span>
                            <span className="font-bold uppercase truncate">{team.name}</span>
                          </td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.pj}</td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.g}</td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.e}</td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.p}</td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.gf}</td>
                          <td className="px-1 py-2 text-center text-slate-400">{team.gc}</td>
                          <td className="px-1 py-2 text-center text-slate-400 font-bold">{team.dg}</td>
                          <td className="px-2 py-2 text-center font-black text-amber-500 text-xs">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-4 md:p-6 border border-white/10 shadow-2xl overflow-x-auto">
            <h2 className="text-center font-black text-lg tracking-[0.3em] text-white/80 uppercase mb-6">WORLD CHAMPIONS</h2>

            <div className="flex items-stretch min-w-[1500px]" style={{ height: '880px' }}>

              {/* === GRUPOS IZQUIERDA (A-F) === */}
              <div className="flex flex-col justify-around w-20 shrink-0 pr-2">
                {BRACKET_GROUPS_LEFT.map(g => (
                  <div key={g.letter} className={`${g.color} rounded-lg p-1.5 text-center shadow-lg`}>
                    <div className="grid grid-cols-2 gap-0.5 text-sm mb-0.5">
                      {g.teams.map((flag, i) => <span key={i}>{flag}</span>)}
                    </div>
                    <div className="text-[7px] font-black text-white tracking-[0.15em]">GROUP {g.letter}</div>
                  </div>
                ))}
              </div>

              {/* === DIECISEISAVOS IZQUIERDA (R32) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {LEFT_R32.map(([top, bottom], i) => (
                  <div key={i}>
                    <div className="h-7 bg-white/5 border border-white/10 border-l-2 border-l-amber-500/60 flex items-center px-2 text-[9px] font-bold text-white/70 rounded-r-sm">{top}</div>
                    <div className="h-7 bg-white/5 border border-white/10 border-l-2 border-l-white/20 flex items-center px-2 text-[9px] font-bold text-white/40 rounded-r-sm">{bottom}</div>
                  </div>
                ))}
              </div>

              {/* Conector R32→R16 Izq */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                {[0,1,2,3].map(i => (
                  <div key={i} className="border-t border-b border-r border-white/15 rounded-r-sm" style={{ height: '70px' }} />
                ))}
              </div>

              {/* === OCTAVOS IZQUIERDA (R16) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {[0,1,2,3].map(i => (
                  <div key={i}>
                    <div className="h-8 bg-white/5 border border-white/10 border-l-2 border-l-amber-600/60 flex items-center px-2 text-[10px] font-bold text-white/40 italic rounded-r-sm">TBD</div>
                    <div className="h-8 bg-white/5 border border-white/10 border-l-2 border-l-amber-600/60 flex items-center px-2 text-[10px] font-bold text-white/40 italic rounded-r-sm">TBD</div>
                  </div>
                ))}
              </div>

              {/* Conector R16→QF Izq */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                {[0,1].map(i => (
                  <div key={i} className="border-t border-b border-r border-white/15 rounded-r-sm" style={{ height: '170px' }} />
                ))}
              </div>

              {/* === CUARTOS IZQUIERDA (QF) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {[0,1].map(i => (
                  <div key={i}>
                    <div className="h-9 bg-white/5 border border-white/10 border-l-2 border-l-amber-700/60 flex items-center px-2 text-[10px] font-black text-white/40 italic rounded-r-sm">TBD</div>
                    <div className="h-9 bg-white/5 border border-white/10 border-l-2 border-l-amber-700/60 flex items-center px-2 text-[10px] font-black text-white/40 italic rounded-r-sm">TBD</div>
                  </div>
                ))}
              </div>

              {/* Conector QF→SF Izq */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                <div className="border-t border-b border-r border-white/15 rounded-r-sm" style={{ height: '380px' }} />
              </div>

              {/* === SEMIFINAL 1 (IZQUIERDA) === */}
              <div className="flex flex-col justify-center w-32 shrink-0">
                <div>
                  <div className="text-[8px] font-black text-amber-500/60 tracking-widest uppercase text-center mb-1">SEMIFINAL 1</div>
                  <div className="h-10 bg-white/5 border border-amber-500/30 border-l-2 border-l-amber-500 flex items-center px-2 text-xs font-black text-white/40 italic rounded-r-sm">TBD</div>
                  <div className="h-10 bg-white/5 border border-amber-500/30 border-l-2 border-l-amber-500 flex items-center px-2 text-xs font-black text-white/40 italic rounded-r-sm">TBD</div>
                </div>
              </div>

              {/* === CENTRO: FINAL + BRONZE === */}
              <div className="flex flex-col items-center justify-center flex-1 px-4 shrink-0 min-w-[180px]">
                <Trophy size={52} className="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-4" />

                <div className="w-48 bg-white/5 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] p-4 text-center relative overflow-hidden rounded-lg mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                  <div className="text-[9px] font-black text-amber-500 tracking-widest uppercase mb-1 relative z-10">FINAL</div>
                  <div className="text-sm font-black text-white/30 italic relative z-10">TBD vs TBD</div>
                  <div className="text-[8px] text-white/20 font-bold mt-1 relative z-10">19 JUL · NY/NJ</div>
                </div>

                <div className="w-40 bg-white/5 border border-white/10 p-3 text-center rounded-lg">
                  <div className="text-[8px] font-black text-white/25 tracking-widest uppercase mb-1">BRONZE WINNER</div>
                  <div className="text-[10px] font-bold text-white/20 italic">TBD vs TBD</div>
                </div>
              </div>

              {/* === SEMIFINAL 2 (DERECHA) === */}
              <div className="flex flex-col justify-center w-32 shrink-0">
                <div>
                  <div className="text-[8px] font-black text-amber-500/60 tracking-widest uppercase text-center mb-1">SEMIFINAL 2</div>
                  <div className="h-10 bg-white/5 border border-amber-500/30 border-r-2 border-r-amber-500 flex items-center justify-end px-2 text-xs font-black text-white/40 italic rounded-l-sm">TBD</div>
                  <div className="h-10 bg-white/5 border border-amber-500/30 border-r-2 border-r-amber-500 flex items-center justify-end px-2 text-xs font-black text-white/40 italic rounded-l-sm">TBD</div>
                </div>
              </div>

              {/* Conector SF←QF Der */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                <div className="border-t border-b border-l border-white/15 rounded-l-sm" style={{ height: '380px' }} />
              </div>

              {/* === CUARTOS DERECHA (QF) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {[0,1].map(i => (
                  <div key={i}>
                    <div className="h-9 bg-white/5 border border-white/10 border-r-2 border-r-amber-700/60 flex items-center justify-end px-2 text-[10px] font-black text-white/40 italic rounded-l-sm">TBD</div>
                    <div className="h-9 bg-white/5 border border-white/10 border-r-2 border-r-amber-700/60 flex items-center justify-end px-2 text-[10px] font-black text-white/40 italic rounded-l-sm">TBD</div>
                  </div>
                ))}
              </div>

              {/* Conector QF←R16 Der */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                {[0,1].map(i => (
                  <div key={i} className="border-t border-b border-l border-white/15 rounded-l-sm" style={{ height: '170px' }} />
                ))}
              </div>

              {/* === OCTAVOS DERECHA (R16) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {[0,1,2,3].map(i => (
                  <div key={i}>
                    <div className="h-8 bg-white/5 border border-white/10 border-r-2 border-r-amber-600/60 flex items-center justify-end px-2 text-[10px] font-bold text-white/40 italic rounded-l-sm">TBD</div>
                    <div className="h-8 bg-white/5 border border-white/10 border-r-2 border-r-amber-600/60 flex items-center justify-end px-2 text-[10px] font-bold text-white/40 italic rounded-l-sm">TBD</div>
                  </div>
                ))}
              </div>

              {/* Conector R16←R32 Der */}
              <div className="flex flex-col justify-around w-5 shrink-0">
                {[0,1,2,3].map(i => (
                  <div key={i} className="border-t border-b border-l border-white/15 rounded-l-sm" style={{ height: '70px' }} />
                ))}
              </div>

              {/* === DIECISEISAVOS DERECHA (R32) === */}
              <div className="flex flex-col justify-around w-28 shrink-0">
                {RIGHT_R32.map(([top, bottom], i) => (
                  <div key={i}>
                    <div className="h-7 bg-white/5 border border-white/10 border-r-2 border-r-amber-500/60 flex items-center justify-end px-2 text-[9px] font-bold text-white/70 rounded-l-sm">{top}</div>
                    <div className="h-7 bg-white/5 border border-white/10 border-r-2 border-r-white/20 flex items-center justify-end px-2 text-[9px] font-bold text-white/40 rounded-l-sm">{bottom}</div>
                  </div>
                ))}
              </div>

              {/* === GRUPOS DERECHA (G-L) === */}
              <div className="flex flex-col justify-around w-20 shrink-0 pl-2">
                {BRACKET_GROUPS_RIGHT.map(g => (
                  <div key={g.letter} className={`${g.color} rounded-lg p-1.5 text-center shadow-lg`}>
                    <div className="grid grid-cols-2 gap-0.5 text-sm mb-0.5">
                      {g.teams.map((flag, i) => <span key={i}>{flag}</span>)}
                    </div>
                    <div className="text-[7px] font-black text-white tracking-[0.15em]">GROUP {g.letter}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
