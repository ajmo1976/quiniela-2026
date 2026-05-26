"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, ChevronDown, User as UserIcon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTournament } from "@/lib/TournamentContext";
import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const { userPoints, userImage } = useTournament();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => signIn("google", { callbackUrl: "/dashboard" });
  const handleLogout = () => signOut({ callbackUrl: "/" });

  if (status === "loading") {
    return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;
  }

  if (!session) {
    return (
      <motion.button
        id="navbar-login-btn"
        onClick={handleLogin}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow"
      >
        <LogIn size={15} />
        Entrar
      </motion.button>
    );
  }

  const user = session.user!;
  const userId = (user as any).id;
  const name = user.name ?? "Usuario";
  const firstLetter = name.charAt(0).toUpperCase();
  const displayImage = userImage || user.image;

  return (
    <div className="relative">
      <motion.button
        id="user-menu-btn"
        onClick={() => setMenuOpen((v) => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 group"
      >
        {/* Avatar */}
        {displayImage ? (
          <img
            src={displayImage}
            alt={name}
            className="w-10 h-10 rounded-full border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:border-amber-500 transition-colors object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] border-2 border-amber-500/60">
            {firstLetter}
          </div>
        )}

        {/* Name + Points - hidden on small screens */}
        <div className="hidden md:block text-right">
          <p className="text-xs font-black font-outfit uppercase tracking-tighter leading-tight">
            {name.split(" ")[0]}
          </p>
          <p className="text-[10px] text-amber-500 font-bold">{userPoints} pts</p>
        </div>

        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="user-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-14 w-64 bg-[#13131f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {displayImage ? (
                  <img src={displayImage} alt={name} className="w-10 h-10 rounded-full ring-2 ring-amber-500/40 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-black text-sm">
                    {firstLetter}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-black text-sm text-white truncate">{name}</p>
                  <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                </div>
              </div>

              {/* Points badge */}
              <div className="mt-3 flex items-center justify-between bg-amber-500/10 rounded-xl px-3 py-2">
                <span className="text-xs text-white/50 font-medium">Puntos totales</span>
                <span className="text-amber-400 font-black text-sm">{userPoints} pts</span>
              </div>

              {/* User ID for debugging / sharing */}
              <p className="mt-2 text-[10px] text-white/20 font-mono truncate">
                ID: {userId}
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5 transition-colors text-sm font-bold"
              >
                <UserIcon size={15} className="text-amber-500" />
                Mi Perfil
              </Link>
              
              <Link
                href="/audit"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5 transition-colors text-sm font-bold"
              >
                <ShieldCheck size={15} className="text-amber-500" />
                Auditoría Pública
              </Link>
              
              {(user as any).role === "ADMIN" && (
                <Link
                  href="/admin/simulator"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-colors text-sm font-bold"
                >
                  <ShieldCheck size={15} />
                  Consola Admin
                </Link>
              )}
              
              <button
                id="signout-btn"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
              >
                <LogOut size={15} />
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
