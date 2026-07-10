"use client";

/**
 * JuegoController - Orquestador del juego para estudiantes.
 *
 * Estados:
 *   lobby    -> el jugador elige un desafio
 *   playing  -> juego en curso
 *   gameover -> resultados y leaderboard
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LobbyDesafios from "./LobbyDesafios";
import PantallaJuego from "./PantallaJuego";
import PantallaGameOver from "./PantallaGameOver";
import type { Country, Desafio, GameState, SessionPayload } from "@/lib/types";

interface Props {
  paises: Country[];
  desafios: Desafio[];
  sesion: SessionPayload;
}

export default function JuegoController({ paises, desafios, sesion }: Props) {
  const [gameState, setGameState]           = useState<GameState>("lobby");
  const [desafioActual, setDesafioActual]   = useState<Desafio | null>(null);
  const [paisesDelJuego, setPaisesDelJuego] = useState<Country[]>([]);
  const [puntajeFinal, setPuntajeFinal]     = useState(0);

  function handleStart(desafio: Desafio) {
    if ( !desafio ) {
      console.error("[JuegoController] Desafio no válido");
      return;
    }

    if ( !desafio.autogen ) {
      
    }

    let lista = !desafio.continente
      ? [...paises]
      : paises.filter(
          (p) =>
            p.continent.toLowerCase().trim() ===
            desafio.continente!.toLowerCase().trim()
        );

    // Fallback al pool global si el filtro de continente quedo vacio
    if (lista.length === 0 && paises.length > 0) {
      console.warn(`[JuegoController] Continente "${desafio.continente}" sin paises. Usando todos.`);
      lista = [...paises];
    }

    // Guardia final: si no hay paises de ninguna forma, no iniciar el juego
    if (lista.length === 0) {
      console.error("[JuegoController] Array de paises vacio, no se puede iniciar el juego");
      return;
    }

    console.info(`[JuegoController] Iniciando con ${lista.length} paises`);
    setDesafioActual(desafio);
    setPaisesDelJuego(lista.sort(() => Math.random() - 0.5));
    setGameState("playing");
  }

  function handleGameOver(puntaje: number) {
    setPuntajeFinal(puntaje);
    setGameState("gameover");
  }

  function handleReiniciar() {
    setDesafioActual(null);
    setPaisesDelJuego([]);
    setPuntajeFinal(0);
    setGameState("lobby");
  }

  return (
    <div className="w-full flex justify-center">
      <AnimatePresence mode="wait">
        {gameState === "lobby" && (
          <div key="lobby" className="w-full max-w-2xl">
            <LobbyDesafios
              desafios={desafios}
              sesion={sesion}
              onStart={handleStart}
            />
          </div>
        )}

        {gameState === "playing" && desafioActual && (
          <div key="playing" className="w-full max-w-md">
            <PantallaJuego
              paises={paisesDelJuego}
              desafio={desafioActual}
              nombreJugador={sesion.nombre}
              onGameOver={handleGameOver}
            />
          </div>
        )}

        {gameState === "gameover" && desafioActual && (
          <div key="gameover" className="w-full max-w-md">
            <PantallaGameOver
              nombreJugador={sesion.nombre}
              puntaje={puntajeFinal}
              desafio={desafioActual}
              onReiniciar={handleReiniciar}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
