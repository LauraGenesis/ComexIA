/*
 * Definición del Certificado Fitosanitario (modelo NIMF nº 12 de la CIPF/FAO;
 * en la UE, Reg. 2016/2031 y Reg. de Ejecución 2017/2313).
 *
 * IMPORTANTE — a diferencia del DUA, factura, packing y certificado de origen,
 * este documento NO lo emite el operador: lo expide la Organización Nacional de
 * Protección Fitosanitaria (en España, Sanidad Vegetal del MAPA/CCAA) tras una
 * inspección oficial, con número, sello y firma del funcionario. Aquí solo se
 * PRE-CUMPLIMENTA un BORRADOR del modelo oficial para agilizar la solicitud; no
 * tiene validez hasta su emisión oficial (ver `FITO_AVISO_BORRADOR`).
 *
 * Su cuerpo (casilla de descripción del envío) es una tabla de líneas; el
 * "nombre botánico" es un dato propio y clave de este certificado.
 */

/** Aviso legal que acompaña siempre al borrador, también en el PDF. */
export const FITO_AVISO_BORRADOR =
  "BORRADOR — no válido sin emisión oficial de Sanidad Vegetal (ONPF).";

/** Una línea de la descripción del envío. */
export interface FitoLinea {
  marcasBultos: string; // Marcas de distinción; número y descripción de bultos
  nombreProducto: string; // Nombre del producto
  nombreBotanico: string; // Nombre botánico de las plantas (clave)
  cantidad: string; // Cantidad declarada (peso o unidades)
}

export interface FitoDatos {
  numero: string; // Nº de certificado (lo asigna la ONPF; opcional en borrador)
  // Casilla 1 — Exportador
  exportadorNombre: string;
  exportadorDireccion: string;
  // Casilla 2 — ONPF de origen → ONPF(s) de destino
  onpfOrigen: string;
  onpfDestino: string;
  // Casilla 3 — Destinatario
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Casilla 4 — Descripción del envío (cabecera)
  lugarOrigen: string;
  medioTransporte: string;
  puntoEntrada: string;
  // Descripción del envío (cuerpo)
  lineas: FitoLinea[];
  // Declaración adicional
  declaracionAdicional: string;
  // Tratamiento de desinfestación / desinfección
  tratFecha: string;
  tratTratamiento: string;
  tratProducto: string; // producto químico (ingrediente activo)
  tratConcentracion: string;
  tratDuracionTemp: string; // duración y temperatura
  tratInfoAdicional: string;
  // Emisión (la cumplimenta la autoridad; en borrador queda en blanco/tentativo)
  lugarEmision: string;
  fechaEmision: string;
  funcionario: string; // nombre del funcionario autorizado
}

/** Campos planos (la tabla de líneas se edita aparte). */
export interface FitoCampoDef {
  key: Exclude<keyof FitoDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea";
  placeholder?: string;
}

export const FITO_CAMPOS: FitoCampoDef[] = [
  { key: "numero", label: "Nº de certificado", seccion: "Referencia", placeholder: "lo asigna la ONPF" },

  { key: "exportadorNombre", label: "Nombre exportador", seccion: "Exportador (casilla 1)", required: true },
  { key: "exportadorDireccion", label: "Dirección exportador", seccion: "Exportador (casilla 1)", tipo: "textarea" },

  { key: "onpfOrigen", label: "ONPF de origen", seccion: "Organizaciones fitosanitarias (casilla 2)", required: true, placeholder: "España — MAPA / Sanidad Vegetal" },
  { key: "onpfDestino", label: "ONPF(s) de destino", seccion: "Organizaciones fitosanitarias (casilla 2)", required: true, placeholder: "Japón" },

  { key: "destinatarioNombre", label: "Nombre destinatario", seccion: "Destinatario (casilla 3)" },
  { key: "destinatarioDireccion", label: "Dirección destinatario", seccion: "Destinatario (casilla 3)", tipo: "textarea" },

  { key: "lugarOrigen", label: "Lugar de origen", seccion: "Descripción del envío (casilla 4)", placeholder: "España, Andalucía" },
  { key: "medioTransporte", label: "Medios de transporte declarados", seccion: "Descripción del envío (casilla 4)", placeholder: "Marítimo — buque" },
  { key: "puntoEntrada", label: "Punto de entrada declarado", seccion: "Descripción del envío (casilla 4)", placeholder: "Puerto de Tokyo" },

  { key: "declaracionAdicional", label: "Declaración adicional", seccion: "Declaración adicional", tipo: "textarea", placeholder: "Requisitos específicos del país importador…" },

  { key: "tratTratamiento", label: "Tratamiento", seccion: "Tratamiento", placeholder: "Fumigación / HT (tratamiento térmico)…" },
  { key: "tratProducto", label: "Producto químico (ingrediente activo)", seccion: "Tratamiento", placeholder: "Bromuro de metilo…" },
  { key: "tratConcentracion", label: "Concentración", seccion: "Tratamiento" },
  { key: "tratDuracionTemp", label: "Duración y temperatura", seccion: "Tratamiento" },
  { key: "tratFecha", label: "Fecha del tratamiento", seccion: "Tratamiento" },
  { key: "tratInfoAdicional", label: "Información adicional", seccion: "Tratamiento", tipo: "textarea" },

  { key: "lugarEmision", label: "Lugar de expedición", seccion: "Emisión (la completa la ONPF)" },
  { key: "fechaEmision", label: "Fecha", seccion: "Emisión (la completa la ONPF)" },
  { key: "funcionario", label: "Funcionario autorizado", seccion: "Emisión (la completa la ONPF)" },
];

export const FITO_SECCIONES = [
  "Referencia",
  "Exportador (casilla 1)",
  "Organizaciones fitosanitarias (casilla 2)",
  "Destinatario (casilla 3)",
  "Descripción del envío (casilla 4)",
  "Declaración adicional",
  "Tratamiento",
  "Emisión (la completa la ONPF)",
];

/** Texto de certificación fijo del modelo NIMF 12. */
export const FITO_CERTIFICACION =
  "Por la presente se certifica que las plantas, productos vegetales u otros " +
  "artículos reglamentados descritos aquí se han inspeccionado y/o sometido a " +
  "ensayo de acuerdo con los procedimientos oficiales apropiados y se consideran " +
  "libres de las plagas cuarentenarias especificadas por la parte contratante " +
  "importadora y que se ajustan a los requisitos fitosanitarios vigentes de la " +
  "parte contratante importadora, incluidos los relativos a las plagas no " +
  "cuarentenarias reglamentadas.";

export interface ProblemaFito {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida el borrador: campos obligatorios, ≥1 mercancía y avisos propios del fitosanitario. */
export function validarFito(d: FitoDatos): ProblemaFito[] {
  const problemas: ProblemaFito[] = [];

  for (const campo of FITO_CAMPOS) {
    if (!campo.required) continue;
    if (d[campo.key].trim() === "") {
      problemas.push({
        key: campo.key,
        nivel: "error",
        mensaje: `Falta «${campo.label}»`,
      });
    }
  }

  const lineasConDato = d.lineas.filter(
    (l) => l.nombreProducto.trim() || l.nombreBotanico.trim() || l.marcasBultos.trim(),
  );
  if (lineasConDato.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una mercancía a la descripción del envío.",
    });
  }

  // El nombre botánico es un requisito distintivo del certificado fitosanitario.
  const faltaBotanico = d.lineas.some(
    (l) => (l.nombreProducto.trim() || l.marcasBultos.trim()) && !l.nombreBotanico.trim(),
  );
  if (faltaBotanico) {
    problemas.push({
      key: "nombreBotanico",
      nivel: "aviso",
      mensaje: "Falta el nombre botánico (género y especie) en alguna mercancía: es obligatorio en el certificado.",
    });
  }

  // El destinatario debería constar aunque no sea estrictamente obligatorio.
  if (d.destinatarioNombre.trim() === "") {
    problemas.push({
      key: "destinatarioNombre",
      nivel: "aviso",
      mensaje: "Indica el destinatario declarado (casilla 3).",
    });
  }

  return problemas;
}

export function fitoLineaVacia(): FitoLinea {
  return {
    marcasBultos: "",
    nombreProducto: "",
    nombreBotanico: "",
    cantidad: "",
  };
}

export function fitoVacio(): FitoDatos {
  return {
    numero: "",
    exportadorNombre: "",
    exportadorDireccion: "",
    onpfOrigen: "",
    onpfDestino: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    lugarOrigen: "",
    medioTransporte: "",
    puntoEntrada: "",
    lineas: [fitoLineaVacia()],
    declaracionAdicional: "",
    tratFecha: "",
    tratTratamiento: "",
    tratProducto: "",
    tratConcentracion: "",
    tratDuracionTemp: "",
    tratInfoAdicional: "",
    lugarEmision: "",
    fechaEmision: "",
    funcionario: "",
  };
}
