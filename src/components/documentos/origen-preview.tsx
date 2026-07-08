import type { OrigenDatos } from "@/lib/documentos/origen";

/*
 * Vista previa fiel del Certificado de Origen (modelo comunitario). Reproduce
 * las casillas oficiales 1–7 más el recuadro de certificación de la autoridad
 * emisora. Hoja "en papel" (fondo blanco fijo), imprimible a PDF con `.doc-print`.
 */

function Casilla({
  n,
  label,
  children,
  className = "",
}: {
  n?: string;
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-ink/50 px-2 py-1.5 ${className}`}>
      <div className="text-[8px] font-semibold uppercase leading-tight text-ink/60">
        {n && <span className="mr-1">{n}</span>}
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap break-words text-[10px] leading-snug text-ink">
        {children || " "}
      </div>
    </div>
  );
}

export function OrigenPreview({ d }: { d: OrigenDatos }) {
  return (
    <div
      className="dua-print doc-print mx-auto bg-white p-6 text-ink"
      id="origen-preview"
    >
      {/* Cabecera */}
      <div className="mb-2 flex items-start justify-between border-b-2 border-ink pb-2">
        <div>
          <div className="text-[10px] font-semibold uppercase text-ink/70">
            Comunidad Europea
          </div>
          <div className="text-lg font-bold uppercase tracking-wide">
            Certificado de Origen
          </div>
          <div className="text-[10px] uppercase text-ink/60">
            Certificate of Origin
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          {d.numero && <div>Nº {d.numero}</div>}
          <div className="mt-1 text-[9px] text-ink/50">Original</div>
        </div>
      </div>

      {/* Casilla 1 exportador */}
      <Casilla n="1." label="Exportador (nombre, dirección, país)">
        <div className="font-medium">{d.exportadorNombre || "—"}</div>
        {d.exportadorDireccion && <div>{d.exportadorDireccion}</div>}
        {d.exportadorPais && <div>{d.exportadorPais}</div>}
      </Casilla>

      {/* Casilla 2 destinatario + 3 país de origen */}
      <div className="flex">
        <Casilla n="2." label="Destinatario (nombre, dirección, país)" className="w-3/5">
          <div className="font-medium">{d.destinatarioNombre || "A la orden"}</div>
          {d.destinatarioDireccion && <div>{d.destinatarioDireccion}</div>}
        </Casilla>
        <Casilla n="3." label="País de origen" className="flex-1">
          <div className="text-sm font-bold uppercase">
            {d.paisOrigen || "—"}
          </div>
        </Casilla>
      </div>

      {/* Casilla 4 transporte + 5 observaciones */}
      <div className="flex">
        <Casilla n="4." label="Información sobre el transporte" className="w-1/2">
          {d.transporte}
        </Casilla>
        <Casilla n="5." label="Observaciones" className="flex-1">
          {d.observaciones}
        </Casilla>
      </div>

      {/* Casilla 6/7 tabla de mercancías */}
      <div className="border-x border-b border-ink/50">
        <div className="flex border-b border-ink/50 bg-ink/5 text-[8px] font-semibold uppercase text-ink/60">
          <div className="w-2/5 px-2 py-1">
            6. Número de orden; marcas y numeración; número y clase de bultos;
            designación de las mercancías
          </div>
          <div className="flex-1 border-l border-ink/50 px-2 py-1">
            7. Cantidad
          </div>
        </div>
        {d.lineas.map((l, i) => (
          <div key={i} className="flex border-b border-ink/30 last:border-b-0">
            <div className="w-2/5 px-2 py-1.5 text-[10px] leading-snug">
              <span className="mr-1 text-ink/50">{i + 1}.</span>
              {l.marcas && <span className="font-medium">{l.marcas} · </span>}
              {[l.numBultos, l.tipoBulto].filter(Boolean).join(" ")}
              {(l.numBultos || l.tipoBulto) && l.descripcion ? " — " : ""}
              {l.descripcion || (!l.numBultos && !l.marcas ? "—" : "")}
            </div>
            <div className="flex-1 border-l border-ink/50 px-2 py-1.5 text-[10px] leading-snug">
              {l.cantidad || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Certificación de la autoridad emisora */}
      <div className="mt-3 border border-ink/50 p-3">
        <div className="text-[8px] font-semibold uppercase text-ink/60">
          La autoridad abajo firmante certifica que las mercancías descritas son
          originarias del país indicado en la casilla 3.
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-[10px] leading-snug">
            <div className="font-medium">{d.autoridadEmisora || "Autoridad emisora"}</div>
            <div className="text-ink/70">
              {[d.lugarEmision, d.fechaEmision].filter(Boolean).join(", ")}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 h-10 w-40 border-b border-ink/50" />
            <div className="text-[9px] text-ink/60">Sello y firma</div>
          </div>
        </div>
      </div>

      {d.solicitante && (
        <div className="mt-2 text-[9px] text-ink/60">
          Solicitado por: <span className="text-ink">{d.solicitante}</span>
        </div>
      )}
    </div>
  );
}
