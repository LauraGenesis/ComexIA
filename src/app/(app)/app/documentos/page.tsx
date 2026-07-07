import Link from "next/link";
import { FileText, ArrowRight, History } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { CATALOGO } from "@/lib/documentos/catalogo";
import { ExtractorDossier } from "@/components/documentos/extractor-dossier";

const CATEGORIAS = [
  "Aduaneros",
  "Comerciales",
  "Origen",
  "Sanitarios",
  "Peligrosas",
  "Transporte",
  "Tránsito",
];

export default function DocumentosPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Generar documento</h1>
          <p className="text-sm text-muted">
            Sube tus documentos y deja que la IA los rellene, o elige un tipo del
            catálogo y complétalo a mano con validación y vista previa.
          </p>
        </div>
        <Link
          href="/app/documentos/historial"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted hover:text-ink"
        >
          <History className="size-4" /> Historial
        </Link>
      </div>

      <ExtractorDossier />

      {CATEGORIAS.map((cat) => {
        const docs = CATALOGO.filter((d) => d.categoria === cat);
        if (docs.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {cat}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) =>
                d.disponible && d.href ? (
                  <Link key={d.id} href={d.href}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardBody className="flex items-start justify-between gap-3">
                        <div>
                          <FileText className="size-5 text-brand-700" />
                          <p className="mt-2 font-medium text-ink">{d.nombre}</p>
                          <p className="text-xs text-success">Disponible</p>
                        </div>
                        <ArrowRight className="size-4 text-brand-700" />
                      </CardBody>
                    </Card>
                  </Link>
                ) : (
                  <Card key={d.id} className="h-full opacity-60">
                    <CardBody>
                      <FileText className="size-5 text-faint" />
                      <p className="mt-2 font-medium text-ink">{d.nombre}</p>
                      <p className="text-xs text-muted">Próximamente</p>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
