import { PrismaClient } from "@prisma/client";
import { expedientes, alertas } from "../src/lib/data";
import type { DuaDatos } from "../src/lib/documentos/dua";
import { REGLAS } from "../src/lib/motor/reglas-seed";

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
