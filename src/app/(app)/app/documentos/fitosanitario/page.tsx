import Link from "next/link";
import { FitosanitarioEditor } from "@/components/documentos/fitosanitario-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { fitoVacio, type FitoDatos } from "@/lib/documentos/fitosanitario";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function FitosanitarioPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: FitoDatos = fitoVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "Fitosanitario" && doc.datos) {
      inicial = doc.datos as FitoDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Certificado fitosanitario{" "}
            <span className="align-middle text-sm font-medium text-warning">
              · borrador
            </span>
          </h1>
          <p className="text-sm text-muted">
            Modelo oficial NIMF nº 12. Pre-cumplimenta los datos para agilizar la
            solicitud a Sanidad Vegetal; la emisión oficial la hace la ONPF tras
            inspección.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa y añade el
          nombre botánico de cada mercancía antes de presentarlo.
        </p>
      )}

      <FitosanitarioEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
