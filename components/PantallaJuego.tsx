"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ArrowRight, HelpCircle, Map, AlertTriangle, Clock } from "lucide-react";
import FeedbackOverlay from "./FeedbackOverlay";
import type { Country, Question, QuestionType, Desafio } from "@/lib/types";

interface Props {
  paises: Country[];
  desafio: Desafio;
  nombreJugador: string;
  onGameOver: (puntaje: number) => void;
}

// Segundos disponibles para responder cada pregunta (maximo permitido).
const TIEMPO_POR_PREGUNTA = 30;

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

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export default function PantallaJuego({ paises, desafio, nombreJugador, onGameOver }: Props) {
  // Cola completa generada una sola vez al montar — sin efectos ni setState async
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cola = useMemo(() => generarCola(paises, desafio.num_preguntas), []);

  const [indice, setIndice]     = useState(0);
  const [puntaje, setPuntaje]   = useState(0);
  const [vidas, setVidas]       = useState(desafio.vidas);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"correcto" | "incorrecto" | null>(null);
  const [motivoFallo, setMotivoFallo] = useState<"incorrecto" | "tiempo" | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_POR_PREGUNTA);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Programa el avance/gameover y guarda el id para poder limpiarlo al desmontar.
  function scheduleTimeout(fn: () => void, ms: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fn, ms);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!feedback) setTimeout(() => inputRef.current?.focus(), 100);
  }, [indice, feedback]);

  // Reinicia el reloj al cambiar de pregunta.
  useEffect(() => {
    setTiempoRestante(TIEMPO_POR_PREGUNTA);
  }, [indice]);

  // Cuenta regresiva: descuenta 1s mientras la pregunta este activa (sin feedback).
  useEffect(() => {
    if (feedback || cola.length === 0) return;
    if (tiempoRestante <= 0) {
      fallar("tiempo");
      return;
    }
    const id = setTimeout(() => setTiempoRestante((t) => t - 1), 1000);
    return () => clearTimeout(id);
    // fallar depende de estado actual capturado en cada render; se omite a proposito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoRestante, feedback]);

  // Sin países disponibles → pantalla de error en lugar de terminar el juego
  if (cola.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-text font-bold">Sin paises disponibles</p>
        <button
          onClick={() => onGameOver(0)}
          className="bg-emerald-500 hover:bg-emerald-400 text-text font-bold rounded-xl px-5 py-2.5 text-sm transition-colors"
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
    setMotivoFallo(null);
  }

  // Camino compartido para respuesta incorrecta y para tiempo agotado:
  // pierde una vida, revela la respuesta y avanza (o termina si no quedan vidas).
  function fallar(motivo: "incorrecto" | "tiempo") {
    if (feedback) return; // evita doble disparo (submit + timeout simultaneos)
    const nuevasVidas = vidas - 1;
    setVidas(nuevasVidas);
    setFeedback("incorrecto");
    setMotivoFallo(motivo);
    if (nuevasVidas <= 0) {
      scheduleTimeout(() => onGameOver(puntaje), 1500);
    } else {
      scheduleTimeout(() => avanzar(puntaje), 1500);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pregunta || feedback) return;

    const esCorrecto = normalizar(respuesta) === normalizar(pregunta.correctAnswer);

    if (esCorrecto) {
      const nuevoPuntaje = puntaje + 1;
      setPuntaje(nuevoPuntaje);
      setFeedback("correcto");
      scheduleTimeout(() => avanzar(nuevoPuntaje), 1400);
    } else {
      fallar("incorrecto");
    }
  }

  const textosPregunta: Record<QuestionType, string> = {
    capital:    `Capital de ${pregunta.country.name}`,
    continente: `Continente de ${pregunta.country.name}`,
  };

  const progreso = (indice / desafio.num_preguntas) * 100;
  const urgente = tiempoRestante <= 5 && !feedback;

  return (
    <>
      <FeedbackOverlay feedback={feedback} motivo={motivoFallo} />

      <motion.div
        key={pregunta.country.name}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-5 w-full max-w-md"
      >
        {/* Header del desafio */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <Map className="w-3.5 h-3.5" />
          <span className="truncate">{desafio.titulo}</span>
        </div>

        {/* HUD */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: desafio.vidas }).map((_, i) => (
              <motion.div key={i} animate={vidas <= i ? { scale: [1, 1.4, 0] } : { scale: 1 }}>
                <Heart className={`w-5 h-5 ${i < vidas ? "text-red-400 fill-red-400" : "text-muted fill-border"}`} />
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-surface rounded-full px-3 py-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-text font-bold text-sm">{puntaje}</span>
          </div>

          <span className="text-muted text-xs">{indice + 1}/{desafio.num_preguntas}</span>
        </div>

        {/* Cuenta regresiva por pregunta */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={urgente ? { scale: [1, 1.18, 1] } : { scale: 1 }}
            transition={urgente ? { repeat: Infinity, duration: 0.6 } : { duration: 0.2 }}
          >
            <Clock className={`w-4 h-4 ${urgente ? "text-red-400" : "text-cyan-400"}`} />
          </motion.div>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                urgente ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-cyan-500"
              }`}
              animate={{ width: `${(Math.max(tiempoRestante, 0) / TIEMPO_POR_PREGUNTA) * 100}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
            />
          </div>
          <span
            className={`text-sm font-bold tabular-nums w-9 text-right ${
              urgente ? "text-red-400" : "text-muted"
            }`}
          >
            {Math.max(tiempoRestante, 0)}s
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Tarjeta del pais */}
        <div className="bg-surface/80 border border-border/50 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
          <motion.div
            key={pregunta.country.flagUrl}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="w-36 h-24 rounded-lg overflow-hidden border border-border shadow-lg"
          >
            {pregunta.country.flagUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pregunta.country.flagUrl}
                alt={`Bandera de ${pregunta.country.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-2">
                {pregunta.country.flagEmoji}
              </div>
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-text">{pregunta.country.name}</h2>

          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <p className="font-medium text-center">{textosPregunta[pregunta.type]}</p>
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
              className={`w-full rounded-xl px-4 py-3.5 text-text placeholder-muted outline-none transition-all border ${
                feedback === "correcto"
                  ? "bg-emerald-900/40 border-emerald-500"
                  : feedback === "incorrecto"
                  ? "bg-red-900/40 border-red-500"
                  : "bg-surface border-border focus:border-cyan-500"
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
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-text font-bold rounded-xl px-5 py-3.5 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </>
  );
}
