"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dv1Preview } from "./dv1-preview";
import {
  DV1_CAMPOS,
  DV1_SECCIONES,
  totalesDv1,
  formatearImporte,
  validarDv1,
  type Dv1Datos,
} from "@/lib/documentos/dv1";
import type { OrigenDocumento } from "@/lib/documentos/historial";

// Clave temporal donde el extractor deja la declaración precargada (sin base de datos).
const PREFILL_KEY = "comexia:dv1-prefill";

export function Dv1Editor({
  inicial,
  prefill = false,
  origen = "manual",
  historialId,
}: {
  inicial: Dv1Datos;
  prefill?: boolean;
  origen?: OrigenDocumento;
  historialId?: string;
}) {
  const [d, setD] = useState<Dv1Datos>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historialActualId, setHistorialActualId] = useState<string | undefined>(
    historialId,
  );

  // Al llegar desde la extracción con IA, aplicamos la declaración que el
  // extractor dejó en sessionStorage y la consumimos (una sola vez).
  useEffect(() => {
    if (!prefill) return;
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (raw) {
        const datos = JSON.parse(raw) as Partial<Dv1Datos>;
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

  const problemas = useMemo(() => validarDv1(d), [d]);
  const errores = problemas.filter((p) => p.nivel === "error");
  const avisos = problemas.filter((p) => p.nivel === "aviso");
  const t = totalesDv1(d);
  const divisa = d.divisa.trim() || "EUR";
  const imp = (n: number) => `${divisa} ${formatearImporte(n)}`;

  function set<K extends keyof Dv1Datos>(key: K, valor: Dv1Datos[K]) {
    setD((prev) => ({ ...prev, [key]: valor }));
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
          tipo: "DV1",
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
        {DV1_SECCIONES.map((seccion) => (
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

        {/* Panel de totales del valor en aduana */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Valor en aduana</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-muted">
              <span>Precio pagado + pagos indirectos</span>
              <span className="font-medium text-ink">{imp(t.base)}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>+ Adiciones (art. 71)</span>
              <span className="font-medium text-ink">{imp(t.adiciones)}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span>− Deducciones (art. 72)</span>
              <span className="font-medium text-ink">{imp(t.deducciones)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-1.5 text-base font-bold text-brand-700">
              <span>VALOR EN ADUANA</span>
              <span>{imp(t.valorAduana)}</span>
            </div>
          </CardBody>
        </Card>

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
          <Dv1Preview d={d} />
        </div>
      </div>
    </div>
  );
}

/** Grupo de campos planos del formulario D.V.1. */
function SeccionCampos({
  seccion,
  d,
  set,
}: {
  seccion: string;
  d: Dv1Datos;
  set: <K extends keyof Dv1Datos>(key: K, valor: Dv1Datos[K]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{seccion}</CardTitle>
      </CardHeader>
      <CardBody className="grid gap-3 sm:grid-cols-2">
        {DV1_CAMPOS.filter((c) => c.seccion === seccion).map((campo) => {
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
              ) : campo.tipo === "vinculacion" ? (
                <select
                  value={valor}
                  onChange={(e) => set(campo.key, e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-canvas px-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              ) : campo.tipo === "importe" ? (
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => set(campo.key, e.target.value)}
                  placeholder={campo.placeholder ?? "0,00"}
                  className={`h-9 w-full rounded-lg border bg-canvas px-2 text-right text-sm focus:outline-none ${
                    falta
                      ? "border-warning/60 focus:border-warning"
                      : "border-line focus:border-brand-500"
                  }`}
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
