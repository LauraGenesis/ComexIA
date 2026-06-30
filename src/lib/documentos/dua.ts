/*
 * Definición del DUA (Documento Único Administrativo).
 * Cada campo es una "casilla" del DUA real (ver docs/COMEX_CASO_25_*).
 * El catálogo de documentos es abierto: añadir uno nuevo es añadir una
 * definición como esta, sin tocar el motor ni la app.
 */

export type DuaTipo = "importacion" | "exportacion";

export interface DuaDatos {
  tipo: DuaTipo;
  // Cas. 2 — Expedidor / Exportador
  exportadorEori: string;
  exportadorNombre: string;
  exportadorDireccion: string;
  // Cas. 8 — Destinatario
  destinatarioEori: string;
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Cas. 14 — Declarante / Representante
  declaranteEori: string;
  declaranteNombre: string;
  // Mercancía
  descripcionMercancia: string; // Cas. 31
  codigoMercancia: string; // Cas. 33 (TARIC/NC)
  partidas: string; // Cas. 5
  totalBultos: string; // Cas. 6
  masaBruta: string; // Cas. 35
  masaNeta: string; // Cas. 38
  valorEstadistico: string; // Cas. 46
  // Operación
  paisExportacion: string; // Cas. 15 (ISO)
  paisDestino: string; // Cas. 17 (ISO)
  contenedor: boolean; // Cas. 19
  incoterm: string; // Cas. 20
  lugarEntrega: string; // Cas. 20
  divisaImporte: string; // Cas. 22
  modoTransporte: string; // Cas. 25
  regimen: string; // Cas. 37
  // Documentos y firma
  documentos: string; // Cas. 44
  lugarFecha: string; // Cas. 54
  firmaDeclarante: string; // Cas. 54
}

export interface CampoDef {
  key: keyof DuaDatos;
  casilla: string;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea" | "select" | "checkbox";
  opciones?: string[];
  placeholder?: string;
}

export const DUA_CAMPOS: CampoDef[] = [
  { key: "tipo", casilla: "1", label: "Tipo de declaración", seccion: "Declaración", tipo: "select", opciones: ["importacion", "exportacion"], required: true },

  { key: "exportadorEori", casilla: "2", label: "EORI exportador", seccion: "Expedidor / Exportador", required: true, placeholder: "ESA12345678" },
  { key: "exportadorNombre", casilla: "2", label: "Nombre exportador", seccion: "Expedidor / Exportador", required: true },
  { key: "exportadorDireccion", casilla: "2", label: "Dirección exportador", seccion: "Expedidor / Exportador" },

  { key: "destinatarioEori", casilla: "8", label: "EORI destinatario", seccion: "Destinatario" },
  { key: "destinatarioNombre", casilla: "8", label: "Nombre destinatario", seccion: "Destinatario", required: true },
  { key: "destinatarioDireccion", casilla: "8", label: "Dirección destinatario", seccion: "Destinatario" },

  { key: "declaranteEori", casilla: "14", label: "EORI declarante", seccion: "Declarante / Representante" },
  { key: "declaranteNombre", casilla: "14", label: "Nombre declarante", seccion: "Declarante / Representante" },

  { key: "descripcionMercancia", casilla: "31", label: "Descripción de la mercancía", seccion: "Mercancía", required: true, tipo: "textarea" },
  { key: "codigoMercancia", casilla: "33", label: "Código TARIC / NC", seccion: "Mercancía", required: true, placeholder: "1207 40 90" },
  { key: "partidas", casilla: "5", label: "Nº de partidas", seccion: "Mercancía" },
  { key: "totalBultos", casilla: "6", label: "Total de bultos", seccion: "Mercancía" },
  { key: "masaBruta", casilla: "35", label: "Masa bruta (kg)", seccion: "Mercancía", required: true },
  { key: "masaNeta", casilla: "38", label: "Masa neta (kg)", seccion: "Mercancía", required: true },
  { key: "valorEstadistico", casilla: "46", label: "Valor estadístico", seccion: "Mercancía" },

  { key: "paisExportacion", casilla: "15", label: "País de exportación (ISO)", seccion: "Operación", required: true, placeholder: "ES" },
  { key: "paisDestino", casilla: "17", label: "País de destino (ISO)", seccion: "Operación", required: true, placeholder: "JP" },
  { key: "contenedor", casilla: "19", label: "Contenedor", seccion: "Operación", tipo: "checkbox" },
  { key: "incoterm", casilla: "20", label: "Incoterm", seccion: "Operación", placeholder: "CPT" },
  { key: "lugarEntrega", casilla: "20", label: "Lugar de entrega", seccion: "Operación" },
  { key: "divisaImporte", casilla: "22", label: "Divisa e importe total", seccion: "Operación", placeholder: "EUR 50000" },
  { key: "modoTransporte", casilla: "25", label: "Modo de transporte", seccion: "Operación" },
  { key: "regimen", casilla: "37", label: "Régimen", seccion: "Operación", placeholder: "10 00" },

  { key: "documentos", casilla: "44", label: "Documentos presentados", seccion: "Documentos y firma", tipo: "textarea", placeholder: "N380 Factura comercial nº…" },
  { key: "lugarFecha", casilla: "54", label: "Lugar y fecha", seccion: "Documentos y firma" },
  { key: "firmaDeclarante", casilla: "54", label: "Firma / nombre del declarante", seccion: "Documentos y firma" },
];

export const DUA_SECCIONES = [
  "Declaración",
  "Expedidor / Exportador",
  "Destinatario",
  "Declarante / Representante",
  "Mercancía",
  "Operación",
  "Documentos y firma",
];

const INCOTERMS_MARITIMOS = ["FOB", "CFR", "CIF", "FAS"];

export interface ProblemaValidacion {
  key: keyof DuaDatos;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida un DUA: campos obligatorios incompletos (error) e incoherencias (aviso). */
export function validarDua(d: DuaDatos): ProblemaValidacion[] {
  const problemas: ProblemaValidacion[] = [];

  for (const campo of DUA_CAMPOS) {
    if (!campo.required) continue;
    const valor = d[campo.key];
    if (typeof valor === "string" && valor.trim() === "") {
      problemas.push({
        key: campo.key,
        nivel: "error",
        mensaje: `Falta «${campo.label}» (casilla ${campo.casilla})`,
      });
    }
  }

  // RN-05: incoterm marítimo con contenedor → usar equivalente multimodal.
  if (d.contenedor && INCOTERMS_MARITIMOS.includes(d.incoterm.toUpperCase())) {
    problemas.push({
      key: "incoterm",
      nivel: "aviso",
      mensaje: `Incoterm marítimo (${d.incoterm.toUpperCase()}) con contenedor: usa su equivalente multimodal (FCA/CPT/CIP).`,
    });
  }

  return problemas;
}

export function duaVacio(tipo: DuaTipo = "importacion"): DuaDatos {
  return {
    tipo,
    exportadorEori: "",
    exportadorNombre: "",
    exportadorDireccion: "",
    destinatarioEori: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    declaranteEori: "",
    declaranteNombre: "",
    descripcionMercancia: "",
    codigoMercancia: "",
    partidas: "1",
    totalBultos: "",
    masaBruta: "",
    masaNeta: "",
    valorEstadistico: "",
    paisExportacion: "",
    paisDestino: "",
    contenedor: false,
    incoterm: "",
    lugarEntrega: "",
    divisaImporte: "",
    modoTransporte: "",
    regimen: tipo === "exportacion" ? "10 00" : "40 00",
    documentos: "",
    lugarFecha: "",
    firmaDeclarante: "",
  };
}
