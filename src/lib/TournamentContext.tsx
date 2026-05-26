"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ALL_MATCHES } from "@/app/matches/matchesData";
import type { League } from "@/lib/types";

export interface Prediction {
  homeScore: string;
  awayScore: string;
  isDouble: boolean;
  updatedAt?: string;
}

export interface LiveMatch {
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished";
}

interface TournamentContextType {
  predictions: Record<number, Prediction>;
  liveMatches: Record<number, LiveMatch>;
  maxScorer: string | null;
  userPoints: number;
  userStatus: string | null;
  userImage: string | null;
  // league management
  leagues: Record<string, League>;
  createLeague: (name: string, password?: string) => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
  joinLeague: (code: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  inviteUser: (leagueId: string, userId: string) => void;
  removeMember: (leagueId: string, userId: string) => Promise<boolean>;
  deleteLeague: (leagueId: string) => Promise<boolean>;
  renameLeague: (leagueId: string, name: string) => Promise<{ success: boolean; error?: string }>;
  isMember: (leagueId: string, userId: string) => boolean;

  updatePrediction: (matchId: number, homeScore: string, awayScore: string, isDouble: boolean) => void;
  updateLiveMatch: (matchId: number, homeScore: number | null, awayScore: number | null, status: "scheduled" | "live" | "finished") => void;
  chooseMaxScorer: (name: string | null) => void;
  isTournamentStarted: boolean;
  resetSimulation: () => void;
  refreshProfile: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const BASE_OFFSET_POINTS = 0;
const ACTUAL_TOP_SCORER = "Lionel Messi"; // placeholder

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [liveMatches, setLiveMatches] = useState<Record<number, LiveMatch>>({});
  const [maxScorer, setMaxScorer] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);

  // ==== Private Leagues ====
  const [leagues, setLeagues] = useState<Record<string, League>>({});
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id ?? null;

  const refreshLeagues = async (_uid?: string) => {
    try {
      const res = await fetch(`/api/leagues/list`);
      const data = await res.json();
      if (data.success) {
        const record: Record<string, League> = {};
        data.leagues.forEach((l: any) => {
          record[l.id] = l;
        });
        setLeagues(record);
      }
    } catch (err) {
      console.error("Error refreshing leagues:", err);
    }
  };

  // Reload leagues whenever the logged-in user changes
  useEffect(() => {
    if (userId) refreshLeagues();
    else setLeagues({});
  }, [userId]);

  const createLeague = async (name: string, password?: string): Promise<{ success: boolean; inviteCode?: string; error?: string }> => {
    if (!userId) return { success: false, error: "Debes iniciar sesión primero" };
    try {
      const res = await fetch('/api/leagues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, userId })
      });
      const data = await res.json();
      if (data.success) {
        await refreshLeagues(userId);
        return { success: true, inviteCode: data.inviteCode };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Error in createLeague:", err);
      return { success: false, error: "Error de red al crear la liga" };
    }
  };
  
  const joinLeague = async (code: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!userId) return { success: false, error: "Debes iniciar sesión primero" };
    try {
      const res = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, userId })
      });
      const data = await res.json();
      if (data.success) {
        await refreshLeagues(userId);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Error in joinLeague:", err);
      return { success: false, error: "Error de red al unirse a la liga" };
    }
  };

  const inviteUser = (leagueId: string, userId: string) => {
    // Deprecated / no-op as sharing code is the way.
  };

  const removeMember = async (leagueId: string, memberId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const res = await fetch(`/api/leagues/${leagueId}/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: userId, memberId })
      });
      const data = await res.json();
      if (data.success) {
        await refreshLeagues(userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error in removeMember:", err);
      return false;
    }
  };

  const deleteLeague = async (leagueId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const res = await fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        await refreshLeagues(userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error in deleteLeague:", err);
      return false;
    }
  };

  const renameLeague = async (leagueId: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!userId) return { success: false, error: "Debes iniciar sesión primero" };
    try {
      const res = await fetch(`/api/leagues/${leagueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        await refreshLeagues(userId);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Error in renameLeague:", err);
      return { success: false, error: "Error de red al renombrar la liga" };
    }
  };

  const isMember = (leagueId: string, userId: string) => {
    const league = leagues[leagueId];
    return league ? league.memberIds.includes(userId) : false;
  };

  // Load data from DB if authenticated, otherwise fallback to localStorage
  useEffect(() => {
    const loadData = async () => {
      if (userId) {
        try {
          const [profileRes, predRes, matchesRes] = await Promise.all([
            fetch('/api/profile?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
            fetch('/api/predictions?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()),
            fetch('/api/matches/result?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json())
          ]);
          
          console.log("[TournamentContext] API Responses:", {
            success: profileRes.success,
            hasProfile: !!profileRes.profile,
            imageLength: profileRes.profile?.image ? profileRes.profile.image.length : 0,
            imageStart: profileRes.profile?.image ? profileRes.profile.image.substring(0, 50) : "N/A"
          });
          
          if (profileRes.success && profileRes.profile) {
            setUserStatus(profileRes.profile.status);
            setUserImage(profileRes.profile.image || null);
          }
          if (predRes.success) {
            setPredictions(predRes.predictions || {});
            setMaxScorer(predRes.maxScorer || null);
          }
          if (matchesRes.success) {
            setLiveMatches(matchesRes.results || {});
          }
        } catch (err) {
          console.error("Error loading tournament data from DB:", err);
        }
      } else {
        // Fallback to localStorage
        const savedPredictions = localStorage.getItem("quiniela_predictions");
        const savedLiveMatches = localStorage.getItem("quiniela_live_matches");
        const savedMaxScorer = localStorage.getItem("quiniela_max_scorer");
        setPredictions(savedPredictions ? JSON.parse(savedPredictions) : {});
        setLiveMatches(savedLiveMatches ? JSON.parse(savedLiveMatches) : {});
        setMaxScorer(savedMaxScorer ? JSON.parse(savedMaxScorer) : null);
        setUserStatus(null);
        setUserImage(null);
      }
      setIsLoaded(true);
    };

    loadData();
  }, [userId, session]);

  // Sync across tabs (only for non-logged-in users, since DB is source of truth for logged-in)
  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (!userId) {
        if (e.key === "quiniela_predictions" && e.newValue) setPredictions(JSON.parse(e.newValue));
        if (e.key === "quiniela_live_matches" && e.newValue) setLiveMatches(JSON.parse(e.newValue));
        if (e.key === "quiniela_max_scorer" && e.newValue) setMaxScorer(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, [userId]);

  // Determine if tournament started
  useEffect(() => {
    const started = Object.values(liveMatches).some(m => m.status !== "scheduled");
    setIsTournamentStarted(started);
  }, [liveMatches]);

  // Persist to localStorage (only if NOT logged in, to avoid unnecessary writes)
  useEffect(() => {
    if (isLoaded && !userId) {
      localStorage.setItem("quiniela_predictions", JSON.stringify(predictions));
    }
  }, [predictions, isLoaded, userId]);

  useEffect(() => {
    if (isLoaded && !userId) {
      localStorage.setItem("quiniela_live_matches", JSON.stringify(liveMatches));
    }
  }, [liveMatches, isLoaded, userId]);

  useEffect(() => {
    if (isLoaded && !userId) {
      localStorage.setItem("quiniela_max_scorer", JSON.stringify(maxScorer));
    }
  }, [maxScorer, isLoaded, userId]);

  const updatePrediction = async (matchId: number, homeScore: string, awayScore: string, isDouble: boolean) => {
    if (userId && userStatus !== "ACTIVO") {
      alert("⚠️ Tu suscripción no está activa. Por favor, ve a 'Mi Perfil' en tu menú de usuario y completa tus datos de pago para poder pronosticar.");
      return;
    }

    const match = ALL_MATCHES.find(m => m.id === matchId);
    if (!match) return;

    // Calculate updates to post synchronously using the stable predictions state
    const updatesToPost: Array<{ matchId: number; homeScore: string; awayScore: string; isDouble: boolean }> = [];

    if (isDouble) {
      Object.entries(predictions).forEach(([idStr, pred]) => {
        const id = parseInt(idStr);
        const m = ALL_MATCHES.find(x => x.id === id);
        if (m && m.date === match.date && id !== matchId && pred.isDouble) {
          updatesToPost.push({ matchId: id, homeScore: pred.homeScore, awayScore: pred.awayScore, isDouble: false });
        }
      });
    }
    
    updatesToPost.push({ matchId, homeScore, awayScore, isDouble });

    // 1. Update React state immediately
    setPredictions(prev => {
      const updated = { ...prev };
      updatesToPost.forEach(upd => {
        updated[upd.matchId] = { 
          homeScore: upd.homeScore, 
          awayScore: upd.awayScore, 
          isDouble: upd.isDouble 
        };
      });
      return updated;
    });

    // 2. Persist to database
    if (userId) {
      try {
        await Promise.all(updatesToPost.map(async (upd) => {
          const res = await fetch('/api/predictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(upd)
          });
          const data = await res.json();
          if (data.success && data.updatedAt) {
            setPredictions(prev => {
              if (prev[upd.matchId]) {
                return {
                  ...prev,
                  [upd.matchId]: {
                    ...prev[upd.matchId],
                    updatedAt: data.updatedAt
                  }
                };
              }
              return prev;
            });
          }
        }));
      } catch (err) {
        console.error("Error saving predictions to DB:", err);
      }
    }
  };

  const updateLiveMatch = async (matchId: number, homeScore: number | null, awayScore: number | null, status: "scheduled" | "live" | "finished") => {
    setLiveMatches(prev => ({ ...prev, [matchId]: { homeScore, awayScore, status } }));
    
    try {
      await fetch('/api/matches/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, homeScore, awayScore, status })
      });
    } catch (err) {
      console.error("Error saving live match result to DB:", err);
    }
  };

  const chooseMaxScorer = async (name: string | null) => {
    if (userId && userStatus !== "ACTIVO") {
      alert("⚠️ Tu suscripción no está activa. Por favor, ve a 'Mi Perfil' en tu menú de usuario y completa tus datos de pago para poder elegir tu goleador.");
      return;
    }

    if (isTournamentStarted) {
      console.warn("Cannot change scorer after tournament start");
      return;
    }
    setMaxScorer(name);

    if (userId) {
      try {
        await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxScorer: name })
        });
      } catch (err) {
        console.error("Error saving maxScorer to DB:", err);
      }
    }
  };

  const resetSimulation = async () => {
    setPredictions({});
    setLiveMatches({});
    setMaxScorer(null);

    try {
      await fetch('/api/matches/result', {
        method: 'DELETE'
      });
      if (userId) {
        await fetch('/api/predictions', {
          method: 'DELETE'
        });
      }
    } catch (err) {
      console.error("Error resetting simulation in DB:", err);
    }
  };

  const calculateUserPoints = (): number => {
    let pts = BASE_OFFSET_POINTS;
    Object.entries(predictions).forEach(([matchIdStr, pred]) => {
      const matchId = parseInt(matchIdStr);
      const live = liveMatches[matchId];
      if (!live || live.status !== "finished") return;
      const predHome = parseInt(pred.homeScore);
      const predAway = parseInt(pred.awayScore);
      const realHome = live.homeScore;
      const realAway = live.awayScore;
      if (isNaN(predHome) || isNaN(predAway) || realHome === null || realAway === null) return;
      const isExact = predHome === realHome && predAway === realAway;
      const predOutcome = predHome > predAway ? "home" : predHome < predAway ? "away" : "draw";
      const realOutcome = realHome > realAway ? "home" : realHome < realAway ? "away" : "draw";
      const isOutcomeCorrect = predOutcome === realOutcome;
      if (isOutcomeCorrect) {
        if (pred.isDouble) {
          pts += isExact ? 6 : 2;
        } else {
          pts += isExact ? 3 : 1;
        }
      }
    });
    if (maxScorer && maxScorer === ACTUAL_TOP_SCORER) pts += 15;
    return pts;
  };

  const userPoints = calculateUserPoints();

  const refreshProfile = async () => {
    if (userId) {
      try {
        const res = await fetch('/api/profile?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.profile) {
          setUserStatus(data.profile.status);
          setUserImage(data.profile.image || null);
        }
      } catch (err) {
        console.error("Error refreshing profile in context:", err);
      }
    }
  };

  return (
    <TournamentContext.Provider
      value={{
        predictions,
        liveMatches,
        maxScorer,
        userPoints,
        userStatus,
        userImage,
        // leagues
        leagues,
        createLeague,
        joinLeague,
        inviteUser,
        removeMember,
        deleteLeague,
        renameLeague,
        isMember,
        // other functions
        updatePrediction,
        updateLiveMatch,
        chooseMaxScorer,
        isTournamentStarted,
        resetSimulation,
        refreshProfile,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) throw new Error("useTournament must be used within a TournamentProvider");
  return context;
}
