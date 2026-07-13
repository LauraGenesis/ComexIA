import type { TransitoDatos } from "@/lib/documentos/transito";

/*
 * Vista previa fiel de la Declaración de Tránsito (T1 / T2, régimen NCTS).
 * Hoja "en papel" (fondo blanco fijo), imprimible con `.doc-print`. Reproduce
 * las casillas del DUA de tránsito (obligado principal, oficinas, garantía,
 * precintos) más la tabla de partidas de mercancía.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

export function TransitoPreview({ d }: { d: TransitoDatos }) {
  return (
    <div className="dua-print doc-print mx-auto bg-white p-6 text-ink" id="transito-preview">
      {/* Cabecera */}
      <div className="mb-3 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Declaración de Tránsito
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Tránsito de la Unión / común · NCTS
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block rounded border-2 border-ink px-3 py-1 text-2xl font-bold tracking-wide">
            {d.tipo}
          </div>
          <div className="mt-1 text-[10px] text-ink/70">
            <div>MRN {d.numero || "—"}</div>
            <div>{d.fecha?.trim() || "—"}</div>
          </div>
        </div>
      </div>

      {/* Expedidor / Destinatario */}
      <div className="flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            2. Expedidor
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
            8. Destinatario
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.destinatarioNombre || "—"}</span>
            {d.destinatarioDireccion && (
              <div className="whitespace-pre-wrap">{d.destinatarioDireccion}</div>
            )}
          </div>
        </div>
      </div>

      {/* Obligado principal (destacado) */}
      <div className="border-x border-b border-ink/50 bg-ink/5 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          50. Obligado principal (titular del régimen)
        </div>
        <div className="mt-0.5 flex items-baseline gap-3 text-[10px] leading-snug text-ink">
          <span className="font-semibold">{d.obligadoNombre || "—"}</span>
          <span className="text-ink/70">EORI {d.obligadoEori?.trim() || "—"}</span>
        </div>
      </div>

      {/* Países y transporte */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
          <Campo label="15 País expedición" valor={d.paisExpedicion} />
          <Campo label="17 País destino" valor={d.paisDestino} />
          <Campo label="18 Identidad transporte" valor={d.identidadTransporte} />
          <Campo label="25 Modo transporte" valor={d.modoTransporte} />
        </div>
      </div>

      {/* Tabla de partidas */}
      <div className="mt-2 border-x border-b border-t border-ink/50">
        <div className="flex bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="flex-1 px-1.5 py-1">Descripción (31)</div>
          <div className="w-[18%] border-l border-ink/50 px-1.5 py-1">
            Código (33)
          </div>
          <div className="w-[12%] border-l border-ink/50 px-1.5 py-1">Bultos</div>
          <div className="w-[18%] border-l border-ink/50 px-1.5 py-1">
            Masa bruta kg (35)
          </div>
        </div>
        {d.lineas.map((l, i) => (
          <div
            key={i}
            className="flex border-t border-ink/30 text-[9px] leading-snug"
          >
            <div className="flex-1 whitespace-pre-wrap px-1.5 py-1.5">
              {l.descripcion || "—"}
            </div>
            <div className="w-[18%] border-l border-ink/50 px-1.5 py-1.5">
              {l.codigoMercancia || "—"}
            </div>
            <div className="w-[12%] border-l border-ink/50 px-1.5 py-1.5">
              {l.numBultos || "—"}
            </div>
            <div className="w-[18%] border-l border-ink/50 px-1.5 py-1.5">
              {l.masaBruta || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Oficinas */}
      <div className="mt-2 border border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          Oficinas
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Oficina de partida" valor={d.oficinaPartida} />
          <Campo label="Oficinas de paso (51)" valor={d.oficinasPaso} />
          <Campo label="Oficina de destino (53)" valor={d.oficinaDestino} />
        </div>
      </div>

      {/* Garantía / Precintos */}
      <div className="mt-2 flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            52. Garantía
          </div>
          <div className="space-y-0.5">
            <Campo label="Tipo" valor={d.garantiaTipo} />
            <Campo label="GRN" valor={d.garantiaGrn} />
            <Campo label="Importe" valor={d.garantiaImporte} />
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
            D. Precintos
          </div>
          <div className="space-y-0.5">
            <Campo label="Número" valor={d.precintosNumero} />
            <Campo label="Marcas" valor={d.precintosMarcas} />
          </div>
        </div>
      </div>

      {/* Plazo */}
      <div className="mt-2 border border-ink/50 px-2 py-1.5">
        <Campo label="Plazo de presentación en destino" valor={d.plazoPresentacion} />
      </div>

      {/* Pie: lugar/fecha y firma */}
      <div className="mt-3 flex items-end justify-between text-[10px]">
        <div className="leading-snug">
          <Campo label="Lugar y fecha" valor={d.lugarFecha} />
        </div>
        <div className="text-center">
          <div className="mb-1 h-12 w-40 border-b border-ink/60">
            <span className="text-[10px] italic text-ink">{d.firmaObligado}</span>
          </div>
          <div className="text-[9px] text-ink/60">
            Obligado principal (casilla 50)
          </div>
        </div>
      </div>
    </div>
  );
}
