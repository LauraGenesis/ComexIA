import { z } from "zod";

/*
 * Esquemas de datos del Motor de Resolución de Casos.
 * Reflejan el modelo de operación y la resolución estructurada
 * descritos en docs/MOTOR_RESOLUCION.md (§1 y §7).
 *
 * Usar zod como única fuente de verdad: los tipos TypeScript se derivan
 * con z.infer en src/lib/types.ts.
 */

export const tipoOperacion = z.enum([
  "importacion",
  "exportacion",
  "transito",
]);

export const regimenAduanero = z.enum([
  "definitivo",
  "deposito",
  "perfeccionamiento_activo",
  "perfeccionamiento_pasivo",
  "temporal",
  "reimportacion",
  "territorio_especial",
  "zona_franca",
]);

export const nivelRiesgo = z.enum(["bajo", "medio", "alto"]);
export const severidad = z.enum(["info", "advertencia", "critica"]);
export const estadoDocumento = z.enum([
  "obligatorio",
  "recomendado",
  "condicional",
]);

/** Entrada: modelo de operación (lo que el motor comprende del caso). */
export const operacionSchema = z.object({
  tipo: tipoOperacion,
  regimen: regimenAduanero.default("definitivo"),
  producto: z.object({
    descripcion: z.string(),
    hsTaric: z.string().optional(),
    naturaleza: z.array(z.string()).default([]),
  }),
  origen: z.string().describe("ISO 2 del país de origen"),
  destino: z.string().describe("ISO 2 del país de destino"),
  incoterm: z.string().optional(),
  transporte: z.string().optional(),
  valor: z
    .object({ importe: z.number(), moneda: z.string().default("EUR") })
    .optional(),
  partes: z
    .object({
      importadorEori: z.string().optional(),
      exportador: z.string().optional(),
    })
    .optional(),
  camposInferidos: z.array(z.string()).default([]),
  camposFaltantes: z.array(z.string()).default([]),
});

/** Salida: resolución estructurada del motor. */
export const resolucionSchema = z.object({
  resumen: z.string(),
  documentacion: z.array(
    z.object({ doc: z.string(), estado: estadoDocumento }),
  ),
  normativa: z.array(
    z.object({
      titulo: z.string(),
      fuente: z.string(),
      url: z.string().optional(),
      relevancia: z.enum(["alta", "media", "baja"]).default("media"),
    }),
  ),
  riesgos: z.array(
    z.object({
      tipo: z.string(),
      nivel: nivelRiesgo,
      motivo: z.string(),
    }),
  ),
  requisitosSanitarios: z.array(z.string()).default([]),
  alertas: z.array(
    z.object({ severidad, mensaje: z.string() }),
  ),
  pasos: z.array(z.string()),
  /** Confianza global de la resolución (0–1). */
  confianza: z.number().min(0).max(1),
  /** Puntos a verificar cuando la confianza no es total (fallback honesto). */
  verificar: z.array(z.string()).default([]),
});

export type OperacionInput = z.input<typeof operacionSchema>;
export type Operacion = z.infer<typeof operacionSchema>;
export type Resolucion = z.infer<typeof resolucionSchema>;
