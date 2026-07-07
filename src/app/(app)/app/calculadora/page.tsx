"use client";

import { useMemo, useState } from "react";
import { Plane, Ship, Truck, Container, Plus, Trash2, Calculator } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatEUR } from "@/lib/utils";
import {
  FACTORES,
  MODOS,
  CONTENEDORES,
  TIPOS_CONTENEDOR,
  bultoVacio,
  calcular,
  calcularFCL,
  volumenBulto,
  type Bulto,
  type ModoTransporte,
  type TipoContenedor,
} from "@/lib/calculadora";

const ICONO: Record<ModoTransporte, typeof Plane> = {
  aereo: Plane,
  maritimo: Ship,
  carretera: Truck,
};

const nf = (max: number) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: max });

function fmt(n: number, max = 2) {
  return nf(max).format(n);
}

function pct(n: number) {
  return `${fmt(n * 100, 0)}%`;
}

let _id = 1;
const nuevoId = () => `b${_id++}`;

export default function CalculadoraPage() {
  const [modo, setModo] = useState<ModoTransporte>("aereo");
  const [servicio, setServicio] = useState<"lcl" | "fcl">("lcl");
  const [tipoCont, setTipoCont] = useState<TipoContenedor>("40gp");
  const [tarifa, setTarifa] = useState("");
  const [comision, setComision] = useState("");
  const [bultos, setBultos] = useState<Bulto[]>([
    { ...bultoVacio(nuevoId()), cantidad: 1, largo: 120, ancho: 80, alto: 100, peso: 250 },
  ]);

  const factor = FACTORES[modo];
  const tarifaNum = Number(tarifa.replace(",", ".")) || 0;
  const comisionNum = Number(comision.replace(",", ".")) || 0;
  const esMaritimo = modo === "maritimo";
  const esFCL = esMaritimo && servicio === "fcl";

  const resultado = useMemo(
    () => calcular(bultos, modo, tarifaNum, comisionNum),
    [bultos, modo, tarifaNum, comisionNum],
  );
  const resFCL = useMemo(
    () => calcularFCL(bultos, tipoCont, tarifaNum, comisionNum),
    [bultos, tipoCont, tarifaNum, comisionNum],
  );

  function actualizar(id: string, campo: keyof Bulto, valor: string) {
    const num = campo === "cantidad" ? parseInt(valor, 10) : Number(valor.replace(",", "."));
    setBultos((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, [campo]: Number.isFinite(num) ? num : 0 } : b,
      ),
    );
  }

  function añadir() {
    setBultos((prev) => [...prev, bultoVacio(nuevoId())]);
  }

  function eliminar(id: string) {
    setBultos((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  }

  const tarifaLabel = esFCL ? "€/contenedor" : factor.unidadTarifa;

  return (
    <div className="bg-canvas-mesh -m-6 min-h-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Cabecera */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
              <Calculator className="size-6 text-accent-500" />
              Calculadora de volumen y peso facturable
            </h1>
            <p className="text-sm text-muted">
              Calcula m³, peso volumétrico y coste estimado para presupuestar
              flete aéreo, marítimo (LCL/FCL) o por carretera.
            </p>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="grid grid-cols-3 gap-3">
          {MODOS.map((m) => {
            const Icon = ICONO[m];
            const f = FACTORES[m];
            const activo = m === modo;
            return (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-[var(--radius-card)] border p-4 text-left transition-all",
                  activo
                    ? "border-brand-500 bg-brand-50 shadow-[var(--shadow-brand)]"
                    : "border-line bg-surface hover:border-line-strong hover:bg-canvas",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-lg",
                    activo ? "bg-brand-gradient text-white" : "bg-surface-sunken text-muted",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className={cn("mt-1 text-sm font-semibold", activo ? "text-brand-700" : "text-ink")}>
                  {f.label}
                </span>
                <span className="text-xs text-muted">
                  {m === "maritimo"
                    ? "LCL (W/M) o FCL por contenedor"
                    : `1 m³ ≈ ${fmt(f.kgPorM3, 0)} kg · ÷${f.divisor}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-servicio marítimo: LCL vs FCL */}
        {esMaritimo && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-line bg-surface p-1">
              {(["lcl", "fcl"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setServicio(s)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    servicio === s
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {s === "lcl" ? "LCL · grupaje" : "FCL · contenedor completo"}
                </button>
              ))}
            </div>

            {esFCL && (
              <div className="inline-flex flex-wrap gap-2">
                {TIPOS_CONTENEDOR.map((t) => {
                  const c = CONTENEDORES[t];
                  const activo = t === tipoCont;
                  return (
                    <button
                      key={t}
                      onClick={() => setTipoCont(t)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all",
                        activo
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                      )}
                    >
                      <Container className="size-4" />
                      <span className="font-medium">{c.label}</span>
                      <span className="text-xs opacity-70">
                        {fmt(c.volumenM3, 0)} m³ · {fmt(c.payloadKg / 1000, 0)} t
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Partidas / bultos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bultos de la operación</CardTitle>
              <Button variant="secondary" size="sm" onClick={añadir}>
                <Plus className="size-4" /> Añadir bulto
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-4 py-2.5 font-medium">Cant.</th>
                    <th className="px-2 py-2.5 font-medium">Largo (cm)</th>
                    <th className="px-2 py-2.5 font-medium">Ancho (cm)</th>
                    <th className="px-2 py-2.5 font-medium">Alto (cm)</th>
                    <th className="px-2 py-2.5 font-medium">Peso/ud (kg)</th>
                    <th className="px-2 py-2.5 text-right font-medium">m³</th>
                    <th className="px-2 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {bultos.map((b) => (
                    <tr key={b.id} className="border-b border-line last:border-0">
                      {(["cantidad", "largo", "ancho", "alto", "peso"] as const).map(
                        (campo) => (
                          <td key={campo} className="px-2 py-2 first:pl-4">
                            <input
                              type="number"
                              min={0}
                              value={b[campo] === 0 ? "" : b[campo]}
                              placeholder="0"
                              onChange={(e) => actualizar(b.id, campo, e.target.value)}
                              className="w-20 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            />
                          </td>
                        ),
                      )}
                      <td className="px-2 py-2 text-right font-medium text-ink whitespace-nowrap">
                        {fmt(volumenBulto(b), 3)}
                      </td>
                      <td className="px-2 py-2 pr-4 text-right">
                        <button
                          onClick={() => eliminar(b.id)}
                          disabled={bultos.length === 1}
                          className="text-faint transition-colors hover:text-danger disabled:opacity-30 disabled:hover:text-faint"
                          aria-label="Eliminar bulto"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardBody className="space-y-3 border-t border-line">
              <label className="flex flex-wrap items-center gap-3 text-sm">
                <span className="w-28 font-medium text-ink">Tarifa de flete</span>
                <input
                  type="number"
                  min={0}
                  value={tarifa}
                  placeholder="0"
                  onChange={(e) => setTarifa(e.target.value)}
                  className="w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-muted">{tarifaLabel}</span>
              </label>
              <label className="flex flex-wrap items-center gap-3 text-sm">
                <span className="w-28 font-medium text-ink">Comisión</span>
                <input
                  type="number"
                  min={0}
                  value={comision}
                  placeholder="0"
                  onChange={(e) => setComision(e.target.value)}
                  className="w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-muted">% sobre el flete</span>
              </label>
            </CardBody>
          </Card>

          {/* Resultados */}
          <div className="space-y-4">
            {esFCL ? (
              <ResultadoFCLCard
                res={resFCL}
                tipo={tipoCont}
                tarifa={tarifaNum}
                comisionPct={comisionNum}
              />
            ) : (
              <ResultadoFleteCard
                res={resultado}
                esMaritimo={esMaritimo}
                factorLabel={esMaritimo ? "Marítimo · LCL" : factor.label}
                tarifa={tarifaNum}
                comisionPct={comisionNum}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Resultado aéreo / carretera / marítimo LCL ──────────────────────────────

function ResultadoFleteCard({
  res,
  esMaritimo,
  factorLabel,
  tarifa,
  comisionPct,
}: {
  res: ReturnType<typeof calcular>;
  esMaritimo: boolean;
  factorLabel: string;
  tarifa: number;
  comisionPct: number;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Resultado · {factorLabel}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Fila label="Total bultos" valor={fmt(res.totalBultos, 0)} />
          <Fila label="Volumen total" valor={`${fmt(res.volumenM3, 3)} m³`} destacado />
          <Fila label="Peso bruto real" valor={`${fmt(res.pesoRealKg)} kg`} />

          {esMaritimo ? (
            <>
              <Fila label="Toneladas (W)" valor={`${fmt(res.toneladas, 3)} t`} />
              <Fila label="Unidades de flete R/T" valor={fmt(res.unidadesRT, 3)} destacado />
            </>
          ) : (
            <>
              <Fila label="Peso volumétrico" valor={`${fmt(res.pesoVolumetricoKg)} kg`} />
              <Fila label="Peso facturable" valor={`${fmt(res.pesoFacturableKg)} kg`} destacado />
            </>
          )}

          <div className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-muted">
            Factura por{" "}
            <span className="font-semibold text-ink">
              {res.base === "peso" ? "peso" : "volumen"}
            </span>{" "}
            — {esMaritimo
              ? res.base === "peso"
                ? "las toneladas superan a los m³."
                : "los m³ superan a las toneladas."
              : res.base === "peso"
                ? "el peso real supera al volumétrico."
                : "el volumen supera al peso real (carga voluminosa)."}
          </div>
        </CardBody>
      </Card>

      <CosteCard
        coste={res.coste}
        detalle={
          esMaritimo
            ? `${fmt(res.unidadesRT, 2)} R/T × ${fmt(tarifa)} €`
            : `${fmt(res.pesoFacturableKg)} kg × ${fmt(tarifa, 3)} €/kg`
        }
      />

      <ComisionCard
        comisionPct={comisionPct}
        comision={res.comision}
        costeTotal={res.costeTotal}
      />
    </>
  );
}

// ── Resultado marítimo FCL ──────────────────────────────────────────────────

function ResultadoFCLCard({
  res,
  tipo,
  tarifa,
  comisionPct,
}: {
  res: ReturnType<typeof calcularFCL>;
  tipo: TipoContenedor;
  tarifa: number;
  comisionPct: number;
}) {
  const c = CONTENEDORES[tipo];
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Resultado · FCL {c.label}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight text-brand-700">
              {res.contenedores}
            </span>
            <span className="mb-1 text-sm text-muted">
              contenedor{res.contenedores === 1 ? "" : "es"} {c.label}
            </span>
          </div>

          <div className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-muted">
            Limita el{" "}
            <span className="font-semibold text-ink">
              {res.limitante === "volumen" ? "volumen" : "peso"}
            </span>{" "}
            — {res.contPorVolumen} por m³ vs. {res.contPorPeso} por payload.
          </div>

          <Fila label="Total bultos" valor={fmt(res.totalBultos, 0)} />
          <Fila label="Volumen total" valor={`${fmt(res.volumenM3, 3)} m³`} />
          <Fila label="Peso bruto real" valor={`${fmt(res.pesoRealKg)} kg`} />

          <Barra
            label="Aprovechamiento volumen"
            valor={res.llenadoVolumen}
            color="bg-brand-gradient"
          />
          <Barra
            label="Aprovechamiento payload"
            valor={res.llenadoPeso}
            color="bg-accent-500"
          />
        </CardBody>
      </Card>

      <CosteCard
        coste={res.coste}
        detalle={`${res.contenedores} × ${formatEUR(tarifa)}/contenedor`}
      />

      <ComisionCard
        comisionPct={comisionPct}
        comision={res.comision}
        costeTotal={res.costeTotal}
      />
    </>
  );
}

// ── Piezas compartidas ──────────────────────────────────────────────────────

function CosteCard({ coste, detalle }: { coste: number | null; detalle: string }) {
  return (
    <Card>
      <CardBody className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Coste estimado de flete
        </p>
        <p className="text-3xl font-semibold tracking-tight text-brand-700">
          {coste === null ? "—" : formatEUR(coste)}
        </p>
        <p className="text-xs text-muted">
          {coste === null ? "Introduce una tarifa para estimar el coste." : detalle}
        </p>
      </CardBody>
    </Card>
  );
}

function ComisionCard({
  comisionPct,
  comision,
  costeTotal,
}: {
  comisionPct: number;
  comision: number | null;
  costeTotal: number | null;
}) {
  const sinComision = comision === null || comisionPct <= 0;
  return (
    <Card>
      <CardBody className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Comisión
            </p>
            {comisionPct > 0 && (
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-700">
                {fmt(comisionPct, 2)} %
              </span>
            )}
          </div>
          <p className="text-3xl font-semibold tracking-tight text-brand-700">
            {sinComision ? "—" : formatEUR(comision)}
          </p>
          <p className="text-xs text-muted">
            {comision === null
              ? "Introduce una tarifa para estimar la comisión."
              : comisionPct <= 0
                ? "Introduce un % de comisión sobre el flete."
                : `${fmt(comisionPct, 2)} % sobre el flete estimado.`}
          </p>
        </div>

        {costeTotal !== null && (
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Total con comisión
            </span>
            <span className="text-lg font-semibold tabular-nums text-ink">
              {formatEUR(costeTotal)}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Fila({
  label,
  valor,
  destacado,
}: {
  label: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span
        className={cn(
          "text-sm tabular-nums",
          destacado ? "font-semibold text-ink" : "text-ink",
        )}
      >
        {valor}
      </span>
    </div>
  );
}

function Barra({
  label,
  valor,
  color,
}: {
  label: string;
  valor: number;
  color: string;
}) {
  const ancho = Math.min(valor, 1) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-ink tabular-nums">{pct(valor)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}
