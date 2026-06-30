# ComexIA — Especificación de Producto y Diseño

> Plataforma digital de logística internacional y comercio exterior potenciada por IA.
> Documento maestro para diseño en Figma (maqueta / prototipo).
> Versión 1.0 — Junio 2026.

---

## 1. Descripción general del producto

**ComexIA** es una plataforma SaaS que centraliza, automatiza y asiste con inteligencia artificial toda la gestión de **importaciones y exportaciones**: documentación, normativa, trámites aduaneros (DUA), requisitos sanitarios y fitosanitarios, mercancías peligrosas, controles fronterizos y alertas de riesgo.

En lugar de que el profesional consulte manualmente múltiples fuentes (TARIC, AEAT, normativa UE, requisitos sanitarios, navieras), ComexIA reúne todo en un único espacio de trabajo donde:

- Un **asistente IA** responde consultas operativas de comercio exterior en lenguaje natural.
- Un **generador documental** prepara DUA, packing list, factura comercial, certificados de origen y documentos sanitarios/peligrosos.
- Un **motor de normativa** busca requisitos por país, producto y código TARIC/HS.
- Un **sistema de alertas** avisa de riesgos de inspección, documentación incompleta y cambios normativos.
- Un **panel de control** muestra expedientes, estados, documentos pendientes y próximas acciones.

**En una frase:** *El copiloto de comercio exterior que convierte la complejidad aduanera en pasos claros.*

---

## 1.bis Principio de diseño: plataforma generalista y extensible

> **ComexIA no es un catálogo de casos resueltos: es un motor que resuelve casos nuevos.**

Los casos documentados (incoterms, DUA de importación/exportación, B/L, certificados de origen, SOIVRE, fitosanitarios, DV1, operaciones con territorios especiales como Canarias/Ceuta/Melilla, etc.) son **material de entrenamiento y validación**, no el límite del producto. La plataforma debe diseñarse para resolver **cualquier operación que pueda venir en el futuro**, aunque no exista una plantilla previa.

**Implicaciones de diseño (no negociables):**

- **Razonamiento, no plantillas fijas.** El sistema parte de los datos de la operación (producto, partida arancelaria, origen/destino, régimen, incoterm, transporte) y **deriva** los requisitos y documentos aplicables, en lugar de elegir de una lista cerrada.
- **Cobertura abierta de productos y rutas.** Cualquier HS/TARIC, cualquier par origen-destino, cualquier tipo de mercancía (general, perecedera, peligrosa, control dual, sanitaria, fitosanitaria, animal/vegetal, etc.).
- **Cobertura abierta de regímenes aduaneros.** Importación y exportación definitivas, tránsito, depósito aduanero, perfeccionamiento activo/pasivo, importación temporal, reimportación, territorios especiales y zonas francas.
- **Catálogo documental ampliable.** Nuevos tipos de documento se incorporan como definiciones de datos/plantilla, sin rediseñar el producto.
- **Normativa actualizable en caliente.** Los cambios regulatorios se cargan como datos versionados; no requieren reescribir la lógica.
- **Fallback honesto.** Si la IA no tiene certeza sobre un caso nuevo, lo indica, marca el nivel de confianza y señala qué verificar y dónde — nunca inventa un requisito como si fuera seguro.
- **Aprendizaje continuo.** Cada operación resuelta (y corregida por el usuario) realimenta la base de conocimiento para mejorar casos futuros.

Esta sección es el **eje rector**: todas las funcionalidades, reglas y requisitos siguientes deben leerse bajo este principio de generalidad.

---

## 2. Problema que resuelve

El comercio exterior es complejo, fragmentado y propenso a errores costosos:

| Problema actual | Coste para el usuario |
|---|---|
| Normativa dispersa y cambiante (UE, nacional, país de destino) | Horas de búsqueda por operación |
| Documentación manual (DUA, certificados) propensa a errores | Multas, retenciones, despachos rechazados |
| Falta de visibilidad del riesgo de inspección | Sobrecostes y retrasos imprevistos |
| Requisitos sanitarios/fitosanitarios difíciles de identificar | Mercancía bloqueada en frontera |
| Información repartida en personas y correos | Dependencia de expertos, errores por traspaso |
| Mercancías peligrosas y controles reforzados | Riesgo legal y de seguridad |

**ComexIA** ataca estos puntos reduciendo errores, ahorrando tiempo y dando previsibilidad.

---

## 3. Objetivo del usuario

El usuario quiere **completar una operación de importación o exportación sin errores, en el menor tiempo posible y sabiendo de antemano los riesgos**. En concreto:

- Saber **qué documentos y permisos** necesita para un producto y ruta concretos.
- Generar esa documentación **correcta a la primera**.
- Conocer la **normativa aplicable** sin leer textos legales completos.
- Anticipar **inspecciones, controles y restricciones**.
- Tener **una visión única** del estado de todas sus operaciones.

---

## 4. Público objetivo

| Perfil | Necesidad principal |
|---|---|
| Importadores | Saber requisitos y costes antes de comprar |
| Exportadores | Documentar y despachar sin retenciones |
| Transitarios | Gestionar muchos expedientes a la vez |
| Agentes de aduanas | Generar DUA correctos y rápido |
| Operadores logísticos | Coordinar documentación y plazos |
| Empresas de transporte internacional | Cumplir controles y tránsitos |
| Consultores de comercio exterior | Consultar normativa al instante |
| Responsables de supply chain | Visibilidad y previsión de riesgos |
| Departamentos de compras internacionales | Estimar requisitos y costes de aprovisionamiento |
| Departamentos de logística y operaciones | Seguimiento y alertas centralizadas |

**Mercado primario inicial:** profesionales que operan con aduana española / UE (DUA, EORI, TARIC, SOIVRE, fitosanitario).

---

## 5. Funcionalidades principales

### A. Asistente IA de comercio exterior
Chatbot conversacional especializado. El usuario pregunta en lenguaje natural y la IA responde estructurado.

**Ejemplo de consulta:**
> "Quiero importar semillas de sésamo desde India a España. ¿Qué documentación necesito?"

**Estructura de respuesta de la IA:**
1. **Documentación obligatoria** (factura comercial, packing list, DUA importación, certificado fitosanitario, etc.)
2. **Normativa aplicable** (Reglamentos UE, control de aflatoxinas/óxido de etileno en sésamo de India, etc.)
3. **Riesgos de inspección** (probabilidad de control físico/documental)
4. **Requisitos sanitarios o fitosanitarios** (control reforzado SANCO/SOIVRE)
5. **Posibles alertas** (controles reforzados vigentes, restricciones)
6. **Pasos recomendados** (checklist accionable)

**Capacidades clave:**
- Cita la fuente normativa (trazabilidad de cada afirmación).
- Permite continuar la conversación ("¿y si el origen fuera Turquía?").
- Botón "Crear expediente con esta operación" → convierte la consulta en un caso real.
- Sugerencias de consultas frecuentes.

### B. Generador de documentación
Asistente que prepara documentos a partir de los datos de la operación. El catálogo es **abierto y ampliable** — cada documento es una *definición* (campos + reglas + plantilla), de modo que añadir uno nuevo no exige rediseñar la plataforma.

**Documentos cubiertos de salida (no exhaustivo, ampliable):**
- **DUA** de importación y exportación (modelos UE)
- **Packing list** y **factura comercial / proforma**
- **Certificados de origen** (incl. EUR.1, Form A según aplique)
- **Documentos sanitarios y fitosanitarios** (CSE/SOIVRE, fitosanitario)
- **Declaración de mercancías peligrosas (DGD)** y documentación ADR/IMDG/IATA
- **DV1** (declaración de valor en aduana)
- **Documentos de transporte:** B/L (master/house), AWB, CMR, carta de porte CIM, FBL multimodal
- **Documentos de tránsito y regímenes especiales** (T1/T2, depósito, perfeccionamiento)
- *(El catálogo crece según la casuística futura sin cambiar el producto.)*

**Comportamiento:**
- **Selección automática de documentos:** el generador propone qué documentos hacen falta para *esa* operación a partir del análisis del caso (no de una lista fija).
- Formulario guiado con autocompletado desde el expediente (EORI, incoterm, partida TARIC, pesos, contenedor…).
- Validación en tiempo real (campos incompletos, incoherencias, incoterm vs. transporte).
- Reutiliza datos entre documentos (la factura alimenta el DUA, el packing list, el DV1…).
- Exportación a PDF y vista previa.
- Plantillas reutilizables por cliente/ruta frecuente.
- **Documentos a medida:** si surge un documento no contemplado, el usuario/operador puede definir su plantilla y campos, quedando disponible para futuras operaciones.

### C. Motor de normativa y requisitos
Buscador de normativa y requisitos filtrable por:

- País de origen
- País de destino
- Tipo de producto
- Código TARIC / HS Code
- Tipo de mercancía (general, peligrosa, perecedera…)
- Riesgo sanitario, fitosanitario o aduanero

**Salida:** ficha de requisitos con aranceles, contingentes, certificados exigidos, controles, normativa citada y enlaces a fuente.

### D. Sistema de alertas
Notifica proactivamente sobre:

- Controles reforzados
- Riesgo de inspección física
- Documentación incompleta
- Cambios normativos
- Posibles restricciones
- Mercancías peligrosas
- Productos sujetos a control sanitario

**Canales:** centro de notificaciones in-app, badge en dashboard, email opcional. Cada alerta indica severidad (info / advertencia / crítica) y acción recomendada.

### E. Panel de control (Dashboard)
Vista de inicio tras login:

- Expedientes activos
- Estado de cada operación (borrador, en trámite, despachado, incidencia)
- Documentos pendientes
- Alertas importantes
- Riesgo estimado por operación
- Próximas acciones
- Historial de operaciones

### F. Motor de resolución de casos aduaneros (núcleo del producto)
Es el cerebro que permite resolver **operaciones nuevas** sin plantilla previa. Recibe la descripción de un caso (en lenguaje natural o por formulario) y produce una **resolución estructurada y accionable**.

**Entrada:** producto, partida HS/TARIC (o ayuda a clasificarla), país origen/destino, régimen aduanero, incoterm, modo de transporte, naturaleza de la mercancía, valor, etc. — los campos que falten se piden o se infieren.

**Proceso (conceptual):**
1. **Clasifica** la operación (tipo, régimen, naturaleza de la mercancía).
2. **Deriva requisitos** aplicables (aranceles, contingentes, certificados, controles, restricciones) razonando sobre normativa, no eligiendo de una lista cerrada.
3. **Determina la documentación** necesaria y la encadena con el generador (§B).
4. **Estima el riesgo** de inspección y posibles incidencias.
5. **Produce un plan de acción** paso a paso.
6. **Cita fuentes** y **declara su nivel de confianza**; si el caso es atípico, lo marca y dice qué verificar.

**Resultado:** una resolución reutilizable que se convierte en expediente, alimenta documentos y queda en el historial para mejorar casos futuros. Cubre tanto los casos conocidos como **los que aún no han ocurrido**.

### G. Casos de uso por perfil
Sección que muestra ejemplos concretos de uso para: aduanero, transitario, importador, exportador, operador logístico, responsable de compras y responsable de supply chain (ver §7).

---

## 6. User stories

**Asistente IA**
- Como **importador**, quiero preguntar qué necesito para traer un producto, para no buscar normativa por mi cuenta.
- Como **consultor**, quiero que cada respuesta cite su fuente, para poder verificarla ante mi cliente.
- Como **transitario**, quiero convertir una consulta en expediente, para no reintroducir datos.

**Generador documental**
- Como **agente de aduanas**, quiero generar un DUA con validación automática, para evitar rechazos.
- Como **exportador**, quiero que la factura alimente el packing list y el DUA, para no duplicar datos.
- Como **operador logístico**, quiero plantillas por ruta frecuente, para ir más rápido.

**Motor de normativa**
- Como **comprador internacional**, quiero buscar requisitos por TARIC y país, para estimar costes antes de comprar.
- Como **responsable de supply chain**, quiero ver aranceles y contingentes, para decidir proveedor.

**Alertas**
- Como **transitario**, quiero avisos de controles reforzados, para anticipar inspecciones.
- Como **importador**, quiero saber si me falta documentación antes del despacho, para evitar retenciones.

**Dashboard**
- Como **responsable de operaciones**, quiero ver todos los expedientes y su riesgo, para priorizar.
- Como **usuario**, quiero ver mis próximas acciones, para no olvidar plazos.

---

## 7. Casos de uso por perfil

| Perfil | Caso de uso representativo |
|---|---|
| **Aduanero / Agente de aduanas** | Genera un DUA de importación validado, comprueba la partida TARIC y los controles aplicables antes de presentar. |
| **Transitario** | Gestiona 30 expedientes simultáneos, recibe alertas de inspección y prioriza los de mayor riesgo. |
| **Importador** | Consulta a la IA los requisitos de un producto nuevo desde Asia, crea el expediente y sigue el checklist. |
| **Exportador** | Prepara factura comercial, packing list, certificado de origen y DUA de exportación coherentes entre sí. |
| **Operador logístico** | Coordina documentación de varias operaciones, controla documentos pendientes y plazos. |
| **Responsable de compras** | Estima aranceles, requisitos y riesgos de varios orígenes para elegir proveedor. |
| **Responsable de supply chain** | Monitoriza el riesgo agregado de la cartera de operaciones y cambios normativos. |

---

## 8. Flujo de usuario

### Flujo macro
```
Landing → Registro/Login → Onboarding (perfil + empresa)
   → Dashboard
        ├── Consultar al Asistente IA
        │       └── (opcional) Crear expediente desde la consulta
        ├── Crear/abrir Expediente
        │       ├── Datos de operación
        │       ├── Generar documentos
        │       ├── Ver requisitos y normativa
        │       └── Recibir alertas / riesgo estimado
        ├── Buscar normativa (motor de requisitos)
        └── Centro de alertas
```

### Flujo detallado: "Nueva operación de importación"
1. Usuario pulsa **+ Nuevo expediente**.
2. Indica tipo (importación/exportación), producto, país origen/destino, TARIC.
3. ComexIA calcula **requisitos, riesgo de inspección y documentación necesaria**.
4. El usuario completa datos (EORI, incoterm, transporte, pesos, contenedor).
5. **Genera documentos** (DUA, packing list, factura…) con validación.
6. ComexIA muestra **alertas** y **próximas acciones**.
7. El expediente queda en el dashboard con su estado y nivel de riesgo.

---

## 9. Estructura de páginas (sitemap)

```
Público (web de marketing)
├── Landing page
├── Servicios
├── Roles / Perfiles
├── Pricing
├── (FAQ y Seguridad como secciones de landing o páginas propias)
└── Login / Registro

Privado (aplicación tras login)
└── Dashboard interno
    ├── Lista de expedientes
    ├── Detalle de expediente
    ├── Asistente IA (chat)
    ├── Generador de documentos
    ├── Motor de normativa / buscador
    ├── Centro de alertas
    └── Configuración / Cuenta / Facturación
```

---

## 10. Contenido sugerido por página y sección

### 10.1 Landing page

**Hero**
- Titular: *"Tu copiloto de comercio exterior con IA"*
- Subtítulo: *"Documentación, normativa, aduanas y riesgos de tus importaciones y exportaciones, en un solo lugar."*
- CTA principal: **"Prueba ComexIA gratis"** · CTA secundario: **"Ver demo"**
- Visual: mockup del dashboard + chat IA.
- Microcopy de confianza: "Sin tarjeta · Datos cifrados · Normativa UE".

**Beneficios principales** (3–6 tarjetas)
- Reduce errores en trámites aduaneros
- Ahorra tiempo en búsqueda de normativa
- Automatiza documentación (DUA, certificados)
- Detecta riesgos de inspección
- Decide mejor en importación/exportación
- Unifica información logística y documental

**Servicios de ComexIA** (resumen con enlace a página Servicios)
- Automatización documental · Consultas normativas con IA · Gestión de requisitos aduaneros · Análisis de riesgos · Seguimiento de operaciones · Alertas regulatorias

**Perfiles a los que ayuda** (grid de roles con icono)

**Casos de uso** (carrusel o tabs por perfil con un ejemplo real)

**Sección de Inteligencia Artificial**
- Demostración del chat: ejemplo "semillas de sésamo India→España" con respuesta estructurada.
- Mensaje: "IA entrenada en comercio exterior que cita sus fuentes."

**Sección de Seguridad y Cumplimiento**
- Cifrado, RGPD, alojamiento UE, trazabilidad normativa, control de accesos.

**Pricing** (resumen de los 3 planes con enlace a página Pricing)

**FAQ** (acordeón, ver §10.5)

**Footer**
- Producto, Servicios, Roles, Pricing, FAQ, Aviso legal, Privacidad, Contacto, redes.

### 10.2 Página de Servicios
Una sección por servicio con título, descripción, beneficio y mini-visual:
1. **Automatización documental** — genera DUA, packing list, facturas y certificados validados.
2. **Consultas normativas con IA** — respuestas con fuente y pasos.
3. **Gestión de requisitos aduaneros** — requisitos por país/producto/TARIC.
4. **Análisis de riesgos** — probabilidad de inspección y nivel de riesgo.
5. **Seguimiento de operaciones** — estado y plazos de cada expediente.
6. **Alertas regulatorias** — cambios normativos y controles reforzados.

### 10.3 Página de Roles
Bloque por perfil (icono + titular + 3 bullets de valor + "cómo lo usa"). Perfiles del §4. CTA al final: "Empieza con tu perfil".

### 10.4 Página de Pricing

| | **Básico** | **Profesional** | **Empresa** |
|---|---|---|---|
| Público | Autónomos / pequeños importadores | Transitarios / pymes | Grandes operadores / consultoras |
| Asistente IA | Consultas limitadas/mes | Consultas ampliadas | Ilimitado |
| Expedientes | Hasta N | Ampliados | Ilimitados |
| Generador documental | Documentos básicos | Todos los documentos + plantillas | Todo + personalización |
| Motor de normativa | Búsqueda básica | Búsqueda avanzada + filtros | Avanzada + API |
| Alertas | Básicas | Avanzadas | Avanzadas + a medida |
| Usuarios | 1 | Varios | Equipos + roles |
| Soporte | Email | Prioritario | Dedicado / SLA |

- Toggle mensual/anual (con descuento anual).
- Plan destacado: **Profesional** ("Más popular").
- CTA por plan + "Hablar con ventas" en Empresa.

### 10.5 FAQ (ejemplos)
- ¿ComexIA presenta el DUA ante la aduana o solo lo prepara?
- ¿De dónde sale la información normativa y está actualizada?
- ¿Mis datos están seguros y dónde se alojan?
- ¿Sirve para mercancías peligrosas y productos sanitarios?
- ¿Puedo probarlo gratis?
- ¿Funciona para aduana española y resto de la UE?

### 10.6 Dashboard interno
- **Barra superior:** logo, buscador global, alertas (badge), avatar/cuenta.
- **Navegación lateral:** Dashboard · Expedientes · Asistente IA · Documentos · Normativa · Alertas · Configuración.
- **Zona central (inicio):**
  - Tarjetas resumen (KPIs): expedientes activos, documentos pendientes, alertas críticas, riesgo medio.
  - Tabla de expedientes (nombre, tipo, ruta, estado, riesgo, próxima acción).
  - Panel de alertas recientes.
  - Acceso rápido: "Nueva operación", "Preguntar a la IA".
- **Detalle de expediente:** datos de la operación, documentos (estado + generar), requisitos/normativa, alertas, timeline e historial.

---

## 11. Componentes UI necesarios

**Globales**
- Barra de navegación pública y privada (sidebar)
- Botones (primario, secundario, terciario, icono)
- Campos de formulario, selects, date pickers, file upload
- Tarjetas (beneficio, servicio, plan, expediente, KPI)
- Tablas con filtros, orden y paginación
- Badges de estado y severidad (riesgo: bajo/medio/alto)
- Tabs, acordeón (FAQ), tooltips, modales, toasts/notificaciones
- Avatar y menú de usuario
- Buscador con filtros

**Específicos del producto**
- **Burbujas de chat IA** + bloque de respuesta estructurada (documentación, normativa, riesgos, pasos) con citas/fuentes
- **Indicador de riesgo** (semáforo / barra)
- **Stepper / wizard** para crear operación y generar documentos
- **Vista previa de documento** (PDF) con estado de validación
- **Centro de alertas** (lista con severidad y acción)
- **Tabla de requisitos normativos** (arancel, certificados, controles, fuente)
- **Tarjeta de plan** con comparador y toggle mensual/anual
- **Timeline** de expediente

---

## 12. Reglas de negocio

- **RN-01** Toda respuesta normativa de la IA debe incluir referencia a su fuente.
- **RN-02** Un expediente no puede marcarse "listo para despacho" con documentos obligatorios incompletos.
- **RN-03** El riesgo de inspección se recalcula al cambiar producto, origen/destino o documentación.
- **RN-04** Los documentos comparten datos del expediente (un cambio en factura propaga a packing list y DUA).
- **RN-05** El incoterm debe ser coherente con el modo de transporte (p. ej. incoterms marítimos no se usan con contenedor; usar FCA/CPT/CIP).
- **RN-06** Las mercancías peligrosas activan automáticamente requisitos y documentación DGD.
- **RN-07** Los productos con control sanitario/fitosanitario generan alerta y exigen el certificado correspondiente.
- **RN-08** Los límites de uso (consultas IA, expedientes, usuarios) dependen del plan contratado.
- **RN-09** Un cambio normativo que afecte a un expediente activo genera alerta a su responsable.
- **RN-10** El historial de operaciones es inmutable (auditable).
- **RN-11** El sistema debe poder resolver operaciones sin plantilla previa: si no hay caso conocido, **deriva** la solución por razonamiento y no la rechaza.
- **RN-12** Toda resolución de un caso lleva asociado un **nivel de confianza**; por debajo del umbral se avisa al usuario y se indica qué verificar y la fuente.
- **RN-13** El catálogo de documentos, tipos de operación y reglas normativas es **extensible mediante datos/definiciones**, sin cambios en la lógica del producto.
- **RN-14** Una operación corregida o validada por el usuario puede realimentar la base de conocimiento (con su consentimiento) para mejorar casos futuros.

---

## 13. Requisitos funcionales (RF)

- **RF-01** Registro, login y recuperación de contraseña.
- **RF-02** Onboarding con datos de empresa (EORI, país, perfil).
- **RF-03** Chat con el asistente IA con respuesta estructurada y fuentes.
- **RF-04** Crear expediente desde una consulta de la IA.
- **RF-05** CRUD de expedientes con estados y nivel de riesgo.
- **RF-06** Generación de DUA, packing list, factura, certificados de origen, sanitarios, fitosanitarios y de mercancías peligrosas.
- **RF-07** Validación de documentos en tiempo real.
- **RF-08** Exportación de documentos a PDF.
- **RF-09** Motor de búsqueda de normativa con filtros (país, producto, TARIC, tipo, riesgo).
- **RF-10** Cálculo y visualización del riesgo de inspección.
- **RF-11** Sistema de alertas con severidad y acción recomendada.
- **RF-12** Dashboard con KPIs, lista de expedientes y alertas.
- **RF-13** Gestión de cuenta, plan y facturación.
- **RF-14** Gestión de usuarios y roles (planes Profesional/Empresa).
- **RF-15** Plantillas reutilizables de documentos.
- **RF-16** Motor de resolución de casos: a partir de la descripción de una operación (incl. casos nuevos), genera requisitos, documentación, riesgo y plan de acción.
- **RF-17** Ayuda a la clasificación arancelaria (sugerir HS/TARIC a partir de la descripción del producto).
- **RF-18** Selección automática de los documentos necesarios para cada operación.
- **RF-19** Catálogo de documentos y reglas normativas ampliable por configuración/datos, incl. documentos a medida.
- **RF-20** Indicador de nivel de confianza y avisos de verificación en resoluciones atípicas.
- **RF-21** Soporte de múltiples regímenes aduaneros (definitivo, tránsito, depósito, perfeccionamiento, temporal, territorios especiales).

---

## 14. Requisitos no funcionales (RNF)

- **RNF-01 Usabilidad:** interfaz limpia, curva de aprendizaje baja, en español.
- **RNF-02 Rendimiento:** respuestas de UI < 1 s; respuesta IA con indicador de carga.
- **RNF-03 Seguridad:** cifrado en tránsito y reposo, control de accesos por rol.
- **RNF-04 Privacidad:** cumplimiento RGPD, alojamiento de datos en la UE.
- **RNF-05 Disponibilidad:** objetivo 99,9%.
- **RNF-06 Escalabilidad:** soporta cuentas con muchos expedientes simultáneos.
- **RNF-07 Trazabilidad:** auditoría de acciones y citación de fuentes normativas.
- **RNF-08 Accesibilidad:** contraste y navegación conformes a WCAG AA.
- **RNF-09 Responsive:** uso en escritorio (prioritario) y tablet.
- **RNF-10 Mantenibilidad:** normativa actualizable sin redeploy.

---

## 15. Criterios de aceptación (ejemplos por funcionalidad)

**Asistente IA**
- *Dado* que pregunto por importar un producto desde un país, *cuando* envío la consulta, *entonces* recibo respuesta con: documentación, normativa, riesgos, requisitos sanitarios/fitosanitarios, alertas y pasos, **con al menos una fuente citada**.
- *Cuando* pulso "Crear expediente", *entonces* se genera un expediente precargado con los datos de la consulta.

**Generador documental**
- *Dado* un expediente con datos completos, *cuando* genero un DUA, *entonces* el documento se rellena automáticamente y se puede exportar a PDF.
- *Cuando* falta un campo obligatorio, *entonces* la validación lo señala y bloquea la exportación.

**Motor de normativa**
- *Cuando* filtro por país y TARIC, *entonces* obtengo una ficha con aranceles, certificados exigidos y controles, con fuente.

**Motor de resolución de casos (generalidad)**
- *Dado* un caso **sin plantilla previa**, *cuando* lo describo, *entonces* el sistema deriva requisitos, documentos, riesgo y plan de acción en vez de rechazarlo.
- *Cuando* la resolución es atípica o incierta, *entonces* se muestra el **nivel de confianza** y qué verificar, con la fuente.
- *Cuando* describo un producto, *entonces* el sistema sugiere su clasificación HS/TARIC.
- *Cuando* se añade un nuevo tipo de documento o regla, *entonces* queda disponible **sin** cambios en el código del producto.

**Alertas**
- *Cuando* a un expediente le falta documentación obligatoria, *entonces* aparece una alerta crítica con la acción recomendada.

**Dashboard**
- *Cuando* entro tras login, *entonces* veo KPIs, expedientes activos con estado y riesgo, y alertas recientes.

---

## 16. Estilo visual y guía de diseño

**Personalidad:** profesional, moderno, tecnológico, SaaS, inspirado en plataformas de IA. Limpio y claro.

**Paleta sugerida** (logística + tecnología + confianza)
- Primario: **Azul profundo / índigo** `#1E3A8A` → confianza, sector.
- Secundario / acento: **Cian–turquesa** `#06B6D4` → tecnología, IA.
- Acento IA (degradado): índigo → cian para elementos de IA.
- Éxito: `#16A34A` · Advertencia: `#F59E0B` · Riesgo/crítico: `#DC2626`.
- Neutros: `#0F172A` (texto), grises `#64748B`/`#94A3B8`, fondos `#F8FAFC` / blanco.

**Tipografía:** sans-serif moderna (Inter, Manrope o similar). Titulares con peso bold, cuerpo regular, buena jerarquía.

**Iconografía:** lineal, coherente (contenedores, barco, avión, camión, documento, escudo, alerta, IA/chip).

**Layout:** generoso espacio en blanco, esquinas redondeadas (8–12 px), sombras suaves, tarjetas como unidad base, grid de 12 columnas.

**Tono:** mockups del dashboard y del chat en la landing transmiten "producto real".

---

## 17. Ideas para el diseño en Figma

- **Pages de Figma:** `01 Marketing`, `02 App / Dashboard`, `03 Componentes`, `04 Estilos`.
- **Design system primero:** colores, tipografías, espaciado, iconos y componentes reutilizables (botones, inputs, tarjetas, badges, tablas) antes de las pantallas.
- **Auto Layout** en tarjetas, listas y formularios para acelerar variaciones.
- **Variantes de componentes:** botones (estados), badges de riesgo (bajo/medio/alto), tarjetas de plan (destacado/normal).
- **Pantallas mínimas a maquetar:**
  1. Landing (completa, con todas las secciones del §10.1)
  2. Servicios
  3. Roles
  4. Pricing
  5. Login / Registro
  6. Dashboard (inicio)
  7. Detalle de expediente
  8. Asistente IA (chat con respuesta estructurada)
  9. Generador de documentos (wizard + preview)
  10. Motor de normativa (buscador + ficha)
  11. Centro de alertas
- **Prototipo navegable:** enlazar CTA de landing → registro → dashboard → flujo "nueva operación".
- **Estados a representar:** vacío (sin expedientes), con datos, carga de IA, alerta crítica, documento inválido.
- **Mockear el chat con el ejemplo real** del sésamo India→España para vender la propuesta de valor.

---

## 18. Prompt final para IA generadora de wireframes / prototipos

> Copia este prompt en una herramienta de generación de UI (p. ej. para wireframes o prototipos). Ajusta el nivel de fidelidad según necesites.

```
Diseña una plataforma SaaS llamada "ComexIA", un copiloto de comercio exterior y
logística internacional potenciado por IA, dirigido a importadores, exportadores,
transitarios, agentes de aduanas y responsables de supply chain (mercado España/UE).

IMPORTANTE: la plataforma es GENERALISTA. No resuelve solo casos predefinidos: un
motor de IA razona y resuelve OPERACIONES NUEVAS (cualquier producto, partida
HS/TARIC, ruta origen-destino y régimen aduanero) y genera los documentos que cada
caso necesite, declarando su nivel de confianza cuando el caso es atípico. El diseño
debe transmitir esta capacidad abierta, no un listado cerrado de plantillas.

ESTILO VISUAL: profesional, moderno, tecnológico, estilo SaaS inspirado en
plataformas de IA. Limpio, con mucho espacio en blanco, tarjetas con esquinas
redondeadas y sombras suaves, grid de 12 columnas. Tipografía sans-serif moderna
(tipo Inter). Paleta: azul índigo profundo (#1E3A8A) como primario, cian turquesa
(#06B6D4) como acento tecnológico/IA, verde éxito (#16A34A), ámbar advertencia
(#F59E0B) y rojo crítico (#DC2626) para niveles de riesgo. Fondos claros (#F8FAFC).
Iconografía lineal con motivos de logística (contenedor, barco, avión, camión,
documento, escudo, alerta, chip/IA).

GENERA ESTAS PANTALLAS:

1) LANDING PAGE con: hero (titular "Tu copiloto de comercio exterior con IA",
   subtítulo, CTA primario "Prueba ComexIA gratis" y secundario "Ver demo", mockup
   del dashboard); sección de beneficios (reducir errores aduaneros, ahorrar tiempo
   en normativa, automatizar DUA y certificados, detectar riesgos de inspección,
   unificar información); servicios; perfiles a los que ayuda (grid de roles con
   icono); casos de uso por perfil; sección de Inteligencia Artificial con un chat
   de ejemplo; sección de Seguridad y Cumplimiento (RGPD, cifrado, UE); pricing con
   3 planes; FAQ en acordeón; footer completo.

2) PÁGINA DE SERVICIOS: automatización documental, consultas normativas con IA,
   gestión de requisitos aduaneros, análisis de riesgos, seguimiento de operaciones
   y alertas regulatorias (una sección por servicio con icono y descripción).

3) PÁGINA DE ROLES: un bloque por perfil profesional explicando cómo le ayuda.

4) PÁGINA DE PRICING: tres planes (Básico, Profesional destacado como "Más popular",
   Empresa) con tabla comparativa de beneficios y toggle mensual/anual.

5) DASHBOARD INTERNO (tras login) con barra superior (logo, buscador, alertas con
   badge, avatar), navegación lateral (Dashboard, Expedientes, Asistente IA,
   Documentos, Normativa, Alertas, Configuración) y zona central con: tarjetas KPI
   (expedientes activos, documentos pendientes, alertas críticas, riesgo medio),
   tabla de expedientes (nombre, tipo import/export, ruta origen-destino, estado,
   nivel de riesgo con semáforo, próxima acción), panel de alertas recientes y
   accesos rápidos "Nueva operación" y "Preguntar a la IA".

6) ASISTENTE IA (chat): conversación donde el usuario pregunta "Quiero importar
   semillas de sésamo desde India a España, ¿qué documentación necesito?" y la IA
   responde en bloques estructurados: Documentación obligatoria, Normativa aplicable,
   Riesgos de inspección, Requisitos sanitarios/fitosanitarios, Alertas y Pasos
   recomendados, con fuentes citadas y un botón "Crear expediente con esta operación".

7) GENERADOR DE DOCUMENTOS: wizard por pasos para generar DUA, packing list, factura
   comercial y certificados, con formulario a la izquierda y vista previa del PDF a la
   derecha, validación en tiempo real e indicadores de campos faltantes.

8) MOTOR DE NORMATIVA: buscador con filtros (país origen, país destino, producto,
   código TARIC/HS, tipo de mercancía, tipo de riesgo) y ficha de resultados con
   aranceles, certificados exigidos, controles y normativa citada.

Usa componentes consistentes (botones, inputs, tarjetas, badges de estado y de riesgo,
tablas con filtros, tabs, acordeón, modales, toasts). Diseño responsive priorizando
escritorio. Incluye estados vacíos y de carga donde tenga sentido.
```

---

## 19. Resumen de entregables para la maqueta Figma

1. Design system (colores, tipografía, componentes).
2. 11 pantallas clave (§17).
3. Prototipo navegable del flujo principal.
4. Mockup destacado del chat IA con el caso de ejemplo.

*Fin del documento.*
