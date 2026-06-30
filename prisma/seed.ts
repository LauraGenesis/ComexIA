import { PrismaClient } from "@prisma/client";
import { expedientes, alertas } from "../src/lib/data";
import type { DuaDatos } from "../src/lib/documentos/dua";

/*
 * DUA completo del CASO 45 (Lámparas de mesa), volcado casilla a casilla desde
 * docs/COMEX_CASO_45_LÁMPARAS_DE_MESA_DUA_6_IMPORTACIÓN.md.
 * Se asocia al expediente exp-2210-15 ("Lámparas de mesa") como ejemplo real.
 */
const DUA_LAMPARAS: DuaDatos = {
  tipo: "importacion",
  exportadorEori: "2587858",
  exportadorNombre: "Kao Tsiu",
  exportadorDireccion: "Tiang San 23, Shanghái (RP China)",
  destinatarioEori: "ESA25478547",
  destinatarioNombre: "Lan Yao",
  destinatarioDireccion: "Calle La Robla 4, 28947 Fuenlabrada (Madrid)",
  declaranteEori: "ESA25478547",
  declaranteNombre: "El destinatario",
  descripcionMercancia:
    "800 lámparas de mesa · BX 800 cajas de 0,50 kg · OB 1 europalet filmado de 25 kg · FRTD 565852-8 FCL",
  codigoMercancia: "9405 29 90",
  partidas: "3",
  totalBultos: "1 pallet",
  masaBruta: "1225",
  masaNeta: "800",
  valorEstadistico: "9521.30",
  paisExportacion: "CN",
  paisDestino: "ES",
  contenedor: true,
  incoterm: "DPU",
  lugarEntrega: "Calle La Robla 4, 28947 Fuenlabrada (Madrid)",
  divisaImporte: "EUR 9729.20",
  modoTransporte: "1 (marítimo)",
  regimen: "40 00",
  documentos: [
    "N380 Factura comercial 214/2022 de 10 de mayo",
    "N271 Packing List 325/2022 de 10 de mayo",
    "N003 Certificado SOIVRE 458/2022 de 11 de mayo",
    "U004 Certificado de origen 265/2022 de 11 de mayo",
    "N705 B/L 241/2022 de 15 de mayo",
    "N730 CMR · N821 T1 · N934 DV1",
  ].join("\n"),
  lugarFecha: "Madrid, 20 de mayo de 2022",
  firmaDeclarante: "Lan Yao",
};

/*
 * Seed: carga en SQLite los datos de ejemplo de src/lib/data.ts.
 * Idempotente: borra y recrea. Usa los ids del mock como ids de fila para que
 * los enlaces (detalle de expediente, alertas) sigan funcionando.
 *
 * Ejecutar: npx tsx prisma/seed.ts
 */

const prisma = new PrismaClient();

/*
 * BASE DE CONOCIMIENTO (motor sin IA).
 * Cada entrada se inserta como una `Regla` con sus relaciones. Son los casos
 * que antes estaban hardcodeados en src/lib/motor/mock.ts. Para enseñarle más
 * comercio exterior a la plataforma, añade objetos a este array (o filas en la
 * base / Prisma Studio): no hay que tocar código del motor.
 */
type ReglaSeed = {
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

const REGLAS: ReglaSeed[] = [
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

async function main() {
  // Borrado en orden de dependencias.
  await prisma.evento.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.expediente.deleteMany();
  await prisma.regla.deleteMany(); // cascada borra documentos/normativa/riesgos/alertas/pasos

  for (const e of expedientes) {
    await prisma.expediente.create({
      data: {
        id: e.id,
        ref: e.ref,
        producto: e.producto,
        tipo: e.tipo,
        origen: e.origen,
        destino: e.destino,
        hsTaric: e.hsTaric,
        incoterm: e.incoterm,
        transporte: e.transporte,
        valor: e.valor,
        estado: e.estado,
        riesgo: e.riesgo,
        confianza: e.confianza,
        proximaAccion: e.proximaAccion,
        documentos: {
          create: e.documentos.map((d) => ({
            nombre: d.nombre,
            estado: d.estado,
            obligatorio: d.obligatorio,
          })),
        },
        eventos: {
          create: [
            { actor: "usuario", accion: "Creó el expediente" },
            {
              actor: "IA",
              accion: `Resolución inicial (confianza ${Math.round(
                (e.confianza ?? 0.8) * 100,
              )}%)`,
            },
          ],
        },
      },
    });
  }

  for (const a of alertas) {
    await prisma.alerta.create({
      data: {
        severidad: a.severidad,
        titulo: a.titulo,
        detalle: a.detalle,
        expedienteId: a.expedienteId,
      },
    });
  }

  // Asocia el DUA completo del CASO 45 al expediente de lámparas (exp-2210-15).
  const duaLamparas = await prisma.documento.findFirst({
    where: { expedienteId: "exp-2210-15", nombre: { contains: "DUA" } },
  });
  if (duaLamparas) {
    await prisma.documento.update({
      where: { id: duaLamparas.id },
      data: { estado: "generado", datos: JSON.stringify(DUA_LAMPARAS) },
    });
    await prisma.evento.create({
      data: {
        expedienteId: "exp-2210-15",
        actor: "usuario",
        accion: "Generó DUA de importación (CASO 45 completo)",
      },
    });
  }

  // Base de conocimiento: reglas del motor sin IA.
  for (const r of REGLAS) {
    await prisma.regla.create({
      data: {
        nombre: r.nombre,
        prioridad: r.prioridad ?? 0,
        productoMatch: r.productoMatch,
        hsTaric: r.hsTaric,
        origen: r.origen,
        destino: r.destino,
        tipo: r.tipo,
        resumen: r.resumen,
        confianza: r.confianza,
        requisitosSanitarios: r.requisitosSanitarios?.join("\n"),
        verificar: r.verificar?.join("\n"),
        documentos: { create: r.documentos },
        normativa: { create: r.normativa },
        riesgos: { create: r.riesgos },
        alertas: { create: r.alertas ?? [] },
        pasos: {
          create: r.pasos.map((texto, orden) => ({ texto, orden })),
        },
      },
    });
  }

  const nExp = await prisma.expediente.count();
  const nDoc = await prisma.documento.count();
  const nAle = await prisma.alerta.count();
  const nReg = await prisma.regla.count();
  console.log(
    `Seed OK: ${nExp} expedientes, ${nDoc} documentos, ${nAle} alertas, ${nReg} reglas`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
