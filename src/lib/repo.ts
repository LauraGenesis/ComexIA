import "server-only";
import { DEMO_MODE } from "./demo";
import type { Resolucion } from "./motor/schema";
import type { DuaDatos } from "./documentos/dua";
import type {
  Alerta,
  AccionPendiente,
  Evento,
  Expediente,
} from "./types";
import type { KpisDashboard, Fuente } from "./repo.prisma";
import type {
  DocumentoGeneradoResumen,
  DocumentoGeneradoDetalle,
} from "./documentos/historial";

/*
 * Capa de acceso a datos: punto de entrada único para las pantallas y las API.
 * Despacha a la implementación real (Prisma/SQLite, repo.prisma.ts) o a la de
 * modo demo en memoria (repo.demo.ts) según DEMO_MODE. El import es dinámico
 * para que en modo demo NUNCA se cargue el cliente Prisma (despliegue
 * serverless sin base de datos).
 */

export type { KpisDashboard, Fuente } from "./repo.prisma";
export type {
  DocumentoGeneradoResumen,
  DocumentoGeneradoDetalle,
  OrigenDocumento,
} from "./documentos/historial";

async function impl() {
  return DEMO_MODE ? import("./repo.demo") : import("./repo.prisma");
}

export async function getExpedientes(): Promise<Expediente[]> {
  return (await impl()).getExpedientes();
}

export async function getExpedienteById(id: string): Promise<Expediente | null> {
  return (await impl()).getExpedienteById(id);
}

export async function getAlertas(): Promise<Alerta[]> {
  return (await impl()).getAlertas();
}

export async function getEventos(expedienteId: string): Promise<Evento[]> {
  return (await impl()).getEventos(expedienteId);
}

export async function getAccionesPendientes(): Promise<AccionPendiente[]> {
  return (await impl()).getAccionesPendientes();
}

export async function getKpis(): Promise<KpisDashboard> {
  return (await impl()).getKpis();
}

export async function crearExpedienteDesdeResolucion(opts: {
  texto: string;
  resolucion: Resolucion;
}): Promise<string> {
  return (await impl()).crearExpedienteDesdeResolucion(opts);
}

export async function actualizarTituloExpediente(
  id: string,
  titulo: string,
): Promise<void> {
  return (await impl()).actualizarTituloExpediente(id, titulo);
}

export async function eliminarExpediente(id: string): Promise<void> {
  return (await impl()).eliminarExpediente(id);
}

export async function guardarDua(opts: {
  expedienteId: string;
  subtipo: string;
  datos: unknown;
}): Promise<void> {
  return (await impl()).guardarDua(opts);
}

export async function getDuaGuardado(
  expedienteId: string,
): Promise<DuaDatos | null> {
  return (await impl()).getDuaGuardado(expedienteId);
}

export async function getFuentes(): Promise<Fuente[]> {
  return (await impl()).getFuentes();
}

export async function guardarDocumentoGenerado(opts: {
  id?: string;
  tipo: string;
  subtipo?: string;
  titulo: string;
  origen: string;
  datos: unknown;
}): Promise<string> {
  return (await impl()).guardarDocumentoGenerado(opts);
}

export async function getDocumentosGenerados(): Promise<
  DocumentoGeneradoResumen[]
> {
  return (await impl()).getDocumentosGenerados();
}

export async function getDocumentoGeneradoById(
  id: string,
): Promise<DocumentoGeneradoDetalle | null> {
  return (await impl()).getDocumentoGeneradoById(id);
}

export async function eliminarDocumentoGenerado(id: string): Promise<void> {
  return (await impl()).eliminarDocumentoGenerado(id);
}

/**
 * Reglas de la base de conocimiento para el buscador de Normativa. El motor de
 * reglas (motor/reglas.ts) ya despacha demo/Prisma internamente; el import es
 * dinámico para que las pantallas que no consultan normativa no lo carguen.
 */
export async function getReglas() {
  return (await import("./motor/reglas")).getReglas();
}

export type { ReglaNormativa } from "./motor/reglas";

export async function crearFuente(opts: {
  titulo: string;
  descripcion?: string;
  categoria?: string;
  archivo: string;
  mime: string;
  tamano: number;
}): Promise<string> {
  return (await impl()).crearFuente(opts);
}
