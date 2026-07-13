"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Loader2,
  FileText,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dossierADua,
  dossierAPacking,
  dossierAFactura,
  dossierAOrigen,
  dossierAFito,
  dossierADgd,
  dossierADv1,
  dossierABl,
  dossierACmr,
  dossierATransito,
  type Dossier,
} from "@/lib/documentos/dossier";

// Claves temporales para pasar el documento precargado al editor sin base de datos.
const PREFILL_DUA_KEY = "comexia:dua-prefill";
const PREFILL_PACKING_KEY = "comexia:packing-prefill";
const PREFILL_FACTURA_KEY = "comexia:factura-prefill";
const PREFILL_ORIGEN_KEY = "comexia:origen-prefill";
const PREFILL_FITO_KEY = "comexia:fitosanitario-prefill";
const PREFILL_DGD_KEY = "comexia:dgd-prefill";
const PREFILL_DV1_KEY = "comexia:dv1-prefill";
const PREFILL_BL_KEY = "comexia:bl-prefill";
const PREFILL_CMR_KEY = "comexia:cmr-prefill";
const PREFILL_TRANSITO_KEY = "comexia:transito-prefill";

type Estado =
  | { fase: "idle" }
  | { fase: "extrayendo" }
  | { fase: "listo"; dossier: Dossier; fuente: "ia" | "demo" };

/** Fila resumen de un dato detectado (solo se muestra si tiene valor). */
function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  if (!valor || !valor.trim()) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-32 shrink-0 text-muted">{etiqueta}</span>
      <span className="text-ink">{valor}</span>
    </div>
  );
}

/**
 * Zona de subida + extracción con IA para la cabecera de "Documentos".
 * Subes packing list / factura / foto, Claude extrae un dossier de datos y
 * eliges qué documento generar (hoy: DUA).
 */
export function ExtractorDossier() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [estado, setEstado] = useState<Estado>({ fase: "idle" });
  const [error, setError] = useState<string | null>(null);

  function anadir(lista: FileList | null) {
    if (!lista) return;
    setArchivos((prev) => [...prev, ...Array.from(lista)]);
    setError(null);
  }

  function quitar(idx: number) {
    setArchivos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function extraer() {
    if (archivos.length === 0) {
      setError("Adjunta al menos un documento.");
      return;
    }
    setEstado({ fase: "extrayendo" });
    setError(null);
    try {
      const data = new FormData();
      archivos.forEach((f) => data.append("archivos", f));
      const res = await fetch("/api/documentos/extraer", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo extraer");
      setEstado({ fase: "listo", dossier: json.dossier, fuente: json.fuente });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al extraer");
      setEstado({ fase: "idle" });
    }
  }

  function generarDua(dossier: Dossier) {
    const datos = dossierADua(dossier);
    try {
      sessionStorage.setItem(PREFILL_DUA_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push(`/app/documentos/dua?tipo=${datos.tipo}&desde=extraccion`);
  }

  function generarPacking(dossier: Dossier) {
    const datos = dossierAPacking(dossier);
    try {
      sessionStorage.setItem(PREFILL_PACKING_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/packing?desde=extraccion");
  }

  function generarFactura(dossier: Dossier) {
    const datos = dossierAFactura(dossier);
    try {
      sessionStorage.setItem(PREFILL_FACTURA_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/factura?desde=extraccion");
  }

  function generarOrigen(dossier: Dossier) {
    const datos = dossierAOrigen(dossier);
    try {
      sessionStorage.setItem(PREFILL_ORIGEN_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/origen?desde=extraccion");
  }

  function generarFito(dossier: Dossier) {
    const datos = dossierAFito(dossier);
    try {
      sessionStorage.setItem(PREFILL_FITO_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/fitosanitario?desde=extraccion");
  }

  function generarDgd(dossier: Dossier) {
    const datos = dossierADgd(dossier);
    try {
      sessionStorage.setItem(PREFILL_DGD_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/dgd?desde=extraccion");
  }

  function generarDv1(dossier: Dossier) {
    const datos = dossierADv1(dossier);
    try {
      sessionStorage.setItem(PREFILL_DV1_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/dv1?desde=extraccion");
  }

  function generarBl(dossier: Dossier) {
    const datos = dossierABl(dossier);
    try {
      sessionStorage.setItem(PREFILL_BL_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/bl?desde=extraccion");
  }

  function generarCmr(dossier: Dossier) {
    const datos = dossierACmr(dossier);
    try {
      sessionStorage.setItem(PREFILL_CMR_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/cmr?desde=extraccion");
  }

  function generarTransito(dossier: Dossier) {
    const datos = dossierATransito(dossier);
    try {
      sessionStorage.setItem(PREFILL_TRANSITO_KEY, JSON.stringify(datos));
    } catch {
      // Sin sessionStorage el editor abre vacío; no es bloqueante.
    }
    router.push("/app/documentos/transito?desde=extraccion");
  }

  function reiniciar() {
    setArchivos([]);
    setEstado({ fase: "idle" });
    setError(null);
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-brand-100 bg-ai-soft p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-gradient text-white shadow-[var(--shadow-brand)]">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h2 className="font-semibold text-ink">Genera desde tus documentos</h2>
          <p className="text-xs text-muted">
            Sube un packing list, factura o foto y la IA extrae los datos para
            rellenar tus documentos.
          </p>
        </div>
      </div>

      {estado.fase !== "listo" ? (
        <div className="space-y-3">
          {/* Zona de subida */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={estado.fase === "extrayendo"}
            className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-line bg-surface/60 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-surface disabled:opacity-60"
          >
            <Upload className="size-6 text-brand-700" />
            <span className="text-sm font-medium text-ink">
              Haz clic para seleccionar documentos
            </span>
            <span className="text-xs text-muted">
              PDF, PNG, JPG o WEBP · varios a la vez · máx. 25 MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              anadir(e.target.files);
              e.target.value = "";
            }}
          />

          {/* Lista de archivos seleccionados */}
          {archivos.length > 0 && (
            <ul className="space-y-1.5">
              {archivos.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
                >
                  <FileText className="size-4 shrink-0 text-brand-700" />
                  <span className="flex-1 truncate text-ink">{f.name}</span>
                  <span className="text-xs text-faint">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  {estado.fase !== "extrayendo" && (
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      className="text-faint hover:text-danger"
                      aria-label={`Quitar ${f.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            onClick={extraer}
            disabled={estado.fase === "extrayendo" || archivos.length === 0}
          >
            {estado.fase === "extrayendo" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Extrayendo datos…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Extraer datos con IA
              </>
            )}
          </Button>
        </div>
      ) : (
        <ResultadoExtraccion
          dossier={estado.dossier}
          fuente={estado.fuente}
          onGenerarDua={generarDua}
          onGenerarPacking={generarPacking}
          onGenerarFactura={generarFactura}
          onGenerarOrigen={generarOrigen}
          onGenerarFito={generarFito}
          onGenerarDgd={generarDgd}
          onGenerarDv1={generarDv1}
          onGenerarBl={generarBl}
          onGenerarCmr={generarCmr}
          onGenerarTransito={generarTransito}
          onReiniciar={reiniciar}
        />
      )}
    </section>
  );
}

function ResultadoExtraccion({
  dossier,
  fuente,
  onGenerarDua,
  onGenerarPacking,
  onGenerarFactura,
  onGenerarOrigen,
  onGenerarFito,
  onGenerarDgd,
  onGenerarDv1,
  onGenerarBl,
  onGenerarCmr,
  onGenerarTransito,
  onReiniciar,
}: {
  dossier: Dossier;
  fuente: "ia" | "demo";
  onGenerarDua: (d: Dossier) => void;
  onGenerarPacking: (d: Dossier) => void;
  onGenerarFactura: (d: Dossier) => void;
  onGenerarOrigen: (d: Dossier) => void;
  onGenerarFito: (d: Dossier) => void;
  onGenerarDgd: (d: Dossier) => void;
  onGenerarDv1: (d: Dossier) => void;
  onGenerarBl: (d: Dossier) => void;
  onGenerarCmr: (d: Dossier) => void;
  onGenerarTransito: (d: Dossier) => void;
  onReiniciar: () => void;
}) {
  const confianza = Math.round((dossier.confianza ?? 0) * 100);
  const mercancia =
    dossier.lineas
      .map((l) => l.descripcion)
      .filter(Boolean)
      .join("; ") || undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" /> Datos detectados
        </span>
        {fuente === "demo" && (
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
            Datos de ejemplo (demo sin IA)
          </span>
        )}
        <span className="ml-auto text-xs text-muted">
          Confianza {confianza}%
        </span>
      </div>

      {/* Resumen del dossier */}
      <div className="grid gap-1.5 rounded-lg border border-line bg-surface p-3">
        <Dato etiqueta="Exportador" valor={dossier.exportador?.nombre} />
        <Dato etiqueta="Importador" valor={dossier.importador?.nombre} />
        <Dato etiqueta="Mercancía" valor={mercancia} />
        <Dato
          etiqueta="Origen → Destino"
          valor={
            dossier.paisOrigen || dossier.paisDestino
              ? `${dossier.paisOrigen ?? "—"} → ${dossier.paisDestino ?? "—"}`
              : undefined
          }
        />
        <Dato etiqueta="Incoterm" valor={dossier.incoterm} />
        <Dato
          etiqueta="Valor"
          valor={[dossier.divisa, dossier.valorTotal].filter(Boolean).join(" ")}
        />
        <Dato etiqueta="Bultos" valor={dossier.totalBultos} />
        <Dato etiqueta="Contenedor" valor={dossier.numeroContenedor} />
      </div>

      {/* Puntos a verificar (honestidad de la IA) */}
      {dossier.verificar.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-warning">
            <AlertTriangle className="size-3.5" /> Revisa antes de generar
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-muted">
            {dossier.verificar.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selector de documento a generar */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink">
          ¿Qué documento quieres generar?
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onGenerarDua(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">DUA</span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarPacking(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Packing list
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarFactura(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Factura comercial
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarOrigen(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Certificado de origen
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarFito(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Certificado fitosanitario
              </span>
              <span className="block text-xs text-warning">Borrador</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarDgd(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Mercancías peligrosas (DGD)
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarDv1(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                DV1 (valor en aduana)
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarBl(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Bill of Lading (B/L)
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarCmr(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">CMR</span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => onGenerarTransito(dossier)}
            className="group flex items-center justify-between rounded-lg border border-brand-200 bg-surface px-3 py-2.5 text-left transition-shadow hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-medium text-ink">
                Tránsito T1 / T2
              </span>
              <span className="block text-xs text-success">Disponible</span>
            </span>
            <ArrowRight className="size-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onReiniciar}
        className="text-sm text-muted hover:text-ink"
      >
        ← Subir otros documentos
      </button>
    </div>
  );
}
