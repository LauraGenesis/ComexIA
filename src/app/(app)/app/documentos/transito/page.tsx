import Link from "next/link";
import { TransitoEditor } from "@/components/documentos/transito-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { transitoVacio, type TransitoDatos } from "@/lib/documentos/transito";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function TransitoPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: TransitoDatos = transitoVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "Transito" && doc.datos) {
      inicial = doc.datos as TransitoDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Declaración de tránsito{" "}
            <span className="align-middle text-sm font-medium text-brand-600">
              · T1 / T2
            </span>
          </h1>
          <p className="text-sm text-muted">
            Régimen de tránsito de la Unión / común gestionado por el NCTS.
            Mueve la mercancía bajo control aduanero con los derechos en
            suspenso, bajo garantía del obligado principal.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa el obligado
          principal, las oficinas y la garantía antes de presentarla.
        </p>
      )}

      <TransitoEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
