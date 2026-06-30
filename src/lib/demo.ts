/*
 * Modo demo (sin base de datos).
 *
 * Cuando DEMO_MODE === "1" la app no usa Prisma/SQLite: la capa de datos
 * (repo.ts) y el motor de reglas (motor/reglas.ts) leen de datos en memoria
 * sembrados desde src/lib/data.ts y src/lib/motor/reglas-seed.ts.
 *
 * Pensado para el despliegue de demostración en Vercel (serverless, sin disco
 * persistente). Los expedientes que se creen viven en memoria y no persisten
 * entre invocaciones. En local, sin la variable, todo funciona contra SQLite.
 */
export const DEMO_MODE = process.env.DEMO_MODE === "1";
