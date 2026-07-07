import { NextResponse } from "next/server";
import {
  actualizarTituloExpediente,
  eliminarExpediente,
  getExpedienteById,
} from "@/lib/repo";

/** Actualiza campos editables del expediente (de momento, el título/producto). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { producto?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const producto = (body.producto ?? "").trim();
  if (!producto) {
    return NextResponse.json(
      { error: "El título no puede estar vacío" },
      { status: 422 },
    );
  }

  const exp = await getExpedienteById(id);
  if (!exp) {
    return NextResponse.json(
      { error: "Expediente no encontrado" },
      { status: 404 },
    );
  }

  await actualizarTituloExpediente(id, producto);
  return NextResponse.json({ ok: true });
}

/** Elimina el expediente y sus datos asociados (documentos, alertas, eventos). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const exp = await getExpedienteById(id);
  if (!exp) {
    return NextResponse.json(
      { error: "Expediente no encontrado" },
      { status: 404 },
    );
  }

  await eliminarExpediente(id);
  return NextResponse.json({ ok: true });
}
