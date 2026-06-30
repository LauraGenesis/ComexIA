import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EstadoBadge, RiesgoBadge } from "@/components/badges";
import { getExpedientes } from "@/lib/repo";
import { flag, formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpedientesPage() {
  const expedientes = await getExpedientes();
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Expedientes</h1>
          <p className="text-sm text-muted">
            {expedientes.length} operaciones en curso
          </p>
        </div>
        <ButtonLink href="/app/motor">
          <Plus className="size-4" /> Nueva operación
        </ButtonLink>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Operación</th>
              <th className="px-3 py-3 font-medium">Ruta</th>
              <th className="px-3 py-3 font-medium">TARIC</th>
              <th className="px-3 py-3 font-medium">Valor</th>
              <th className="px-3 py-3 font-medium">Estado</th>
              <th className="px-3 py-3 font-medium">Riesgo</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {expedientes.map((e) => (
              <tr
                key={e.id}
                className="border-b border-line last:border-0 hover:bg-canvas"
              >
                <td className="px-5 py-3">
                  <Link href={`/app/expedientes/${e.id}`}>
                    <span className="font-medium text-ink">{e.producto}</span>
                    <span className="block text-xs text-muted">
                      {e.ref} · {e.tipo}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-muted">
                  {flag(e.origen)} {e.origen}→{e.destino} {flag(e.destino)}
                </td>
                <td className="px-3 py-3 text-muted">{e.hsTaric}</td>
                <td className="px-3 py-3 text-muted">
                  {e.valor ? formatEUR(e.valor) : "—"}
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
                    className="text-brand-700 hover:underline"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
