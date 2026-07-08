/*
 * Definición del Certificado de Origen (modelo comunitario no preferencial, el
 * que emiten las Cámaras de Comercio). Sus casillas 1–7 certifican el ORIGEN de
 * las mercancías; la casilla 3 (país de origen) es el dato central. Como el
 * packing y la factura, se genera desde el mismo dossier canónico sin volver a
 * transcribir nada, y su cuerpo (casillas 6/7) es una tabla de líneas.
 */

/** Una línea de la casilla 6/7: marcas, bultos, descripción y cantidad. */
export interface OrigenLinea {
  marcas: string; // Marcas y numeración de los bultos
  numBultos: string; // Nº de bultos
  tipoBulto: string; // Cajas, palés, sacos…
  descripcion: string; // Naturaleza de las mercancías
  cantidad: string; // Cantidad (peso o unidades) — casilla 7
}

export interface OrigenDatos {
  numero: string; // Nº de referencia (lo asigna la Cámara; opcional al preparar)
  // Casilla 1 — Exportador
  exportadorNombre: string;
  exportadorDireccion: string;
  exportadorPais: string;
  // Casilla 2 — Destinatario
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Casilla 3 — País de origen (dato central del certificado)
  paisOrigen: string;
  // Casilla 4 — Información sobre el transporte
  transporte: string;
  // Casilla 5 — Observaciones
  observaciones: string;
  // Casilla 6/7 — Descripción de mercancías y cantidad
  lineas: OrigenLinea[];
  // Certificación / emisión
  autoridadEmisora: string; // p. ej. «Cámara de Comercio de Sevilla»
  lugarEmision: string;
  fechaEmision: string;
  solicitante: string; // quien solicita/declara ante la Cámara
}

/** Campos planos (la tabla de líneas se edita aparte). */
export interface OrigenCampoDef {
  key: Exclude<keyof OrigenDatos, "lineas">;
  casilla?: string;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea";
  placeholder?: string;
}

export const ORIGEN_CAMPOS: OrigenCampoDef[] = [
  { key: "numero", label: "Nº de referencia", seccion: "Referencia", placeholder: "lo asigna la Cámara" },

  { key: "exportadorNombre", casilla: "1", label: "Nombre exportador", seccion: "Exportador (casilla 1)", required: true },
  { key: "exportadorDireccion", casilla: "1", label: "Dirección exportador", seccion: "Exportador (casilla 1)", tipo: "textarea" },
  { key: "exportadorPais", casilla: "1", label: "País del exportador (ISO)", seccion: "Exportador (casilla 1)", placeholder: "ES" },

  { key: "destinatarioNombre", casilla: "2", label: "Nombre destinatario", seccion: "Destinatario (casilla 2)" },
  { key: "destinatarioDireccion", casilla: "2", label: "Dirección destinatario", seccion: "Destinatario (casilla 2)", tipo: "textarea", placeholder: "o «a la orden»" },

  { key: "paisOrigen", casilla: "3", label: "País de origen", seccion: "País de origen (casilla 3)", required: true, placeholder: "España / Unión Europea" },

  { key: "transporte", casilla: "4", label: "Información sobre el transporte", seccion: "Transporte y observaciones", tipo: "textarea", placeholder: "Marítimo · Algeciras → Tokyo" },
  { key: "observaciones", casilla: "5", label: "Observaciones", seccion: "Transporte y observaciones", tipo: "textarea" },

  { key: "autoridadEmisora", label: "Autoridad emisora", seccion: "Certificación", placeholder: "Cámara de Comercio de…" },
  { key: "lugarEmision", label: "Lugar de emisión", seccion: "Certificación" },
  { key: "fechaEmision", label: "Fecha de emisión", seccion: "Certificación", placeholder: "2026-06-20" },
  { key: "solicitante", label: "Solicitante / declarante", seccion: "Certificación" },
];

export const ORIGEN_SECCIONES = [
  "Referencia",
  "Exportador (casilla 1)",
  "Destinatario (casilla 2)",
  "País de origen (casilla 3)",
  "Transporte y observaciones",
  "Certificación",
];

export interface ProblemaOrigen {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida el certificado: exportador y país de origen obligatorios, ≥1 línea y coherencias suaves. */
export function validarOrigen(d: OrigenDatos): ProblemaOrigen[] {
  const problemas: ProblemaOrigen[] = [];

  for (const campo of ORIGEN_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({
        key: campo.key,
        nivel: "error",
        mensaje: `Falta «${campo.label}»${campo.casilla ? ` (casilla ${campo.casilla})` : ""}`,
      });
    }
  }

  const lineasConDato = d.lineas.filter(
    (l) => l.descripcion.trim() || l.numBultos.trim(),
  );
  if (lineasConDato.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una mercancía (casilla 6).",
    });
  }

  if (d.destinatarioNombre.trim() === "") {
    problemas.push({
      key: "destinatarioNombre",
      nivel: "aviso",
      mensaje: "Sin destinatario: indícalo o marca «a la orden» en la casilla 2.",
    });
  }

  // El origen certificado es el de fabricación, no necesariamente el del exportador.
  const pais = d.paisOrigen.trim().toLowerCase();
  const paisExp = d.exportadorPais.trim().toLowerCase();
  if (pais && paisExp && !pais.includes(paisExp) && paisExp.length <= 3) {
    problemas.push({
      key: "paisOrigen",
      nivel: "aviso",
      mensaje: `El país de origen («${d.paisOrigen}») difiere del país del exportador («${d.exportadorPais}»): confirma que es el de fabricación.`,
    });
  }

  return problemas;
}

export function origenLineaVacia(): OrigenLinea {
  return {
    marcas: "",
    numBultos: "",
    tipoBulto: "",
    descripcion: "",
    cantidad: "",
  };
}

export function origenVacio(): OrigenDatos {
  return {
    numero: "",
    exportadorNombre: "",
    exportadorDireccion: "",
    exportadorPais: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    paisOrigen: "",
    transporte: "",
    observaciones: "",
    lineas: [origenLineaVacia()],
    autoridadEmisora: "",
    lugarEmision: "",
    fechaEmision: "",
    solicitante: "",
  };
}
