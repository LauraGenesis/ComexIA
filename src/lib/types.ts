import type { Resolucion } from "./motor/schema";

export type EstadoExpediente =
  | "borrador"
  | "en_tramite"
  | "despachado"
  | "incidencia"
  | "cerrado";

export type NivelRiesgo = "bajo" | "medio" | "alto";
export type Severidad = "info" | "advertencia" | "critica";

export type EstadoDocumentoExpediente =
  | "generado"
  | "borrador"
  | "pendiente"
  | "adjuntado"
  | "firmado";

export interface DocumentoExpediente {
  id: string;
  nombre: string;
  estado: EstadoDocumentoExpediente;
  obligatorio: boolean;
  actualizado?: string;
}

export interface Alerta {
  id: string;
  severidad: Severidad;
  titulo: string;
  detalle?: string;
  expedienteId?: string;
  expedienteRef?: string;
  fecha: string;
}

export interface AccionPendiente {
  id: string;
  titulo: string;
  expedienteRef: string;
  plazo: string;
}

export interface Evento {
  id: string;
  actor: "usuario" | "IA";
  accion: string;
  fecha: string;
}

export interface Expediente {
  id: string;
  ref: string;
  producto: string;
  tipo: "importacion" | "exportacion" | "transito";
  origen: string;
  destino: string;
  hsTaric?: string;
  incoterm?: string;
  transporte?: string;
  valor?: number;
  estado: EstadoExpediente;
  riesgo: NivelRiesgo;
  confianza?: number;
  proximaAccion?: string;
  documentos: DocumentoExpediente[];
  resolucion?: Resolucion;
}
