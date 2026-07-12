"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Mail, Lock, User, GraduationCap, BookOpen, Eye, EyeOff } from "lucide-react";
import { registrarUsuario, iniciarSesion } from "@/lib/actions";

export default function AuthForms() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const action = tab === "login" ? iniciarSesion : registrarUsuario;

    try {
      const res = await action(fd);
      if (res?.error) setError(res.error);
    } catch {
      // El redirect de Next.js lanza un error internamente - ignoramos
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <Globe2 className="w-8 h-8 text-text" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          GeoDesafio
        </h1>
        <p className="text-muted text-sm mt-1">Plataforma educativa de geografia</p>
      </div>

      {/* Card */}
      <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden shadow-2xl">

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-border">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`py-4 text-sm font-semibold transition-colors relative ${
                tab === t ? "text-text" : "text-muted hover:text-muted"
              }`}
            >
              {t === "login" ? "Iniciar Sesion" : "Crear Cuenta"}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Nombre (solo registro) */}
              {tab === "register" && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    required
                    className="w-full bg-surface border border-border focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-text placeholder-muted outline-none transition-colors"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full bg-surface border border-border focus:border-emerald-500 rounded-xl pl-10 pr-4 py-3 text-text placeholder-muted outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Contrasena"
                  required
                  minLength={6}
                  className="w-full bg-surface border border-border focus:border-emerald-500 rounded-xl pl-10 pr-10 py-3 text-text placeholder-muted outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-muted"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Selector de rol (solo registro) */}
              {tab === "register" && (
                <div>
                  <p className="text-muted text-sm mb-2 font-medium">Tipo de cuenta</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "estudiante", label: "Estudiante",  Icon: GraduationCap, desc: "Juega y compite" },
                      { value: "profesor",   label: "Profesor",    Icon: BookOpen,      desc: "Crea desafios" },
                    ].map(({ value, label, Icon, desc }) => (
                      <label
                        key={value}
                        className="cursor-pointer"
                      >
                        <input type="radio" name="rol" value={value} className="peer hidden" defaultChecked={value === "estudiante"} />
                        <div className="border border-border peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 rounded-xl p-3 text-center transition-all">
                          <Icon className="w-5 h-5 mx-auto mb-1 text-muted peer-checked:text-emerald-400" />
                          <p className="text-text text-sm font-semibold">{label}</p>
                          <p className="text-muted text-xs">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-text font-bold rounded-xl py-3.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : tab === "login" ? "Entrar" : "Crear Cuenta"}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-muted text-xs mt-6">
        Datos geograficos provistos por REST Countries API v3.1
      </p>
    </div>
  );
}
