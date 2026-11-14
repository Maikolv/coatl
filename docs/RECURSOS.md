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
| Fuentes | Google Fonts: Bricolage Grotesque, Hanken Grotesk, Spline Sans Mono (OFL 1.1; copias TTF en `assets/fuentes/` para Word y video) |
| Voz del video | Síntesis de voz de Windows, voz «Microsoft Sabina» (español de México) |

## Fotos de escenarios (v8)

Descargadas de Wikimedia Commons con `node scripts/fotos_sync.mjs`, recortadas a 3:2 y convertidas a WebP. Cada una aparece en **un solo lugar** del sitio; el build falla si alguna se repite.

| Dónde aparece | Foto | Autor | Licencia |
|---|---|---|---|
| Territorio · movilidad | [Mexibús Línea 2, estación Coacalco Berriozábal](https://commons.wikimedia.org/wiki/File:Coacalco_Berrioz%C3%A1bal_(Mexib%C3%BAs_L2)_2.jpg) | Tbhotch | [CC BY-SA 2.5 mx](https://creativecommons.org/licenses/by-sa/2.5/mx/deed.en) |
| Territorio · comercio regional | [Coacalco Power Center sobre la Vía López Portillo](https://commons.wikimedia.org/wiki/File:Coacalco_Power_Center_(2024)_1.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Territorio · comercio de barrio | [Calle Chiapas, San Francisco Coacalco](https://commons.wikimedia.org/wiki/File:Calle_Chiapas,_San_Francisco_Coacalco,_Mexico_2011_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Territorio · cultura y turismo | [Museo del Mamut de Coacalco](https://commons.wikimedia.org/wiki/File:Museo_del_Mamut,_Coacalco.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Inicio · widget de clientes | [Cafetería en Coacalco (escenario de referencia: cafetería)](https://commons.wikimedia.org/wiki/File:Tim_Hortons_Coacalco.jpg) | Axel Arias | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Metodología · cómo leer tu resultado | [Plaza Coacalco](https://commons.wikimedia.org/wiki/File:Plaza_Coacalco_(2022).jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| DENUE · competencia | [Zentralia Coacalco](https://commons.wikimedia.org/wiki/File:Zentralia_Coacalco_2.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Empresas | [Plaza Las Flores, Villa de las Flores](https://commons.wikimedia.org/wiki/File:Plaza_Las_Flores_Coacalco_1.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Estrategia · plan de acción | [Vista aérea de San Rafael, Coacalco](https://commons.wikimedia.org/wiki/File:San_Rafael,_Coacalco.jpg) | Sxmuelfernandez | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Simulador · escenario | [Plaza La Era, Coacalco](https://commons.wikimedia.org/wiki/File:La_Era_Coacalco.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Aviso legal | [Vista hacia el valle desde Puerta Coacalco](https://commons.wikimedia.org/wiki/File:Puerta_Coacalco)Vista_hacia_el_valle_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
