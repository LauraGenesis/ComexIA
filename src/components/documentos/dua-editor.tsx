"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer, Save, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DuaPreview } from "./dua-preview";
import {
  DUA_CAMPOS,
  DUA_SECCIONES,
  validarDua,
  type DuaDatos,
} from "@/lib/documentos/dua";

export function DuaEditor({
  inicial,
  expedienteId,
}: {
  inicial: DuaDatos;
  expedienteId?: string;
}) {
  const [d, setD] = useState<DuaDatos>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const problemas = useMemo(() => validarDua(d), [d]);
  const errores = problemas.filter((p) => p.nivel === "error");
  const avisos = problemas.filter((p) => p.nivel === "aviso");

  function set<K extends keyof DuaDatos>(key: K, valor: DuaDatos[K]) {
    setD((prev) => ({ ...prev, [key]: valor }));
    setGuardado(false);
  }

  function exportarPdf() {
    window.print();
  }

  async function guardar() {
    if (!expedienteId) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/documentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "DUA", subtipo: d.tipo, datos: d }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "No se pudo guardar");
      }
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
        {DUA_SECCIONES.map((seccion) => (
          <Card key={seccion}>
            <CardHeader>
              <CardTitle>{seccion}</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {DUA_CAMPOS.filter((c) => c.seccion === seccion).map((campo) => {
                const valor = d[campo.key];
                const falta =
                  campo.required &&
                  typeof valor === "string" &&
                  valor.trim() === "";
                const ancho =
                  campo.tipo === "textarea" ? "sm:col-span-2" : "";
                return (
                  <div key={campo.key} className={ancho}>
                    <label className="mb-1 flex items-center gap-1 text-xs text-muted">
                      <span className="text-faint">[{campo.casilla}]</span>
                      {campo.label}
                      {campo.required && <span className="text-danger">*</span>}
                      {falta && (
                        <AlertTriangle className="size-3 text-warning" />
                      )}
                    </label>
                    {campo.tipo === "textarea" ? (
                      <textarea
                        rows={3}
                        value={valor as string}
                        onChange={(e) => set(campo.key, e.target.value as never)}
                        placeholder={campo.placeholder}
                        className="w-full resize-none rounded-lg border border-line bg-canvas p-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                    ) : campo.tipo === "select" ? (
                      <select
                        value={valor as string}
                        onChange={(e) => set(campo.key, e.target.value as never)}
                        className="h-9 w-full rounded-lg border border-line bg-canvas px-2 text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {campo.opciones?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : campo.tipo === "checkbox" ? (
                      <label className="flex h-9 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={valor as boolean}
                          onChange={(e) =>
                            set(campo.key, e.target.checked as never)
                          }
                          className="size-4 rounded border-line"
                        />
                        Sí
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={valor as string}
                        onChange={(e) => set(campo.key, e.target.value as never)}
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
        ))}
      </div>

      {/* Preview + acciones */}
      <div className="space-y-4 lg:sticky lg:top-0 lg:h-fit">
        <div className="no-print flex flex-wrap items-center gap-2">
          <Button onClick={exportarPdf} variant="primary">
            <Printer className="size-4" /> Exportar PDF
          </Button>
          {expedienteId && (
            <Button onClick={guardar} variant="secondary" disabled={guardando}>
              {guardando ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : (
                <>
                  <Save className="size-4" /> Guardar en expediente
                </>
              )}
            </Button>
          )}
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
              ? `⚠ ${errores.length} campo(s) obligatorio(s)`
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
          <DuaPreview d={d} />
        </div>

        {expedienteId && (
          <Link
            href={`/app/expedientes/${expedienteId}`}
            className="no-print inline-block text-sm text-brand-700 hover:underline"
          >
            ← Volver al expediente
          </Link>
        )}
      </div>
    </div>
  );
}
