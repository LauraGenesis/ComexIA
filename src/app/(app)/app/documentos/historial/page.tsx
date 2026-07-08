import Link from "next/link";
import { FileText, ArrowRight, Sparkles, Hand, Inbox } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { BorrarDocumento } from "@/components/documentos/historial-acciones";
import { getDocumentosGenerados } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** Ruta del editor para reabrir un documento del historial según su tipo. */
function hrefEditor(tipo: string, id: string): string | null {
  if (tipo === "DUA") return `/app/documentos/dua?historial=${id}`;
  if (tipo === "Packing") return `/app/documentos/packing?historial=${id}`;
  if (tipo === "Factura") return `/app/documentos/factura?historial=${id}`;
  if (tipo === "Origen") return `/app/documentos/origen?historial=${id}`;
  return null; // Otros documentos: cuando tengan editor.
}

export default async function HistorialPage() {
  const documentos = await getDocumentosGenerados();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Historial de documentos
          </h1>
          <p className="text-sm text-muted">
            Documentos generados desde esta sección. Reábrelos para editarlos o
            exportarlos de nuevo.
          </p>
        </div>
        <Link
          href="/app/documentos"
          className="text-sm text-muted hover:text-ink"
        >
          ← Documentos
        </Link>
      </div>

      {documentos.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Inbox className="size-8 text-faint" />
            <p className="font-medium text-ink">Aún no hay documentos</p>
            <p className="max-w-sm text-sm text-muted">
              Genera un documento desde el catálogo o subiendo tus documentos, y
              usa «Guardar en historial» para que aparezca aquí.
            </p>
            <Link
              href="/app/documentos"
              className="mt-2 text-sm font-medium text-brand-700 hover:underline"
            >
              Ir a Documentos →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-2">
          {documentos.map((doc) => {
            const href = hrefEditor(doc.tipo, doc.id);
            return (
              <li key={doc.id}>
                <Card>
                  <CardBody className="flex items-center gap-4">
                    <FileText className="size-5 shrink-0 text-brand-700" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-ink">
                          {doc.titulo}
                        </span>
                        {doc.origen === "extraccion" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                            <Sparkles className="size-3" /> Extraído con IA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-muted">
                            <Hand className="size-3" /> Manual
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {[doc.exportador, doc.importador]
                          .filter(Boolean)
                          .join(" → ") || "Sin partes registradas"}{" "}
                        · {doc.fecha}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {href && (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                        >
                          Abrir <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                      <BorrarDocumento id={doc.id} titulo={doc.titulo} />
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
