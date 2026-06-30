import Link from "next/link";
import { DuaEditor } from "@/components/documentos/dua-editor";
import { getExpedienteById, getDuaGuardado } from "@/lib/repo";
import { duaVacio, type DuaDatos, type DuaTipo } from "@/lib/documentos/dua";
import { formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DuaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; expediente?: string }>;
}) {
  const { tipo, expediente } = await searchParams;
  const tipoDua: DuaTipo = tipo === "exportacion" ? "exportacion" : "importacion";

  let inicial: DuaDatos = duaVacio(tipoDua);
  let expedienteId: string | undefined;
  let tipoFinal: DuaTipo = tipoDua;

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

      <DuaEditor inicial={inicial} expedienteId={expedienteId} />
    </div>
  );
}
