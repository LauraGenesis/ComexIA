import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EstadoBadge, RiesgoBadge, ConfianzaBar } from "@/components/badges";
import { ExpedienteTabs } from "@/components/app/expediente-tabs";
import { TituloEditable } from "@/components/app/titulo-editable";
import { getExpedienteById, getEventos } from "@/lib/repo";
import { flag, formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpedienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exp = await getExpedienteById(id);
  if (!exp) notFound();
  const eventos = await getEventos(id);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/app/expedientes"
        className="text-sm text-muted hover:text-ink"
      >
        ← Expedientes
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-x-2 text-xl font-semibold text-ink">
              <TituloEditable id={exp.id} titulo={exp.producto} />
              <span className="font-normal text-muted">
                · {flag(exp.origen)} {exp.origen} → {exp.destino}{" "}
                {flag(exp.destino)}
              </span>
            </h1>
            <p className="text-sm text-muted">
              {exp.ref} · {exp.tipo} definitiva
            </p>
          </div>
          <EstadoBadge estado={exp.estado} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          {[exp.hsTaric, exp.incoterm, exp.transporte, exp.valor ? formatEUR(exp.valor) : null]
            .filter(Boolean)
            .map((chip) => (
              <span
                key={chip as string}
                className="rounded-full bg-canvas px-2.5 py-1"
              >
                {chip}
              </span>
            ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <RiesgoBadge nivel={exp.riesgo} />
          {exp.confianza != null && (
            <span className="flex items-center gap-2 text-sm text-muted">
              Confianza resolución <ConfianzaBar valor={exp.confianza} />
            </span>
          )}
        </div>
      </Card>

      <ExpedienteTabs exp={exp} eventos={eventos} />
    </div>
  );
}
