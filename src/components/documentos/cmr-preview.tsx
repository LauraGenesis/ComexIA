import type { CmrDatos } from "@/lib/documentos/cmr";

/*
 * Vista previa fiel de la Carta de Porte Internacional por carretera (CMR,
 * Convenio de Ginebra 1956). Hoja "en papel" (fondo blanco fijo), imprimible
 * con `.doc-print`. Reproduce las casillas numeradas del modelo CMR y, en el
 * cuerpo, la tabla de mercancías (casillas 6-12).
 */

const PORTE_LABEL: Record<CmrDatos["porte"], string> = {
  pagado: "Porte pagado (franco)",
  debido: "Porte debido",
};

export function CmrPreview({ d }: { d: CmrDatos }) {
  return (
    <div className="dua-print doc-print mx-auto bg-white p-6 text-ink" id="cmr-preview">
      {/* Cabecera */}
      <div className="mb-2 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Carta de Porte Internacional
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Lettre de voiture internationale · CMR (Convenio de Ginebra 1956)
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          <div>Nº {d.numero || "—"}</div>
          <div>{d.fecha.trim() || "—"}</div>
        </div>
      </div>

      {/* Remitente / Destinatario */}
      <div className="flex">
        <div className="w-1/2 border border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            1. Remitente
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.remitenteNombre || "—"}</span>
            {d.remitenteDireccion && (
              <div className="whitespace-pre-wrap">{d.remitenteDireccion}</div>
            )}
          </div>
        </div>
        <div className="w-1/2 border-y border-r border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            2. Destinatario
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            <span className="font-medium">{d.destinatarioNombre || "—"}</span>
            {d.destinatarioDireccion && (
              <div className="whitespace-pre-wrap">{d.destinatarioDireccion}</div>
            )}
          </div>
        </div>
      </div>

      {/* Lugar de entrega / carga / documentos anexos */}
      <div className="flex border-x border-b border-ink/50">
        <div className="w-1/3 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            3. Lugar de entrega
          </div>
          <div className="mt-0.5 whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.lugarEntrega.trim() || "—"}
          </div>
        </div>
        <div className="w-1/3 border-l border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            4. Lugar y fecha de carga
          </div>
          <div className="mt-0.5 whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {[d.lugarCarga.trim(), d.fechaCarga.trim()]
              .filter(Boolean)
              .join(" · ") || "—"}
          </div>
        </div>
        <div className="w-1/3 border-l border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            5. Documentos anexos
          </div>
          <div className="mt-0.5 whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.documentosAnexos.trim() || "—"}
          </div>
        </div>
      </div>

      {/* Tabla de mercancías (casillas 6-12) */}
      <div className="mt-2 border-x border-t border-ink/50">
        <div className="flex bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="w-[14%] px-1.5 py-1">Marcas y nº (6)</div>
          <div className="w-[9%] border-l border-ink/50 px-1.5 py-1">
            Nº bultos (7)
          </div>
          <div className="w-[13%] border-l border-ink/50 px-1.5 py-1">
            Embalaje (8)
          </div>
          <div className="flex-1 border-l border-ink/50 px-1.5 py-1">
            Naturaleza (9)
          </div>
          <div className="w-[11%] border-l border-ink/50 px-1.5 py-1">
            Nº estad. (10)
          </div>
          <div className="w-[11%] border-l border-ink/50 px-1.5 py-1">
            Peso bruto (11)
          </div>
          <div className="w-[10%] border-l border-ink/50 px-1.5 py-1">
            Volumen (12)
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
            <div className="w-[9%] border-l border-ink/50 px-1.5 py-1.5">
              {l.numBultos || "—"}
            </div>
            <div className="w-[13%] border-l border-ink/50 px-1.5 py-1.5">
              {l.embalaje || "—"}
            </div>
            <div className="flex-1 whitespace-pre-wrap border-l border-ink/50 px-1.5 py-1.5">
              {l.naturaleza || "—"}
            </div>
            <div className="w-[11%] border-l border-ink/50 px-1.5 py-1.5">
              {l.estadistico || "—"}
            </div>
            <div className="w-[11%] border-l border-ink/50 px-1.5 py-1.5">
              {l.pesoBruto || "—"}
            </div>
            <div className="w-[10%] border-l border-ink/50 px-1.5 py-1.5">
              {l.volumen || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Instrucciones / Porte */}
      <div className="flex border-x border-b border-ink/50">
        <div className="w-2/3 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            13. Instrucciones del remitente
          </div>
          <div className="mt-0.5 min-h-[1.25rem] whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.instrucciones.trim() || "—"}
          </div>
        </div>
        <div className="w-1/3 border-l border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            15. Porte
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            {PORTE_LABEL[d.porte]}
          </div>
        </div>
      </div>

      {/* Estipulaciones particulares / matrícula */}
      <div className="flex border-x border-b border-ink/50">
        <div className="w-2/3 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            19. Estipulaciones particulares
          </div>
          <div className="mt-0.5 min-h-[1.25rem] whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.estipulaciones.trim() || "—"}
          </div>
        </div>
        <div className="w-1/3 border-l border-ink/50 px-2 py-1.5">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            Matrícula del vehículo
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ink">
            {d.matricula.trim() || "—"}
          </div>
        </div>
      </div>

      {/* Transportista (casilla 16) */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          16. Transportista
        </div>
        <div className="mt-0.5 text-[10px] leading-snug text-ink">
          <span className="font-medium">{d.transportistaNombre || "—"}</span>
          {d.transportistaDireccion && (
            <div className="whitespace-pre-wrap">{d.transportistaDireccion}</div>
          )}
        </div>
      </div>

      {/* Firmas */}
      <div className="mt-3 flex gap-3">
        <div className="flex-1 border border-ink/50 px-2 py-2 text-center">
          <div className="mb-1 h-12 border-b border-ink/60">
            <span className="text-[10px] italic text-ink">
              {d.firmaRemitente}
            </span>
          </div>
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            22. Firma del remitente
          </div>
        </div>
        <div className="flex-1 border border-ink/50 px-2 py-2 text-center">
          <div className="mb-1 h-12 border-b border-ink/60">
            <span className="text-[10px] italic text-ink">
              {d.firmaTransportista}
            </span>
          </div>
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            23. Firma del transportista
          </div>
        </div>
        <div className="flex-1 border border-ink/50 px-2 py-2">
          <div className="text-[8px] font-semibold uppercase text-ink/60">
            21. Formalizada en … el …
          </div>
          <div className="mt-0.5 min-h-[3rem] whitespace-pre-wrap text-[10px] leading-snug text-ink">
            {d.lugarFecha.trim() || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
