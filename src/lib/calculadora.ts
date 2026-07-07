// Cálculo de peso volumétrico y peso facturable para presupuestos de flete.
//
// El flete casi nunca se cobra por el peso real: se cobra por el "peso
// facturable" (chargeable weight), que es el MAYOR entre el peso bruto real y
// el peso volumétrico. Cada modo de transporte usa un factor distinto para
// convertir volumen en kilos equivalentes:
//
//   · Aéreo    → 1 m³ ≈ 166,67 kg   (regla IATA 1:6 → divisor 6000 cm³/kg)
//   · Carretera→ 1 m³ = 333 kg      (groupage/paletería UE → divisor 3000)
//   · Marítimo → 1 m³ = 1.000 kg    (LCL, regla W/M: tonelada vs. m³)
//
// En marítimo LCL no se habla de "peso volumétrico" sino de la regla W/M
// (Weight or Measurement): se factura por el mayor entre las toneladas y los
// metros cúbicos, tomando 1 tonelada = 1 m³ como unidad de flete (R/T).

export type ModoTransporte = "aereo" | "maritimo" | "carretera";

export interface FactorModo {
  modo: ModoTransporte;
  label: string;
  /** Kilos equivalentes por metro cúbico. */
  kgPorM3: number;
  /** Divisor volumétrico clásico en cm³/kg (peso vol. = L·A·H / divisor). */
  divisor: number;
  /** Unidad en la que se introduce la tarifa para estimar el coste. */
  unidadTarifa: string;
  /** Cómo se llama la unidad facturable que multiplica a la tarifa. */
  unidadFacturable: string;
}

export const FACTORES: Record<ModoTransporte, FactorModo> = {
  aereo: {
    modo: "aereo",
    label: "Aéreo",
    kgPorM3: 166.67,
    divisor: 6000,
    unidadTarifa: "€/kg",
    unidadFacturable: "kg facturables",
  },
  carretera: {
    modo: "carretera",
    label: "Carretera",
    kgPorM3: 333,
    divisor: 3000,
    unidadTarifa: "€/kg",
    unidadFacturable: "kg facturables",
  },
  maritimo: {
    modo: "maritimo",
    label: "Marítimo (LCL)",
    kgPorM3: 1000,
    divisor: 1000,
    unidadTarifa: "€/R-T (ton ó m³)",
    unidadFacturable: "unidades R/T",
  },
};

export const MODOS: ModoTransporte[] = ["aereo", "maritimo", "carretera"];

// ── Contenedores FCL (Full Container Load) ──────────────────────────────────
//
// En FCL se contrata el contenedor completo: el flete se cobra por contenedor,
// no por kg ni m³. El problema de presupuesto es otro: ¿cuántos contenedores
// hace falta y cómo de llenos van? La carga puede toparse antes con el VOLUMEN
// (carga ligera y voluminosa) o con el PAYLOAD/peso máximo (carga densa).
//
// Volúmenes internos y payloads son valores estándar de referencia; el payload
// real lo limita la tara del contenedor y los topes de peso por carretera del
// país, así que conviene tratarlos como orientativos.

export type TipoContenedor = "20gp" | "40gp" | "40hc";

export interface Contenedor {
  tipo: TipoContenedor;
  label: string;
  /** Capacidad cúbica interna utilizable, en m³. */
  volumenM3: number;
  /** Carga útil máxima (payload), en kg. */
  payloadKg: number;
}

export const CONTENEDORES: Record<TipoContenedor, Contenedor> = {
  "20gp": { tipo: "20gp", label: "20' Standard", volumenM3: 33.2, payloadKg: 28000 },
  "40gp": { tipo: "40gp", label: "40' Standard", volumenM3: 67.7, payloadKg: 26700 },
  "40hc": { tipo: "40hc", label: "40' High Cube", volumenM3: 76.4, payloadKg: 26500 },
};

export const TIPOS_CONTENEDOR: TipoContenedor[] = ["20gp", "40gp", "40hc"];

export interface Bulto {
  id: string;
  /** Número de bultos idénticos en la partida. */
  cantidad: number;
  /** Dimensiones de un bulto, en centímetros. */
  largo: number;
  ancho: number;
  alto: number;
  /** Peso real de un bulto, en kilos. */
  peso: number;
}

export interface ResultadoCalculo {
  totalBultos: number;
  volumenM3: number;
  pesoRealKg: number;
  /** Peso volumétrico equivalente (aéreo/carretera). */
  pesoVolumetricoKg: number;
  /** Lo que realmente se factura en kg (aéreo/carretera). */
  pesoFacturableKg: number;
  /** Toneladas métricas reales (para la regla W/M marítima). */
  toneladas: number;
  /** Unidades de flete marítimo R/T = max(toneladas, m³). */
  unidadesRT: number;
  /** Qué dimensión manda la facturación. */
  base: "peso" | "volumen";
  /** Coste estimado si se ha indicado una tarifa, en € (si no, null). */
  coste: number | null;
  /** Importe de comisión = coste × %comisión, en € (null si no hay coste). */
  comision: number | null;
  /** Coste de flete + comisión, en € (null si no hay coste). */
  costeTotal: number | null;
}

export interface ResultadoFCL {
  totalBultos: number;
  volumenM3: number;
  pesoRealKg: number;
  /** Contenedores necesarios si solo manda el volumen. */
  contPorVolumen: number;
  /** Contenedores necesarios si solo manda el peso. */
  contPorPeso: number;
  /** Contenedores realmente necesarios = max de los dos. */
  contenedores: number;
  /** Qué dimensión obliga a usar ese número de contenedores. */
  limitante: "volumen" | "peso";
  /** Aprovechamiento medio del volumen (0..1) sobre los contenedores usados. */
  llenadoVolumen: number;
  /** Aprovechamiento medio del payload (0..1) sobre los contenedores usados. */
  llenadoPeso: number;
  /** Coste estimado = contenedores × tarifa, en € (null si no hay tarifa). */
  coste: number | null;
  /** Importe de comisión = coste × %comisión, en € (null si no hay coste). */
  comision: number | null;
  /** Coste de flete + comisión, en € (null si no hay coste). */
  costeTotal: number | null;
}

/**
 * Calcula el importe de comisión y el coste total a partir de un coste de flete.
 *
 * @param coste coste de flete en €, o null si aún no hay tarifa.
 * @param comisionPct porcentaje de comisión sobre el flete (p. ej. 5 = 5 %).
 */
export function aplicarComision(
  coste: number | null,
  comisionPct = 0,
): { comision: number | null; costeTotal: number | null } {
  if (coste === null) return { comision: null, costeTotal: null };
  const comision = comisionPct > 0 ? coste * (comisionPct / 100) : 0;
  return { comision, costeTotal: coste + comision };
}

/**
 * Calcula cuántos contenedores FCL hacen falta para la carga y su nivel de
 * aprovechamiento.
 *
 * @param tarifaPorContenedor flete por contenedor en €. 0 = sin coste.
 * @param comisionPct porcentaje de comisión sobre el flete (p. ej. 5 = 5 %).
 */
export function calcularFCL(
  bultos: Bulto[],
  tipo: TipoContenedor,
  tarifaPorContenedor = 0,
  comisionPct = 0,
): ResultadoFCL {
  const cont = CONTENEDORES[tipo];

  let totalBultos = 0;
  let volumenM3 = 0;
  let pesoRealKg = 0;

  for (const b of bultos) {
    totalBultos += b.cantidad;
    volumenM3 += volumenBulto(b);
    pesoRealKg += b.cantidad * b.peso;
  }

  const contPorVolumen = volumenM3 > 0 ? Math.ceil(volumenM3 / cont.volumenM3) : 0;
  const contPorPeso = pesoRealKg > 0 ? Math.ceil(pesoRealKg / cont.payloadKg) : 0;
  const contenedores = Math.max(contPorVolumen, contPorPeso);
  const limitante: "volumen" | "peso" =
    contPorVolumen >= contPorPeso ? "volumen" : "peso";

  const llenadoVolumen =
    contenedores > 0 ? volumenM3 / (contenedores * cont.volumenM3) : 0;
  const llenadoPeso =
    contenedores > 0 ? pesoRealKg / (contenedores * cont.payloadKg) : 0;

  const coste =
    tarifaPorContenedor > 0 ? contenedores * tarifaPorContenedor : null;
  const { comision, costeTotal } = aplicarComision(coste, comisionPct);

  return {
    totalBultos,
    volumenM3,
    pesoRealKg,
    contPorVolumen,
    contPorPeso,
    contenedores,
    limitante,
    llenadoVolumen,
    llenadoPeso,
    coste,
    comision,
    costeTotal,
  };
}

/** Crea un bulto vacío. El id se genera fuera para evitar dependencias. */
export function bultoVacio(id: string): Bulto {
  return { id, cantidad: 1, largo: 0, ancho: 0, alto: 0, peso: 0 };
}

/** Volumen de una partida (cantidad incluida) en m³. */
export function volumenBulto(b: Bulto): number {
  return (b.cantidad * b.largo * b.ancho * b.alto) / 1_000_000;
}

/**
 * Calcula el peso facturable y el coste estimado para un modo de transporte.
 *
 * @param tarifa coste por unidad facturable (€/kg, o €/R-T en marítimo). 0 = sin coste.
 * @param comisionPct porcentaje de comisión sobre el flete (p. ej. 5 = 5 %).
 */
export function calcular(
  bultos: Bulto[],
  modo: ModoTransporte,
  tarifa = 0,
  comisionPct = 0,
): ResultadoCalculo {
  const factor = FACTORES[modo];

  let totalBultos = 0;
  let volumenM3 = 0;
  let pesoRealKg = 0;

  for (const b of bultos) {
    totalBultos += b.cantidad;
    volumenM3 += volumenBulto(b);
    pesoRealKg += b.cantidad * b.peso;
  }

  const pesoVolumetricoKg = volumenM3 * factor.kgPorM3;
  const pesoFacturableKg = Math.max(pesoRealKg, pesoVolumetricoKg);
  const toneladas = pesoRealKg / 1000;
  const unidadesRT = Math.max(toneladas, volumenM3);

  const base: "peso" | "volumen" =
    modo === "maritimo"
      ? toneladas >= volumenM3
        ? "peso"
        : "volumen"
      : pesoRealKg >= pesoVolumetricoKg
        ? "peso"
        : "volumen";

  let coste: number | null = null;
  if (tarifa > 0) {
    coste = modo === "maritimo" ? unidadesRT * tarifa : pesoFacturableKg * tarifa;
  }
  const { comision, costeTotal } = aplicarComision(coste, comisionPct);

  return {
    totalBultos,
    volumenM3,
    pesoRealKg,
    pesoVolumetricoKg,
    pesoFacturableKg,
    toneladas,
    unidadesRT,
    base,
    coste,
    comision,
    costeTotal,
  };
}
