'use client';

import { FormEvent, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from 'lucide-react';

import type { Desafio } from '@/lib/types';

export type QuestionDraft = {
  id: number;
  type: 'capital' | 'continente';
  pregunta: string;
  respuesta: string;
};

interface Props {
  modo: 'nuevo' | 'editar';
  desafio?: Desafio;
  numPreguntas: number;
  initialPreguntas?: QuestionDraft[];
  onClose: () => void;
  onSave: (preguntas: QuestionDraft[]) => void;
}

export default function DesafioPreguntas({
  modo,
  desafio,
  numPreguntas,
  initialPreguntas = [],
  onClose,
  onSave,
}: Props) {
  const addPreguntasBotonRef = useRef<HTMLButtonElement>(null);
  const [preguntas, setPreguntas] = useState<QuestionDraft[]>(
    initialPreguntas.length > 0
      ? initialPreguntas
      : [{ id: Date.now(), type: 'capital', pregunta: '', respuesta: '' }]
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updatePregunta = (id: number, field: keyof QuestionDraft, value: string) => {
    setPreguntas((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addPregunta = useCallback((): void => {
    // addPreguntasBotonRef.current.disabled = false;

    if (preguntas.length >= numPreguntas) {
      if (addPreguntasBotonRef.current) {
        addPreguntasBotonRef.current.style.display = 'none';
      }
      setError(`No puedes agregar más de ${numPreguntas} preguntas.`);
      return;
    }

    setPreguntas((current) => [
      ...current,
      { id: Date.now(), type: 'capital', pregunta: '', respuesta: '' },
    ]);
  }, [ preguntas.length, numPreguntas ]);

  const removePregunta = (id: number) => {
    setPreguntas((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (preguntas.length === 0) {
      setError('Agrega al menos una pregunta manual.');
      return;
    }

    const hasInvalid = preguntas.some(
      (item) => !item.pregunta.trim() || !item.respuesta.trim()
    );
    if (hasInvalid) {
      setError('Completa todas las preguntas antes de continuar.');
      return;
    }

    setLoading(true);
    onSave(preguntas);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-white font-bold text-lg">
            {modo === 'nuevo' ? 'Registrar preguntas' : 'Editar preguntas'}
          </h2>
          <p className="text-slate-500 text-sm">
            {desafio?.titulo ?? 'Agrega preguntas manuales para este desafío.'}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {preguntas.map((pregunta, index) => (
          <div key={pregunta.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-slate-300 text-sm font-semibold">Pregunta {index + 1}</p>
                <p className="text-slate-500 text-xs">Elige el tipo y completa los campos.</p>
              </div>
              <button
                type="button"
                onClick={() => removePregunta(pregunta.id)}
                className="inline-flex items-center gap-2 rounded-full bg-red-600/10 px-3 py-2 text-xs text-red-300 hover:bg-red-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-slate-300 text-sm">
                Tipo de pregunta
                <select
                  value={pregunta.type}
                  onChange={(e) => updatePregunta(pregunta.id, 'type', e.target.value)}
                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none"
                >
                  <option value="capital">Capital</option>
                  <option value="continente">Continente</option>
                </select>
              </label>

              <label className="text-slate-300 text-sm">
                Respuesta correcta
                <input
                  value={pregunta.respuesta}
                  onChange={(e) => updatePregunta(pregunta.id, 'respuesta', e.target.value)}
                  placeholder="Ej: Madrid"
                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none"
                />
              </label>
            </div>

            <label className="text-slate-300 text-sm block">
              Texto de la pregunta
              <input
                value={pregunta.pregunta}
                onChange={(e) => updatePregunta(pregunta.id, 'pregunta', e.target.value)}
                placeholder="Ej: ¿Cuál es la capital de España?"
                className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white outline-none"
              />
            </label>
          </div>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            ref={addPreguntasBotonRef}
            onClick={addPregunta}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:border-emerald-500 hover:text-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Agregar pregunta
          </button>
          <p className="text-slate-400 text-xs">
            Usa preguntas cortas y respuestas claras para que los estudiantes respondan correctamente.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:border-slate-500"
          >
            Volver
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar preguntas
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
