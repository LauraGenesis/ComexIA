/*
 * Dossier canónico de extracción.
 *
 * Cuando el usuario sube documentos fuente (packing list, factura comercial,
 * conocimiento de embarque…) la IA los lee UNA sola vez y rellena este dossier.
 * A partir de él se generan los documentos destino (DUA hoy; Factura y
 * Certificado de origen después) sin re-subir ni re-extraer.
 *
 * Es un SUPERCONJUNTO de campos comunes a esos documentos. Como el modelo puede
 * no encontrar todos los datos, casi todo es opcional; lo que falte se enumera
 * en `verificar` (mismo estilo de "fallback honesto" que el motor de resolución).
 *
 * Este módulo es CÓDIGO PURO (zod), importable tanto en servidor (extractor)
 * como en cliente (mapeo a DuaDatos). No añadir "server-only" aquí.
 */
import { z } from "zod";
import { duaVacio, type DuaDatos, type DuaTipo } from "./dua";
import {
  packingVacio,
  lineaVacia,
  type PackingDatos,
  type PackingLinea,
} from "./packing";
import {
  facturaVacia,
  facturaLineaVacia,
  type FacturaDatos,
  type FacturaLinea,
} from "./factura";
import {
  origenVacio,
  origenLineaVacia,
  type OrigenDatos,
  type OrigenLinea,
} from "./origen";
import {
  fitoVacio,
  fitoLineaVacia,
  type FitoDatos,
  type FitoLinea,
} from "./fitosanitario";
import {
  dgdVacio,
  dgdLineaVacia,
  type DgdDatos,
  type DgdLinea,
} from "./dgd";
import { dv1Vacio, type Dv1Datos } from "./dv1";
import { blVacio, blLineaVacia, type BlDatos, type BlLinea } from "./bl";
import { cmrVacio, cmrLineaVacia, type CmrDatos, type CmrLinea } from "./cmr";
import {
  transitoVacio,
  transitoLineaVacia,
  type TransitoDatos,
  type TransitoLinea,
  type TransitoTipo,
} from "./transito";

/** Una parte interviniente (exportador, importador, notify…). */
const parteSchema = z.object({
  nombre: z.string().optional(),
  direccion: z.string().optional(),
  pais: z.string().describe("ISO 3166-1 alfa-2, p. ej. ES").optional(),
  eori: z.string().optional(),
  nifVat: z.string().describe("NIF/CIF o número de IVA").optional(),
});

/** Una línea de mercancía (una fila del packing list / factura). */
const lineaSchema = z.object({
  descripcion: z.string().optional(),
  hsTaric: z.string().describe("Código HS/TARIC/NC si aparece").optional(),
  cantidad: z.string().optional(),
  unidad: z.string().optional(),
  bultos: z.string().optional(),
  tipoBulto: z.string().describe("Cajas, palés, sacos…").optional(),
  pesoBruto: z.string().optional(),
  pesoNeto: z.string().optional(),
  valorUnitario: z.string().optional(),
  valorTotal: z.string().optional(),
  marcas: z.string().describe("Marcas y numeración de los bultos").optional(),
  // Mercancía peligrosa (solo si el documento la declara: ADR/IMDG/IATA).
  unNumber: z.string().describe("Nº ONU, p. ej. UN1263").optional(),
  clasePeligro: z.string().describe("Clase/división de peligro, p. ej. 3").optional(),
  grupoEmbalaje: z.string().describe("Grupo de embalaje I, II o III").optional(),
});

export const dossierSchema = z.object({
  tipoOperacion: z.enum(["importacion", "exportacion"]).optional(),
  exportador: parteSchema.optional(),
  importador: parteSchema.optional(),
  lineas: z.array(lineaSchema).default([]),
  // Totales del envío.
  totalBultos: z.string().optional(),
  pesoBrutoTotal: z.string().optional(),
  pesoNetoTotal: z.string().optional(),
  volumen: z.string().describe("Volumen total, p. ej. 12,5 m³").optional(),
  // Datos comerciales.
  incoterm: z.string().optional(),
  lugarIncoterm: z.string().describe("Lugar asociado al incoterm").optional(),
  divisa: z.string().describe("ISO 4217, p. ej. EUR").optional(),
  valorTotal: z.string().optional(),
  numeroFactura: z.string().optional(),
  fechaFactura: z.string().optional(),
  // Transporte.
  modoTransporte: z.string().describe("Marítimo, aéreo, carretera…").optional(),
  numeroContenedor: z.string().optional(),
  puertoCarga: z.string().describe("Puerto/lugar de carga").optional(),
  puertoDescarga: z.string().describe("Puerto/lugar de descarga").optional(),
  paisOrigen: z.string().describe("ISO 3166-1 alfa-2").optional(),
  paisDestino: z.string().describe("ISO 3166-1 alfa-2").optional(),
  // Qué tipos de documento reconoció en lo subido (factura, packing list, B/L…).
  documentosDetectados: z.array(z.string()).default([]),
  /** Confianza global de la extracción (0–1). */
  confianza: z.number().min(0).max(1).default(0.5),
  /** Datos que el modelo no pudo leer con seguridad y conviene confirmar. */
  verificar: z.array(z.string()).default([]),
});

export type Dossier = z.infer<typeof dossierSchema>;

/** Junta valores no vacíos con un separador, ignorando undefined. */
function juntar(valores: (string | undefined)[], sep = "; "): string {
  return valores.map((v) => (v ?? "").trim()).filter(Boolean).join(sep);
}

/** Convierte "3.960,5" (ES), "3,960.5" (EN), "1.200" (millar ES) o "12.5" a número; null si no parsea. */
function aNumero(s?: string): number | null {
  const t = (s ?? "").replace(/[^\d.,-]/g, "").trim();
  if (!t) return null;
  const coma = t.lastIndexOf(",");
  const punto = t.lastIndexOf(".");
  let normal: string;
  if (coma >= 0 && punto >= 0) {
    // Conviven ambos: el separador más a la derecha es el decimal.
    normal =
      coma > punto
        ? t.replace(/\./g, "").replace(",", ".") // ES: 1.234,56
        : t.replace(/,/g, ""); // EN: 1,234.56
  } else if (coma >= 0) {
    // Solo comas: decimal si quedan 1-2 dígitos al final; si no, millares.
    normal = /,\d{1,2}$/.test(t) ? t.replace(/,/g, ".") : t.replace(/,/g, "");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    // Solo puntos en grupos de 3 (1.200, 28.800, 100.000…): millares ES.
    normal = t.replace(/\./g, "");
  } else {
    normal = t; // punto decimal simple (12.5) o entero sin separadores.
  }
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

/**
 * Total de un campo del envío: usa el total del dossier si viene; si no, lo
 * deriva de las líneas (copia tal cual si hay una sola; suma si hay varias y
 * todas son numéricas). Cubre el caso habitual del packing/factura de una sola
 * partida, donde la IA rellena el dato en la línea y no en el total agregado.
 */
function totalDesdeLineas(
  total: string | undefined,
  valoresLinea: (string | undefined)[],
): string {
  const t = (total ?? "").trim();
  if (t) return t;
  const presentes = valoresLinea.map((x) => (x ?? "").trim()).filter(Boolean);
  if (presentes.length <= 1) return presentes[0] ?? "";
  const nums = presentes.map(aNumero);
  if (nums.every((n): n is number => n !== null)) {
    const suma = nums.reduce((a, b) => a + b, 0);
    return suma.toLocaleString("es-ES", { maximumFractionDigits: 3 });
  }
  return presentes.join(" + ");
}

/**
 * Valor de una línea con respaldo en el total del envío: si esta es la ÚNICA
 * línea y su valor viene vacío, usa el total del dossier. El packing o la
 * factura de una sola partida suele traer el peso o el importe solo en el total
 * (no desglosado por línea); así la fila no queda a medias. Con varias líneas no
 * se puede repartir, de modo que se respeta el valor de la línea tal cual.
 */
function lineaConRespaldo(
  valorLinea: string | undefined,
  totalEnvio: string | undefined,
  numLineas: number,
): string {
  const v = (valorLinea ?? "").trim();
  if (v) return v;
  return numLineas === 1 ? (totalEnvio ?? "").trim() : "";
}

/**
 * Proyecta el dossier canónico sobre los campos del DUA. Lo que no venga en el
 * dossier queda con el valor por defecto de `duaVacio` para que el editor y su
 * validación sigan funcionando igual.
 */
export function dossierADua(dos: Dossier): DuaDatos {
  const tipo: DuaTipo =
    dos.tipoOperacion === "exportacion" ? "exportacion" : "importacion";
  const base = duaVacio(tipo);
  const v = (s?: string) => (s ?? "").trim();

  // El valor y los pesos pueden venir en los totales del envío o solo en las
  // líneas (packing/factura de una sola partida): se toma el total o se deriva.
  const valor = totalDesdeLineas(dos.valorTotal, dos.lineas.map((l) => l.valorTotal));

  return {
    ...base,
    tipo,
    exportadorEori: v(dos.exportador?.eori),
    exportadorNombre: v(dos.exportador?.nombre),
    exportadorDireccion: v(dos.exportador?.direccion),
    destinatarioEori: v(dos.importador?.eori),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: v(dos.importador?.direccion),
    descripcionMercancia:
      juntar(dos.lineas.map((l) => l.descripcion)) || base.descripcionMercancia,
    codigoMercancia: v(dos.lineas.find((l) => l.hsTaric)?.hsTaric),
    partidas: dos.lineas.length ? String(dos.lineas.length) : base.partidas,
    totalBultos: totalDesdeLineas(dos.totalBultos, dos.lineas.map((l) => l.bultos)),
    masaBruta: totalDesdeLineas(dos.pesoBrutoTotal, dos.lineas.map((l) => l.pesoBruto)),
    masaNeta: totalDesdeLineas(dos.pesoNetoTotal, dos.lineas.map((l) => l.pesoNeto)),
    valorEstadistico: valor,
    paisExportacion:
      v(dos.paisOrigen) ||
      (tipo === "exportacion" ? v(dos.exportador?.pais) : base.paisExportacion),
    paisDestino:
      v(dos.paisDestino) ||
      (tipo === "importacion" ? v(dos.importador?.pais) : base.paisDestino),
    contenedor: Boolean(v(dos.numeroContenedor)),
    incoterm: v(dos.incoterm),
    lugarEntrega: v(dos.lugarIncoterm),
    divisaImporte: juntar([dos.divisa, valor], " "),
    modoTransporte: v(dos.modoTransporte),
    documentos: dos.documentosDetectados.join("\n"),
  };
}

/**
 * Proyecta el dossier canónico sobre el packing list. Sus líneas mapean 1:1 con
 * las filas de la tabla (datos compartidos con el DUA: no se re-transcribe). Lo
 * que no venga en el dossier queda con el valor por defecto de `packingVacio`.
 */
export function dossierAPacking(dos: Dossier): PackingDatos {
  const base = packingVacio();
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: PackingLinea[] = n
    ? dos.lineas.map((l) => ({
        ...lineaVacia(),
        marcas: v(l.marcas),
        tipoBulto: v(l.tipoBulto),
        numBultos: lineaConRespaldo(l.bultos, dos.totalBultos, n),
        descripcion: v(l.descripcion),
        cantidad: v(l.cantidad),
        unidad: v(l.unidad),
        pesoNeto: lineaConRespaldo(l.pesoNeto, dos.pesoNetoTotal, n),
        pesoBruto: lineaConRespaldo(l.pesoBruto, dos.pesoBrutoTotal, n),
      }))
    : base.lineas;

  return {
    ...base,
    numero: v(dos.numeroFactura) ? `PL-${v(dos.numeroFactura)}` : base.numero,
    fecha: v(dos.fechaFactura),
    referenciaFactura: v(dos.numeroFactura),
    exportadorNombre: v(dos.exportador?.nombre),
    exportadorDireccion: juntar(
      [dos.exportador?.direccion, dos.exportador?.pais],
      " · ",
    ),
    importadorNombre: v(dos.importador?.nombre),
    importadorDireccion: juntar(
      [dos.importador?.direccion, dos.importador?.pais],
      " · ",
    ),
    incoterm: v(dos.incoterm),
    lugarEntrega: v(dos.lugarIncoterm),
    modoTransporte: v(dos.modoTransporte),
    numeroContenedor: v(dos.numeroContenedor),
    puertoCarga: v(dos.puertoCarga),
    puertoDescarga: v(dos.puertoDescarga),
    paisOrigen: v(dos.paisOrigen) || v(dos.exportador?.pais),
    paisDestino: v(dos.paisDestino) || v(dos.importador?.pais),
    lineas,
    totalBultosManual: v(dos.totalBultos),
    pesoNetoTotalManual: v(dos.pesoNetoTotal),
    pesoBrutoTotalManual: v(dos.pesoBrutoTotal),
    volumenTotal: v(dos.volumen),
  };
}

/**
 * Proyecta el dossier canónico sobre la factura comercial. Sus líneas mapean
 * 1:1 con las de la factura (datos compartidos con DUA y packing). El importe de
 * cada línea se toma del valor total leído; si falta, el editor lo recalcula
 * como cantidad × precio unitario.
 */
export function dossierAFactura(dos: Dossier): FacturaDatos {
  const base = facturaVacia();
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: FacturaLinea[] = n
    ? dos.lineas.map((l) => ({
        ...facturaLineaVacia(),
        descripcion: v(l.descripcion),
        hsTaric: v(l.hsTaric),
        cantidad: v(l.cantidad),
        unidad: v(l.unidad),
        precioUnitario: v(l.valorUnitario),
        // Si la partida única no trae importe pero el envío tiene valor total,
        // se usa este para que el subtotal de la factura no salga a cero.
        importeManual: lineaConRespaldo(l.valorTotal, dos.valorTotal, n),
      }))
    : base.lineas;

  return {
    ...base,
    numero: v(dos.numeroFactura),
    fecha: v(dos.fechaFactura),
    vendedorNombre: v(dos.exportador?.nombre),
    vendedorDireccion: juntar(
      [dos.exportador?.direccion, dos.exportador?.pais],
      " · ",
    ),
    vendedorNifVat: v(dos.exportador?.nifVat),
    vendedorEori: v(dos.exportador?.eori),
    compradorNombre: v(dos.importador?.nombre),
    compradorDireccion: juntar(
      [dos.importador?.direccion, dos.importador?.pais],
      " · ",
    ),
    compradorNifVat: v(dos.importador?.nifVat),
    incoterm: v(dos.incoterm),
    lugarEntrega: v(dos.lugarIncoterm),
    divisa: v(dos.divisa) || base.divisa,
    modoTransporte: v(dos.modoTransporte),
    paisOrigen: v(dos.paisOrigen) || v(dos.exportador?.pais),
    paisDestino: v(dos.paisDestino) || v(dos.importador?.pais),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre el certificado de origen. El país de origen
 * (casilla 3) se toma del origen de las mercancías —o del país del exportador si
 * no consta—, y las líneas mapean a la descripción de la casilla 6/7.
 */
export function dossierAOrigen(dos: Dossier): OrigenDatos {
  const base = origenVacio();
  const v = (s?: string) => (s ?? "").trim();

  const lineas: OrigenLinea[] = dos.lineas.length
    ? dos.lineas.map((l) => ({
        ...origenLineaVacia(),
        marcas: v(l.marcas),
        numBultos: v(l.bultos),
        tipoBulto: v(l.tipoBulto),
        descripcion: v(l.descripcion),
        cantidad: juntar([l.pesoNeto ? `${l.pesoNeto} kg` : "", l.cantidad], " · "),
      }))
    : base.lineas;

  return {
    ...base,
    numero: v(dos.numeroFactura) ? `CO-${v(dos.numeroFactura)}` : base.numero,
    exportadorNombre: v(dos.exportador?.nombre),
    exportadorDireccion: v(dos.exportador?.direccion),
    exportadorPais: v(dos.exportador?.pais) || v(dos.paisOrigen),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: juntar(
      [dos.importador?.direccion, dos.importador?.pais],
      " · ",
    ),
    paisOrigen: v(dos.paisOrigen) || v(dos.exportador?.pais),
    transporte: juntar(
      [dos.modoTransporte, juntar([dos.puertoCarga, dos.puertoDescarga], " → ")],
      " · ",
    ),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre el borrador de certificado fitosanitario.
 * El país del exportador/importador alimenta las ONPF de origen/destino, y las
 * líneas la descripción del envío. El NOMBRE BOTÁNICO no está en el dossier
 * (dato que aporta el exportador), así que queda vacío y la validación lo avisa.
 */
export function dossierAFito(dos: Dossier): FitoDatos {
  const base = fitoVacio();
  const v = (s?: string) => (s ?? "").trim();

  const lineas: FitoLinea[] = dos.lineas.length
    ? dos.lineas.map((l) => ({
        ...fitoLineaVacia(),
        marcasBultos: juntar(
          [l.marcas, juntar([l.bultos, l.tipoBulto], " ")],
          " · ",
        ),
        nombreProducto: v(l.descripcion),
        cantidad: juntar([l.pesoNeto ? `${l.pesoNeto} kg` : "", l.cantidad], " · "),
      }))
    : base.lineas;

  return {
    ...base,
    onpfOrigen: v(dos.exportador?.pais) || v(dos.paisOrigen),
    onpfDestino: v(dos.importador?.pais) || v(dos.paisDestino),
    exportadorNombre: v(dos.exportador?.nombre),
    exportadorDireccion: v(dos.exportador?.direccion),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: juntar(
      [dos.importador?.direccion, dos.importador?.pais],
      " · ",
    ),
    lugarOrigen: v(dos.paisOrigen) || v(dos.puertoCarga),
    medioTransporte: v(dos.modoTransporte),
    puntoEntrada: v(dos.puertoDescarga),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre la declaración de mercancías peligrosas.
 * Los datos ADR/IMDG (Nº ONU, clase, grupo de embalaje) se toman de la línea si
 * el documento los declaraba; si no, quedan vacíos y la validación los avisa,
 * porque son propios de este documento y los aporta el expedidor.
 */
export function dossierADgd(dos: Dossier): DgdDatos {
  const base = dgdVacio();
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: DgdLinea[] = n
    ? dos.lineas.map((l) => ({
        ...dgdLineaVacia(),
        unNumber: v(l.unNumber),
        designacionOficial: v(l.descripcion),
        clase: v(l.clasePeligro),
        grupoEmbalaje: v(l.grupoEmbalaje),
        numBultos: juntar([l.bultos, l.tipoBulto], " "),
        cantidad: juntar(
          [l.pesoNeto ? `${l.pesoNeto} kg` : "", l.cantidad],
          " · ",
        ),
        pesoBruto: lineaConRespaldo(l.pesoBruto, dos.pesoBrutoTotal, n),
      }))
    : base.lineas;

  return {
    ...base,
    numero: v(dos.numeroFactura) ? `DGD-${v(dos.numeroFactura)}` : base.numero,
    reserva: v(dos.numeroContenedor),
    expedidorNombre: v(dos.exportador?.nombre),
    expedidorDireccion: juntar(
      [dos.exportador?.direccion, dos.exportador?.pais],
      " · ",
    ),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: juntar(
      [dos.importador?.direccion, dos.importador?.pais],
      " · ",
    ),
    buqueVehiculo: v(dos.modoTransporte),
    puertoCarga: v(dos.puertoCarga),
    puertoDescarga: v(dos.puertoDescarga),
    destino: v(dos.paisDestino) || v(dos.importador?.pais),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre la Declaración de Valor en Aduana (DV1).
 * El precio pagado se toma del valor total del envío (o de las líneas), y el
 * seguro y el transporte quedan para el usuario salvo que consten. La divisa
 * alimenta la conversión; los ajustes del art. 71/72 los completa el declarante.
 */
export function dossierADv1(dos: Dossier): Dv1Datos {
  const base = dv1Vacio();
  const v = (s?: string) => (s ?? "").trim();
  const valor = totalDesdeLineas(dos.valorTotal, dos.lineas.map((l) => l.valorTotal));

  return {
    ...base,
    numero: v(dos.numeroFactura) ? `DV1-${v(dos.numeroFactura)}` : base.numero,
    fecha: v(dos.fechaFactura),
    vendedorNombre: v(dos.exportador?.nombre),
    vendedorDireccion: juntar([dos.exportador?.direccion, dos.exportador?.pais], " · "),
    compradorNombre: v(dos.importador?.nombre),
    compradorDireccion: juntar([dos.importador?.direccion, dos.importador?.pais], " · "),
    incoterm: v(dos.incoterm),
    lugarEntrega: v(dos.lugarIncoterm),
    numeroFactura: v(dos.numeroFactura),
    fechaFactura: v(dos.fechaFactura),
    divisa: v(dos.divisa) || base.divisa,
    precioPagado: valor,
  };
}

/**
 * Proyecta el dossier canónico sobre el conocimiento de embarque (B/L). El
 * consignatario se deja tal cual venga (nominativo o «a la orden»), y las líneas
 * mapean a la descripción de la mercancía con sus bultos, peso y volumen.
 */
export function dossierABl(dos: Dossier): BlDatos {
  const base = blVacio();
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: BlLinea[] = n
    ? dos.lineas.map((l) => ({
        ...blLineaVacia(),
        marcas: v(l.marcas),
        numBultos: juntar([lineaConRespaldo(l.bultos, dos.totalBultos, n), l.tipoBulto], " "),
        descripcion: v(l.descripcion),
        pesoBruto: lineaConRespaldo(l.pesoBruto, dos.pesoBrutoTotal, n),
        volumen: n === 1 ? v(dos.volumen) : "",
      }))
    : base.lineas;

  return {
    ...base,
    numero: base.numero,
    reserva: v(dos.numeroContenedor),
    fecha: v(dos.fechaFactura),
    shipperNombre: v(dos.exportador?.nombre),
    shipperDireccion: juntar([dos.exportador?.direccion, dos.exportador?.pais], " · "),
    consigneeNombre: v(dos.importador?.nombre),
    consigneeDireccion: juntar([dos.importador?.direccion, dos.importador?.pais], " · "),
    buque: v(dos.modoTransporte),
    puertoCarga: v(dos.puertoCarga),
    puertoDescarga: v(dos.puertoDescarga),
    lugarEntrega: v(dos.paisDestino) || v(dos.importador?.pais),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre la carta de porte por carretera (CMR). Las
 * líneas mapean a las casillas 6-12 (marcas, bultos, embalaje, naturaleza y
 * pesos); el transportista no está en el dossier y lo aporta el usuario.
 */
export function dossierACmr(dos: Dossier): CmrDatos {
  const base = cmrVacio();
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: CmrLinea[] = n
    ? dos.lineas.map((l) => ({
        ...cmrLineaVacia(),
        marcas: v(l.marcas),
        numBultos: lineaConRespaldo(l.bultos, dos.totalBultos, n),
        embalaje: v(l.tipoBulto),
        naturaleza: v(l.descripcion),
        estadistico: v(l.hsTaric),
        pesoBruto: lineaConRespaldo(l.pesoBruto, dos.pesoBrutoTotal, n),
        volumen: n === 1 ? v(dos.volumen) : "",
      }))
    : base.lineas;

  return {
    ...base,
    fecha: v(dos.fechaFactura),
    remitenteNombre: v(dos.exportador?.nombre),
    remitenteDireccion: juntar([dos.exportador?.direccion, dos.exportador?.pais], " · "),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: juntar([dos.importador?.direccion, dos.importador?.pais], " · "),
    lugarEntrega: v(dos.puertoDescarga) || v(dos.paisDestino),
    lugarCarga: v(dos.puertoCarga) || v(dos.paisOrigen),
    documentosAnexos: dos.documentosDetectados.join(", "),
    lineas,
  };
}

/**
 * Proyecta el dossier canónico sobre la declaración de tránsito (T1/T2). El tipo
 * se deduce de la operación (por defecto T1, tránsito externo); las partidas
 * mapean descripción, código y masa. El obligado principal y la garantía los
 * completa el usuario.
 */
export function dossierATransito(dos: Dossier): TransitoDatos {
  const tipo: TransitoTipo = "T1";
  const base = transitoVacio(tipo);
  const v = (s?: string) => (s ?? "").trim();

  const n = dos.lineas.length;
  const lineas: TransitoLinea[] = n
    ? dos.lineas.map((l) => ({
        ...transitoLineaVacia(),
        descripcion: v(l.descripcion),
        codigoMercancia: v(l.hsTaric),
        numBultos: lineaConRespaldo(l.bultos, dos.totalBultos, n),
        masaBruta: lineaConRespaldo(l.pesoBruto, dos.pesoBrutoTotal, n),
      }))
    : base.lineas;

  return {
    ...base,
    numero: v(dos.numeroFactura) ? `T1-${v(dos.numeroFactura)}` : base.numero,
    fecha: v(dos.fechaFactura),
    expedidorNombre: v(dos.exportador?.nombre),
    expedidorDireccion: juntar([dos.exportador?.direccion, dos.exportador?.pais], " · "),
    destinatarioNombre: v(dos.importador?.nombre),
    destinatarioDireccion: juntar([dos.importador?.direccion, dos.importador?.pais], " · "),
    paisExpedicion: v(dos.paisOrigen) || v(dos.exportador?.pais),
    paisDestino: v(dos.paisDestino) || v(dos.importador?.pais),
    modoTransporte: v(dos.modoTransporte),
    lineas,
  };
}

/**
 * Dossier de ejemplo para el modo demo (despliegue sin ANTHROPIC_API_KEY).
 * Permite lucir el flujo completo en el portfolio sin llamar a la IA.
 */
export function dossierDemo(): Dossier {
  return dossierSchema.parse({
    tipoOperacion: "exportacion",
    exportador: {
      nombre: "Aceites del Sur S.L.",
      direccion: "Pol. Ind. La Estrella, 14, 41500 Alcalá de Guadaíra, Sevilla",
      pais: "ES",
      eori: "ESA41000000",
      nifVat: "A41000000",
    },
    importador: {
      nombre: "Nippon Foods Co., Ltd.",
      direccion: "2-1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005",
      pais: "JP",
    },
    lineas: [
      {
        descripcion: "Aceite de oliva virgen extra, botella 500 ml",
        hsTaric: "1509 20 00",
        cantidad: "3.600",
        unidad: "botellas",
        bultos: "300",
        tipoBulto: "cajas",
        pesoBruto: "3.960",
        pesoNeto: "3.600",
        valorTotal: "28.800",
        marcas: "ADS/TYO 1-300",
      },
    ],
    totalBultos: "300",
    pesoBrutoTotal: "3.960",
    pesoNetoTotal: "3.600",
    volumen: "2,4 m³",
    incoterm: "CIP",
    lugarIncoterm: "Tokyo",
    divisa: "EUR",
    valorTotal: "28.800",
    numeroFactura: "F-2026-0142",
    fechaFactura: "2026-06-20",
    modoTransporte: "Marítimo",
    numeroContenedor: "MSCU1234567",
    puertoCarga: "Algeciras",
    puertoDescarga: "Tokyo",
    paisOrigen: "ES",
    paisDestino: "JP",
    documentosDetectados: ["Packing list", "Factura comercial"],
    confianza: 0.86,
    verificar: [
      "Confirmar EORI del importador japonés (no aparece en el packing list).",
      "Verificar el código TARIC con la clasificación oficial.",
    ],
  });
}
