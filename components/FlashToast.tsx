"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, X } from "lucide-react";

const FLASH_MESSAGES: Record<string, { text: string; type: "success" | "info" }> = {
  registered: { text: "¡Cuenta creada con exito! Bienvenido.", type: "success" },
  loggedin:   { text: "Sesion iniciada correctamente.", type: "success" },
  loggedout:  { text: "Has cerrado sesion.", type: "info" },
  created:    { text: "¡Desafio creado con exito!", type: "success" },
  updated:    { text: "Desafio actualizado correctamente.", type: "success" },
  deleted:    { text: "Desafio eliminado.", type: "info" },
};

type Toast = { id: number; text: string; type: "success" | "info" };

export default function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastFlash = useRef<string | null>(null);

  useEffect(() => {
    const flash = searchParams.get("flash");
    if (!flash || flash === lastFlash.current || !FLASH_MESSAGES[flash]) return;
    lastFlash.current = flash;

    const { text, type } = FLASH_MESSAGES[flash];
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const qs = params.toString();
    const newUrl = pathname + (qs ? "?" + qs : "");
    router.replace(newUrl, { scroll: false });

    const timer = setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4500
    );
    return () => clearTimeout(timer);
  }, [searchParams, pathname, router]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl border max-w-xs ${
              toast.type === "success"
                ? "bg-surface-2 border-emerald-500/40 shadow-emerald-500/10"
                : "bg-surface-2 border-border/60 shadow-black/40"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-muted shrink-0" />
            )}
            <p className="text-text text-sm font-medium flex-1">{toast.text}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted hover:text-text transition-colors ml-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
