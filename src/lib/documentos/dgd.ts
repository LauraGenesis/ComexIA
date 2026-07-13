/*
 * Definición de la Declaración de Mercancías Peligrosas (DGD — Dangerous Goods
 * Declaration), modelo del Formulario Multimodal para Mercancías Peligrosas de
 * la OMI (recogido en el Código IMDG, en línea con ADR carretera e IATA aéreo).
 *
 * La FIRMA la aporta el expedidor (consignor): es él quien declara y responde de
 * que la mercancía está correctamente clasificada, embalada, marcada, etiquetada
 * y en condiciones de ser transportada. A diferencia del certificado
 * fitosanitario, no interviene una autoridad; por eso no es un "borrador".
 *
 * Su cuerpo es una TABLA de líneas de mercancía peligrosa, cuyos datos núcleo
 * (Nº ONU, designación oficial de transporte, clase y grupo de embalaje) son
 * propios de este documento y los avisa la validación si faltan.
 */

/** Texto de certificación fijo del Formulario Multimodal OMI (declaración del expedidor). */
export const DGD_CERTIFICACION =
  "Por la presente declaro que el contenido de esta remesa está descrito de forma " +
  "completa y exacta a continuación mediante la designación oficial de transporte, " +
  "y que está clasificado, embalado, marcado y etiquetado/rotulado, y en todos los " +
  "aspectos en las condiciones adecuadas para su transporte, de conformidad con las " +
  "reglamentaciones internacionales y nacionales aplicables.";

/** Una línea de mercancía peligrosa de la declaración. */
export interface DgdLinea {
  unNumber: string; // Nº ONU (p. ej. UN1263)
  designacionOficial: string; // Designación oficial de transporte (proper shipping name)
  clase: string; // Clase o división de peligro (p. ej. 3)
  riesgoSecundario: string; // Riesgo(s) secundario(s)
  grupoEmbalaje: string; // Grupo de embalaje (I, II, III)
  numBultos: string; // Número y tipo de bultos
  cantidad: string; // Cantidad / masa neta
  pesoBruto: string; // Masa bruta (kg)
  puntoInflamacion: string; // Punto de inflamación (°C), si aplica (clase 3)
  contaminanteMarino: string; // Contaminante marino (Sí / —)
  ems: string; // EmS (ficha de emergencia IMDG, p. ej. F-E S-E)
}

export interface DgdDatos {
  // Referencia
  numero: string; // Nº de la declaración / referencia del transportista
  reserva: string; // Nº de reserva / booking
  // Expedidor (consignor / shipper)
  expedidorNombre: string;
  expedidorDireccion: string;
  // Destinatario (consignee)
  destinatarioNombre: string;
  destinatarioDireccion: string;
  // Transporte
  transportista: string; // Transportista (carrier)
  buqueVehiculo: string; // Buque / vuelo / vehículo
  numeroViaje: string; // Nº de viaje / vuelo
  puertoCarga: string; // Puerto / lugar de carga
  puertoDescarga: string; // Puerto / lugar de descarga
  destino: string; // Destino
  // Cuerpo
  lineas: DgdLinea[];
  // Instrucciones y datos adicionales
  infoAdicional: string; // Información adicional / instrucciones de emergencia
  // Declaración del expedidor
  lugarFecha: string; // Lugar y fecha
  firmante: string; // Nombre y cargo del firmante
  firma: string; // Firma
}

/** Campos planos (la tabla de líneas se edita aparte). */
export interface DgdCampoDef {
  key: Exclude<keyof DgdDatos, "lineas">;
  label: string;
  seccion: string;
  required?: boolean;
  tipo?: "texto" | "textarea";
  placeholder?: string;
}

export const DGD_CAMPOS: DgdCampoDef[] = [
  { key: "numero", label: "Nº de la declaración", seccion: "Referencia", placeholder: "DGD-2026-0142" },
  { key: "reserva", label: "Nº de reserva / booking", seccion: "Referencia" },

  { key: "expedidorNombre", label: "Nombre expedidor", seccion: "Expedidor (consignor)", required: true },
  { key: "expedidorDireccion", label: "Dirección expedidor", seccion: "Expedidor (consignor)", tipo: "textarea" },

  { key: "destinatarioNombre", label: "Nombre destinatario", seccion: "Destinatario (consignee)", required: true },
  { key: "destinatarioDireccion", label: "Dirección destinatario", seccion: "Destinatario (consignee)", tipo: "textarea" },

  { key: "transportista", label: "Transportista (carrier)", seccion: "Transporte" },
  { key: "buqueVehiculo", label: "Buque / vuelo / vehículo", seccion: "Transporte" },
  { key: "numeroViaje", label: "Nº de viaje / vuelo", seccion: "Transporte" },
  { key: "puertoCarga", label: "Puerto / lugar de carga", seccion: "Transporte" },
  { key: "puertoDescarga", label: "Puerto / lugar de descarga", seccion: "Transporte" },
  { key: "destino", label: "Destino", seccion: "Transporte" },

  { key: "infoAdicional", label: "Información adicional / instrucciones de emergencia", seccion: "Información adicional", tipo: "textarea", placeholder: "Teléfono de emergencia 24 h, instrucciones de manipulación…" },

  { key: "lugarFecha", label: "Lugar y fecha", seccion: "Declaración del expedidor" },
  { key: "firmante", label: "Nombre y cargo del firmante", seccion: "Declaración del expedidor", required: true },
  { key: "firma", label: "Firma", seccion: "Declaración del expedidor" },
];

export const DGD_SECCIONES = [
  "Referencia",
  "Expedidor (consignor)",
  "Destinatario (consignee)",
  "Transporte",
  "Información adicional",
  "Declaración del expedidor",
];

/** Grupos de embalaje válidos del sistema ONU. */
const GRUPOS_EMBALAJE = ["I", "II", "III"];

export interface ProblemaDgd {
  key: string;
  nivel: "error" | "aviso";
  mensaje: string;
}

/** Valida la declaración: obligatorios, ≥1 mercancía y coherencia de los datos ADR/IMDG. */
export function validarDgd(d: DgdDatos): ProblemaDgd[] {
  const problemas: ProblemaDgd[] = [];

  for (const campo of DGD_CAMPOS) {
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
    (l) => l.unNumber.trim() || l.designacionOficial.trim(),
  );
  if (lineasConDato.length === 0) {
    problemas.push({
      key: "lineas",
      nivel: "error",
      mensaje: "Añade al menos una mercancía peligrosa con su Nº ONU y designación.",
    });
  }

  // El núcleo del DGD (Nº ONU, designación oficial y clase) debe constar por línea.
  d.lineas.forEach((l, i) => {
    const tieneAlgo =
      l.unNumber.trim() || l.designacionOficial.trim() || l.clase.trim();
    if (!tieneAlgo) return;
    const faltan: string[] = [];
    if (!l.unNumber.trim()) faltan.push("Nº ONU");
    if (!l.designacionOficial.trim()) faltan.push("designación oficial");
    if (!l.clase.trim()) faltan.push("clase de peligro");
    if (faltan.length) {
      problemas.push({
        key: `linea-${i}`,
        nivel: "aviso",
        mensaje: `Mercancía ${i + 1}: falta ${faltan.join(", ")}.`,
      });
    }
    // Grupo de embalaje: si se indica, debe ser I, II o III.
    const ge = l.grupoEmbalaje.trim().toUpperCase();
    if (ge && !GRUPOS_EMBALAJE.includes(ge)) {
      problemas.push({
        key: `linea-${i}-ge`,
        nivel: "aviso",
        mensaje: `Mercancía ${i + 1}: el grupo de embalaje debe ser I, II o III.`,
      });
    }
    // Clase 3 (líquidos inflamables): el punto de inflamación es exigible.
    if (l.clase.trim() === "3" && !l.puntoInflamacion.trim()) {
      problemas.push({
        key: `linea-${i}-pi`,
        nivel: "aviso",
        mensaje: `Mercancía ${i + 1}: indica el punto de inflamación (clase 3).`,
      });
    }
  });

  return problemas;
}

export function dgdLineaVacia(): DgdLinea {
  return {
    unNumber: "",
    designacionOficial: "",
    clase: "",
    riesgoSecundario: "",
    grupoEmbalaje: "",
    numBultos: "",
    cantidad: "",
    pesoBruto: "",
    puntoInflamacion: "",
    contaminanteMarino: "",
    ems: "",
  };
}

export function dgdVacio(): DgdDatos {
  return {
    numero: "",
    reserva: "",
    expedidorNombre: "",
    expedidorDireccion: "",
    destinatarioNombre: "",
    destinatarioDireccion: "",
    transportista: "",
    buqueVehiculo: "",
    numeroViaje: "",
    puertoCarga: "",
    puertoDescarga: "",
    destino: "",
    lineas: [dgdLineaVacia()],
    infoAdicional: "",
    lugarFecha: "",
    firmante: "",
    firma: "",
  };
}
