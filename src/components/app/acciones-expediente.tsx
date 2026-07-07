"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Modo = null | "renombrar" | "eliminar";

/**
 * Menú de acciones por expediente (kebab): renombrar o eliminar. Renombrar hace
 * PATCH y eliminar hace DELETE contra /api/expedientes/[id]; ambos refrescan la
 * vista al terminar. Pensado para las filas de tabla del dashboard y del listado.
 */
export function AccionesExpediente({
  id,
  producto,
}: {
  id: string;
  producto: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<Modo>(null);
  const [valor, setValor] = useState(producto);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera.
  useEffect(() => {
    if (!abierto) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto]);

  function abrir(m: Exclude<Modo, null>) {
    setAbierto(false);
    setError(null);
    setValor(producto);
    setModo(m);
  }

  function cerrar() {
    if (procesando) return;
    setModo(null);
    setError(null);
  }

  async function renombrar() {
    const nuevo = valor.trim();
    if (!nuevo || nuevo === producto) {
      cerrar();
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch(`/api/expedientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto: nuevo }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo renombrar");
      }
      setModo(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al renombrar");
    } finally {
      setProcesando(false);
    }
  }

  async function eliminar() {
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch(`/api/expedientes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "No se pudo eliminar");
      }
      setModo(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Acciones del expediente"
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-canvas hover:text-ink"
      >
        <MoreVertical className="size-4" />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => abrir("renombrar")}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
          >
            <Pencil className="size-4 text-muted" /> Renombrar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => abrir("eliminar")}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-danger hover:bg-danger-bg"
          >
            <Trash2 className="size-4" /> Eliminar
          </button>
        </div>
      )}

      {modo && (
        <ModalAcciones
          modo={modo}
          producto={producto}
          valor={valor}
          onValor={setValor}
          procesando={procesando}
          error={error}
          onCancelar={cerrar}
          onConfirmar={modo === "renombrar" ? renombrar : eliminar}
        />
      )}
    </div>
  );
}

function ModalAcciones({
  modo,
  producto,
  valor,
  onValor,
  procesando,
  error,
  onCancelar,
  onConfirmar,
}: {
  modo: Exclude<Modo, null>;
  producto: string;
  valor: string;
  onValor: (v: string) => void;
  procesando: boolean;
  error: string | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  const esRenombrar = modo === "renombrar";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold text-ink">
          {esRenombrar ? "Renombrar expediente" : "Eliminar expediente"}
        </h2>

        {esRenombrar ? (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Nombre del expediente
            </label>
            <input
              autoFocus
              value={valor}
              onChange={(e) => onValor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirmar();
                if (e.key === "Escape") onCancelar();
              }}
              disabled={procesando}
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-medium text-ink">«{producto}»</span>? Se
            borrarán también sus documentos, alertas e historial. Esta acción no
            se puede deshacer.
          </p>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancelar}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            variant={esRenombrar ? "primary" : "secondary"}
            size="sm"
            onClick={onConfirmar}
            disabled={procesando}
            className={
              esRenombrar
                ? undefined
                : "border-danger bg-danger text-white hover:bg-danger hover:opacity-90"
            }
          >
            {procesando && <Loader2 className="size-4 animate-spin" />}
            {esRenombrar ? "Guardar" : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
