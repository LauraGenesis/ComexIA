import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Card, CardBody } from "@/components/ui/card";
import {
  Sparkles,
  BookOpenCheck,
  ClipboardList,
  ShieldAlert,
  Route,
  BellRing,
} from "lucide-react";

const SERVICIOS = [
  { icon: Sparkles, t: "Automatización documental", d: "Genera DUA, packing list, facturas, DV1 y certificados validados a partir de los datos de la operación." },
  { icon: BookOpenCheck, t: "Consultas normativas con IA", d: "Respuestas en lenguaje natural con normativa aplicable, pasos y fuentes citadas." },
  { icon: ClipboardList, t: "Gestión de requisitos aduaneros", d: "Requisitos por país, producto y código TARIC/HS, con aranceles y certificados exigidos." },
  { icon: ShieldAlert, t: "Análisis de riesgos", d: "Probabilidad de inspección y nivel de riesgo por operación, con acciones para reducirlo." },
  { icon: Route, t: "Seguimiento de operaciones", d: "Estado, documentos pendientes y plazos de cada expediente en un único panel." },
  { icon: BellRing, t: "Alertas regulatorias", d: "Avisos de controles reforzados, documentación incompleta y cambios normativos." },
];

export default function ServiciosPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-3xl font-bold text-ink">Servicios</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Todo lo que necesitas para gestionar importaciones y exportaciones,
          potenciado por IA.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s) => (
            <Card key={s.t}>
              <CardBody>
                <s.icon className="size-6 text-brand-700" />
                <h2 className="mt-3 font-semibold text-ink">{s.t}</h2>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
