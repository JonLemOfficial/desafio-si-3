/**
 * Constantes de continentes compartidas.
 * El fetch de paises se hace en el cliente (AppShell) para evitar
 * restricciones de red en Vercel serverless — no exportar obtenerPaises
 * desde Server Components.
 */

// Continentes validos segun la REST Countries API v3.1
export const CONTINENTES_VALIDOS = new Set([
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Antarctic",
]);

// Mapeo de nombres en ingles (API) a espanol (BD / UI)
export const CONTINENTE_ES: Record<string, string> = {
  Africa: "Africa",
  Americas: "America",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceania",
  Antarctic: "Antartica",
};

// Exonimos de capitales: nombre del dataset (ingles/nativo) -> nombre en espanol.
// Solo se listan las que difieren; las no listadas se dejan tal cual (Madrid,
// Lima, Santiago, Ottawa, Canberra... se escriben igual). Las claves coinciden
// exactamente con el string que entrega el dataset mledoze/countries.
// Nota: el juego normaliza (minusculas + sin tildes) al comparar, asi que las
// tildes no afectan la validacion de la respuesta.
export const CAPITAL_ES: Record<string, string> = {
  "Abu Dhabi": "Abu Dabi",
  "Addis Ababa": "Adís Abeba",
  "Algiers": "Argel",
  "Athens": "Atenas",
  "Baghdad": "Bagdad",
  "Baku": "Bakú",
  "Beijing": "Pekín",
  "Belgrade": "Belgrado",
  "Bern": "Berna",
  "Brussels": "Bruselas",
  "Bucharest": "Bucarest",
  "Cairo": "El Cairo",
  "Chișinău": "Chisináu",
  "Copenhagen": "Copenhague",
  "Damascus": "Damasco",
  "Dublin": "Dublín",
  "Hanoi": "Hanói",
  "Havana": "La Habana",
  "Jakarta": "Yakarta",
  "Jerusalem": "Jerusalén",
  "Kathmandu": "Katmandú",
  "Khartoum": "Jartum",
  "Kyiv": "Kiev",
  "Kuwait City": "Ciudad de Kuwait",
  "Lisbon": "Lisboa",
  "London": "Londres",
  "Mexico City": "Ciudad de México",
  "Mogadishu": "Mogadiscio",
  "Moscow": "Moscú",
  "New Delhi": "Nueva Delhi",
  "Panama City": "Ciudad de Panamá",
  "Paris": "París",
  "Prague": "Praga",
  "Pyongyang": "Pionyang",
  "Reykjavik": "Reikiavik",
  "Riyadh": "Riad",
  "Rome": "Roma",
  "Sana'a": "Saná",
  "Seoul": "Seúl",
  "Skopje": "Skopie",
  "Sofia": "Sofía",
  "Stockholm": "Estocolmo",
  "Taipei": "Taipéi",
  "Tallinn": "Tallin",
  "Tashkent": "Taskent",
  "Tbilisi": "Tiflis",
  "Tehran": "Teherán",
  "Tokyo": "Tokio",
  "Tripoli": "Trípoli",
  "Tunis": "Túnez",
  "Ulan Bator": "Ulán Bator",
  "Vienna": "Viena",
  "Vilnius": "Vilna",
  "Warsaw": "Varsovia",
  "Yaoundé": "Yaundé",
  "Yerevan": "Ereván",
};
