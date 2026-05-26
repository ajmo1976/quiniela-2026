"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trophy, Users, Zap, BarChart3, ArrowRight, Play, BookOpen, X, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

export default function Home() {
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] -z-10" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-card rounded-none border-t-0 border-x-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/world-cup-logo.png" alt="FIFA 26" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-black font-outfit uppercase tracking-tighter leading-none">Quiniela</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] leading-none">Pro 2026</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold opacity-60 font-outfit uppercase tracking-wider">
          <button onClick={() => setShowRulesModal(true)} className="hover:opacity-100 hover:text-amber-500 transition-all">Reglas y Premios</button>

        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-amber-500 transition-colors">Dashboard</Link>
          <Link href="/matches" className="text-sm font-medium hover:text-amber-500 transition-colors">Partidos</Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8 text-xs font-black tracking-widest uppercase text-amber-500 font-outfit"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Inscripciones abiertas · Pago Móvil o Transferencia
        </motion.div>

        {/* Main Hero Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <motion.img 
            src="/world-cup-logo.png" 
            alt="FIFA World Cup 2026" 
            className="h-60 w-auto mx-auto drop-shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            animate={{ 
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/20 blur-2xl rounded-full scale-x-150" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 italic leading-[0.8] font-outfit"
        >
          MUNDIAL <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-600">PRO 2026</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-slate-500 dark:text-white/60 max-w-2xl mb-12 font-outfit leading-relaxed"
        >
          La quiniela definitiva para verdaderos analistas.
          Predice marcadores, desafía a tus panas en ligas privadas y gana el pozo acumulado.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20 z-20"
        >
          <Link href="/dashboard" className="group bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] flex items-center justify-center gap-3 font-outfit">
            INGRESAR AHORA <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => setShowRulesModal(true)}
            className="glass-card px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 border-white/20 hover:bg-white/5 transition-all"
          >
            VER REGLAS <BookOpen size={20} className="text-amber-500" />
          </button>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
        >
          <div className="glass-card p-6 flex flex-col items-center gap-3 group border-white/5 hover:border-amber-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm">Tiempo Real</h3>
          </div>
          <div className="glass-card p-6 flex flex-col items-center gap-3 group border-white/5 hover:border-amber-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="text-teal-400 w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm">Ligas Privadas</h3>
          </div>
          <div className="glass-card p-6 flex flex-col items-center gap-3 group border-white/5 hover:border-amber-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="text-purple-400 w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm">Estadísticas</h3>
          </div>
          <div className="glass-card p-6 flex flex-col items-center gap-3 group border-white/5 hover:border-amber-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="text-amber-400 w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm">Premios</h3>
          </div>
        </motion.div>
      </div>

      {/* Rules Modal Overlay */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/10 p-8 relative shadow-2xl space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRulesModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Trophy size={28} className="text-amber-500 animate-bounce" />
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Reglas y Sistema de Juego 🏆
                </h2>
              </div>

              {/* How to Participate */}
              <div className="space-y-3">
                <h3 className="text-base font-black uppercase tracking-wide text-amber-500 flex items-center gap-2">
                  <Info size={16} /> ¿Cómo Participar?
                </h3>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>
                    💰 <strong>Tasa de Entrada:</strong> La inscripción tiene un valor único de <strong>$5 USD</strong> (o al cambio oficial del día).
                  </p>
                  <p>
                    💳 <strong>Método de Pago:</strong> Aceptado únicamente vía <strong>Pago Móvil</strong> o <strong>Transferencia Bancaria</strong>.
                  </p>
                  <p>
                    🔑 <strong>Registro:</strong> Accede a la plataforma utilizando tu cuenta de Google. Tu perfil, puntuaciones y ligas quedarán vinculados de forma segura a tu correo.
                  </p>
                </div>
              </div>

              {/* Scoring System */}
              <div className="space-y-3">
                <h3 className="text-base font-black uppercase tracking-wide text-teal-400 flex items-center gap-2">
                  <Zap size={16} className="fill-teal-400/20" /> Sistema de Puntuación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Puntos Estándar</p>
                    <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                      <li><strong>+3 Puntos:</strong> Si aciertas el ganador o el empate con resultado exacto (ej: pronosticas 2-1 y termina 2-1, o pronosticas 1-1 y termina 1-1).</li>
                      <li><strong>+1 Punto:</strong> Si aciertas solo el ganador o el empate sin resultado exacto (ej: pronosticas 2-1 y termina 1-0, o pronosticas 1-1 y termina 2-2).</li>
                      <li><strong>0 Puntos:</strong> Si no aciertas el ganador ni el empate.</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">Jugada Doble ⚡</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Puedes marcar <strong>un partido por fecha</strong> como tu Jugada Doble.
                    </p>
                    <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                      <li><strong>+6 Puntos:</strong> Si aciertas el ganador o el empate con resultado exacto.</li>
                      <li><strong>+2 Puntos:</strong> Si aciertas solo el ganador o el empate sin resultado exacto.</li>
                      <li><strong>0 Puntos:</strong> No se aplican penalizaciones por fallar.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bonus Top Scorer */}
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-purple-400">
                  ⚽ Bono Máximo Goleador
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Elige a tu candidato a bota de oro en tu panel de control antes de que inicie el torneo. Si al finalizar el Mundial tu jugador es el goleador oficial, sumas un bono especial de <strong>+15 Puntos</strong>.
                </p>
              </div>

              {/* Prizes Pool */}
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wide text-blue-400">
                  🎁 Premiación
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Todo lo recaudado por concepto de entradas ($5 USD) se sumará al pozo general de premios. Al finalizar el torneo, el pozo total se distribuirá entre el <strong>1er, 2do y 3er lugar</strong> del Ranking Global.
                </p>
              </div>

              {/* Disclaimer Agreement */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wide text-red-400 flex items-center gap-1.5">
                  ⚠️ Acuerdo de Participación
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  Al inscribirte, declaras estar en total conocimiento de que <strong>no somos una casa de apuestas</strong> ni operamos juegos de azar comerciales. Este sistema fue desarrollado exclusivamente con fines de diversión y entretenimiento personal entre amigos sin fines de lucro. De los fondos recaudados por concepto de inscripciones, se deducirá únicamente la porción correspondiente a cubrir los costos operativos, de servidores y el mantenimiento del sistema técnico, destinando el remanente neto en su totalidad a los premios del podio de ganadores.
                </p>
              </div>

              {/* Modal Action Button */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black text-xs rounded-xl uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Floating Balls */}
      <div className="absolute top-1/2 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
    </main>
  );
}
