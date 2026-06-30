# ComexIA — Pantalla del Dashboard (diseño para Figma)

> Especificación visual y de interacción de la pantalla de inicio tras login.
> Wireframes en baja fidelidad listos para maquetar en Figma.
> Complementa `MOTOR_RESOLUCION.md`, `PANTALLA_MOTOR_CASOS.md`, `PANTALLA_GENERADOR_DOCUMENTOS.md` y `ESPECIFICACION_PRODUCTO.md` (§5.E, §10.6).

---

## 1. Propósito de la pantalla

Es el **centro de control**: lo primero que ve el usuario tras iniciar sesión. Responde de un vistazo a tres preguntas:
1. **¿Qué tengo entre manos?** → expedientes activos y su estado.
2. **¿Qué necesita mi atención ahora?** → alertas, documentos pendientes, riesgo.
3. **¿Qué hago a continuación?** → próximas acciones + accesos rápidos.

No es un panel pasivo de métricas: es **accionable**. Cada elemento lleva a una tarea concreta (resolver, generar, revisar).

---

## 2. Layout general

Estructura de tres zonas: barra superior, navegación lateral y área de trabajo.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☰  ComexIA        🔍 Buscar expedientes, productos, normativa…  🔔3 ⬤▾  │  ← barra superior
├────────────┬─────────────────────────────────────────────────────────────┤
│ ▣ Dashboard│   Hola, Laura 👋                          [ + Nueva operación ]│
│ ▤ Expedien.│   Resumen de tus operaciones · hoy 25 jun 2026               │
│ ✦ Motor IA │                                                             │
│ ▦ Documen. │   ┌─── KPIs ──────────────────────────────────────────────┐ │
│ ▥ Normativa│   │ [12]        [5]          [3]            [Medio]        │ │
│ ⚠ Alertas  │   │ Expedientes  Documentos   Alertas        Riesgo       │ │
│ ⚙ Config.  │   │ activos      pendientes   críticas       medio        │ │
│            │   └────────────────────────────────────────────────────────┘ │
│            │                                                             │
│            │   ┌─── Expedientes activos ───────────┐ ┌─ Alertas ──────┐ │
│            │   │ (tabla)                            │ │ (lista)        │ │
│            │   │                                    │ │                │ │
│            │   │                                    │ ├────────────────┤ │
│            │   │                                    │ │ Próximas       │ │
│            │   │                                    │ │ acciones       │ │
│            │   └────────────────────────────────────┘ └────────────────┘ │
│            │                                                             │
│            │   ┌─── Accesos rápidos ──────────────────────────────────┐ │
│            │   │ [✦ Preguntar a la IA] [▦ Generar doc] [▥ Normativa]  │ │
│            │   └────────────────────────────────────────────────────────┘ │
│            └─────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Barra superior

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ☰  ComexIA    🔍 Buscar expedientes, productos, normativa…    🔔 3  ⬤ ▾  │
└──────────────────────────────────────────────────────────────────────────┘
```
- **Logo + toggle del menú** (☰).
- **Buscador global:** expedientes, productos, partidas TARIC y normativa en un mismo campo.
- **Centro de notificaciones** (🔔 con badge de no leídas) → abre panel desplegable de alertas.
- **Menú de usuario** (avatar): cuenta, plan/facturación, ajustes, cerrar sesión.

---

## 4. Navegación lateral

Items: **Dashboard · Expedientes · Motor IA · Documentos · Normativa · Alertas · Configuración**.
- Item activo resaltado (Dashboard).
- Colapsable a solo iconos (más espacio de trabajo).
- Badge en "Alertas" con nº de críticas.

---

## 5. Saludo + acción principal

```
   Hola, Laura 👋                                  [ + Nueva operación ]
   Resumen de tus operaciones · hoy 25 jun 2026
```
- Saludo personalizado + fecha.
- **CTA primario "+ Nueva operación"** siempre visible (lleva al Motor de casos, Estado 1).

---

## 6. Tarjetas KPI (resumen accionable)

Cuatro métricas que importan, **cada una clicable** hacia su vista filtrada.

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  12          │  5           │  3           │  ● Medio     │
│  Expedientes │  Documentos  │  Alertas     │  Riesgo      │
│  activos     │  pendientes  │  críticas    │  medio       │
│  ▲ +2 sem.   │  ⚠ revisar   │  🟥 atender  │  cartera     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

| KPI | Significado | Al hacer clic |
|---|---|---|
| Expedientes activos | Operaciones en curso | → Expedientes (filtro: activos) |
| Documentos pendientes | Docs por generar/completar | → Documentos pendientes |
| Alertas críticas | Requieren acción inmediata | → Alertas (filtro: críticas) |
| Riesgo (cartera) | Nivel agregado bajo/medio/alto | → Expedientes ordenados por riesgo |

- El KPI de riesgo usa color (verde/ámbar/rojo) coherente con el resto del producto.
- Microtexto de tendencia opcional (▲ +2 esta semana).

---

## 7. Tabla de expedientes activos (bloque principal)

El elemento central. Cada fila es una operación con todo lo accionable a la vista.

```
┌─── Expedientes activos ──────────────────────────────[ Ver todos → ]──┐
│ Filtros: [Tipo ▾] [Estado ▾] [Riesgo ▾]          🔍 buscar…           │
├──────────────────────────────────────────────────────────────────────┤
│ Operación            Ruta        Estado        Riesgo   Próxima acción │
├──────────────────────────────────────────────────────────────────────┤
│ Sésamo (import.)     IN→ES 🇮🇳🇪🇸  ● En trámite  🟥 Alto  Adjuntar       │
│ #2206-04                                                analítica  [→] │
├──────────────────────────────────────────────────────────────────────┤
│ Calzado (export.)    ES→JP 🇪🇸🇯🇵  ● Borrador    🟢 Bajo  Generar DUA[→]│
│ #2204-02                                                               │
├──────────────────────────────────────────────────────────────────────┤
│ Lámparas (import.)   CN→ES 🇨🇳🇪🇸  ● Despachado  🟡 Medio Cerrar    [→] │
│ #2210-15                                                expediente      │
├──────────────────────────────────────────────────────────────────────┤
│ Repuestos (tránsito) DE→PT 🇩🇪🇵🇹  ⚠ Incidencia  🟥 Alto  Revisar    [→]│
│ #2211-07                                                T1              │
└──────────────────────────────────────────────────────────────────────┘
```

**Columnas:**
- **Operación** (nombre + nº de expediente + tipo: import./export./tránsito).
- **Ruta** (origen→destino con banderas).
- **Estado** (badge: Borrador · En trámite · Despachado · Incidencia · Cerrado).
- **Riesgo** (semáforo bajo/medio/alto).
- **Próxima acción** (la siguiente tarea concreta + botón ir [→]).

**Interacciones:**
- Fila clicable → **detalle del expediente**.
- Filtros (tipo, estado, riesgo) + buscador local.
- Orden por columna (riesgo y estado por defecto destacan lo urgente arriba).
- "Ver todos →" lleva a la página completa de Expedientes.
- Ejemplos de tipos variados (import., export., tránsito) → refuerza la **generalidad** de la plataforma.

---

## 8. Panel de alertas (columna derecha, arriba)

```
┌─── Alertas ──────────────────[ Ver todas → ]──┐
│ 🟥 Control reforzado vigente                   │
│    Sésamo IN→ES · Exp. #2206-04                │
│    Adjunta analítica de aflatoxinas    [Ver →] │
├────────────────────────────────────────────────┤
│ 🟠 Documentación incompleta                     │
│    Calzado ES→JP · Exp. #2204-02               │
│    Falta DUA de exportación            [Ver →] │
├────────────────────────────────────────────────┤
│ 🟡 Cambio normativo                             │
│    Afecta a importaciones desde China  [Ver →] │
└────────────────────────────────────────────────┘
```
- Lista priorizada por severidad (crítica 🟥 / advertencia 🟠 / info 🟡).
- Cada alerta: mensaje + expediente afectado + **acción recomendada** + enlace.
- "Ver todas →" → Centro de alertas.

---

## 9. Panel de próximas acciones (columna derecha, abajo)

```
┌─── Próximas acciones ────────────────────────┐
│ ☐ Adjuntar analítica  · Sésamo      · hoy    │
│ ☐ Generar DUA export. · Calzado     · 2 días │
│ ☐ Revisar incidencia T1 · Repuestos · hoy    │
│ ☐ Cerrar expediente   · Lámparas    · —      │
└──────────────────────────────────────────────┘
```
- Lista de tareas derivadas de los expedientes (las "próximas acciones" del motor).
- Cada una con expediente y plazo; marcar como hecha o ir a la tarea.
- Ordenadas por urgencia (vencimiento).

---

## 10. Accesos rápidos (banda inferior)

```
┌─── Accesos rápidos ──────────────────────────────────────────┐
│ [ ✦ Preguntar a la IA ]  [ ▦ Generar documento ]             │
│ [ ▥ Buscar normativa  ]  [ + Nueva operación ]               │
└──────────────────────────────────────────────────────────────┘
```
Atajos a las acciones más frecuentes, redundando con el CTA principal para descubribilidad.

---

## 11. Estados de la pantalla

- **Vacío (onboarding / primer uso):** sin expedientes → hero interno con "Resuelve tu primera operación" + CTA al Motor de casos + ejemplos rápidos. Las KPIs muestran 0 y un mensaje motivador en lugar de tablas vacías.
- **Carga:** skeletons en KPIs, tabla y paneles.
- **Con datos:** el layout completo descrito.
- **Sin alertas:** panel de alertas en estado positivo ("Todo en orden ✓").
- **Error de carga:** mensaje con reintento, sin romper el layout.

```
   ── Estado vacío ──
   ┌──────────────────────────────────────────────┐
   │           ✦                                   │
   │   Aún no tienes operaciones                    │
   │   Describe tu primera importación o            │
   │   exportación y ComexIA hará el resto.         │
   │            [ + Nueva operación ]               │
   │   Ejemplos: [Importar...] [Exportar...] [T1]   │
   └──────────────────────────────────────────────┘
```

---

## 12. Responsive

- **Escritorio (prioritario):** tres zonas, tabla + columna derecha (alertas/acciones).
- **Tablet:** la columna derecha pasa debajo de la tabla; KPIs en 2×2.
- **Móvil (secundario):** navegación en menú hamburguesa; KPIs apiladas; tabla como lista de tarjetas (una por expediente); alertas y acciones en secciones colapsables.

---

## 13. Componentes Figma que requiere esta pantalla

| Componente | Variantes |
|---|---|
| Barra superior | con/sin notificaciones |
| Buscador global | default / con foco / con resultados |
| Navegación lateral | expandida / colapsada · item activo/inactivo · con badge |
| Botón CTA "Nueva operación" | primario |
| Tarjeta KPI | normal / con tendencia / de riesgo (verde/ámbar/rojo) |
| Tabla de expedientes | con filtros / orden / paginación |
| Fila de expediente | por estado y por riesgo |
| Badge de estado | borrador / en trámite / despachado / incidencia / cerrado |
| Badge de riesgo | bajo / medio / alto |
| Panel de alertas | crítica / advertencia / info / vacío "todo en orden" |
| Panel de próximas acciones | pendiente / vencida / hecha |
| Banda de accesos rápidos | — |
| Estado vacío | onboarding |
| Skeletons de carga | KPIs / tabla / paneles |
| Dropdown de notificaciones | — |
| Menú de usuario | — |

---

## 14. Notas de interacción

- **Todo es accionable:** cada KPI, alerta y fila lleva a una tarea, no solo informa.
- **Lo urgente arriba:** orden por riesgo/estado y alertas críticas primero.
- **Coherencia cromática:** los colores de riesgo y severidad son los mismos en todo el producto.
- **El CTA "Nueva operación"** es el camino al núcleo (Motor de casos) y está siempre presente.
- **Continuidad del flujo:** desde el dashboard se entra a resolver, generar o revisar sin fricción.

---

## 15. Orden sugerido de maquetación en Figma

1. Layout general (barra + sidebar + grid del área de trabajo).
2. Tarjetas KPI.
3. Tabla de expedientes activos (con badges de estado y riesgo).
4. Panel de alertas + próximas acciones.
5. Accesos rápidos.
6. Estado vacío (onboarding) y skeletons de carga.
7. Variantes responsive (tablet/móvil).
8. Prototipar: Dashboard → "Nueva operación" → Motor de casos · y · fila de expediente → Detalle de expediente.

*Fin del documento.*
