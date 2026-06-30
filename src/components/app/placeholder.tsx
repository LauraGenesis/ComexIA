import { Card, CardBody } from "@/components/ui/card";

export function Placeholder({
  titulo,
  descripcion,
  proximamente,
}: {
  titulo: string;
  descripcion: string;
  proximamente: string[];
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{titulo}</h1>
        <p className="text-sm text-muted">{descripcion}</p>
      </div>
      <Card>
        <CardBody>
          <p className="mb-3 text-sm font-medium text-ink">
            En esta sección podrás:
          </p>
          <ul className="space-y-2 text-sm text-muted">
            {proximamente.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-accent-500">›</span> {p}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
