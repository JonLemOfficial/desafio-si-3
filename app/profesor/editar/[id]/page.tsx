// import { useEffect } from "react";
import { obtenerSesion } from "@/lib/session";
import { redirect } from "next/navigation";
import db, { initDB } from "@/lib/db";
import DesafioForm from "@/components/DesafioForm";
import type { Desafio } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarDesafioPage({ params }: Props) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") redirect("/auth");

  const { id } = await params;
  await initDB();

  const res = await db.execute({
    sql:  "SELECT * FROM desafios WHERE id = ? AND profesor_id = ?",
    args: [ parseInt(id), sesion.id ],
  });

  if (res.rows.length === 0) redirect("/profesor");

  const r = res.rows[0];
  const desafio: Desafio = {
    id:             r.id as number,
    titulo:         r.titulo as string,
    descripcion:    (r.descripcion as string) ?? "",
    continente:     r.continente as string | null,
    num_preguntas:  r.num_preguntas as number,
    vidas:          r.vidas as number,
    activo:         (r.activo as number) === 1,
    profesor_id:    r.profesor_id as number,
    creado_en:      r.creado_en as string,
    autogen:        (r.autogen as number) === 1,
    preguntas_json: r.preguntas_json ? (r.preguntas_json as string) : undefined,
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] p-6">
      <div className="max-w-xl mx-auto">
        <DesafioForm modo="editar" desafio={desafio} />
      </div>
    </main>
  );
}
