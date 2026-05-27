"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Trophy, Zap, Award, ShieldAlert, Info, Loader2 } from "lucide-react";

export default function RulesAcceptanceOverlay() {
  const { data: session, status, update } = useSession();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only render overlay if user is authenticated and rulesAccepted is false
  const isAuthenticated = status === "authenticated";
  const rulesAccepted = (session?.user as any)?.rulesAccepted;

  if (!isAuthenticated || rulesAccepted) {
    return null;
  }

  const handleAccept = async () => {
    if (!checked || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile/accept-rules", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        // Trigger NextAuth session update to pull the updated rulesAccepted from DB
        await update();
      } else {
        setError(data.error || "No se pudo registrar la aceptación del acuerdo.");
        setLoading(false);
      }
    } catch (err) {
      setError("Error de red. Intenta nuevamente.");
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 bg-[#0c0c12]/90 relative my-auto">
        
        {/* Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
          <Trophy size={28} className="text-amber-500 animate-bounce" />
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
            Reglamento y Acuerdo de Participación 🏆
          </h2>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-5 text-slate-300 text-xs md:text-sm">
          {/* Intro */}
          <p className="leading-relaxed">
            Hola, <strong className="text-amber-500">{session?.user?.name || "Participante"}</strong>. Para garantizar la honestidad, el juego limpio y la transparencia de la Quiniela Pro 2026, es obligatorio leer y aceptar las reglas del torneo y las condiciones de participación para poder continuar.
          </p>

          {/* 1. How to Participate */}
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wide text-amber-500 flex items-center gap-2">
              <Info size={16} /> 1. ¿Cómo Participar?
            </h3>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2 leading-relaxed">
              <p>
                💰 <strong>Costo de Inscripción:</strong> Tiene un valor único de <strong>$5 USD</strong> (o en Bs. al cambio oficial BCV del día).
              </p>
              <p>
                💳 <strong>Método de Pago:</strong> Se procesa única y exclusivamente a través de <strong>Pago Móvil</strong> o <strong>Transferencia Bancaria</strong> (detalles disponibles en la sección "Mi Perfil").
              </p>
              <p>
                ⏱️ <strong>Verificación Manual:</strong> Para mantener la seguridad y transparencia de la bolsa, cada pago es verificado manualmente por el administrador. En momentos de alta afluencia, esta verificación puede demorar unas horas.
              </p>
            </div>
          </div>

          {/* 2. Scoring System */}
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wide text-teal-400 flex items-center gap-2">
              <Zap size={16} className="fill-teal-400/20" /> 2. Sistema de Puntuación
            </h3>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2 leading-relaxed">
              <p><strong>Puntos de Partidos Estándar:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>+3 Puntos:</strong> Si aciertas el ganador o el empate exacto (ej. pronosticas 2-1 y termina 2-1).</li>
                <li><strong>+1 Punto:</strong> Si aciertas el ganador o empate pero fallas el marcador exacto (ej. pronosticas 2-1 y termina 1-0).</li>
                <li><strong>0 Puntos:</strong> Si fallas el resultado general del partido.</li>
              </ul>
              <p className="pt-1"><strong>Jugada Doble ⚡:</strong></p>
              <p className="text-slate-400">
                Puedes seleccionar <strong>un partido por jornada</strong> para duplicar tus puntos. Si aciertas el marcador exacto sumas <strong>+6 puntos</strong>; si aciertas el resultado general sumas <strong>+2 puntos</strong>. No hay penalización por fallar.
              </p>
            </div>
          </div>

          {/* 3. Prizes Distribution */}
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wide text-blue-400 flex items-center gap-2">
              <Award size={16} /> 3. Distribución de Premios (70% Bolsa)
            </h3>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 leading-relaxed">
              <p>
                El <strong>70% del total recaudado</strong> se distribuirá íntegramente como premios entre los **primeros 5 lugares** del Ranking Global al finalizar el torneo. El 30% restante cubre costos de servidores y administración.
              </p>
              <div className="h-px bg-white/5" />
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reparto del Pozo General:</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                  <span className="font-bold text-white">🥇 1er Lugar (55%):</span>
                  <span className="text-right font-black text-amber-500">55% del Pozo</span>

                  <span className="font-bold text-slate-300">🥈 2do Lugar (20%):</span>
                  <span className="text-right font-black text-slate-300">20% del Pozo</span>

                  <span className="font-bold text-amber-700">🥉 3er Lugar (12%):</span>
                  <span className="text-right font-black text-amber-700">12% del Pozo</span>

                  <span className="text-slate-400">🏅 4to Lugar (8%):</span>
                  <span className="text-right font-black text-slate-400">8% del Pozo</span>

                  <span className="text-slate-400">🏅 5to Lugar (5%):</span>
                  <span className="text-right font-black text-slate-400">5% del Pozo</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Disclaimer Agreement */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <h3 className="text-[11px] font-black uppercase tracking-wide text-red-400 flex items-center gap-2">
              <ShieldAlert size={14} /> 4. Acuerdo y Descargo Legal
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Al hacer clic en "Aceptar", declaras conocer que **no somos una casa de apuestas comercial** ni operamos juegos de azar. Este sistema es una plataforma de recreación deportiva de carácter amistoso y sin fines de lucro. De los fondos de inscripción se retiene únicamente el 30% para solventar los servidores y el soporte técnico indispensable para mantener la app en línea.
            </p>
          </div>
        </div>

        {/* Checkbox Acceptance */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs md:text-sm font-medium text-slate-400 group-hover:text-white transition-colors leading-tight">
              He leído, entiendo y acepto en su totalidad el Reglamento y el Acuerdo de Participación de la Quiniela Pro 2026.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Rechazar e Irse
            </button>
            <button
              onClick={handleAccept}
              disabled={!checked || loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                "Aceptar y Continuar"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
