import type { DuaDatos } from "@/lib/documentos/dua";

/*
 * Vista previa EXTENSA del DUA: documento oficial a página completa (A4) con
 * todas las casillas 1–54 en disposición fiel. Imprimible a PDF.
 */

function Box({
  n,
  label,
  children,
  className = "",
  grow = false,
}: {
  n?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  grow?: boolean;
}) {
  return (
    <div
      className={`border border-ink/50 px-1.5 py-1 ${grow ? "flex-1" : ""} ${className}`}
    >
      {(n || label) && (
        <div className="text-[8px] font-semibold uppercase leading-tight text-ink/70">
          {n ? <span className="mr-1">{n}</span> : null}
          {label}
        </div>
      )}
      <div className="mt-0.5 whitespace-pre-wrap break-words text-[10px] leading-snug text-ink">
        {children || " "}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex">{children}</div>;
}

export function DuaPreview({ d }: { d: DuaDatos }) {
  const es = d.tipo === "exportacion";
  return (
    <div className="dua-print doc-print mx-auto bg-white p-4 text-ink" id="dua-preview">
      {/* Cabecera */}
      <div className="mb-1 flex items-end justify-between border-b-2 border-ink pb-1">
        <div>
          <div className="text-[10px] font-semibold uppercase text-ink/70">
            Unión Europea
          </div>
          <div className="text-sm font-bold">
            Documento Único Administrativo (DUA)
          </div>
        </div>
        <div className="text-right text-[10px] text-ink/70">
          {es ? "Ejemplar de exportación" : "Ejemplar de importación"}
        </div>
      </div>

      {/* Bloque superior: 2 / 1 / A · 3-7 */}
      <Row>
        <Box n="2" label="Expedidor / Exportador" className="w-2/5">
          {d.exportadorEori && `Nº ${d.exportadorEori}\n`}
          {d.exportadorNombre}
          {d.exportadorDireccion && `\n${d.exportadorDireccion}`}
        </Box>
        <div className="flex w-[18%] flex-col">
          <Box n="1" label="Declaración">
            {es ? "EX" : "IM"} · A
          </Box>
          <Row>
            <Box n="3" label="Form." grow>
              1/1
            </Box>
            <Box n="4" label="L. carga" grow>
              {d.totalBultos ? "Sí" : "—"}
            </Box>
          </Row>
        </div>
        <div className="flex flex-1 flex-col">
          <Box label={es ? "A · Aduana de expedición/exportación" : "A · Aduana de destino"}>
            {" "}
          </Box>
          <Row>
            <Box n="5" label="Partidas" grow>
              {d.partidas}
            </Box>
            <Box n="6" label="Total bultos" grow>
              {d.totalBultos}
            </Box>
            <Box n="7" label="Nº referencia" grow>
              {" "}
            </Box>
          </Row>
        </div>
      </Row>

      {/* 8 destinatario / 9 / 10-13 */}
      <Row>
        <Box n="8" label="Destinatario" className="w-2/5">
          {d.destinatarioEori && `Nº ${d.destinatarioEori}\n`}
          {d.destinatarioNombre}
          {d.destinatarioDireccion && `\n${d.destinatarioDireccion}`}
        </Box>
        <Box n="9" label="Responsable financiero" className="w-[18%]">
          {" "}
        </Box>
        <Box n="10" label="País 1er destino" grow>
          {d.paisDestino}
        </Box>
        <Box n="11" label="País transac." grow>
          {" "}
        </Box>
        <Box n="13" label="PAC" grow>
          {" "}
        </Box>
      </Row>

      {/* 14 declarante / 15-17 países */}
      <Row>
        <Box n="14" label="Declarante / Representante" className="w-2/5">
          {d.declaranteEori && `Nº ${d.declaranteEori}\n`}
          {d.declaranteNombre}
        </Box>
        <Box n="15" label="País expedición/exportación" grow>
          {d.paisExportacion}
        </Box>
        <Box n="15a" label="Cód." grow>
          {d.paisExportacion}
        </Box>
        <Box n="16" label="País origen" grow>
          {es ? d.paisExportacion : d.paisExportacion}
        </Box>
        <Box n="17" label="País destino" grow>
          {d.paisDestino}
        </Box>
        <Box n="17a" label="Cód." grow>
          {d.paisDestino}
        </Box>
      </Row>

      {/* 18-20 */}
      <Row>
        <Box n="18" label="Identidad y nacionalidad del medio de transporte a la salida/llegada" className="w-2/5">
          {d.modoTransporte}
        </Box>
        <Box n="19" label="Ctr." className="w-[10%]">
          {d.contenedor ? "1" : "0"}
        </Box>
        <Box n="20" label="Condiciones de entrega" grow>
          {`${d.incoterm}${d.lugarEntrega ? ` · ${d.lugarEntrega}` : ""}`.trim() || "—"}
        </Box>
      </Row>

      {/* 21-24 */}
      <Row>
        <Box n="21" label="Identidad y nacionalidad del medio de transporte activo en frontera" className="w-2/5">
          {" "}
        </Box>
        <Box n="22" label="Divisa e importe total facturado" grow>
          {d.divisaImporte}
        </Box>
        <Box n="23" label="Tipo de cambio" className="w-[12%]">
          {" "}
        </Box>
        <Box n="24" label="Naturaleza transacción" className="w-[14%]">
          {" "}
        </Box>
      </Row>

      {/* 25-28 */}
      <Row>
        <Box n="25" label="Modo transporte frontera" grow>
          {d.modoTransporte}
        </Box>
        <Box n="26" label="Modo transporte interior" grow>
          {" "}
        </Box>
        <Box n="27" label="Lugar de carga/descarga" grow>
          {d.lugarEntrega}
        </Box>
        <Box n="28" label="Datos financieros y bancarios" grow>
          {" "}
        </Box>
      </Row>

      {/* 29-30 */}
      <Row>
        <Box n="29" label="Aduana de entrada/salida" className="w-1/3">
          {" "}
        </Box>
        <Box n="30" label="Localización de las mercancías" grow>
          {" "}
        </Box>
      </Row>

      {/* 31 descripción + columna derecha 32-41 */}
      <Row>
        <Box
          n="31"
          label="Bultos y descripción de la mercancía · Marcas y números · Nº contenedor · Cantidad y clase"
          className="w-3/5"
        >
          {d.descripcionMercancia}
        </Box>
        <div className="flex flex-1 flex-col">
          <Row>
            <Box n="32" label="Partida" grow>
              {d.partidas}
            </Box>
            <Box n="33" label="Código mercancías" className="w-3/5">
              {d.codigoMercancia}
            </Box>
          </Row>
          <Row>
            <Box n="34" label="Cód. país origen" grow>
              {es ? d.paisExportacion : d.paisExportacion}
            </Box>
            <Box n="35" label="Masa bruta (kg)" grow>
              {d.masaBruta}
            </Box>
            <Box n="36" label="Prefer." grow>
              {" "}
            </Box>
          </Row>
          <Row>
            <Box n="37" label="Régimen" grow>
              {d.regimen}
            </Box>
            <Box n="38" label="Masa neta (kg)" grow>
              {d.masaNeta}
            </Box>
            <Box n="39" label="Conting." grow>
              {" "}
            </Box>
          </Row>
          <Row>
            <Box n="40" label="Documento precedente" grow>
              {" "}
            </Box>
            <Box n="41" label="Unid. supl." grow>
              {" "}
            </Box>
          </Row>
        </div>
      </Row>

      {/* 44 documentos + 42/45/46 */}
      <Row>
        <Box
          n="44"
          label="Indicaciones especiales / Documentos presentados / Certificados y autorizaciones"
          className="w-3/5"
        >
          {d.documentos}
        </Box>
        <div className="flex flex-1 flex-col">
          <Box n="42" label="Precio del artículo">
            {" "}
          </Box>
          <Box n="45" label="Ajuste">
            {" "}
          </Box>
          <Box n="46" label="Valor estadístico">
            {d.valorEstadistico}
          </Box>
        </div>
      </Row>

      {/* 47 cálculo de tributos */}
      <Box n="47" label="Cálculo de los tributos">
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="text-left text-ink/70">
              <th className="border border-ink/30 px-1 py-0.5 font-semibold">Clase</th>
              <th className="border border-ink/30 px-1 py-0.5 font-semibold">Base imponible</th>
              <th className="border border-ink/30 px-1 py-0.5 font-semibold">Tipo</th>
              <th className="border border-ink/30 px-1 py-0.5 font-semibold">Importe</th>
              <th className="border border-ink/30 px-1 py-0.5 font-semibold">MP</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i}>
                <td className="border border-ink/30 px-1 py-1">&nbsp;</td>
                <td className="border border-ink/30 px-1 py-1">&nbsp;</td>
                <td className="border border-ink/30 px-1 py-1">&nbsp;</td>
                <td className="border border-ink/30 px-1 py-1">&nbsp;</td>
                <td className="border border-ink/30 px-1 py-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* 48-49 / 50 */}
      <Row>
        <Box n="48" label="Aplazamiento de pago" grow>
          {" "}
        </Box>
        <Box n="49" label="Identificación del depósito" grow>
          {" "}
        </Box>
      </Row>

      {/* 54 firma */}
      <Row>
        <Box n="50" label="Obligado principal" className="w-1/2">
          {" "}
        </Box>
        <Box n="54" label="Lugar, fecha y firma del declarante/representante" grow>
          {`${d.lugarFecha}${d.firmaDeclarante ? `\n${d.firmaDeclarante}` : ""}`}
        </Box>
      </Row>
    </div>
  );
}
