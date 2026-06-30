"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Formulario de subida de un documento de soporte a la biblioteca. */
export function BibliotecaUploader() {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!(data.get("archivo") as File)?.size) {
      setError("Adjunta un archivo.");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const res = await fetch("/api/biblioteca", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir");
      form.reset();
      router.refresh(); // recarga la lista (página dinámica)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-ink">Título</span>
          <input
            name="titulo"
            placeholder="Ej. Reglamento (UE) 952/2013 — CAU"
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-ink">Categoría</span>
          <input
            name="categoria"
            placeholder="Normativa, Plantillas, Casos…"
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </label>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">Descripción</span>
        <textarea
          name="descripcion"
          rows={2}
          placeholder="Breve resumen del contenido del documento."
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-medium text-ink">Archivo (PDF, imagen… máx. 25 MB)</span>
        <input
          name="archivo"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={subiendo}>
        {subiendo ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {subiendo ? "Subiendo…" : "Subir a la biblioteca"}
      </Button>
    </form>
  );
}
