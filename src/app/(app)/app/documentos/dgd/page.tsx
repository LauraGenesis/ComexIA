import Link from "next/link";
import { DgdEditor } from "@/components/documentos/dgd-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { dgdVacio, type DgdDatos } from "@/lib/documentos/dgd";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function DgdPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: DgdDatos = dgdVacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "DGD" && doc.datos) {
      inicial = doc.datos as DgdDatos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Declaración de mercancías peligrosas{" "}
            <span className="align-middle text-sm font-medium text-warning">
              · DGD
            </span>
          </h1>
          <p className="text-sm text-muted">
            Formulario Multimodal de la OMI (Código IMDG). La firma la aporta el
            expedidor, responsable de la clasificación y el embalaje conforme a
            IMDG/ADR.
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa y completa el
          Nº ONU, la clase y el grupo de embalaje de cada mercancía.
        </p>
      )}

      <DgdEditor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
