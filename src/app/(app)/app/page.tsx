import Link from "next/link";
import {
  Sparkles,
  FileText,
  BookOpen,
  Plus,
  ArrowRight,
  FolderOpen,
  FileWarning,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import {
  EstadoBadge,
  RiesgoBadge,
  SeveridadIcon,
} from "@/components/badges";
import {
  getExpedientes,
  getAlertas,
  getAccionesPendientes,
  getKpis,
} from "@/lib/repo";
import { flag } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RIESGO_LABEL = { bajo: "Bajo", medio: "Medio", alto: "Alto" } as const;

export default async function DashboardPage() {
  const [expedientes, alertas, accionesPendientes, kpis] = await Promise.all([
    getExpedientes(),
    getAlertas(),
    getAccionesPendientes(),
    getKpis(),
  ]);

  const riesgoColor =
    kpis.riesgoCartera === "alto"
      ? "text-danger"
      : kpis.riesgoCartera === "medio"
        ? "text-warning"
        : "text-success";
  const riesgoChip =
    kpis.riesgoCartera === "alto"
      ? "bg-danger-bg"
      : kpis.riesgoCartera === "medio"
        ? "bg-warning-bg"
        : "bg-success-bg";

  const KPIS = [
    { label: "Expedientes activos", valor: String(kpis.expedientesActivos), nota: "en curso", icon: FolderOpen, href: "/app/expedientes", color: "text-brand-700", chip: "bg-brand-50" },
    { label: "Documentos pendientes", valor: String(kpis.documentosPendientes), nota: "⚠ revisar", icon: FileWarning, href: "/app/documentos", color: "text-warning", chip: "bg-warning-bg" },
    { label: "Alertas críticas", valor: String(kpis.alertasCriticas), nota: "atender", icon: AlertTriangle, href: "/app/alertas", color: "text-danger", chip: "bg-danger-bg" },
    { label: "Riesgo de cartera", valor: RIESGO_LABEL[kpis.riesgoCartera], nota: "agregado", icon: Activity, href: "/app/expedientes", color: riesgoColor, chip: riesgoChip },
  ];

  return (
    <div className="bg-canvas-mesh -m-6 min-h-full p-6">
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Saludo + acción */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Hola, Laura 👋</h1>
          <p className="text-sm text-muted">
            Resumen de tus operaciones · hoy 25 jun 2026
          </p>
        </div>
        <ButtonLink href="/app/motor" variant="primary" size="lg">
          <Plus className="size-4" /> Nueva operación
        </ButtonLink>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Link key={k.label} href={k.href} className="group">
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:shadow-md">
              <CardBody>
                <div className="flex items-start justify-between">
                  <span className={`text-3xl font-semibold tracking-tight ${k.color}`}>
                    {k.valor}
                  </span>
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${k.chip} ${k.color}`}
                  >
                    <k.icon className="size-5" />
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{k.label}</p>
                <p className="text-xs text-muted">{k.nota}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expedientes activos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expedientes activos</CardTitle>
            <Link
              href="/app/expedientes"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Ver todos →
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2.5 font-medium">Operación</th>
                  <th className="px-3 py-2.5 font-medium">Ruta</th>
                  <th className="px-3 py-2.5 font-medium">Estado</th>
                  <th className="px-3 py-2.5 font-medium">Riesgo</th>
                  <th className="px-3 py-2.5 font-medium">Próxima acción</th>
                </tr>
              </thead>
              <tbody>
                {expedientes.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-line last:border-0 hover:bg-canvas"
                  >
                    <td className="px-5 py-3">
                      <Link href={`/app/expedientes/${e.id}`} className="block">
                        <span className="font-medium text-ink">
                          {e.producto}
                        </span>
                        <span className="block text-xs text-muted">
                          {e.ref} · {e.tipo}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted">
                      {flag(e.origen)} {e.origen}→{e.destino} {flag(e.destino)}
                    </td>
                    <td className="px-3 py-3">
                      <EstadoBadge estado={e.estado} />
                    </td>
                    <td className="px-3 py-3">
                      <RiesgoBadge nivel={e.riesgo} />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/app/expedientes/${e.id}`}
                        className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                      >
                        {e.proximaAccion}
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Columna derecha */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <Link
                href="/app/alertas"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Ver todas →
              </Link>
            </CardHeader>
            <CardBody className="space-y-3 p-0">
              {alertas.map((a) => (
                <div
                  key={a.id}
                  className="flex gap-3 border-b border-line px-5 py-3 last:border-0"
                >
                  <SeveridadIcon severidad={a.severidad} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{a.titulo}</p>
                    <p className="truncate text-xs text-muted">{a.detalle}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas acciones</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {accionesPendientes.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <input type="checkbox" className="size-4 rounded border-line" />
                  <span className="flex-1 text-ink">{a.titulo}</span>
                  <span className="text-xs text-muted">{a.plazo}</span>
                </label>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Accesos rápidos */}
      <Card>
        <CardBody className="flex flex-wrap gap-3">
          <ButtonLink href="/app/motor" variant="secondary">
            <Sparkles className="size-4 text-accent-500" /> Preguntar a la IA
          </ButtonLink>
          <ButtonLink href="/app/documentos" variant="secondary">
            <FileText className="size-4" /> Generar documento
          </ButtonLink>
          <ButtonLink href="/app/normativa" variant="secondary">
            <BookOpen className="size-4" /> Buscar normativa
          </ButtonLink>
        </CardBody>
      </Card>
    </div>
    </div>
  );
}
