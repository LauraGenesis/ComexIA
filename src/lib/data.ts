import type { Alerta, AccionPendiente, Expediente } from "./types";

/*
 * Datos simulados en memoria para alimentar las pantallas mientras la
 * persistencia (Prisma/SQLite) y el motor real (Claude) se conectan.
 * La forma de los datos es la definitiva (ver src/lib/types.ts).
 */

export const expedientes: Expediente[] = [
  {
    id: "exp-2206-04",
    ref: "#2206-04",
    producto: "Sésamo",
    tipo: "importacion",
    origen: "IN",
    destino: "ES",
    hsTaric: "1207.40.90",
    incoterm: "CFR",
    transporte: "Marítimo",
    valor: 50000,
    estado: "en_tramite",
    riesgo: "alto",
    confianza: 0.82,
    proximaAccion: "Adjuntar analítica de aflatoxinas",
    documentos: [
      { id: "d1", nombre: "Factura comercial", estado: "generado", obligatorio: true, actualizado: "24 jun" },
      { id: "d2", nombre: "Packing list", estado: "generado", obligatorio: true, actualizado: "24 jun" },
      { id: "d3", nombre: "DV1", estado: "generado", obligatorio: true, actualizado: "24 jun" },
      { id: "d4", nombre: "DUA de importación", estado: "borrador", obligatorio: true, actualizado: "hoy" },
      { id: "d5", nombre: "Certificado fitosanitario", estado: "pendiente", obligatorio: true },
      { id: "d6", nombre: "Certificado de origen", estado: "pendiente", obligatorio: false },
    ],
  },
  {
    id: "exp-2204-02",
    ref: "#2204-02",
    producto: "Calzado de piel",
    tipo: "exportacion",
    origen: "ES",
    destino: "JP",
    hsTaric: "6403.59",
    incoterm: "CPT",
    transporte: "Marítimo",
    valor: 195000,
    estado: "borrador",
    riesgo: "bajo",
    confianza: 0.9,
    proximaAccion: "Generar DUA de exportación",
    documentos: [
      { id: "d1", nombre: "Factura comercial", estado: "generado", obligatorio: true, actualizado: "20 jun" },
      { id: "d2", nombre: "Packing list", estado: "generado", obligatorio: true, actualizado: "20 jun" },
      { id: "d3", nombre: "DUA de exportación", estado: "pendiente", obligatorio: true },
      { id: "d4", nombre: "Certificado de origen", estado: "pendiente", obligatorio: false },
    ],
  },
  {
    id: "exp-2210-15",
    ref: "#2210-15",
    producto: "Lámparas de mesa",
    tipo: "importacion",
    origen: "CN",
    destino: "ES",
    hsTaric: "9405.20",
    incoterm: "FOB",
    transporte: "Marítimo",
    valor: 32000,
    estado: "despachado",
    riesgo: "medio",
    confianza: 0.78,
    proximaAccion: "Cerrar expediente",
    documentos: [
      { id: "d1", nombre: "Factura comercial", estado: "generado", obligatorio: true, actualizado: "10 jun" },
      { id: "d2", nombre: "DUA de importación", estado: "generado", obligatorio: true, actualizado: "12 jun" },
      { id: "d3", nombre: "DV1", estado: "generado", obligatorio: true, actualizado: "12 jun" },
    ],
  },
  {
    id: "exp-2211-07",
    ref: "#2211-07",
    producto: "Repuestos industriales",
    tipo: "transito",
    origen: "DE",
    destino: "PT",
    hsTaric: "8487.90",
    incoterm: "DAP",
    transporte: "Carretera",
    valor: 78000,
    estado: "incidencia",
    riesgo: "alto",
    confianza: 0.6,
    proximaAccion: "Revisar incidencia T1",
    documentos: [
      { id: "d1", nombre: "Documento T1", estado: "borrador", obligatorio: true, actualizado: "hoy" },
      { id: "d2", nombre: "CMR", estado: "generado", obligatorio: true, actualizado: "ayer" },
    ],
  },
];

export const alertas: Alerta[] = [
  {
    id: "a1",
    severidad: "critica",
    titulo: "Control reforzado vigente",
    detalle: "Sésamo IN→ES · adjunta analítica de aflatoxinas.",
    expedienteId: "exp-2206-04",
    expedienteRef: "#2206-04",
    fecha: "hoy",
  },
  {
    id: "a2",
    severidad: "advertencia",
    titulo: "Documentación incompleta",
    detalle: "Calzado ES→JP · falta DUA de exportación.",
    expedienteId: "exp-2204-02",
    expedienteRef: "#2204-02",
    fecha: "hoy",
  },
  {
    id: "a3",
    severidad: "info",
    titulo: "Cambio normativo",
    detalle: "Afecta a importaciones desde China.",
    expedienteId: "exp-2210-15",
    expedienteRef: "#2210-15",
    fecha: "20 jun",
  },
];

export const accionesPendientes: AccionPendiente[] = [
  { id: "ac1", titulo: "Adjuntar analítica de aflatoxinas", expedienteRef: "Sésamo", plazo: "hoy" },
  { id: "ac2", titulo: "Generar DUA de exportación", expedienteRef: "Calzado", plazo: "2 días" },
  { id: "ac3", titulo: "Revisar incidencia T1", expedienteRef: "Repuestos", plazo: "hoy" },
  { id: "ac4", titulo: "Cerrar expediente", expedienteRef: "Lámparas", plazo: "—" },
];

export function getExpediente(id: string) {
  return expedientes.find((e) => e.id === id);
}
