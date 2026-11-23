# COATL — Cálculo de Oportunidad y Análisis Territorial Local

Aplicación web estadística que estima la **probabilidad de supervivencia a 3 años** y la **rentabilidad esperada** de abrir un negocio en **Coacalco de Berriozábal, Estado de México**.

- Proyecto de Participación Especial — Jornada Académica Empresarial, materia Probabilidad y Estadística.
- Docente: Mtra. Noemí Daniela Palacios Fermín.
- Autores (orden obligatorio, no alterar): **Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés**.
- Posicionamiento: COATL es un producto/herramienta en sí mismo (en el que se invierte), no una herramienta que los inversionistas usan para sus propias decisiones.

Idioma del proyecto: **español (México)** en UI, comentarios, commits y documentación.

## Estructura

```
src/datos/            Giros, zonas, S₀(t), supuestos de incertidumbre (sin DOM)
src/modelo/            modelo.js (logístico, rangoP, Cox, Monte Carlo) y finanzas.js — puros y probados
src/ui/  src/mapa/     Formulario, resultados, widgets, estilos y mapa; explorar.js + estilos-explorar.css = recorrido exploratorio (docs/WIDGETS.md)
src/index.html         Plantilla; scripts/build.mjs la llena
index.html             GENERADO por `npm run build` (no editar a mano); también dist/index.html
tests/                 modelo.test.mjs (node:test) y e2e/ (Playwright)
scripts/               build, servir, validar_modelo.py, diagrama_uml.mjs, capturas.mjs
docs/                  AUDITORIA.md, METODOLOGIA.md, diagrama-proceso.svg/png, capturas/
entregables/           Documento técnico, reporte y presentación (PDF/PPTX), libro de Excel, video y diagrama
.github/workflows/     Pruebas → build → deploy de dist/ a GitHub Pages
```

## Stack

- HTML/CSS/JS autocontenido (originalmente React/Vite empaquetado). Sin backend.
- Leaflet **1.9.4** y Chart.js **4.4.1**, ambos desde cdnjs con SRI sha384 (CSS de Leaflet incorporado); OpenStreetMap / Esri; tipografías propias en `assets/fuentes/web/`. CSP en meta.
- Deploy: GitHub Pages vía GitHub Actions (`.nojekyll` presente).
- Documentos: `docx` (Node), `pptxgenjs`, Sharp, matplotlib, LibreOffice headless, `pdftoppm`.

## Modelo estadístico (NO cambiar sin validar contra el escenario de referencia)

1. **Regresión logística** → probabilidad base de éxito con coeficientes β por variable.
2. **Supervivencia tipo Cox**: tabla base S₀(t) × hazard ratio → curva de supervivencia.
3. **Monte Carlo**: RNG `mulberry32` (semilla fija, reproducible) + **Box-Muller**. Choque anual común de demanda + ruido mensual + ruido de CV (supuestos en `INCERTIDUMBRE`). Escenarios P5 / mediana / P95 (cuantil tipo 7).
1b. **Rango plausible de P** (`rangoP`): perturba los β; sensibilidad, no IC muestral.
4. **Finanzas**: VPN, ROI, payback (meses).
5. **FODA dinámico**: 9 estrategias cuantificadas con sensibilidad real ΔP (se recalcula P moviendo cada palanca).

Funciones núcleo: `modeloLogistico`, `rangoP`, `monteCarlo`, `curvaSupervivencia`, `finanzas` (en `src/modelo/`); `palancas`, `clasificarFODA` (`src/ui/app.js`); `pintarKPIs` (`src/ui/resultados.js`).

Alcance funcional: 35 giros de negocio, 36 variables en 4 pestañas (incluye riesgo de extorsión, pago de piso, resiliencia y motivación; neutras por defecto), 6 zonas con polígonos de color en el mapa.

### Escenario de referencia (prueba de regresión) — v16 (S₀ oficial INEGI, β de giro y zona del DENUE recalibrados, formalidad con la ENOE)

**Cafetería · Los Héroes** (valores por defecto: ticket 95, CV 38 %) debe dar:

| Métrica | Valor |
|---|---|
| P(supervivencia 3 años) | 40.9 % (rango plausible 33.4–48.9 %) |
| Utilidad mensual | ≈ $60,371 |
| ROI | 302.9 % |
| Payback | 4 meses (4.1) |
| VPN | $736,085 |

v1 (55.0 %, $41,899, 212.6 %, 6, $601,442) y v2 (55.0 %, $60,371, 302.9 %, 4, $970,106) usaban una S₀(t) aproximada y β₀ = −0.16; v3–v12 (51.6 %, rango 44.1–58.2 %, VPN $912,776) usaban β de giro y zona supuestos por el equipo; v13–v14 (38.0 %, rango 30.6–46.6 %, VPN $686,989) y v15 (38.0 %, rango 30.3–46.3 %) usaban los β del DENUE sin recalibrar; ver docs/METODOLOGIA.md y docs/VERIFICACION_DATOS.md. Lo vigilan `tests/modelo.test.mjs`, `scripts/validar_modelo.py` y la e2e. Cualquier cambio en el modelo debe reproducir estos números o documentar explícitamente por qué cambian.

## Identidad visual (FIJA)

- Rojo mexicano `#C8102E`, granate `#7A0C1F`, blanco hueso `#FBF6F3`.
- Greca escalonada / xicalcoliuhqui como borde; branding en náhuatl.
- **Rechazado explícitamente**: rediseños neón/negro, estética SaaS, Next.js/Three.js/Rust. No proponerlos.

## Reglas de alcance

- De documentos de diseño externos, absorber **solo mejoras estadísticas sustantivas**; nada de overhauls de arquitectura o estética.
- Mantener el aviso legal (LFDA arts. 11–13, LFPDPPP) y las referencias con hipervínculos verificados.
- Mantener extras de UI existentes: contador animado del score, confeti al cruzar umbral, barra de progreso de scroll.

## Comandos

```bash
npm run build                      # regenera index.html y dist/ desde src/
npm run servir                     # http://127.0.0.1:8000
npm test                           # unitarias del modelo
python scripts/validar_modelo.py   # validación cruzada (en Windows: uv run --no-project python …)
npm run test:e2e                   # Playwright; en Windows usa Edge (Chromium de PW bloqueado)
node scripts/diagrama_uml.mjs && node scripts/capturas.mjs [--sitio]
```

Edita siempre `src/` y luego `npm run build`; el CI falla si `index.html` no coincide con el build.
Antes de dar algo por terminado: build, `npm test`, validador Python, e2e en verde (incluye consola sin errores y escenario de referencia).

## Gotchas de la cadena de entregables

- **Sharp**: `.composite()` y `.resize()` en llamadas separadas (componer a buffer → nueva instancia → resize). Encadenarlos falla en silencio o da error de dimensiones.
- **Sharp + SVG**: rasteriza según `viewBox`, no `width/height` → siempre `.resize(w, h)` explícito.
- **pptxgenjs**: objeto `shadow` nuevo por elemento (referencias compartidas rompen).
- **docx / OOXML**: respetar el orden de bordes de párrafo; callouts simples para pasar validación.
- Flujo de presentación: SVG en Python → Sharp → pptxgenjs → LibreOffice headless a PDF → `pdftoppm` para QA lámina por lámina.

## v6: páginas, asistente y giros SCIAN

- `src/ui/paginas.js`: vistas por apartado (secciones con `data-pagina`). Para navegar desde el código usa `irA(id)`, nunca `scrollIntoView` hacia otra página. Las e2e usan `?vista=todo`.
- `src/ui/describir.js`: IA de COATL (`iaProyecto`) → intermediario `servicios/ia/api/coatl.js` en Vercel (`coatl-ia.vercel.app`) con la clave del proyecto en `GEMINI_API_KEY`; respaldo local por reglas. El visitante nunca pone clave. JSON validado en `deJSON`. La IA se activa en `*.github.io` o con `?ia=1`. Voz con la Web Speech API.
- `src/ui/giros_scian.js`: actividades del SCIAN con la plantilla del giro COATL más cercano («estimación del equipo»); costos propios ilimitados suman a otros fijos.
- `scripts/asistente.mjs`: asistente de línea de comandos (Claude Opus 5.5) con herramientas: simular, leer documentos y consultar el DENUE.
- `src/ui/asistente.js`: asistente flotante en todas las páginas (motor local + IA de COATL vía `iaProyecto`; solo envía la pregunta y un resumen del escenario). Giros propios con cualquier nombre en giros_scian.js (`usarGiroPropio`).
- Sin modo oscuro (retirado a petición del equipo, v7). Pestañas de apartados abiertos en paginas.js (#pestanasApp, sessionStorage).
- Fotos reales en `assets/img/zonas/` con cita mínima; créditos en docs/RECURSOS.md.

## Censo, AGEB y accesibilidad (v7.1)

- `scripts/censo_sync.py` → `data/censo/giros.json` (CE 2019); `src/ui/censo.js` lo contrasta sin cambiar los valores por defecto.
- `scripts/ageb_sync.mjs` → `data/ageb/coacalco.json` (70 AGEB, wscatgeo del INEGI); el mapa las agrupa por zona y cae a los rectángulos si no hay archivo.
- `tests/e2e/accesibilidad.spec.js` (axe, WCAG 2.1 AA): mantener en 0 violaciones.

## DENUE y empresas

- `scripts/denue_sync.py` + `.github/workflows/denue.yml` (semanal) generan `data/denue/`; el build lo copia a dist/. Solo conteos, nunca datos de contacto.
- La API del DENUE requiere token: solo en el secreto `DENUE_TOKEN` de GitHub, nunca en el cliente.
- `src/ui/empresas.js`: archivos de empresa solo en memoria del navegador; prohibido agregar envío, analítica o localStorage, y nunca mandarlos a Gemini/Claude. La CSP solo abre `connect-src` al intermediario de IA (origen de `COATL_IA_URL`, inyectado por el build).
- Mapeo giro→SCIAN verificado contra `clases.json`; no agregues códigos de memoria.

## Recorrido exploratorio (v4)

- v8: Inicio y Simulador usan el mismo mapa real (`crearMapaZonas`, 70 AGEB del INEGI por zona); el esquema del equipo se retiró. Fotos de escenarios con `@@FOTO:id:clase@@` (build, créditos en `assets/img/escenarios/creditos.json`); el build falla si una foto se repite.
- Profundidad con SVG isométrico, CSS 3D y capas; **sin WebGL/Three.js** (rechazado arriba). Cada widget: pregunta, interacción, respuesta y data-estado (cargando/listo/vacio/error).
- Los widgets llaman a las mismas funciones del motor: nunca dupliques fórmulas en la UI.
- La CSP usa hashes calculados por el build: no agregues style="" en HTML generado por JS (usa CSSOM o clases).

## v10: plan, aviso legal y entregables

- Estrategia: `pintarHerramientasPlan` (app.js) con `aplicarPalancas`, `HITOS_PLAN`; widgets #wPlan, #wRiesgo (impacto y control, sin probabilidad de ocurrencia), #wCalendario; impresión con `body.imprimir-plan`.
- `npm run entregables` (scripts/entregables.mjs) regenera DOCX/PPTX y, con LibreOffice (`winget install TheDocumentFoundation.LibreOffice`), los PDF; CI en .github/workflows/entregables.yml (artefacto, sin commits).
- Propuesta de stand: docs/STAND.md.

## v11: negocio con nombre, mejora y reporte

- `src/ui/negocios.js`: nombre y negocios guardados en `localStorage` (`coatl-negocios`, solo variables del formulario y respuestas del diagnóstico). Excepción deliberada a «sin localStorage»: los archivos de empresas siguen solo en memoria.
- `src/ui/mejora.js` (sección #mejora, página del simulador): alternativas (`palancas`), diagnóstico (`src/datos/madurez.js`, 30 puntos; no cambia P), fiscal (`src/modelo/fiscal.js`) y modelo 2.5D (`src/ui/escena25.js`, `escenaNegocio(o)`, SVG puro).
- `src/ui/reporte.js`: PDF propio (`body.imprimir-reporte` + #reporteNegocio) e imagen PNG a 2×; no es captura del sitio.
- Carruseles: `@@CARRUSEL:inicio@@` y `@@CARRUSEL:territorio@@` (uso «Carrusel · Inicio/Territorio» en creditos.json). Sin fotos en DENUE, Simulador, Empresas, Estrategia ni Aviso legal. Folios sin «Sección 0X».
- Grecas animadas (`grecaMarcha`); pausa global con #pausaMovimiento (`body.sin-movimiento`).
- Plantilla de Excel: `node scripts/plantilla_excel.mjs` → `assets/plantillas/` (el build la copia a dist). Requiere `exceljs`.
- Orden de módulos: negocios, mejora y reporte van ANTES de app.js (app.js calcula al cargar).
- Rango plausible de referencia: ver v13.

## v12: resultado para llevar, documentos y video

- `src/ui/reporte.js`: reportes «negocio», «plan» (Estrategia) y «completo»; QR (`qrcode-generator` incluido en `assets/vendor/`) con el resultado en `#r=` y vista `?reporte=1`. `URL_PUBLICA` = sitio en GitHub Pages.
- `src/ui/legal.js`: aviso legal en dos columnas equilibradas con cenefa de relleno de altura exacta.
- Menú = nombres de las pestañas (DENUE nacional, Para empresas, Aviso legal). Micrófono: `assets/img/iconos/microfono.webp` (clase `ico-mic`). Video en Inicio: `@@VIDEO@@` (el build copia `entregables/COATL_Video.mp4` y genera el .vtt).
- Documentos: `node scripts/documentos.mjs [tecnico|reporte|presentacion|excel|versiones]` (`scripts/doc/`: datos.mjs, kit.mjs, contenido.mjs, presentacion.mjs, libro_excel.mjs). PDF compuestos con Chromium y las fuentes del sitio; nunca con LibreOffice (descoloca β y S₀). Historial ÚNICO en `data/versiones.json`: al publicar una versión, agregarla ahí.
- Video: narrador por escena; grabaciones en `entregables/voces/NN-escena.*` (no se versionan); pauta `docs/GUION_VOCES.md` (`--guion`).

## v13: β estimados, perfiles cifrados y carga

- β de giro y zona estimados con el DENUE: `uv run --no-project --with numpy --with statsmodels python scripts/denue_supervivencia.py` (descarga las ediciones 2018_11, 2019_11 y 2024_11 del Estado de México a `.cache/denue/historico/`, ≈ 450 MB) → `data/denue/supervivencia.json`; luego `node scripts/aplicar_betas.mjs` escribe `z`, `ee`, `zEq` (supuesto anterior) y `fz` en `src/datos/datos.js`. Cohorte = alta 2019-11; resultado = sigue en 2024_11. Solo diferencias; el nivel lo fija β₀.
- `src/ui/negocios.js`: perfiles con usuario y clave (PBKDF2 250k + AES-GCM, llave solo en memoria); sin perfil → `sessionStorage`. La clave vieja `coatl-negocios` se migra a la pestaña y se borra.
- Carga: tipografías en `assets/fuentes/web/` (woff2 variables, @fontsource-variable) con `font-src 'self'`; Leaflet CSS dentro del estilo (build); P se pinta antes del Monte Carlo.
- Indicador `<html data-calculo="pendiente|listo" data-calculo-version>`: en pruebas, espera `listo` en vez de tiempos fijos.
- QR: base = la página si no es local; si es local, `<link rel="canonical">`.
- Documentos Word y pitch heredados retirados; los entregables son PDF, PPTX y XLSX de `scripts/documentos.mjs`.

## Pendiente

- Monte Carlo y el rango plausible de P se calculan en un Web Worker desde un Blob generado por el build. Si falla el Worker, se usa el motor síncrono.

- S₀(t) usa el tabulado nacional del INEGI 1989–2019 para t = 1…10. Los datos por giro siguen siendo estimaciones del equipo.
- Video para evaluadores: `node scripts/video_presentacion.mjs` → `entregables/COATL_Video.mp4` + `.srt` (Windows: voz Sabina, Edge y ffmpeg). Todo documento usa la paleta, la greca y las tipografías del sitio (`assets/fuentes/`, incrustadas).
- Teléfono: `tests/e2e/orientacion.spec.js` revisa vertical, horizontal y rotación; en horizontal bajo la barra superior no es fija.
- La foto de contexto es obra de ProtoplasmaKid, publicada en Wikimedia Commons bajo CC BY-SA 4.0. [Ficha de la foto](https://commons.wikimedia.org/wiki/File:Coacalco_Estado_Mexico.JPG).
- Diagrama UML de 6 carriles: hecho (`scripts/diagrama_uml.mjs` → docs/ y entregables/).

## v14: formalidad estimada con la ENOE

- `scripts/enoe_supervivencia.py` (uv con numpy, pandas, statsmodels) lee `.cache/enoe/enoe_AAAA_trim1_csv.zip` y escribe `data/enoe/supervivencia.json`. Usa el panel de la ENOE: 1.ª visita en T1, 5.ª visita en T1 del año siguiente. Solo T1, porque `p3r_anio` viene en el cuestionario ampliado. La descarga necesita un User-Agent de navegador y el Referer de la página de la ENOE.
- Sobrevive quien sigue como dueño en la misma rama. Formal = `tue_ppal == 2`. Diferencia formal − informal 0.23 (antes 0.16). «Formal desde el inicio» queda en 0.10 (default; la referencia no cambia). Gradual −0.02, informal −0.13. Una prueba en `tests/modelo.test.mjs` exige que el `<select id="formalidad">` coincida con el JSON.
- Experiencia, reserva, marketing y deuda siguen siendo supuestos: la ENAMIN acabó en 2012 y ninguna fuente pública los liga con el cierre. La ruta para estimarlas está en docs/METODOLOGIA.md.
- Prompts: `docs/PROMPT_CODEX_CONTINUAR.md` y `docs/PROMPT_HELP_QUOTE_TERMINAL.md` (Help Quote Terminal está en `Repos/actinver-terminal`).

## v15: validación, sin doble conteo y plan por etapas

- `scripts/validar_denue.py` → `data/denue/validacion.json`: validación fuera de muestra con la cohorte del DENUE de Coacalco (giro sin Coacalco, zona con validación cruzada de 5 grupos). AUC 0.58, Brier 0.269 contra 0.250 de una constante: se publica tal cual. El build la inserta en `resultados.js` (`/*@@VALIDACION@@*/`).
- `modeloLogistico`: la competencia ya no entra a P; bloque margen + reserva + deuda acotado a [−0.50, 0.35] (`TOPE_FINANCIERO`); cada contribución trae su fuente (`datos`, `propio`, `supuesto`) y el modelo devuelve `Pmedido`. `monteCarlo` devuelve `pSinEfectivo`, `cajaInicial` y `ventasMes` sin llamadas extra al generador.
- Palancas: `FACTOR_PLAN = 0.5`, `efectoPlan`, `pPlan` y `evidenciaPalanca` en app.js; úsalos siempre en lugar de `probDe(aplicarPalancas(...))`. Plan por etapas: `etapasPlan(e, mc)` (#wEtapas y PDF del plan).
- Cifras de estimaciones en `src/index.html`: usa `@@DATO:carpeta/archivo:ruta[:pct|n]@@` (lee `data/carpeta/archivo.json`); el build falla si la ruta no existe.
- Nunca prometas éxito ni «99 %»: el plan acota la pérdida; no garantiza la supervivencia.

## v16: auditoría estricta

- `monteCarlo` guarda las ventas de cada mes: `ventasMes.p05` es el P5 de UN mes (no del promedio anual) y `ventasMes.falsaAlarma` es la fracción de años con dos meses seguidos bajo el P5 sin que nada ande mal (4.2 % en la referencia). La regla de salida del plan usa esos valores.
- `scripts/aplicar_betas.mjs` multiplica los β de giro y zona por `pendiente_calibracion` de `data/denue/validacion.json` (0.794) y aplica la herencia de clases compartidas (juguería ← cafetería, pastelería ← panadería). Si cambias el DENUE: `denue_supervivencia.py` → `validar_denue.py` → `aplicar_betas.mjs`.
- Palancas: nada de porcentajes sin fuente verificada; cada `tasa` dice si es medido o supuesto.

## v17: encuesta y veredicto

- Encuesta: `node scripts/encuesta.mjs` → `entregables/encuesta/` (Apps Script, encabezados, codificación). **Sin enlaces** en el formulario ni en el repositorio (ni el del sitio ni el del propio formulario): evita fugas y suplantaciones. Respuestas solo en la hoja privada del equipo.
- `pintarVeredicto(P, vpn)`: con P ≥ 65 % y VPN < 0 el letrero es «Sobrevive, pero no recupera la inversión» y no hay confeti; el confeti solo se decide con el resultado completo (vpn conocido).
- Esquema de color: `<meta name="color-scheme" content="only light">` y `:root{color-scheme:only light}` impiden que Edge o Chrome oscurezcan el sitio a la fuerza (modo oscuro automático). No quitarlos: COATL no tiene modo oscuro.
