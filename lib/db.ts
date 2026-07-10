/**
 * Modulo de conexion a SQLite via @libsql/client
 *
 * Tablas:
 *   usuarios      -> autenticacion, roles (estudiante/profesor)
 *   desafios      -> retos creados por profesores
 *   clasificacion -> puntajes por desafio
 */

import { createClient } from "@libsql/client";

const db = createClient({
  url: "file:database.db"
});

export async function initDB() {
  // Tabla de usuarios con roles
  await db.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    NOT NULL UNIQUE,
      nombre     TEXT    NOT NULL,
      password   TEXT    NOT NULL,
      rol        TEXT    NOT NULL DEFAULT 'estudiante',
      creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de desafios (profesor_id nullable para desafios del sistema)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS desafios (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo          TEXT    NOT NULL,
      descripcion     TEXT,
      continente      TEXT,
      num_preguntas   INTEGER NOT NULL DEFAULT 10,
      vidas           INTEGER NOT NULL DEFAULT 3,
      activo          INTEGER NOT NULL DEFAULT 1,
      profesor_id     INTEGER,
      creado_en       DATETIME DEFAULT CURRENT_TIMESTAMP,
      autogen         BOOLEAN NOT NULL DEFAULT 1,
      preguntas_json  TEXT,
      FOREIGN KEY (profesor_id) REFERENCES usuarios(id)
    )
  `);

  // Migrar tabla desafios si todavia tiene NOT NULL en profesor_id o le faltan columnas nuevas
  try {
    const pragmaInfo = await db.execute("PRAGMA table_info(desafios)");
    const columns = (pragmaInfo.rows as Record<string, unknown>[]).map((r) => r.name as string);
    const profCol = (pragmaInfo.rows as Record<string, unknown>[]).find(
      (r) => r.name === "profesor_id"
    );
    const needsRecreate = profCol && (profCol.notnull as number) === 1;
    const missingAutogen = !columns.includes("autogen");
    const missingPreguntasJson = !columns.includes("preguntas_json");

    if (needsRecreate) {
      await db.execute("DROP TABLE IF EXISTS desafios_new");
      await db.execute(`
        CREATE TABLE desafios_new (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo          TEXT    NOT NULL,
          descripcion     TEXT,
          continente      TEXT,
          num_preguntas   INTEGER NOT NULL DEFAULT 10,
          vidas           INTEGER NOT NULL DEFAULT 3,
          activo          INTEGER NOT NULL DEFAULT 1,
          profesor_id     INTEGER,
          creado_en       DATETIME DEFAULT CURRENT_TIMESTAMP,
          autogen         BOOLEAN NOT NULL DEFAULT 1,
          preguntas_json  TEXT,
          FOREIGN KEY (profesor_id) REFERENCES usuarios(id)
        )
      `);
      await db.execute(`
        INSERT INTO desafios_new (id, titulo, descripcion, continente, num_preguntas, vidas, activo, profesor_id, creado_en, autogen, preguntas_json)
        SELECT id, titulo, descripcion, continente, num_preguntas, vidas, activo, profesor_id, creado_en, COALESCE(autogen, 1), NULL
        FROM desafios
        WHERE profesor_id IS NULL OR profesor_id IN (SELECT id FROM usuarios)
      `);
      await db.execute("DROP TABLE desafios");
      await db.execute("ALTER TABLE desafios_new RENAME TO desafios");
    } else {
      if (missingAutogen) {
        await db.execute("ALTER TABLE desafios ADD COLUMN autogen BOOLEAN NOT NULL DEFAULT 1");
      }
      if (missingPreguntasJson) {
        await db.execute("ALTER TABLE desafios ADD COLUMN preguntas_json TEXT");
      }
    }
  } catch (e) {
    console.error("[initDB] migration error:", e);
  }

  // Tabla de puntajes vinculada a desafios y usuarios
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clasificacion (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id     INTEGER NOT NULL,
      desafio_id     INTEGER NOT NULL,
      nombre_usuario TEXT NOT NULL,
      puntaje        INTEGER NOT NULL,
      creado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY   (usuario_id)  REFERENCES usuarios(id),
      FOREIGN KEY   (desafio_id)  REFERENCES desafios(id)
    )
  `);

  // Migrar tabla clasificacion si falta usuario_id o desafio_id
  try {
    const pragmaClasificacion = await db.execute("PRAGMA table_info(clasificacion)");
    const columns = (pragmaClasificacion.rows as Record<string, unknown>[]).map((r) => r.name as string);
    const needsMigration = !columns.includes("usuario_id") || !columns.includes("desafio_id");

    if (needsMigration) {
      await db.execute("DROP TABLE IF EXISTS clasificacion_new");
      await db.execute(`
        CREATE TABLE clasificacion_new (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id     INTEGER NOT NULL DEFAULT 0,
          desafio_id     INTEGER NOT NULL DEFAULT 0,
          nombre_usuario TEXT NOT NULL,
          puntaje        INTEGER NOT NULL,
          creado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY   (usuario_id)  REFERENCES usuarios(id),
          FOREIGN KEY   (desafio_id)  REFERENCES desafios(id)
        )
      `);

      await db.execute(`
        INSERT INTO clasificacion_new (id, usuario_id, desafio_id, nombre_usuario, puntaje, creado_en)
        SELECT id, 0 AS usuario_id, 0 AS desafio_id, nombre_usuario, puntaje, creado_en
        FROM clasificacion
      `);

      await db.execute("DROP TABLE clasificacion");
      await db.execute("ALTER TABLE clasificacion_new RENAME TO clasificacion");
    }
  } catch (e) {
    console.error("[initDB] clasificacion migration error:", e);
  }

  // Desafio por defecto si no hay ninguno
  const existentes = await db.execute("SELECT COUNT(*) as n FROM desafios");
  if ( (existentes.rows[0].n as number) === 0 ) {
    await db.execute(`
      INSERT INTO desafios (titulo, descripcion, continente, num_preguntas, vidas, profesor_id)
      VALUES ('Desafio Global', 'El clasico: paises de todo el mundo', NULL, 10, 3, NULL)
    `);
  }
}

export default db;
