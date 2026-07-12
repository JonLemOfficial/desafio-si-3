import { obtenerSesion } from "@/lib/session";
import { redirect } from "next/navigation";
import DesafioForm from "@/components/DesafioForm";

export default async function NuevoDesafioPage() {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") redirect("/auth");

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto">
        <DesafioForm modo="nuevo" />
      </div>
    </main>
  );
}
