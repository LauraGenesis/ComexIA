/*
 * Historial de documentos generados: tipos y helpers puros.
 *
 * Sin dependencias de servidor: lo importan tanto la capa de datos (repo.prisma
 * / repo.demo) como las pantallas. Centraliza cómo se deriva el título y las
 * partes de un documento a partir de sus datos, para no duplicar esa lógica.
 */
import type { DuaDatos } from "./dua";
import type { PackingDatos } from "./packing";
import type { FacturaDatos } from "./factura";
import type { OrigenDatos } from "./origen";
import type { FitoDatos } from "./fitosanitario";
import type { DgdDatos } from "./dgd";
import type { Dv1Datos } from "./dv1";
import type { BlDatos } from "./bl";
import type { CmrDatos } from "./cmr";
import type { TransitoDatos } from "./transito";

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
  if (tipo === "Packing") {
    const d = (datos ?? {}) as Partial<PackingDatos>;
    const base = d.numero?.trim() ? `Packing list ${d.numero.trim()}` : "Packing list";
    const parte = (d.importadorNombre || d.exportadorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "Factura") {
    const d = (datos ?? {}) as Partial<FacturaDatos>;
    const base = d.numero?.trim() ? `Factura ${d.numero.trim()}` : "Factura comercial";
    const parte = (d.compradorNombre || d.vendedorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "Origen") {
    const d = (datos ?? {}) as Partial<OrigenDatos>;
    const base = "Certificado de origen";
    const detalle = (d.paisOrigen || d.exportadorNombre || "").trim();
    return detalle ? `${base} · ${detalle}` : base;
  }
  if (tipo === "Fitosanitario") {
    const d = (datos ?? {}) as Partial<FitoDatos>;
    const base = "Certificado fitosanitario (borrador)";
    const detalle = (d.destinatarioNombre || d.exportadorNombre || "").trim();
    return detalle ? `${base} · ${detalle}` : base;
  }
  if (tipo === "DGD") {
    const d = (datos ?? {}) as Partial<DgdDatos>;
    const base = d.numero?.trim() ? `DGD ${d.numero.trim()}` : "Declaración de mercancías peligrosas";
    const parte = (d.destinatarioNombre || d.expedidorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "DV1") {
    const d = (datos ?? {}) as Partial<Dv1Datos>;
    const base = d.numero?.trim() ? `DV1 ${d.numero.trim()}` : "Declaración de valor (DV1)";
    const parte = (d.compradorNombre || d.vendedorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "BL") {
    const d = (datos ?? {}) as Partial<BlDatos>;
    const base = d.numero?.trim() ? `B/L ${d.numero.trim()}` : "Bill of Lading";
    const parte = (d.consigneeNombre || d.shipperNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "CMR") {
    const d = (datos ?? {}) as Partial<CmrDatos>;
    const base = d.numero?.trim() ? `CMR ${d.numero.trim()}` : "Carta de porte CMR";
    const parte = (d.destinatarioNombre || d.remitenteNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  if (tipo === "Transito") {
    const d = (datos ?? {}) as Partial<TransitoDatos>;
    const base = `Tránsito ${d.tipo || "T1"}${d.numero?.trim() ? ` ${d.numero.trim()}` : ""}`;
    const parte = (d.destinatarioNombre || d.obligadoNombre || d.expedidorNombre || "").trim();
    return parte ? `${base} · ${parte}` : base;
  }
  return tipo;
}

/** Partes (exportador/importador) para el listado, parseando el JSON guardado. */
export function partesDocumento(
  tipo: string,
  datosJson: string,
): { exportador?: string; importador?: string } {
  try {
    if (tipo === "DUA") {
      const d = JSON.parse(datosJson) as Partial<DuaDatos>;
      return {
        exportador: d.exportadorNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    if (tipo === "Packing") {
      const d = JSON.parse(datosJson) as Partial<PackingDatos>;
      return {
        exportador: d.exportadorNombre?.trim() || undefined,
        importador: d.importadorNombre?.trim() || undefined,
      };
    }
    if (tipo === "Factura") {
      const d = JSON.parse(datosJson) as Partial<FacturaDatos>;
      return {
        exportador: d.vendedorNombre?.trim() || undefined,
        importador: d.compradorNombre?.trim() || undefined,
      };
    }
    if (tipo === "Origen") {
      const d = JSON.parse(datosJson) as Partial<OrigenDatos>;
      return {
        exportador: d.exportadorNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    if (tipo === "Fitosanitario") {
      const d = JSON.parse(datosJson) as Partial<FitoDatos>;
      return {
        exportador: d.exportadorNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    if (tipo === "DGD") {
      const d = JSON.parse(datosJson) as Partial<DgdDatos>;
      return {
        exportador: d.expedidorNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    if (tipo === "DV1") {
      const d = JSON.parse(datosJson) as Partial<Dv1Datos>;
      return {
        exportador: d.vendedorNombre?.trim() || undefined,
        importador: d.compradorNombre?.trim() || undefined,
      };
    }
    if (tipo === "BL") {
      const d = JSON.parse(datosJson) as Partial<BlDatos>;
      return {
        exportador: d.shipperNombre?.trim() || undefined,
        importador: d.consigneeNombre?.trim() || undefined,
      };
    }
    if (tipo === "CMR") {
      const d = JSON.parse(datosJson) as Partial<CmrDatos>;
      return {
        exportador: d.remitenteNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    if (tipo === "Transito") {
      const d = JSON.parse(datosJson) as Partial<TransitoDatos>;
      return {
        exportador: d.expedidorNombre?.trim() || undefined,
        importador: d.destinatarioNombre?.trim() || undefined,
      };
    }
    return {};
  } catch {
    return {};
  }
}
