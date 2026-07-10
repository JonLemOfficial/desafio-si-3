import { NextResponse } from "next/server";
import { obtenerDesafioResultados } from "@/lib/actions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const desafioId = Number(id);
  
  if (Number.isNaN(desafioId) || desafioId <= 0) {
    return NextResponse.json({ error: "Id de desafío inválido." }, { status: 400 });
  }

  const resultados = await obtenerDesafioResultados(desafioId);
  if (!resultados) {
    return NextResponse.json({ error: "No se encontraron resultados" }, { status: 404 });
  }

  return NextResponse.json(resultados, { status: 200 });
}
