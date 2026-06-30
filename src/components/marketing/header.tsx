import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold text-ink">ComexIA</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/servicios" className="hover:text-ink">Servicios</Link>
          <Link href="/roles" className="hover:text-ink">Roles</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/app" variant="ghost" size="sm">
            Entrar
          </ButtonLink>
          <ButtonLink href="/app" variant="primary" size="sm">
            Prueba gratis
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
