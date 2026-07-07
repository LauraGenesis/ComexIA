/*
 * Historial de documentos generados: tipos y helpers puros.
 *
 * Sin dependencias de servidor: lo importan tanto la capa de datos (repo.prisma
 * / repo.demo) como las pantallas. Centraliza cómo se deriva el título y las
 * partes de un documento a partir de sus datos, para no duplicar esa lógica.
 */
import type { DuaDatos } from "./dua";

export type OrigenDocumento = "manual" | "extraccion";

/** Fila del listado del historial (sin los datos completos del documento). */
export interface DocumentoGeneradoResumen {
  id: string;
  tipo: string; // DUA | Factura | …
  subtipo?: string; // importacion | exportacion
  titulo: string;
  origen: OrigenDocumento;
  fecha: string;
  exportador?: string;
  importador?: string;
}

/** Detalle para reabrir un documento en su editor. */
export interface DocumentoGeneradoDetalle {
  tipo: string;
  subtipo?: string;
  datos: unknown;
}

/** Normaliza el origen recibido a uno de los valores admitidos. */
export function normalizarOrigen(origen: unknown): OrigenDocumento {
  return origen === "extraccion" ? "extraccion" : "manual";
}

/** Título legible de un documento a partir de su tipo, subtipo y datos. */
export function tituloDocumento(
  tipo: string,
  subtipo: string | undefined,
  datos: unknown,
): string {
  if (tipo === "DUA") {
    const d = (datos ?? {}) as Partial<DuaDatos>;
    const base = `DUA de ${subtipo === "exportacion" ? "exportación" : "importación"}`;
    const parte = (d.destinatarioNombre || d.exportadorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  return tipo;
}

/** Partes (exportador/importador) para el listado, parseando el JSON guardado. */
export function partesDocumento(
  tipo: string,
  datosJson: string,
): { exportador?: string; importador?: string } {
  if (tipo !== "DUA") return {};
  try {
    const d = JSON.parse(datosJson) as Partial<DuaDatos>;
    return {
      exportador: d.exportadorNombre?.trim() || undefined,
      importador: d.destinatarioNombre?.trim() || undefined,
    };
  } catch {
    return {};
  }
}
