import { FileText, Download, Library } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { BibliotecaUploader } from "@/components/app/biblioteca-uploader";
import { getFuentes } from "@/lib/repo";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BibliotecaPage() {
  const fuentes = await getFuentes();

  // Agrupa por categoría para mostrarlas en secciones.
  const porCategoria = new Map<string, typeof fuentes>();
  for (const f of fuentes) {
    const arr = porCategoria.get(f.categoria) ?? [];
    arr.push(f);
    porCategoria.set(f.categoria, arr);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Biblioteca</h1>
        <p className="text-sm text-muted">
          Documentos de soporte (normativa, casos resueltos, plantillas,
          escaneos…). Los archivos se guardan en disco; aquí ves su catálogo.
        </p>
      </div>

      <BibliotecaUploader />

      {fuentes.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <Library className="size-8 text-faint" />
            <p className="font-medium text-ink">La biblioteca está vacía</p>
            <p className="max-w-sm text-sm text-muted">
              Sube tu primer documento de soporte con el formulario de arriba.
            </p>
          </CardBody>
        </Card>
      ) : (
        [...porCategoria.entries()].map(([categoria, docs]) => (
          <div key={categoria} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {categoria}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardBody className="flex h-full flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <FileText className="size-5 text-brand-700" />
                        <Download className="size-4 text-muted" />
                      </div>
                      <p className="font-medium text-ink">{f.titulo}</p>
                      {f.descripcion && (
                        <p className="line-clamp-2 text-xs text-muted">
                          {f.descripcion}
                        </p>
                      )}
                      <p className="mt-auto text-xs text-faint">
                        {formatBytes(f.tamano)} · {f.fecha}
                      </p>
                    </CardBody>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
