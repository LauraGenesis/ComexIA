import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un importe en euros. */
export function formatEUR(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formatea una fecha como "24 jun". */
export function formatDateShort(d: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(d);
}

/** Formatea un tamaño en bytes como "1,2 MB". */
export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const unidades = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    unidades.length - 1,
  );
  const valor = bytes / Math.pow(k, i);
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(valor)} ${unidades[i]}`;
}

/** Bandera emoji a partir de un código ISO de país (ES, IN, JP…). */
export function flag(iso: string) {
  if (!iso || iso.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split("")
      .map((c) => A + c.charCodeAt(0) - 65),
  );
}
