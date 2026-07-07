import { NextResponse } from "next/server";
import { guardarDocumentoGenerado } from "@/lib/repo";
import { tituloDocumento } from "@/lib/documentos/historial";

/**
 * Registra (o actualiza, si llega `id`) un documento en el historial.
 * Hoy solo DUA; el catálogo es ampliable a Factura/Certificado sin tocar esto.
 */
export async function POST(req: Request) {
  let body: {
    id?: string;
    tipo?: string;
    subtipo?: string;
    origen?: string;
    datos?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.tipo !== "DUA" || !body.datos) {
    return NextResponse.json(
      { error: "Tipo de documento no soportado" },
      { status: 422 },
    );
  }

  const id = await guardarDocumentoGenerado({
    id: body.id,
    tipo: body.tipo,
    subtipo: body.subtipo,
    titulo: tituloDocumento(body.tipo, body.subtipo, body.datos),
    origen: body.origen ?? "manual",
    datos: body.datos,
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
