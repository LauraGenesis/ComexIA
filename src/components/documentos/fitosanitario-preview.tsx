import {
  FITO_CERTIFICACION,
  FITO_AVISO_BORRADOR,
  type FitoDatos,
} from "@/lib/documentos/fitosanitario";

/*
 * Vista previa fiel del Certificado Fitosanitario (modelo NIMF nº 12 / UE
 * 2016-2031). Incluye SIEMPRE la banda de BORRADOR —también en el PDF— porque
 * el documento solo es válido tras su emisión oficial por la ONPF. Hoja "en
 * papel" (fondo blanco fijo), imprimible con `.doc-print`.
 */

function Campo({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-semibold uppercase text-ink/60">{label}: </span>
      <span className="text-ink">{valor?.trim() || "—"}</span>
    </div>
  );
}

export function FitosanitarioPreview({ d }: { d: FitoDatos }) {
  return (
    <div
      className="dua-print doc-print mx-auto bg-white p-6 text-ink"
      id="fitosanitario-preview"
    >
      {/* Banda de borrador (visible también al imprimir) */}
      <div className="mb-3 rounded border border-warning/60 bg-warning/10 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-warning">
        {FITO_AVISO_BORRADOR}
      </div>

      {/* Cabecera */}
      <div className="mb-2 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Certificado Fitosanitario
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Phytosanitary Certificate · Modelo NIMF nº 12
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          <div>Nº {d.numero || "—"}</div>
        </div>
      </div>

      {/* Casilla 1 exportador */}
      <div className="border border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          1. Nombre y dirección del exportador
        </div>
        <div className="mt-0.5 text-[10px] leading-snug text-ink">
          <span className="font-medium">{d.exportadorNombre || "—"}</span>
          {d.exportadorDireccion && (
            <div className="whitespace-pre-wrap">{d.exportadorDireccion}</div>
          )}
        </div>
      </div>

      {/* Casilla 2 ONPF origen → destino */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          2. Organización de Protección Fitosanitaria de
        </div>
        <div className="text-[10px] font-medium text-ink">
          {d.onpfOrigen || "—"}
        </div>
        <div className="mt-1 text-[8px] font-semibold uppercase text-ink/60">
          A: Organización(es) de Protección Fitosanitaria de
        </div>
        <div className="text-[10px] font-medium text-ink">
          {d.onpfDestino || "—"}
        </div>
      </div>

      {/* Casilla 3 destinatario */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          3. Nombre y dirección declarados del destinatario
        </div>
        <div className="mt-0.5 text-[10px] leading-snug text-ink">
          <span className="font-medium">{d.destinatarioNombre || "—"}</span>
          {d.destinatarioDireccion && (
            <div className="whitespace-pre-wrap">{d.destinatarioDireccion}</div>
          )}
        </div>
      </div>

      {/* Casilla 4 descripción del envío (cabecera) */}
      <div className="border-x border-b border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          4. Descripción del envío
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Lugar de origen" valor={d.lugarOrigen} />
          <Campo label="Medio de transporte" valor={d.medioTransporte} />
          <Campo label="Punto de entrada" valor={d.puntoEntrada} />
        </div>
      </div>

      {/* Tabla de mercancías */}
      <div className="border-x border-b border-ink/50">
        <div className="flex bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="w-1/3 px-2 py-1">Marcas; nº y clase de bultos</div>
          <div className="w-1/4 border-l border-ink/50 px-2 py-1">
            Nombre del producto
          </div>
          <div className="flex-1 border-l border-ink/50 px-2 py-1">
            Nombre botánico
          </div>
          <div className="w-1/6 border-l border-ink/50 px-2 py-1">Cantidad</div>
        </div>
        {d.lineas.map((l, i) => (
          <div key={i} className="flex border-t border-ink/30 text-[10px] leading-snug">
            <div className="w-1/3 whitespace-pre-wrap px-2 py-1.5">
              {l.marcasBultos || "—"}
            </div>
            <div className="w-1/4 border-l border-ink/50 px-2 py-1.5">
              {l.nombreProducto || "—"}
            </div>
            <div className="flex-1 border-l border-ink/50 px-2 py-1.5 italic">
              {l.nombreBotanico || "—"}
            </div>
            <div className="w-1/6 border-l border-ink/50 px-2 py-1.5">
              {l.cantidad || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Declaración de certificación (texto fijo NIMF 12) */}
      <div className="mt-3 text-[9px] leading-snug text-ink/80">
        {FITO_CERTIFICACION}
      </div>

      {/* Declaración adicional */}
      <div className="mt-2 border border-ink/50 px-2 py-1.5">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          Declaración adicional
        </div>
        <div className="mt-0.5 min-h-[1.5rem] whitespace-pre-wrap text-[10px] leading-snug text-ink">
          {d.declaracionAdicional || " "}
        </div>
      </div>

      {/* Tratamiento de desinfestación / desinfección */}
      <div className="mt-2 border border-ink/50 px-2 py-1.5">
        <div className="mb-1 text-[8px] font-semibold uppercase text-ink/60">
          Tratamiento de desinfestación y/o desinfección
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
          <Campo label="Tratamiento" valor={d.tratTratamiento} />
          <Campo label="Producto químico" valor={d.tratProducto} />
          <Campo label="Concentración" valor={d.tratConcentracion} />
          <Campo label="Duración y temp." valor={d.tratDuracionTemp} />
          <Campo label="Fecha" valor={d.tratFecha} />
          <Campo label="Info. adicional" valor={d.tratInfoAdicional} />
        </div>
      </div>

      {/* Emisión */}
      <div className="mt-4 flex items-end justify-between text-[10px]">
        <div className="leading-snug">
          <Campo label="Lugar de expedición" valor={d.lugarEmision} />
          <Campo label="Fecha" valor={d.fechaEmision} />
          <Campo label="Funcionario autorizado" valor={d.funcionario} />
        </div>
        <div className="text-center">
          <div className="mb-1 h-12 w-40 border border-dashed border-ink/40" />
          <div className="text-[9px] text-ink/60">Sello de la ONPF y firma</div>
        </div>
      </div>
    </div>
  );
}
