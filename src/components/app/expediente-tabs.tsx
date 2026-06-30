"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, RefreshCw } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Expediente, Evento } from "@/lib/types";
import { formatEUR } from "@/lib/utils";

const TABS = ["Resumen", "Documentos", "Requisitos", "Historial"] as const;
type Tab = (typeof TABS)[number];

const DOC_ESTADO: Record<string, string> = {
  generado: "text-success",
  borrador: "text-warning",
  pendiente: "text-muted",
  adjuntado: "text-info",
  firmado: "text-success",
};

export function ExpedienteTabs({
  exp,
  eventos = [],
}: {
  exp: Expediente;
  eventos?: Evento[];
}) {
  const [tab, setTab] = useState<Tab>("Resumen");
  const generados = exp.documentos.filter((d) => d.estado === "generado").length;

  return (
    <div className="space-y-5">
      <nav className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "Resumen" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximas acciones</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2.5 text-sm">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="size-4 rounded border-line" />
                <span className="flex-1 text-ink">{exp.proximaAccion}</span>
                <span className="text-xs text-muted">hoy</span>
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riesgo</CardTitle>
            </CardHeader>
            <CardBody>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  exp.riesgo === "alto"
                    ? "bg-danger-bg text-danger"
                    : exp.riesgo === "medio"
                      ? "bg-warning-bg text-warning"
                      : "bg-success-bg text-success"
                }`}
              >
                {exp.riesgo.toUpperCase()}
              </span>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Documentos ({generados}/{exp.documentos.length})
              </CardTitle>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-2 text-sm">
              {exp.documentos.map((d) => (
                <span
                  key={d.id}
                  className="rounded-full border border-line px-2.5 py-1 text-xs"
                >
                  <span className={DOC_ESTADO[d.estado]}>●</span> {d.nombre}
                </span>
              ))}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Datos de la operación</CardTitle>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Dato k="Tipo" v={exp.tipo} />
              <Dato k="TARIC" v={exp.hsTaric ?? "—"} />
              <Dato k="Incoterm" v={exp.incoterm ?? "—"} />
              <Dato k="Transporte" v={exp.transporte ?? "—"} />
              <Dato k="Valor" v={exp.valor ? formatEUR(exp.valor) : "—"} />
              <Dato k="Ruta" v={`${exp.origen} → ${exp.destino}`} />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "Documentos" && (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Documentos del expediente</CardTitle>
            <Button size="sm" variant="secondary">
              <FileText className="size-4" /> Generar todos
            </Button>
          </CardHeader>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-2.5 font-medium">Documento</th>
                <th className="px-3 py-2.5 font-medium">Estado</th>
                <th className="px-3 py-2.5 font-medium">Actualizado</th>
                <th className="px-3 py-2.5 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {exp.documentos.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-ink">
                    {d.nombre}
                    {d.obligatorio && (
                      <span className="ml-2 text-xs text-danger">obligatorio</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs capitalize ${DOC_ESTADO[d.estado]}`}>
                      ● {d.estado}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{d.actualizado ?? "—"}</td>
                  <td className="px-3 py-3">
                    {d.nombre.includes("DUA") ? (
                      <Link
                        href={`/app/documentos/dua?expediente=${exp.id}&tipo=${exp.tipo === "exportacion" ? "exportacion" : "importacion"}`}
                        className="text-brand-700 hover:underline"
                      >
                        {d.estado === "generado" ? "Editar" : "Generar"}
                      </Link>
                    ) : (
                      <button className="text-brand-700 hover:underline">
                        {d.estado === "pendiente" ? "Adjuntar" : "Ver"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "Requisitos" && (
        <Card>
          <CardHeader>
            <CardTitle>Requisitos y normativa</CardTitle>
            <Button size="sm" variant="secondary">
              <RefreshCw className="size-4" /> Recalcular
            </Button>
          </CardHeader>
          <CardBody className="text-sm text-muted">
            {exp.resolucion ? (
              <p>{exp.resolucion.resumen}</p>
            ) : (
              <p>
                Pulsa «Recalcular» para pasar este expediente por el motor de
                resolución y obtener requisitos, normativa y nivel de confianza.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {tab === "Historial" && (
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            {eventos.length === 0 && (
              <p className="text-muted">Sin eventos registrados todavía.</p>
            )}
            {eventos.map((ev) => (
              <div key={ev.id} className="flex gap-3">
                <span className="w-32 shrink-0 text-xs text-muted">
                  {ev.fecha}
                </span>
                <span
                  className={`w-16 shrink-0 text-xs font-medium ${
                    ev.actor === "IA" ? "text-accent-600" : "text-brand-700"
                  }`}
                >
                  {ev.actor}
                </span>
                <span className="text-ink">{ev.accion}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{k}</p>
      <p className="font-medium capitalize text-ink">{v}</p>
    </div>
  );
}
