# ComexIA

Plataforma de logística internacional y comercio exterior potenciada por IA.
Resuelve operaciones aduaneras (importación, exportación, tránsito) y genera la
documentación necesaria — incluso para casos nuevos sin plantilla previa.

🔗 **Demo en vivo:** _(pendiente de desplegar)_

> La demo corre en **modo demo** (`DEMO_MODE=1`): sin base de datos, con datos de
> ejemplo precargados en memoria. Se puede navegar toda la app y probar el motor;
> los expedientes que crees no persisten entre recargas. Ver [Modo demo](#modo-demo-sin-base-de-datos).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + componentes propios (estilo shadcn) + `lucide-react`
- **Prisma 6** + **SQLite** (persistencia y base de conocimiento del motor)
- **zod** (esquemas del motor)

## Arranque

```bash
npm install
npx prisma generate        # genera el cliente Prisma
npm run db:push            # crea la base de datos local (prisma/dev.db)
npm run db:seed            # carga datos de ejemplo
npm run dev                # http://localhost:3000
```

Otros comandos:

```bash
npm run build              # build de producción
npm run lint               # eslint
npx tsc --noEmit           # typecheck
npm run db:seed            # recarga datos de ejemplo (idempotente)
```

## Persistencia

Los datos viven en **SQLite** (`prisma/dev.db`) vía Prisma. La capa de acceso
está en `src/lib/repo.ts` (marcada `server-only`):

- Dashboard, lista y detalle de expedientes, y alertas **leen de la base**
  (páginas dinámicas, `force-dynamic`).
- El botón **«Crear expediente»** del motor llama a `POST /api/expedientes`,
  que persiste el expediente con sus documentos, alertas y eventos derivados de
  la resolución, y redirige a su detalle.
- La pestaña **Historial** del expediente muestra los eventos reales (usuario / IA),
  registro inmutable de auditoría (modelo `Evento`).

`src/lib/data.ts` ya solo se usa como fuente del seed (`prisma/seed.ts`).

## Generador de documentos

Catálogo abierto en `src/lib/documentos/`. El **DUA** está implementado de punta
a punta; el resto del catálogo aparece como «próximamente».

- **Catálogo:** `/app/documentos` (agrupado por categoría).
- **Generador de DUA:** `/app/documentos/dua` — formulario por casillas
  (cas. 1, 2, 8, 14, 31, 33, 35, 38, 44, 54…) con **vista previa en vivo** del
  DUA y **validación** (campos obligatorios + coherencia incoterm/contenedor,
  RN-05). Definición y reglas en `src/lib/documentos/dua.ts`.
- **Precarga:** `/app/documentos/dua?expediente=<id>` rellena descripción,
  TARIC, países, incoterm, valor y documentos a partir del expediente.
- **Exportar PDF:** botón «Exportar PDF» → impresión del navegador (CSS de
  impresión deja solo el DUA).
- **Guardar en expediente:** `POST /api/expedientes/[id]/documentos` marca el
  documento como `generado`, guarda sus datos (JSON) y registra un evento.

Desde el detalle de un expediente, la pestaña **Documentos** enlaza el DUA
directamente al generador con los datos precargados.

**Ejemplo real:** el seed asocia el DUA completo del CASO 45 (Lámparas de mesa,
docs/) al expediente `exp-2210-15`. En su pestaña Documentos, «Editar» abre el
DUA con **todas las casillas rellenas** (Lan Yao, 9405 29 90, DPU…), listo para
ver y exportar a PDF. Si un expediente ya tiene un DUA guardado, el generador lo
carga tal cual en lugar de derivarlo del expediente.

## Estructura

```
src/
  app/
    page.tsx               # Landing (marketing)
    servicios, roles, pricing/   # Páginas públicas
    (app)/                 # Aplicación privada (sidebar + topbar)
      app/                 # Dashboard
      app/motor/           # Motor de resolución de casos (núcleo)
      app/expedientes/     # Lista y detalle de expedientes
      app/documentos|normativa|alertas|configuracion/
    api/motor/resolver/    # Endpoint del motor
  components/
    ui/                    # Primitivas (button, card)
    app/                   # Shell (sidebar, topbar, tabs, placeholder)
    marketing/             # Header y footer públicos
    badges.tsx             # Badges de estado, riesgo, confianza
  lib/
    motor/                 # Motor de resolución (schema zod, mock, índice)
    types.ts               # Tipos de dominio
    data.ts                # Datos simulados (mientras no hay DB conectada)
    utils.ts               # Utilidades (cn, formatEUR, flag)
prisma/schema.prisma       # Modelo de datos (Expediente, Documento, Alerta, Evento)
docs/                      # Especificación de producto y de pantallas
```

## El motor de resolución

El núcleo está en `src/lib/motor/`. `resolverCaso()` (en `index.ts`) resuelve en
tres pasos, priorizando lo gratuito:

1. **Base de conocimiento** (`reglas.ts`) → fuente **principal**, gratis. Consulta
   las `Regla` activas en SQLite, busca la de mayor prioridad cuyos criterios
   (producto, TARIC, origen, destino, tipo) coinciden con el caso y devuelve su
   resolución. Badge **«Base de conocimiento»**.
2. **Claude (opcional)** (`claude.ts`) → solo si el caso **no** está cubierto por
   reglas **y** hay `ANTHROPIC_API_KEY`. Usa el modelo más barato (**Haiku 4.5**),
   así que el gasto es de céntimos porque casi nunca se invoca. Badge **«Claude (Haiku)»**.
3. **Fallback** (`mock.ts`) → si no hay regla ni clave, una resolución genérica
   honesta con confianza baja. Badge **«Genérico»**.

El contrato de salida (`Resolucion`, definido en `schema.ts` con zod) es el mismo
en los tres casos, así que el resto de la app no cambia. Sin `ANTHROPIC_API_KEY`,
el paso 2 se omite y todo funciona gratis.

### Ampliar el conocimiento (sin tocar código)

Para enseñarle más comercio exterior a la plataforma, añade **reglas** a la base:

- **Visual:** `npx prisma studio` → tabla `Regla` (y sus `ReglaDocumento`,
  `ReglaNorma`, `ReglaRiesgo`, `ReglaAlerta`, `ReglaPaso`).
- **Por seed:** añade un objeto al array `REGLAS` de `src/lib/motor/reglas-seed.ts`
  y ejecuta `npm run db:seed`. Los casos que trae el seed sirven de plantilla.
  (Ese mismo array alimenta el motor en [modo demo](#modo-demo-sin-base-de-datos).)

Una `Regla` define unos criterios de coincidencia (todos opcionales; basta uno)
y la resolución resultante. Los criterios solo descartan la regla si el caso
aporta un valor que los contradice; si falta el dato, no bloquean.

## Modo demo (sin base de datos)

Para el despliegue público (p. ej. **Vercel**, serverless y sin disco
persistente) la app puede arrancar sin Prisma/SQLite con la variable de entorno:

```bash
DEMO_MODE=1
```

En este modo la capa de datos (`src/lib/repo.ts`) y el motor de reglas
(`src/lib/motor/reglas.ts`) leen de **datos en memoria** sembrados desde
`src/lib/data.ts` y `src/lib/motor/reglas-seed.ts`. El cliente Prisma no se carga
nunca (import dinámico en `repo.ts`). Consecuencias:

- Se navega toda la app con datos de ejemplo y el motor de reglas funciona igual.
- Los expedientes y documentos que crees viven en memoria y **no persisten**
  entre invocaciones (cada arranque vuelve al estado semilla).
- Sin `ANTHROPIC_API_KEY`, los casos sin regla usan el fallback genérico (gratis).

Sin la variable, en local todo funciona contra SQLite con persistencia real.

### Desplegar en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com) (framework Next.js,
   detección automática).
2. Define las variables de entorno del proyecto:
   - `DEMO_MODE` = `1`
   - `DATABASE_URL` = `file:./dev.db` (valor de relleno; no se usa en demo, pero
     el esquema Prisma lo exige para `prisma generate` en el build).
3. Deploy. El `postinstall` (`prisma generate`) prepara el cliente en el build.

## Documentación

La especificación completa está en `docs/`:

- `ESPECIFICACION_PRODUCTO.md` — producto, funcionalidades, requisitos.
- `MOTOR_RESOLUCION.md` — arquitectura del motor.
- `PANTALLA_*.md` — diseño de cada pantalla.
