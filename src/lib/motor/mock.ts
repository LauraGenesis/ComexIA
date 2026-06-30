import type { Resolucion } from "./schema";

/*
 * Implementación MOCK del motor de resolución.
 * Razona de forma simplificada sobre la descripción del caso para devolver
 * una resolución estructurada con la MISMA forma que devolverá la IA real.
 *
 * Sustituir por la llamada a Claude = cambiar 1 archivo (ver index.ts).
 * El objetivo del mock es permitir construir y ver toda la UI sin API key.
 */

interface CasoEntrada {
  texto?: string;
  producto?: string;
  origen?: string;
  destino?: string;
  tipo?: string;
}

const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Caso conocido: sésamo desde India → control reforzado (alta confianza). */
function casoSesamoIndia(): Resolucion {
  return {
    resumen:
      "Importación de semillas de sésamo desde India a España. Sujeta a control reforzado en frontera.",
    documentacion: [
      { doc: "DUA de importación", estado: "obligatorio" },
      { doc: "Factura comercial", estado: "obligatorio" },
      { doc: "Packing list", estado: "obligatorio" },
      { doc: "DV1 (declaración de valor)", estado: "obligatorio" },
      { doc: "Certificado fitosanitario", estado: "obligatorio" },
      { doc: "Analítica de aflatoxinas", estado: "condicional" },
    ],
    normativa: [
      {
        titulo:
          "Reglamento (UE) sobre controles oficiales reforzados a la importación de determinados alimentos",
        fuente: "EUR-Lex",
        url: "https://eur-lex.europa.eu",
        relevancia: "alta",
      },
      {
        titulo: "Código Aduanero de la Unión (Reglamento UE 952/2013)",
        fuente: "AEAT",
        url: "https://sede.agenciatributaria.gob.es",
        relevancia: "media",
      },
    ],
    riesgos: [
      {
        tipo: "inspeccion_documental",
        nivel: "alto",
        motivo:
          "Control reforzado vigente para sésamo de India (aflatoxinas / óxido de etileno).",
      },
    ],
    requisitosSanitarios: [
      "Certificado fitosanitario del país de origen",
      "Analítica de aflatoxinas y óxido de etileno",
      "Inspección en Punto de Control Fronterizo (PCF)",
    ],
    alertas: [
      {
        severidad: "critica",
        mensaje:
          "Control reforzado vigente: adjunta la analítica de aflatoxinas antes del despacho.",
      },
    ],
    pasos: [
      "Confirmar la partida TARIC del sésamo (p. ej. 1207.40.90).",
      "Solicitar el certificado fitosanitario al exportador.",
      "Preparar factura comercial, packing list y DV1.",
      "Adjuntar la analítica de aflatoxinas / óxido de etileno.",
      "Presentar el DUA de importación.",
      "Prever control documental reforzado en el PCF.",
    ],
    confianza: 0.82,
    verificar: [
      "Vigencia exacta del control reforzado para este origen.",
      "Subtipo correcto de la partida TARIC.",
    ],
  };
}

/**
 * Caso genérico derivado: cuando no hay un patrón conocido, el motor
 * "razona por analogía" y entrega una resolución base con CONFIANZA BAJA,
 * marcando claramente qué verificar (principio de fallback honesto).
 */
function casoGenerico(e: CasoEntrada): Resolucion {
  const esExportacion =
    norm(e.tipo) === "exportacion" || norm(e.texto).includes("exportar");
  const tipoTxt = esExportacion ? "exportación" : "importación";
  const producto = e.producto || "la mercancía indicada";

  return {
    resumen: `Operación de ${tipoTxt} de ${producto}. Resolución derivada por analogía: revisa los puntos marcados.`,
    documentacion: [
      { doc: `DUA de ${tipoTxt}`, estado: "obligatorio" },
      { doc: "Factura comercial", estado: "obligatorio" },
      { doc: "Packing list", estado: "obligatorio" },
      { doc: "Certificado de origen", estado: "recomendado" },
    ],
    normativa: [
      {
        titulo: "Código Aduanero de la Unión (Reglamento UE 952/2013)",
        fuente: "AEAT",
        url: "https://sede.agenciatributaria.gob.es",
        relevancia: "media",
      },
    ],
    riesgos: [
      {
        tipo: "clasificacion",
        nivel: "medio",
        motivo:
          "Sin un caso idéntico de referencia; conviene confirmar la clasificación arancelaria.",
      },
    ],
    requisitosSanitarios: [],
    // Sin alerta redundante: la UI ya muestra el banner "caso poco frecuente"
    // cuando la confianza es baja (< 0.6).
    alertas: [],
    pasos: [
      "Determinar la partida HS/TARIC del producto.",
      "Confirmar país de origen y destino y el régimen aduanero.",
      "Preparar la documentación comercial básica.",
      "Comprobar requisitos sanitarios/fitosanitarios según el producto.",
      `Presentar el DUA de ${tipoTxt}.`,
    ],
    confianza: 0.45,
    verificar: [
      "Clasificación arancelaria (HS/TARIC) del producto.",
      "Existencia de controles específicos para este origen/destino.",
      "Documentos sanitarios o licencias aplicables.",
    ],
  };
}

/** Caso conocido: exportación de calzado de piel a Japón (alta confianza). */
function casoCalzadoJapon(): Resolucion {
  return {
    resumen:
      "Exportación de calzado de piel desde España a Japón. Operación estándar con acuerdo UE–Japón.",
    documentacion: [
      { doc: "DUA de exportación", estado: "obligatorio" },
      { doc: "Factura comercial", estado: "obligatorio" },
      { doc: "Packing list", estado: "obligatorio" },
      { doc: "Declaración de origen (sistema REX)", estado: "recomendado" },
      { doc: "Certificado SOIVRE", estado: "condicional" },
    ],
    normativa: [
      {
        titulo: "Acuerdo de Asociación Económica UE–Japón (origen mediante REX)",
        fuente: "EUR-Lex",
        url: "https://eur-lex.europa.eu",
        relevancia: "alta",
      },
      {
        titulo: "Código Aduanero de la Unión (Reglamento UE 952/2013)",
        fuente: "AEAT",
        url: "https://sede.agenciatributaria.gob.es",
        relevancia: "media",
      },
    ],
    riesgos: [
      {
        tipo: "inspeccion_documental",
        nivel: "bajo",
        motivo: "Mercancía general sin restricciones; ruta y acuerdo consolidados.",
      },
    ],
    requisitosSanitarios: [],
    alertas: [],
    pasos: [
      "Confirmar la partida TARIC del calzado (p. ej. 6403.59).",
      "Emitir la declaración de origen REX si se solicita preferencia.",
      "Preparar factura comercial y packing list.",
      "Presentar el DUA de exportación.",
    ],
    confianza: 0.88,
    verificar: ["Subtipo exacto de la partida 6403."],
  };
}

/** Caso conocido: importación de lámparas de mesa desde China (alta confianza). */
function casoLamparasChina(): Resolucion {
  return {
    resumen:
      "Importación de lámparas de mesa desde China a España. Producto eléctrico sujeto a marcado CE.",
    documentacion: [
      { doc: "DUA de importación", estado: "obligatorio" },
      { doc: "Factura comercial", estado: "obligatorio" },
      { doc: "Packing list", estado: "obligatorio" },
      { doc: "DV1 (declaración de valor)", estado: "obligatorio" },
      { doc: "Declaración de conformidad CE", estado: "obligatorio" },
    ],
    normativa: [
      {
        titulo: "Directiva de Baja Tensión y marcado CE (productos eléctricos)",
        fuente: "EUR-Lex",
        url: "https://eur-lex.europa.eu",
        relevancia: "alta",
      },
      {
        titulo: "Arancel Integrado (TARIC) — derechos e IVA de importación",
        fuente: "AEAT",
        url: "https://sede.agenciatributaria.gob.es",
        relevancia: "media",
      },
    ],
    riesgos: [
      {
        tipo: "inspeccion_documental",
        nivel: "medio",
        motivo:
          "Producto eléctrico de origen China: posible control de conformidad y marcado CE.",
      },
    ],
    requisitosSanitarios: [],
    alertas: [
      {
        severidad: "advertencia",
        mensaje:
          "Verifica el marcado CE y la declaración de conformidad antes del despacho.",
      },
    ],
    pasos: [
      "Confirmar la partida TARIC (p. ej. 9405.29).",
      "Recabar la declaración de conformidad CE del fabricante.",
      "Preparar factura, packing list y DV1.",
      "Liquidar derechos e IVA y presentar el DUA de importación.",
    ],
    confianza: 0.85,
    verificar: ["Vigencia de la declaración de conformidad CE."],
  };
}

/** Caso conocido: tránsito T1 de repuestos (confianza media-alta). */
function casoTransitoT1(): Resolucion {
  return {
    resumen:
      "Tránsito externo (T1) de repuestos industriales entre Estados miembros. Mercancía no despachada a libre práctica.",
    documentacion: [
      { doc: "Declaración de tránsito T1 (NCTS)", estado: "obligatorio" },
      { doc: "Factura comercial", estado: "obligatorio" },
      { doc: "CMR (carta de porte por carretera)", estado: "obligatorio" },
      { doc: "Garantía de tránsito", estado: "obligatorio" },
    ],
    normativa: [
      {
        titulo: "Régimen de tránsito de la Unión (NCTS) — CAU",
        fuente: "AEAT",
        url: "https://sede.agenciatributaria.gob.es",
        relevancia: "alta",
      },
    ],
    riesgos: [
      {
        tipo: "garantia",
        nivel: "medio",
        motivo:
          "El tránsito exige garantía válida y ultimación en la aduana de destino dentro de plazo.",
      },
    ],
    requisitosSanitarios: [],
    alertas: [
      {
        severidad: "advertencia",
        mensaje:
          "Asegura la garantía de tránsito y la ultimación del T1 en destino dentro del plazo.",
      },
    ],
    pasos: [
      "Constituir o referenciar la garantía de tránsito.",
      "Generar la declaración T1 en NCTS.",
      "Acompañar la mercancía con el MRN y el CMR.",
      "Ultimar el tránsito en la aduana de destino.",
    ],
    confianza: 0.8,
    verificar: ["Importe y validez de la garantía de tránsito."],
  };
}

/** Resuelve un caso de forma simulada. */
export function resolverMock(e: CasoEntrada): Resolucion {
  const t = norm(`${e.texto ?? ""} ${e.producto ?? ""}`);
  const origen = norm(e.origen);

  const esSesamo = t.includes("sesamo") || t.includes("sesame");
  if (esSesamo && (origen === "in" || t.includes("india")))
    return casoSesamoIndia();

  if (t.includes("calzado") || t.includes("zapato") || t.includes("shoes"))
    return casoCalzadoJapon();

  if (t.includes("lampara") || t.includes("lamp"))
    return casoLamparasChina();

  if (t.includes("transito") || t.includes(" t1") || t.startsWith("t1"))
    return casoTransitoT1();

  return casoGenerico(e);
}
