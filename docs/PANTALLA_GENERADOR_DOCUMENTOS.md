# ComexIA — Pantalla del Generador de Documentos (diseño para Figma)

> Especificación visual y de interacción del segundo flujo crítico.
> Wireframes en baja fidelidad listos para maquetar en Figma.
> Complementa `MOTOR_RESOLUCION.md`, `PANTALLA_MOTOR_CASOS.md` y `ESPECIFICACION_PRODUCTO.md` (§5.B).

---

## 1. Propósito de la pantalla

Es donde el usuario **convierte los datos de una operación en documentos correctos a la primera**: DUA, factura comercial, packing list, DV1, certificados, documentos de transporte, mercancías peligrosas, etc.

Principios heredados del motor (no negociables):
- **Catálogo abierto:** cada documento es una *definición* (campos + reglas + plantilla). Se añaden documentos nuevos sin rediseñar la pantalla.
- **Datos compartidos:** la factura alimenta el DUA, el packing list y el DV1. No se reescribe nada.
- **Validación en tiempo real:** señala campos faltantes e incoherencias antes de exportar.
- **Precarga desde el expediente / resolución del motor.**

**Cuatro estados / vistas:**
1. **Selección de documento** (catálogo).
2. **Edición** (formulario + vista previa, lado a lado).
3. **Validación / errores**.
4. **Exportación y resultado**.

---

## 2. Punto de entrada

Se llega de tres formas, siempre con datos precargados:
- Desde una **resolución del motor** → botón *"Generar"* en un documento, o *"Generar todos los documentos"*.
- Desde el **detalle de un expediente** → pestaña Documentos.
- Desde el **menú lateral** → Documentos → *Nuevo documento*.

---

## 3. Estado 1 — Selección de documento (catálogo abierto)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☰  ComexIA            🔍 Buscar…                      🔔 3   ⬤ Laura ▾    │
├────────────┬─────────────────────────────────────────────────────────────┤
│ ▣ Dashboard│   Generar documento                                          │
│ ▤ Expedien.│   Expediente: Importación sésamo · India → España            │
│ ✦ Motor IA │                                                             │
│ ▦ Documen. │   🔍 Buscar tipo de documento…                              │
│ ▥ Normativa│                                                             │
│ ⚠ Alertas  │   RECOMENDADOS PARA ESTA OPERACIÓN                          │
│ ⚙ Config.  │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│            │   │ 📄 DUA import.│ │ 🧾 Factura   │ │ 📦 Packing   │       │
│            │   │  Obligatorio │ │  Obligatorio │ │  Obligatorio │       │
│            │   │   [Generar]  │ │   [Generar]  │ │   [Generar]  │       │
│            │   └──────────────┘ └──────────────┘ └──────────────┘       │
│            │   ┌──────────────┐ ┌──────────────┐                        │
│            │   │ 💶 DV1       │ │ 🌱 Fitosanit.│                        │
│            │   │  Obligatorio │ │  Condicional │                        │
│            │   │   [Generar]  │ │   [Adjuntar] │                        │
│            │   └──────────────┘ └──────────────┘                        │
│            │                                                             │
│            │   TODOS LOS DOCUMENTOS                          [▾ filtros] │
│            │   Comerciales · Aduaneros · Transporte · Sanitarios ·      │
│            │   Peligrosas · Origen · Tránsito/Regímenes                  │
│            │   ┌──────────────┬──────────────┬──────────────┐           │
│            │   │ DUA export.  │ Cert. origen │ EUR.1        │           │
│            │   │ B/L          │ AWB          │ CMR          │           │
│            │   │ CIM          │ FBL multimod.│ DGD (ADR)    │           │
│            │   │ T1 / T2      │ Proforma     │ + A medida   │           │
│            │   └──────────────┴──────────────┴──────────────┘           │
│            │                                                             │
│            │                          [  Generar todos los obligatorios ]│
│            └─────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Buscador de tipo de documento.
- **Recomendados para esta operación:** lo que el motor seleccionó (con estado obligatorio/recomendado/condicional). Esto conecta directamente con la resolución.
- **Catálogo completo** agrupado por categoría (comerciales, aduaneros, transporte, sanitarios, peligrosas, origen, tránsito/regímenes).
- Tarjeta **"+ A medida"** → crear una definición de documento nueva (campos + plantilla) → materializa el catálogo abierto.
- CTA **"Generar todos los obligatorios"** (acción masiva).

---

## 4. Estado 2 — Edición (formulario + vista previa)

Layout a dos columnas: **formulario a la izquierda, vista previa del documento a la derecha**, sincronizados en vivo.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Volver   DUA de importación · Exp. sésamo IN→ES        ● Borrador      │
│  [ Guardar ]  [ Validar ]  [ Exportar PDF ▾ ]        Validación: ⚠ 2      │
├───────────────────────────────────┬──────────────────────────────────────┤
│  DATOS DEL DOCUMENTO              │   VISTA PREVIA                        │
│                                   │   ┌────────────────────────────────┐ │
│  ▸ Partes                         │   │  DUA — IMPORTACIÓN              │ │
│   Importador (EORI) ✓             │   │  ┌──────────────────────────┐  │ │
│   ES12345678  (del expediente)    │   │  │ Cas. 8 Destinatario      │  │ │
│   Exportador ✓                    │   │  │ ES12345678 ...           │  │ │
│   Shinei Trading…                 │   │  ├──────────────────────────┤  │ │
│                                   │   │  │ Cas. 33 Partida TARIC    │  │ │
│  ▸ Mercancía                      │   │  │ 1207.40.90               │  │ │
│   Partida TARIC ✓ 1207.40.90      │   │  ├──────────────────────────┤  │ │
│   Descripción ✓ Semillas sésamo   │   │  │ Cas. 44 Documentos       │  │ │
│   Peso bruto ⚠ (falta)            │   │  │ ⚠ pendiente              │  │ │
│   Peso neto  ⚠ (falta)            │   │  └──────────────────────────┘  │ │
│   Valor ✓ 50.000 €                │   │                                │ │
│                                   │   │   [Página 1 de 1]   🔍 100% ▾  │ │
│  ▸ Transporte                     │   └────────────────────────────────┘ │
│   Incoterm ✓ CFR                  │                                      │
│   Modo ✓ Marítimo contenedor      │   ⓘ Datos compartidos: estos campos │
│   ⚠ CFR marítimo con contenedor:  │   alimentan también el DV1 y el      │
│     sugerido usar CPT             │   packing list.                      │
│                                   │                                      │
│  ▸ Régimen y valor                │                                      │
│   Régimen ✓ Importación definit.  │                                      │
│   DV1 vinculado → [abrir]         │                                      │
└───────────────────────────────────┴──────────────────────────────────────┘
```

**Comportamiento clave:**
- **Formulario en secciones desplegables** (Partes, Mercancía, Transporte, Régimen/valor…).
- Cada campo muestra su **estado:** ✓ válido · ⚠ falta/incoherente · (del expediente) cuando viene precargado.
- **Vista previa fiel** del documento real (casillas del DUA, layout de factura…), que se actualiza al escribir.
- **Avisos de coherencia inline** del motor (ej.: *"CFR marítimo con contenedor: sugerido usar CPT"*, regla RN-05).
- **Datos compartidos:** microcopy que indica qué otros documentos se alimentan de estos campos.
- Barra superior: Guardar (borrador), Validar, Exportar PDF, contador de validación.

---

## 5. Estado 3 — Validación / errores

Al pulsar **Validar** (o antes de exportar), se listan problemas con salto al campo.

```
┌───────────────────────────────────────────────────────────┐
│  Validación del DUA                                  ⚠ 2   │
│                                                           │
│  ⚠ Campos obligatorios incompletos                        │
│     • Peso bruto (Mercancía)                  [Ir]        │
│     • Peso neto (Mercancía)                   [Ir]        │
│                                                           │
│  ⓘ Recomendación                                          │
│     • Incoterm CFR con contenedor → usar CPT  [Cambiar]   │
│                                                           │
│  No podrás exportar hasta resolver los obligatorios.      │
│                              [ Revisar ]   [ Exportar ✕ ] │
└───────────────────────────────────────────────────────────┘
```

- Dos niveles: **bloqueante** (obligatorios, RN-02) y **recomendación** (no bloquea).
- Cada problema enlaza al campo concreto.
- Exportar queda deshabilitado mientras haya bloqueantes.

---

## 6. Estado 4 — Exportación y resultado

```
┌───────────────────────────────────────────────────────────┐
│  ✓ DUA de importación generado                            │
│                                                           │
│  📄 DUA_import_sesamo_IN-ES.pdf            [Descargar]    │
│                                                           │
│  Siguiente paso recomendado:                              │
│   ☐ Factura comercial          [Generar]                 │
│   ☐ Packing list               [Generar]                 │
│   ☐ DV1                         [Generar]                 │
│                                                           │
│  [ Volver al expediente ]   [ Generar todos los doc ]    │
└───────────────────────────────────────────────────────────┘
```

- Confirmación + descarga.
- **Encadena el siguiente documento** (mantiene el flujo y los datos compartidos).
- El documento queda asociado al expediente con estado *generado*.

---

## 7. Generación masiva ("Generar todos los obligatorios")

Cuando se generan varios a la vez:
```
   Generando documentos del expediente…
   ✓ Factura comercial
   ✓ Packing list
   ◐ DUA de importación  (faltan 2 campos)   [Completar]
   ○ DV1
```
- Procesa en lote; los que tengan datos completos se generan solos.
- Los que requieran datos faltantes se marcan y permiten **completar inline** sin salir del lote.

---

## 8. Documento "a medida" (catálogo abierto)

Desde la tarjeta **"+ A medida"**:
- Definir nombre, categoría, campos (texto/número/fecha/select) y plantilla.
- Indicar de qué datos del expediente se alimenta (mapeo).
- Una vez guardado, aparece en el catálogo para futuras operaciones → **la plataforma crece sin rediseñarse** (RN-13, RF-19).

---

## 9. Componentes Figma que requiere esta pantalla

| Componente | Variantes |
|---|---|
| Tarjeta de documento (catálogo) | obligatorio / recomendado / condicional · generar / adjuntar |
| Buscador con filtros por categoría | — |
| Sección de formulario desplegable | colapsada / expandida |
| Campo de formulario | válido ✓ / falta ⚠ / incoherente ⚠ / precargado |
| Aviso de coherencia inline | recomendación / advertencia |
| Panel de vista previa de documento | DUA / factura / packing / genérico · con zoom y paginación |
| Barra de acciones del documento | guardar / validar / exportar |
| Modal de validación | bloqueante / recomendación |
| Pantalla de éxito + siguiente paso | — |
| Lista de generación en lote | pendiente / en curso / completado / requiere datos |
| Editor de documento a medida | — |
| Badge de estado del documento | borrador / generado / firmado / adjuntado |

---

## 10. Notas de interacción

- **Vista lado a lado** (formulario ↔ preview) es la firma de esta pantalla: ver el documento real reduce errores y da confianza.
- **Todo precargado**: el usuario corrige, no transcribe.
- **Coherencia del motor presente** en la edición (mismas reglas que la resolución).
- **El flujo encadena** documentos para completar un expediente sin volver atrás.
- **Estados claros** de cada documento en el expediente (borrador → generado → adjuntado/firmado).

---

## 11. Orden sugerido de maquetación en Figma

1. Estado 2 — Edición (formulario + preview): es el corazón, hazlo primero.
2. Estado 1 — Selección/catálogo (incluye "Recomendados" y "+ A medida").
3. Estado 3 — Validación.
4. Estado 4 — Éxito + siguiente paso.
5. Estado 7 — Generación masiva.
6. Estado 8 — Documento a medida.
7. Prototipar: Resolución del motor → "Generar" → Edición → Validar → Exportar → siguiente documento.

*Fin del documento.*
