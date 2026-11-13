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
entregables/           Pitch PPTX y diagrama
.github/workflows/     Pruebas → build → deploy de dist/ a GitHub Pages
```

## Stack

- HTML/CSS/JS autocontenido (originalmente React/Vite empaquetado). Sin backend.
- Leaflet **1.9.4** y Chart.js **4.4.1**, ambos desde cdnjs con SRI sha384; OpenStreetMap / Esri; Google Fonts. CSP en meta.
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

Alcance funcional: 35 giros de negocio, 32 variables en 4 pestañas, 6 zonas con polígonos de color en el mapa.

### Escenario de referencia (prueba de regresión) — v5 (S₀ oficial INEGI hasta el año 10)

**Cafetería · Los Héroes** (valores por defecto: ticket 95, CV 38 %) debe dar:

| Métrica | Valor |
|---|---|
| P(supervivencia 3 años) | 51.6 % (rango plausible 44.3–58.3 %) |
| Utilidad mensual | ≈ $60,371 |
| ROI | 302.9 % |
| Payback | 4 meses (4.1) |
| VPN | $912,776 |

v1 (55.0 %, $41,899, 212.6 %, 6, $601,442) y v2 (55.0 %, $60,371, 302.9 %, 4, $970,106) usaban una S₀(t) aproximada y β₀ = −0.16; ver docs/METODOLOGIA.md y docs/VERIFICACION_DATOS.md. Lo vigilan `tests/modelo.test.mjs`, `scripts/validar_modelo.py` y la e2e. Cualquier cambio en el modelo debe reproducir estos números o documentar explícitamente por qué cambian.

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
- `src/ui/describir.js`: intérprete local (reglas) + Claude opcional (`@anthropic-ai/sdk` 1.3.0 vía jsDelivr, clave solo en memoria, salida estructurada). Voz con la Web Speech API.
- `src/ui/giros_scian.js`: actividades del SCIAN con la plantilla del giro COATL más cercano («estimación del equipo»); costos propios ilimitados suman a otros fijos.
- `scripts/asistente.mjs`: asistente de línea de comandos (Claude Opus 5.5) con herramientas: simular, leer documentos y consultar el DENUE.
- Tema oscuro: clase `body.oscuro` (antes «Modo Oráculo» neón, retirado).
- Fotos reales en `assets/img/zonas/` con cita mínima; créditos en docs/RECURSOS.md.

## DENUE y empresas

- `scripts/denue_sync.py` + `.github/workflows/denue.yml` (semanal) generan `data/denue/`; el build lo copia a dist/. Solo conteos, nunca datos de contacto.
- La API del DENUE requiere token: solo en el secreto `DENUE_TOKEN` de GitHub, nunca en el cliente.
- `src/ui/empresas.js`: archivos de empresa solo en memoria del navegador; prohibido agregar envío, analítica o localStorage. La CSP es `connect-src 'self'`.
- Mapeo giro→SCIAN verificado contra `clases.json`; no agregues códigos de memoria.

## Recorrido exploratorio (v4)

- Profundidad con SVG isométrico, CSS 3D y capas; **sin WebGL/Three.js** (rechazado arriba). Cada widget: pregunta, interacción, respuesta y data-estado (cargando/listo/vacio/error).
- Los widgets llaman a las mismas funciones del motor: nunca dupliques fórmulas en la UI.
- La CSP usa hashes calculados por el build: no agregues style="" en HTML generado por JS (usa CSSOM o clases).

## Pendiente

- Monte Carlo y el rango plausible de P se calculan en un Web Worker desde un Blob generado por el build. Si falla el Worker, se usa el motor síncrono.

- S₀(t) usa el tabulado nacional del INEGI 1989–2019 para t = 1…10. Los datos por giro siguen siendo estimaciones del equipo.
- Reporte y presentación se generan con `node scripts/reporte_docx.mjs` y `node scripts/presentacion_pptx.mjs` (cifras tomadas del propio modelo). La foto de contexto es obra de ProtoplasmaKid, publicada en Wikimedia Commons bajo CC BY-SA 4.0. [Ficha de la foto](https://commons.wikimedia.org/wiki/File:Coacalco_Estado_Mexico.JPG).
- Diagrama UML de 6 carriles: hecho (`scripts/diagrama_uml.mjs` → docs/ y entregables/).
