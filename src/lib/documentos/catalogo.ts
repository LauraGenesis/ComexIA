/*
 * Catálogo de documentos. Abierto y ampliable: cada entrada es una definición.
 * Todos los tipos listados están implementados con su generador; añadir uno
 * nuevo es añadir su definición, su editor/preview/página y su mapeo desde el
 * dossier canónico, sin tocar el motor ni la app.
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
  { id: "factura", nombre: "Factura comercial", categoria: "Comerciales", href: "/app/documentos/factura", disponible: true },
  { id: "packing", nombre: "Packing list", categoria: "Comerciales", href: "/app/documentos/packing", disponible: true },
  { id: "dv1", nombre: "DV1 (valor en aduana)", categoria: "Aduaneros", href: "/app/documentos/dv1", disponible: true },
  { id: "origen", nombre: "Certificado de origen", categoria: "Origen", href: "/app/documentos/origen", disponible: true },
  { id: "fitosanitario", nombre: "Certificado fitosanitario", categoria: "Sanitarios", href: "/app/documentos/fitosanitario", disponible: true },
  { id: "dgd", nombre: "Declaración de mercancías peligrosas (DGD)", categoria: "Peligrosas", href: "/app/documentos/dgd", disponible: true },
  { id: "bl", nombre: "Bill of Lading (B/L)", categoria: "Transporte", href: "/app/documentos/bl", disponible: true },
  { id: "cmr", nombre: "CMR", categoria: "Transporte", href: "/app/documentos/cmr", disponible: true },
  { id: "t1", nombre: "Tránsito T1 / T2", categoria: "Tránsito", href: "/app/documentos/transito", disponible: true },
];
