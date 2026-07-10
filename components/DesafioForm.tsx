'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import { crearDesafio, actualizarDesafio } from '@/lib/actions';
import DesafioPreguntas, { type QuestionDraft } from '@/components/DesafioPreguntas';
import {
  ArrowLeft,
  BookOpen,
  Map,
  Hash,
  Heart,
  FileText,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

import type { Desafio } from '@/lib/types';

const CONTINENTES = [
  { value: '',          label: 'Global (todos los continentes)' },
  { value: 'Africa',    label: 'Africa' },
  { value: 'America',   label: 'America' },
  { value: 'Asia',      label: 'Asia' },
  { value: 'Europa',    label: 'Europa' },
  { value: 'Oceania',   label: 'Oceania' },
];

interface DesafioFormProps {
  modo: 'nuevo' | 'editar';
  desafio?: Desafio;
}

export default function DesafioForm(props: DesafioFormProps) {
  const { modo, desafio } = props;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autogen, setAutogen] = useState<boolean>(desafio?.autogen ?? true);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [preguntas, setPreguntas] = useState<QuestionDraft[]>(() => {
    try {
      return desafio?.preguntas_json ? (JSON.parse(desafio.preguntas_json) as QuestionDraft[]) : [];
    } catch {
      return [];
    }
  });
  const formRef = useRef<HTMLFormElement | null>(null);

  const getPrimaryLabel = () => {
    if (!autogen && preguntas.length === 0) return 'Registrar preguntas';
    return modo === 'nuevo' ? 'Crear Desafio' : 'Guardar Cambios';
  };

  const submitForm = async () => {
    if (!formRef.current) return;
    setError('');
    setLoading(true);

    const fd = new FormData(formRef.current);
    fd.set('autogen', autogen ? '1' : '0');

    if (!autogen) {
      fd.set('preguntas_json', JSON.stringify(preguntas));
    }

    const action = modo === 'nuevo' ? crearDesafio : actualizarDesafio;
    try {
      const res = await action(fd);
      if (res?.error) setError(res.error);
    } catch {
      // next/navigation redirect will handle redirects
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!autogen && preguntas.length === 0) {
      setShowQuestionEditor(true);
      return;
    }
    
    await submitForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/profesor"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-white font-bold text-xl">
            {modo === 'nuevo' ? 'Nuevo Desafio' : 'Editar Desafio'}
          </h1>
          <p className="text-slate-500 text-sm">
            {modo === 'nuevo'
              ? 'Crea un desafio para tus estudiantes'
              : `Editando: ${desafio?.titulo}`}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5"
      >
        {modo === 'editar' && desafio && (
          <input type="hidden" name="id" value={desafio.id} />
        )}

        <div>
          <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Titulo del Desafio
          </label>
          <input
            name="titulo"
            type="text"
            required
            defaultValue={desafio?.titulo ?? ''}
            placeholder="Ej: Capitales de Europa"
            maxLength={60}
            className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Descripcion (opcional)
          </label>
          <textarea
            name="descripcion"
            defaultValue={desafio?.descripcion ?? ''}
            placeholder="Describe el objetivo del desafio..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
            <Map className="w-4 h-4 text-blue-400" />
            Region geografica
          </label>
          <select
            name="continente"
            defaultValue={desafio?.continente ?? ''}
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
          >
            {CONTINENTES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
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
              className="w-full bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
            />
            <p className="text-slate-600 text-xs mt-1">Min 3, max 50</p>
            <label htmlFor="autogen" className="flex items-center gap-2 mt-2 text-slate-400 text-xs">
              <span className="flex items-center gap-2 mt-2 text-slate-400 text-xs">
                <input
                  name="autogen"
                  type="checkbox"
                  checked={autogen}
                  onChange={(event) => setAutogen(event.target.checked)}
                  className="w-4 h-4 text-amber-500 border-slate-700 focus:ring-amber-500 rounded"
                />
                Auto-generar preguntas
              </span>
            </label>

            {!autogen && (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionEditor(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-500 hover:text-emerald-200"
                >
                  {preguntas.length === 0 ? 'Registrar preguntas' : 'Editar preguntas'}
                </button>
                <p className="text-slate-400 text-xs">
                  {preguntas.length <= 0
                    ? 'Necesitas registrar preguntas manuales antes de guardar.'
                    : `${preguntas.length} pregunta${preguntas.length === 1 ? '' : 's'} registrada${preguntas.length === 1 ? '' : 's'}.`}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold mb-2">
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
              className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
            />
            <p className="text-slate-600 text-xs mt-1">Min 1, max 10</p>
          </div>
        </div>

        {modo === 'editar' && (
          <div className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              {desafio?.activo ? (
                <Eye className="w-4 h-4 text-emerald-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <p className="text-white text-sm font-semibold">Estado del desafio</p>
                <p className="text-slate-500 text-xs">Los desafios inactivos no son visibles para estudiantes</p>
              </div>
            </div>
            <select
              name="activo"
              defaultValue={desafio?.activo ? '1' : '0'}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/profesor"
            className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            Cancelar
          </Link>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 text-white font-bold rounded-xl py-3 text-sm transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {getPrimaryLabel()}
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

      {showQuestionEditor && (
        <DesafioPreguntas
          modo={modo}
          desafio={desafio}
          numPreguntas={parseInt(formRef.current?.num_preguntas.value ?? '10')}
          initialPreguntas={preguntas}
          onClose={() => setShowQuestionEditor(false)}
          onSave={(items) => {
            setPreguntas(items);
            setShowQuestionEditor(false);
          }}
        />
      )}
    </div>
  );
}
