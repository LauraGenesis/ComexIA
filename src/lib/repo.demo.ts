import "server-only";
import { formatDateShort } from "./utils";
import type { Resolucion } from "./motor/schema";
import type { DuaDatos } from "./documentos/dua";
import type { KpisDashboard, Fuente } from "./repo.prisma";
import {
  partesDocumento,
  normalizarOrigen,
  type OrigenDocumento,
  type DocumentoGeneradoResumen,
  type DocumentoGeneradoDetalle,
} from "./documentos/historial";
import {
  expedientes as seedExpedientes,
  alertas as seedAlertas,
} from "./data";
import type {
  Alerta,
  AccionPendiente,
  Evento,
  Expediente,
  NivelRiesgo,
} from "./types";

/*
 * Implementación EN MEMORIA de la capa de datos (modo demo, sin Prisma/SQLite).
 * Misma API pública que repo.prisma.ts: repo.ts despacha a una u otra según
 * DEMO_MODE. Las lecturas parten de los datos semilla (src/lib/data.ts); las
 * escrituras mutan estos arrays en memoria y NO persisten entre invocaciones
 * serverless (cada cold start vuelve al estado semilla). Es el comportamiento
 * esperado de una demo pública.
 */

// Copias mutables de la semilla para no tocar los arrays exportados por data.ts.
const expedientes: Expediente[] = seedExpedientes.map((e) => ({
  ...e,
  documentos: e.documentos.map((d) => ({ ...d })),
}));
const alertas: Alerta[] = seedAlertas.map((a) => ({ ...a }));

// Historial de eventos por expediente (la semilla no trae eventos: sembramos
// un par genéricos para que la pestaña Historial no aparezca vacía).
const eventos = new Map<string, Evento[]>();
for (const e of expedientes) {
  eventos.set(e.id, [
    {
      id: `${e.id}-ev2`,
      actor: "IA",
      accion: `Resolución inicial (confianza ${Math.round((e.confianza ?? 0.8) * 100)}%)`,
      fecha: "hace 2 días",
    },
    {
      id: `${e.id}-ev1`,
      actor: "usuario",
      accion: "Creó el expediente",
      fecha: "hace 2 días",
    },
  ]);
}

// DUAs guardados en sesión (expedienteId → datos).
const duas = new Map<string, DuaDatos>();
// Biblioteca de soporte en memoria.
const fuentes: Fuente[] = [];

// Historial de documentos generados (independiente de expedientes).
interface DocGenDemo {
  id: string;
  tipo: string;
  subtipo?: string;
  titulo: string;
  origen: OrigenDocumento;
  datos: unknown;
  fecha: string;
}
const documentosGenerados: DocGenDemo[] = [];

let contador = expedientes.length;

function registrarEvento(expedienteId: string, actor: "usuario" | "IA", accion: string) {
  const lista = eventos.get(expedienteId) ?? [];
  lista.unshift({
    id: `${expedienteId}-ev${lista.length + 1}-${contador}`,
    actor,
    accion,
    fecha: "ahora",
  });
  eventos.set(expedienteId, lista);
}

export async function getExpedientes(): Promise<Expediente[]> {
  return expedientes;
}

export async function getExpedienteById(id: string): Promise<Expediente | null> {
  return expedientes.find((e) => e.id === id) ?? null;
}

export async function getAlertas(): Promise<Alerta[]> {
  // Igual que la versión Prisma: excluye alertas de expedientes en "borrador".
  const borradores = new Set(
    expedientes.filter((e) => e.estado === "borrador").map((e) => e.id),
  );
  return alertas.filter((a) => !a.expedienteId || !borradores.has(a.expedienteId));
}

export async function getEventos(expedienteId: string): Promise<Evento[]> {
  return eventos.get(expedienteId) ?? [];
}

export async function getAccionesPendientes(): Promise<AccionPendiente[]> {
  return expedientes
    .filter((e) => e.estado !== "cerrado" && e.proximaAccion)
    .slice(0, 8)
    .map((e) => ({
      id: e.id,
      titulo: e.proximaAccion ?? "",
      expedienteRef: e.producto,
      plazo: "—",
    }));
}

export async function getKpis(): Promise<KpisDashboard> {
  const activos = expedientes.filter((e) => e.estado !== "cerrado");
  const documentosPendientes = expedientes
    .flatMap((e) => e.documentos)
    .filter((d) => d.estado === "pendiente").length;
  const alertasVisibles = await getAlertas();
  const alertasCriticas = alertasVisibles.filter((a) => a.severidad === "critica").length;

  const peso: Record<string, number> = { bajo: 1, medio: 2, alto: 3 };
  const media =
    activos.length === 0
      ? 0
      : activos.reduce((s, e) => s + (peso[e.riesgo] ?? 2), 0) / activos.length;
  const riesgoCartera: NivelRiesgo = media >= 2.5 ? "alto" : media >= 1.5 ? "medio" : "bajo";

  return {
    expedientesActivos: activos.length,
    documentosPendientes,
    alertasCriticas,
    riesgoCartera,
  };
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

function generarRef(): string {
  const n = ++contador;
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
  const id = `exp-demo-${contador + 1}`;
  const nuevo: Expediente = {
    id,
    ref: generarRef(),
    producto: tituloDesde(texto, resolucion),
    tipo: detectarTipo(texto + " " + resolucion.resumen),
    origen: "",
    destino: "",
    estado: "borrador",
    riesgo: riesgoGlobal(resolucion),
    confianza: resolucion.confianza,
    proximaAccion: resolucion.pasos[0] ?? "Revisar requisitos",
    documentos: resolucion.documentacion.map((d, i) => ({
      id: `${id}-d${i + 1}`,
      nombre: d.doc,
      estado: "pendiente",
      obligatorio: d.estado === "obligatorio",
    })),
    resolucion,
  };
  expedientes.unshift(nuevo);

  for (const a of resolucion.alertas) {
    alertas.unshift({
      id: `${id}-a${alertas.length + 1}`,
      severidad: a.severidad as Alerta["severidad"],
      titulo: a.mensaje,
      expedienteId: id,
      expedienteRef: nuevo.ref,
      fecha: "ahora",
    });
  }

  eventos.set(id, [
    {
      id: `${id}-ev2`,
      actor: "usuario",
      accion: "Creó el expediente desde el Motor IA",
      fecha: "ahora",
    },
    {
      id: `${id}-ev1`,
      actor: "IA",
      accion: `Resolución inicial (confianza ${Math.round(resolucion.confianza * 100)}%)`,
      fecha: "ahora",
    },
  ]);

  return id;
}

export async function actualizarTituloExpediente(id: string, titulo: string): Promise<void> {
  const limpio = titulo.trim().replace(/\s+/g, " ").slice(0, 120);
  const exp = expedientes.find((e) => e.id === id);
  if (!exp) return;
  exp.producto = limpio;
  registrarEvento(id, "usuario", `Renombró el expediente a «${limpio}»`);
}

export async function eliminarExpediente(id: string): Promise<void> {
  const i = expedientes.findIndex((e) => e.id === id);
  if (i === -1) return;
  expedientes.splice(i, 1);
  // Limpia datos asociados (equivalente al onDelete: Cascade de Prisma).
  eventos.delete(id);
  duas.delete(id);
  for (let j = alertas.length - 1; j >= 0; j--) {
    if (alertas[j].expedienteId === id) alertas.splice(j, 1);
  }
}

export async function guardarDua(opts: {
  expedienteId: string;
  subtipo: string;
  datos: unknown;
}): Promise<void> {
  const { expedienteId, subtipo, datos } = opts;
  const nombreDua = `DUA de ${subtipo === "exportacion" ? "exportación" : "importación"}`;
  const exp = expedientes.find((e) => e.id === expedienteId);
  if (exp) {
    const doc = exp.documentos.find((d) => d.nombre.includes("DUA"));
    if (doc) {
      doc.estado = "generado";
      doc.nombre = nombreDua;
      doc.actualizado = formatDateShort(new Date());
    } else {
      exp.documentos.push({
        id: `${expedienteId}-dua`,
        nombre: nombreDua,
        estado: "generado",
        obligatorio: true,
        actualizado: formatDateShort(new Date()),
      });
    }
  }
  duas.set(expedienteId, datos as DuaDatos);
  registrarEvento(expedienteId, "usuario", `Generó ${nombreDua}`);
}

export async function getDuaGuardado(expedienteId: string): Promise<DuaDatos | null> {
  return duas.get(expedienteId) ?? null;
}

// ─── Historial de documentos generados (independiente de expedientes) ───

export async function guardarDocumentoGenerado(opts: {
  id?: string;
  tipo: string;
  subtipo?: string;
  titulo: string;
  origen: string;
  datos: unknown;
}): Promise<string> {
  const origen = normalizarOrigen(opts.origen);
  const existente = opts.id
    ? documentosGenerados.find((d) => d.id === opts.id)
    : undefined;

  if (existente) {
    existente.tipo = opts.tipo;
    existente.subtipo = opts.subtipo;
    existente.titulo = opts.titulo;
    existente.origen = origen;
    existente.datos = opts.datos;
    existente.fecha = formatDateShort(new Date());
    return existente.id;
  }

  const id = `docgen-demo-${documentosGenerados.length + 1}-${contador}`;
  documentosGenerados.unshift({
    id,
    tipo: opts.tipo,
    subtipo: opts.subtipo,
    titulo: opts.titulo,
    origen,
    datos: opts.datos,
    fecha: formatDateShort(new Date()),
  });
  return id;
}

export async function getDocumentosGenerados(): Promise<
  DocumentoGeneradoResumen[]
> {
  return documentosGenerados.map((d) => ({
    id: d.id,
    tipo: d.tipo,
    subtipo: d.subtipo,
    titulo: d.titulo,
    origen: d.origen,
    fecha: d.fecha,
    ...partesDocumento(d.tipo, JSON.stringify(d.datos)),
  }));
}

export async function getDocumentoGeneradoById(
  id: string,
): Promise<DocumentoGeneradoDetalle | null> {
  const d = documentosGenerados.find((x) => x.id === id);
  return d ? { tipo: d.tipo, subtipo: d.subtipo, datos: d.datos } : null;
}

export async function eliminarDocumentoGenerado(id: string): Promise<void> {
  const i = documentosGenerados.findIndex((d) => d.id === id);
  if (i !== -1) documentosGenerados.splice(i, 1);
}

// ─── Biblioteca de soporte ───

export async function getFuentes(): Promise<Fuente[]> {
  return fuentes;
}

export async function crearFuente(opts: {
  titulo: string;
  descripcion?: string;
  categoria?: string;
  archivo: string;
  mime: string;
  tamano: number;
}): Promise<string> {
  const id = `fuente-demo-${fuentes.length + 1}`;
  fuentes.unshift({
    id,
    titulo: opts.titulo,
    descripcion: opts.descripcion,
    categoria: opts.categoria || "General",
    archivo: opts.archivo,
    url: `/biblioteca/${encodeURIComponent(opts.archivo)}`,
    mime: opts.mime,
    tamano: opts.tamano,
    fecha: formatDateShort(new Date()),
  });
  return id;
}
