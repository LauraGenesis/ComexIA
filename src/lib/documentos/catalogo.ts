/*
 * Catálogo de documentos. Abierto y ampliable: cada entrada es una definición.
 * Hoy el DUA está implementado; el resto se irá añadiendo igual.
 */

export interface DocumentoCatalogo {
  id: string;
  nombre: string;
  categoria: string;
  href?: string; // ruta del generador si está disponible
  disponible: boolean;
}

export const CATALOGO: DocumentoCatalogo[] = [
  { id: "dua-import", nombre: "DUA de importación", categoria: "Aduaneros", href: "/app/documentos/dua?tipo=importacion", disponible: true },
  { id: "dua-export", nombre: "DUA de exportación", categoria: "Aduaneros", href: "/app/documentos/dua?tipo=exportacion", disponible: true },
  { id: "factura", nombre: "Factura comercial", categoria: "Comerciales", disponible: false },
  { id: "packing", nombre: "Packing list", categoria: "Comerciales", disponible: false },
  { id: "dv1", nombre: "DV1 (valor en aduana)", categoria: "Aduaneros", disponible: false },
  { id: "origen", nombre: "Certificado de origen", categoria: "Origen", disponible: false },
  { id: "fitosanitario", nombre: "Certificado fitosanitario", categoria: "Sanitarios", disponible: false },
  { id: "dgd", nombre: "Declaración de mercancías peligrosas (DGD)", categoria: "Peligrosas", disponible: false },
  { id: "bl", nombre: "Bill of Lading (B/L)", categoria: "Transporte", disponible: false },
  { id: "cmr", nombre: "CMR", categoria: "Transporte", disponible: false },
  { id: "t1", nombre: "Tránsito T1 / T2", categoria: "Tránsito", disponible: false },
];
