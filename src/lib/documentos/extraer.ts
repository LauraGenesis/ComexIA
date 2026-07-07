import "server-only";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { dossierSchema, type Dossier } from "./dossier";

/*
 * Extractor de documentos con IA (Claude).
 *
 * Lee PDFs e imágenes de forma NATIVA (bloques `document` e `image` en base64):
 * no hace falta OCR ni librerías externas. Se le pueden pasar VARIOS documentos
 * a la vez (packing list + factura + B/L) y Claude los cruza para rellenar huecos.
 *
 * SALIDA ESTRUCTURADA VÍA TOOL USE, igual que el motor: la herramienta declara
 * como input_schema nuestro `dossierSchema` (única fuente de verdad) y se fuerza
 * su uso con tool_choice. El zod valida al final como red de seguridad.
 */

// Haiku 4.5 tiene visión y lectura de PDF, y es el modelo más económico.
// Si algún escaneo sale muy pobre, aquí se puede subir a un modelo mayor.
const MODELO = "claude-haiku-4-5";

const cliente = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const ESQUEMA_DOSSIER = z.toJSONSchema(dossierSchema, {
  target: "draft-2020-12",
}) as Anthropic.Tool.InputSchema;

const HERRAMIENTA: Anthropic.Tool = {
  name: "registrar_extraccion",
  description:
    "Registra los datos estructurados extraídos de los documentos de comercio exterior adjuntos.",
  input_schema: ESQUEMA_DOSSIER,
};

const SISTEMA = `Eres un experto en documentación de comercio exterior y aduanas de España y la UE.
Recibes uno o varios documentos (packing list, factura comercial, conocimiento de embarque,
CMR, certificados…) y extraes sus datos llamando a la herramienta "registrar_extraccion".
Reglas:
- Rellena únicamente lo que puedas leer o inferir con seguridad. Deja vacío lo que no aparezca.
- Cuando falte un dato relevante o dudes, añádelo a "verificar" en lugar de inventarlo.
- Usa códigos ISO 3166-1 alfa-2 para países (ES, JP…) e ISO 4217 para divisas (EUR…).
- Si hay varios documentos, combínalos: un dato ausente en uno puede estar en otro.
- Identifica en "documentosDetectados" qué tipos de documento has reconocido.
- Escribe todo el contenido en español.`;

/** Tipos de imagen que la API de Claude admite como bloque `image`. */
type MediaImagen = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export interface ArchivoEntrada {
  nombre: string;
  mime: string;
  base64: string;
}

/** ¿Hay API key de Claude configurada? (extracción real disponible). */
export function extraccionIaActiva(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Extrae el dossier canónico de los documentos adjuntos con Claude.
 * Lanza si la IA no devuelve la herramienta o el resultado no valida (el caller
 * decide el fallback, p. ej. el dossier de ejemplo del modo demo).
 */
export async function extraerDossier(
  archivos: ArchivoEntrada[],
): Promise<Dossier> {
  const bloques: Anthropic.ContentBlockParam[] = [];

  for (const a of archivos) {
    if (a.mime === "application/pdf") {
      bloques.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: a.base64 },
      });
    } else if (a.mime.startsWith("image/")) {
      bloques.push({
        type: "image",
        source: { type: "base64", media_type: a.mime as MediaImagen, data: a.base64 },
      });
    }
  }

  bloques.push({
    type: "text",
    text: "Extrae todos los datos de comercio exterior de los documentos anteriores y regístralos con la herramienta.",
  });

  const respuesta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 4096,
    system: SISTEMA,
    tools: [HERRAMIENTA],
    tool_choice: { type: "tool", name: HERRAMIENTA.name },
    messages: [{ role: "user", content: bloques }],
  });

  const bloque = respuesta.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!bloque) {
    throw new Error("Claude no devolvió la herramienta registrar_extraccion");
  }

  return dossierSchema.parse(bloque.input);
}
