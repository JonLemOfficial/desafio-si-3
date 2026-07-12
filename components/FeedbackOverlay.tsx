"use client";

/**
 * FeedbackOverlay - Animacion muy resaltante para respuestas correctas/incorrectas.
 *
 * Se dibuja como una capa fija sobre toda la pantalla (pointer-events-none) y se
 * activa a partir del estado `feedback` que ya maneja PantallaJuego. La animacion
 * dura ~1s, dentro de la ventana de "reveal" existente antes de avanzar de pregunta.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

type Feedback = "correcto" | "incorrecto" | null;
type Motivo = "incorrecto" | "tiempo" | null;

interface Props {
  feedback: Feedback;
  motivo: Motivo;
}

// Angulos/distancias pre-generados para el estallido de confeti (correcto).
const CONFETI = Array.from({ length: 14 }, (_, i) => {
  const angulo = (i / 14) * Math.PI * 2;
  const distancia = 90 + Math.random() * 70;
  return {
    x: Math.cos(angulo) * distancia,
    y: Math.sin(angulo) * distancia,
    color: ["#34d399", "#22d3ee", "#fbbf24", "#a78bfa"][i % 4],
    delay: Math.random() * 0.08,
  };
});

export default function FeedbackOverlay({ feedback, motivo }: Props) {
  const esCorrecto = feedback === "correcto";
  const etiqueta = esCorrecto
    ? "¡Correcto! +1"
    : motivo === "tiempo"
    ? "¡Tiempo agotado!"
    : "¡Incorrecto!";

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback + (motivo ?? "")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Tinte de fondo segun resultado */}
          <div
            className={`absolute inset-0 ${
              esCorrecto ? "bg-emerald-500/10" : "bg-red-500/10"
            }`}
          />

          {/* Estallido de confeti (solo correcto) */}
          {esCorrecto &&
            CONFETI.map((c, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: c.x, y: c.y, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.8, delay: c.delay, ease: "easeOut" }}
                className="absolute w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: c.color }}
              />
            ))}

          {/* Icono + etiqueta */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={
              esCorrecto
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, x: [0, -12, 12, -9, 9, -4, 0] }
            }
            transition={
              esCorrecto
                ? { type: "spring", stiffness: 320, damping: 14 }
                : { duration: 0.5 }
            }
            className="relative flex flex-col items-center gap-3"
          >
            {esCorrecto ? (
              <CheckCircle2 className="w-28 h-28 text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]" />
            ) : (
              <XCircle className="w-28 h-28 text-red-400 drop-shadow-[0_0_25px_rgba(248,113,113,0.6)]" />
            )}
            <span
              className={`text-2xl font-extrabold tracking-tight drop-shadow-lg ${
                esCorrecto ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {etiqueta}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
