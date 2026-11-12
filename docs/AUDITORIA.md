# Auditoría de COATL — Fase 1

Fecha: 12-nov-2026 · Versión auditada: commit `d69ae8d` («Importación inicial de COATL»), `index.html` de 133,645 bytes.
Alcance: solo lectura. No se cambió código de la aplicación.

## 0. Inventario (Fase 0)

| Archivo | Origen | Estado |
|---|---|---|
| `index.html` | `Downloads/COATL_index.html` | Ya viene desempaquetado (sin base64, sin rutas UUID). Leaflet 1.9.4 y Chart.js 4.4.1 desde cdnjs. |
| `entregables/COATL_Pitch_Inversionistas.pptx` | `Downloads/` | Copiado sin cambios. |
| Esqueleto (CLAUDE.md, README, workflow Pages, `.claude/commands/verificar.md`) | `coatl-claude-code.zip` | Copiado. |
| **No encontrados** | — | `COATL_Presentacion.pptx`, reporte `.docx`, fotos de `assets/img`, `assets/coatl-i18n.js`, PNGs de Leaflet, diagramas. El HTML no los referencia, así que la app funciona sin ellos. |

## 1. Validación del escenario de referencia

`scripts/validar_modelo.py` reimplementa el modelo en Python, incluido un port bit a bit de `mulberry32` y Box-Muller, y lo corre con los valores por defecto del formulario.

| Métrica | Referencia | Python | Resultado |
|---|---|---|---|
| P(supervivencia 3 años) | 55.0 % | 54.98 % (z = 0.200) | ✅ |
| Utilidad mensual | ≈ $41,899 | $41,898.96 | ✅ |
| ROI | 212.6 % | 212.56 % | ✅ |
| Payback | 6 meses | 5.97 meses | ✅ |
| VPN 3 años | $601,442 | $601,442.23 | ✅ |

Monte Carlo (semilla 20262, 2,000 corridas): media $531,395, DE $58,814, P2.5 $416,992, P5 $437,041, P50 $531,139, P95 $628,480, P97.5 $646,996, P(utilidad > 0) = 100 %.
La semilla es fija, así que los resultados se repiten en cada corrida y en ambos lenguajes.

## 2. Hallazgos priorizados

### Crítico
1. **Los β no se estimaron con datos.** `modeloLogistico` suma puntajes fijados a mano (giro, zona, experiencia, etc.) más un intercepto −0.16 y aplica la sigmoide. Funciona como un *scorecard* logístico, no como una regresión ajustada. Ningún β tiene fuente ni error estándar. → Hay que llamarlo «modelo logístico calibrado por supuestos» y marcar cada β como **supuesto del equipo**, o estimarlo con microdatos (por ejemplo de los Censos Económicos) si se consiguen.
2. **Sobre la promesa de «margen de error inexistente».** Es imposible y la app no debe sugerirla. Hoy P se muestra con un decimal («55.0 %») y sin intervalo, y P(utilidad > 0) sale en 100 %, lo que suena a certeza. → Mostrar P con un rango, por ejemplo 45–64 % si a z se le aplica una perturbación ±0.4 sobre los β, y explicar que el 100 % solo refleja la variabilidad de demanda y ticket, no el riesgo de modelo.

### Alto
3. **El Monte Carlo subestima la dispersión.** Los choques de clientes son independientes mes a mes (σ = 22 %), así que se compensan al sumar 12 meses (DE anual ≈ 11 % de la media). No hay choque común anual ni incertidumbre en costos fijos, renta o costo variable. → Agregar un factor de demanda anual común y ruido en el costo variable.
4. **P5 / mediana / P95.** CLAUDE.md habla de P5 / mediana / P95, pero la UI muestra P2.5–P97.5 y nunca la mediana ni P95 (P95 ni siquiera se calcula). → Unificar a P5/P50/P95 en la UI y en la documentación.
5. **Escenario por defecto ≠ «Cafetería».** El selector dice Cafetería (ticket $95, CV 38 %), pero los campos arrancan en ticket $85 y CV 45 % porque `change` no se dispara al cargar. El escenario de referencia depende de esa incongruencia. → Documentarlo. Corregirlo cambiaría todos los números de referencia, así que requiere tu decisión.
6. **ROI y payback mezclan bases.** El ROI usa la media del Monte Carlo (con rampa de crecimiento); el payback usa la utilidad determinista. Ninguno descuenta impuestos (ISR/RESICO), depreciación, sueldo del dueño ni capital de trabajo. → Declararlos como «antes de impuestos» y homologar la base.
7. **Supuesto de Cox.** `h = ln P / ln S0(3)` fuerza que S(3) = P. Es proporcionalidad de riesgos por construcción, no un Cox ajustado. → Documentarlo como supuesto.
8. **El workflow de Pages publica todo el repo** (`path: .`), incluidos `scripts/`, `entregables/`, `.claude/` y `CLAUDE.md`. → Publicar solo un `dist/`.

### Medio
9. **Datos sin fuente verificable:** `S0` dice «aprox. INEGI, EVN» pero los valores no tienen tabla ni año citado; afluencia y renta por zona están declaradas como estimación propia (bien); `dem`, `ticket` y `cv` por giro no tienen fuente. → Marcarlos «por verificar» y no inventar cifras.
10. **VPN:** horizonte de 3 años sin valor terminal ni de rescate; la inversión no se pondera por supervivencia (es una decisión defendible, pero hay que explicitarla).
11. **Seguridad:** sin SRI (`integrity`) en Leaflet, Chart.js ni su CSS; sin CSP; 16 asignaciones `innerHTML` (los datos son internos, riesgo bajo, pero conviene usar `textContent` donde se pueda). Chart.js viene de cdnjs aunque CLAUDE.md dice jsDelivr.
12. **Código:** todo en un `<script>` de ~800 líneas; las constantes del modelo están mezcladas con la UI; no hay pruebas. Falta `LICENSE`, aunque el README lo menciona.
13. **Offline:** depende de 3 CDN, Google Fonts y teselas OSM/Esri; sin red no hay gráficas ni mapa.

### Bajo
14. **Accesibilidad (revisión estática):** `lang="es"`, pestañas con `aria-selected` y `prefers-reduced-motion` respetado, todo correcto. Pendiente: roles `tablist/tab/tabpanel`, contraste del texto gris y del semáforo, alternativa textual del mapa y de las gráficas. Requiere una prueba en el navegador.
15. **SEO:** tiene `description` y `theme-color`; faltan Open Graph, `canonical` y favicon.
16. **Privacidad:** no usa `localStorage` ni analítica y el aviso LFPDPPP está presente. Las teselas de OSM/Esri reciben la IP del visitante, conviene mencionarlo en el aviso.

## 3. Cómo comunicar la incertidumbre (propuesta)
- Mostrar P como «≈55 % (rango plausible 45–64 %)» y explicar de dónde sale el rango.
- Agregar una ficha de «Supuestos y limitaciones»: β asignados por el equipo, S0 nacional aplicada a nivel municipal, cifras antes de impuestos, independencia mensual, fuentes por verificar.
- Fuentes a citar con hipervínculo verificado: INEGI DENUE, INEGI «Esperanza de vida de los negocios», Censo 2020, CONAPO, CONEVAL. Cada dato numérico sin fuente queda marcado como «estimación del equipo».

## 4. Plan de mejoras (Fase 2, rama `mejoras-profesionales`)
1. Estructura `src/{modelo,ui,mapa,datos}` con un build en Node (sin dependencias pesadas) que genere `dist/index.html` autocontenido; Pages publica solo `dist/`.
2. Pruebas: unitarias del modelo en Node (`node --test`) que reproduzcan el escenario de referencia, más `validar_modelo.py` como verificación cruzada y e2e con Playwright. CI con pruebas → build → deploy.
3. Widgets derivados del modelo: rango de P, tornado de β, histograma Monte Carlo con P5/P50/P95, curva S(t) con banda, punto de equilibrio, comparador de escenarios, comparador de zonas, exportar a PDF/PNG y escenario por URL.
4. Fichas de metodología con fórmulas, más la ficha de supuestos y limitaciones.
5. Diagrama UML de 6 carriles en `docs/` y `entregables/`.
6. SRI y CSP, `LICENSE`, README y CLAUDE.md actualizados.

**Decisiones pendientes del usuario:** (a) ¿corregir el hallazgo 5, aunque cambien los números de referencia? (b) ¿cambiar a P5/P50/P95 y agregar el choque anual común (hallazgo 3)? Esto también moverá ROI y P(utilidad > 0).

## 5. Herramientas usadas
Lectura directa del código, `scripts/validar_modelo.py` (Python vía `uv`) y comparación con `actinver-terminal`. El navegador integrado no estuvo disponible (revisión de política pendiente), así que todavía faltan la consola, Lighthouse y la prueba de accesibilidad en vivo. Se harán con Playwright en la Fase 2.

## 6. Resolución (Fase 2, rama `mejoras-profesionales`)

| # | Hallazgo | Estado |
|---|---|---|
| 1 | β sin estimar | Declarado como supuesto en la UI y en `docs/METODOLOGIA.md`; P se muestra con rango plausible |
| 2 | P sin incertidumbre | ✅ `rangoP()`: P5–P95 en KPIs, lectura, banda de supervivencia y comparador |
| 3 | Monte Carlo subestima dispersión | ✅ Choque anual común (σ = 0.15) y ruido de CV (±2 pp). La DE anual pasa de $58,814 a $179,399 |
| 4 | P5/P50/P95 | ✅ Cuantiles tipo 7. Además se corrigió un bug: el escenario «Optimista · P95» mostraba P97.5 |
| 5 | Defaults ≠ Cafetería | ✅ Ticket 95 y CV 38 % al cargar. **Nueva referencia:** P 55.0 %, utilidad $60,371, ROI 302.9 %, payback 4, VPN $970,106 |
| 6 | ROI/payback | Etiquetados «antes de impuestos» y con su base explícita |
| 7 | Supuesto de Cox | Documentado |
| 8 | Pages publica todo | ✅ Solo se publica `dist/`, después de las pruebas |
| 9 | Datos sin fuente | Marcados «por verificar» / «estimación del equipo» |
| 11 | SRI/CSP | ✅ SRI sha384 en Leaflet (JS y CSS) y Chart.js, más una CSP en meta |
| 12 | Código monolítico | ✅ `src/{datos,modelo,ui,mapa}` con build, 10 pruebas unitarias y 9 e2e × 2 viewports |
| — | `id="lectura"` duplicado (nuevo) | ✅ El panel pasó a `lecturaPanel` |
| 15 | SEO | ✅ Open Graph, `og:locale` y favicon SVG |

Sin cambios, a propósito: el «Modo Oráculo» (tema oscuro conmutable) ya existía y se conserva. CLAUDE.md rechaza *rediseños* neón/negro; este modo es opcional y no es el diseño base.
