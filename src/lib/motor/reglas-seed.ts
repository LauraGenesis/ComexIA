/*
 * BASE DE CONOCIMIENTO del motor (reglas sin IA), extraída para poder usarse
 * tanto en el seed de SQLite (prisma/seed.ts) como en el modo demo en memoria
 * (src/lib/motor/reglas.ts cuando DEMO_MODE está activo). Para enseñarle más
 * comercio exterior a la plataforma, añade objetos a este array.
 */
export type ReglaSeed = {
  nombre: string;
  prioridad?: number;
  // Criterios de coincidencia (todos opcionales; al menos uno debe existir).
  productoMatch?: string;
  hsTaric?: string;
  origen?: string;
  destino?: string;
  tipo?: string;
  // Resolución.
  resumen: string;
  confianza: number;
  requisitosSanitarios?: string[];
  verificar?: string[];
  documentos: { doc: string; estado: string }[];
  normativa: { titulo: string; fuente: string; url?: string; relevancia?: string }[];
  riesgos: { tipo: string; nivel: string; motivo: string }[];
  alertas?: { severidad: string; mensaje: string }[];
  pasos: string[];
};

export const REGLAS: ReglaSeed[] = [
  {
    nombre: "Sésamo desde India (control reforzado)",
    prioridad: 10,
    productoMatch: "sesamo",
    origen: "IN",
    tipo: "importacion",
    resumen:
      "Importación de semillas de sésamo desde India a España. Sujeta a control reforzado en frontera.",
    confianza: 0.82,
    requisitosSanitarios: [
      "Certificado fitosanitario del país de origen",
      "Analítica de aflatoxinas y óxido de etileno",
      "Inspección en Punto de Control Fronterizo (PCF)",
    ],
    verificar: [
      "Vigencia exacta del control reforzado para este origen.",
      "Subtipo correcto de la partida TARIC.",
    ],
    documentos: [
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
  },
  {
    nombre: "Calzado de piel a Japón (acuerdo UE–Japón)",
    prioridad: 5,
    productoMatch: "calzado",
    tipo: "exportacion",
    resumen:
      "Exportación de calzado de piel desde España a Japón. Operación estándar con acuerdo UE–Japón.",
    confianza: 0.88,
    verificar: ["Subtipo exacto de la partida 6403."],
    documentos: [
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
        motivo:
          "Mercancía general sin restricciones; ruta y acuerdo consolidados.",
      },
    ],
    pasos: [
      "Confirmar la partida TARIC del calzado (p. ej. 6403.59).",
      "Emitir la declaración de origen REX si se solicita preferencia.",
      "Preparar factura comercial y packing list.",
      "Presentar el DUA de exportación.",
    ],
  },
  {
    nombre: "Lámparas de mesa desde China (marcado CE)",
    prioridad: 5,
    productoMatch: "lampara",
    hsTaric: "9405",
    tipo: "importacion",
    resumen:
      "Importación de lámparas de mesa desde China a España. Producto eléctrico sujeto a marcado CE.",
    confianza: 0.85,
    verificar: ["Vigencia de la declaración de conformidad CE."],
    documentos: [
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
  },
  {
    nombre: "Tránsito externo T1 de repuestos",
    prioridad: 5,
    productoMatch: "transito",
    tipo: "transito",
    resumen:
      "Tránsito externo (T1) de repuestos industriales entre Estados miembros. Mercancía no despachada a libre práctica.",
    confianza: 0.8,
    verificar: ["Importe y validez de la garantía de tránsito."],
    documentos: [
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
  },
];
