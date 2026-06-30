import {
  ShieldCheck,
  Clock,
  FileCheck2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const BENEFICIOS = [
  { icon: FileCheck2, t: "Reduce errores aduaneros", d: "Documentación validada que evita retenciones y multas." },
  { icon: Clock, t: "Ahorra tiempo en normativa", d: "Respuestas con fuente en segundos, no horas de búsqueda." },
  { icon: Sparkles, t: "Automatiza documentos", d: "DUA, certificados y facturas generados a partir de tus datos." },
  { icon: AlertTriangle, t: "Detecta riesgos", d: "Anticipa inspecciones y controles antes de que ocurran." },
  { icon: Layers, t: "Todo en un lugar", d: "Información logística, documental y normativa unificada." },
  { icon: ShieldCheck, t: "Seguridad y cumplimiento", d: "Cifrado, RGPD y alojamiento en la UE." },
];

const SERVICIOS = [
  "Automatización documental",
  "Consultas normativas con IA",
  "Gestión de requisitos aduaneros",
  "Análisis de riesgos",
  "Seguimiento de operaciones",
  "Alertas regulatorias",
];

const PERFILES = [
  "Importadores", "Exportadores", "Transitarios", "Agentes de aduanas",
  "Operadores logísticos", "Empresas de transporte", "Consultores", "Supply chain",
];

const FAQ = [
  ["¿ComexIA presenta el DUA ante la aduana o solo lo prepara?", "ComexIA prepara y valida la documentación; la presentación se realiza según tu operativa habitual."],
  ["¿De dónde sale la información normativa y está actualizada?", "De fuentes oficiales (UE, AEAT, TARIC). Cada respuesta cita su fuente para que puedas verificarla."],
  ["¿Mis datos están seguros y dónde se alojan?", "Datos cifrados, cumplimiento RGPD y alojamiento en la Unión Europea."],
  ["¿Sirve para mercancías peligrosas y productos sanitarios?", "Sí: activa automáticamente los requisitos y documentos específicos (DGD, fitosanitarios, etc.)."],
  ["¿Resuelve casos nuevos sin plantilla previa?", "Sí: el motor razona y deriva la solución, declarando su nivel de confianza cuando el caso es atípico."],
];

export default function LandingPage() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            <Sparkles className="size-3.5 text-accent-500" /> IA especializada en comercio exterior
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Tu copiloto de comercio exterior con{" "}
            <span className="text-brand-gradient">IA</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Documentación, normativa, aduanas y riesgos de tus importaciones y
            exportaciones, en un solo lugar.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/app" variant="primary" size="lg">
              Prueba ComexIA gratis
            </ButtonLink>
            <ButtonLink href="/app/motor" variant="secondary" size="lg">
              Ver demo
            </ButtonLink>
          </div>
          <p className="mt-4 text-xs text-muted">
            Sin tarjeta · Datos cifrados · Normativa UE
          </p>
        </section>

        {/* Beneficios */}
        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFICIOS.map((b) => (
              <Card key={b.t}>
                <CardBody>
                  <b.icon className="size-6 text-brand-700" />
                  <h3 className="mt-3 font-semibold text-ink">{b.t}</h3>
                  <p className="mt-1 text-sm text-muted">{b.d}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-2xl font-semibold text-ink">
              Servicios de ComexIA
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICIOS.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-medium text-ink"
                >
                  <ArrowRight className="size-4 text-accent-500" /> {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IA */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold text-ink">
                IA que cita sus fuentes
              </h2>
              <p className="mt-3 text-muted">
                Pregunta en lenguaje natural y obtén documentación obligatoria,
                normativa, riesgos, requisitos sanitarios y pasos recomendados.
                Resuelve incluso operaciones nuevas, declarando su nivel de
                confianza.
              </p>
              <ButtonLink href="/app/motor" variant="gradient" className="mt-6">
                Probar el asistente <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
            <Card>
              <CardBody className="space-y-3">
                <div className="rounded-lg bg-brand-50 p-3 text-sm text-ink">
                  «Quiero importar semillas de sésamo desde India a España. ¿Qué
                  documentación necesito?»
                </div>
                <div className="rounded-lg border border-line p-3 text-sm text-muted">
                  <p className="font-medium text-ink">Documentación obligatoria</p>
                  DUA, factura, packing list, DV1, certificado fitosanitario…
                  <p className="mt-2 font-medium text-danger">
                    ⚠ Control reforzado vigente (aflatoxinas)
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Perfiles */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <h2 className="text-2xl font-semibold text-ink">Perfiles a los que ayuda</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {PERFILES.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-center text-2xl font-semibold text-ink">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ.map(([q, a]) => (
              <details
                key={q}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-ink">
                  {q}
                </summary>
                <p className="mt-2 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-2xl bg-brand-gradient px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-semibold">
              Empieza a resolver tus operaciones hoy
            </h2>
            <p className="mt-2 text-white/80">
              Prueba ComexIA gratis. Sin tarjeta.
            </p>
            <ButtonLink
              href="/app"
              variant="secondary"
              size="lg"
              className="mt-6"
            >
              Crear cuenta
            </ButtonLink>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
