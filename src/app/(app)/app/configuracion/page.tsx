import { Building2, CreditCard, Users, Bell, Palette } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { TemaSwitcher } from "@/components/app/tema-switcher";

const PROXIMAMENTE = [
  { icon: Building2, titulo: "Datos de empresa", detalle: "EORI, país, perfil fiscal" },
  { icon: CreditCard, titulo: "Plan y facturación", detalle: "Gestión de suscripción y pagos" },
  { icon: Users, titulo: "Usuarios y roles", detalle: "Equipo y permisos" },
  { icon: Bell, titulo: "Notificaciones y alertas", detalle: "Preferencias de avisos" },
];

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Configuración</h1>
        <p className="text-sm text-muted">Cuenta, empresa, plan y apariencia.</p>
      </div>

      {/* Apariencia — funcional */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-brand-700" />
            <h2 className="text-sm font-semibold text-ink">Apariencia</h2>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Tema</p>
              <p className="text-xs text-muted">
                Claro, oscuro o según tu sistema operativo.
              </p>
            </div>
            <TemaSwitcher />
          </div>
        </CardBody>
      </Card>

      {/* Resto de secciones — próximamente */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          Próximamente
        </p>
        <Card className="divide-y divide-line">
          {PROXIMAMENTE.map(({ icon: Icon, titulo, detalle }) => (
            <div
              key={titulo}
              className="flex items-center gap-3 px-5 py-4"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-canvas text-muted">
                <Icon className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{titulo}</p>
                <p className="text-xs text-muted">{detalle}</p>
              </div>
              <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-faint">
                Pronto
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
