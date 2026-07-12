"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Plus, Pencil, Trash2, Globe2,
  Map, Hash, Heart, ChevronRight, LogOut,
  ToggleLeft, ToggleRight, Users, Trophy
} from "lucide-react";
import { cerrarSesion, eliminarDesafio } from "@/lib/actions";
import ThemeToggle from "@/components/ThemeToggle";
import type { Desafio, SessionPayload } from "@/lib/types";

const CONTINENTES = ["Africa","America","Asia","Europa","Oceania","Antartica"];

interface Props {
  desafios: Desafio[];
  sesion: SessionPayload;
}

export default function ProfesorDashboard({ desafios, sesion }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(id: number) {
    setDeleting(true);
    try { await eliminarDesafio(id); } catch { /* redirect */ }
    setDeleting(false);
    setConfirmDelete(null);
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Globe2 className="w-5 h-5 text-emerald-400" />
        <span className="text-text font-bold">GeoDesafio</span>
        <span className="bg-violet-500/20 text-violet-400 text-xs font-bold px-2 py-0.5 rounded-full border border-violet-500/30">
          PROFESOR
        </span>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <span className="text-muted text-sm hidden sm:block">
            Hola, {sesion.nombre}
          </span>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-muted hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Desafios creados", value: desafios.length,                    icon: BookOpen, color: "emerald" },
            { label: "Activos",          value: desafios.filter(d => d.activo).length, icon: ToggleRight, color: "cyan" },
            { label: "Inactivos",        value: desafios.filter(d => !d.activo).length, icon: ToggleLeft, color: "slate" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-2 border border-border rounded-xl p-4">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
              <p className="text-2xl font-black text-text">{stat.value}</p>
              <p className="text-muted text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Titulo y boton nuevo */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text font-bold text-lg">Mis Desafios</h2>
          <Link
            href="/profesor/nuevo"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-text font-bold rounded-xl px-4 py-2.5 text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Desafio
          </Link>
        </div>

        {/* Lista de desafios */}
        {desafios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-surface-2 border border-dashed border-border rounded-2xl"
          >
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted font-medium mb-1">Sin desafios aun</p>
            <p className="text-muted text-sm mb-5">Crea el primero para que tus estudiantes puedan jugarlo</p>
            <Link
              href="/profesor/nuevo"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-text font-bold rounded-xl px-5 py-2.5 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear primer desafio
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {desafios.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-surface-2 border rounded-xl p-5 transition-colors ${
                  d.activo ? "border-border hover:border-border" : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-text font-bold truncate">{d.titulo}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        d.activo
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-surface-2 text-muted border border-border"
                      }`}>
                        {d.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {d.descripcion && (
                      <p className="text-muted text-sm mb-3 line-clamp-2">{d.descripcion}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Map className="w-3.5 h-3.5" />
                        {d.continente ?? "Global"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" />
                        {d.num_preguntas} preguntas
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        {d.vidas} vidas
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/profesor/editar/${d.id}`}
                      className="p-2 rounded-lg bg-surface hover:bg-surface-2 text-muted hover:text-text transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(d.id)}
                      className="p-2 rounded-lg bg-surface hover:bg-red-900/40 text-muted hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal confirmacion de borrado */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-2 border border-border rounded-2xl p-6 max-w-sm w-full"
            >
              <Trash2 className="w-8 h-8 text-red-400 mb-3" />
              <h3 className="text-text font-bold text-lg mb-2">Eliminar desafio</h3>
              <p className="text-muted text-sm mb-5">
                Esta accion no se puede deshacer. Se eliminaran todos los puntajes asociados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-surface hover:bg-surface-2 text-text rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-60 text-text rounded-xl py-2.5 text-sm font-bold transition-colors"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
