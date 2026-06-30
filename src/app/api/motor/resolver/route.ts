import { NextResponse } from "next/server";
import { resolverCaso, type EntradaCaso } from "@/lib/motor";

export async function POST(req: Request) {
  let body: EntradaCaso;
  try {
    body = (await req.json()) as EntradaCaso;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.texto && !body.producto) {
    return NextResponse.json(
      { error: "Describe la operación o indica al menos el producto." },
      { status: 422 },
    );
  }

  const { resolucion, motor } = await resolverCaso(body);
  return NextResponse.json({ resolucion, motor });
}
