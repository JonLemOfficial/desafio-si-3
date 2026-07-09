import { CONTINENTES_VALIDOS, CONTINENTE_ES, CAPITAL_ES } from "@/lib/countries";
import type { Country } from "@/lib/types";

/**
 * Proxy de paises.
 *
 * restcountries.com/v3.1 fue DEPRECADO (devuelve {success:false,...}),
 * por eso fallaba siempre. Usamos el dataset mledoze/countries, servido
 * desde dos CDNs distintos para resiliencia. Las imagenes de bandera se
 * construyen desde el codigo ISO (cca2) via flagcdn.com.
 */
const SOURCES = [
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json",
  "https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json",
];

async function fetchJson(url: string, timeoutMs = 10000): Promise<unknown[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(timer);
  }
}

// El dataset mledoze usa `region` (no `continents`) y `cca2` para la bandera.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsear(raw: unknown[]): Country[] {
  return (raw as any[])
    .filter((p) => {
      const region = p.region;
      const capital = p.capital?.[0];
      return capital && region && CONTINENTES_VALIDOS.has(region);
    })
    .map((p) => {
      const code = typeof p.cca2 === "string" ? p.cca2.toLowerCase() : "";
      const capEn = p.capital[0];
      return {
        // Nombre del pais en espanol (fallback al ingles si no hay traduccion)
        name: p.translations?.spa?.common ?? p.name.common,
        // Capital traducida al espanol si existe exonimo consolidado
        capital: CAPITAL_ES[capEn] ?? capEn,
        continent: CONTINENTE_ES[p.region] ?? p.region,
        flagUrl: code ? `https://flagcdn.com/${code}.svg` : "",
        flagEmoji: p.flag || "🏳️",
      };
    });
}

export async function GET() {
  for (const url of SOURCES) {
    try {
      const raw = await fetchJson(url);
      const paises = parsear(raw);
      if (paises.length >= 50) {
        return Response.json(paises);
      }
      console.warn(`[/api/countries] Solo ${paises.length} paises desde ${url}`);
    } catch (err) {
      console.error(`[/api/countries] Fallo en ${url}:`, err);
    }
  }

  console.error("[/api/countries] Todas las fuentes fallaron");
  return Response.json(
    { error: "No se pudieron cargar los paises" },
    { status: 503 }
  );
}
