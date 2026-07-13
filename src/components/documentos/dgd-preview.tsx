import { DGD_CERTIFICACION, type DgdDatos } from "@/lib/documentos/dgd";

/*
 * Vista previa fiel de la Declaración de Mercancías Peligrosas (Formulario
 * Multimodal OMI / Código IMDG). Hoja "en papel" (fondo blanco fijo),
 * imprimible con `.doc-print`. La banda naranja de peligro se muestra también
 * al imprimir, como en el formulario real.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

export function DgdPreview({ d }: { d: DgdDatos }) {
  return (
    <div className="dua-print doc-print mx-auto bg-white p-6 text-ink" id="dgd-preview">
      {/* Banda de advertencia (visible también al imprimir) */}
      <div className="mb-3 rounded border-2 border-[#d97706] bg-[#fff7ed] px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-[#b45309]">
        ⚠ Mercancías peligrosas · Dangerous Goods
      </div>

      {/* Cabecera */}
      <div className="mb-2 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Declaración de Mercancías Peligrosas
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Multimodal Dangerous Goods Form · Código IMDG (OMI)
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          <div>Nº {d.numero || "—"}</div>
          {d.reserva.trim() && <div>Reserva {d.reserva}</div>}
        </div>
      </div>

      {/* Expedidor / Destinatario */}
      <div className="flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            1. Expedidor (consignor)
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.expedidorNombre || "—"}</span>
            {d.expedidorDireccion && (
              <div className="whitespace-pre-wrap">{d.expedidorDireccion}</div>
            )}
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            2. Destinatario (consignee)
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.destinatarioNombre || "—"}</span>
            {d.destinatarioDireccion && (
              <div className="whitespace-pre-wrap">{d.destinatarioDireccion}</div>
            )}
          </div>
        </div>
      </div>

      {/* Transporte */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          3. Datos del transporte
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Transportista" valor={d.transportista} />
          <Campo label="Buque / vehículo" valor={d.buqueVehiculo} />
          <Campo label="Nº de viaje" valor={d.numeroViaje} />
          <Campo label="Lugar de carga" valor={d.puertoCarga} />
          <Campo label="Lugar de descarga" valor={d.puertoDescarga} />
          <Campo label="Destino" valor={d.destino} />
        </div>
      </div>

      {/* Tabla de mercancías peligrosas */}
      <div className="border-x border-b border-ink/50">
        <div className="flex bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="w-[10%] px-1.5 py-1">Nº ONU</div>
          <div className="flex-1 border-l border-ink/50 px-1.5 py-1">
            Designación oficial de transporte
          </div>
          <div className="w-[8%] border-l border-ink/50 px-1.5 py-1">Clase</div>
          <div className="w-[8%] border-l border-ink/50 px-1.5 py-1">R. sec.</div>
          <div className="w-[6%] border-l border-ink/50 px-1.5 py-1">GE</div>
          <div className="w-[16%] border-l border-ink/50 px-1.5 py-1">
            Bultos / cantidad
          </div>
          <div className="w-[10%] border-l border-ink/50 px-1.5 py-1">
            Masa bruta
          </div>
          <div className="w-[12%] border-l border-ink/50 px-1.5 py-1">
            P. infl. / C. marino / EmS
          </div>
        </div>
        {d.lineas.map((l, i) => (
          <div
            key={i}
            className="flex border-t border-ink/30 text-[9px] leading-snug"
          >
            <div className="w-[10%] px-1.5 py-1.5 font-medium">
              {l.unNumber || "—"}
            </div>
            <div className="flex-1 whitespace-pre-wrap border-l border-ink/50 px-1.5 py-1.5">
              {l.designacionOficial || "—"}
            </div>
            <div className="w-[8%] border-l border-ink/50 px-1.5 py-1.5">
              {l.clase || "—"}
            </div>
            <div className="w-[8%] border-l border-ink/50 px-1.5 py-1.5">
              {l.riesgoSecundario || "—"}
            </div>
            <div className="w-[6%] border-l border-ink/50 px-1.5 py-1.5">
              {l.grupoEmbalaje || "—"}
            </div>
            <div className="w-[16%] border-l border-ink/50 px-1.5 py-1.5">
              {[l.numBultos, l.cantidad].filter((s) => s.trim()).join(" · ") ||
                "—"}
            </div>
            <div className="w-[10%] border-l border-ink/50 px-1.5 py-1.5">
              {l.pesoBruto || "—"}
            </div>
            <div className="w-[12%] border-l border-ink/50 px-1.5 py-1.5">
              {[
                l.puntoInflamacion.trim() && `${l.puntoInflamacion} °C`,
                l.contaminanteMarino.trim(),
                l.ems.trim() && `EmS ${l.ems}`,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-2 border border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          Información adicional / instrucciones de emergencia
        </div>
        <div className="mt-0.5 min-h-[1.5rem] whitespace-pre-wrap text-[10px] leading-snug text-ink">
          {d.infoAdicional || " "}
        </div>
      </div>

      {/* Declaración del expedidor (texto fijo OMI) */}
      <div className="mt-3 border border-ink/50 px-2 py-2">
        <div className="text-[9px] leading-snug text-ink/80">
          {DGD_CERTIFICACION}
        </div>
        <div className="mt-3 flex items-end justify-between text-[10px]">
          <div className="leading-snug">
            <Campo label="Nombre y cargo" valor={d.firmante} />
            <Campo label="Lugar y fecha" valor={d.lugarFecha} />
          </div>
          <div className="text-center">
            <div className="mb-1 h-12 w-40 border-b border-ink/60">
              <span className="text-[10px] italic text-ink">{d.firma}</span>
            </div>
            <div className="text-[9px] text-ink/60">
              Firma del expedidor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
