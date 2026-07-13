/*
 * Definición de la Declaración de Valor en Aduana (formulario DV1 de la UE).
 * Acompaña al DUA de importación cuando el valor en aduana se determina por el
 * método del valor de transacción (art. 70 del CAU) y supera el umbral que exige
 * declararlo. Su núcleo es el CÁLCULO del valor en aduana a partir del precio
 * pagado más las adiciones del art. 71 del CAU y menos las deducciones del art.
 * 72, todo referido al lugar de entrada en el territorio aduanero de la Unión.
 *
 * A diferencia del B/L o el CMR, no tiene tabla de mercancías: es un formulario
 * de casillas planas con importes que se suman/restan (como la factura). Se
 * genera desde el mismo dossier canónico (comparte partes, incoterm y factura).
 */

export type Dv1Vinculacion = "no" | "si";

export interface Dv1Datos {
  // Referencia
  numero: string;
  fecha: string;
  // Casilla 1 — Vendedor
  vendedorNombre: string;
  vendedorDireccion: string;
  // Casilla 2 — Comprador
  compradorNombre: string;
  compradorDireccion: string;
  // Casilla 3-4 — Condiciones de la entrega y factura
  incoterm: string;
  lugarEntrega: string;
  numeroFactura: string;
  fechaFactura: string;
  divisa: string; // ISO 4217
  tipoCambio: string; // tipo aplicado si la factura no está en EUR
  // Casillas 7-9 — Vinculación y condiciones
  vinculados: Dv1Vinculacion; // ¿comprador y vendedor vinculados?
  vinculacionInfluye: Dv1Vinculacion; // ¿la vinculación influyó en el precio?
  restricciones: string; // restricciones/condiciones/contraprestaciones (texto)
  // Casilla 11 — Base
  precioPagado: string; // precio neto pagado o por pagar
  pagosIndirectos: string; // pagos indirectos al vendedor
  // Adiciones (art. 71 CAU)
  comisiones: string; // comisiones (salvo las de compra) y corretajes
  envases: string; // envases y embalajes
  aportaciones: string; // bienes y servicios aportados por el comprador (assists)
  canones: string; // cánones y derechos de licencia (royalties)
  reversiones: string; // producto de reventa que revierte al vendedor
  transporteHasta: string; // transporte hasta el lugar de entrada en la UE
  cargaManipulacion: string; // gastos de carga y manipulación
  seguro: string; // seguro hasta el lugar de entrada
  // Deducciones (art. 72 CAU) — solo si están desglosadas y documentadas
  transporteTras: string; // transporte tras la entrada en la UE
  montaje: string; // gastos de construcción, montaje o mantenimiento tras importar
  derechosImpuestos: string; // derechos e impuestos pagaderos en la UE
  intereses: string; // intereses de financiación
  // Firma
  lugarFecha: string;
  declarante: string;
  condicionDeclarante: string; // en calidad de… (importador, representante…)
  firma: string;
}

/** Campos planos del formulario. */
export interface Dv1CampoDef {
  key: Exclude<keyof Dv1Datos, never>;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea" | "importe" | "vinculacion";
  placeholder?: string;
}

export const DV1_CAMPOS: Dv1CampoDef[] = [
  { key: "numero", label: "Nº de la declaración", seccion: "Referencia", placeholder: "DV1-2026-0142" },
  { key: "fecha", label: "Fecha", seccion: "Referencia", placeholder: "2026-06-20" },

  { key: "vendedorNombre", label: "Nombre del vendedor", seccion: "Vendedor (casilla 1)", required: true },
  { key: "vendedorDireccion", label: "Dirección del vendedor", seccion: "Vendedor (casilla 1)", tipo: "textarea" },

  { key: "compradorNombre", label: "Nombre del comprador", seccion: "Comprador (casilla 2)", required: true },
  { key: "compradorDireccion", label: "Dirección del comprador", seccion: "Comprador (casilla 2)", tipo: "textarea" },

  { key: "incoterm", label: "Condiciones de entrega (incoterm)", seccion: "Condiciones", placeholder: "CIF" },
  { key: "lugarEntrega", label: "Lugar de entrega", seccion: "Condiciones" },
  { key: "numeroFactura", label: "Nº de factura", seccion: "Condiciones", placeholder: "F-2026-0142" },
  { key: "fechaFactura", label: "Fecha de factura", seccion: "Condiciones" },
  { key: "divisa", label: "Divisa (ISO)", seccion: "Condiciones", placeholder: "EUR" },
  { key: "tipoCambio", label: "Tipo de cambio aplicado", seccion: "Condiciones", placeholder: "1 si es EUR" },

  { key: "vinculados", label: "¿Comprador y vendedor vinculados?", seccion: "Vinculación (casillas 7-9)", tipo: "vinculacion" },
  { key: "vinculacionInfluye", label: "¿La vinculación influyó en el precio?", seccion: "Vinculación (casillas 7-9)", tipo: "vinculacion" },
  { key: "restricciones", label: "Restricciones, condiciones o contraprestaciones", seccion: "Vinculación (casillas 7-9)", tipo: "textarea", placeholder: "Ninguna" },

  { key: "precioPagado", label: "Precio neto pagado o por pagar (casilla 11)", seccion: "Base", required: true, tipo: "importe" },
  { key: "pagosIndirectos", label: "Pagos indirectos al vendedor", seccion: "Base", tipo: "importe" },

  { key: "comisiones", label: "Comisiones y corretajes (salvo de compra)", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "envases", label: "Envases y embalajes", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "aportaciones", label: "Bienes y servicios aportados (assists)", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "canones", label: "Cánones y derechos de licencia", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "reversiones", label: "Producto de reventa que revierte al vendedor", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "transporteHasta", label: "Transporte hasta la entrada en la UE", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "cargaManipulacion", label: "Carga y manipulación hasta la entrada", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },
  { key: "seguro", label: "Seguro hasta la entrada en la UE", seccion: "Adiciones (art. 71 CAU)", tipo: "importe" },

  { key: "transporteTras", label: "Transporte tras la entrada en la UE", seccion: "Deducciones (art. 72 CAU)", tipo: "importe" },
  { key: "montaje", label: "Montaje, construcción o mantenimiento tras importar", seccion: "Deducciones (art. 72 CAU)", tipo: "importe" },
  { key: "derechosImpuestos", label: "Derechos e impuestos pagaderos en la UE", seccion: "Deducciones (art. 72 CAU)", tipo: "importe" },
  { key: "intereses", label: "Intereses de financiación", seccion: "Deducciones (art. 72 CAU)", tipo: "importe" },

  { key: "lugarFecha", label: "Lugar y fecha", seccion: "Firma" },
  { key: "declarante", label: "Nombre del declarante", seccion: "Firma", required: true },
  { key: "condicionDeclarante", label: "En calidad de", seccion: "Firma", placeholder: "Importador / representante aduanero" },
  { key: "firma", label: "Firma", seccion: "Firma" },
];

export const DV1_SECCIONES = [
  "Referencia",
  "Vendedor (casilla 1)",
  "Comprador (casilla 2)",
  "Condiciones",
  "Vinculación (casillas 7-9)",
  "Base",
  "Adiciones (art. 71 CAU)",
  "Deducciones (art. 72 CAU)",
  "Firma",
];

/** Convierte "1.234,56", "28 800 €"… a número; NaN → 0. */
export function aNumero(valor: string): number {
  const limpio = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // puntos de millar
    .replace(",", ".");
  const n = Number.parseFloat(limpio);
  return Number.isFinite(n) ? n : 0;
}

/** Formatea un importe con 2 decimales y separador de millar español. */
export function formatearImporte(n: number): string {
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  });
}

export interface Dv1Totales {
  base: number;
  adiciones: number;
  deducciones: number;
  valorAduana: number;
}

/**
 * Valor en aduana = precio pagado + pagos indirectos + Σ adiciones (art. 71)
 * − Σ deducciones (art. 72). Es el importe de la casilla 22 del DUA (base para
 * liquidar derechos e IVA a la importación).
 */
export function totalesDv1(d: Dv1Datos): Dv1Totales {
  const base = aNumero(d.precioPagado) + aNumero(d.pagosIndirectos);
  const adiciones =
    aNumero(d.comisiones) +
    aNumero(d.envases) +
    aNumero(d.aportaciones) +
    aNumero(d.canones) +
    aNumero(d.reversiones) +
    aNumero(d.transporteHasta) +
    aNumero(d.cargaManipulacion) +
    aNumero(d.seguro);
  const deducciones =
    aNumero(d.transporteTras) +
    aNumero(d.montaje) +
    aNumero(d.derechosImpuestos) +
    aNumero(d.intereses);
  return {
    base,
    adiciones,
    deducciones,
    valorAduana: base + adiciones - deducciones,
  };
}

export interface ProblemaDv1 {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida el DV1: obligatorios, coherencia de la vinculación y del método de valoración. */
export function validarDv1(d: Dv1Datos): ProblemaDv1[] {
  const problemas: ProblemaDv1[] = [];

  for (const campo of DV1_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({ key: campo.key, nivel: "error", mensaje: `Falta «${campo.label}»` });
    }
  }

  if (aNumero(d.precioPagado) <= 0) {
    problemas.push({
      key: "precioPagado",
      nivel: "error",
      mensaje: "Indica el precio pagado o por pagar (casilla 11).",
    });
  }

  // Si el precio es en divisa distinta del euro, hace falta el tipo de cambio.
  if (d.divisa.trim() && d.divisa.trim().toUpperCase() !== "EUR" && !d.tipoCambio.trim()) {
    problemas.push({
      key: "tipoCambio",
      nivel: "aviso",
      mensaje: `El precio está en ${d.divisa.trim().toUpperCase()}: indica el tipo de cambio aplicado.`,
    });
  }

  // Vinculación que influye en el precio: el valor de transacción puede no ser aceptable.
  if (d.vinculados === "si" && d.vinculacionInfluye === "si") {
    problemas.push({
      key: "vinculacionInfluye",
      nivel: "aviso",
      mensaje: "La vinculación influye en el precio: el valor de transacción puede no ser admisible (arts. 70-74 CAU).",
    });
  }

  // Incoterm en grupo C/D: el flete/seguro suele ir ya incluido en el precio.
  const inc = d.incoterm.trim().toUpperCase();
  if (["CIF", "CIP", "CFR", "CPT"].includes(inc) && aNumero(d.transporteHasta) > 0) {
    problemas.push({
      key: "transporteHasta",
      nivel: "aviso",
      mensaje: `Con ${inc} el transporte suele estar incluido en el precio: revisa que no se cuente dos veces.`,
    });
  }

  return problemas;
}

export function dv1Vacio(): Dv1Datos {
  return {
    numero: "",
    fecha: "",
    vendedorNombre: "",
    vendedorDireccion: "",
    compradorNombre: "",
    compradorDireccion: "",
    incoterm: "",
    lugarEntrega: "",
    numeroFactura: "",
    fechaFactura: "",
    divisa: "EUR",
    tipoCambio: "",
    vinculados: "no",
    vinculacionInfluye: "no",
    restricciones: "",
    precioPagado: "",
    pagosIndirectos: "",
    comisiones: "",
    envases: "",
    aportaciones: "",
    canones: "",
    reversiones: "",
    transporteHasta: "",
    cargaManipulacion: "",
    seguro: "",
    transporteTras: "",
    montaje: "",
    derechosImpuestos: "",
    intereses: "",
    lugarFecha: "",
    declarante: "",
    condicionDeclarante: "",
    firma: "",
  };
}
