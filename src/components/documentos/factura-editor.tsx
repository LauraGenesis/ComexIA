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
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FacturaPreview } from "./factura-preview";
import {
  FACTURA_CAMPOS,
  FACTURA_SECCIONES,
  facturaLineaVacia,
  importeLinea,
  formatearImporte,
  validarFactura,
  type FacturaDatos,
  type FacturaLinea,
} from "@/lib/documentos/factura";
import type { OrigenDocumento } from "@/lib/documentos/historial";

// Clave temporal donde el extractor deja la factura precargada (sin base de datos).
const PREFILL_KEY = "comexia:factura-prefill";

// Columnas editables de la tabla de artículos (importe es calculado, no input).
const COLUMNAS: { key: keyof FacturaLinea; label: string }[] = [
  { key: "descripcion", label: "Descripción" },
  { key: "hsTaric", label: "HS/TARIC" },
  { key: "cantidad", label: "Cantidad" },
  { key: "unidad", label: "Unidad" },
  { key: "precioUnitario", label: "Precio ud." },
  { key: "importeManual", label: "Importe (auto si vacío)" },
];

export function FacturaEditor({
  inicial,
  prefill = false,
  origen = "manual",
  historialId,
}: {
  inicial: FacturaDatos;
  prefill?: boolean;
  origen?: OrigenDocumento;
  historialId?: string;
}) {
  const [d, setD] = useState<FacturaDatos>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historialActualId, setHistorialActualId] = useState<string | undefined>(
    historialId,
  );

  // Al llegar desde la extracción con IA, aplicamos la factura que el extractor
  // dejó en sessionStorage y la consumimos (una sola vez) para no re-aplicarla.
  useEffect(() => {
    if (!prefill) return;
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (raw) {
        const datos = JSON.parse(raw) as Partial<FacturaDatos>;
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

  const problemas = useMemo(() => validarFactura(d), [d]);
  const errores = problemas.filter((p) => p.nivel === "error");
  const avisos = problemas.filter((p) => p.nivel === "aviso");
  const divisa = d.divisa.trim() || "EUR";

  function set<K extends keyof FacturaDatos>(key: K, valor: FacturaDatos[K]) {
    setD((prev) => ({ ...prev, [key]: valor }));
    setGuardado(false);
  }

  function setLinea<K extends keyof FacturaLinea>(
    idx: number,
    key: K,
    valor: FacturaLinea[K],
  ) {
    setD((prev) => ({
      ...prev,
      lineas: prev.lineas.map((l, i) => (i === idx ? { ...l, [key]: valor } : l)),
    }));
    setGuardado(false);
  }

  function anadirLinea() {
    setD((prev) => ({ ...prev, lineas: [...prev.lineas, facturaLineaVacia()] }));
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
          tipo: "Factura",
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

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Formulario */}
      <div className="no-print space-y-5">
        {FACTURA_SECCIONES.filter((s) => s !== "Pie" && s !== "Totales").map(
          (seccion) => (
            <SeccionCampos key={seccion} seccion={seccion} d={d} set={set} />
          ),
        )}

        {/* Tabla de artículos */}
        <Card>
          <CardHeader>
            <CardTitle>Artículos facturados</CardTitle>
            <button
              type="button"
              onClick={anadirLinea}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              <Plus className="size-4" /> Añadir línea
            </button>
          </CardHeader>
          <CardBody className="space-y-3">
            {d.lineas.map((linea, i) => (
              <div
                key={i}
                className="rounded-lg border border-line bg-canvas/50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">
                    Línea {i + 1} · Importe:{" "}
                    <span className="text-ink">
                      {formatearImporte(importeLinea(linea))} {divisa}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => quitarLinea(i)}
                    disabled={d.lineas.length === 1}
                    className="text-faint hover:text-danger disabled:opacity-40 disabled:hover:text-faint"
                    aria-label={`Quitar línea ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {COLUMNAS.map((col) => (
                    <div
                      key={col.key}
                      className={col.key === "descripcion" ? "sm:col-span-2" : ""}
                    >
                      <label className="mb-0.5 block text-[11px] text-muted">
                        {col.label}
                      </label>
                      <input
                        type="text"
                        value={linea[col.key]}
                        onChange={(e) => setLinea(i, col.key, e.target.value)}
                        className="h-8 w-full rounded-md border border-line bg-canvas px-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <SeccionCampos seccion="Totales" d={d} set={set} />
        <SeccionCampos seccion="Pie" d={d} set={set} />
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
          <FacturaPreview d={d} />
        </div>
      </div>
    </div>
  );
}

/** Grupo de campos planos (cabecera, partes, condiciones, totales, bancarios, pie). */
function SeccionCampos({
  seccion,
  d,
  set,
}: {
  seccion: string;
  d: FacturaDatos;
  set: <K extends keyof FacturaDatos>(key: K, valor: FacturaDatos[K]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{seccion}</CardTitle>
      </CardHeader>
      <CardBody className="grid gap-3 sm:grid-cols-2">
        {FACTURA_CAMPOS.filter((c) => c.seccion === seccion).map((campo) => {
          const valor = d[campo.key];
          const falta = campo.required && valor.trim() === "";
          const ancho = campo.tipo === "textarea" ? "sm:col-span-2" : "";
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
