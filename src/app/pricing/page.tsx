import { Check } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANES = [
  {
    nombre: "Básico",
    precio: "29€",
    periodo: "/mes",
    publico: "Autónomos y pequeños importadores",
    destacado: false,
    features: [
      "Consultas IA limitadas",
      "Hasta 10 expedientes",
      "Documentos básicos",
      "Búsqueda de normativa",
      "Alertas básicas",
      "1 usuario · soporte por email",
    ],
  },
  {
    nombre: "Profesional",
    precio: "89€",
    periodo: "/mes",
    publico: "Transitarios y pymes",
    destacado: true,
    features: [
      "Consultas IA ampliadas",
      "Expedientes ampliados",
      "Todos los documentos + plantillas",
      "Normativa avanzada + filtros",
      "Alertas avanzadas",
      "Varios usuarios · soporte prioritario",
    ],
  },
  {
    nombre: "Empresa",
    precio: "A medida",
    periodo: "",
    publico: "Grandes operadores y consultoras",
    destacado: false,
    features: [
      "Consultas IA ilimitadas",
      "Expedientes ilimitados",
      "Todo + personalización y API",
      "Normativa avanzada + API",
      "Alertas a medida",
      "Equipos + roles · soporte dedicado / SLA",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-center text-3xl font-bold text-ink">
          Planes para cada tamaño de operación
        </h1>
        <p className="mt-2 text-center text-muted">
          Empieza gratis. Sin tarjeta.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANES.map((p) => (
            <Card
              key={p.nombre}
              className={cn(
                "relative",
                p.destacado && "border-brand-700 shadow-md ring-1 ring-brand-700",
              )}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-medium text-white">
                  Más popular
                </span>
              )}
              <CardBody className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{p.nombre}</h2>
                  <p className="text-xs text-muted">{p.publico}</p>
                </div>
                <p className="text-3xl font-bold text-ink">
                  {p.precio}
                  <span className="text-base font-normal text-muted">
                    {p.periodo}
                  </span>
                </p>
                <ButtonLink
                  href="/app"
                  variant={p.destacado ? "primary" : "secondary"}
                  className="w-full"
                >
                  {p.nombre === "Empresa" ? "Hablar con ventas" : "Empezar"}
                </ButtonLink>
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-muted">
                      <Check className="size-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
