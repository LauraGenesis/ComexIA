"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  FileText,
  ShieldAlert,
  BookOpen,
  ListChecks,
  Info,
  FolderPlus,
  Database,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfianzaBar } from "@/components/badges";
import type { Resolucion, MotorUsado } from "@/lib/motor";

const EJEMPLOS = [
  "Quiero importar semillas de sésamo desde India a España. ¿Qué documentación necesito?",
  "Exportar calzado de piel a Japón",
  "Importar lámparas de mesa desde China",
  "Tránsito T1 de repuestos de Alemania a Portugal",
];

type Estado = "entrada" | "procesando" | "resuelto";

export default function MotorPage() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<Estado>("entrada");
  const [resolucion, setResolucion] = useState<Resolucion | null>(null);
  const [motor, setMotor] = useState<MotorUsado>("demo");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  // Refinamientos: detalles que el usuario añade tras la primera resolución.
  // El motor recalcula con la consulta original + todos los refinamientos.
  const [refinamientos, setRefinamientos] = useState<string[]>([]);
  const [refinando, setRefinando] = useState(false);

  async function crearExpediente() {
    if (!resolucion) return;
    setCreando(true);
    try {
      const res = await fetch("/api/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, resolucion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear");
      router.push(`/app/expedientes/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear el expediente");
      setCreando(false);
    }
  }

  /** Llama al endpoint del motor con el contenido dado. */
  async function llamarMotor(contenido: string) {
    const res = await fetch("/api/motor/resolver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: contenido }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al resolver");
    return data as { resolucion: Resolucion; motor: string };
  }

  function normalizarMotor(m: string): MotorUsado {
    return m === "reglas" || m === "claude" || m === "claude_base" ? m : "demo";
  }

  async function resolver() {
    if (!texto.trim()) return;
    setEstado("procesando");
    setError(null);
    setRefinamientos([]);
    try {
      const data = await llamarMotor(texto);
      setResolucion(data.resolucion);
      setMotor(normalizarMotor(data.motor));
      setEstado("resuelto");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setEstado("entrada");
    }
  }

  /** Re-resuelve sumando un nuevo detalle al contexto acumulado. */
  async function refinar(detalle: string) {
    const extra = detalle.trim();
    if (!extra) return;
    setRefinando(true);
    setError(null);
    try {
      const contenido = [texto, ...refinamientos, extra].join("\n");
      const data = await llamarMotor(contenido);
      setResolucion(data.resolucion);
      setMotor(normalizarMotor(data.motor));
      setRefinamientos((prev) => [...prev, extra]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo afinar la consulta");
    } finally {
      setRefinando(false);
    }
  }

  function reiniciar() {
    setEstado("entrada");
    setResolucion(null);
    setRefinamientos([]);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {estado !== "resuelto" && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Resolver una operación
            </h1>
            <p className="text-sm text-muted">
              Describe tu caso y ComexIA derivará requisitos, documentos y
              riesgos — aunque sea una operación nueva.
            </p>
          </div>

          <Card>
            <CardBody className="space-y-4">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={3}
                placeholder="Ej.: Quiero importar semillas de sésamo desde India a España. ¿Qué necesito?"
                disabled={estado === "procesando"}
                className="w-full resize-none rounded-lg border border-line bg-canvas p-3 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none"
              />
              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {EJEMPLOS.map((ej) => (
                  <button
                    key={ej}
                    onClick={() => setTexto(ej)}
                    disabled={estado === "procesando"}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted hover:border-brand-500 hover:text-brand-700"
                  >
                    {ej.length > 42 ? ej.slice(0, 42) + "…" : ej}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={resolver}
                  disabled={estado === "procesando" || !texto.trim()}
                  size="lg"
                >
                  {estado === "procesando" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Resolviendo…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Resolver operación
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>

          {estado === "procesando" && <Procesando />}
        </div>
      )}

      {estado === "resuelto" && resolucion && (
        <ResultadoResolucion
          resolucion={resolucion}
          motor={motor}
          creando={creando}
          consulta={texto}
          refinamientos={refinamientos}
          refinando={refinando}
          error={error}
          onVolver={reiniciar}
          onCrear={crearExpediente}
          onRefinar={refinar}
        />
      )}
    </div>
  );
}

function Procesando() {
  const pasos = [
    "Comprendiendo el caso",
    "Clasificando operación",
    "Derivando requisitos normativos",
    "Seleccionando documentación",
    "Evaluando riesgo de inspección",
    "Generando plan de acción",
  ];
  return (
    <Card>
      <CardBody className="space-y-2.5">
        <p className="text-sm font-medium text-ink">Resolviendo tu operación…</p>
        {pasos.map((p, i) => (
          <div key={p} className="flex items-center gap-2 text-sm">
            {i < 2 ? (
              <CheckCircle2 className="size-4 text-success" />
            ) : i === 2 ? (
              <Loader2 className="size-4 animate-spin text-brand-700" />
            ) : (
              <span className="size-4 rounded-full border border-line" />
            )}
            <span className={i <= 2 ? "text-ink" : "text-muted"}>{p}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/** Sección minimalista: encabezado sutil + contenido, sin tarjeta propia. */
function Seccion({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-3.5 text-faint" />
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

/** Estado de un documento, en texto discreto con color según obligatoriedad. */
function EstadoDoc({ estado }: { estado: string }) {
  const color =
    estado === "obligatorio"
      ? "text-ink"
      : estado === "condicional"
        ? "text-warning"
        : "text-faint";
  return (
    <span
      className={`shrink-0 text-[11px] font-medium uppercase tracking-wide ${color}`}
    >
      {estado}
    </span>
  );
}

function ResultadoResolucion({
  resolucion,
  motor,
  creando,
  consulta,
  refinamientos,
  refinando,
  error,
  onVolver,
  onCrear,
  onRefinar,
}: {
  resolucion: Resolucion;
  motor: MotorUsado;
  creando: boolean;
  consulta: string;
  refinamientos: string[];
  refinando: boolean;
  error: string | null;
  onVolver: () => void;
  onCrear: () => void;
  onRefinar: (detalle: string) => void;
}) {
  const r = resolucion;
  const atipico = r.confianza < 0.6;
  const [draft, setDraft] = useState("");

  function enviarRefinamiento() {
    const d = draft.trim();
    if (!d || refinando) return;
    onRefinar(d);
    setDraft("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onVolver}
          className="text-sm text-muted hover:text-ink"
        >
          ← Resolver otra operación
        </button>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              motor === "claude" || motor === "claude_base"
                ? "bg-accent-100 text-accent-600"
                : motor === "reglas"
                  ? "bg-success-bg text-success"
                  : "bg-canvas text-muted"
            }`}
            title={
              motor === "claude_base"
                ? "Resuelto con Claude (Haiku), guiado por reglas análogas de tu base de conocimiento"
                : motor === "claude"
                  ? "Resuelto con Claude (Haiku) — caso no cubierto por reglas"
                  : motor === "reglas"
                    ? "Resuelto desde tu base de conocimiento (sin IA)"
                    : "Caso no cubierto por reglas: resolución genérica de referencia"
            }
          >
            {motor === "reglas" ? (
              <Database className="size-3.5" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {motor === "claude_base"
              ? "Claude + base"
              : motor === "claude"
                ? "Claude (Haiku)"
                : motor === "reglas"
                  ? "Base de conocimiento"
                  : "Genérico"}
          </span>
          <span className="flex items-center gap-2">
            Confianza: <ConfianzaBar valor={r.confianza} />
          </span>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <p className="text-ink">{r.resumen}</p>
      </div>

      {/* Refinar: seguir consultando al motor añadiendo contexto (2 columnas) */}
      <div className="rounded-[var(--radius-card)] border border-brand-500/30 bg-brand-50/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <Sparkles className="size-4 text-brand-700" />
          ¿Falta contexto? Afina la consulta
        </div>

        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_minmax(200px,18rem)]">
          {/* Columna izquierda: hilo conversacional (burbujas del usuario) */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              Hilo de la consulta
            </p>
            <div className="space-y-2">
              {[consulta, ...refinamientos].filter(Boolean).map((msg, i) => (
                <div key={i} className="flex items-start justify-end gap-2">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-100 px-3 py-2 text-sm text-ink">
                    {msg}
                  </div>
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs">
                    🧑
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha: campo para seguir afinando */}
          <div className="space-y-2">
            <p className="text-xs text-muted">
              Añade detalles (valor, incoterm, uso, régimen, certificados…) y el
              motor recalculará la resolución.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarRefinamiento();
                }
              }}
              rows={3}
              placeholder="Ej.: el valor es 8.000 € con incoterm CIF y es para reexportación"
              disabled={refinando}
              className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none"
            />
            <Button
              onClick={enviarRefinamiento}
              disabled={refinando || !draft.trim()}
              className="w-full"
            >
              {refinando ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Afinando…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Afinar
                </>
              )}
            </Button>
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
        </div>
      </div>

      {atipico && (
        <div className="rounded-[var(--radius-card)] border border-warning/40 bg-warning-bg p-4 text-sm text-ink">
          <p className="font-medium">Caso poco frecuente</p>
          <p className="text-muted">
            No hay un caso idéntico: ComexIA ha razonado por analogía. Revisa los
            puntos marcados antes de presentar.
          </p>
        </div>
      )}

      {/* Alertas */}
      {r.alertas.map((a, i) => (
        <div
          key={i}
          className={`rounded-[var(--radius-card)] border p-4 text-sm ${
            a.severidad === "critica"
              ? "border-danger/40 bg-danger-bg"
              : a.severidad === "advertencia"
                ? "border-warning/40 bg-warning-bg"
                : "border-info/40 bg-info-bg"
          }`}
        >
          {a.mensaje}
        </div>
      ))}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="divide-y divide-line self-start lg:col-span-2">
          <Seccion icon={FileText} title="Documentación">
            <ul className="space-y-1">
              {r.documentacion.map((d) => (
                <li
                  key={d.doc}
                  className="flex items-center gap-3 py-1 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 rounded border-line accent-brand-600"
                  />
                  <span className="flex-1 leading-snug text-ink">{d.doc}</span>
                  <EstadoDoc estado={d.estado} />
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion icon={BookOpen} title="Normativa aplicable">
            <ul className="space-y-3 text-sm">
              {r.normativa.map((n) => (
                <li key={n.titulo} className="flex flex-col gap-0.5">
                  <span className="leading-snug text-ink">{n.titulo}</span>
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-700 hover:underline"
                    >
                      {n.fuente} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-muted">{n.fuente}</span>
                  )}
                </li>
              ))}
            </ul>
          </Seccion>

          {r.requisitosSanitarios.length > 0 && (
            <Seccion
              icon={ShieldAlert}
              title="Requisitos sanitarios / fitosanitarios"
            >
              <ul className="space-y-2 text-sm">
                {r.requisitosSanitarios.map((req) => (
                  <li key={req} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                    <span className="leading-relaxed text-ink">{req}</span>
                  </li>
                ))}
              </ul>
            </Seccion>
          )}

          <Seccion icon={ListChecks} title="Plan de acción">
            <ol className="space-y-2.5 text-sm">
              {r.pasos.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-medium text-brand-700">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-ink">{p}</span>
                </li>
              ))}
            </ol>
          </Seccion>

          {r.verificar.length > 0 && (
            <Seccion icon={Info} title="Verificar antes de presentar">
              <ul className="space-y-2 text-sm">
                {r.verificar.map((v) => (
                  <li key={v} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-line-strong" />
                    <span className="leading-relaxed text-muted">{v}</span>
                  </li>
                ))}
              </ul>
            </Seccion>
          )}
        </Card>

        {/* Panel lateral */}
        <div className="space-y-4">
          <Card className="self-start">
            <Seccion icon={ShieldAlert} title="Riesgo de inspección">
              <ul className="space-y-3.5">
                {r.riesgos.map((ri, i) => {
                  const color =
                    ri.nivel === "alto"
                      ? "bg-danger"
                      : ri.nivel === "medio"
                        ? "bg-warning"
                        : "bg-success";
                  return (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${color}`}
                      />
                      <div>
                        <p className="font-medium capitalize text-ink">
                          {ri.tipo.replace(/_/g, " ")}
                          <span className="ml-1.5 text-xs font-normal text-muted">
                            · {ri.nivel}
                          </span>
                        </p>
                        <p className="text-xs leading-relaxed text-muted">
                          {ri.motivo}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Seccion>
          </Card>

          <Card>
            <CardBody className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={onCrear}
                disabled={creando}
              >
                {creando ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creando…
                  </>
                ) : (
                  <>
                    <FolderPlus className="size-4" /> Crear expediente
                  </>
                )}
              </Button>
              <Button variant="secondary" className="w-full">
                <FileText className="size-4" /> Generar documentos
              </Button>
              <Button variant="ghost" className="w-full">
                Exportar resolución PDF <ArrowRight className="size-4" />
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
