"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CmrPreview } from "./cmr-preview";
import {
  CMR_CAMPOS,
  CMR_SECCIONES,
  cmrLineaVacia,
  validarCmr,
  type CmrDatos,
  type CmrLinea,
} from "@/lib/documentos/cmr";
import type { OrigenDocumento } from "@/lib/documentos/historial";

// Clave temporal donde el extractor deja la carta de porte precargada (sin base de datos).
const PREFILL_KEY = "comexia:cmr-prefill";

// La tabla de mercancías (casillas 6-12) se inserta tras esta sección.
const SECCION_ANTES_TABLA = "Lugares";

// Columnas editables de la tabla de mercancías (casillas 6-12 del CMR).
const COLUMNAS: {
  key: keyof CmrLinea;
  label: string;
  ancho?: string;
  placeholder?: string;
}[] = [
  { key: "marcas", label: "Marcas y nº (6)", placeholder: "S/N" },
  { key: "numBultos", label: "Nº de bultos (7)", placeholder: "20" },
  { key: "embalaje", label: "Clase de embalaje (8)", placeholder: "Palés" },
  { key: "naturaleza", label: "Naturaleza de la mercancía (9)", ancho: "sm:col-span-2" },
  { key: "estadistico", label: "Nº estadístico (10)" },
  { key: "pesoBruto", label: "Peso bruto kg (11)" },
  { key: "volumen", label: "Volumen m³ (12)" },
];

export function CmrEditor({
  inicial,
  prefill = false,
  origen = "manual",
  historialId,
}: {
  inicial: CmrDatos;
  prefill?: boolean;
  origen?: OrigenDocumento;
  historialId?: string;
}) {
  const [d, setD] = useState<CmrDatos>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historialActualId, setHistorialActualId] = useState<string | undefined>(
    historialId,
  );

  // Al llegar desde la extracción con IA, aplicamos la carta de porte que el
  // extractor dejó en sessionStorage y la consumimos (una sola vez).
  useEffect(() => {
    if (!prefill) return;
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (raw) {
        const datos = JSON.parse(raw) as Partial<CmrDatos>;
        // Sincronizar desde sessionStorage al montar (solo cliente): sin
        // desajuste de hidratación, el render inicial usa `inicial`.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setD((prev) => ({ ...prev, ...datos }));
      }
    } catch {
      // JSON corrupto o sessionStorage no disponible: se mantiene el inicial.
    } finally {
      sessionStorage.removeItem(PREFILL_KEY);
    }
  }, [prefill]);

  const problemas = useMemo(() => validarCmr(d), [d]);
  const errores = problemas.filter((p) => p.nivel === "error");
  const avisos = problemas.filter((p) => p.nivel === "aviso");

  function set<K extends keyof CmrDatos>(key: K, valor: CmrDatos[K]) {
    setD((prev) => ({ ...prev, [key]: valor }));
    setGuardado(false);
  }

  function setLinea<K extends keyof CmrLinea>(
    idx: number,
    key: K,
    valor: CmrLinea[K],
  ) {
    setD((prev) => ({
      ...prev,
      lineas: prev.lineas.map((l, i) => (i === idx ? { ...l, [key]: valor } : l)),
    }));
    setGuardado(false);
  }

  function anadirLinea() {
    setD((prev) => ({ ...prev, lineas: [...prev.lineas, cmrLineaVacia()] }));
    setGuardado(false);
  }

  function quitarLinea(idx: number) {
    setD((prev) => ({
      ...prev,
      lineas:
        prev.lineas.length > 1
          ? prev.lineas.filter((_, i) => i !== idx)
          : prev.lineas,
    }));
    setGuardado(false);
  }

  function exportarPdf() {
    window.print();
  }

  async function guardarHistorial() {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/documentos/historial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: historialActualId,
          tipo: "CMR",
          origen,
          datos: d,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "No se pudo guardar");
      if (j.id) setHistorialActualId(j.id);
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  const seccionesAntes = CMR_SECCIONES.slice(
    0,
    CMR_SECCIONES.indexOf(SECCION_ANTES_TABLA) + 1,
  );
  const seccionesDespues = CMR_SECCIONES.slice(
    CMR_SECCIONES.indexOf(SECCION_ANTES_TABLA) + 1,
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Formulario */}
      <div className="no-print space-y-5">
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-sm text-ink">
          <Info className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            La carta de porte CMR prueba el contrato de transporte por carretera
            y la recepción de la mercancía por el transportista. La firman el{" "}
            <strong>remitente</strong> y el <strong>transportista</strong>;
            acompaña a la mercancía durante todo el viaje.
          </p>
        </div>

        {seccionesAntes.map((seccion) => (
          <SeccionCampos key={seccion} seccion={seccion} d={d} set={set} />
        ))}

        {/* Tabla de mercancías (casillas 6-12) */}
        <Card>
          <CardHeader>
            <CardTitle>Mercancía (casillas 6-12)</CardTitle>
            <button
              type="button"
              onClick={anadirLinea}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              <Plus className="size-4" /> Añadir mercancía
            </button>
          </CardHeader>
          <CardBody className="space-y-3">
            {d.lineas.map((linea, i) => (
              <div key={i} className="rounded-lg border border-line bg-canvas/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">
                    Mercancía {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitarLinea(i)}
                    disabled={d.lineas.length === 1}
                    className="text-faint hover:text-danger disabled:opacity-40 disabled:hover:text-faint"
                    aria-label={`Quitar mercancía ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {COLUMNAS.map((col) => (
                    <div key={col.key} className={col.ancho}>
                      <label className="mb-0.5 flex items-center gap-1 text-[11px] text-muted">
                        {col.label}
                      </label>
                      <input
                        type="text"
                        value={linea[col.key]}
                        onChange={(e) => setLinea(i, col.key, e.target.value)}
                        placeholder={col.placeholder}
                        className="h-8 w-full rounded-md border border-line bg-canvas px-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {seccionesDespues.map((seccion) => (
          <SeccionCampos key={seccion} seccion={seccion} d={d} set={set} />
        ))}
      </div>

      {/* Preview + acciones */}
      <div className="space-y-4 lg:sticky lg:top-0 lg:h-fit">
        <div className="no-print flex flex-wrap items-center gap-2">
          <Button onClick={exportarPdf} variant="primary">
            <Printer className="size-4" /> Exportar PDF
          </Button>
          <Button
            onClick={guardarHistorial}
            variant="secondary"
            disabled={guardando}
          >
            {guardando ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              <>
                <Save className="size-4" />{" "}
                {historialActualId
                  ? "Actualizar en historial"
                  : "Guardar en historial"}
              </>
            )}
          </Button>
          {guardado && (
            <span className="flex items-center gap-1 text-sm text-success">
              <CheckCircle2 className="size-4" /> Guardado
            </span>
          )}
          <span
            className={`ml-auto text-sm ${
              errores.length ? "text-danger" : "text-success"
            }`}
          >
            {errores.length
              ? `⚠ ${errores.length} campo(s) por completar`
              : "✓ Validación correcta"}
          </span>
        </div>

        {error && <p className="no-print text-sm text-danger">{error}</p>}

        {(errores.length > 0 || avisos.length > 0) && (
          <Card className="no-print">
            <CardBody className="space-y-1.5 text-sm">
              {errores.map((p, i) => (
                <p key={`e${i}`} className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="size-3.5 shrink-0" /> {p.mensaje}
                </p>
              ))}
              {avisos.map((p, i) => (
                <p key={`a${i}`} className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="size-3.5 shrink-0" /> {p.mensaje}
                </p>
              ))}
            </CardBody>
          </Card>
        )}

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
          <CmrPreview d={d} />
        </div>
      </div>
    </div>
  );
}

/** Grupo de campos planos de la carta de porte. */
function SeccionCampos({
  seccion,
  d,
  set,
}: {
  seccion: string;
  d: CmrDatos;
  set: <K extends keyof CmrDatos>(key: K, valor: CmrDatos[K]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{seccion}</CardTitle>
      </CardHeader>
      <CardBody className="grid gap-3 sm:grid-cols-2">
        {CMR_CAMPOS.filter((c) => c.seccion === seccion).map((campo) => {
          const valor = d[campo.key];
          const falta = campo.required && valor.trim() === "";
          const ancho =
            campo.tipo === "textarea" ? "sm:col-span-2" : "";
          return (
            <div key={campo.key} className={ancho}>
              <label className="mb-1 flex items-center gap-1 text-xs text-muted">
                {campo.label}
                {campo.required && <span className="text-danger">*</span>}
                {falta && <AlertTriangle className="size-3 text-warning" />}
              </label>
              {campo.tipo === "textarea" ? (
                <textarea
                  rows={2}
                  value={valor}
                  onChange={(e) => set(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  className="w-full resize-none rounded-lg border border-line bg-canvas p-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              ) : campo.tipo === "porte" ? (
                <select
                  value={valor}
                  onChange={(e) => set(campo.key, e.target.value as CmrDatos[typeof campo.key])}
                  className="h-9 w-full rounded-lg border border-line bg-canvas px-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="pagado">Porte pagado (franco)</option>
                  <option value="debido">Porte debido</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => set(campo.key, e.target.value)}
                  placeholder={campo.placeholder}
                  className={`h-9 w-full rounded-lg border bg-canvas px-2 text-sm focus:outline-none ${
                    falta
                      ? "border-warning/60 focus:border-warning"
                      : "border-line focus:border-brand-500"
                  }`}
                />
              )}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
