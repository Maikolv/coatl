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

El tema oscuro se retiró en v7 (ver §7).

## 7. Auditoría de mejora v7 (13 de noviembre de 2026)

Revisión automática de los 8 apartados en escritorio (1366 px) y móvil (375 px): sección visible correcta, ningún lienzo, SVG o imagen sin tamaño, ningún widget en estado de error, sin desbordamiento horizontal y **cero errores de consola**. Suite: 12 unitarias, validador Python y e2e en dos viewports; escenario de referencia intacto (51.6 %, $60,371, ROI 302.9 %, payback 4.1, VPN $912,776).

| # | Hallazgo | Acción |
|---|---|---|
| 1 | Los apartados se abrían uno a la vez, sin memoria de lo visitado | ✅ Pestañas dentro del proyecto: cada apartado abierto queda en una tira, se cambia y se cierra; persiste en la sesión |
| 2 | En móvil la navegación ocupaba tres renglones fijos (≈ 30 % de la pantalla) | ✅ Barra de una línea con desplazamiento horizontal; la pestaña activa se centra sola |
| 3 | Modo oscuro: doble mantenimiento de estilos (≈ 40 reglas) y contraste no auditado | ✅ Retirado por decisión del equipo; queda solo la identidad visual fija |
| 4 | El botón del asistente tapaba contenido en móvil | ✅ En móvil se reduce a icono |
| 5 | Prueba de desbordamiento intermitente (medía durante la animación de entrada) | ✅ Ahora mide con el diseño estable |
| 6 | Prueba de Empresas fallaba en móvil al aplicar (la app cambia al Simulador) | ✅ Vuelve al apartado antes de borrar |

Mejoras recomendadas en v7, ya hechas (v7.1):
- **Accesibilidad:** axe-core en los 8 apartados y en el asistente, escritorio y móvil, con 0 violaciones WCAG 2.1 AA; correcciones de contraste y teclado. La revisión con lector de pantalla real queda como guía para el equipo en docs/ACCESIBILIDAD.md (no se puede automatizar).
- **Calibración por giro:** contraste con los Censos Económicos 2019 del INEGI (Coacalco, negocios de 0 a 10 personas) para 31 de 35 giros: ventas anuales, costo directo, personal y renta por negocio, con botón para aplicarlos. Hallazgo: el escenario de referencia de la cafetería vende 3.6 veces lo que vende la cafetería promedio de Coacalco (88,705 al año en 2018). Los valores por defecto no se cambiaron para conservar el escenario de referencia; ver docs/METODOLOGIA.md.
- **Zonas con límites oficiales:** las 70 AGEB urbanas de Coacalco (INEGI, Marco Geoestadístico dic. 2025; 293,245 habitantes del Censo 2020) se dibujan en el mapa agrupadas en las 6 zonas; la agrupación sigue siendo del equipo.

## 8. Auditoría v7.3 (13 de noviembre de 2026)

Verificación: build idéntico, 12 unitarias, validador Python, e2e completas en escritorio y móvil (incluye axe), CI verde, sitio publicado y DENUE con token válido (API 11,557 frente a 11,554 de la descarga).

| # | Hallazgo | Acción |
|---|---|---|
| 1 | La IA de pago (Claude) era la única opción para preguntas libres | ✅ Gemini gratuito en el asistente y en «Describe tu negocio» (REST, `store:false`) |
| 2 | Errores de Gemini mostraban solo el código HTTP | ✅ Mensajes claros (clave inválida, sin permiso, límite gratuito, sin conexión) y tiempo límite de 45 s |
| 3 | Si `gemini-3.8-flash` no está disponible en la cuenta, fallaba | ✅ Respaldo automático a `gemini-3.5-flash-lite` ante 404 |
| 4 | Sin JSON estricto, Gemini podía mandar tipos inválidos | ✅ `deJSON` acepta solo textos en giro/zona y números finitos |
| 5 | `docs/SEGURIDAD.md` y `CLAUDE.md` decían `connect-src 'self'`, ya falso | ✅ Corregidos: qué destinos se permiten y qué se envía a la IA |
| 6 | Acciones de GitHub sobre Node 20, ya obsoleto | ✅ `checkout@v5`, `setup-node@v5`, `setup-python@v6` |
| 7 | Vulnerabilidad alta en `image-size` (vía `pptxgenjs` 3.12, solo desarrollo) | ✅ `overrides` acotado a `pptxgenjs` → `image-size` 2.1.0; `npm audit` en 0 vulnerabilidades; la presentación sigue generando 10 láminas (Fase 4 en `docs/REVISION_CODEX.md`) |
| 8 | Dependencias de desarrollo atrasadas (Playwright, axe, docx) | ✅ Playwright 1.65.1, axe 4.14.0 y docx 9.15.3. La nueva regla de axe `label-content-name-mismatch` detectó que el logo se anunciaba «COATL, inicio» aunque muestra otro texto; ahora su nombre es el texto visible |
| 9 | Gemini solo probado con respuestas simuladas | ⏳ Falta una prueba manual con una clave real (docs/GEMINI.md) |

Privacidad de Empresas: se agregó `tests/e2e/privacidad-ia.spec.js`, con clave y respuesta simuladas de Gemini. Comprueba que la petición del asistente excluya el nombre del archivo, el CSV completo y todos sus valores. Los puntos 7 y 8 se completaron después fuera del entorno de Codex; ver «Cierre de la Fase 4» en `docs/REVISION_CODEX.md`.

## 9. Auditoría v7.4: teléfono, documentos y video (13 de noviembre de 2026)

Nueva prueba `tests/e2e/orientacion.spec.js`: revisa los 8 apartados en teléfono vertical (390×844), horizontal (844×390) y horizontal pequeño (667×375), además de la rotación. Busca desbordes, elementos cortados y cuánto ocupa lo fijo arriba.

| # | Hallazgo | Acción |
|---|---|---|
| 1 | En vertical, el mapa, el ranking de zonas y la recomendación del Simulador se cortaban a la derecha (llegaban a 435 px en una pantalla de 390 px), porque una tabla ancha estiraba la columna | ✅ Las rejillas de una columna usan `minmax(0,1fr)`; la tabla conserva su propio desplazamiento |
| 2 | En horizontal, la barra superior y la tira de pestañas fijas ocupaban 167 de 375 px (45 % de la pantalla) | ✅ Con poca altura, la barra superior se desplaza con la página; solo la tira queda fija (46 px, 12 %) |
| 3 | La posición de la tira de pestañas no se recalculaba al girar el teléfono | ✅ Se recalcula en cada cambio de tamaño |
| 4 | El Simulador decía «22 variables»; el formulario tiene 32 | ✅ Corregido a 32 |
| 5 | Las notas pequeñas partían palabras a la mitad («escr-ibas»), por `word-break:break-all` | ✅ `overflow-wrap:anywhere`: solo parte lo que no cabe, como una URL larga |
| 6 | Las capturas del README y de los documentos mostraban la interfaz anterior a Gemini | ✅ Regeneradas |
| 7 | El reporte Word usaba Georgia y Calibri en vez de las tipografías del sitio | ✅ Usa Bricolage Grotesque, Hanken Grotesk y Spline Sans Mono, incrustadas |
| 8 | La presentación PPTX usa fuentes del sistema | ⏳ pptxgenjs no puede incrustar fuentes: si se cambiaran, en otra computadora se verían con una fuente de reemplazo. Se deja como está |
| 9 | No había un documento que explicara la construcción ni un video para evaluadores | ✅ `entregables/COATL_Documento_Tecnico.docx` y `entregables/COATL_Video.mp4` (con subtítulos `.srt`) |
| 10 | La pestaña «Territorio» de la tira y la orden al asistente «abre el territorio» llevaban a Inicio: `vistaDe()` solo buscaba elementos por id y la vista `territorio` no tiene uno | ✅ Primero reconoce el nombre de la vista; nueva prueba «cada apartado abre por su nombre» |
| 11 | Al corregir el desborde, las tablas de escenarios y de zonas se desplazan dentro de su caja en el teléfono, pero esa caja no se alcanzaba con teclado (axe: `scrollable-region-focusable`) | ✅ `tabindex="0"`, `role="region"` y nombre accesible, como las demás tablas |

## 10. v8: IA del proyecto, mapa real, fotos y simulador sin huecos (14 de noviembre de 2026)

| # | Hallazgo o petición | Acción |
|---|---|---|
| 1 | El asistente de IA exigía que cada visitante pusiera su propia clave | ✅ Intermediario `servicios/ia` en Vercel con la clave del proyecto (`GEMINI_API_KEY`); el sitio ya no pide clave. Reglas de origen, instrucciones fijas, `store:false`, tope de tokens y límite por IP, con pruebas (`tests/ia.test.mjs`). Respaldo local si no responde |
| 2 | Inicio usaba un mapa isométrico hecho por el equipo («composición esquemática») | ✅ Mapa real de Leaflet con las 70 AGEB del INEGI, el mismo del Simulador (`crearMapaZonas`) |
| 3 | El Simulador tenía un botón «Esquema del equipo» con un SVG dibujado a mano | ✅ Retirado; el ranking de zonas ahora se opera con teclado |
| 4 | La foto de Los Héroes aparecía dos veces en la misma pantalla de Inicio, y la del corredor en dos apartados | ✅ Once fotos nuevas de Wikimedia Commons, una por lugar; el build falla si una se repite |
| 5 | Territorio: la foto ocupaba media fila y dejaba la otra mitad en blanco | ✅ Galería: Palacio + cuatro escenas (Mexibús, Power Center, Calle Chiapas, Museo del Mamut) |
| 6 | Simulador: la columna del formulario terminaba 684 px antes que la de resultados | ✅ Formulario fijo (*sticky*) que acompaña a los resultados |
| 7 | Simulador: la tarjeta VPN dejaba media fila vacía; Comparar y Exportar quedaban con espacio sobrante junto al tornado | ✅ VPN a todo lo ancho; tornado a la izquierda y las dos tarjetas apiladas a la derecha |
| 8 | Tornado: «Margen de seguridad financiero» se cortaba («gen de seguridad…») | ✅ Etiquetas largas en varias líneas |
| 9 | Encabezados de DENUE, Simulador, Empresas, Estrategia y Aviso legal: solo texto, con espacio libre a la derecha | ✅ Una foto real de Coacalco en cada uno |
| 10 | Botón «Abrir simulador» en la barra superior (pedido del equipo) | ✅ Retirado |
| 11 | Las pestañas no se podían reordenar | ✅ Asa ⠿ para arrastrar (ratón o dedo) y flechas ←/→ con anuncio para lector de pantalla |
| 12 | Precisión: β y afluencia son estimaciones del equipo | 📄 Ruta con métodos y datos reales en `docs/METODOS_PRECISION.md` (panel del DENUE, Shumway, Kaplan–Meier, Huff, calibración, conformal) |
| 13 | El README no mostraba la salida real de las verificaciones | ✅ Sección «Capturas de la terminal» generada por `scripts/capturas_terminal.mjs` |
