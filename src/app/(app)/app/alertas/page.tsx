import { Card, CardBody } from "@/components/ui/card";
import { SeveridadIcon } from "@/components/badges";
import { getAlertas } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const alertas = await getAlertas();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Centro de alertas</h1>
        <p className="text-sm text-muted">
          Controles reforzados, documentación incompleta y cambios normativos.
        </p>
      </div>
      <Card>
        <CardBody className="space-y-0 p-0">
          {alertas.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 border-b border-line px-5 py-4 last:border-0"
            >
              <SeveridadIcon severidad={a.severidad} />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{a.titulo}</p>
                <p className="text-xs text-muted">{a.detalle}</p>
              </div>
              <span className="text-xs text-muted">{a.fecha}</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
