import "server-only";
import { prisma } from "../prisma";
import { DEMO_MODE } from "../demo";
import { REGLAS, type ReglaSeed } from "./reglas-seed";
import { resolucionSchema, type Resolucion } from "./schema";
import type { EntradaCaso } from "./index";

/*
 * Motor por REGLAS (base de conocimiento en SQLite).
 *
 * Fuente PRINCIPAL de resolución: gratis y sin depender de la IA. Consulta las
 * filas `Regla` activas (ordenadas por prioridad), encuentra la primera cuyos
 * criterios coinciden con el caso y la mapea a una `Resolucion` validada con el
 * mismo esquema que devuelve Claude. Si ninguna regla cubre el caso, devuelve
 * null y el index decide el siguiente paso (IA o fallback genérico).
 *
 * Ampliar el conocimiento = añadir filas en la base, no tocar este archivo.
 */

const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Consulta Prisma de reglas activas con sus relaciones (define la forma). */
function cargarReglasDb() {
  return prisma.regla.findMany({
    where: { activa: true },
    orderBy: { prioridad: "desc" },
    include: {
      documentos: true,
      normativa: true,
      riesgos: true,
      alertas: true,
      pasos: { orderBy: { orden: "asc" } },
    },
  });
}

/** Una regla con sus relaciones cargadas. */
type ReglaConRelaciones = Awaited<
  ReturnType<typeof cargarReglasDb>
>[number];

/**
 * Adapta una regla semilla (ReglaSeed) a la misma forma que devuelve Prisma con
 * sus relaciones incluidas, para que el resto del archivo (coincide, similitud,
 * aResolucion) la consuma sin cambios. Solo se usa en modo demo.
 */
function aReglaConRelaciones(r: ReglaSeed): ReglaConRelaciones {
  return {
    nombre: r.nombre,
    prioridad: r.prioridad ?? 0,
    productoMatch: r.productoMatch ?? null,
    hsTaric: r.hsTaric ?? null,
    origen: r.origen ?? null,
    destino: r.destino ?? null,
    tipo: r.tipo ?? null,
    resumen: r.resumen,
    confianza: r.confianza,
    requisitosSanitarios: r.requisitosSanitarios?.join("\n") ?? null,
    verificar: r.verificar?.join("\n") ?? null,
    documentos: r.documentos.map((d) => ({ doc: d.doc, estado: d.estado })),
    normativa: r.normativa.map((n) => ({
      titulo: n.titulo,
      fuente: n.fuente,
      url: n.url ?? null,
      relevancia: n.relevancia ?? null,
    })),
    riesgos: r.riesgos.map((ri) => ({ tipo: ri.tipo, nivel: ri.nivel, motivo: ri.motivo })),
    alertas: (r.alertas ?? []).map((a) => ({ severidad: a.severidad, mensaje: a.mensaje })),
    pasos: r.pasos.map((texto) => ({ texto })),
  } as unknown as ReglaConRelaciones;
}

async function cargarReglas(): Promise<ReglaConRelaciones[]> {
  // Modo demo (sin BD): reglas en memoria, ya ordenadas por prioridad desc.
  if (DEMO_MODE) {
    return REGLAS.map(aReglaConRelaciones).sort(
      (a, b) => b.prioridad - a.prioridad,
    );
  }
  return cargarReglasDb();
}

/** Criterios del caso ya normalizados, para comparar contra cada regla. */
interface Caso {
  texto: string;
  origen: string;
  destino: string;
  tipo: string;
  hs: string;
}

/**
 * ¿La regla cubre este caso?
 * - `productoMatch` es el criterio fuerte: su término debe aparecer en el texto.
 * - origen/destino/tipo/hsTaric solo descartan si el caso aporta un valor que
 *   los CONTRADICE; si el dato falta en el caso, no bloquean (matching tolerante).
 * Debe existir al menos un criterio (evita reglas comodín).
 */
function coincide(r: ReglaConRelaciones, c: Caso): boolean {
  if (r.productoMatch && !c.texto.includes(norm(r.productoMatch))) return false;
  if (r.origen && c.origen && norm(r.origen) !== c.origen) return false;
  if (r.destino && c.destino && norm(r.destino) !== c.destino) return false;
  if (r.tipo && c.tipo && norm(r.tipo) !== c.tipo) return false;
  if (r.hsTaric && c.hs && !c.hs.startsWith(r.hsTaric.replace(/\s/g, "")))
    return false;
  // Una regla sin ningún criterio actuaría como comodín; la evitamos.
  const tieneCriterio =
    r.productoMatch || r.origen || r.destino || r.tipo || r.hsTaric;
  return Boolean(tieneCriterio);
}

/** Convierte líneas separadas por \n en un array sin vacíos. */
const lineas = (s: string | null) =>
  (s ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Mapea una fila Regla al contrato Resolucion (validado con zod). */
function aResolucion(r: ReglaConRelaciones): Resolucion {
  return resolucionSchema.parse({
    resumen: r.resumen,
    documentacion: r.documentos.map((d) => ({ doc: d.doc, estado: d.estado })),
    normativa: r.normativa.map((n) => ({
      titulo: n.titulo,
      fuente: n.fuente,
      url: n.url ?? undefined,
      relevancia: n.relevancia,
    })),
    riesgos: r.riesgos.map((ri) => ({
      tipo: ri.tipo,
      nivel: ri.nivel,
      motivo: ri.motivo,
    })),
    requisitosSanitarios: lineas(r.requisitosSanitarios),
    alertas: r.alertas.map((a) => ({
      severidad: a.severidad,
      mensaje: a.mensaje,
    })),
    pasos: r.pasos.map((p) => p.texto),
    confianza: r.confianza,
    verificar: lineas(r.verificar),
  });
}

/** Construye el `Caso` normalizado a partir de la entrada del motor. */
function aCaso(e: EntradaCaso): Caso {
  return {
    texto: norm(`${e.texto ?? ""} ${e.producto ?? ""}`),
    origen: norm(e.origen),
    destino: norm(e.destino),
    tipo: norm(e.tipo),
    hs: (e.hsTaric ?? "").replace(/\s/g, ""),
  };
}

/** Una regla análoga: su etiqueta legible y la resolución que representa. */
export interface ReglaAnaloga {
  nombre: string;
  resolucion: Resolucion;
}

/**
 * Puntúa cuánto se PARECE una regla al caso (no es un match exacto).
 * A diferencia de `coincide()`, aquí sumamos señales positivas en vez de
 * descartar: sirve para encontrar reglas ANÁLOGAS con las que guiar a Claude.
 * Una contradicción fuerte (distinto tipo de operación) sí resta, porque una
 * importación no es buen análogo de una exportación.
 */
function similitud(r: ReglaConRelaciones, c: Caso): number {
  let score = 0;
  if (r.productoMatch && c.texto.includes(norm(r.productoMatch))) score += 3;
  if (r.tipo && c.tipo) score += norm(r.tipo) === c.tipo ? 2 : -2;
  if (r.hsTaric && c.hs) {
    const cap = r.hsTaric.replace(/\s/g, "").slice(0, 4);
    if (cap && c.hs.startsWith(cap)) score += 3;
    else if (cap && c.hs.slice(0, 2) === cap.slice(0, 2)) score += 1;
  }
  if (r.origen && c.origen && norm(r.origen) === c.origen) score += 1;
  if (r.destino && c.destino && norm(r.destino) === c.destino) score += 1;
  return score;
}

/**
 * Recupera las reglas más PARECIDAS al caso (las top-N por similitud), para
 * pasárselas a Claude como contexto/grounding. No requiere match exacto: es el
 * retrieval del patrón híbrido. Devuelve [] si ninguna regla se parece.
 */
export async function reglasRelevantes(
  e: EntradaCaso,
  n = 3,
): Promise<ReglaAnaloga[]> {
  const caso = aCaso(e);
  const reglas = await cargarReglas();
  return reglas
    .map((r) => ({ r, score: similitud(r, caso) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.r.prioridad - a.r.prioridad)
    .slice(0, n)
    .map(({ r }) => ({ nombre: r.nombre, resolucion: aResolucion(r) }));
}

/**
 * Resuelve un caso desde la base de conocimiento.
 * Devuelve la resolución de la regla coincidente de mayor prioridad, o null
 * si ninguna regla cubre el caso.
 */
export async function resolverDesdeReglas(
  e: EntradaCaso,
): Promise<Resolucion | null> {
  const caso = aCaso(e);

  const reglas = await cargarReglas();
  const match = reglas.find((r) => coincide(r, caso));
  if (!match) return null;

  try {
    return aResolucion(match);
  } catch (err) {
    // Una regla mal formada no debe tumbar el motor: la ignoramos y caemos al
    // siguiente paso (IA o fallback genérico).
    console.error(`[motor] Regla "${match.nombre}" inválida, se omite:`, err);
    return null;
  }
}
