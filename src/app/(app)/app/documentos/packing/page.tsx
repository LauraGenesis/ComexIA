import Link from "next/link";
import { PackingEditor } from "@/components/documentos/packing-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { packingVacio, type PackingDatos } from "@/lib/documentos/packing";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function PackingPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: PackingDatos = packingVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "Packing" && doc.datos) {
      inicial = doc.datos as PackingDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Packing list</h1>
          <p className="text-sm text-muted">
            Completa la cabecera y las líneas de bultos; la vista previa y los
            totales se actualizan en vivo.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa las líneas y
          los pesos antes de exportar.
        </p>
      )}

      <PackingEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
