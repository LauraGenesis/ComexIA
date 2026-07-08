import {
  aNumero,
  importeLinea,
  totalesFactura,
  formatearImporte,
  type FacturaDatos,
} from "@/lib/documentos/factura";

/*
 * Vista previa fiel de la Factura Comercial: cabecera, partes (vendedor /
 * comprador), condiciones, tabla de artículos con importes y bloque de totales.
 * Hoja "en papel" (fondo blanco fijo), imprimible a PDF con `.doc-print`.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  if (!valor?.trim()) return null;
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor}</span>
    </div>
  );
}

export function FacturaPreview({ d }: { d: FacturaDatos }) {
  const t = totalesFactura(d);
  const divisa = d.divisa.trim() || "EUR";
  const imp = (n: number) => `${formatearImporte(n)} ${divisa}`;
  const ruta = [d.paisOrigen, d.paisDestino].filter(Boolean).join(" → ");

  // Filas de ajuste que solo se muestran si tienen valor.
  const ajustes: { label: string; valor: number; signo: string }[] = [
    { label: "Descuento", valor: t.descuento, signo: "−" },
    { label: "Flete", valor: t.flete, signo: "+" },
    { label: "Seguro", valor: t.seguro, signo: "+" },
    { label: "Otros gastos", valor: t.otros, signo: "+" },
  ].filter((a) => a.valor !== 0);

  return (
    <div
      className="dua-print doc-print mx-auto bg-white p-6 text-ink"
      id="factura-preview"
    >
      {/* Cabecera */}
      <div className="mb-3 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Factura Comercial
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Commercial Invoice
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          {d.numero && <div>Nº {d.numero}</div>}
          {d.fecha && <div>Fecha: {d.fecha}</div>}
        </div>
      </div>

      {/* Partes */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="border border-ink/40 p-2">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            Vendedor / Exportador
          </div>
          <div className="text-[10px] font-medium leading-snug text-ink">
            {d.vendedorNombre || "—"}
          </div>
          {d.vendedorDireccion && (
            <div className="whitespace-pre-wrap text-[10px] leading-snug text-ink/80">
              {d.vendedorDireccion}
            </div>
          )}
          <div className="mt-0.5">
            <Campo label="NIF/VAT" valor={d.vendedorNifVat} />
            <Campo label="EORI" valor={d.vendedorEori} />
          </div>
        </div>
        <div className="border border-ink/40 p-2">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            Comprador / Importador
          </div>
          <div className="text-[10px] font-medium leading-snug text-ink">
            {d.compradorNombre || "—"}
          </div>
          {d.compradorDireccion && (
            <div className="whitespace-pre-wrap text-[10px] leading-snug text-ink/80">
              {d.compradorDireccion}
            </div>
          )}
          <div className="mt-0.5">
            <Campo label="NIF/VAT" valor={d.compradorNifVat} />
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div className="mb-3 grid grid-cols-3 gap-x-4 gap-y-1 border border-ink/40 p-2">
        <Campo label="Incoterm" valor={[d.incoterm, d.lugarEntrega].filter(Boolean).join(" ")} />
        <Campo label="Pago" valor={d.condicionesPago} />
        <Campo label="Divisa" valor={divisa} />
        <Campo label="Transporte" valor={d.modoTransporte} />
        <Campo label="Origen mercancías" valor={ruta} />
      </div>

      {/* Tabla de artículos */}
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-ink/5 text-left text-ink/70">
            <th className="border border-ink/40 px-1 py-1 font-semibold">Descripción</th>
            <th className="border border-ink/40 px-1 py-1 font-semibold">HS/TARIC</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">Cantidad</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">Precio ud.</th>
            <th className="border border-ink/40 px-1 py-1 text-right font-semibold">Importe</th>
          </tr>
        </thead>
        <tbody>
          {d.lineas.map((l, i) => (
            <tr key={i} className="align-top">
              <td className="border border-ink/40 px-1 py-1 whitespace-pre-wrap">
                {l.descripcion || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1">{l.hsTaric || "—"}</td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {[l.cantidad, l.unidad].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {l.precioUnitario.trim() ? imp(aNumero(l.precioUnitario)) : "—"}
              </td>
              <td className="border border-ink/40 px-1 py-1 text-right">
                {imp(importeLinea(l))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="mt-2 flex justify-end">
        <table className="text-[10px]">
          <tbody>
            <tr>
              <td className="py-0.5 pr-6 text-ink/70">Subtotal</td>
              <td className="py-0.5 text-right font-medium">{imp(t.subtotal)}</td>
            </tr>
            {ajustes.map((a) => (
              <tr key={a.label}>
                <td className="py-0.5 pr-6 text-ink/70">
                  {a.signo} {a.label}
                </td>
                <td className="py-0.5 text-right font-medium">{imp(a.valor)}</td>
              </tr>
            ))}
            <tr className="border-t border-ink/50">
              <td className="py-1 pr-6 text-sm font-bold">TOTAL</td>
              <td className="py-1 text-right text-sm font-bold">{imp(t.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Datos bancarios */}
      {(d.banco || d.iban || d.swift) && (
        <div className="mt-3 border border-ink/40 p-2">
          <div className="mb-0.5 text-[8px] font-semibold uppercase text-ink/60">
            Datos bancarios
          </div>
          <div className="grid grid-cols-3 gap-x-4">
            <Campo label="Banco" valor={d.banco} />
            <Campo label="IBAN" valor={d.iban} />
            <Campo label="SWIFT" valor={d.swift} />
          </div>
        </div>
      )}

      {/* Declaración de origen / observaciones */}
      {(d.declaracionOrigen || d.observaciones) && (
        <div className="mt-3 space-y-1 text-[10px] leading-snug">
          {d.declaracionOrigen && (
            <p className="whitespace-pre-wrap text-ink">{d.declaracionOrigen}</p>
          )}
          {d.observaciones && (
            <p className="whitespace-pre-wrap text-ink/80">{d.observaciones}</p>
          )}
        </div>
      )}

      {/* Firma */}
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
