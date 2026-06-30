# ComexIA — Motor de Resolución de Casos Aduaneros

> Arquitectura conceptual del núcleo de la plataforma.
> Cómo ComexIA resuelve **cualquier** operación de comercio exterior, incluidas las que aún no han ocurrido.
> Versión 1.0 — Junio 2026. Complementa `ESPECIFICACION_PRODUCTO.md` (§1.bis y §5.F).

---

## 0. Idea central

El motor **no elige** la solución de una lista cerrada de casos: la **deriva** razonando sobre los datos de la operación y un cuerpo de conocimiento normativo versionado. Los casos de `docs/` son ejemplos para entrenar y validar, no el límite.

```
Caso (lenguaje natural o formulario)
        │
        ▼
[1] Comprensión  →  [2] Clasificación  →  [3] Derivación de requisitos
        │                                          │
        ▼                                          ▼
[4] Selección documental  ◄──────────────  [5] Evaluación de riesgo
        │
        ▼
[6] Plan de acción  →  [7] Resolución estructurada (con fuentes + confianza)
        │
        ▼
[8] Expediente + documentos  →  [9] Realimentación / aprendizaje
```

---

## 1. Entrada — Comprensión del caso

**Objetivo:** convertir una descripción libre o un formulario en un *modelo de operación* estructurado.

- Acepta texto natural ("importar semillas de sésamo de India a España") o campos.
- Extrae entidades: producto, cantidades, valor, países origen/destino, incoterm, transporte, partes (EORI), fechas.
- **Detecta lo que falta** y lo pide (preguntas mínimas, no formularios largos).
- Infiere valores razonables y los marca como "inferidos" (revisables por el usuario).

**Modelo de operación (esquema conceptual):**
```json
{
  "tipo": "importacion | exportacion | transito | ...",
  "regimen": "definitivo | deposito | perfeccionamiento_activo | temporal | ...",
  "producto": { "descripcion": "...", "hs_taric": "1207.40.90", "naturaleza": ["alimentario","origen_vegetal"] },
  "origen": "IN", "destino": "ES",
  "incoterm": "CFR", "transporte": "maritimo_contenedor",
  "valor": { "importe": 50000, "moneda": "EUR" },
  "partes": { "importador_eori": "ES...", "exportador": "..." },
  "campos_inferidos": ["incoterm"],
  "campos_faltantes": ["peso_neto"]
}
```

---

## 2. Clasificación

**Objetivo:** situar la operación en sus categorías para activar las reglas correctas.

- **Clasificación arancelaria (HS/TARIC):** si el usuario no la sabe, el motor la **sugiere** a partir de la descripción del producto, con alternativas y confianza. La partida es la llave maestra que abre los requisitos.
- **Tipo y régimen aduanero:** definitivo, tránsito (T1/T2), depósito, perfeccionamiento activo/pasivo, importación temporal, reimportación, territorios especiales (Canarias, Ceuta, Melilla), zona franca.
- **Naturaleza de la mercancía:** general, perecedera, peligrosa (ADR/IMDG/IATA), doble uso, sanitaria, fitosanitaria, animal/vegetal, sujeta a CITES, etc.

La clasificación es **multietiqueta**: una operación puede ser, a la vez, importación + alimentaria + origen vegetal + control reforzado.

---

## 3. Derivación de requisitos (corazón del razonamiento)

**Objetivo:** determinar qué exige *esta* operación, razonando — no consultando una tabla fija.

Para cada dimensión, el motor evalúa reglas sobre la base de conocimiento:

| Dimensión | Qué resuelve |
|---|---|
| Arancelaria | Derechos, IVA importación, contingentes, preferencias por origen |
| Origen | Necesidad de prueba de origen (EUR.1, Form A, declaración) |
| Sanitaria/fitosanitaria | Controles SOIVRE/CSE, certificados, puntos de inspección fronteriza |
| Seguridad | Mercancías peligrosas, doble uso, restricciones/embargos |
| Documental | Documentos obligatorios y recomendados |
| Coherencia | Incoterm ↔ transporte, valor ↔ DV1, régimen ↔ documentación |

**Cómo razona (modelo de reglas + IA):**
- Reglas declarativas versionadas (condición → requisito → fuente). Ej.: *si producto ∈ sésamo y origen = India → control reforzado de aflatoxinas/óxido de etileno (Reglamento UE …)*.
- Cuando no hay regla exacta, la IA **generaliza** desde reglas próximas y casos análogos, y **baja la confianza**.
- Cada requisito derivado guarda **su fuente** (trazabilidad) y un **peso de certeza**.

> Principio: ante un caso nuevo, primero reglas explícitas; si no bastan, razonamiento análogo con confianza explícita; nunca afirmación inventada sin marca.

---

## 4. Selección documental

**Objetivo:** traducir requisitos en la lista concreta de documentos a generar.

- Mapea cada requisito a uno o varios documentos (catálogo abierto: DUA, factura, packing list, DV1, certificado de origen, fitosanitario, DGD, B/L/AWB/CMR/CIM/FBL, T1/T2…).
- Marca cada documento como **obligatorio / recomendado / condicional**.
- Encadena con el **generador documental** (precarga de datos del modelo de operación).
- Si surge un documento no catalogado, permite **definirlo** (campos + plantilla) y lo deja disponible para el futuro.

---

## 5. Evaluación de riesgo

**Objetivo:** anticipar inspecciones e incidencias.

Calcula un **nivel de riesgo** (bajo/medio/alto) combinando señales:
- Origen y producto sujetos a controles reforzados vigentes.
- Completitud y coherencia documental.
- Naturaleza sensible (peligrosa, sanitaria, doble uso).
- Histórico de incidencias en operaciones similares.

Devuelve riesgo + **motivos** + acciones para reducirlo.

---

## 6. Plan de acción

**Objetivo:** entregar pasos accionables, en orden, con responsable y plazo sugerido.

Ejemplo de salida:
1. Confirmar partida TARIC 1207.40.90.
2. Solicitar certificado fitosanitario al exportador.
3. Preparar factura, packing list y DV1.
4. Presentar DUA de importación.
5. Prever control documental reforzado (adjuntar analítica de aflatoxinas).

---

## 7. Resolución estructurada (salida del motor)

La salida canónica que consume la UI y el resto de módulos:

```json
{
  "resumen": "Importación de sésamo IN→ES, control reforzado.",
  "documentacion": [ {"doc":"DUA importación","estado":"obligatorio"}, ... ],
  "normativa": [ {"titulo":"Reglamento UE ...","fuente":"...","relevancia":"alta"} ],
  "riesgos": [ {"tipo":"inspeccion_documental","nivel":"alto","motivo":"control reforzado origen India"} ],
  "requisitos_sanitarios": [ "Certificado fitosanitario", "Analítica de aflatoxinas" ],
  "alertas": [ {"severidad":"critica","mensaje":"Control reforzado vigente"} ],
  "pasos": [ "...", "..." ],
  "confianza": 0.82,
  "verificar": [ "Confirmar partida TARIC", "Vigencia del control reforzado" ]
}
```

Toda afirmación lleva fuente; el bloque `confianza` + `verificar` materializa el **fallback honesto**.

---

## 8. Persistencia — de resolución a expediente

- La resolución se convierte en **expediente** (datos + documentos + riesgo + plan + historial).
- Cambios del usuario (corregir TARIC, añadir documento) **recalculan** requisitos y riesgo (RN-03).
- El historial es **auditable e inmutable** (RN-10).

---

## 9. Aprendizaje continuo

**Objetivo:** que cada caso resuelto mejore los siguientes (RN-14).

- Las correcciones del usuario se capturan como señales (qué cambió y por qué).
- Con consentimiento, alimentan la base de conocimiento y ajustan reglas/ejemplos.
- Cierra el bucle: la plataforma se vuelve más precisa con el uso, manteniendo trazabilidad.

---

## 10. Capas de conocimiento (cómo se mantiene abierto)

| Capa | Contenido | Cómo se actualiza |
|---|---|---|
| Reglas normativas | condición → requisito → fuente, versionadas | Datos, sin tocar código |
| Catálogo documental | definiciones (campos + plantilla) | Datos / editor de plantillas |
| Casos de referencia | ejemplos resueltos (los de `docs/` y nuevos) | Ingesta + aprendizaje |
| Modelo IA | razonamiento y generalización | Prompting + recuperación (RAG) sobre las capas anteriores |

**Clave de extensibilidad:** producto y lógica permanecen estables; el conocimiento crece como **datos versionados**. Así ComexIA resuelve casos futuros sin reescribirse.

---

## 11. Garantías de calidad (no negociables)

- **Trazabilidad:** cada requisito y afirmación cita su fuente.
- **Confianza explícita:** ninguna respuesta atípica se presenta como certeza absoluta.
- **Coherencia:** validaciones cruzadas (incoterm/transporte, valor/DV1, régimen/documentos).
- **Reversibilidad:** el usuario puede revisar y corregir todo lo inferido.
- **Auditabilidad:** historial inmutable de decisiones y cambios.

*Fin del documento.*
