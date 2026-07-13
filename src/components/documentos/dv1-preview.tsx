import {
  aNumero,
  totalesDv1,
  formatearImporte,
  type Dv1Datos,
} from "@/lib/documentos/dv1";

/*
 * Vista previa fiel de la Declaración de Valor en Aduana (formulario D.V.1 de la
 * UE). Hoja "en papel" (fondo blanco fijo), imprimible a PDF con `.doc-print`.
 * Su núcleo es el desglose del valor en aduana: precio pagado + adiciones (art.
 * 71 CAU) − deducciones (art. 72 CAU).
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

const siNo = (v: string) => (v === "si" ? "Sí" : "No");

export function Dv1Preview({ d }: { d: Dv1Datos }) {
  const t = totalesDv1(d);
  const divisa = d.divisa.trim() || "EUR";
  const imp = (n: number) => `${divisa} ${formatearImporte(n)}`;

  // Filas de adiciones (art. 71) y deducciones (art. 72): solo se muestran las
  // que tienen importe > 0.
  const adiciones: { label: string; valor: number }[] = [
    { label: "Comisiones y corretajes", valor: aNumero(d.comisiones) },
    { label: "Envases y embalajes", valor: aNumero(d.envases) },
    { label: "Bienes y servicios aportados (assists)", valor: aNumero(d.aportaciones) },
    { label: "Cánones y derechos de licencia", valor: aNumero(d.canones) },
    { label: "Producto de reventa que revierte al vendedor", valor: aNumero(d.reversiones) },
    { label: "Transporte hasta la entrada en la UE", valor: aNumero(d.transporteHasta) },
    { label: "Carga y manipulación hasta la entrada", valor: aNumero(d.cargaManipulacion) },
    { label: "Seguro hasta la entrada en la UE", valor: aNumero(d.seguro) },
  ].filter((a) => a.valor > 0);

  const deducciones: { label: string; valor: number }[] = [
    { label: "Transporte tras la entrada en la UE", valor: aNumero(d.transporteTras) },
    { label: "Montaje, construcción o mantenimiento tras importar", valor: aNumero(d.montaje) },
    { label: "Derechos e impuestos pagaderos en la UE", valor: aNumero(d.derechosImpuestos) },
    { label: "Intereses de financiación", valor: aNumero(d.intereses) },
  ].filter((a) => a.valor > 0);

  const pagosIndirectos = aNumero(d.pagosIndirectos);

  return (
    <div className="dua-print doc-print mx-auto bg-white p-6 text-ink" id="dv1-preview">
      {/* Cabecera */}
      <div className="mb-3 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Declaración de Valor en Aduana
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Customs Value Declaration · Formulario D.V.1 (UE)
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          <div>Nº {d.numero || "—"}</div>
          {d.fecha.trim() && <div>Fecha: {d.fecha}</div>}
        </div>
      </div>

      {/* Vendedor / Comprador */}
      <div className="flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            1. Vendedor
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.vendedorNombre || "—"}</span>
            {d.vendedorDireccion && (
              <div className="whitespace-pre-wrap">{d.vendedorDireccion}</div>
            )}
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            2. Comprador
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.compradorNombre || "—"}</span>
            {d.compradorDireccion && (
              <div className="whitespace-pre-wrap">{d.compradorDireccion}</div>
            )}
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          3-4. Condiciones de la entrega y factura
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Incoterm" valor={d.incoterm} />
          <Campo label="Lugar de entrega" valor={d.lugarEntrega} />
          <Campo label="Nº de factura" valor={d.numeroFactura} />
          <Campo label="Fecha de factura" valor={d.fechaFactura} />
          <Campo label="Divisa" valor={divisa} />
          <Campo label="Tipo de cambio" valor={d.tipoCambio} />
        </div>
      </div>

      {/* Vinculación */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          7-9. Vinculación
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <Campo label="¿Vinculados?" valor={siNo(d.vinculados)} />
          <Campo label="¿Influye en el precio?" valor={siNo(d.vinculacionInfluye)} />
        </div>
        {d.restricciones.trim() && (
          <div className="mt-0.5">
            <Campo label="Restricciones / condiciones" valor={d.restricciones} />
          </div>
        )}
      </div>

      {/* Desglose del valor en aduana */}
      <div className="mt-3 border border-ink/50">
        <div className="bg-ink/5 px-2 py-1 text-[8px] font-semibold uppercase text-ink/60">
          11. Determinación del valor en aduana
        </div>
        <table className="w-full border-collapse text-[10px]">
          <tbody>
            <tr className="border-t border-ink/30">
              <td className="px-2 py-1">Precio neto pagado o por pagar</td>
              <td className="w-[30%] px-2 py-1 text-right font-medium">
                {imp(aNumero(d.precioPagado))}
              </td>
            </tr>
            {pagosIndirectos > 0 && (
              <tr className="border-t border-ink/30">
                <td className="px-2 py-1">Pagos indirectos al vendedor</td>
                <td className="px-2 py-1 text-right font-medium">
                  {imp(pagosIndirectos)}
                </td>
              </tr>
            )}

            <tr className="border-t border-ink/30 bg-ink/5">
              <td colSpan={2} className="px-2 py-0.5 text-[8px] font-semibold uppercase text-ink/60">
                Adiciones (art. 71 CAU)
              </td>
            </tr>
            {adiciones.length ? (
              adiciones.map((a) => (
                <tr key={a.label} className="border-t border-ink/30">
                  <td className="px-2 py-1 pl-4">+ {a.label}</td>
                  <td className="px-2 py-1 text-right font-medium">{imp(a.valor)}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-ink/30">
                <td colSpan={2} className="px-2 py-1 pl-4 text-ink/50">—</td>
              </tr>
            )}

            <tr className="border-t border-ink/30 bg-ink/5">
              <td colSpan={2} className="px-2 py-0.5 text-[8px] font-semibold uppercase text-ink/60">
                Deducciones (art. 72 CAU)
              </td>
            </tr>
            {deducciones.length ? (
              deducciones.map((a) => (
                <tr key={a.label} className="border-t border-ink/30">
                  <td className="px-2 py-1 pl-4">− {a.label}</td>
                  <td className="px-2 py-1 text-right font-medium">{imp(a.valor)}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-ink/30">
                <td colSpan={2} className="px-2 py-1 pl-4 text-ink/50">—</td>
              </tr>
            )}

            <tr className="border-t-2 border-ink">
              <td className="px-2 py-1.5 text-sm font-bold">VALOR EN ADUANA</td>
              <td className="px-2 py-1.5 text-right text-sm font-bold">
                {imp(t.valorAduana)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pie / firma */}
      <div className="mt-6 flex items-end justify-between text-[10px]">
        <div className="leading-snug">
          <Campo label="Lugar y fecha" valor={d.lugarFecha} />
          <Campo label="Declarante" valor={d.declarante} />
          <Campo label="En calidad de" valor={d.condicionDeclarante} />
        </div>
        <div className="text-center">
          <div className="mb-1 h-12 w-40 border-b border-ink/60">
            <span className="text-[10px] italic text-ink">{d.firma}</span>
          </div>
          <div className="text-[9px] text-ink/60">Firma del declarante</div>
        </div>
      </div>
    </div>
  );
}
