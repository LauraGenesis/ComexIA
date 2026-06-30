import { Placeholder } from "@/components/app/placeholder";

export default function NormativaPage() {
  return (
    <Placeholder
      titulo="Motor de normativa"
      descripcion="Busca requisitos y normativa por país, producto y código TARIC/HS."
      proximamente={[
        "Filtrar por país de origen/destino, producto, TARIC y tipo de riesgo",
        "Ver aranceles, contingentes y certificados exigidos",
        "Consultar controles aduaneros, sanitarios y fitosanitarios",
        "Acceder a la fuente normativa de cada requisito",
      ]}
    />
  );
}
