import Link from "next/link";
import { FacturaEditor } from "@/components/documentos/factura-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { facturaVacia, type FacturaDatos } from "@/lib/documentos/factura";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function FacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: FacturaDatos = facturaVacia();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "Factura" && doc.datos) {
      inicial = doc.datos as FacturaDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Factura comercial</h1>
          <p className="text-sm text-muted">
            Completa las partes y los artículos; los importes y totales se
            calculan en vivo en la vista previa.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa importes y
          totales antes de exportar.
        </p>
      )}

      <FacturaEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
