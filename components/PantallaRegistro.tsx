"use client";

/**
 * COMPONENTE CLIENTE - PantallaRegistro
 *
 * Pantalla inicial donde el jugador ingresa su nombre.
 * Es un Client Component porque gestiona estado local (el input del nombre).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Trophy } from "lucide-react";

interface Props {
  onStart: (nombre: string) => void;
}

export default function PantallaRegistro({ onStart }: Props) {
  const [nombre, setNombre] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (trimmed.length >= 2) {
      onStart(trimmed);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-8 text-center"
    >
      {/* Icono y titulo */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
        >
          <Globe className="w-12 h-12 text-text" strokeWidth={1.5} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-3 h-3 text-amber-900" />
        </motion.div>
      </div>

      <div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Desafio de Geografia
        </h1>
        <p className="text-muted text-lg">
          Pon a prueba tu conocimiento del mundo
        </p>
      </div>

      {/* Descripcion del juego */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { emoji: "🌍", label: "Paises reales", sub: "REST Countries API" },
          { emoji: "❤️", label: "3 vidas", sub: "No te equivoques" },
          { emoji: "🏆", label: "Top 10", sub: "Tabla de lideres" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-surface/60 border border-border/50 rounded-xl p-3 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-text text-xs font-semibold">{item.label}</span>
            <span className="text-muted text-xs">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Formulario de registro */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre o apodo..."
            maxLength={30}
            className="w-full bg-surface border border-border focus:border-emerald-500 rounded-xl px-5 py-4 text-text placeholder-muted outline-none transition-colors text-lg"
            autoFocus
          />
          {nombre.length > 0 && nombre.trim().length < 2 && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400">
              Minimo 2 caracteres
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={nombre.trim().length < 2}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-text font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>Comenzar Desafio</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
}
