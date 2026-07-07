import { NormativaBuscador } from "@/components/app/normativa-buscador";
import { getReglas } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function NormativaPage() {
  const reglas = await getReglas();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Normativa</h1>
        <p className="text-sm text-muted">
          Busca requisitos y normativa por producto, país, código TARIC/HS y
          tipo de riesgo. {reglas.length}{" "}
          {reglas.length === 1 ? "regla" : "reglas"} en la base de conocimiento.
        </p>
      </div>

      <NormativaBuscador reglas={reglas} />
    </div>
  );
}
