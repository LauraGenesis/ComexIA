import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { crearFuente } from "@/lib/repo";

// Subida de ficheros: requiere runtime Node (acceso a disco).
export const runtime = "nodejs";

// Límite defensivo de tamaño (25 MB).
const MAX_BYTES = 25 * 1024 * 1024;

/** Convierte el nombre original en un slug seguro conservando la extensión. */
function nombreSeguro(original: string): string {
  const ext = path.extname(original).toLowerCase().slice(0, 10);
  const base = path
    .basename(original, path.extname(original))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${randomUUID().slice(0, 8)}-${base || "documento"}${ext}`;
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Se esperaba multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("archivo");
  const titulo = String(form.get("titulo") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Adjunta un archivo." },
      { status: 422 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 25 MB." },
      { status: 413 },
    );
  }

  const archivo = nombreSeguro(file.name);
  const destino = path.join(process.cwd(), "public", "biblioteca", archivo);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(destino, bytes);

  const id = await crearFuente({
    titulo: titulo || file.name,
    descripcion: descripcion || undefined,
    categoria: categoria || "General",
    archivo,
    mime: file.type || "application/octet-stream",
    tamano: file.size,
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
