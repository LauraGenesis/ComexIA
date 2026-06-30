import "server-only";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { resolucionSchema, type Resolucion } from "./schema";
import type { EntradaCaso } from "./index";
import type { ReglaAnaloga } from "./reglas";

/*
 * Motor con IA (Claude) — COMPLEMENTO OPCIONAL y de bajo coste.
 *
 * Solo se invoca cuando la base de conocimiento (reglas) no cubre el caso y hay
 * ANTHROPIC_API_KEY configurada. Usa el modelo MÁS BARATO (Haiku 4.5) para que
 * el gasto sea de céntimos.
 *
 * SALIDA ESTRUCTURADA VÍA TOOL USE: en lugar de pedir un JSON por prompt y
 * parsearlo a mano (frágil: un JSON mal formado tiraba toda la resolución al
 * mock), declaramos una herramienta cuyo input_schema ES nuestro resolucionSchema.
 * Forzamos su uso con tool_choice, así Claude devuelve directamente un objeto que
 * cumple la forma. resolucionSchema sigue validando como red de seguridad final.
 */

// Claude Haiku 4.5: el modelo más económico de Anthropic ($1/$5 por 1M tokens).
const MODELO = "claude-haiku-4-5";

const cliente = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

// El input_schema de la herramienta se deriva del propio zod (única fuente de
// verdad): nada de mantener el esquema duplicado en el prompt.
const ESQUEMA_RESOLUCION = z.toJSONSchema(resolucionSchema, {
  target: "draft-2020-12",
}) as Anthropic.Tool.InputSchema;

const HERRAMIENTA: Anthropic.Tool = {
  name: "registrar_resolucion",
  description:
    "Registra la resolución aduanera estructurada del caso de comercio exterior.",
  input_schema: ESQUEMA_RESOLUCION,
};

const SISTEMA = `Eres un experto en comercio exterior y aduanas de España y la Unión Europea.
Dado un caso (importación, exportación o tránsito), produces una resolución estructurada
llamando a la herramienta "registrar_resolucion" con todos sus campos.
Si se te proporcionan CASOS ANÁLOGOS de la base de conocimiento, trátalos como el
criterio de la casa: reutiliza sus documentos, normativa y pasos cuando apliquen y
mantén su estilo y nivel de detalle, adaptándolos al caso concreto. No los copies a
ciegas si el caso difiere.
Sé honesto: si no estás seguro, baja la confianza y enumera en "verificar" lo que habría
que confirmar. Escribe todo el contenido en español.`;

/** Formatea las reglas análogas como contexto legible para el prompt. */
function describirAnalogos(contexto: ReglaAnaloga[]): string {
  return contexto
    .map(({ nombre, resolucion: r }, i) => {
      const docs = r.documentacion
        .map((d) => `${d.doc} (${d.estado})`)
        .join(", ");
      const normas = r.normativa.map((n) => `${n.titulo} — ${n.fuente}`).join("; ");
      const pasos = r.pasos.map((p, j) => `${j + 1}. ${p}`).join(" ");
      return [
        `CASO ANÁLOGO ${i + 1}: ${nombre}`,
        `  Resumen: ${r.resumen}`,
        docs && `  Documentación: ${docs}`,
        normas && `  Normativa: ${normas}`,
        pasos && `  Pasos: ${pasos}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function describirCaso(e: EntradaCaso): string {
  const partes = [
    e.texto && `Descripción: ${e.texto}`,
    e.producto && `Producto: ${e.producto}`,
    e.origen && `Origen (ISO2): ${e.origen}`,
    e.destino && `Destino (ISO2): ${e.destino}`,
    e.tipo && `Tipo: ${e.tipo}`,
    e.hsTaric && `TARIC: ${e.hsTaric}`,
    e.incoterm && `Incoterm: ${e.incoterm}`,
    e.transporte && `Transporte: ${e.transporte}`,
  ].filter(Boolean);
  return partes.join("\n");
}

/**
 * Resuelve un caso con Claude (Haiku) y devuelve una Resolucion validada.
 * `contexto` son reglas análogas de la base con las que anclar el razonamiento
 * (grounding). Si viene vacío, Claude resuelve sin guía.
 */
export async function resolverConClaude(
  e: EntradaCaso,
  contexto: ReglaAnaloga[] = [],
): Promise<Resolucion> {
  const prompt = contexto.length
    ? `${describirCaso(e)}\n\n--- CASOS ANÁLOGOS DE LA BASE DE CONOCIMIENTO (úsalos como referencia) ---\n${describirAnalogos(contexto)}`
    : describirCaso(e);

  const respuesta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 4096,
    system: SISTEMA,
    tools: [HERRAMIENTA],
    // Obliga a Claude a responder usando la herramienta (salida estructurada).
    tool_choice: { type: "tool", name: HERRAMIENTA.name },
    messages: [{ role: "user", content: prompt }],
  });

  const bloque = respuesta.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!bloque) {
    throw new Error("Claude no devolvió la herramienta registrar_resolucion");
  }

  // El input ya viene con la forma del esquema; validamos para aplicar defaults
  // y normalizar. Si no encaja, lanza y el index cae al mock.
  return resolucionSchema.parse(bloque.input);
}
