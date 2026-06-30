import { cn } from "@/lib/utils";
import type {
  EstadoExpediente,
  NivelRiesgo,
  Severidad,
} from "@/lib/types";

function Dot({ className }: { className?: string }) {
  return <span className={cn("size-1.5 rounded-full", className)} />;
}

const ESTADO: Record<EstadoExpediente, { label: string; cls: string; dot: string }> = {
  borrador: { label: "Borrador", cls: "bg-canvas text-muted", dot: "bg-faint" },
  en_tramite: { label: "En trámite", cls: "bg-info-bg text-info", dot: "bg-info" },
  despachado: { label: "Despachado", cls: "bg-success-bg text-success", dot: "bg-success" },
  incidencia: { label: "Incidencia", cls: "bg-danger-bg text-danger", dot: "bg-danger" },
  cerrado: { label: "Cerrado", cls: "bg-canvas text-muted", dot: "bg-faint" },
};

export function EstadoBadge({ estado }: { estado: EstadoExpediente }) {
  const s = ESTADO[estado];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls)}>
      <Dot className={s.dot} />
      {s.label}
    </span>
  );
}

const RIESGO: Record<NivelRiesgo, { label: string; cls: string; dot: string }> = {
  bajo: { label: "Bajo", cls: "bg-success-bg text-success", dot: "bg-success" },
  medio: { label: "Medio", cls: "bg-warning-bg text-warning", dot: "bg-warning" },
  alto: { label: "Alto", cls: "bg-danger-bg text-danger", dot: "bg-danger" },
};

export function RiesgoBadge({ nivel }: { nivel: NivelRiesgo }) {
  const s = RIESGO[nivel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls)}>
      <Dot className={s.dot} />
      {s.label}
    </span>
  );
}

const SEV: Record<Severidad, string> = {
  info: "text-info",
  advertencia: "text-warning",
  critica: "text-danger",
};

const SEV_ICON: Record<Severidad, string> = {
  info: "🟡",
  advertencia: "🟠",
  critica: "🟥",
};

export function SeveridadIcon({ severidad }: { severidad: Severidad }) {
  return (
    <span className={cn("text-sm", SEV[severidad])} aria-label={severidad}>
      {SEV_ICON[severidad]}
    </span>
  );
}

export function ConfianzaBar({ valor }: { valor: number }) {
  const pct = Math.round(valor * 100);
  const color =
    valor >= 0.75 ? "bg-success" : valor >= 0.5 ? "bg-warning" : "bg-danger";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <span className={cn("block h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </span>
      {pct}%
    </span>
  );
}
