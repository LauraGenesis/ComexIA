"use client";

import { useEffect, useState } from "react";
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
  History,
  Trash2,
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

/** Un turno del hilo: lo que preguntó el usuario y la resolución del motor. */
type Turno = { pregunta: string; resolucion: Resolucion };

/** Una consulta guardada en el historial: el hilo completo con sus refinamientos. */
type EntradaHistorial = {
  id: string;
  creado: number;
  motor: MotorUsado;
  turnos: Turno[];
};

const HISTORIAL_KEY = "comexia:motor:historial";
const MAX_ENTRADAS = 30;

function nuevoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `h-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  }
}

export default function MotorPage() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<Estado>("entrada");
  const [resolucion, setResolucion] = useState<Resolucion | null>(null);
  const [motor, setMotor] = useState<MotorUsado>("demo");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  // Historial conversacional: cada turno es la pregunta del usuario (consulta
  // inicial o refinamiento) y la respuesta del motor. El motor recalcula con
  // todas las preguntas acumuladas.
  const [historial, setHistorial] = useState<Turno[]>([]);
  const [refinando, setRefinando] = useState(false);
  // Historial persistente de consultas al motor (localStorage). Cada entrada es
  // un hilo completo (consulta inicial + refinamientos) que se puede retomar.
  const [entradas, setEntradas] = useState<EntradaHistorial[]>([]);
  const [entradaActivaId, setEntradaActivaId] = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Carga el historial guardado tras el montaje. Debe ir en un effect (no en el
  // inicializador de useState) para no leer localStorage durante el SSR y evitar
  // desajustes de hidratación: el servidor renderiza sin historial y el cliente
  // lo rellena aquí.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORIAL_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronización con localStorage al montar
      if (raw) setEntradas(JSON.parse(raw) as EntradaHistorial[]);
    } catch {
      // localStorage no disponible o datos corruptos: se ignora.
    }
  }, []);

  /** Actualiza el estado y persiste el historial en localStorage. */
  function persistirEntradas(next: EntradaHistorial[]) {
    setEntradas(next);
    try {
      localStorage.setItem(HISTORIAL_KEY, JSON.stringify(next));
    } catch {
      // Sin persistencia disponible: el historial vivirá solo en memoria.
    }
  }

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
    setHistorial([]);
    try {
      const data = await llamarMotor(texto);
      const m = normalizarMotor(data.motor);
      const turno: Turno = { pregunta: texto, resolucion: data.resolucion };
      setResolucion(data.resolucion);
      setMotor(m);
      setHistorial([turno]);
      // Nueva entrada al frente del historial persistente.
      const id = nuevoId();
      persistirEntradas(
        [
          { id, creado: Date.now(), motor: m, turnos: [turno] },
          ...entradas,
        ].slice(0, MAX_ENTRADAS),
      );
      setEntradaActivaId(id);
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
      const contenido = [...historial.map((t) => t.pregunta), extra].join("\n");
      const data = await llamarMotor(contenido);
      const m = normalizarMotor(data.motor);
      const turno: Turno = { pregunta: extra, resolucion: data.resolucion };
      const nuevosTurnos = [...historial, turno];
      setResolucion(data.resolucion);
      setMotor(m);
      setHistorial(nuevosTurnos);
      // Refleja el refinamiento en la entrada activa del historial.
      if (entradaActivaId) {
        persistirEntradas(
          entradas.map((e) =>
            e.id === entradaActivaId
              ? { ...e, motor: m, turnos: nuevosTurnos }
              : e,
          ),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo afinar la consulta");
    } finally {
      setRefinando(false);
    }
  }

  function reiniciar() {
    setEstado("entrada");
    setResolucion(null);
    setHistorial([]);
    setEntradaActivaId(null);
    setError(null);
  }

  /** Retoma una consulta guardada: restaura su hilo y su resolución vigente. */
  function cargarEntrada(entrada: EntradaHistorial) {
    const ultimo = entrada.turnos[entrada.turnos.length - 1];
    if (!ultimo) return;
    setHistorial(entrada.turnos);
    setResolucion(ultimo.resolucion);
    setMotor(entrada.motor);
    setTexto(entrada.turnos[0].pregunta);
    setEntradaActivaId(entrada.id);
    setError(null);
    setEstado("resuelto");
    setMostrarHistorial(false);
  }

  function borrarEntrada(id: string) {
    persistirEntradas(entradas.filter((e) => e.id !== id));
    if (entradaActivaId === id) setEntradaActivaId(null);
  }

  function borrarHistorial() {
    persistirEntradas([]);
    setEntradaActivaId(null);
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

          <PanelHistorial
            entradas={entradas}
            activaId={entradaActivaId}
            onCargar={cargarEntrada}
            onBorrar={borrarEntrada}
            onBorrarTodo={borrarHistorial}
          />
        </div>
      )}

      {estado === "resuelto" && resolucion && (
        <div className="space-y-4">
          {entradas.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarHistorial((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                >
                  <History className="size-4" />
                  Historial ({entradas.length})
                </button>
              </div>
              {mostrarHistorial && (
                <PanelHistorial
                  entradas={entradas}
                  activaId={entradaActivaId}
                  onCargar={cargarEntrada}
                  onBorrar={borrarEntrada}
                  onBorrarTodo={borrarHistorial}
                />
              )}
            </div>
          )}
          <ResultadoResolucion
            resolucion={resolucion}
            motor={motor}
            creando={creando}
            historial={historial}
            refinando={refinando}
            error={error}
            onVolver={reiniciar}
            onCrear={crearExpediente}
            onRefinar={refinar}
          />
        </div>
      )}
    </div>
  );
}

/** Formatea el instante de una consulta en fecha/hora corta en español. */
function formatFecha(ts: number): string {
  try {
    return new Date(ts).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Lista de consultas guardadas; cada una se puede retomar o borrar. */
function PanelHistorial({
  entradas,
  activaId,
  onCargar,
  onBorrar,
  onBorrarTodo,
}: {
  entradas: EntradaHistorial[];
  activaId: string | null;
  onCargar: (entrada: EntradaHistorial) => void;
  onBorrar: (id: string) => void;
  onBorrarTodo: () => void;
}) {
  if (entradas.length === 0) return null;
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <History className="size-4 text-faint" />
          Consultas recientes
          <span className="text-xs font-normal text-muted">
            ({entradas.length})
          </span>
        </div>
        <button
          onClick={onBorrarTodo}
          className="text-xs text-muted hover:text-danger"
        >
          Borrar todo
        </button>
      </div>
      <ul className="divide-y divide-line">
        {entradas.map((e) => {
          const inicial = e.turnos[0]?.pregunta ?? "(sin consulta)";
          const nRef = Math.max(0, e.turnos.length - 1);
          return (
            <li
              key={e.id}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                e.id === activaId ? "bg-brand-50/40" : ""
              }`}
            >
              <button
                onClick={() => onCargar(e)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm text-ink">{inicial}</p>
                <p className="text-xs text-muted">
                  {formatFecha(e.creado)}
                  {nRef > 0 &&
                    ` · ${nRef} refinamiento${nRef > 1 ? "s" : ""}`}
                </p>
              </button>
              <button
                onClick={() => onBorrar(e.id)}
                aria-label="Borrar consulta"
                className="shrink-0 text-faint hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
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
  historial,
  refinando,
  error,
  onVolver,
  onCrear,
  onRefinar,
}: {
  resolucion: Resolucion;
  motor: MotorUsado;
  creando: boolean;
  historial: Turno[];
  refinando: boolean;
  error: string | null;
  onVolver: () => void;
  onCrear: () => void;
  onRefinar: (detalle: string) => void;
}) {
  const r = resolucion;
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

      {/* Conversación principal: hilo tipo chat en un único recuadro que fluye
          (consulta → respuesta, refinamiento → respuesta) con el campo para
          seguir afinando al final. */}
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <div className="space-y-4">
          {historial.map((turno, i) => {
            // El último turno es la respuesta vigente: lleva todo el detalle.
            // Los anteriores quedan como resumen, igual que en un chat real.
            const ultimo = i === historial.length - 1;
            return (
              <div key={i} className="space-y-3">
                {/* Pregunta del usuario (derecha) */}
                <div className="flex items-start justify-end gap-2">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-100 px-3.5 py-2 text-sm text-ink">
                    {turno.pregunta}
                  </div>
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs">
                    🧑
                  </span>
                </div>
                {/* Respuesta del motor (izquierda) */}
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Sparkles className="size-4" />
                  </span>
                  {ultimo ? (
                    <div className="flex-1 space-y-4 rounded-2xl rounded-tl-sm bg-canvas p-4">
                      <p className="text-sm leading-relaxed text-ink">
                        {turno.resolucion.resumen}
                      </p>
                      <RespuestaDetalle r={turno.resolucion} />
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-canvas px-3.5 py-2 text-sm text-ink">
                      {turno.resolucion.resumen}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {refinando && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Loader2 className="size-4 animate-spin" />
              </span>
              Afinando la resolución…
            </div>
          )}
        </div>

        {/* Campo para seguir afinando, dentro del mismo recuadro */}
        <div className="mt-4 border-t border-line pt-4">
          <label className="text-xs text-muted">
            ¿Falta contexto? Añade detalles (valor, incoterm, uso, régimen,
            certificados…) y el motor recalculará.
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  enviarRefinamiento();
                }
              }}
              placeholder="Ej.: valor 8.000 € con incoterm CIF, para reexportación"
              disabled={refinando}
              className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brand-500 focus:outline-none"
            />
            <Button
              onClick={enviarRefinamiento}
              disabled={refinando || !draft.trim()}
              className="shrink-0"
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
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      </div>

      {/* Acciones sobre la resolución vigente */}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onCrear} disabled={creando}>
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
        <Button variant="secondary">
          <FileText className="size-4" /> Generar documentos
        </Button>
        <Button variant="ghost">
          Exportar resolución PDF <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/** Alertas en formato breve: lo más importante primero, una línea por alerta. */
function AlertasBreves({ alertas }: { alertas: Resolucion["alertas"] }) {
  if (alertas.length === 0) return null;
  const orden = { critica: 0, advertencia: 1, info: 2 } as const;
  const ordenadas = [...alertas].sort(
    (a, b) => orden[a.severidad] - orden[b.severidad],
  );
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        A tener en cuenta
      </p>
      <ul className="space-y-1.5">
        {ordenadas.map((a, i) => {
          const color =
            a.severidad === "critica"
              ? "bg-danger"
              : a.severidad === "advertencia"
                ? "bg-warning"
                : "bg-info";
          return (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${color}`} />
              <span className="leading-snug text-ink">{a.mensaje}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Detalle completo de la resolución, embebido en la respuesta del chat. */
function RespuestaDetalle({ r }: { r: Resolucion }) {
  return (
    <div className="space-y-4">
      <AlertasBreves alertas={r.alertas} />

      <div className="divide-y divide-line rounded-xl border border-line bg-surface">
        <Seccion icon={FileText} title="Documentación">
          <ul className="space-y-1">
            {r.documentacion.map((d) => (
              <li key={d.doc} className="flex items-center gap-3 py-1 text-sm">
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
            {r.pasos.map((p, i) => {
              // Algunos pasos vienen con su propio "1." al inicio; lo quitamos
              // para no duplicar el número del círculo.
              const paso = p.replace(/^\s*\d+[.)]\s*/, "");
              return (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-medium text-brand-700">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-ink">{paso}</span>
                </li>
              );
            })}
          </ol>
        </Seccion>

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
      </div>
    </div>
  );
}
