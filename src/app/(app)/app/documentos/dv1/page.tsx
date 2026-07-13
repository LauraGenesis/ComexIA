import Link from "next/link";
import { Dv1Editor } from "@/components/documentos/dv1-editor";
import { getDocumentoGeneradoById } from "@/lib/repo";
import { dv1Vacio, type Dv1Datos } from "@/lib/documentos/dv1";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function Dv1Page({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; historial?: string }>;
}) {
  const { desde, historial } = await searchParams;
  const desdeExtraccion = desde === "extraccion";

  let inicial: Dv1Datos = dv1Vacio();
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "DV1" && doc.datos) {
      inicial = doc.datos as Dv1Datos;
      historialId = historial;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Declaración de valor en aduana{" "}
            <span className="align-middle text-sm font-medium text-brand-700">
              · DV1
            </span>
          </h1>
          <p className="text-sm text-muted">
            Formulario D.V.1 de la UE. El valor en aduana = precio pagado +
            adiciones (art. 71 CAU) − deducciones (art. 72 CAU).
          </p>
        </div>
        <Link href="/app/documentos" className="text-sm text-muted hover:text-ink">
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa el precio
          pagado, las adiciones y las deducciones antes de firmar.
        </p>
      )}

      <Dv1Editor
        inicial={inicial}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
