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
| Carrusel · Territorio | [Mexibús Línea 2, estación Coacalco Berriozábal](https://commons.wikimedia.org/wiki/File:Coacalco_Berrioz%C3%A1bal_(Mexib%C3%BAs_L2)_2.jpg) | Tbhotch | [CC BY-SA 2.5 mx](https://creativecommons.org/licenses/by-sa/2.5/mx/deed.en) |
| Carrusel · Territorio | [Coacalco Power Center sobre la Vía López Portillo](https://commons.wikimedia.org/wiki/File:Coacalco_Power_Center_(2024)_1.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Territorio | [Calle Chiapas, San Francisco Coacalco](https://commons.wikimedia.org/wiki/File:Calle_Chiapas,_San_Francisco_Coacalco,_Mexico_2011_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Carrusel · Territorio | [Museo del Mamut de Coacalco](https://commons.wikimedia.org/wiki/File:Museo_del_Mamut,_Coacalco.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Inicio · widget de clientes | [Cafetería en Coacalco (escenario de referencia: cafetería)](https://commons.wikimedia.org/wiki/File:Tim_Hortons_Coacalco.jpg) | Axel Arias | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Plaza Coacalco · Corredor Vía López Portillo](https://commons.wikimedia.org/wiki/File:Plaza_Coacalco_(2022).jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Territorio | [Zentralia Coacalco](https://commons.wikimedia.org/wiki/File:Zentralia_Coacalco_2.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Territorio | [Plaza Las Flores, Villa de las Flores](https://commons.wikimedia.org/wiki/File:Plaza_Las_Flores_Coacalco_1.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Vista aérea de San Rafael · zona Potrero–San Rafael](https://commons.wikimedia.org/wiki/File:San_Rafael,_Coacalco.jpg) | Sxmuelfernandez | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Territorio | [Plaza La Era, Coacalco](https://commons.wikimedia.org/wiki/File:La_Era_Coacalco.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Vista hacia el valle desde Puerta Coacalco · Sierra de Guadalupe](https://commons.wikimedia.org/wiki/File:Puerta_Coacalco)Vista_hacia_el_valle_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Carrusel · Inicio | [Iglesia de San Francisco · Centro de Coacalco](https://commons.wikimedia.org/wiki/File:Iglesia_San_Francisco_Coacalco_Mexico.JPG) | ProtoplasmaKid | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Iglesia en Coacalco](https://commons.wikimedia.org/wiki/File:Coacalco_Iglesia.jpg) | GenezisLr | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Coacalco al pie de la Sierra de Guadalupe](https://commons.wikimedia.org/wiki/File:Coacalco_de_Berrioz%C3%A1bal.jpg) | Sxmuelfernandez | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Carrusel · Inicio | [Paraje Xolo · Sierra de Guadalupe](https://commons.wikimedia.org/wiki/File:Paraje_%22Xolo%22_-_Coacalco_-_M%C3%A9xico_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Carrusel · Inicio | [Atardecer desde Puerta Coacalco](https://commons.wikimedia.org/wiki/File:Aurora_en_%22Puerta_Coacalco%22_-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| Carrusel · Inicio | [Comercio de calle: La BTK, Coacalco](https://commons.wikimedia.org/wiki/File:La_BTK_Coacalco.jpg) | Tbhotch | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Carrusel · Inicio | [Universidad ETAC, campus Coacalco](https://commons.wikimedia.org/wiki/File:ETAC-_UNIVERSIDAD_CAMPUS_COACALCO._-_panoramio.jpg) | ArCaRa | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
