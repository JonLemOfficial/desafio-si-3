"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Map, Hash, Heart, FileText, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { crearDesafio, actualizarDesafio } from "@/lib/actions";
import type { Desafio } from "@/lib/types";

const CONTINENTES = [
  { value: "",          label: "Global (todos los continentes)" },
  { value: "Africa",    label: "Africa" },
  { value: "America",   label: "America" },
  { value: "Asia",      label: "Asia" },
  { value: "Europa",    label: "Europa" },
  { value: "Oceania",   label: "Oceania" },
];

interface Props {
  modo: "nuevo" | "editar";
  desafio?: Desafio;
}

export default function DesafioForm({ modo, desafio }: Props) {
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const action = modo === "nuevo" ? crearDesafio : actualizarDesafio;

    try {
      const res = await action(fd);
      if (res?.error) setError(res.error);
    } catch {
      // redirect de Next.js
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/profesor"
          className="p-2 rounded-lg bg-surface hover:bg-surface-2 text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-text font-bold text-xl">
            {modo === "nuevo" ? "Nuevo Desafio" : "Editar Desafio"}
          </h1>
          <p className="text-muted text-sm">
            {modo === "nuevo"
              ? "Crea un desafio para tus estudiantes"
              : `Editando: ${desafio?.titulo}`}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-surface-2 border border-border rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* ID oculto para edicion */}
        {modo === "editar" && desafio && (
          <input type="hidden" name="id" value={desafio.id} />
        )}

        {/* Titulo */}
        <div>
          <label className="flex items-center gap-2 text-muted text-sm font-semibold mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Titulo del Desafio
          </label>
          <input
            name="titulo"
            type="text"
            required
            defaultValue={desafio?.titulo ?? ""}
            placeholder="Ej: Capitales de Europa"
            maxLength={60}
            className="w-full bg-surface border border-border focus:border-emerald-500 rounded-xl px-4 py-3 text-text placeholder-muted outline-none transition-colors"
          />
        </div>

        {/* Descripcion */}
        <div>
          <label className="flex items-center gap-2 text-muted text-sm font-semibold mb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Descripcion (opcional)
          </label>
          <textarea
            name="descripcion"
            defaultValue={desafio?.descripcion ?? ""}
            placeholder="Describe el objetivo del desafio..."
            rows={3}
            className="w-full bg-surface border border-border focus:border-cyan-500 rounded-xl px-4 py-3 text-text placeholder-muted outline-none transition-colors resize-none"
          />
        </div>

        {/* Continente */}
        <div>
          <label className="flex items-center gap-2 text-muted text-sm font-semibold mb-2">
            <Map className="w-4 h-4 text-blue-400" />
            Region geografica
          </label>
          <select
            name="continente"
            defaultValue={desafio?.continente ?? ""}
            className="w-full bg-surface border border-border focus:border-blue-500 rounded-xl px-4 py-3 text-text outline-none transition-colors"
          >
            {CONTINENTES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Numero de preguntas y vidas - grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-muted text-sm font-semibold mb-2">
              <Hash className="w-4 h-4 text-amber-400" />
              Preguntas
            </label>
            <input
              name="num_preguntas"
              type="number"
              min={3}
              max={50}
              defaultValue={desafio?.num_preguntas ?? 10}
              required
              className="w-full bg-surface border border-border focus:border-amber-500 rounded-xl px-4 py-3 text-text outline-none transition-colors"
            />
            <p className="text-muted text-xs mt-1">Min 3, max 50</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-muted text-sm font-semibold mb-2">
              <Heart className="w-4 h-4 text-red-400" />
              Vidas
            </label>
            <input
              name="vidas"
              type="number"
              min={1}
              max={10}
              defaultValue={desafio?.vidas ?? 3}
              required
              className="w-full bg-surface border border-border focus:border-red-500 rounded-xl px-4 py-3 text-text outline-none transition-colors"
            />
            <p className="text-muted text-xs mt-1">Min 1, max 10</p>
          </div>
        </div>

        {/* Estado activo (solo en edicion) */}
        {modo === "editar" && (
          <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              {desafio?.activo
                ? <Eye className="w-4 h-4 text-emerald-400" />
                : <EyeOff className="w-4 h-4 text-muted" />}
              <div>
                <p className="text-text text-sm font-semibold">Estado del desafio</p>
                <p className="text-muted text-xs">Los desafios inactivos no son visibles para estudiantes</p>
              </div>
            </div>
            <select
              name="activo"
              defaultValue={desafio?.activo ? "1" : "0"}
              className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-text text-sm outline-none"
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/profesor"
            className="flex-1 text-center bg-surface hover:bg-surface-2 text-text font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            Cancelar
          </Link>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 text-text font-bold rounded-xl py-3 text-sm transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {modo === "nuevo" ? "Crear Desafio" : "Guardar Cambios"}
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
