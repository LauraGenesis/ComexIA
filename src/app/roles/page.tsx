import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Card, CardBody } from "@/components/ui/card";

const ROLES = [
  { t: "Importador", d: "Consulta requisitos de un producto nuevo, crea el expediente y sigue el checklist." },
  { t: "Exportador", d: "Prepara factura, packing list, certificado de origen y DUA coherentes entre sí." },
  { t: "Transitario", d: "Gestiona muchos expedientes a la vez y prioriza por riesgo de inspección." },
  { t: "Agente de aduanas", d: "Genera DUA validados y comprueba la partida TARIC y los controles aplicables." },
  { t: "Operador logístico", d: "Coordina documentación y plazos de varias operaciones." },
  { t: "Responsable de compras", d: "Estima aranceles, requisitos y riesgos para elegir proveedor." },
  { t: "Supply chain", d: "Monitoriza el riesgo agregado de la cartera y los cambios normativos." },
];

export default function RolesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-3xl font-bold text-ink">Cómo ayuda ComexIA a cada perfil</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Una plataforma, muchos roles del comercio exterior.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <Card key={r.t}>
              <CardBody>
                <h2 className="font-semibold text-ink">{r.t}</h2>
                <p className="mt-1 text-sm text-muted">{r.d}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
