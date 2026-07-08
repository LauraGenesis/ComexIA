import Link from "next/link";
import { OrigenEditor } from "@/components/documentos/origen-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { origenVacio, type OrigenDatos } from "@/lib/documentos/origen";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function OrigenPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: OrigenDatos = origenVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "Origen" && doc.datos) {
      inicial = doc.datos as OrigenDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Certificado de origen
          </h1>
          <p className="text-sm text-muted">
            Modelo comunitario. Completa las casillas 1–7; la vista previa se
            actualiza en vivo. La emite finalmente la Cámara de Comercio.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa el país de
          origen (casilla 3) antes de presentarlo a la Cámara.
        </p>
      )}

      <OrigenEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
