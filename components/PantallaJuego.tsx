"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ArrowRight, HelpCircle, Map, AlertTriangle } from "lucide-react";
import type { Country, Question, QuestionType, Desafio } from "@/lib/types";

interface Props {
  paises: Country[];
  desafio: Desafio;
  nombreJugador: string;
  onGameOver: (puntaje: number) => void;
}

interface PreguntaManual {
  id?: number;
  type?: QuestionType;
  pregunta?: string;
  respuesta?: string;
}

// Pre-genera toda la cola de preguntas de una sola vez sin estado intermedio
function generarCola(paises: Country[], numPreguntas: number): Question[] {
  const shuffled = [...paises].sort(() => Math.random() - 0.5);
  const seleccionados = shuffled.slice(0, numPreguntas);
  return seleccionados.map((pais) => {
    const tipo: QuestionType = Math.random() > 0.5 ? "capital" : "continente";
    return {
      country: pais,
      type: tipo,
      correctAnswer: tipo === "capital" ? pais.capital : pais.continent,
    };
  });
}

function generarColaManual(desafio: Desafio): Question[] {
  if (!desafio.preguntas_json) return [];

  try {
    const preguntas = JSON.parse(desafio.preguntas_json) as PreguntaManual[];
    return preguntas
      .filter((item) => item?.pregunta?.trim() && item?.respuesta?.trim())
      .slice(0, desafio.num_preguntas)
      .map((item, index) => ({
        id: item.id ?? index,
        type: item.type === "continente" ? "continente" : "capital",
        correctAnswer: item.respuesta!.trim(),
        prompt: item.pregunta!.trim(),
      }));
  } catch (error) {
    console.error("[PantallaJuego] No se pudieron parsear las preguntas manuales", error);
    return [];
  }
}

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export default function PantallaJuego({ paises, desafio, nombreJugador, onGameOver }: Props) {
  // Cola completa generada una sola vez al montar — sin efectos ni setState async
  const cola = useMemo(() => {
    if (desafio.autogen === false) {
      return generarColaManual(desafio);
    }
    return generarCola(paises, desafio.num_preguntas);
  }, [desafio, paises]);

  const [indice, setIndice]     = useState(0);
  const [puntaje, setPuntaje]   = useState(0);
  const [vidas, setVidas]       = useState(desafio.vidas);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!feedback) setTimeout(() => inputRef.current?.focus(), 100);
  }, [indice, feedback]);

  // Sin países disponibles → pantalla de error en lugar de terminar el juego
  if (cola.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-white font-bold">Sin paises disponibles</p>
        <button
          onClick={() => onGameOver(0)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-colors"
        >
          Volver al lobby
        </button>
      </div>
    );
  }

  const pregunta = cola[indice];

  function avanzar(nuevoPuntaje: number) {
    const siguiente = indice + 1;
    if (siguiente >= cola.length) {
      onGameOver(nuevoPuntaje);
      return;
    }
    setIndice(siguiente);
    setRespuesta("");
    setFeedback(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pregunta || feedback) return;

    const esCorrecto = normalizar(respuesta) === normalizar(pregunta.correctAnswer);

    if (esCorrecto) {
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      setFeedback("correcto");
      setTimeout(() => avanzar(nuevoPuntaje), 1200);
    } else {
      const nuevasVidas = vidas - 1;
      setVidas(nuevasVidas);
      setFeedback("incorrecto");
      if (nuevasVidas <= 0) {
        setTimeout(() => onGameOver(puntaje), 1500);
      } else {
        setTimeout(() => avanzar(puntaje), 1500);
      }
    }
  }

  const textoPregunta = pregunta.prompt
    ? pregunta.prompt
    : pregunta.country
      ? pregunta.type === "capital"
        ? `Capital de ${pregunta.country.name}`
        : `Continente de ${pregunta.country.name}`
      : "Responde a la pregunta";

  const progreso = (indice / Math.max(desafio.num_preguntas, 1)) * 100;

  return (
    <motion.div
      key={pregunta.country?.name ?? pregunta.id ?? indice}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-5 w-full max-w-md"
    >
      {/* Header del desafio */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Map className="w-3.5 h-3.5" />
        <span className="truncate">{desafio.titulo}</span>
      </div>

      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: desafio.vidas }).map((_, i) => (
            <motion.div key={i} animate={vidas <= i ? { scale: [1, 1.4, 0] } : { scale: 1 }}>
              <Heart className={`w-5 h-5 ${i < vidas ? "text-red-400 fill-red-400" : "text-slate-700 fill-slate-700"}`} />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-white font-bold text-sm">{puntaje}</span>
        </div>

        <span className="text-slate-500 text-xs">{indice + 1}/{desafio.num_preguntas}</span>
      </div>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Tarjeta del pais */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
        {pregunta.country ? (
          <motion.div
            key={pregunta.country.flagUrl}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="w-36 h-24 rounded-lg overflow-hidden border border-slate-600 shadow-lg"
          >
            {pregunta.country.flagUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pregunta.country.flagUrl}
                alt={`Bandera de ${pregunta.country.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-700">
                {pregunta.country.flagEmoji}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="w-36 h-24 rounded-lg border border-dashed border-slate-600 bg-slate-700/70 flex items-center justify-center text-4xl">
            ❓
          </div>
        )}

        <h2 className="text-2xl font-bold text-white">
          {pregunta.country ? pregunta.country.name : "Pregunta personalizada"}
        </h2>

        <div className="flex items-center gap-2 text-cyan-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <p className="font-medium text-center">{textoPregunta}</p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            disabled={!!feedback}
            placeholder="Tu respuesta..."
            className={`w-full rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all border ${
              feedback === "correcto"
                ? "bg-emerald-900/40 border-emerald-500"
                : feedback === "incorrecto"
                ? "bg-red-900/40 border-red-500"
                : "bg-slate-800 border-slate-600 focus:border-cyan-500"
            }`}
          />
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute -bottom-6 left-1 text-xs font-medium ${
                  feedback === "correcto" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {feedback === "correcto" ? "Correcto! +1" : `Era: ${pregunta.correctAnswer}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={!respuesta.trim() || !!feedback}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl px-5 py-3.5 transition-all"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  );
}
