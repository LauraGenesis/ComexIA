# ComexIA — Pantalla de Detalle de Expediente (diseño para Figma)

> Especificación visual y de interacción de la vista de una operación concreta.
> Wireframes en baja fidelidad listos para maquetar en Figma.
> Complementa `PANTALLA_DASHBOARD.md`, `PANTALLA_MOTOR_CASOS.md`, `PANTALLA_GENERADOR_DOCUMENTOS.md` y `ESPECIFICACION_PRODUCTO.md` (§10.6).

---

## 1. Propósito de la pantalla

Es el **espacio de trabajo de una operación**: reúne en un solo lugar todo lo de un expediente —datos, documentos, requisitos/normativa, riesgo, alertas e historial— y permite avanzarlo hasta el despacho.

Responde a: *¿en qué punto está esta operación, qué le falta y qué hago ahora?*

Es el **destino natural** al pulsar una fila del dashboard o al pulsar "Crear expediente" en una resolución del motor.

---

## 2. Estructura general

Cabecera fija + cuerpo con pestañas. La cabecera resume el estado; las pestañas organizan el detalle.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☰  ComexIA        🔍 Buscar…                          🔔3   ⬤ Laura ▾    │
├────────────┬─────────────────────────────────────────────────────────────┤
│ ▣ Dashboard│  ← Expedientes   /  Sésamo (importación) · #2206-04          │
│ ▤ Expedien.│  ┌─── Cabecera del expediente ───────────────────────────┐  │
│ ✦ Motor IA │  │ Sésamo · India 🇮🇳 → España 🇪🇸    ● En trámite        │  │
│ ▦ Documen. │  │ TARIC 1207.40.90 · CFR · Marítimo   🟥 Riesgo Alto    │  │
│ ▥ Normativa│  │ Confianza resolución 82%        [ Acciones ▾ ]         │  │
│ ⚠ Alertas  │  └────────────────────────────────────────────────────────┘ │
│ ⚙ Config.  │  ┌── Progreso ──────────────────────────────────────────┐  │
│            │  │ ●━━━●━━━◐━━━○━━━○                                      │  │
│            │  │ Creado  Docs  Trámite Despacho Cerrado                 │  │
│            │  └────────────────────────────────────────────────────────┘ │
│            │  [ Resumen ][ Documentos ][ Requisitos ][ Alertas ][ Historial ]│
│            │  ────────────────────────────────────────────────────────── │
│            │                                                             │
│            │   (contenido de la pestaña activa)                          │
│            │                                                             │
│            └─────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Cabecera del expediente (fija)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Sésamo · India 🇮🇳 → España 🇪🇸                       ● En trámite         │
│ #2206-04 · Importación definitiva                                          │
│ TARIC 1207.40.90   ·   Incoterm CFR   ·   Marítimo   ·   50.000 €         │
│ 🟥 Riesgo Alto      Confianza resolución 82%          [ Acciones ▾ ]      │
└──────────────────────────────────────────────────────────────────────────┘
```
- **Título:** producto + ruta con banderas.
- **Identidad:** nº de expediente + tipo/régimen.
- **Chips:** TARIC, incoterm, transporte, valor.
- **Estado** (badge), **riesgo** (semáforo) y **confianza** de la resolución del motor.
- **Menú "Acciones":** generar todos los documentos, recalcular resolución, duplicar, exportar expediente (PDF), cambiar estado, archivar.

---

## 4. Barra de progreso (timeline de estado)

```
   ●━━━━━●━━━━━◐━━━━━○━━━━━○
  Creado  Docs  Trámite Despacho Cerrado
```
- Refleja el ciclo de vida: Creado → Documentación → En trámite → Despachado → Cerrado.
- Estado actual resaltado; incidencias se marcan en rojo sobre el paso afectado.

---

## 5. Pestañas

`Resumen · Documentos · Requisitos · Alertas · Historial`

### 5.1 Pestaña RESUMEN (vista por defecto)

Panorámica accionable: lo esencial sin entrar en cada pestaña.

```
┌─── Resumen ─────────────────────────────────────────────────────────────┐
│ ┌─ Próximas acciones ───────────────┐ ┌─ Riesgo ──────────────────────┐ │
│ │ ☐ Adjuntar analítica aflatoxinas  │ │  ● ALTO                        │ │
│ │   · hoy                  [Hacer →]│ │  Motivo: control reforzado de  │ │
│ │ ☐ Presentar DUA          [Hacer →]│ │  origen (sésamo · India)       │ │
│ └────────────────────────────────────┘ │  [ Ver cómo reducirlo ]        │ │
│                                         └────────────────────────────────┘ │
│ ┌─ Documentos (3/6) ────────────────┐ ┌─ Alertas (2) ─────────────────┐ │
│ │ ✓ Factura  ✓ Packing  ✓ DV1       │ │ 🟥 Control reforzado vigente   │ │
│ │ ⚠ DUA (faltan 2 campos)           │ │ 🟠 Falta analítica             │ │
│ │ ☐ Fitosanitario  ☐ Cert. origen   │ │            [ Ver todas → ]     │ │
│ │            [ Ir a documentos → ]   │ └────────────────────────────────┘ │
│ └────────────────────────────────────┘                                    │
│ ┌─ Datos de la operación ───────────────────────────────────────────────┐│
│ │ Importador: ES12345678  ·  Exportador: Shinei Trading…                ││
│ │ Origen: India  ·  Destino: España  ·  Incoterm: CFR  ·  Valor: 50.000€ ││
│ │ Transporte: Marítimo contenedor          [ Editar datos ]             ││
│ └────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```
- Tarjetas resumen: **próximas acciones, riesgo, documentos (X/Y), alertas, datos de la operación**.
- Cada tarjeta enlaza a su pestaña. "Editar datos" → al modificar, **recalcula** requisitos y riesgo (RN-03).

### 5.2 Pestaña DOCUMENTOS

Estado documental completo del expediente.

```
┌─── Documentos ──────────────────────[ + Añadir ][ Generar todos ]──┐
│ Documento            Estado       Última act.   Acción              │
├────────────────────────────────────────────────────────────────────┤
│ 🧾 Factura comercial  ✓ Generado   24 jun       [Ver][PDF][↻]       │
│ 📦 Packing list       ✓ Generado   24 jun       [Ver][PDF][↻]       │
│ 💶 DV1                ✓ Generado   24 jun       [Ver][PDF][↻]       │
│ 📄 DUA importación    ⚠ Borrador   hoy          [Completar →]       │
│ 🌱 Fitosanitario      ☐ Pendiente  —            [Adjuntar]          │
│ 📜 Certificado origen ☐ Pendiente  —            [Adjuntar]          │
└────────────────────────────────────────────────────────────────────┘
```
- Lista con **estado por documento** (generado / borrador / pendiente / adjuntado / firmado).
- Acciones: ver, exportar PDF, regenerar (↻), completar, adjuntar.
- "+ Añadir" abre el **catálogo del generador**; "Generar todos" lanza la generación masiva.
- Marcadores **obligatorio/recomendado/condicional** heredados de la resolución.

### 5.3 Pestaña REQUISITOS

La resolución del motor aplicada a este expediente (requisitos + normativa).

```
┌─── Requisitos y normativa ──────────────────[ ↻ Recalcular ]──┐
│ ▸ Arancelario                                                  │
│   Derechos + IVA importación · Contingente: no aplica          │
│ ▸ Origen                                                       │
│   Prueba de origen recomendada (no preferencial)               │
│ ▸ Sanitario / Fitosanitario                                    │
│   🟥 Control reforzado: aflatoxinas / óxido de etileno         │
│   Certificado fitosanitario · Inspección en PCF               │
│ ▸ Normativa aplicable                                          │
│   • Reglamento (UE) … control reforzado   Fuente: EUR-Lex ↗    │
│   • Código Aduanero de la Unión           Fuente: AEAT ↗       │
│ ⓘ Verificar (confianza 82%)                                    │
│   • Vigencia del control reforzado · Subtipo TARIC            │
└────────────────────────────────────────────────────────────────┘
```
- Espejo de la salida del motor (§7 de `MOTOR_RESOLUCION.md`): requisitos por dimensión, normativa con fuente y bloque **Verificar** (fallback honesto).
- **Recalcular** vuelve a pasar el caso por el motor (tras cambios de datos o normativa).

### 5.4 Pestaña ALERTAS

```
┌─── Alertas del expediente ─────────────────────────────────────┐
│ 🟥 Control reforzado vigente          hoy        [Resolver →]   │
│    Adjunta analítica de aflatoxinas                            │
│ 🟠 Documentación incompleta           hoy        [Completar →]  │
│    Falta DUA y fitosanitario                                   │
│ 🟡 Cambio normativo (seguimiento)     20 jun     [Ver →]       │
└────────────────────────────────────────────────────────────────┘
```
- Alertas filtradas a este expediente, por severidad, con acción y enlace.
- Las críticas también aparecen en dashboard y centro de alertas.

### 5.5 Pestaña HISTORIAL (auditable, inmutable)

```
┌─── Historial ───────────────────────────────────────────────────┐
│ 25 jun 10:42  Laura  Generó DV1                                  │
│ 25 jun 10:30  IA     Recalculó riesgo → Alto (control reforzado) │
│ 24 jun 18:05  Laura  Editó valor: 48.000 € → 50.000 €           │
│ 24 jun 17:50  Laura  Generó factura y packing list              │
│ 24 jun 17:30  IA     Resolución inicial (confianza 82%)         │
│ 24 jun 17:28  Laura  Creó expediente desde el Motor de casos    │
└──────────────────────────────────────────────────────────────────┘
```
- Registro cronológico **inmutable** (RN-10): quién, qué y cuándo (usuario o IA).
- Trazabilidad de decisiones del motor y de los cambios del usuario.

---

## 6. Estados de la pantalla

- **Normal:** expediente con datos y documentos en curso.
- **Recién creado (desde el motor):** Resumen con próximas acciones destacadas y documentos aún por generar.
- **Con incidencia:** banda superior de aviso + paso de progreso en rojo + acción de resolución.
- **Despachado / cerrado:** cabecera en estado final, acciones reducidas (consultar/exportar), historial completo.
- **Carga:** skeletons en cabecera y pestaña activa.

---

## 7. Acciones globales del expediente (menú "Acciones")

| Acción | Efecto |
|---|---|
| Generar todos los documentos | Lanza generación masiva (genera los completos, marca los que faltan) |
| Recalcular resolución | Re-pasa el caso por el motor (RN-03) |
| Editar datos de la operación | Abre datos; al guardar, recalcula |
| Duplicar expediente | Crea uno nuevo con los mismos datos (operaciones recurrentes) |
| Exportar expediente (PDF) | Dossier con datos, documentos y resolución |
| Cambiar estado / archivar | Avanza el ciclo de vida o archiva |

---

## 8. Responsive

- **Escritorio (prioritario):** cabecera + pestañas; Resumen en grid de tarjetas.
- **Tablet:** tarjetas del Resumen en una columna; pestañas con scroll horizontal.
- **Móvil (secundario):** cabecera compacta; pestañas como selector desplegable; tablas de documentos/alertas como listas de tarjetas.

---

## 9. Componentes Figma que requiere esta pantalla

| Componente | Variantes |
|---|---|
| Cabecera de expediente | por estado y por riesgo · con menú Acciones |
| Chips de operación | TARIC / incoterm / transporte / valor |
| Barra de progreso (timeline de estado) | paso pendiente/actual/completado/incidencia |
| Navegación por pestañas | activa / inactiva |
| Tarjeta de resumen | próximas acciones / riesgo / documentos / alertas / datos |
| Tabla de documentos | por estado del documento |
| Fila de documento | generado / borrador / pendiente / adjuntado / firmado |
| Bloque de requisitos (acordeón) | por dimensión + bloque "verificar" |
| Ítem de normativa con fuente | con enlace ↗ |
| Lista de alertas | crítica / advertencia / info |
| Lista de historial | entrada de usuario / de IA |
| Menú de acciones | desplegable |
| Banda de incidencia | aviso superior |
| Skeletons de carga | cabecera / pestaña |

---

## 10. Notas de interacción

- **Cabecera siempre visible** (sticky): estado, riesgo y acciones a mano en cualquier pestaña.
- **Resumen como puerta:** cada tarjeta enlaza a su pestaña; el usuario decide desde una sola vista.
- **Coherencia con el motor:** Requisitos y Verificar replican exactamente la resolución; recalcular re-ejecuta el motor.
- **Editar datos → recalcula** requisitos y riesgo automáticamente (RN-03), avisando del cambio.
- **Historial inmutable** y atribuido (usuario vs. IA) → auditabilidad y confianza.
- **Continuidad:** desde aquí se generan documentos, se resuelven alertas y se avanza el estado sin salir del expediente.

---

## 11. Orden sugerido de maquetación en Figma

1. Cabecera + barra de progreso + pestañas (el marco).
2. Pestaña Resumen (la más usada).
3. Pestaña Documentos.
4. Pestaña Requisitos.
5. Pestañas Alertas e Historial.
6. Estados (incidencia, cerrado, carga) y responsive.
7. Prototipar: Dashboard (fila) → Detalle (Resumen) → Documentos → Generador · y · Motor de casos → "Crear expediente" → Detalle.

*Fin del documento.*
