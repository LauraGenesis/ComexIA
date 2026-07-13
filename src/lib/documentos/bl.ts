/*
 * Definición del Conocimiento de Embarque marítimo (Bill of Lading, B/L).
 * Documento del transporte marítimo que emite el porteador (naviera o su agente)
 * y que cumple tres funciones: recibo de la mercancía a bordo, prueba del
 * contrato de transporte y TÍTULO REPRESENTATIVO de la mercancía (negociable si
 * es "a la orden"). Su cuerpo es una tabla de mercancías con marcas, bultos,
 * descripción y pesos; se genera desde el mismo dossier canónico.
 */

/** Modalidad de flete: prepagado en origen o pagadero en destino. */
export type BlFlete = "prepaid" | "collect";

/** Una línea de la descripción de la mercancía del B/L. */
export interface BlLinea {
  marcas: string; // Marcas y números
  numBultos: string; // Número y clase de bultos
  descripcion: string; // Descripción de las mercancías
  pesoBruto: string; // Peso bruto (kg)
  volumen: string; // Volumen / medidas (m³)
}

export interface BlDatos {
  // Referencia
  numero: string; // B/L No.
  reserva: string; // Booking / referencia de la reserva
  fecha: string; // Fecha de emisión
  // Partes
  shipperNombre: string; // Cargador / expedidor
  shipperDireccion: string;
  consigneeNombre: string; // Consignatario ("to order" si es negociable)
  consigneeDireccion: string;
  notifyNombre: string; // Parte a notificar
  notifyDireccion: string;
  // Transporte
  buque: string; // Nombre del buque
  viaje: string; // Nº de viaje
  lugarRecepcion: string; // Place of receipt
  puertoCarga: string; // Port of loading
  puertoDescarga: string; // Port of discharge
  lugarEntrega: string; // Place of delivery
  // Cuerpo
  lineas: BlLinea[];
  // Flete y emisión
  flete: BlFlete;
  fleteObs: string; // Detalle del flete / cargos
  numeroOriginales: string; // Nº de originales emitidos
  lugarEmision: string; // Lugar de emisión
  firmante: string; // Por el porteador / capitán / agente
}

/** Campos planos (la tabla de líneas se edita aparte). */
export interface BlCampoDef {
  key: Exclude<keyof BlDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea" | "flete";
  placeholder?: string;
}

export const BL_CAMPOS: BlCampoDef[] = [
  { key: "numero", label: "B/L Nº", seccion: "Referencia", required: true, placeholder: "MSCUAB123456" },
  { key: "reserva", label: "Nº de reserva / booking", seccion: "Referencia" },
  { key: "fecha", label: "Fecha de emisión", seccion: "Referencia", placeholder: "2026-06-20" },

  { key: "shipperNombre", label: "Nombre del cargador (shipper)", seccion: "Cargador (shipper)", required: true },
  { key: "shipperDireccion", label: "Dirección del cargador", seccion: "Cargador (shipper)", tipo: "textarea" },

  { key: "consigneeNombre", label: "Consignatario (consignee)", seccion: "Consignatario (consignee)", required: true, placeholder: "TO ORDER si es negociable" },
  { key: "consigneeDireccion", label: "Dirección del consignatario", seccion: "Consignatario (consignee)", tipo: "textarea" },

  { key: "notifyNombre", label: "Parte a notificar (notify party)", seccion: "Notify party" },
  { key: "notifyDireccion", label: "Dirección de la parte a notificar", seccion: "Notify party", tipo: "textarea" },

  { key: "buque", label: "Buque (vessel)", seccion: "Transporte", placeholder: "MSC …" },
  { key: "viaje", label: "Nº de viaje (voyage)", seccion: "Transporte" },
  { key: "lugarRecepcion", label: "Lugar de recepción", seccion: "Transporte" },
  { key: "puertoCarga", label: "Puerto de carga", seccion: "Transporte", required: true, placeholder: "Algeciras" },
  { key: "puertoDescarga", label: "Puerto de descarga", seccion: "Transporte", required: true, placeholder: "Tokyo" },
  { key: "lugarEntrega", label: "Lugar de entrega", seccion: "Transporte" },

  { key: "flete", label: "Flete", seccion: "Flete y emisión", tipo: "flete" },
  { key: "fleteObs", label: "Detalle del flete / cargos", seccion: "Flete y emisión", tipo: "textarea" },
  { key: "numeroOriginales", label: "Nº de originales emitidos", seccion: "Flete y emisión", placeholder: "3" },
  { key: "lugarEmision", label: "Lugar de emisión", seccion: "Flete y emisión" },
  { key: "firmante", label: "Firmante (por el porteador / capitán)", seccion: "Flete y emisión" },
];

export const BL_SECCIONES = [
  "Referencia",
  "Cargador (shipper)",
  "Consignatario (consignee)",
  "Notify party",
  "Transporte",
  "Flete y emisión",
];

export interface ProblemaBl {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida el B/L: obligatorios, ≥1 mercancía y coherencias propias del conocimiento. */
export function validarBl(d: BlDatos): ProblemaBl[] {
  const problemas: ProblemaBl[] = [];

  for (const campo of BL_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
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
      mensaje: "Añade al menos una línea de mercancía.",
    });
  }

  // Nº de originales: lo habitual es un juego de 3; conviene declararlo.
  if (d.numeroOriginales.trim() === "") {
    problemas.push({
      key: "numeroOriginales",
      nivel: "aviso",
      mensaje: "Indica el número de originales emitidos (habitualmente 3).",
    });
  }

  // Un B/L "a la orden" es un título negociable: conviene que se note.
  const cons = d.consigneeNombre.trim().toLowerCase();
  if (cons && !cons.includes("orden") && !cons.includes("order")) {
    problemas.push({
      key: "consigneeNombre",
      nivel: "aviso",
      mensaje: "Consignatario nominativo: el B/L no será negociable (usa «TO ORDER» si debe serlo).",
    });
  }

  return problemas;
}

export function blLineaVacia(): BlLinea {
  return { marcas: "", numBultos: "", descripcion: "", pesoBruto: "", volumen: "" };
}

export function blVacio(): BlDatos {
  return {
    numero: "",
    reserva: "",
    fecha: "",
    shipperNombre: "",
    shipperDireccion: "",
    consigneeNombre: "",
    consigneeDireccion: "",
    notifyNombre: "",
    notifyDireccion: "",
    buque: "",
    viaje: "",
    lugarRecepcion: "",
    puertoCarga: "",
    puertoDescarga: "",
    lugarEntrega: "",
    lineas: [blLineaVacia()],
    flete: "prepaid",
    fleteObs: "",
    numeroOriginales: "3",
    lugarEmision: "",
    firmante: "",
  };
}
