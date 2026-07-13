/*
 * Definición de la Declaración de Tránsito (T1 / T2), del régimen de tránsito
 * de la Unión / común gestionado por el NCTS. Ampara el movimiento de mercancías
 * bajo control aduanero entre dos puntos con los derechos en suspenso:
 *   • T1 — mercancías NO pertenecientes a la Unión (tránsito externo).
 *   • T2 — mercancías de la Unión que circulan por/ hacia un país de tránsito común.
 *
 * Estructura las casillas del DUA de tránsito (obligado principal, oficinas,
 * garantía, precintos) más una tabla de partidas de mercancía. Se genera desde
 * el mismo dossier canónico (comparte partes, mercancía, pesos y transporte).
 */

export type TransitoTipo = "T1" | "T2";

/** Una partida de mercancía de la declaración (casillas 31/33/35). */
export interface TransitoLinea {
  descripcion: string; // Cas. 31 — Descripción de la mercancía
  codigoMercancia: string; // Cas. 33 — Código NC/HS
  numBultos: string; // Cas. 31 — Bultos
  masaBruta: string; // Cas. 35 — Masa bruta (kg)
}

export interface TransitoDatos {
  tipo: TransitoTipo; // T1 / T2
  // Referencia
  numero: string; // MRN / referencia de la declaración
  fecha: string;
  // Casilla 2 — Expedidor
  expedidorNombre: string;
  expedidorDireccion: string;
  // Casilla 8 — Destinatario
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Casilla 50 — Obligado principal (titular del régimen)
  obligadoNombre: string;
  obligadoEori: string;
  // Casillas 15/17 — Países
  paisExpedicion: string;
  paisDestino: string;
  // Casillas 18/25 — Transporte
  identidadTransporte: string; // identidad y nacionalidad del medio de transporte
  modoTransporte: string;
  // Cuerpo
  lineas: TransitoLinea[];
  // Casilla 51/53 — Oficinas
  oficinaPartida: string; // oficina de partida
  oficinasPaso: string; // oficinas de paso previstas
  oficinaDestino: string; // oficina de destino
  // Casilla 52 — Garantía
  garantiaTipo: string; // tipo de garantía (global, individual, exención…)
  garantiaGrn: string; // nº de referencia de la garantía (GRN)
  garantiaImporte: string; // importe cubierto
  // Casilla D — Precintos
  precintosNumero: string; // número de precintos
  precintosMarcas: string; // marcas de los precintos
  // Plazo y firma
  plazoPresentacion: string; // plazo para presentar en la oficina de destino
  lugarFecha: string;
  firmaObligado: string; // firma del obligado principal (casilla 50/54)
}

/** Campos planos (la tabla de partidas se edita aparte). */
export interface TransitoCampoDef {
  key: Exclude<keyof TransitoDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea" | "tipoTransito";
  placeholder?: string;
}

export const TRANSITO_CAMPOS: TransitoCampoDef[] = [
  { key: "tipo", label: "Tipo de tránsito", seccion: "Declaración", tipo: "tipoTransito" },
  { key: "numero", label: "MRN / referencia", seccion: "Declaración", placeholder: "26ES..." },
  { key: "fecha", label: "Fecha", seccion: "Declaración", placeholder: "2026-06-20" },

  { key: "expedidorNombre", label: "Nombre del expedidor", seccion: "Expedidor (casilla 2)", required: true },
  { key: "expedidorDireccion", label: "Dirección del expedidor", seccion: "Expedidor (casilla 2)", tipo: "textarea" },

  { key: "destinatarioNombre", label: "Nombre del destinatario", seccion: "Destinatario (casilla 8)", required: true },
  { key: "destinatarioDireccion", label: "Dirección del destinatario", seccion: "Destinatario (casilla 8)", tipo: "textarea" },

  { key: "obligadoNombre", label: "Obligado principal (casilla 50)", seccion: "Obligado principal", required: true },
  { key: "obligadoEori", label: "EORI del obligado principal", seccion: "Obligado principal", placeholder: "ESA12345678" },

  { key: "paisExpedicion", label: "País de expedición (casilla 15)", seccion: "Ruta y transporte", placeholder: "ES" },
  { key: "paisDestino", label: "País de destino (casilla 17)", seccion: "Ruta y transporte", placeholder: "CH" },
  { key: "identidadTransporte", label: "Identidad del medio de transporte (casilla 18)", seccion: "Ruta y transporte", placeholder: "Camión 0000 XYZ" },
  { key: "modoTransporte", label: "Modo de transporte (casilla 25)", seccion: "Ruta y transporte", placeholder: "Carretera" },

  { key: "oficinaPartida", label: "Oficina de partida", seccion: "Oficinas (casillas 51/53)", required: true, placeholder: "ES000851 …" },
  { key: "oficinasPaso", label: "Oficinas de paso previstas (casilla 51)", seccion: "Oficinas (casillas 51/53)", tipo: "textarea" },
  { key: "oficinaDestino", label: "Oficina de destino (casilla 53)", seccion: "Oficinas (casillas 51/53)", required: true },

  { key: "garantiaTipo", label: "Tipo de garantía (casilla 52)", seccion: "Garantía (casilla 52)", placeholder: "Global / individual / exención" },
  { key: "garantiaGrn", label: "Nº de referencia de garantía (GRN)", seccion: "Garantía (casilla 52)" },
  { key: "garantiaImporte", label: "Importe cubierto", seccion: "Garantía (casilla 52)" },

  { key: "precintosNumero", label: "Número de precintos (casilla D)", seccion: "Precintos y plazo", placeholder: "1" },
  { key: "precintosMarcas", label: "Marcas de los precintos", seccion: "Precintos y plazo" },
  { key: "plazoPresentacion", label: "Plazo de presentación en destino", seccion: "Precintos y plazo", placeholder: "2026-06-27" },

  { key: "lugarFecha", label: "Lugar y fecha", seccion: "Firma" },
  { key: "firmaObligado", label: "Firma del obligado principal (casilla 50)", seccion: "Firma" },
];

export const TRANSITO_SECCIONES = [
  "Declaración",
  "Expedidor (casilla 2)",
  "Destinatario (casilla 8)",
  "Obligado principal",
  "Ruta y transporte",
  "Oficinas (casillas 51/53)",
  "Garantía (casilla 52)",
  "Precintos y plazo",
  "Firma",
];

export interface ProblemaTransito {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida la declaración de tránsito: obligatorios, ≥1 partida y garantía/precintos recomendados. */
export function validarTransito(d: TransitoDatos): ProblemaTransito[] {
  const problemas: ProblemaTransito[] = [];

  for (const campo of TRANSITO_CAMPOS) {
    if (!campo.required) continue;
    const valor = d[campo.key];
    if (typeof valor === "string" && valor.trim() === "") {
      problemas.push({ key: campo.key, nivel: "error", mensaje: `Falta «${campo.label}»` });
    }
  }

  const lineasConDato = d.lineas.filter(
    (l) => l.descripcion.trim() || l.numBultos.trim(),
  );
  if (lineasConDato.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una partida de mercancía.",
    });
  }

  // El régimen de tránsito exige garantía salvo dispensa expresa.
  if (d.garantiaTipo.trim() === "" && d.garantiaGrn.trim() === "") {
    problemas.push({
      key: "garantiaTipo",
      nivel: "aviso",
      mensaje: "El tránsito requiere garantía (casilla 52), salvo dispensa: indícala o su tipo de exención.",
    });
  }

  // El tipo condiciona el estatuto de la mercancía: recordatorio útil.
  if (d.tipo === "T2") {
    problemas.push({
      key: "tipo",
      nivel: "aviso",
      mensaje: "T2: solo para mercancías de la Unión. Si no lo son, usa T1 (tránsito externo).",
    });
  }

  return problemas;
}

export function transitoLineaVacia(): TransitoLinea {
  return { descripcion: "", codigoMercancia: "", numBultos: "", masaBruta: "" };
}

export function transitoVacio(tipo: TransitoTipo = "T1"): TransitoDatos {
  return {
    tipo,
    numero: "",
    fecha: "",
    expedidorNombre: "",
    expedidorDireccion: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    obligadoNombre: "",
    obligadoEori: "",
    paisExpedicion: "",
    paisDestino: "",
    identidadTransporte: "",
    modoTransporte: "",
    lineas: [transitoLineaVacia()],
    oficinaPartida: "",
    oficinasPaso: "",
    oficinaDestino: "",
    garantiaTipo: "",
    garantiaGrn: "",
    garantiaImporte: "",
    precintosNumero: "",
    precintosMarcas: "",
    plazoPresentacion: "",
    lugarFecha: "",
    firmaObligado: "",
  };
}
