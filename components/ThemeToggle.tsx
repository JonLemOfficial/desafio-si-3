"use client";

/**
 * ThemeToggle - Interruptor de modo claro/oscuro.
 *
 * El tema real lo aplica el script inline del layout antes de pintar (data-theme
 * en <html>). Aqui solo lo leemos tras montar (para no romper la hidratacion),
 * lo alternamos y lo persistimos en localStorage.
 */

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type Tema = "light" | "dark";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");
    setTema(actual === "light" ? "light" : "dark");
  }, []);

  function alternar() {
    const siguiente: Tema = tema === "light" ? "dark" : "light";
    setTema(siguiente);
    document.documentElement.setAttribute("data-theme", siguiente);
    try {
      localStorage.setItem("theme", siguiente);
    } catch {
      /* localStorage no disponible: el cambio sigue aplicando en esta sesion */
    }
  }

  const esClaro = tema === "light";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={esClaro ? "Activar modo oscuro" : "Activar modo claro"}
      title={esClaro ? "Modo oscuro" : "Modo claro"}
      className={`flex items-center justify-center rounded-lg p-1.5 text-muted hover:text-text hover:bg-surface transition-colors ${className}`}
    >
      {esClaro ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
