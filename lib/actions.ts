"use server";

/**
 * SERVER ACTIONS
 * Toda la logica de base de datos y autenticacion corre aqui (solo servidor).
 */

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import db, { initDB } from "@/lib/db";
import { crearSesion, eliminarSesion, obtenerSesion } from "@/lib/session";
import type { Desafio, DesafioResultadosData, ScoreEntry, SessionPayload } from "@/lib/types";

// ================================================================
// AUTH
// ================================================================

/** Registra un nuevo usuario */
export async function registrarUsuario(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const email  = (formData.get("email")  as string).trim().toLowerCase();
  const nombre = (formData.get("nombre") as string).trim();
  const pass   = formData.get("password") as string;
  const rol    = (formData.get("rol") as string) === "profesor" ? "profesor" : "estudiante";

  if (!email || !nombre || !pass) return { error: "Todos los campos son obligatorios." };
  if (pass.length < 6)            return { error: "La contrasena debe tener al menos 6 caracteres." };

  // Verificamos si el email ya existe
  const existe = await db.execute({ sql: "SELECT id FROM usuarios WHERE email = ?", args: [email] });
  if (existe.rows.length > 0) return { error: "Ya existe una cuenta con ese email." };

  const hash = await bcrypt.hash(pass, 10);
  const res  = await db.execute({
    sql:  "INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)",
    args: [email, nombre, hash, rol],
  });

  const payload: SessionPayload = {
    id:     Number(res.lastInsertRowid),
    email,
    nombre,
    rol: rol as "estudiante" | "profesor",
  };
  await crearSesion(payload);
  redirect(rol === "profesor" ? "/profesor?flash=registered" : "/?flash=registered");
}

/** Inicia sesion */
export async function iniciarSesion(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const pass  = formData.get("password") as string;

  if (!email || !pass) return { error: "Completa todos los campos." };

  const res = await db.execute({ sql: "SELECT * FROM usuarios WHERE email = ?", args: [email] });
  if (res.rows.length === 0) return { error: "Email o contrasena incorrectos." };

  const user = res.rows[0];
  const ok   = await bcrypt.compare(pass, user.password as string);
  if (!ok) return { error: "Email o contrasena incorrectos." };

  await crearSesion({
    id:     user.id as number,
    email:  user.email as string,
    nombre: user.nombre as string,
    rol:    user.rol as "estudiante" | "profesor",
  });
  redirect(user.rol === "profesor" ? "/profesor?flash=loggedin" : "/?flash=loggedin");
}

/** Cierra sesion */
export async function cerrarSesion() {
  await eliminarSesion();
  redirect("/auth?flash=loggedout");
}

// ================================================================
// DESAFIOS (CRUD del profesor)
// ================================================================

/** Crea un nuevo desafio */
export async function crearDesafio(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return { error: "Acceso denegado." };

  const titulo        = (formData.get("titulo")       as string).trim();
  const descripcion   = (formData.get("descripcion")  as string).trim();
  const continente    = (formData.get("continente")   as string) || null;
  const num_preguntas = parseInt(formData.get("num_preguntas") as string) || 10;
  const vidas         = parseInt(formData.get("vidas") as string) || 3;
  const autogen       = formData.get("autogen") === "1";
  const preguntas_json = (formData.get("preguntas_json") as string) || null;

  if (!titulo) return { error: "El titulo es obligatorio." };
  if (num_preguntas <= 0) return { error: "El numero de preguntas debe ser mayor que cero." };
  if (vidas <= 0) return { error: "El numero de vidas debe ser mayor que cero." };
  if (!autogen && !preguntas_json) return { error: "Registra al menos una pregunta manual o activa la generación automática." };

  await db.execute({
    sql:  "INSERT INTO desafios (titulo, descripcion, continente, num_preguntas, vidas, profesor_id, autogen, preguntas_json) VALUES (?,?,?,?,?,?,?,?)",
    args: [titulo, descripcion, continente, num_preguntas, vidas, sesion.id, autogen ? 1 : 0, preguntas_json],
  });
  redirect("/profesor?flash=created");
}

/** Actualiza un desafio existente */
export async function actualizarDesafio(formData: FormData): Promise<{ error?: string }> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return { error: "Acceso denegado." };

  const id            = parseInt(formData.get("id") as string);
  const titulo        = (formData.get("titulo")      as string).trim();
  const descripcion   = (formData.get("descripcion") as string).trim();
  const continente    = (formData.get("continente")  as string) || null;
  const num_preguntas = parseInt(formData.get("num_preguntas") as string) || 10;
  const vidas         = parseInt(formData.get("vidas") as string) || 3;
  const activo        = formData.get("activo") === "1" ? 1 : 0;
  const autogen       = formData.get("autogen") === "1";
  const preguntas_json = (formData.get("preguntas_json") as string) || null;

  if (num_preguntas <= 0) return { error: "El numero de preguntas debe ser mayor que cero." };
  if (vidas <= 0) return { error: "El numero de vidas debe ser mayor que cero." };
  if (!autogen && !preguntas_json) return { error: "Registra al menos una pregunta manual o activa la generación automática." };

  await db.execute({
    sql:  "UPDATE desafios SET titulo=?, descripcion=?, continente=?, num_preguntas=?, vidas=?, activo=?, autogen=?, preguntas_json=? WHERE id=? AND profesor_id=?",
    args: [titulo, descripcion, continente, num_preguntas, vidas, activo, autogen ? 1 : 0, preguntas_json, id, sesion.id],
  });
  redirect("/profesor?flash=updated");
}

/** Elimina un desafio (solo el profesor dueno) */
export async function eliminarDesafio(id: number): Promise<void> {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return;
  await db.execute({ sql: "DELETE FROM desafios WHERE id=? AND profesor_id=?", args: [id, sesion.id] });
  redirect("/profesor?flash=deleted");
}

/** Lista todos los desafios activos (para estudiantes) */
export async function obtenerDesafiosActivos(): Promise<Desafio[]> {
  await initDB();
  const res = await db.execute(`
    SELECT d.*, u.nombre as profesor_nombre
    FROM desafios d
    LEFT JOIN usuarios u ON u.id = d.profesor_id
    WHERE d.activo = 1
    ORDER BY d.creado_en DESC
  `);
  return (res?.rows ?? []).map(rowToDesafio);
}

/** Lista los desafios del profesor logueado */
export async function obtenerMisDesafios(): Promise<Desafio[]> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion) return [];

  const res = await db.execute({
    sql: `
      SELECT
        d.*,
        COUNT(c.id) AS total_participaciones,
        COUNT(DISTINCT c.usuario_id) AS participantes_unicos,
        COALESCE(AVG(c.puntaje), 0) AS promedio_puntaje,
        SUM(CASE WHEN c.puntaje >= 50 THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN c.puntaje < 50 THEN 1 ELSE 0 END) AS reprobados,
        MAX(c.creado_en) AS ultima_participacion
      FROM desafios d
      LEFT JOIN clasificacion c ON c.desafio_id = d.id
      WHERE d.profesor_id = ?
      GROUP BY d.id
      ORDER BY d.creado_en DESC
    `,
    args: [sesion.id],
  });

  return (res?.rows ?? []).map(rowToDesafio);
}

export async function obtenerDesafioResultados(desafio_id: number): Promise<import("./types").DesafioResultadosData | null> {
  await initDB();
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "profesor") return null;

  const desafioRes = await db.execute({
    sql: "SELECT * FROM desafios WHERE id = ? AND profesor_id = ?",
    args: [desafio_id, sesion.id],
  });
  if (desafioRes.rows.length === 0) return null;

  const desafio = rowToDesafio(desafioRes.rows[0] as Record<string, unknown>);

  const metricsRes = await db.execute({
    sql: `
      SELECT
        COUNT(c.id) AS total_participaciones,
        COUNT(DISTINCT c.usuario_id) AS participantes_unicos,
        COALESCE(AVG(c.puntaje), 0) AS promedio_puntaje,
        SUM(CASE WHEN c.puntaje >= 50 THEN 1 ELSE 0 END) AS aprobados,
        SUM(CASE WHEN c.puntaje < 50 THEN 1 ELSE 0 END) AS reprobados,
        MAX(c.creado_en) AS ultima_participacion
      FROM clasificacion c
      WHERE c.desafio_id = ?
    `,
    args: [desafio_id],
  });

  const metricsRow = metricsRes.rows[0] as Record<string, unknown>;
  const metrics = {
    total_participaciones: Number(metricsRow.total_participaciones ?? 0),
    participantes_unicos: Number(metricsRow.participantes_unicos ?? 0),
    promedio_puntaje: Number(metricsRow.promedio_puntaje ?? 0),
    aprobados: Number(metricsRow.aprobados ?? 0),
    reprobados: Number(metricsRow.reprobados ?? 0),
    ultima_participacion: (metricsRow.ultima_participacion as string) ?? null,
  };

  const timelineRes = await db.execute({
    sql: `
      SELECT strftime('%Y-%m', creado_en) AS periodo,
             COUNT(*) AS participaciones
      FROM clasificacion
      WHERE desafio_id = ?
      GROUP BY periodo
      ORDER BY periodo ASC
    `,
    args: [desafio_id],
  });

  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const timeline = (timelineRes.rows ?? []).map((row) => {
    const periodo = row.periodo as string;
    const [year, month] = periodo.split("-");
    const label = `${monthNames[Number(month) - 1] ?? month} ${year}`;
    return {
      label,
      value: Number(row.participaciones ?? 0),
    };
  });

  const entriesRes = await db.execute({
    sql: `
      SELECT id, usuario_id, nombre_usuario, puntaje, creado_en
      FROM clasificacion
      WHERE desafio_id = ?
      ORDER BY creado_en DESC
    `,
    args: [desafio_id],
  });

  const entries: ScoreEntry[] = (entriesRes.rows ?? []).map((entry) => ({
    id: entry.id as number,
    usuario_id: entry.usuario_id as number,
    nombre_usuario: entry.nombre_usuario as string,
    puntaje: entry.puntaje as number,
    creado_en: entry.creado_en as string,
    desafio_titulo: desafio.titulo,
  }));

  return { desafio, metrics, entries, timeline };
}

function rowToDesafio(row: Record<string, unknown>): Desafio {
  return {
    id:            row.id as number,
    titulo:        row.titulo as string,
    descripcion:   (row.descripcion as string) ?? "",
    continente:    row.continente as string | null,
    num_preguntas: row.num_preguntas as number,
    vidas:         row.vidas as number,
    activo:        (row.activo as number) === 1,
    profesor_id:   row.profesor_id as number,
    profesor_nombre: row.profesor_nombre as string | undefined,
    creado_en:     row.creado_en as string,
    autogen:       (row.autogen as number) === 1,
    preguntas_json: row.preguntas_json as string | undefined,
    total_participaciones: Number(row.total_participaciones ?? 0),
    participantes_unicos:  Number(row.participantes_unicos ?? 0),
    promedio_puntaje:      Number(row.promedio_puntaje ?? 0),
    aprobados:             Number(row.aprobados ?? 0),
    reprobados:            Number(row.reprobados ?? 0),
    ultima_participacion:  (row.ultima_participacion as string) ?? null,
  };
}

// ================================================================
// PUNTAJES
// ================================================================

export async function guardarPuntaje(
  desafio_id: number,
  puntaje: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await initDB();
    const sesion = await obtenerSesion();
    if (!sesion) return { ok: false, error: "No autenticado." };

    await db.execute({
      sql:  "INSERT INTO clasificacion (usuario_id, desafio_id, nombre_usuario, puntaje) VALUES (?,?,?,?)",
      args: [sesion.id, desafio_id, sesion.nombre, puntaje],
    });
    return { ok: true };
  } catch (err) {
    console.error("[guardarPuntaje]", err);
    return { ok: false, error: "No se pudo guardar el puntaje." };
  }
}

export async function obtenerClasificacion(desafio_id: number): Promise<ScoreEntry[]> {
  try {
    await initDB();
    const res = await db.execute({
      sql: `
        SELECT c.id, c.usuario_id, c.nombre_usuario, c.puntaje, c.creado_en, d.titulo as desafio_titulo
        FROM clasificacion c
        JOIN desafios d ON d.id = c.desafio_id
        WHERE c.desafio_id = ?
        ORDER BY c.puntaje DESC
        LIMIT 10
      `,
      args: [desafio_id],
    });
    return res.rows.map((r) => ({
      id:             r.id as number,
      usuario_id:     r.usuario_id as number,
      nombre_usuario: r.nombre_usuario as string,
      puntaje:        r.puntaje as number,
      desafio_titulo: r.desafio_titulo as string,
      creado_en:      r.creado_en as string,
    }));
  } catch (err) {
    console.error("[obtenerClasificacion]", err);
    return [];
  }
}
