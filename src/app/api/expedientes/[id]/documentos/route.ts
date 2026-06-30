import { NextResponse } from "next/server";
import { guardarDua } from "@/lib/repo";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { tipo?: string; subtipo?: string; datos?: unknown };
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

  await guardarDua({
    expedienteId: id,
    subtipo: body.subtipo ?? "importacion",
    datos: body.datos,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
