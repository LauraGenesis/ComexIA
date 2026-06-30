import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
              C
            </span>
            <span className="text-lg font-semibold text-ink">ComexIA</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Tu copiloto de comercio exterior con IA.
          </p>
        </div>
        <FooterCol
          titulo="Producto"
          links={[
            ["Servicios", "/servicios"],
            ["Roles", "/roles"],
            ["Pricing", "/pricing"],
          ]}
        />
        <FooterCol
          titulo="Recursos"
          links={[
            ["FAQ", "/#faq"],
            ["Seguridad", "/#seguridad"],
          ]}
        />
        <FooterCol
          titulo="Legal"
          links={[
            ["Aviso legal", "#"],
            ["Privacidad", "#"],
            ["Contacto", "#"],
          ]}
        />
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © 2026 ComexIA · Datos cifrados · Cumplimiento RGPD · Alojamiento UE
      </div>
    </footer>
  );
}

function FooterCol({
  titulo,
  links,
}: {
  titulo: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{titulo}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
