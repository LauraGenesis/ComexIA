"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Tema = "claro" | "oscuro" | "sistema";

const OPCIONES: { valor: Tema; label: string; icon: React.ElementType }[] = [
  { valor: "claro", label: "Claro", icon: Sun },
  { valor: "oscuro", label: "Oscuro", icon: Moon },
  { valor: "sistema", label: "Sistema", icon: Monitor },
];

// Store mínimo sobre localStorage: localStorage.setItem no emite "storage" en la
// misma pestaña, así que notificamos a los suscriptores a mano al cambiar.
let listeners: (() => void)[] = [];
function subscribe(cb: () => void) {
  listeners.push(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    window.removeEventListener("storage", cb);
  };
}
function getSnapshot(): Tema {
  return (localStorage.getItem("tema") as Tema | null) ?? "sistema";
}
function getServerSnapshot(): Tema {
  return "sistema";
}

/** Aplica el tema a <html>, resolviendo "sistema" contra el SO. */
function aplicarTema(tema: Tema) {
  const oscuro =
    tema === "oscuro" ||
    (tema === "sistema" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", oscuro);
}

/** Selector de tema con persistencia en localStorage. */
export function TemaSwitcher() {
  const tema = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Si el tema es "sistema", reacciona a cambios del SO en vivo.
  useEffect(() => {
    if (tema !== "sistema") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => aplicarTema("sistema");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [tema]);

  function elegir(nuevo: Tema) {
    localStorage.setItem("tema", nuevo);
    aplicarTema(nuevo);
    listeners.forEach((l) => l());
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className="inline-flex rounded-lg border border-line bg-canvas p-1"
    >
      {OPCIONES.map(({ valor, label, icon: Icon }) => {
        const activo = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => elegir(valor)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activo
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
