# Recursos gráficos, datos y servicios citados

## Fotografías reales de las zonas

Todas provienen de Wikimedia Commons (originalmente Panoramio), con licencia **CC BY 3.0**. Autor: **ArCaRa**. Se recortaron, se ajustaron el contraste, el color y la nitidez, y se convirtieron a WebP (`assets/img/zonas/`). La cita aparece en tamaño mínimo sobre cada foto.

| Zona | Archivo original |
|---|---|
| Corredor López Portillo | [Plaza Coacalco](https://commons.wikimedia.org/wiki/File:Plaza_Coacalco._-_panoramio.jpg) |
| Centro (San Francisco) | [Cúpula octagonal — San Francisco](https://commons.wikimedia.org/wiki/File:C%C3%BApula_octagonal-San_Francisco-Koakalko._-_panoramio.jpg) |
| Villa de las Flores | [Jardín triangular en Villa de las Flores](https://commons.wikimedia.org/wiki/File:Jard%C3%ADn_Triangular_en_villa_de_las_flores_cuidado_con_amor_por_dos_entusiastas_mujeres_de_la_comunidad._-_panoramio.jpg) |
| Los Héroes | [Los Héroes, Coacalco](https://commons.wikimedia.org/wiki/File:Los_Heroes-Koakalko._-_panoramio.jpg) |
| Potrero · San Rafael | [Andador Luis Donaldo Colosio](https://commons.wikimedia.org/wiki/File:Andador_Luis_Donaldo_Colosio._-_panoramio.jpg) |
| Periferia norte | [Última parcela en Coacalco](https://commons.wikimedia.org/wiki/File:Ultima_Parcela_en_Coacalco._-_panoramio.jpg) |
| Contexto (agregada por Codex) | [Palacio Municipal de Coacalco](https://commons.wikimedia.org/wiki/File:Coacalco_Estado_Mexico.JPG): ProtoplasmaKid, CC BY-SA 4.0 |

## Visualizaciones propias (sin bibliotecas 3D)

| Recurso | Técnica |
|---|---|
| Mapa 2.5D de zonas (Inicio) | SVG con las formas del esquema del equipo, proyección oblicua, extrusión por capas (altura = P) y foto real como textura |
| Superficie de sensibilidad (Simulador) | Rejilla 9×9 en CSS 3D, con vista plana equivalente |
| Supervivencia en capas, probabilidad de meta, tornado, histograma | SVG y Chart.js 4.4.1 |
| Mapa real | Leaflet 1.9.4 con OpenStreetMap y Esri World Imagery |

## Datos

- INEGI: DENUE (descarga masiva y API), Demografía de los Negocios 1989–2019 y Censo de Población y Vivienda 2020.
- CONEVAL: pobreza municipal 2020.
- Gobierno de Coacalco: datos económicos 2013–2020.

Detalle y verificación en `docs/VERIFICACION_DATOS.md` y `docs/DENUE.md`.

## Servicios y bibliotecas

| Servicio | Uso |
|---|---|
| Leaflet 1.9.4, Chart.js 4.4.1, SheetJS 0.18.5 | cdnjs, con SRI |
| `@anthropic-ai/sdk` 1.3.0 | Intérprete opcional con Claude (jsDelivr) y `npm run asistente` |
| Reconocimiento de voz | Web Speech API del navegador |
| Fuentes | Google Fonts: Bricolage Grotesque, Hanken Grotesk, Spline Sans Mono |
