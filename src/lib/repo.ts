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

/*
 * Capa de acceso a datos: punto de entrada único para las pantallas y las API.
 * Despacha a la implementación real (Prisma/SQLite, repo.prisma.ts) o a la de
 * modo demo en memoria (repo.demo.ts) según DEMO_MODE. El import es dinámico
 * para que en modo demo NUNCA se cargue el cliente Prisma (despliegue
 * serverless sin base de datos).
 */

export type { KpisDashboard, Fuente } from "./repo.prisma";

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
