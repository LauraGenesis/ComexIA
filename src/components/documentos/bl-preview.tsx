import type { BlDatos } from "@/lib/documentos/bl";

/*
 * Vista previa fiel del Conocimiento de Embarque marítimo (Bill of Lading).
 * Hoja "en papel" (fondo blanco fijo), imprimible con `.doc-print`. Reproduce
 * la estructura clásica del B/L: partes (shipper / consignee / notify), datos
 * del buque y puertos, cuerpo tabular de mercancías y pie de flete y firma.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

export function BlPreview({ d }: { d: BlDatos }) {
  const consignatarioALaOrden = /orden|order/i.test(d.consigneeNombre);
  const fleteTexto =
    d.flete === "collect" ? "Pagadero en destino (collect)" : "Prepagado (prepaid)";

  return (
    <div className="dua-print doc-print mx-auto bg-white p-6 text-ink" id="bl-preview">
      {/* Cabecera */}
      <div className="mb-2 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Bill of Lading
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Conocimiento de Embarque · Transporte marítimo
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          <div>B/L Nº {d.numero || "—"}</div>
          {d.reserva.trim() && <div>Reserva {d.reserva}</div>}
          {d.fecha.trim() && <div>{d.fecha}</div>}
        </div>
      </div>

      {/* Shipper / Consignee */}
      <div className="flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            Shipper (cargador)
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.shipperNombre || "—"}</span>
            {d.shipperDireccion && (
              <div className="whitespace-pre-wrap">{d.shipperDireccion}</div>
            )}
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            Consignee (consignatario)
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.consigneeNombre || "—"}</span>
            {d.consigneeDireccion && (
              <div className="whitespace-pre-wrap">{d.consigneeDireccion}</div>
            )}
            {consignatarioALaOrden && (
              <div className="mt-0.5 text-[8px] italic text-ink/50">
                Documento a la orden · negociable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notify party */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          Notify party (parte a notificar)
        </div>
        <div className="mt-0.5 text-[10px] leading-snug text-ink">
          <span className="font-medium">{d.notifyNombre || "—"}</span>
          {d.notifyDireccion && (
            <div className="whitespace-pre-wrap">{d.notifyDireccion}</div>
          )}
        </div>
      </div>

      {/* Datos del transporte */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          Datos del transporte
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Buque" valor={d.buque} />
          <Campo label="Nº de viaje" valor={d.viaje} />
          <Campo label="Lugar de recepción" valor={d.lugarRecepcion} />
          <Campo label="Puerto de carga" valor={d.puertoCarga} />
          <Campo label="Puerto de descarga" valor={d.puertoDescarga} />
          <Campo label="Lugar de entrega" valor={d.lugarEntrega} />
        </div>
      </div>

      {/* Tabla de mercancías */}
      <div className="border-x border-b border-ink/50">
        <div className="flex bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="w-[14%] px-1.5 py-1">Marks &amp; Nos</div>
          <div className="w-[18%] border-l border-ink/50 px-1.5 py-1">
            Nº and kind of packages
          </div>
          <div className="flex-1 border-l border-ink/50 px-1.5 py-1">
            Description of goods
          </div>
          <div className="w-[12%] border-l border-ink/50 px-1.5 py-1">
            Gross weight
          </div>
          <div className="w-[12%] border-l border-ink/50 px-1.5 py-1">
            Measurement
          </div>
        </div>
        {d.lineas.map((l, i) => (
          <div
            key={i}
            className="flex border-t border-ink/30 text-[9px] leading-snug"
          >
            <div className="w-[14%] whitespace-pre-wrap px-1.5 py-1.5 font-medium">
              {l.marcas || "—"}
            </div>
            <div className="w-[18%] whitespace-pre-wrap border-l border-ink/50 px-1.5 py-1.5">
              {l.numBultos || "—"}
            </div>
            <div className="flex-1 whitespace-pre-wrap border-l border-ink/50 px-1.5 py-1.5">
              {l.descripcion || "—"}
            </div>
            <div className="w-[12%] border-l border-ink/50 px-1.5 py-1.5">
              {l.pesoBruto || "—"}
            </div>
            <div className="w-[12%] border-l border-ink/50 px-1.5 py-1.5">
              {l.volumen || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Pie: flete, originales y firma */}
      <div className="mt-2 flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            Freight (flete)
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <div>
              <span className="font-medium">Flete:</span> {fleteTexto}
            </div>
            {d.fleteObs.trim() && (
              <div className="whitespace-pre-wrap text-ink/80">{d.fleteObs}</div>
            )}
            <div className="mt-0.5 text-ink/70">
              Nº de originales: {d.numeroOriginales.trim() || "—"}
            </div>
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            Lugar y fecha de emisión
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            {[d.lugarEmision.trim(), d.fecha.trim()].filter(Boolean).join(" · ") ||
              "—"}
          </div>
          <div className="mt-4 text-center">
            <div className="mb-1 h-10 w-full border-b border-ink/60">
              <span className="text-[10px] italic text-ink">{d.firmante}</span>
            </div>
            <div className="text-[9px] text-ink/60">
              Por el porteador / capitán / agente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
