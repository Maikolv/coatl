# COATL · Cálculo de Oportunidad y Análisis Territorial Local

Simulador estadístico que estima la **probabilidad de que un negocio siga operando y sea rentable al tercer año** y su **rentabilidad esperada** en Coacalco de Berriozábal, Estado de México. Declara sus supuestos y su incertidumbre en lugar de prometer certeza.

**Sitio:** https://maikolv.github.io/coatl/

**Autores:** Miguel Antonio Cruz García · Bruno Alejandro López Bautista · Alonso Arroyo Cortés
**Materia:** Probabilidad y Estadística · Mtra. Noemí Daniela Palacios Fermín · Jornada Académica Empresarial 2026

![Inicio de COATL: página completa](docs/capturas/inicio.png)

## Qué hace

| Bloque | Resultado |
|---|---|
| Modelo logístico | P(éxito a 3 años) con su **rango plausible P5–P95** y un tornado de β por variable |
| Supervivencia tipo Cox | Curva S(t) a 10 años con banda, comparada con la nacional del INEGI |
| Monte Carlo (2,000 años, semilla fija) | Histograma con P5 · mediana · P95 y P(utilidad > 0) |
| Finanzas | Utilidad, punto de equilibrio, ROI, payback y VPN a 3 años (antes de impuestos) |
| Mapa | Mapa real (Leaflet) con las 70 AGEB oficiales del INEGI agrupadas en seis zonas, ranking y comparador |
| FODA dinámico | Nueve estrategias con ΔP real y plan de acción |
| Recorrido exploratorio | Widget de inicio, mapa real por zona, supervivencia por año, meta de Monte Carlo, superficie de sensibilidad y trazabilidad a la fuente ([docs/WIDGETS.md](docs/WIDGETS.md)) |
| DENUE nacional | 6.1 millones de establecimientos de las 32 entidades, sincronizados cada semana con la descarga oficial del INEGI ([docs/DENUE.md](docs/DENUE.md)) |
| Para empresas | Carga confidencial de CSV/Excel: el análisis corre solo en el navegador, con bootstrap de los meses propios |
| Herramientas | Comparar 3 escenarios, compartir por URL, exportar PNG/PDF, restablecer referencia |

### Capturas completas por apartado

Cada imagen es la página entera, sin cortes (`node scripts/capturas.mjs --sitio`).

<details><summary><b>Simulador</b> · página completa</summary>

![Simulador](docs/capturas/simulador.png)

</details>

<details><summary><b>Territorio</b> · página completa</summary>

![Territorio](docs/capturas/territorio.png)

</details>

<details><summary><b>DENUE</b> · página completa</summary>

![DENUE](docs/capturas/denue.png)

</details>

<details><summary><b>Empresas</b> · página completa</summary>

![Empresas](docs/capturas/empresas.png)

</details>

<details><summary><b>Estrategia</b> · página completa</summary>

![Estrategia](docs/capturas/estrategia.png)

</details>

<details><summary><b>Metodología</b> · página completa</summary>

![Metodología](docs/capturas/metodologia.png)

</details>

## Funciones principales (v8)

- **IA de COATL sin clave para el visitante**: el asistente y «Describe tu negocio» usan Gemini con la clave del proyecto, guardada en un intermediario de Vercel ([docs/GEMINI.md](docs/GEMINI.md)); sin red, responde el motor local.
- **Mapa real en Inicio y en el Simulador**: el esquema del equipo se retiró; ambos usan las AGEB oficiales del INEGI.
- **Fotos reales de Coacalco por escenario**: once fotos nuevas de Wikimedia Commons con su licencia, ninguna repetida (el build lo impide).
- **Pestañas reordenables**: arrastra el asa ⠿ o usa ← → para ordenar los apartados abiertos.
- **Simulador sin huecos**: el formulario acompaña a los resultados al desplazarte y los paneles se acomodan en rejilla.
- **Ruta hacia mayor precisión**: métodos con datos reales y referencias verificadas en [docs/METODOS_PRECISION.md](docs/METODOS_PRECISION.md).

- **Contraste con el censo**: cada giro se compara con los negocios reales de Coacalco (INEGI, Censos Económicos 2019) y se puede aplicar esa referencia.
- **Mapa con límites oficiales**: las 70 AGEB urbanas del INEGI agrupadas en las seis zonas.
- **Accesibilidad verificada**: axe-core WCAG 2.1 AA sin violaciones en todos los apartados ([docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md)).

- **Asistente siempre disponible** (botón 💬 en la esquina inferior derecha de todas las páginas): dice cómo vas, qué zona conviene y qué palancas suben tu probabilidad con el mismo motor; ajusta el simulador por texto o voz y te lleva a cualquier apartado. Responde preguntas libres con la **IA de COATL** (Gemini, con la clave del proyecto guardada en un intermediario de Vercel; el visitante no pone ninguna clave). Detalles en [docs/GEMINI.md](docs/GEMINI.md).
- **Giros sin límite**: los 35 calibrados, las 989 actividades del SCIAN o cualquier nombre que escribas (giro propio con la plantilla más parecida, rotulada «estimación del equipo»).

![Asistente](docs/capturas/asistente.png)

- **Páginas por apartado**: Inicio, Territorio, DENUE, Simulador, Empresas, Estrategia, Metodología y Legal. Cada uno tiene su propia dirección (`#simulador`, `#denue`…), y `?vista=todo` muestra el sitio completo en una sola página.
- **Describe tu situación**: escribe o dicta tu negocio y el simulador ajusta los parámetros. El intérprete local funciona sin conexión; Claude es opcional, con tu propia clave.
- **989 actividades del SCIAN** como giros, cada una con su competencia real del DENUE, más costos fijos propios sin límite.
- **Pestañas de apartados**: cada apartado que abres queda como pestaña dentro de COATL (cambiar y cerrar, como en un navegador).
- Fotos reales de cada zona y de escenarios de Coacalco ([docs/RECURSOS.md](docs/RECURSOS.md)).
- **Asistente de IA del repositorio**: `npm run asistente` (requiere `ANTHROPIC_API_KEY` o `ant auth login`).
- **Acceso directo**: `iniciar.bat` levanta el sitio en `http://127.0.0.1:8000`; el ícono está en `assets/icono/coatl.ico`.

## Cómo correr

Requisito: Node 18+ (Python 3 es opcional, para la validación cruzada).

```bash
npm install          # solo para pruebas e2e (Playwright)
npm run build        # src/ → index.html y dist/index.html autocontenidos
npm run servir       # http://127.0.0.1:8000
```

`index.html` también funciona abierto directamente o con `python -m http.server 8000`.

## Cómo probar

```bash
npm test                                  # 12 pruebas unitarias del modelo (node:test)
python scripts/validar_modelo.py          # reimplementación independiente en Python
npx playwright install chromium && npm run test:e2e   # 19 pruebas e2e × escritorio y móvil
```

En Windows, las e2e usan Microsoft Edge (`COATL_CANAL=msedge`) porque el Chromium descargado puede estar bloqueado por el sistema. En CI usan Chromium.

### Escenario de referencia (Cafetería · Los Héroes, valores por defecto)

| P (3 años) | Rango plausible | Utilidad/mes | ROI | Payback | VPN 3 años |
|---|---|---|---|---|---|
| 51.6 % | 44.3 %–58.3 % | $60,371 | 302.9 % | 4 meses | $912,776 |

Los cambios frente a las versiones anteriores están en [docs/METODOLOGIA.md](docs/METODOLOGIA.md#escenario-de-referencia). Las fuentes de cada dato se verificaron en [docs/VERIFICACION_DATOS.md](docs/VERIFICACION_DATOS.md).

## Capturas de la terminal

Salida real de los comandos de verificación, sin editar; las generan `node scripts/capturas_terminal.mjs` al ejecutar cada comando. Las pruebas en navegador muestran solo su final.

**Construcción del sitio** · `npm run build`

![Construcción del sitio](docs/capturas/terminal/1-build.png)

**Pruebas unitarias del modelo y del intermediario de IA** · `npm test`

![Pruebas unitarias](docs/capturas/terminal/2-pruebas-unitarias.png)

**Validación cruzada del modelo en Python** · `python scripts/validar_modelo.py`

![Validación en Python](docs/capturas/terminal/3-validador-python.png)

**Auditoría de dependencias** · `npm audit`

![Auditoría de dependencias](docs/capturas/terminal/4-auditoria-dependencias.png)

**Pruebas en navegador: computadora, teléfono y accesibilidad** · `npm run test:e2e`

![Pruebas en navegador](docs/capturas/terminal/5-pruebas-navegador.png)

## Estructura

```
src/
  datos/datos.js        giros, zonas, S₀(t), estacionalidad, supuestos de incertidumbre
  modelo/modelo.js      logístico, rango de P, Cox, Monte Carlo (sin DOM, probado)
  modelo/finanzas.js    ROI, payback, VPN
  ui/                   formulario, resultados, widgets, estilos
  mapa/mapa.js          mapa SVG + Leaflet
  index.html            plantilla
scripts/                build, servidor, validador Python, diagrama UML, capturas
tests/                  unitarias (node:test) y e2e (Playwright)
docs/                   AUDITORIA, METODOLOGIA, diagrama de proceso, capturas
entregables/            documento técnico y reporte Word, video, presentación PPTX/PDF, pitch y diagrama
```

## Entregables

- [Documento técnico (Word)](entregables/COATL_Documento_Tecnico.docx): cómo funciona COATL, de dónde sale la información y cómo se construyó.
- [Video para evaluadores](entregables/COATL_Video.mp4), con narración y subtítulos ([.srt](entregables/COATL_Video.srt)).
- [Reporte técnico (Word)](entregables/COATL_Reporte.docx) y [presentación](entregables/COATL_Presentacion.pptx).

Se regeneran con `node scripts/documento_tecnico_docx.mjs`, `node scripts/video_presentacion.mjs` y `node scripts/reporte_docx.mjs`.

## Metodología

Fichas con fórmulas en [docs/METODOLOGIA.md](docs/METODOLOGIA.md) y diagrama de actividad UML en [docs/diagrama-proceso.svg](docs/diagrama-proceso.svg).

![Diagrama de proceso](docs/diagrama-proceso.png)

**Limitaciones:**
- Los β son supuestos del equipo, no estimaciones con microdatos.
- S₀(t) es la tabla nacional.
- Las cifras financieras son antes de impuestos.

Ningún resultado constituye asesoría financiera.

## Despliegue

En cada push a `main`, GitHub Actions corre el build, las pruebas unitarias, el validador Python y las e2e. Solo si todo pasa, publica `dist/` en GitHub Pages.

## Licencia

Todos los derechos reservados. Ver [LICENSE](LICENSE). Aviso legal conforme a la LFDA (arts. 11–13) y a la LFPDPPP: el sitio no recopila datos personales, no usa cookies ni analítica, y el escenario compartido viaja solo en el fragmento `#` de la URL.
