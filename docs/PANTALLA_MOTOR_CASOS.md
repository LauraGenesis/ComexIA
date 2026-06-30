# ComexIA — Pantalla del Motor de Resolución de Casos (diseño para Figma)

> Especificación visual y de interacción de la pantalla núcleo.
> Wireframes en baja fidelidad listos para maquetar en Figma.
> Complementa `MOTOR_RESOLUCION.md` y `ESPECIFICACION_PRODUCTO.md`.

---

## 1. Propósito de la pantalla

Es la pantalla donde el usuario **describe una operación (incluso nueva) y obtiene una resolución completa**: requisitos, documentación, normativa, riesgo y plan de acción, con fuentes y nivel de confianza. Desde aquí crea el expediente y genera documentos.

**Tres estados principales:**
1. **Entrada** — describir el caso.
2. **Procesando** — el motor razona (con pasos visibles).
3. **Resolución** — resultado estructurado y accionable.

---

## 2. Estado 1 — Entrada del caso

El usuario puede describir en lenguaje natural **o** rellenar campos. Conviven en la misma pantalla.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☰  ComexIA            🔍 Buscar…                      🔔 3   ⬤ Laura ▾    │
├────────────┬─────────────────────────────────────────────────────────────┤
│ ▣ Dashboard│   Resolver una operación                                     │
│ ▤ Expedien.│   Describe tu caso y ComexIA derivará requisitos, documentos │
│ ✦ Motor IA │   y riesgos — aunque sea una operación nueva.                │
│ ▦ Documen. │                                                             │
│ ▥ Normativa│   ┌───────────────────────────────────────────────────────┐ │
│ ⚠ Alertas  │   │ Quiero importar semillas de sésamo desde India a      │ │
│ ⚙ Config.  │   │ España. ¿Qué necesito?                                 │ │
│            │   │                                                  ✦ →   │ │
│            │   └───────────────────────────────────────────────────────┘ │
│            │   ⌘ o completa los campos:                                   │
│            │   ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│            │   │ Tipo ▾      │ Producto    │ Origen ▾    │ Destino ▾   │ │
│            │   │ Importación │ Sésamo      │ India 🇮🇳   │ España 🇪🇸  │ │
│            │   └─────────────┴─────────────┴─────────────┴─────────────┘ │
│            │   ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│            │   │ HS/TARIC ?  │ Incoterm ▾  │ Transporte ▾│ Valor       │ │
│            │   │ [sugerir]   │ CFR         │ Marítimo    │ 50.000 €    │ │
│            │   └─────────────┴─────────────┴─────────────┴─────────────┘ │
│            │                                                             │
│            │   Ejemplos rápidos:                                         │
│            │   [ Exportar calzado a Japón ]  [ Mercancía peligrosa ADR ] │
│            │   [ Tránsito T1 ]  [ Importación temporal ]                 │
│            │                                                             │
│            │                                   [  Resolver operación ✦  ] │
│            └─────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Caja de texto natural grande (placeholder con ejemplo real) + botón enviar IA.
- Campos estructurados opcionales (tipo, producto, origen, destino, HS/TARIC con botón **"sugerir"**, incoterm, transporte, valor).
- Chips de **ejemplos rápidos** que cubren casuística variada (no solo importación) → comunica generalidad.
- CTA primario **"Resolver operación"**.

---

## 3. Estado 2 — Procesando (el motor razona)

Muestra los pasos del motor (§ del `MOTOR_RESOLUCION.md`) para transmitir rigor y no "caja negra".

```
┌───────────────────────────────────────────────────────────┐
│   Resolviendo tu operación…                                │
│                                                           │
│   ✓ Comprendiendo el caso                                  │
│   ✓ Clasificando (TARIC 1207.40.90 · importación)         │
│   ◐ Derivando requisitos normativos…                       │
│   ○ Seleccionando documentación                            │
│   ○ Evaluando riesgo de inspección                         │
│   ○ Generando plan de acción                               │
│                                                           │
│   [ ▓▓▓▓▓▓▓▓▓░░░░░ ]  60%                                  │
└───────────────────────────────────────────────────────────┘
```

Si faltan datos clave, en vez de procesar pregunta lo mínimo:
```
   Para afinar la resolución, ¿cuál es el peso neto aproximado?
   [ ___ kg ]   [ No lo sé, estima ]
```

---

## 4. Estado 3 — Resolución estructurada

Resultado en bloques (espejo de la salida canónica del motor). Layout a dos columnas: contenido + panel lateral de acciones.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Volver      Importación de sésamo · India 🇮🇳 → España 🇪🇸               │
│  TARIC 1207.40.90   Incoterm CFR   Marítimo        Confianza: ▓▓▓▓░ 82%   │
├───────────────────────────────────────────┬──────────────────────────────┤
│                                           │   RIESGO DE INSPECCIÓN        │
│  🟥 ALERTA CRÍTICA                         │   ┌────────────────────────┐ │
│  Control reforzado vigente para sésamo de │   │   ● ALTO                │ │
│  India (aflatoxinas / óxido de etileno).  │   │  Motivo: control        │ │
│                                           │   │  reforzado de origen    │ │
│  ▸ DOCUMENTACIÓN OBLIGATORIA              │   └────────────────────────┘ │
│    ☐ DUA de importación        [Generar] │                              │
│    ☐ Factura comercial         [Generar] │   ACCIONES                    │
│    ☐ Packing list              [Generar] │   [ Crear expediente      ]   │
│    ☐ DV1 (valor en aduana)     [Generar] │   [ Generar todos los doc ]   │
│    ☐ Certificado fitosanitario [Adjuntar]│   [ Exportar resolución PDF]  │
│    ☐ Analítica de aflatoxinas  [Adjuntar]│   [ Preguntar a la IA     ]   │
│                                           │                              │
│  ▸ NORMATIVA APLICABLE                    │   ¿Algo no encaja?            │
│    • Reglamento (UE) … control reforzado  │   [ Corregir datos ]          │
│      Fuente: EUR-Lex ↗                     │   Tus correcciones mejoran    │
│    • Código aduanero de la Unión          │   las próximas resoluciones.  │
│      Fuente: AEAT ↗                        │                              │
│                                           │                              │
│  ▸ REQUISITOS SANITARIOS / FITOSANITARIOS │                              │
│    • Inspección en PCF                     │                              │
│    • Certificado fitosanitario del origen  │                              │
│                                           │                              │
│  ▸ PLAN DE ACCIÓN                         │                              │
│    1. Confirmar partida TARIC 1207.40.90  │                              │
│    2. Pedir fitosanitario al exportador    │                              │
│    3. Preparar factura, packing list, DV1  │                              │
│    4. Presentar DUA                        │                              │
│    5. Prever control documental reforzado  │                              │
│                                           │                              │
│  ⓘ VERIFICAR (confianza < 100%)           │                              │
│    • Vigencia exacta del control reforzado │                              │
│    • Clasificación TARIC del subtipo       │                              │
└───────────────────────────────────────────┴──────────────────────────────┘
```

**Bloques (acordeón, todos desplegables):**
1. **Alertas** (banda de color según severidad).
2. **Documentación** (checklist con estado obligatorio/recomendado/condicional + botón Generar/Adjuntar por documento).
3. **Normativa aplicable** (cada ítem con enlace a fuente ↗).
4. **Requisitos sanitarios/fitosanitarios**.
5. **Plan de acción** (lista numerada).
6. **Verificar** (lo que el motor no da por seguro → materializa el *fallback honesto*).

**Panel lateral:**
- **Indicador de riesgo** (semáforo + motivo).
- **Acciones:** crear expediente, generar todos los documentos, exportar PDF, preguntar a la IA.
- **Corregir datos** + microcopy de aprendizaje continuo ("tus correcciones mejoran las próximas resoluciones").

**Cabecera:** ruta con banderas, chips de TARIC/incoterm/transporte y **barra de confianza** siempre visible.

---

## 5. Estado especial — Caso nuevo / atípico (sin plantilla)

Clave para comunicar que la plataforma **no se limita a casos conocidos**. Cuando la confianza es baja:

```
┌───────────────────────────────────────────────────────────┐
│  Confianza: ▓▓░░░ 45%   ·   Caso poco frecuente            │
│                                                           │
│  ⓘ No tenemos un caso idéntico, así que ComexIA ha        │
│     razonado por analogía con operaciones similares.       │
│     Revisa los puntos marcados antes de presentar.         │
│                                                           │
│  Esta resolución se basa en: [3 reglas] [2 casos análogos] │
└───────────────────────────────────────────────────────────┘
```

- No bloquea: entrega la mejor resolución posible y **deja claro qué verificar**.
- Muestra en qué se apoyó (reglas + casos análogos) → transparencia.

---

## 6. Estados auxiliares

- **Vacío:** primera vez, sin operaciones → caja de entrada + ejemplos rápidos protagonistas.
- **Carga:** pasos del motor (Estado 2).
- **Error / datos insuficientes:** pregunta mínima inline, nunca un muro.
- **Éxito tras crear expediente:** toast "Expediente creado" + enlace al detalle.

---

## 7. Componentes Figma que requiere esta pantalla

| Componente | Variantes |
|---|---|
| Caja de entrada IA | normal / con foco / con texto |
| Campo estructurado | texto / select / con botón "sugerir" / inferido |
| Chip de ejemplo | default / hover |
| Stepper de procesamiento | paso pendiente / en curso / completado |
| Barra de confianza | alta / media / baja (verde/ámbar/rojo) |
| Banda de alerta | info / advertencia / crítica |
| Acordeón de bloque | colapsado / expandido |
| Fila de documento (checklist) | obligatorio / recomendado / condicional · generar / adjuntar |
| Ítem de normativa con fuente | con enlace ↗ |
| Tarjeta de riesgo | bajo / medio / alto |
| Panel de acciones | botones primario/secundario |
| Banner de caso atípico | confianza baja |

---

## 8. Notas de interacción

- **Una sola pantalla, tres estados** (no navegación entre páginas) → sensación de fluidez.
- La **barra de confianza** y las **fuentes** están siempre presentes: confianza y transparencia son parte del producto, no un extra.
- **Generar documento** abre el wizard del generador con datos precargados (no hay que reescribir nada).
- **Corregir datos** vuelve al Estado 1 con los campos rellenos y **recalcula** al reenviar.
- Todo accionable desde teclado; foco inicial en la caja de texto.

---

## 9. Orden sugerido de maquetación en Figma

1. Estado 1 — Entrada (la "cara" del producto).
2. Estado 3 — Resolución (la prueba de valor).
3. Estado 5 — Caso atípico (el diferenciador: resuelve lo nuevo).
4. Estado 2 — Procesando.
5. Estados auxiliares (vacío, error, éxito).
6. Prototipar el flujo: Entrada → Procesando → Resolución → "Crear expediente" → Dashboard.

*Fin del documento.*
