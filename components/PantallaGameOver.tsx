"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, RotateCcw, Star, Crown, Map, Hash, Heart } from "lucide-react";
import { guardarPuntaje, obtenerClasificacion } from "@/lib/actions";
import type { Desafio, ScoreEntry } from "@/lib/types";

interface Props {
  nombreJugador: string;
  puntaje: number;
  desafio: Desafio;
  onReiniciar: () => void;
}

export default function PantallaGameOver({ nombreJugador, puntaje, desafio, onReiniciar }: Props) {
  const [clasificacion, setClasificacion] = useState<ScoreEntry[]>([]);
  const [guardando, setGuardando]         = useState(true);
  const [miPosicion, setMiPosicion]       = useState<number | null>(null);
  const maxPuntos = desafio.num_preguntas;
  const pct = Math.round((puntaje / maxPuntos) * 100);

  useEffect(() => {
    async function guardarYCargar() {
      try {
        await guardarPuntaje(desafio.id, puntaje);
        const top10 = await obtenerClasificacion(desafio.id);
        setClasificacion(top10);
        const pos = top10.findIndex(
          (e) => e.nombre_usuario === nombreJugador && e.puntaje === puntaje
        );
        if (pos !== -1) setMiPosicion(pos + 1);
      } catch (error) {
        console.error("Error al guardar el puntaje:", error);
        alert("Hubo un error al guardar tu puntaje, pero puedes seguir viendo el ranking.");
      } finally {
        setGuardando(false);
      }
    }
    guardarYCargar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function IconoPosicion({ pos }: { pos: number }) {
    if (pos === 1) return <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />;
    if (pos === 2) return <Medal className="w-4 h-4 text-muted" />;
    if (pos === 3) return <Medal className="w-4 h-4 text-amber-700" />;
    return <span className="text-muted text-xs w-4 text-center">{pos}</span>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-5 w-full max-w-md"
    >
      {/* Resultado */}
      <div className="text-center w-full">
        <motion.div
          initial={{ rotateY: -180 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30"
        >
          <Trophy className="w-10 h-10 text-text" />
        </motion.div>

        <h2 className="text-2xl font-bold text-text mb-1">Desafio Completado</h2>
        <p className="text-muted text-sm mb-1">{desafio.titulo}</p>
        <p className="text-muted text-sm mb-4">{nombreJugador}</p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl px-8 py-4 mb-3"
        >
          <div className="flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            <span className="text-5xl font-black text-text">{puntaje}</span>
            <span className="text-amber-400 font-bold self-end mb-1">/ {maxPuntos}</span>
          </div>
          <div className="w-40 h-2 bg-border rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
          <span className="text-amber-400/70 text-xs">{pct}% de aciertos</span>
        </motion.div>

        {/* Info del desafio */}
        <div className="flex justify-center gap-4 text-xs text-muted mb-2">
          <span className="flex items-center gap-1">
            <Map className="w-3 h-3" />{desafio.continente ?? "Global"}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />{desafio.num_preguntas} preguntas
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" />{desafio.vidas} vidas
          </span>
        </div>

        {miPosicion && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-emerald-400 text-sm font-medium"
          >
            {miPosicion <= 3
              ? `Increible! Puesto #${miPosicion} en el ranking`
              : `Tu posicion: #${miPosicion}`}
          </motion.p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="w-full bg-surface/80 border border-border/50 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-text font-bold text-sm">Top 10 - {desafio.titulo}</h3>
        </div>

        {guardando ? (
          <div className="flex items-center justify-center h-24 gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-muted text-sm">Guardando puntaje...</span>
          </div>
        ) : clasificacion.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">
            Se el primero en la clasificacion
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {clasificacion.map((entry, index) => {
              const esMio = entry.nombre_usuario === nombreJugador && entry.puntaje === puntaje;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className={`flex items-center gap-3 px-5 py-2.5 ${esMio ? "bg-emerald-900/30" : ""}`}
                >
                  <div className="w-5 flex items-center justify-center">
                    <IconoPosicion pos={index + 1} />
                  </div>
                  <span className={`flex-1 text-sm font-medium truncate ${esMio ? "text-emerald-400" : "text-text"}`}>
                    {entry.nombre_usuario}
                    {esMio && <span className="ml-1 text-xs text-emerald-600">(tu)</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-text text-sm">{entry.puntaje}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="w-full flex gap-3">
        <motion.button
          onClick={onReiniciar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-text font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          Elegir otro desafio
        </motion.button>
      </div>
    </motion.div>
  );
}
