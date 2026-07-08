/*
 * Definición de la Factura Comercial (commercial invoice).
 * Como el packing list, su cuerpo es una TABLA de líneas; pero aquí lo central
 * son los IMPORTES: cada línea calcula cantidad × precio unitario y el pie suma
 * subtotal + flete + seguro − descuento según el incoterm. Se genera desde el
 * mismo dossier canónico (datos compartidos) sin volver a transcribir nada.
 */

/** Una línea de la factura (un artículo o partida facturada). */
export interface FacturaLinea {
  descripcion: string;
  hsTaric: string; // Código HS/TARIC/NC (informativo en la factura)
  cantidad: string;
  unidad: string; // uds, botellas, kg…
  precioUnitario: string;
  importeManual: string; // si se rellena, prevalece sobre cantidad × precio
}

export interface FacturaDatos {
  // Cabecera
  numero: string;
  fecha: string;
  // Vendedor / Exportador
  vendedorNombre: string;
  vendedorDireccion: string;
  vendedorNifVat: string;
  vendedorEori: string;
  // Comprador / Importador
  compradorNombre: string;
  compradorDireccion: string;
  compradorNifVat: string;
  // Condiciones comerciales
  incoterm: string;
  lugarEntrega: string;
  divisa: string; // ISO 4217, p. ej. EUR
  condicionesPago: string;
  modoTransporte: string;
  paisOrigen: string;
  paisDestino: string;
  // Cuerpo
  lineas: FacturaLinea[];
  // Ajustes del total
  descuento: string;
  flete: string;
  seguro: string;
  otrosGastos: string;
  // Datos bancarios
  banco: string;
  iban: string;
  swift: string;
  // Pie
  observaciones: string;
  declaracionOrigen: string;
  lugarFecha: string;
  firma: string;
}

/** Campos planos (la tabla de líneas se edita aparte). */
export interface FacturaCampoDef {
  key: Exclude<keyof FacturaDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea";
  placeholder?: string;
}

export const FACTURA_CAMPOS: FacturaCampoDef[] = [
  { key: "numero", label: "Nº de factura", seccion: "Cabecera", required: true, placeholder: "F-2026-0142" },
  { key: "fecha", label: "Fecha", seccion: "Cabecera", required: true, placeholder: "2026-06-20" },

  { key: "vendedorNombre", label: "Nombre vendedor", seccion: "Vendedor / Exportador", required: true },
  { key: "vendedorDireccion", label: "Dirección vendedor", seccion: "Vendedor / Exportador", tipo: "textarea" },
  { key: "vendedorNifVat", label: "NIF / VAT", seccion: "Vendedor / Exportador" },
  { key: "vendedorEori", label: "EORI", seccion: "Vendedor / Exportador" },

  { key: "compradorNombre", label: "Nombre comprador", seccion: "Comprador / Importador", required: true },
  { key: "compradorDireccion", label: "Dirección comprador", seccion: "Comprador / Importador", tipo: "textarea" },
  { key: "compradorNifVat", label: "NIF / VAT", seccion: "Comprador / Importador" },

  { key: "incoterm", label: "Incoterm", seccion: "Condiciones", placeholder: "CIP" },
  { key: "lugarEntrega", label: "Lugar de entrega", seccion: "Condiciones" },
  { key: "divisa", label: "Divisa (ISO)", seccion: "Condiciones", placeholder: "EUR" },
  { key: "condicionesPago", label: "Condiciones de pago", seccion: "Condiciones", placeholder: "30 días fecha factura" },
  { key: "modoTransporte", label: "Modo de transporte", seccion: "Condiciones", placeholder: "Marítimo" },
  { key: "paisOrigen", label: "País de origen (ISO)", seccion: "Condiciones", placeholder: "ES" },
  { key: "paisDestino", label: "País de destino (ISO)", seccion: "Condiciones", placeholder: "JP" },

  { key: "descuento", label: "Descuento", seccion: "Totales", placeholder: "0" },
  { key: "flete", label: "Flete", seccion: "Totales", placeholder: "0" },
  { key: "seguro", label: "Seguro", seccion: "Totales", placeholder: "0" },
  { key: "otrosGastos", label: "Otros gastos", seccion: "Totales", placeholder: "0" },

  { key: "banco", label: "Banco", seccion: "Datos bancarios" },
  { key: "iban", label: "IBAN", seccion: "Datos bancarios" },
  { key: "swift", label: "SWIFT / BIC", seccion: "Datos bancarios" },

  { key: "declaracionOrigen", label: "Declaración de origen", seccion: "Pie", tipo: "textarea", placeholder: "Se certifica que las mercancías son originarias de…" },
  { key: "observaciones", label: "Observaciones", seccion: "Pie", tipo: "textarea" },
  { key: "lugarFecha", label: "Lugar y fecha", seccion: "Pie" },
  { key: "firma", label: "Firma / responsable", seccion: "Pie" },
];

export const FACTURA_SECCIONES = [
  "Cabecera",
  "Vendedor / Exportador",
  "Comprador / Importador",
  "Condiciones",
  "Totales",
  "Datos bancarios",
  "Pie",
];

/** Convierte "1.234,56", "28 800 €", "3,96"… a número; NaN → 0. */
export function aNumero(valor: string): number {
  const limpio = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // puntos de millar
    .replace(",", ".");
  const n = Number.parseFloat(limpio);
  return Number.isFinite(n) ? n : 0;
}

/** Formatea un importe con 2 decimales y separador de millar español.
 * `useGrouping: "always"` fuerza el punto de millar también en 1.000–9.999
 * (es-ES por defecto no agrupa esos, lo que descuadra visualmente la factura). */
export function formatearImporte(n: number): string {
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  });
}

/** Importe de una línea: manual si se fijó, si no cantidad × precio unitario. */
export function importeLinea(l: FacturaLinea): number {
  const manual = l.importeManual.trim();
  if (manual) return aNumero(manual);
  return aNumero(l.cantidad) * aNumero(l.precioUnitario);
}

export interface FacturaTotales {
  subtotal: number;
  descuento: number;
  flete: number;
  seguro: number;
  otros: number;
  total: number;
}

/** Totales de la factura: subtotal de líneas + ajustes del pie. */
export function totalesFactura(d: FacturaDatos): FacturaTotales {
  const subtotal = d.lineas.reduce((s, l) => s + importeLinea(l), 0);
  const descuento = aNumero(d.descuento);
  const flete = aNumero(d.flete);
  const seguro = aNumero(d.seguro);
  const otros = aNumero(d.otrosGastos);
  const total = subtotal - descuento + flete + seguro + otros;
  return { subtotal, descuento, flete, seguro, otros, total };
}

export interface ProblemaFactura {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

const INCOTERMS_SIN_SEGURO = ["EXW", "FCA", "FAS", "FOB", "CFR", "CPT", "DAP", "DPU", "DDP"];
const INCOTERMS_CON_SEGURO = ["CIF", "CIP"];

/** Valida la factura: campos obligatorios, al menos una línea con importe y coherencia incoterm↔seguro. */
export function validarFactura(d: FacturaDatos): ProblemaFactura[] {
  const problemas: ProblemaFactura[] = [];

  for (const campo of FACTURA_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({
        key: campo.key,
        nivel: "error",
        mensaje: `Falta «${campo.label}»`,
      });
    }
  }

  const lineasConImporte = d.lineas.filter((l) => importeLinea(l) > 0);
  if (lineasConImporte.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una línea con cantidad y precio.",
    });
  }

  const incoterm = d.incoterm.trim().toUpperCase();
  const seguro = aNumero(d.seguro);
  // RN-05 (valor): CIF/CIP incluyen seguro; si no se indica importe, avisamos.
  if (INCOTERMS_CON_SEGURO.includes(incoterm) && seguro === 0) {
    problemas.push({
      key: "seguro",
      nivel: "aviso",
      mensaje: `El incoterm ${incoterm} incluye seguro pagado por el vendedor: indica su importe.`,
    });
  }
  // A la inversa: un incoterm sin seguro con importe de seguro suele ser un error.
  if (INCOTERMS_SIN_SEGURO.includes(incoterm) && seguro > 0) {
    problemas.push({
      key: "seguro",
      nivel: "aviso",
      mensaje: `El incoterm ${incoterm} no obliga al vendedor a asegurar: revisa el importe de seguro.`,
    });
  }

  return problemas;
}

export function facturaLineaVacia(): FacturaLinea {
  return {
    descripcion: "",
    hsTaric: "",
    cantidad: "",
    unidad: "",
    precioUnitario: "",
    importeManual: "",
  };
}

export function facturaVacia(): FacturaDatos {
  return {
    numero: "",
    fecha: "",
    vendedorNombre: "",
    vendedorDireccion: "",
    vendedorNifVat: "",
    vendedorEori: "",
    compradorNombre: "",
    compradorDireccion: "",
    compradorNifVat: "",
    incoterm: "",
    lugarEntrega: "",
    divisa: "EUR",
    condicionesPago: "",
    modoTransporte: "",
    paisOrigen: "",
    paisDestino: "",
    lineas: [facturaLineaVacia()],
    descuento: "",
    flete: "",
    seguro: "",
    otrosGastos: "",
    banco: "",
    iban: "",
    swift: "",
    observaciones: "",
    declaracionOrigen: "",
    lugarFecha: "",
    firma: "",
  };
}
