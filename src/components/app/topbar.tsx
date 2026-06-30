import { Search, Bell } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface px-5">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input
          type="search"
          placeholder="Buscar expedientes, productos, normativa…"
          className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-faint focus:border-brand-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        className="relative grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas"
        aria-label="Notificaciones"
      >
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-danger text-[10px] font-semibold text-white">
          3
        </span>
      </button>
      <button
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-90"
        aria-label="Cuenta"
      >
        <span className="grid size-9 place-items-center rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-[var(--shadow-brand)]">
          L
        </span>
      </button>
    </header>
  );
}
