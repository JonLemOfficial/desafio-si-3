// ============================================================
// Tipos compartidos entre cliente y servidor
// ============================================================

export interface Country {
  name: string;
  capital: string;
  continent: string;
  flagUrl: string;
  flagEmoji: string;
}

export type QuestionType = "capital" | "continente";

export interface Question {
  id?: number;
  country?: Country;
  type: QuestionType;
  correctAnswer: string;
  prompt?: string;
}

export interface ScoreEntry {
  id: number;
  usuario_id: number;
  nombre_usuario: string;
  puntaje: number;
  desafio_titulo: string;
  creado_en: string;
}

export interface TimelinePoint {
  label: string;
  value: number;
}

export interface DesafioMetrics {
  total_participaciones: number;
  participantes_unicos: number;
  promedio_puntaje: number;
  aprobados: number;
  reprobados: number;
  ultima_participacion: string | null;
}

export interface DesafioResultadosData {
  desafio: Desafio;
  metrics: DesafioMetrics;
  entries: ScoreEntry[];
  timeline: TimelinePoint[];
}

// ---- Auth ----

export type Rol = "estudiante" | "profesor";

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

// Payload del JWT guardado en la cookie de sesion
export interface SessionPayload {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

// ---- Desafios ----

export interface Desafio {
  id: number;
  titulo: string;
  descripcion: string;
  continente: string | null;   // null = todos los continentes
  num_preguntas: number;
  vidas: number;
  activo: boolean;
  profesor_id: number;
  profesor_nombre?: string;
  creado_en: string;
  autogen?: boolean; // true = preguntas generadas automaticamente, false = preguntas personalizadas
  preguntas_json?: string;
  total_participaciones?: number;
  participantes_unicos?: number;
  promedio_puntaje?: number;
  aprobados?: number;
  reprobados?: number;
  ultima_participacion?: string;
}

export type GameState = "lobby" | "playing" | "gameover";
