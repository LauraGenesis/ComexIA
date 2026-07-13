/*
 * Definición de la Carta de Porte por Carretera (CMR), del Convenio relativo al
 * contrato de transporte internacional de mercancías por carretera (Ginebra,
 * 1956). Prueba el contrato de transporte por carretera y la recepción de la
 * mercancía por el transportista. Sus campos son las casillas numeradas del
 * modelo CMR; el cuerpo (casillas 6-12) es una tabla de mercancías. Se genera
 * desde el mismo dossier canónico (comparte partes, mercancía y pesos).
 */

/** Estipulación del porte: pagado por el remitente o debido por el destinatario. */
export type CmrPorte = "pagado" | "debido";

/** Una línea de la mercancía (casillas 6-12 del CMR). */
export interface CmrLinea {
  marcas: string; // Cas. 6 — Marcas y números
  numBultos: string; // Cas. 7 — Número de bultos
  embalaje: string; // Cas. 8 — Clase de embalaje
  naturaleza: string; // Cas. 9 — Naturaleza de la mercancía
  estadistico: string; // Cas. 10 — Nº estadístico
  pesoBruto: string; // Cas. 11 — Peso bruto (kg)
  volumen: string; // Cas. 12 — Volumen (m³)
}

export interface CmrDatos {
  // Referencia
  numero: string; // Nº de la carta de porte
  fecha: string;
  // Casilla 1 — Remitente
  remitenteNombre: string;
  remitenteDireccion: string;
  // Casilla 2 — Destinatario
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Casilla 3 — Lugar de entrega
  lugarEntrega: string;
  // Casilla 4 — Lugar y fecha de carga
  lugarCarga: string;
  fechaCarga: string;
  // Casilla 5 — Documentos anexos
  documentosAnexos: string;
  // Cuerpo (casillas 6-12)
  lineas: CmrLinea[];
  // Casilla 13 — Instrucciones del remitente
  instrucciones: string;
  // Casilla 15 — Estipulaciones de pago (porte)
  porte: CmrPorte;
  // Casilla 16-17 — Transportista(s)
  transportistaNombre: string;
  transportistaDireccion: string;
  transportistasSucesivos: string;
  matricula: string; // Matrícula del vehículo
  // Casilla 19 — Estipulaciones particulares / reembolso
  estipulaciones: string;
  // Casillas 21-23 — Emisión y firmas
  lugarFecha: string; // Cas. 21 — Formalizada en … el …
  firmaRemitente: string; // Cas. 22
  firmaTransportista: string; // Cas. 23
}

/** Campos planos (la tabla de mercancías se edita aparte). */
export interface CmrCampoDef {
  key: Exclude<keyof CmrDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea" | "porte";
  placeholder?: string;
}

export const CMR_CAMPOS: CmrCampoDef[] = [
  { key: "numero", label: "Nº de carta de porte", seccion: "Referencia", placeholder: "CMR-2026-0142" },
  { key: "fecha", label: "Fecha", seccion: "Referencia", placeholder: "2026-06-20" },

  { key: "remitenteNombre", label: "Nombre del remitente", seccion: "Remitente (casilla 1)", required: true },
  { key: "remitenteDireccion", label: "Dirección del remitente", seccion: "Remitente (casilla 1)", tipo: "textarea" },

  { key: "destinatarioNombre", label: "Nombre del destinatario", seccion: "Destinatario (casilla 2)", required: true },
  { key: "destinatarioDireccion", label: "Dirección del destinatario", seccion: "Destinatario (casilla 2)", tipo: "textarea" },

  { key: "lugarEntrega", label: "Lugar previsto de entrega (casilla 3)", seccion: "Lugares", required: true },
  { key: "lugarCarga", label: "Lugar de carga (casilla 4)", seccion: "Lugares", required: true },
  { key: "fechaCarga", label: "Fecha de carga (casilla 4)", seccion: "Lugares" },
  { key: "documentosAnexos", label: "Documentos anexos (casilla 5)", seccion: "Lugares", tipo: "textarea", placeholder: "Factura, packing list, DUA…" },

  { key: "instrucciones", label: "Instrucciones del remitente (casilla 13)", seccion: "Instrucciones y pago", tipo: "textarea" },
  { key: "porte", label: "Porte (casilla 15)", seccion: "Instrucciones y pago", tipo: "porte" },
  { key: "estipulaciones", label: "Estipulaciones particulares (casilla 19)", seccion: "Instrucciones y pago", tipo: "textarea" },

  { key: "transportistaNombre", label: "Nombre del transportista (casilla 16)", seccion: "Transportista", required: true },
  { key: "transportistaDireccion", label: "Dirección del transportista", seccion: "Transportista", tipo: "textarea" },
  { key: "transportistasSucesivos", label: "Transportistas sucesivos (casilla 17)", seccion: "Transportista", tipo: "textarea" },
  { key: "matricula", label: "Matrícula del vehículo", seccion: "Transportista", placeholder: "0000 XYZ" },

  { key: "lugarFecha", label: "Formalizada en … el … (casilla 21)", seccion: "Emisión y firmas" },
  { key: "firmaRemitente", label: "Firma del remitente (casilla 22)", seccion: "Emisión y firmas" },
  { key: "firmaTransportista", label: "Firma del transportista (casilla 23)", seccion: "Emisión y firmas" },
];

export const CMR_SECCIONES = [
  "Referencia",
  "Remitente (casilla 1)",
  "Destinatario (casilla 2)",
  "Lugares",
  "Instrucciones y pago",
  "Transportista",
  "Emisión y firmas",
];

export interface ProblemaCmr {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida la CMR: obligatorios, ≥1 mercancía y datos recomendados del transporte. */
export function validarCmr(d: CmrDatos): ProblemaCmr[] {
  const problemas: ProblemaCmr[] = [];

  for (const campo of CMR_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({ key: campo.key, nivel: "error", mensaje: `Falta «${campo.label}»` });
    }
  }

  const lineasConDato = d.lineas.filter(
    (l) => l.naturaleza.trim() || l.numBultos.trim(),
  );
  if (lineasConDato.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una mercancía (casillas 6-12).",
    });
  }

  // La matrícula identifica el vehículo: importante para el transporte por carretera.
  if (d.matricula.trim() === "") {
    problemas.push({
      key: "matricula",
      nivel: "aviso",
      mensaje: "Indica la matrícula del vehículo que realiza el transporte.",
    });
  }

  return problemas;
}

export function cmrLineaVacia(): CmrLinea {
  return {
    marcas: "",
    numBultos: "",
    embalaje: "",
    naturaleza: "",
    estadistico: "",
    pesoBruto: "",
    volumen: "",
  };
}

export function cmrVacio(): CmrDatos {
  return {
    numero: "",
    fecha: "",
    remitenteNombre: "",
    remitenteDireccion: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    lugarEntrega: "",
    lugarCarga: "",
    fechaCarga: "",
    documentosAnexos: "",
    lineas: [cmrLineaVacia()],
    instrucciones: "",
    porte: "pagado",
    transportistaNombre: "",
    transportistaDireccion: "",
    transportistasSucesivos: "",
    matricula: "",
    estipulaciones: "",
    lugarFecha: "",
    firmaRemitente: "",
    firmaTransportista: "",
  };
}
