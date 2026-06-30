import "server-only";
import { prisma } from "./prisma";
import { formatDateShort } from "./utils";
import { resolucionSchema, type Resolucion } from "./motor/schema";
import type { DuaDatos } from "./documentos/dua";
import type {
  Alerta,
  AccionPendiente,
  Evento,
  Expediente,
  EstadoExpediente,
  NivelRiesgo,
  Severidad,
  EstadoDocumentoExpediente,
} from "./types";

/*
 * Capa de acceso a datos (Prisma/SQLite).
 * Mapea las filas de la base a los tipos de dominio (src/lib/types.ts) que
 * consumen las pantallas, y centraliza la creación de expedientes desde una
 * resolución del motor.
 */

type DbExpedienteConDocs = Awaited<
  ReturnType<typeof prisma.expediente.findMany>
>[number] & {
  documentos: Array<{
    id: string;
    nombre: string;
    estado: string;
    obligatorio: boolean;
    updatedAt: Date;
  }>;
};

function mapExpediente(e: DbExpedienteConDocs): Expediente {
  let resolucion: Resolucion | undefined;
  if (e.resolucion) {
    const parsed = resolucionSchema.safeParse(JSON.parse(e.resolucion));
    if (parsed.success) resolucion = parsed.data;
  }
  return {
    id: e.id,
    ref: e.ref,
    producto: e.producto,
    tipo: e.tipo as Expediente["tipo"],
    origen: e.origen,
    destino: e.destino,
    hsTaric: e.hsTaric ?? undefined,
    incoterm: e.incoterm ?? undefined,
    transporte: e.transporte ?? undefined,
    valor: e.valor ?? undefined,
    estado: e.estado as EstadoExpediente,
    riesgo: e.riesgo as NivelRiesgo,
    confianza: e.confianza ?? undefined,
    proximaAccion: e.proximaAccion ?? undefined,
    documentos: e.documentos.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      estado: d.estado as EstadoDocumentoExpediente,
      obligatorio: d.obligatorio,
      actualizado: d.estado === "pendiente" ? undefined : formatDateShort(d.updatedAt),
    })),
    resolucion,
  };
}

export async function getExpedientes(): Promise<Expediente[]> {
  const filas = await prisma.expediente.findMany({
    orderBy: { createdAt: "desc" },
    include: { documentos: true },
  });
  return filas.map(mapExpediente);
}

export async function getExpedienteById(id: string): Promise<Expediente | null> {
  const fila = await prisma.expediente.findUnique({
    where: { id },
    include: { documentos: true },
  });
  return fila ? mapExpediente(fila) : null;
}

export async function getAlertas(): Promise<Alerta[]> {
  // Solo alertas de expedientes ya ABIERTOS: un expediente en "borrador" es una
  // búsqueda del motor que aún no se ha formalizado, y no debe generar alertas
  // en el dashboard. Esto excluye también las alertas sin expediente asociado.
  const filas = await prisma.alerta.findMany({
    where: { expediente: { estado: { not: "borrador" } } },
    orderBy: { createdAt: "desc" },
    include: { expediente: { select: { ref: true } } },
  });
  return filas.map((a) => ({
    id: a.id,
    severidad: a.severidad as Severidad,
    titulo: a.titulo,
    detalle: a.detalle ?? undefined,
    expedienteId: a.expedienteId ?? undefined,
    expedienteRef: a.expediente?.ref,
    fecha: formatDateShort(a.createdAt),
  }));
}

export async function getEventos(expedienteId: string): Promise<Evento[]> {
  const filas = await prisma.evento.findMany({
    where: { expedienteId },
    orderBy: { createdAt: "desc" },
  });
  return filas.map((ev) => ({
    id: ev.id,
    actor: ev.actor === "IA" ? "IA" : "usuario",
    accion: ev.accion,
    fecha: new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(ev.createdAt),
  }));
}

export async function getAccionesPendientes(): Promise<AccionPendiente[]> {
  const filas = await prisma.expediente.findMany({
    where: { estado: { not: "cerrado" }, proximaAccion: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, producto: true, proximaAccion: true },
  });
  return filas.map((e) => ({
    id: e.id,
    titulo: e.proximaAccion ?? "",
    expedienteRef: e.producto,
    plazo: "—",
  }));
}

export interface KpisDashboard {
  expedientesActivos: number;
  documentosPendientes: number;
  alertasCriticas: number;
  riesgoCartera: NivelRiesgo;
}

export async function getKpis(): Promise<KpisDashboard> {
  const [expedientesActivos, documentosPendientes, alertasCriticas, riesgos] =
    await Promise.all([
      prisma.expediente.count({ where: { estado: { not: "cerrado" } } }),
      prisma.documento.count({ where: { estado: "pendiente" } }),
      prisma.alerta.count({
        where: { severidad: "critica", expediente: { estado: { not: "borrador" } } },
      }),
      prisma.expediente.findMany({
        where: { estado: { not: "cerrado" } },
        select: { riesgo: true },
      }),
    ]);

  const peso: Record<string, number> = { bajo: 1, medio: 2, alto: 3 };
  const media =
    riesgos.length === 0
      ? 0
      : riesgos.reduce((s, r) => s + (peso[r.riesgo] ?? 2), 0) / riesgos.length;
  const riesgoCartera: NivelRiesgo =
    media >= 2.5 ? "alto" : media >= 1.5 ? "medio" : "bajo";

  return { expedientesActivos, documentosPendientes, alertasCriticas, riesgoCartera };
}

// ─── Creación de expediente desde una resolución del motor ───

const norm = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function detectarTipo(texto: string): Expediente["tipo"] {
  const t = norm(texto);
  if (t.includes("transito") || t.includes("t1")) return "transito";
  if (t.includes("export")) return "exportacion";
  return "importacion";
}

function riesgoGlobal(r: Resolucion): NivelRiesgo {
  const orden: NivelRiesgo[] = ["bajo", "medio", "alto"];
  let max = 0;
  for (const ri of r.riesgos) max = Math.max(max, orden.indexOf(ri.nivel));
  return r.riesgos.length ? orden[max] : "medio";
}

function tituloDesde(texto: string, r: Resolucion): string {
  const base = (texto || r.resumen).trim().replace(/\s+/g, " ");
  return base.length > 60 ? base.slice(0, 57) + "…" : base;
}

async function generarRef(): Promise<string> {
  const n = (await prisma.expediente.count()) + 1;
  const ahora = new Date();
  const yy = String(ahora.getFullYear()).slice(2);
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  return `#${yy}${mm}-${String(n).padStart(2, "0")}`;
}

export async function crearExpedienteDesdeResolucion(opts: {
  texto: string;
  resolucion: Resolucion;
}): Promise<string> {
  const { texto, resolucion } = opts;
  const ref = await generarRef();

  const creado = await prisma.expediente.create({
    data: {
      ref,
      producto: tituloDesde(texto, resolucion),
      tipo: detectarTipo(texto + " " + resolucion.resumen),
      origen: "",
      destino: "",
      estado: "borrador",
      riesgo: riesgoGlobal(resolucion),
      confianza: resolucion.confianza,
      proximaAccion: resolucion.pasos[0] ?? "Revisar requisitos",
      resolucion: JSON.stringify(resolucion),
      documentos: {
        create: resolucion.documentacion.map((d) => ({
          nombre: d.doc,
          estado: "pendiente",
          obligatorio: d.estado === "obligatorio",
        })),
      },
      alertas: {
        create: resolucion.alertas.map((a) => ({
          severidad: a.severidad,
          titulo: a.mensaje,
        })),
      },
      eventos: {
        create: [
          {
            actor: "IA",
            accion: `Resolución inicial (confianza ${Math.round(
              resolucion.confianza * 100,
            )}%)`,
          },
          { actor: "usuario", accion: "Creó el expediente desde el Motor IA" },
        ],
      },
    },
  });

  return creado.id;
}

/**
 * Renombra un expediente (campo `producto`) y registra el cambio en el historial
 * de auditoría. Normaliza espacios y limita la longitud.
 */
export async function actualizarTituloExpediente(
  id: string,
  titulo: string,
): Promise<void> {
  const limpio = titulo.trim().replace(/\s+/g, " ").slice(0, 120);
  await prisma.expediente.update({
    where: { id },
    data: {
      producto: limpio,
      eventos: {
        create: {
          actor: "usuario",
          accion: `Renombró el expediente a «${limpio}»`,
        },
      },
    },
  });
}

/**
 * Guarda un DUA en un expediente: marca el documento como generado (o lo crea),
 * almacena sus datos y registra un evento de auditoría.
 */
export async function guardarDua(opts: {
  expedienteId: string;
  subtipo: string; // "importacion" | "exportacion"
  datos: unknown;
}): Promise<void> {
  const { expedienteId, subtipo, datos } = opts;
  const nombreDua = `DUA de ${subtipo === "exportacion" ? "exportación" : "importación"}`;

  const existente = await prisma.documento.findFirst({
    where: { expedienteId, nombre: { contains: "DUA" } },
  });

  if (existente) {
    await prisma.documento.update({
      where: { id: existente.id },
      data: { estado: "generado", datos: JSON.stringify(datos), nombre: nombreDua },
    });
  } else {
    await prisma.documento.create({
      data: {
        expedienteId,
        nombre: nombreDua,
        estado: "generado",
        obligatorio: true,
        datos: JSON.stringify(datos),
      },
    });
  }

  await prisma.evento.create({
    data: { expedienteId, actor: "usuario", accion: `Generó ${nombreDua}` },
  });
}

/** Devuelve los datos del DUA guardado en un expediente, si existe. */
export async function getDuaGuardado(
  expedienteId: string,
): Promise<DuaDatos | null> {
  const doc = await prisma.documento.findFirst({
    where: { expedienteId, nombre: { contains: "DUA" }, datos: { not: null } },
  });
  if (!doc?.datos) return null;
  try {
    return JSON.parse(doc.datos) as DuaDatos;
  } catch {
    return null;
  }
}

// ─── Biblioteca de soporte (documentos grandes) ───

export interface Fuente {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  archivo: string;
  url: string; // ruta pública para abrir/descargar el fichero
  mime: string;
  tamano: number;
  fecha: string;
}

export async function getFuentes(): Promise<Fuente[]> {
  const filas = await prisma.fuente.findMany({ orderBy: { createdAt: "desc" } });
  return filas.map((f) => ({
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion ?? undefined,
    categoria: f.categoria,
    archivo: f.archivo,
    url: `/biblioteca/${encodeURIComponent(f.archivo)}`,
    mime: f.mime,
    tamano: f.tamano,
    fecha: formatDateShort(f.createdAt),
  }));
}

/** Registra en la biblioteca un documento ya guardado en public/biblioteca/. */
export async function crearFuente(opts: {
  titulo: string;
  descripcion?: string;
  categoria?: string;
  archivo: string;
  mime: string;
  tamano: number;
}): Promise<string> {
  const creada = await prisma.fuente.create({
    data: {
      titulo: opts.titulo,
      descripcion: opts.descripcion,
      categoria: opts.categoria || "General",
      archivo: opts.archivo,
      mime: opts.mime,
      tamano: opts.tamano,
    },
  });
  return creada.id;
}
