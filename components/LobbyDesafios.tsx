"use client";

import { motion } from "framer-motion";
import { Globe2, Map, Hash, Heart, Play, Trophy, ChevronRight } from "lucide-react";
import type { Desafio, SessionPayload } from "@/lib/types";

interface Props {
  desafios: Desafio[];
  sesion: SessionPayload;
  onStart: (desafio: Desafio) => void;
}

const CONTINENTE_EMOJI: Record<string, string> = {
  Africa: "🌍", America: "🌎", Asia: "🌏",
  Europa: "🏰", Oceania: "🦘", Antartica: "🧊",
};

export default function LobbyDesafios({ desafios, sesion, onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Bienvenida */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
          <Globe2 className="w-8 h-8 text-text" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black text-text mb-1">
          Bienvenido, {sesion.nombre.split(" ")[0]}!
        </h1>
        <p className="text-muted">Elige un desafio para comenzar</p>
      </div>

      {/* Lista de desafios */}
      {desafios.length === 0 ? (
        <div className="text-center py-16 bg-surface-2 border border-dashed border-border rounded-2xl">
          <Trophy className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted font-medium">No hay desafios disponibles aun</p>
          <p className="text-muted text-sm mt-1">Espera a que tu profesor cree uno</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {desafios.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onStart(d)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left bg-surface-2 hover:bg-surface border border-border hover:border-border rounded-2xl p-5 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Emoji del continente */}
                <div className="w-12 h-12 bg-surface group-hover:bg-surface-2 rounded-xl flex items-center justify-center text-2xl transition-colors shrink-0">
                  {d.continente ? (CONTINENTE_EMOJI[d.continente] ?? "🌐") : "🌐"}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-text font-bold text-base truncate mb-1">
                    {d.titulo}
                  </h3>
                  {d.descripcion && (
                    <p className="text-muted text-sm line-clamp-1 mb-2">
                      {d.descripcion}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Map className="w-3 h-3" />
                      {d.continente ?? "Global"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {d.num_preguntas} preguntas
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      {d.vidas} vidas
                    </span>
                    {d.profesor_nombre && (
                      <span className="text-muted">
                        por {d.profesor_nombre}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-text text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20">
                    <Play className="w-3 h-3 fill-white" />
                    Jugar
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-muted transition-colors" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
