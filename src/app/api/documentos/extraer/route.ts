import { NextResponse } from "next/server";
import { dossierDemo } from "@/lib/documentos/dossier";

// Lectura de ficheros en memoria: requiere runtime Node.
export const runtime = "nodejs";

// Límite defensivo por archivo (25 MB), igual que la biblioteca.
const MAX_BYTES = 25 * 1024 * 1024;

// La API de Claude lee de forma nativa PDF e imágenes; nada más de momento.
const MIME_ACEPTADOS = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sube uno o varios documentos y devuelve el dossier canónico extraído.
 *
 * ORDEN:
 *  1. Sin ANTHROPIC_API_KEY (p. ej. demo en Vercel) → dossier de ejemplo.
 *  2. Con API key → extracción real con Claude.
 *  3. Si la IA falla → degrada al dossier de ejemplo para no romper el flujo
 *     (se marca con fuente "demo" para ser honestos en la UI).
 */
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

  const files = form
    .getAll("archivos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Adjunta al menos un documento." },
      { status: 422 },
    );
  }

  for (const f of files) {
    if (f.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `«${f.name}» supera el límite de 25 MB.` },
        { status: 413 },
      );
    }
    if (!MIME_ACEPTADOS.has(f.type)) {
      return NextResponse.json(
        {
          error: `Formato no admitido en «${f.name}». Sube PDF, PNG, JPG o WEBP.`,
        },
        { status: 415 },
      );
    }
  }

  const { extraccionIaActiva, extraerDossier } = await import(
    "@/lib/documentos/extraer"
  );

  // 1) Modo demo (sin API key): dossier de ejemplo con algo de latencia.
  if (!extraccionIaActiva()) {
    await sleep(600);
    return NextResponse.json({ ok: true, dossier: dossierDemo(), fuente: "demo" });
  }

  // 2) Extracción real con Claude.
  try {
    const archivos = await Promise.all(
      files.map(async (f) => ({
        nombre: f.name,
        mime: f.type,
        base64: Buffer.from(await f.arrayBuffer()).toString("base64"),
      })),
    );
    const dossier = await extraerDossier(archivos);
    return NextResponse.json({ ok: true, dossier, fuente: "ia" });
  } catch (e) {
    // 3) La IA falló: degradamos al ejemplo, pero lo decimos.
    console.error("[extraer] Falló la extracción con Claude:", e);
    return NextResponse.json({ ok: true, dossier: dossierDemo(), fuente: "demo" });
  }
}
