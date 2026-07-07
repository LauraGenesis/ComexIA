import { NextResponse } from "next/server";
import { eliminarDocumentoGenerado } from "@/lib/repo";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await eliminarDocumentoGenerado(id);
  return NextResponse.json({ ok: true });
}
