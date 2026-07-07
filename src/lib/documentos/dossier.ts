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
    totalBultos: v(dos.totalBultos),
    masaBruta: v(dos.pesoBrutoTotal),
    masaNeta: v(dos.pesoNetoTotal),
    valorEstadistico: v(dos.valorTotal),
    paisExportacion:
      v(dos.paisOrigen) ||
      (tipo === "exportacion" ? v(dos.exportador?.pais) : base.paisExportacion),
    paisDestino:
      v(dos.paisDestino) ||
      (tipo === "importacion" ? v(dos.importador?.pais) : base.paisDestino),
    contenedor: Boolean(v(dos.numeroContenedor)),
    incoterm: v(dos.incoterm),
    lugarEntrega: v(dos.lugarIncoterm),
    divisaImporte: juntar([dos.divisa, dos.valorTotal], " "),
    modoTransporte: v(dos.modoTransporte),
    documentos: dos.documentosDetectados.join("\n"),
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
