"use client";

import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  ListChecks,
  Stethoscope,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { RiesgoBadge, ConfianzaBar } from "@/components/badges";
import { flag } from "@/lib/utils";
import type { ReglaNormativa } from "@/lib/repo";
import type { NivelRiesgo } from "@/lib/types";

const NOMBRE_PAIS: Record<string, string> = {
  ES: "España",
  IN: "India",
  CN: "China",
  JP: "Japón",
  US: "Estados Unidos",
  MA: "Marruecos",
  MX: "México",
  BR: "Brasil",
  DE: "Alemania",
  FR: "Francia",
  IT: "Italia",
  PT: "Portugal",
};

const TIPO_LABEL: Record<string, string> = {
  importacion: "Importación",
  exportacion: "Exportación",
  transito: "Tránsito",
};

const ESTADO_DOC: Record<string, string> = {
  obligatorio: "bg-danger-bg text-danger",
  recomendado: "bg-info-bg text-info",
  condicional: "bg-warning-bg text-warning",
};

const RELEVANCIA_LABEL: Record<string, string> = {
  alta: "Relevancia alta",
  media: "Relevancia media",
  baja: "Relevancia baja",
};

const ORDEN_RIESGO: NivelRiesgo[] = ["bajo", "medio", "alto"];

function nombrePais(iso: string) {
  return NOMBRE_PAIS[iso.toUpperCase()] ?? iso.toUpperCase();
}

/** Riesgo global de una regla: el más alto de sus riesgos (bajo si no hay). */
function riesgoGlobal(r: ReglaNormativa): NivelRiesgo {
  let max = 0;
  for (const ri of r.riesgos) {
    const i = ORDEN_RIESGO.indexOf(ri.nivel as NivelRiesgo);
    if (i > max) max = i;
  }
  return ORDEN_RIESGO[max];
}

const norm = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function NormativaBuscador({ reglas }: { reglas: ReglaNormativa[] }) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [pais, setPais] = useState("");
  const [riesgo, setRiesgo] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);

  // Opciones de país derivadas de las propias reglas (origen ∪ destino).
  const paises = useMemo(() => {
    const set = new Set<string>();
    for (const r of reglas) {
      if (r.origen) set.add(r.origen.toUpperCase());
      if (r.destino) set.add(r.destino.toUpperCase());
    }
    return [...set].sort();
  }, [reglas]);

  const resultados = useMemo(() => {
    const texto = norm(q.trim());
    return reglas.filter((r) => {
      if (tipo && r.tipo !== tipo) return false;
      if (riesgo && riesgoGlobal(r) !== riesgo) return false;
      if (pais) {
        const p = pais.toUpperCase();
        if (r.origen?.toUpperCase() !== p && r.destino?.toUpperCase() !== p)
          return false;
      }
      if (texto) {
        const heno = norm(
          [
            r.nombre,
            r.resumen,
            r.productoMatch ?? "",
            r.hsTaric ?? "",
            ...r.normativa.map((n) => n.titulo),
            ...r.documentos.map((d) => d.doc),
          ].join(" "),
        );
        if (!heno.includes(texto)) return false;
      }
      return true;
    });
  }, [reglas, q, tipo, pais, riesgo]);

  const selectCls =
    "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-brand-500 focus:outline-none";

  return (
    <div className="space-y-5">
      {/* Barra de filtros */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por producto, TARIC, normativa o documento…"
              className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={selectCls}
              aria-label="Tipo de operación"
            >
              <option value="">Todos los tipos</option>
              <option value="importacion">Importación</option>
              <option value="exportacion">Exportación</option>
              <option value="transito">Tránsito</option>
            </select>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className={selectCls}
              aria-label="País"
              disabled={paises.length === 0}
            >
              <option value="">Cualquier país</option>
              {paises.map((p) => (
                <option key={p} value={p}>
                  {flag(p)} {nombrePais(p)}
                </option>
              ))}
            </select>
            <select
              value={riesgo}
              onChange={(e) => setRiesgo(e.target.value)}
              className={selectCls}
              aria-label="Nivel de riesgo"
            >
              <option value="">Cualquier riesgo</option>
              <option value="bajo">Riesgo bajo</option>
              <option value="medio">Riesgo medio</option>
              <option value="alto">Riesgo alto</option>
            </select>
            {(q || tipo || pais || riesgo) && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setTipo("");
                  setPais("");
                  setRiesgo("");
                }}
                className="h-10 rounded-lg px-3 text-sm font-medium text-brand-700 hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      <p className="text-sm text-muted">
        {resultados.length}{" "}
        {resultados.length === 1
          ? "requisito coincide"
          : "requisitos coinciden"}{" "}
        con tu búsqueda
      </p>

      {resultados.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <BookOpen className="size-8 text-faint" />
            <p className="font-medium text-ink">Sin coincidencias</p>
            <p className="max-w-sm text-sm text-muted">
              Prueba con otros términos o quita algún filtro. La base de
              conocimiento crece a medida que se añaden reglas.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {resultados.map((r) => (
            <ReglaCard
              key={r.nombre}
              regla={r}
              abierta={abierta === r.nombre}
              onToggle={() =>
                setAbierta((a) => (a === r.nombre ? null : r.nombre))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReglaCard({
  regla: r,
  abierta,
  onToggle,
}: {
  regla: ReglaNormativa;
  abierta: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{r.nombre}</h3>
            {r.tipo && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {TIPO_LABEL[r.tipo] ?? r.tipo}
              </span>
            )}
            <RiesgoBadge nivel={riesgoGlobal(r)} />
            {r.hsTaric && (
              <span className="rounded-full bg-canvas px-2.5 py-0.5 font-mono text-xs text-muted">
                TARIC {r.hsTaric}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted">{r.resumen}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
            {r.origen && (
              <span>
                Origen: {flag(r.origen)} {nombrePais(r.origen)}
              </span>
            )}
            {r.destino && (
              <span>
                Destino: {flag(r.destino)} {nombrePais(r.destino)}
              </span>
            )}
            <ConfianzaBar valor={r.confianza} />
          </div>
        </div>
        <ChevronDown
          className={`mt-1 size-5 shrink-0 text-faint transition-transform ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierta && (
        <div className="space-y-5 border-t border-line px-5 py-5">
          <Seccion icono={FileText} titulo="Documentación">
            <ul className="space-y-1.5">
              {r.documentos.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-ink">{d.doc}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      ESTADO_DOC[d.estado] ?? "bg-canvas text-muted"
                    }`}
                  >
                    {d.estado}
                  </span>
                </li>
              ))}
            </ul>
          </Seccion>

          {r.requisitosSanitarios.length > 0 && (
            <Seccion icono={Stethoscope} titulo="Requisitos sanitarios">
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                {r.requisitosSanitarios.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Seccion>
          )}

          <Seccion icono={ShieldAlert} titulo="Riesgos">
            <ul className="space-y-2">
              {r.riesgos.map((ri, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <RiesgoBadge nivel={ri.nivel as NivelRiesgo} />
                  <span className="text-muted">{ri.motivo}</span>
                </li>
              ))}
            </ul>
          </Seccion>

          {r.alertas.length > 0 && (
            <Seccion icono={AlertTriangle} titulo="Alertas">
              <ul className="space-y-1.5">
                {r.alertas.map((a, i) => (
                  <li
                    key={i}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      a.severidad === "critica"
                        ? "bg-danger-bg text-danger"
                        : a.severidad === "advertencia"
                          ? "bg-warning-bg text-warning"
                          : "bg-info-bg text-info"
                    }`}
                  >
                    {a.mensaje}
                  </li>
                ))}
              </ul>
            </Seccion>
          )}

          <Seccion icono={ListChecks} titulo="Pasos recomendados">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">
              {r.pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </Seccion>

          <Seccion icono={BookOpen} titulo="Fuente normativa">
            <ul className="space-y-2">
              {r.normativa.map((n, i) => (
                <li key={i} className="text-sm">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 font-medium text-brand-700 hover:underline"
                    >
                      {n.titulo}
                      <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-ink">{n.titulo}</span>
                  )}
                  <span className="ml-1 text-xs text-faint">
                    · {n.fuente} · {RELEVANCIA_LABEL[n.relevancia] ?? n.relevancia}
                  </span>
                </li>
              ))}
            </ul>
          </Seccion>

          {r.verificar.length > 0 && (
            <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
              <span className="font-medium text-ink">A verificar:</span>{" "}
              {r.verificar.join(" · ")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Seccion({
  icono: Icono,
  titulo,
  children,
}: {
  icono: React.ComponentType<{ className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icono className="size-4" /> {titulo}
      </h4>
      {children}
    </div>
  );
}
