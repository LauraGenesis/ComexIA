import Link from "next/link";
import { DuaEditor } from "@/components/documentos/dua-editor";
import {
  getExpedienteById,
  getDuaGuardado,
  getDocumentoGeneradoById,
} from "@/lib/repo";
import { duaVacio, type DuaDatos, type DuaTipo } from "@/lib/documentos/dua";
import { formatEUR } from "@/lib/utils";
import type { OrigenDocumento } from "@/lib/documentos/historial";

export const dynamic = "force-dynamic";

export default async function DuaPage({
  searchParams,
}: {
  searchParams: Promise<{
    tipo?: string;
    expediente?: string;
    desde?: string;
    historial?: string;
  }>;
}) {
  const { tipo, expediente, desde, historial } = await searchParams;
  const tipoDua: DuaTipo = tipo === "exportacion" ? "exportacion" : "importacion";
  const desdeExtraccion = desde === "extraccion";

  let inicial: DuaDatos = duaVacio(tipoDua);
  let expedienteId: string | undefined;
  let tipoFinal: DuaTipo = tipoDua;
  let historialId: string | undefined;
  // Al reabrir desde el historial mantenemos su origen para no reetiquetarlo.
  const origen: OrigenDocumento = desdeExtraccion ? "extraccion" : "manual";

  // Reapertura desde el historial: carga los datos guardados tal cual.
  if (historial) {
    const doc = await getDocumentoGeneradoById(historial);
    if (doc && doc.tipo === "DUA" && doc.datos) {
      inicial = doc.datos as DuaDatos;
      tipoFinal = inicial.tipo;
      historialId = historial;
    }
  }

  if (expediente) {
    const exp = await getExpedienteById(expediente);
    if (exp) {
      expedienteId = exp.id;
      // Si ya hay un DUA guardado en el expediente, se carga tal cual.
      const guardado = await getDuaGuardado(exp.id);
      if (guardado) {
        inicial = guardado;
        tipoFinal = guardado.tipo;
      } else {
        const tipoExp: DuaTipo =
          exp.tipo === "exportacion" ? "exportacion" : "importacion";
        tipoFinal = tipoExp;
        inicial = {
          ...duaVacio(tipoExp),
          descripcionMercancia: exp.producto,
          codigoMercancia: exp.hsTaric ?? "",
          paisExportacion: exp.origen,
          paisDestino: exp.destino,
          incoterm: exp.incoterm ?? "",
          modoTransporte: exp.transporte ?? "",
          contenedor: (exp.transporte ?? "").toLowerCase().includes("marítimo"),
          divisaImporte: exp.valor ? `EUR ${exp.valor}` : "",
          valorEstadistico: exp.valor ? formatEUR(exp.valor) : "",
          documentos: (exp.resolucion?.documentacion ?? [])
            .map((doc) => doc.doc)
            .join("\n"),
        };
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            DUA de {tipoFinal === "exportacion" ? "exportación" : "importación"}
          </h1>
          <p className="text-sm text-muted">
            Rellena las casillas; la vista previa y la validación se actualizan
            en vivo.
          </p>
        </div>
        <Link
          href="/app/documentos"
          className="text-sm text-muted hover:text-ink"
        >
          ← Catálogo
        </Link>
      </div>

      {desdeExtraccion && (
        <p className="no-print rounded-lg border border-brand-100 bg-ai-soft px-3 py-2 text-sm text-ink">
          ✨ Rellenado automáticamente desde tus documentos. Revisa cada casilla
          antes de exportar.
        </p>
      )}

      <DuaEditor
        inicial={inicial}
        expedienteId={expedienteId}
        prefill={desdeExtraccion}
        origen={origen}
        historialId={historialId}
      />
    </div>
  );
}
