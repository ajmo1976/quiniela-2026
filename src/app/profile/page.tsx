"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Shield, User, ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, HelpCircle, Save, X, Camera } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { useTournament } from "@/lib/TournamentContext";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { refreshProfile } = useTournament();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankOwner, setBankOwner] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [status, setStatus] = useState("PENDIENTE");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setFavoriteTeam(p.favoriteTeam || "");
          setPhoneNumber(p.phoneNumber || "");
          setBankOwner(p.bankOwner || "");
          setBankName(p.bankName || "");
          setBankAccount(p.bankAccount || "");
          setPaymentRef(p.paymentRef || "");
          setPaymentReceipt(p.paymentReceipt || null);
          setStatus(p.status || "PENDIENTE");
          setProfileImage(p.image || session?.user?.image || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [session]);

  // Handle Profile Image Upload and convert to Base64 for DB storage
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La foto de perfil no debe superar los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Receipt File Upload and convert to Base64 for DB storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar los 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentReceipt(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteTeam,
          bankOwner,
          bankName,
          bankAccount,
          phoneNumber,
          paymentRef,
          paymentReceipt,
          image: profileImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("¡Perfil y comprobante de pago actualizados con éxito!");
        setStatus(data.profile.status);
        // Refresh NextAuth session cache if name/avatar updated
        await update();
        // Force refresh in TournamentContext to update userImage state globally
        await refreshProfile();
      } else {
        setErrorMsg(data.error || "Ocurrió un error al actualizar");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrorMsg("Error de red al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (status === "ACTIVO") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.1)] border border-green-500/30">
          <CheckCircle2 size={12} /> Activo para la Quiniela
        </span>
      );
    }
    if (status === "RECHAZADO") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-black rounded-full uppercase tracking-wider border border-red-500/30 animate-pulse">
          <AlertCircle size={12} /> Soporte Rechazado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-black rounded-full uppercase tracking-wider border border-yellow-500/30 animate-pulse">
        <HelpCircle size={12} /> Pendiente de Validación
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <User className="text-amber-500 animate-pulse mx-auto mb-4 animate-bounce" size={48} />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  const user = session?.user;

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
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-white/40 hover:text-amber-500 font-bold uppercase mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
            <User className="text-amber-500" size={36} />
            Mi <span className="text-amber-500">Perfil</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Completa tus datos personales y registra tu soporte de pago para activar tu participación.
          </p>
        </div>

        {/* Main Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="space-y-6">
            <div className="glass-card border border-white/10 p-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield size={120} />
              </div>

              {/* Profile Image with Hover Edit Overlay */}
              <div className="relative w-28 h-28 mx-auto mb-4 group/avatar">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-amber-500/50 shadow-xl relative bg-black/40">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user?.name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-4xl font-black text-black">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Upload overlay */}
                <label
                  htmlFor="profile-image-input"
                  className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 cursor-pointer border border-amber-500/30 animate-fade-in"
                >
                  <Camera size={20} className="text-amber-500 mb-1" />
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">Cambiar</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
              </div>

              <h2 className="text-xl font-black">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-white/40 mb-6">{user?.email}</p>

              <div className="flex justify-center mb-2">{getStatusBadge()}</div>

              {status === "PENDIENTE" && (
                <p className="text-[10px] text-yellow-500/80 mt-2 leading-relaxed">
                  Tu comprobante está en revisión. El administrador validará tu pago pronto.
                </p>
              )}
              {status === "RECHAZADO" && (
                <p className="text-[10px] text-red-400 mt-2 leading-relaxed font-bold">
                  El comprobante fue rechazado. Por favor, verifica el número de referencia e intenta subir el soporte correcto.
                </p>
              )}
            </div>

            {/* Instruction Card */}
            <div className="glass-card border border-amber-500/10 p-6 bg-gradient-to-br from-amber-500/5 to-transparent space-y-4">
              <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider">Datos para la Transferencia</h3>
              <div className="text-xs space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Pago Móvil:</p>
                  <p>Banco: **Mercantil (0105)**</p>
                  <p>Teléfono: **0424-1234567**</p>
                  <p>Cédula: **V-12345678**</p>
                </div>
                <div className="h-px bg-white/5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Transferencia Bancaria:</p>
                  <p>Banco: **Mercantil (0105)**</p>
                  <p>Cuenta: **0105-0123-45-6789012345**</p>
                  <p>Nombre: **Arnaldo Martínez**</p>
                  <p>Cédula: **V-12345678**</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status alerts */}
            {successMsg && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-2xl text-sm">
                ✅ {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-2xl text-sm">
                ❌ {errorMsg}
              </div>
            )}

            {/* General Info Card */}
            <div className="glass-card border border-white/10 p-8 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <User size={18} className="text-amber-500" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Favorite Team */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Equipo Preferido ⚽</label>
                  <input
                    type="text"
                    value={favoriteTeam}
                    onChange={(e) => setFavoriteTeam(e.target.value)}
                    placeholder="Ej. Venezuela, Argentina, España"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>

                {/* Contact Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Teléfono de Contacto 📞</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ej. +58 412-1234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="glass-card border border-white/10 p-8 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <FileText size={18} className="text-amber-500" />
                Detalles del Pago ($5 USD)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Owner */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Titular del Pago / Cuenta</label>
                  <input
                    type="text"
                    value={bankOwner}
                    onChange={(e) => setBankOwner(e.target.value)}
                    placeholder="Nombre y Apellido de quien transfiere"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>

                {/* Bank Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Banco de Origen</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej. Banesco, Mercantil, Provincial"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>

                {/* Bank Account or mobile phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Teléfono o Número de Cuenta Origen</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Ej. Celular de pago móvil o Nro de cuenta"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>

                {/* Payment Reference */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Referencia de Pago #</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Últimos 4 o 6 dígitos de la referencia"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Receipt Image upload */}
              <div className="flex flex-col gap-2 pt-4">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-white/40">Subir Soporte de Pago (Imagen/Foto)</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl hover:border-amber-500/20 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-500 dark:text-white/40">PNG, JPG hasta 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-file-input"
                    />
                    <label
                      htmlFor="receipt-file-input"
                      className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Seleccionar Archivo
                    </label>
                  </div>

                  {paymentReceipt ? (
                    <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                      <img src={paymentReceipt} alt="Soporte" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setPaymentReceipt(null)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-48 h-32 rounded-xl border border-white/5 bg-black/10 flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest font-black text-center p-4">
                      Sin soporte adjunto
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:opacity-95 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
