import { totalesPacking, type PackingDatos } from "@/lib/documentos/packing";

/*
 * Vista previa fiel del Packing List: cabecera con partes y datos de envío,
 * tabla de bultos y fila de totales. Hoja "en papel" (fondo blanco fijo),
 * imprimible a PDF con `.doc-print`.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

export function PackingPreview({ d }: { d: PackingDatos }) {
  const totales = totalesPacking(d);
  const ruta = [d.paisOrigen, d.paisDestino].filter(Boolean).join(" → ");

  return (
    <div
      className="dua-print doc-print mx-auto bg-white p-6 text-ink"
      id="packing-preview"
    >
      {/* Cabecera */}
      <div className="mb-3 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Packing List
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Lista de contenido / de bultos
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          {d.numero && <div>Nº {d.numero}</div>}
          {d.fecha && <div>Fecha: {d.fecha}</div>}
          {d.referenciaFactura && <div>Factura: {d.referenciaFactura}</div>}
        </div>
      </div>

      {/* Partes */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="border border-ink/40 p-2">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            Exportador / Remitente
          </div>
          <div className="whitespace-pre-wrap text-[10px] font-medium leading-snug text-ink">
            {d.exportadorNombre || "—"}
          </div>
          {d.exportadorDireccion && (
            <div className="whitespace-pre-wrap text-[10px] leading-snug text-ink/80">
              {d.exportadorDireccion}
            </div>
          )}
        </div>
        <div className="border border-ink/40 p-2">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            Consignatario / Destinatario
          </div>
          <div className="whitespace-pre-wrap text-[10px] font-medium leading-snug text-ink">
            {d.importadorNombre || "—"}
          </div>
          {d.importadorDireccion && (
            <div className="whitespace-pre-wrap text-[10px] leading-snug text-ink/80">
              {d.importadorDireccion}
            </div>
          )}
        </div>
      </div>

      {/* Datos de envío */}
      <div className="mb-3 grid grid-cols-3 gap-x-4 gap-y-1 border border-ink/40 p-2">
        <Campo label="Incoterm" valor={[d.incoterm, d.lugarEntrega].filter(Boolean).join(" ")} />
        <Campo label="Transporte" valor={d.modoTransporte} />
        <Campo label="Contenedor" valor={d.numeroContenedor} />
        <Campo label="Carga" valor={d.puertoCarga} />
        <Campo label="Descarga" valor={d.puertoDescarga} />
        <Campo label="Ruta" valor={ruta} />
      </div>

      {/* Tabla de bultos */}
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-ink/5 text-left text-ink/70">
            <th className="border border-ink/40 px-1 py-1 font-semibold">Marcas y nº</th>
            <th className="border border-ink/40 px-1 py-1 font-semibold">Bultos</th>
            <th className="border border-ink/40 px-1 py-1 font-semibold">Descripción</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">Cantidad</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">P. neto</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">P. bruto</th>
            <th className="border border-ink/40 px-1 py-1 font-semibold">Dimens.</th>
          </tr>
        </thead>
        <tbody>
          {d.lineas.map((l, i) => (
            <tr key={i} className="align-top">
              <td className="border border-ink/40 px-1 py-1 whitespace-pre-wrap">
                {l.marcas || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1">
                {[l.numBultos, l.tipoBulto].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 whitespace-pre-wrap">
                {l.descripcion || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {[l.cantidad, l.unidad].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {l.pesoNeto || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {l.pesoBruto || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1">{l.dimensiones || "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-ink/5 font-semibold">
            <td className="border border-ink/40 px-1 py-1" colSpan={1}>
              TOTAL
            </td>
            <td className="border border-ink/40 px-1 py-1">{totales.bultos}</td>
            <td className="border border-ink/40 px-1 py-1">
              {d.volumenTotal ? `Volumen: ${d.volumenTotal}` : ""}
            </td>
            <td className="border border-ink/40 px-1 py-1" />
            <td className="border border-ink/40 px-1 py-1 text-right">
              {totales.pesoNeto}
            </td>
            <td className="border border-ink/40 px-1 py-1 text-right">
              {totales.pesoBruto}
            </td>
            <td className="border border-ink/40 px-1 py-1" />
          </tr>
        </tfoot>
      </table>

      {/* Pie */}
      {d.observaciones && (
        <div className="mt-3 border border-ink/40 p-2">
          <div className="mb-0.5 text-[8px] font-semibold uppercase text-ink/60">
            Observaciones
          </div>
          <div className="whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.observaciones}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-end justify-between text-[10px]">
        <div className="text-ink/70">{d.lugarFecha}</div>
        <div className="text-center">
          <div className="mb-1 h-8 w-48 border-b border-ink/50" />
          <div className="text-ink/70">{d.firma || "Firma / responsable"}</div>
        </div>
      </div>
    </div>
  );
}
