"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Copy, ChevronRight } from "lucide-react";
import { useState } from "react";

interface LeagueCardProps {
  league: {
    id: string;
    name: string;
    inviteCode: string;
    memberIds: string[];
  };
}

export default function LeagueCard({ league }: LeagueCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(league.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={`/leagues/${league.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="glass-card border border-white/10 p-6 shadow-xl hover:border-amber-500/30 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors">
            {league.name}
          </h3>
          <ChevronRight
            size={18}
            className="text-white/20 group-hover:text-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Member count */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Users size={14} />
            <span className="font-bold">{league.memberIds.length} miembros</span>
          </div>

          {/* Invite code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md text-xs font-mono text-amber-500/80 hover:bg-white/10 transition-colors"
          >
            <Copy size={12} />
            {copied ? "¡Copiado!" : league.inviteCode}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
