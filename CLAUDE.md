# COATL — Cálculo de Oportunidad y Análisis Territorial Local

Aplicación web estadística que estima la **probabilidad de supervivencia a 3 años** y la **rentabilidad esperada** de abrir un negocio en **Coacalco de Berriozábal, Estado de México**.

- Proyecto de Participación Especial — Jornada Académica Empresarial, materia Probabilidad y Estadística.
- Docente: Mtra. Noemí Daniela Palacios Fermín.
- Autores (orden obligatorio, no alterar): **Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés**.
- Posicionamiento: COATL es un producto/herramienta en sí mismo (en el que se invierte), no una herramienta que los inversionistas usan para sus propias decisiones.

Idioma del proyecto: **español (México)** en UI, comentarios, commits y documentación.

## Estructura

```
index.html              App autocontenida (punto de entrada; GitHub Pages)
assets/img/             Fotos postales y mapa de contexto
assets/vendor/          PNGs de Leaflet vendorizados
assets/coatl-i18n.js    Script de i18n
docs/                   Especificación del modelo y notas
entregables/            Reporte Word, presentación PPTX, diagramas
scripts/                Generadores (Python/Node) de figuras y documentos
.github/workflows/      Deploy a GitHub Pages
```

## Stack

- HTML/CSS/JS autocontenido (originalmente React/Vite empaquetado). Sin backend.
- Leaflet **1.9.4** (cdnjs) + OpenStreetMap / satélite; Chart.js **4.4.1** (jsDelivr); Google Fonts.
- Deploy: GitHub Pages vía GitHub Actions (`.nojekyll` presente).
- Documentos: `docx` (Node), `pptxgenjs`, Sharp, matplotlib, LibreOffice headless, `pdftoppm`.

## Modelo estadístico (NO cambiar sin validar contra el escenario de referencia)

1. **Regresión logística** → probabilidad base de éxito con coeficientes β por variable.
2. **Supervivencia tipo Cox**: tabla base S₀(t) × hazard ratio → curva de supervivencia.
3. **Monte Carlo**: RNG `mulberry32` (semilla fija, reproducible) + **Box-Muller** para normales. Escenarios P5 / mediana / P95.
4. **Finanzas**: VPN, ROI, payback (meses).
5. **FODA dinámico**: 9 estrategias cuantificadas con sensibilidad real ΔP (se recalcula P moviendo cada palanca).

Funciones núcleo en `index.html`: `modeloLogistico`, `monteCarlo`, `curvaSupervivencia`, `palancas`, `clasificarFODA`, `pintarKPIs`.

Alcance funcional: 35 giros de negocio, 32 variables en 4 pestañas, 6 zonas con polígonos de color en el mapa.

### Escenario de referencia (prueba de regresión)

**Cafetería · Los Héroes** (valores por defecto) debe dar:

| Métrica | Valor |
|---|---|
| P(supervivencia 3 años) | 55.0 % |
| Utilidad mensual | ≈ $41,899 |
| ROI | 212.6 % |
| Payback | 6 meses |
| VPN | $601,442 |

Cualquier cambio en el modelo debe reproducir estos números o documentar explícitamente por qué cambian.

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
# Servir localmente
python -m http.server 8000      # → http://localhost:8000
```

Antes de dar algo por terminado: abrir la página, revisar consola sin errores, y comprobar el escenario de referencia.

## Gotchas de la cadena de entregables

- **Sharp**: `.composite()` y `.resize()` en llamadas separadas (componer a buffer → nueva instancia → resize). Encadenarlos falla en silencio o da error de dimensiones.
- **Sharp + SVG**: rasteriza según `viewBox`, no `width/height` → siempre `.resize(w, h)` explícito.
- **pptxgenjs**: objeto `shadow` nuevo por elemento (referencias compartidas rompen).
- **docx / OOXML**: respetar el orden de bordes de párrafo; callouts simples para pasar validación.
- Flujo de presentación: SVG en Python → Sharp → pptxgenjs → LibreOffice headless a PDF → `pdftoppm` para QA lámina por lámina.

## Pendiente

- Diagrama de proceso estilo UML con 6 carriles (Entrada → Determinista → Probabilístico → Simulación → Rentabilidad → Decisión/FODA), rombos de decisión, guardas, bucles de retroalimentación y fórmulas embebidas. Quedó a medias.
