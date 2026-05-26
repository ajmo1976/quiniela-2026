"use client";

import { ALL_MATCHES } from '@/app/matches/matchesData';



import { useState, useEffect } from "react";
import { Shield, Check, Zap } from "lucide-react";
import { useTournament } from "@/lib/TournamentContext";
import { motion, AnimatePresence } from "framer-motion";
interface Team {
  name: string;
  flag: string;
  code: string;
}

interface Venue {
  stadium: string;
  city: string;
  country: "MEXICO" | "USA" | "CANADA";
}

interface MatchCardProps {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  kickoff: string;
  group: string;
  venue: Venue;
}

const VENUE_FLAGS = {
  MEXICO: "🇲🇽",
  USA: "🇺🇸",
  CANADA: "🇨🇦"
};

export default function MatchCard({ id, homeTeam, awayTeam, date, time, kickoff, group, venue }: MatchCardProps) {
  const { predictions, liveMatches, updatePrediction } = useTournament();

  const prediction = predictions[id] || { homeScore: "", awayScore: "", isDouble: false };
  const liveMatch = liveMatches[id] || { homeScore: null, awayScore: null, status: "scheduled" };

  const isDouble = prediction.isDouble;

  const [isTimeLocked, setIsTimeLocked] = useState(false);

  useEffect(() => {
    const checkLock = () => {
      setIsTimeLocked(new Date() >= new Date(kickoff));
    };
    checkLock();
    const interval = setInterval(checkLock, 5000);
    return () => clearInterval(interval);
  }, [kickoff]);

  const isLocked = liveMatch.status === "live" || liveMatch.status === "finished" || isTimeLocked;

  const [localHome, setLocalHome] = useState(prediction.homeScore);
  const [localAway, setLocalAway] = useState(prediction.awayScore);

  useEffect(() => {
    setLocalHome(prediction.homeScore);
  }, [prediction.homeScore]);

  useEffect(() => {
    setLocalAway(prediction.awayScore);
  }, [prediction.awayScore]);

  const homeScore = localHome;
  const awayScore = localAway;

  const isPredicted = prediction.homeScore !== "" && prediction.awayScore !== "";
  // Check if a double bet has already been used on this match's date
  const doubleUsedInDate = ALL_MATCHES.some(m => m.date === date && predictions[m.id]?.isDouble);
  const doubleDisabled = isLocked || (doubleUsedInDate && !isDouble);
  const isEditable = !isLocked;

  const setHomeScore = (val: string) => {
    if (isLocked) return;
    setLocalHome(val);
    updatePrediction(id, val, localAway, isDouble);
  };

  const setAwayScore = (val: string) => {
    if (isLocked) return;
    setLocalAway(val);
    updatePrediction(id, localHome, val, isDouble);
  };

  const setIsDouble = (val: boolean) => {
    if (isLocked) return;
    updatePrediction(id, localHome, localAway, val);
  };


  // Calculate points earned for this card (if finished)
  const getPointsWon = (): number | null => {
    if (liveMatch.status !== "finished" || !isPredicted) return null;
    
    const predH = parseInt(homeScore);
    const predA = parseInt(awayScore);
    const realH = liveMatch.homeScore;
    const realA = liveMatch.awayScore;

    if (isNaN(predH) || isNaN(predA) || realH === null || realA === null) return null;

    const isExact = predH === realH && predA === realA;
    const predOutcome = predH > predA ? "home" : predH < predA ? "away" : "draw";
    const realOutcome = realH > realA ? "home" : realH < realA ? "away" : "draw";
    const isOutcomeCorrect = predOutcome === realOutcome;

    if (isOutcomeCorrect) {
      if (isDouble) {
        return isExact ? 6 : 2;
      } else {
        return isExact ? 3 : 1;
      }
    }
    return 0;
  };

  const pointsWon = getPointsWon();

  const cardBorderClass = liveMatch.status === "live"
    ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)] ring-1 ring-red-500/50'
    : isDouble 
      ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50' 
      : isPredicted 
        ? 'border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
        : 'border-white/5';

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={`glass-card p-5 w-full relative overflow-hidden group border transition-all duration-500 ${cardBorderClass}`}
    >
      {/* Power-Up / Live Badges */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 z-20 flex gap-2">
        <AnimatePresence>
          {isDouble && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-amber-500 text-black px-3 py-0.5 rounded-b-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg"
            >
              Doble ⚡
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {liveMatch.status === "live" && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-red-600 text-white px-3 py-0.5 rounded-b-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-1 animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              En Vivo 🔴
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Venue Indicator */}
      <div className="absolute top-0 left-0 px-3 py-1 bg-white/5 border-r border-b border-white/10 rounded-br-xl flex items-center gap-2">
        <span className="text-[10px]">{VENUE_FLAGS[venue.country]}</span>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">{venue.city}</span>
      </div>

      {/* Dynamic Status Badge */}
      <div className="absolute -top-1 -right-1 p-4 pointer-events-none z-10">
        <div className={`relative transition-all duration-500 ${isPredicted ? 'scale-110' : 'scale-100 opacity-20'}`}>
          <Shield 
            size={48} 
            className={`transition-colors duration-500 ${isPredicted ? 'text-primary fill-primary/10' : 'text-white'}`} 
          />
          <AnimatePresence>
            {isPredicted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center pt-1"
              >
                <Check size={20} className="text-primary-foreground font-black" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-outfit">
            GRUPO {group} • {date}
          </span>
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{time} VET</span>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-3 items-center gap-2">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
            {homeTeam.flag}
          </span>
          <span className="font-black text-[11px] tracking-tighter uppercase font-outfit text-center leading-tight h-8 flex items-center">
            {homeTeam.name}
          </span>
        </div>

        {/* Score Inputs / Live Score Display */}
        <div className="flex items-center justify-center">
          {liveMatch.status === "scheduled" ? (
            <div className="flex items-center justify-center gap-3">
              <input 
                type="number" 
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black font-outfit focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="-"
              />
              <span className="text-white/20 italic font-black text-xs font-outfit">VS</span>
              <input 
                type="number" 
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black font-outfit focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="-"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black font-outfit ${liveMatch.status === "live" ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {liveMatch.homeScore ?? 0}
                </span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                  liveMatch.status === "live" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                  : "bg-white/10 text-white/50 border border-white/10"
                }`}>
                  {liveMatch.status === "live" ? "LIVE" : "FINAL"}
                </span>
                <span className={`text-3xl font-black font-outfit ${liveMatch.status === "live" ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {liveMatch.awayScore ?? 0}
                </span>
              </div>
              
              <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black text-white/40 uppercase tracking-widest">
                Tu Pred: <span className="text-amber-500 tracking-normal">{homeScore !== "" ? `${homeScore}-${awayScore}` : "-"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
            {awayTeam.flag}
          </span>
          <span className="font-black text-[11px] tracking-tighter uppercase font-outfit text-center leading-tight h-8 flex items-center">
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter mb-1">Estadio</span>
          <span className="text-[9px] font-bold text-white/50 uppercase tracking-tighter truncate max-w-[150px] mb-1">
            {venue.stadium}
          </span>
          {isPredicted && prediction.updatedAt && (
            <span className="text-[8px] font-black text-amber-500/80 italic font-mono flex items-center gap-1">
              📝 {new Date(prediction.updatedAt).toLocaleString("es-VE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pointsWon !== null ? (
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
              pointsWon > 0 
              ? 'bg-green-500/20 border-green-500/40 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
              : pointsWon < 0
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}>
              {pointsWon > 0 ? `+${pointsWon}` : pointsWon} Pts
            </span>
          ) : (
            <>
              {/* Double or Nothing Toggle */}
              <button 
                onClick={() => setIsDouble(!isDouble)}
                disabled={isLocked}
                className={`p-2 rounded-lg transition-all border flex items-center justify-center ${
                  isLocked ? "opacity-30 cursor-not-allowed" : "hover:text-amber-500 hover:border-amber-500/50"
                } ${
                  isDouble 
                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg scale-110' 
                  : 'bg-white/5 border-white/10 text-white/40'
                }`}
                title={isLocked ? "Bloqueado por estar En Vivo/Finalizado" : "Activar Doble o Nada"}
              >
                <Zap size={14} fill={isDouble ? "black" : "none"} />
              </button>

              {isDouble && (
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                  +10 / -3 Pts
                </span>
              )}

              {/* Editable Indicator */}
              {isEditable && (
                <button
                  disabled
                  className="ml-2 p-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-black uppercase"
                  title="Partido editable"
                >
                  Editable
                </button>
              )}
            </>
          )}

          <button className="text-[9px] font-black text-primary uppercase tracking-widest font-outfit hover:underline decoration-2 underline-offset-4">
            STATS →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
