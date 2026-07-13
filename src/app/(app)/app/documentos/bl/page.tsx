import Link from "next/link";
import { BlEditor } from "@/components/documentos/bl-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { blVacio, type BlDatos } from "@/lib/documentos/bl";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function BlPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: BlDatos = blVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "BL" && doc.datos) {
      inicial = doc.datos as BlDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Bill of Lading{" "}
            <span className="align-middle text-sm font-medium text-brand-600">
              · B/L
            </span>
          </h1>
          <p className="text-sm text-muted">
            Conocimiento de embarque marítimo: recibo de la mercancía, contrato
            de transporte y título representativo (negociable si es «a la orden»).
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa las partes,
          los puertos y el detalle de las mercancías.
        </p>
      )}

      <BlEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
