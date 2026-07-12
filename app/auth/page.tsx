import { obtenerSesion } from "@/lib/session";
import { redirect } from "next/navigation";
import AuthForms from "@/components/AuthForms";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AuthPage() {
  // Si ya hay sesion activa, redirigimos al inicio
  const sesion = await obtenerSesion();
  if (sesion) redirect("/");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Toggle de tema flotante (esta pantalla no tiene header) */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl" />
      </div>
      <AuthForms />
    </main>
  );
}
