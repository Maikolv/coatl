# Informe de rendimiento, recursos y auditoría (v18)

Fecha: 23 de noviembre de 2026. Todas las cifras vienen de mediciones guardadas en esta carpeta; ninguna es estimada.

## 1. Cómo se midió

| Medición | Herramienta | Dónde | Archivo |
|---|---|---|---|
| Laboratorio local | Lighthouse 12.2.1, perfil móvil predeterminado, Chrome headless `--disable-gpu`, `dist/` servido en 127.0.0.1 | Laptop Ryzen 7 3700U | `00-base.json`, `01-js-externo.json`, `02-fotos-diferidas.json`, `ab-*.json` |
| Sitio publicado | PageSpeed Insights, móvil | Servidores de Google | `psi-base.json` (y `psi-final.json` tras el deploy) |

Se repite con `node scripts/medir_lighthouse.mjs <etiqueta> [corridas]` (requiere `npm i lighthouse@12.2.1` en `.cache/lh`).

**Limitación de la medición local.** El índice de CPU de Lighthouse (`benchmarkIndex`) de la laptop varió entre 613 y 2098 en la misma sesión. Lighthouse simula un teléfono a partir de ese índice, así que la puntuación local cambia hasta 20 puntos sin tocar el código. Por eso:

- las comparaciones finas se hicieron con corridas intercaladas A/B (A, B, A, B…), cinco de cada una;
- la referencia para decidir si se cumple la meta de 70 es PageSpeed Insights, que corre en hardware estable.

El PR #6 reportó 51, LCP 3.72 s y TBT 5.87 s con una versión anterior y otro equipo; no es comparable punto por punto con estas cifras.

## 2. Línea base y cambios, uno por uno

| Paso | Cambio | Puntuación | LCP | TBT | FCP | Decisión |
|---|---|---|---|---|---|---|
| 00 | Base local (JS 318 KB y foto en base64 dentro del HTML de 597 KB) | 46 | 6.99 s | 0.93 s | 4.07 s | — |
| 01 | JS a `assets/js/coatl-<hash>.js` con `defer`; CSP sin `'unsafe-inline'` en scripts | 61 | 8.85 s | 0.26 s | 2.66 s | Se queda: FCP −1.4 s y TBT −0.67 s |
| 02 | Fotos del carrusel diferidas (solo la primera de Inicio es `eager`) y foto del Palacio como archivo | 44–52 | 4.90–4.97 s | 1.41–1.85 s | 2.12–2.93 s | Ver A/B |
| A/B | 01 contra 02, cinco corridas intercaladas | A 44 · B 45 | A 4.98 s · B 4.89 s | A 1.80 s · B 1.92 s | — | Se queda B: no empeora y baja ≈1.2 MB de imágenes iniciales |
| 03 | Puntos del carrusel con área táctil de 24 px | — | — | — | — | Corrige la única auditoría de accesibilidad que fallaba |

En el paso 00, el hilo principal gastaba 5.6 s en analizar, dar estilo y maquetar el documento, y solo 0.56 s en ejecutar scripts. Por eso se empezó por sacar el JS y el base64 del HTML, que pasó de 597 KB a 220 KB.

El LCP local del paso 01 (8.85 s) sube porque, sin el JS bloqueando, el mayor elemento pasa a ser una foto del carrusel que se descargaba junto con otras ocho. El paso 02 lo corrige.

## 3. Sitio publicado (PageSpeed Insights, móvil)

| Versión | Rendimiento | LCP | TBT | FCP | Speed Index | CLS | Accesibilidad | Prácticas | SEO |
|---|---|---|---|---|---|---|---|---|---|
| v17 (`c079078`), antes de estos cambios | **95** | 2.0 s | 0 ms | 2.0 s | 4.3 s | 0 | 97 | 100 | 100 |
| v18 (`06fada3`), después del deploy | **96** | 1.7 s | 50 ms | 1.7 s | 4.8 s | 0 | **100** | 100 | 100 |

Cada fila es una sola corrida de PSI, que varía unos puntos entre corridas. La diferencia de rendimiento (95 → 96) está dentro de ese ruido. Lo que sí se puede afirmar:

- LCP y FCP bajaron de 2.0 s a 1.7 s;
- accesibilidad pasó de 97 a 100;
- el HTML pesa 377 KB menos.

**La meta de 70 ya se cumplía en el sitio publicado.** Los cambios de esta versión reducen el peso inicial y corrigen la accesibilidad. No eran necesarios para alcanzar la meta.

**Siguiente cuello de botella** (según el mismo informe de PSI):

- caché corta de GitHub Pages, ≈1.3 MB recuperables, que no se controla desde el repositorio;
- entrega de imágenes, ≈850 KB (fotos más grandes que su tamaño mostrado);
- ≈40 KB de JS y ≈30 KB de CSS sin usar en la primera vista.

## 4. Matriz de recursos

| Recurso | Origen | Licencia | Versión | Hash (sha256, 16) | Ruta local | Dónde se usa | Prueba | Estado |
|---|---|---|---|---|---|---|---|---|
| Leaflet JS | cdnjs | BSD-2-Clause | 1.9.4 | SRI sha384-cxOPjt7s… | CDN | Mapa de zonas | e2e del mapa | En uso |
| Leaflet CSS | npm leaflet | BSD-2-Clause | 1.9.4 | 337bfca5cabd03b3 | `assets/vendor/leaflet-1.9.4.css` (dentro del estilo) | Mapa | e2e del mapa | En uso |
| Chart.js | cdnjs | MIT | 4.4.1 | SRI sha384-bs/nf9Fb… | CDN | Gráficas del simulador | e2e de referencia | En uso |
| qrcode-generator | npm (Kazuhiko Arase) | MIT | 1.4.4 | 18ae399f81182bc9 | `assets/vendor/qrcode-generator-1.4.4.js` | QR del reporte | e2e del reporte | En uso |
| Bricolage Grotesque | @fontsource-variable | OFL-1.1 | variable | a756882d8a7802eb / e1a04c169c022f63 | `assets/fuentes/web/` | Títulos, documentos, video | build y capturas | En uso |
| Hanken Grotesk | @fontsource-variable | OFL-1.1 | variable | e9201eddf1d41d0b / 768af2923e0ab154 | `assets/fuentes/web/` | Texto | build y capturas | En uso |
| Spline Sans Mono | @fontsource-variable | OFL-1.1 | variable | 46b7dcafe3e51dbe / 0ca9a3989044d1f9 | `assets/fuentes/web/` | Cifras | build y capturas | En uso |
| JS de COATL | propio | del equipo | v18 | e204c065965e29d0 | `assets/js/coatl-e204c06596.js` | Todo el sitio | unitarias, e2e y axe | Nuevo en v18 |
| Fotos de escenarios y carruseles | Wikimedia Commons y otras (ver créditos) | CC BY / CC BY-SA | — | — | `assets/img/` | Inicio, Territorio | el build falla si una foto se repite | En uso |
| Voces del video | grabaciones del equipo | del equipo | 2026-11 | — | `entregables/voces/` (no se versiona) | `entregables/COATL_Video.mp4` | revisión de cuadros | 19 de 19 escenas |
| Lighthouse | npm | Apache-2.0 | 12.2.1 | — | `.cache/lh/` (no se versiona) | `scripts/medir_lighthouse.mjs` | este informe | Herramienta |
| faster-whisper (modelo «small») | PyPI / Hugging Face | MIT | — | — | `.cache/audios/` (no se versiona) | Transcribir las voces para los subtítulos | revisión de cuadros | Herramienta |

**DENUE.** COATL ya usa la descarga masiva oficial del INEGI con `.github/workflows/denue.yml` (semanal; última corrida exitosa: 16 de noviembre de 2026). Guarda 6,138,075 establecimientos en conteos agregados y nunca datos de contacto. La API con token solo serviría para validar lo que ya da la descarga, así que no se agregó una segunda integración.

## 5. Cambios de la auditoría v18

1. Las voces del equipo están en las 19 escenas del video, con subtítulos que siguen lo que se dijo (`entregables/voces/NN-escena.txt`).
2. Las escenas 15 (versiones) y 17 (limitaciones) se regrabaron con el guion vigente; ambas las narra Miguel.
3. El JS sale del HTML a un archivo con hash y `defer`. La CSP ya no permite scripts en línea.
4. Las fotos fuera de la primera vista se cargan en diferido.
5. Los puntos del carrusel tienen un área táctil de 24 px (WCAG 2.5.8). El punto activo crece sin invadir el área de sus vecinos.
6. Error encontrado por el CI y corregido: al separar el JS, los marcadores `@@IA_URL@@` y `/*@@VALIDACION@@*/` quedaban sin llenar. Eso rompía la IA de COATL (404) y dejaba vacío el panel de validación. Ahora el build falla si queda algún marcador en el JS.
7. `scripts/video_presentacion.mjs` copia solo archivos de fuentes. Antes fallaba con la carpeta `web/`.
8. `scripts/medir_lighthouse.mjs` permite repetir cada medición de este informe.
