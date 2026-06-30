import { NextResponse } from "next/server";
import { resolucionSchema } from "@/lib/motor";
import { crearExpedienteDesdeResolucion } from "@/lib/repo";

export async function POST(req: Request) {
  let body: { texto?: string; resolucion?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = resolucionSchema.safeParse(body.resolucion);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Resolución no válida" },
      { status: 422 },
    );
  }

  const id = await crearExpedienteDesdeResolucion({
    texto: body.texto ?? "",
    resolucion: parsed.data,
  });

  return NextResponse.json({ id }, { status: 201 });
}
