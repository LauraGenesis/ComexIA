/*
 * Definición del Packing List (lista de contenido / de bultos).
 * A diferencia del DUA (casillas planas), su cuerpo es una TABLA de líneas:
 * cada fila es un bulto o grupo de bultos con sus marcas, pesos y dimensiones.
 * Igual que el DUA es una definición del catálogo abierto: se genera desde el
 * mismo dossier canónico (datos compartidos) sin volver a transcribir nada.
 */

/** Una línea del packing list (una fila de la tabla de contenido). */
export interface PackingLinea {
  marcas: string; // Marcas y numeración de los bultos
  tipoBulto: string; // Cajas, palés, sacos…
  numBultos: string; // Nº de bultos de esta línea
  descripcion: string; // Descripción de la mercancía
  cantidad: string; // Unidades de producto (no de bultos)
  unidad: string; // botellas, uds, kg…
  pesoNeto: string; // kg
  pesoBruto: string; // kg
  dimensiones: string; // p. ej. 40×30×25 cm o volumen de la línea
}

export interface PackingDatos {
  // Cabecera
  numero: string; // Nº de packing list
  fecha: string;
  referenciaFactura: string; // Factura comercial asociada
  // Partes
  exportadorNombre: string;
  exportadorDireccion: string;
  importadorNombre: string;
  importadorDireccion: string;
  // Envío / transporte
  incoterm: string;
  lugarEntrega: string;
  modoTransporte: string;
  numeroContenedor: string;
  puertoCarga: string;
  puertoDescarga: string;
  paisOrigen: string;
  paisDestino: string;
  // Cuerpo
  lineas: PackingLinea[];
  // Totales (si quedan vacíos, se derivan de las líneas en la vista previa)
  totalBultosManual: string;
  pesoNetoTotalManual: string;
  pesoBrutoTotalManual: string;
  volumenTotal: string;
  // Pie
  observaciones: string;
  lugarFecha: string;
  firma: string;
}

/** Campos de cabecera/partes/envío (la tabla de líneas se edita aparte). */
export interface PackingCampoDef {
  key: Exclude<keyof PackingDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea";
  placeholder?: string;
}

export const PACKING_CAMPOS: PackingCampoDef[] = [
  { key: "numero", label: "Nº de packing list", seccion: "Cabecera", placeholder: "PL-2026-0142" },
  { key: "fecha", label: "Fecha", seccion: "Cabecera", placeholder: "2026-06-20" },
  { key: "referenciaFactura", label: "Factura asociada", seccion: "Cabecera", placeholder: "F-2026-0142" },

  { key: "exportadorNombre", label: "Nombre exportador", seccion: "Exportador / Remitente", required: true },
  { key: "exportadorDireccion", label: "Dirección exportador", seccion: "Exportador / Remitente", tipo: "textarea" },

  { key: "importadorNombre", label: "Nombre consignatario", seccion: "Consignatario / Destinatario", required: true },
  { key: "importadorDireccion", label: "Dirección consignatario", seccion: "Consignatario / Destinatario", tipo: "textarea" },

  { key: "incoterm", label: "Incoterm", seccion: "Envío", placeholder: "CIP" },
  { key: "lugarEntrega", label: "Lugar de entrega", seccion: "Envío" },
  { key: "modoTransporte", label: "Modo de transporte", seccion: "Envío", placeholder: "Marítimo" },
  { key: "numeroContenedor", label: "Nº de contenedor", seccion: "Envío", placeholder: "MSCU1234567" },
  { key: "puertoCarga", label: "Puerto/lugar de carga", seccion: "Envío" },
  { key: "puertoDescarga", label: "Puerto/lugar de descarga", seccion: "Envío" },
  { key: "paisOrigen", label: "País de origen (ISO)", seccion: "Envío", placeholder: "ES" },
  { key: "paisDestino", label: "País de destino (ISO)", seccion: "Envío", placeholder: "JP" },

  { key: "volumenTotal", label: "Volumen total", seccion: "Totales", placeholder: "2,4 m³" },
  { key: "totalBultosManual", label: "Total de bultos (opcional)", seccion: "Totales", placeholder: "auto" },
  { key: "pesoNetoTotalManual", label: "Peso neto total (opcional)", seccion: "Totales", placeholder: "auto" },
  { key: "pesoBrutoTotalManual", label: "Peso bruto total (opcional)", seccion: "Totales", placeholder: "auto" },

  { key: "observaciones", label: "Observaciones", seccion: "Pie", tipo: "textarea" },
  { key: "lugarFecha", label: "Lugar y fecha", seccion: "Pie" },
  { key: "firma", label: "Firma / responsable", seccion: "Pie" },
];

export const PACKING_SECCIONES = [
  "Cabecera",
  "Exportador / Remitente",
  "Consignatario / Destinatario",
  "Envío",
  "Totales",
  "Pie",
];

/** Convierte "3.960", "3,96", "1 250 kg"… a número; NaN → 0. */
function aNumero(valor: string): number {
  const limpio = valor
    .replace(/[^\d,.-]/g, "") // quita unidades y espacios
    .replace(/\.(?=\d{3}(\D|$))/g, "") // puntos de millar
    .replace(",", ".");
  const n = Number.parseFloat(limpio);
  return Number.isFinite(n) ? n : 0;
}

/** Formatea un número con separador de millar español y sin decimales sobrantes.
 * `useGrouping: "always"` agrupa también 1.000–9.999 (es-ES no lo hace por
 * defecto), para que los totales del documento sean visualmente coherentes. */
function formatearNumero(n: number): string {
  return n.toLocaleString("es-ES", {
    maximumFractionDigits: 3,
    useGrouping: "always",
  });
}

export interface PackingTotales {
  bultos: string;
  pesoNeto: string;
  pesoBruto: string;
}

/**
 * Totales del packing list. Si el usuario los fijó a mano se respetan; si no,
 * se suman las líneas. Así el documento cuadra aunque falten datos por línea.
 */
export function totalesPacking(d: PackingDatos): PackingTotales {
  const sumaBultos = d.lineas.reduce((s, l) => s + aNumero(l.numBultos), 0);
  const sumaNeto = d.lineas.reduce((s, l) => s + aNumero(l.pesoNeto), 0);
  const sumaBruto = d.lineas.reduce((s, l) => s + aNumero(l.pesoBruto), 0);
  return {
    bultos: d.totalBultosManual.trim() || formatearNumero(sumaBultos),
    pesoNeto: d.pesoNetoTotalManual.trim() || `${formatearNumero(sumaNeto)} kg`,
    pesoBruto: d.pesoBrutoTotalManual.trim() || `${formatearNumero(sumaBruto)} kg`,
  };
}

export interface ProblemaPacking {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida el packing list: partes obligatorias, al menos una línea y coherencia de pesos. */
export function validarPacking(d: PackingDatos): ProblemaPacking[] {
  const problemas: ProblemaPacking[] = [];

  for (const campo of PACKING_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({
        key: campo.key,
        nivel: "error",
        mensaje: `Falta «${campo.label}»`,
      });
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

  // Coherencia: el peso neto no debería superar al bruto en ninguna línea.
  d.lineas.forEach((l, i) => {
    const neto = aNumero(l.pesoNeto);
    const bruto = aNumero(l.pesoBruto);
    if (neto > 0 && bruto > 0 && neto > bruto) {
      problemas.push({
        key: `linea-${i}`,
        nivel: "aviso",
        mensaje: `Línea ${i + 1}: el peso neto (${l.pesoNeto}) supera al bruto (${l.pesoBruto}).`,
      });
    }
  });

  return problemas;
}

export function lineaVacia(): PackingLinea {
  return {
    marcas: "",
    tipoBulto: "",
    numBultos: "",
    descripcion: "",
    cantidad: "",
    unidad: "",
    pesoNeto: "",
    pesoBruto: "",
    dimensiones: "",
  };
}

export function packingVacio(): PackingDatos {
  return {
    numero: "",
    fecha: "",
    referenciaFactura: "",
    exportadorNombre: "",
    exportadorDireccion: "",
    importadorNombre: "",
    importadorDireccion: "",
    incoterm: "",
    lugarEntrega: "",
    modoTransporte: "",
    numeroContenedor: "",
    puertoCarga: "",
    puertoDescarga: "",
    paisOrigen: "",
    paisDestino: "",
    lineas: [lineaVacia()],
    totalBultosManual: "",
    pesoNetoTotalManual: "",
    pesoBrutoTotalManual: "",
    volumenTotal: "",
    observaciones: "",
    lugarFecha: "",
    firma: "",
  };
}
