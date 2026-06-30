import { resolverMock } from "./mock";
import type { Resolucion } from "./schema";

export type { Operacion, OperacionInput, Resolucion } from "./schema";
export { operacionSchema, resolucionSchema } from "./schema";

/** Entrada al motor: texto libre y/o campos estructurados. */
export interface EntradaCaso {
  texto?: string;
  producto?: string;
  origen?: string;
  destino?: string;
  tipo?: string;
  hsTaric?: string;
  incoterm?: string;
  transporte?: string;
}

/** ¿Hay una API key de Claude configurada? (IA opcional). */
export function motorIaActivo(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Qué motor resolvió el caso (para mostrarlo con honestidad en la UI).
 * - "reglas": una regla cubrió el caso por completo (sin IA).
 * - "claude_base": Claude razonó, pero ANCLADO a reglas análogas de la base.
 * - "claude": Claude razonó sin ninguna regla parecida que le sirviera de guía.
 * - "demo": fallback genérico (sin regla ni IA disponible).
 */
export type MotorUsado = "reglas" | "claude_base" | "claude" | "demo";

/** Resultado del motor: la resolución y su procedencia real. */
export interface ResultadoMotor {
  resolucion: Resolucion;
  motor: MotorUsado;
}

/**
 * Resuelve un caso de comercio exterior y devuelve una resolución estructurada.
 *
 * ORDEN (la base de conocimiento manda; la IA es un complemento barato):
 *  1. Reglas en SQLite (reglas.ts) → fuente PRINCIPAL, gratis. Si una regla
 *     cubre el caso, se devuelve y listo.
 *  2. Caso no cubierto y CON ANTHROPIC_API_KEY → Claude Haiku (claude.ts), el
 *     modelo más barato. Solo se invoca aquí, así que el gasto es de céntimos.
 *  3. Fallback gratuito (mock.ts): resolución genérica honesta (confianza baja).
 *
 * El contrato de salida (Resolucion) es el mismo en los tres casos.
 */
export async function resolverCaso(
  entrada: EntradaCaso,
): Promise<ResultadoMotor> {
  // 1) Base de conocimiento propia (SQLite). Sin coste, sin IA.
  try {
    const { resolverDesdeReglas } = await import("./reglas");
    const porReglas = await resolverDesdeReglas(entrada);
    if (porReglas) return { resolucion: porReglas, motor: "reglas" };
  } catch (e) {
    console.error("[motor] Error consultando la base de reglas:", e);
  }

  // 2) Caso no cubierto: si Claude está configurado, lo resuelve (barato).
  //    GROUNDING: antes de invocarlo, recuperamos las reglas más PARECIDAS de la
  //    base y se las pasamos como referencia. Así Claude razona el caso nuevo,
  //    pero anclado al criterio de la casa (patrón "RAG sobre tus reglas").
  if (motorIaActivo()) {
    try {
      const { reglasRelevantes } = await import("./reglas");
      const { resolverConClaude } = await import("./claude");
      const contexto = await reglasRelevantes(entrada);
      const resolucion = await resolverConClaude(entrada, contexto);
      // Honestidad en el badge: distinguimos si hubo análogos que guiaran o no.
      return { resolucion, motor: contexto.length ? "claude_base" : "claude" };
    } catch (e) {
      console.error("[motor] Falló la resolución con Claude, usando fallback:", e);
    }
  }

  // 3) Fallback gratuito. Simula algo de latencia para el estado "procesando".
  await new Promise((r) => setTimeout(r, 300));
  return { resolucion: resolverMock(entrada), motor: "demo" };
}
