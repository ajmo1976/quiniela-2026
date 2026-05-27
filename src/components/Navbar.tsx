"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, Users, Award, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determinar si una ruta está activa
  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Partidos", href: "/matches", icon: Calendar },
    { name: "Grupos", href: "/groups", icon: Users },
    { name: "Ligas", href: "/leagues", icon: Award },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 px-4 md:px-6 py-3 flex justify-between items-center transition-all">
        {/* Logo y Nombre */}
        <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
          <img src="/world-cup-logo.png" alt="WC 2026" className="w-8 h-8 md:w-10 md:h-10 object-contain group-hover:scale-105 transition-transform" />
          <span className="font-black text-base md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">
            QUINIELA 2026
          </span>
        </Link>

        {/* Enlaces de Desktop (Ocultos en Móvil) */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs md:text-sm font-black uppercase tracking-wider transition-colors relative py-1 ${
                isActive(link.href)
                  ? "text-amber-500"
                  : "text-slate-500 dark:text-white/60 hover:text-amber-500"
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Controles de Acción (Theme, Avatar) y Botón Menú Móvil */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <UserMenu />
          
          {/* Botón Hamburguesa para Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-800 dark:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Fondo Oscuro/Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Panel de Enlaces Móviles */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[62px] left-0 right-0 bg-[#0d0d12]/95 backdrop-blur-2xl border-b border-white/10 z-40 p-5 md:hidden flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black transition-all ${
                        active
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "text-slate-600 dark:text-white/70 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-xs uppercase tracking-wider">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
