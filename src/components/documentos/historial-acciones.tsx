"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

/** Botón de borrado de una entrada del historial (con confirmación). */
export function BorrarDocumento({ id, titulo }: { id: string; titulo: string }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState(false);

  async function borrar() {
    if (!confirm(`¿Eliminar «${titulo}» del historial?`)) return;
    setBorrando(true);
    try {
      const res = await fetch(`/api/documentos/historial/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setBorrando(false);
      alert("No se pudo eliminar. Inténtalo de nuevo.");
    }
  }

  return (
    <button
      type="button"
      onClick={borrar}
      disabled={borrando}
      className="inline-flex items-center gap-1 text-sm text-muted hover:text-danger disabled:opacity-50"
      aria-label={`Eliminar ${titulo}`}
    >
      {borrando ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </button>
  );
}
