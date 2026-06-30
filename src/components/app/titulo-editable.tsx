"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";

/**
 * Título de expediente editable en línea. Muestra el texto con un lápiz al
 * pasar el ratón; al editar, guarda vía PATCH /api/expedientes/[id] y refresca.
 */
export function TituloEditable({
  id,
  titulo,
}: {
  id: string;
  titulo: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(titulo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancelar() {
    setEditando(false);
    setValor(titulo);
    setError(null);
  }

  async function guardar() {
    const nuevo = valor.trim();
    if (!nuevo || nuevo === titulo) {
      cancelar();
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/expedientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto: nuevo }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo guardar");
      }
      setEditando(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  if (!editando) {
    return (
      <span className="group/title inline-flex items-center gap-2">
        <span>{titulo}</span>
        <button
          type="button"
          onClick={() => {
            setValor(titulo);
            setEditando(true);
          }}
          aria-label="Editar título"
          className="text-faint opacity-0 transition-opacity hover:text-brand-700 group-hover/title:opacity-100"
        >
          <Pencil className="size-4" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <input
        autoFocus
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") guardar();
          if (e.key === "Escape") cancelar();
        }}
        disabled={guardando}
        className="min-w-0 max-w-full rounded-lg border border-line bg-canvas px-2 py-1 text-xl font-semibold text-ink focus:border-brand-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={guardar}
        disabled={guardando}
        aria-label="Guardar título"
        className="text-success hover:opacity-80"
      >
        {guardando ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Check className="size-5" />
        )}
      </button>
      <button
        type="button"
        onClick={cancelar}
        disabled={guardando}
        aria-label="Cancelar edición"
        className="text-muted hover:text-ink"
      >
        <X className="size-5" />
      </button>
      {error && <span className="text-sm font-normal text-danger">{error}</span>}
    </span>
  );
}
