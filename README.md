# COATL · Cálculo de Oportunidad y Análisis Territorial Local

Simulador estadístico que estima la **probabilidad de que un negocio siga operando y sea rentable al tercer año** y su **rentabilidad esperada** en Coacalco de Berriozábal, Estado de México. Declara sus supuestos y su incertidumbre en lugar de prometer certeza.

**Sitio:** https://maikolv.github.io/coatl/

**Autores:** Miguel Antonio Cruz García · Bruno Alejandro López Bautista · Alonso Arroyo Cortés
**Materia:** Probabilidad y Estadística · Mtra. Noemí Daniela Palacios Fermín · Jornada Académica Empresarial 2026

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

## Capturas del proyecto

Única sección con imágenes. Cada captura es la página completa del sitio publicado, sin cortes (`node scripts/capturas.mjs --sitio`).

<details open><summary><b>Inicio</b></summary>

![Inicio](docs/capturas/inicio.png)

</details>

<details><summary><b>Territorio</b></summary>

![Territorio](docs/capturas/territorio.png)

</details>

<details><summary><b>Simulador</b></summary>

![Simulador](docs/capturas/simulador.png)

</details>

<details><summary><b>Mapa real de zonas</b></summary>

![Mapa real de zonas](docs/capturas/mapa.png)

</details>

<details><summary><b>Asistente con IA</b></summary>

![Asistente con IA](docs/capturas/asistente.png)

</details>

<details><summary><b>DENUE</b></summary>

![DENUE](docs/capturas/denue.png)

</details>

<details><summary><b>Empresas</b></summary>

![Empresas](docs/capturas/empresas.png)

</details>

<details><summary><b>Estrategia</b></summary>

![Estrategia](docs/capturas/estrategia.png)

</details>

<details><summary><b>Metodología</b></summary>

![Metodología](docs/capturas/metodologia.png)

</details>

<details><summary><b>Diagrama de proceso (UML)</b></summary>

![Diagrama de proceso (UML)](docs/diagrama-proceso.png)

</details>

## Funciones principales (v12)

- **Llévate todo tu resultado**: un código QR abre en el teléfono el reporte completo (simulador y estrategia), listo para guardarse en PDF; el resultado viaja dentro del enlace.
- **PDF propio del plan** en Estrategia y video del proyecto en Inicio.
- **Documentos extensos** (documento técnico, reporte, presentación y libro de Excel) con el [historial completo de versiones](docs/VERSIONES.md), generados con `npm run entregables`.
- **Voces del equipo en el video**: pauta de grabación en [docs/GUION_VOCES.md](docs/GUION_VOCES.md).

- **Tu negocio con nombre**: escribe el nombre, guárdalo en «Mis negocios» (solo en tu navegador) y vuelve a él cuando quieras.
- **Mejora tu negocio**: alternativas con su efecto real en la probabilidad y botón para probarlas; diagnóstico de 5 niveles y 30 puntos con un borrador a tu medida en cada uno; estimación fiscal (RESICO o régimen general) y lista de obligaciones.
- **Modelo 2.5D del negocio**: dibujo isométrico generado con tus datos, «como está hoy» y «lo que puede llegar a ser» (SVG, sin WebGL).
- **Reporte propio en PDF e imagen**: solo lo relevante del negocio, con la identidad de COATL; la imagen sale a 3,200 px de ancho.
- **Plantilla de Excel con guía** para el apartado de empresas (`node scripts/plantilla_excel.mjs`).
- **Identidad en movimiento**: grecas que avanzan y carruseles de fotos en Inicio y Territorio, con botón para pausar el movimiento.
- **Stand físico**: tres propuestas de recursos en [docs/STAND.md](docs/STAND.md) y un encargo para Codex en [docs/PROMPT_CODEX_STAND.md](docs/PROMPT_CODEX_STAND.md).

- **IA de COATL sin clave para el visitante**: el asistente y «Describe tu negocio» usan Gemini con la clave del proyecto, guardada en un intermediario de Vercel ([docs/GEMINI.md](docs/GEMINI.md)); sin red, responde el motor local.
- **Mapa real en Inicio y en el Simulador**: el esquema del equipo se retiró; ambos usan las AGEB oficiales del INEGI.
- **Fotos reales de Coacalco por escenario**: once fotos nuevas de Wikimedia Commons con su licencia, ninguna repetida (el build lo impide).
- **Pestañas reordenables**: arrastra el asa ⠿ o usa ← → para ordenar los apartados abiertos.
- **Simulador sin huecos**: el formulario acompaña a los resultados al desplazarte y los paneles se acomodan en rejilla.
- **Ruta hacia mayor precisión**: métodos con datos reales y referencias verificadas en [docs/METODOS_PRECISION.md](docs/METODOS_PRECISION.md).

- **Contraste con el censo**: cada giro se compara con los negocios reales de Coacalco (INEGI, Censos Económicos 2019) y se puede aplicar esa referencia.
- **Mapa con límites oficiales**: las 70 AGEB urbanas del INEGI agrupadas en las seis zonas.
- **Accesibilidad verificada**: axe-core WCAG 2.1 AA sin violaciones en todos los apartados ([docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md)).

- **Asistente siempre disponible** (botón con globo y greca en la esquina inferior derecha de todas las páginas): dice cómo vas, qué zona conviene y qué palancas suben tu probabilidad con el mismo motor; ajusta el simulador por texto o voz y te lleva a cualquier apartado. Responde preguntas libres con la **IA de COATL** (Gemini, con la clave del proyecto guardada en un intermediario de Vercel; el visitante no pone ninguna clave). Detalles en [docs/GEMINI.md](docs/GEMINI.md).
- **Giros sin límite**: los 35 calibrados, las 989 actividades del SCIAN o cualquier nombre que escribas (giro propio con la plantilla más parecida, rotulada «estimación del equipo»).

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
| 51.6 % | 44.1 %–58.2 % | $60,371 | 302.9 % | 4 meses | $912,776 |

Los cambios frente a las versiones anteriores están en [docs/METODOLOGIA.md](docs/METODOLOGIA.md#escenario-de-referencia). Las fuentes de cada dato se verificaron en [docs/VERIFICACION_DATOS.md](docs/VERIFICACION_DATOS.md).

## Capturas de la terminal

Salida real de los comandos de verificación, como texto (sin imágenes). La actualiza `node scripts/capturas_terminal.mjs` al ejecutar cada comando.

<!-- terminal:inicio -->
_Generado el 2026-11-17._

<!-- t:build -->
**Construcción del sitio** · `npm run build` · código de salida 1 · 11.2 s

```text
$ npm run build

> coatl@2.0.0 build
> node scripts/build.mjs

node:fs:2483
    return binding.writeFileUtf8(
                   ^

Error: UNKNOWN: unknown error, open 'C:\Users\MIKE\Desktop\Repos\coatl\index.html'
    at Object.writeFileSync (node:fs:2483:20)
    at construir (file:///C:/Users/MIKE/Desktop/Repos/coatl/scripts/build.mjs:151:6)
    at file:///C:/Users/MIKE/Desktop/Repos/coatl/scripts/build.mjs:180:58
    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)
    at async node:internal/modules/esm/loader:643:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  errno: -4094,
  code: 'UNKNOWN',
  syscall: 'open',
  path: 'C:\\Users\\MIKE\\Desktop\\Repos\\coatl\\index.html'
}

Node.js v24.19.0
```
<!-- /t:build -->

<!-- t:unitarias -->
**Pruebas unitarias del modelo y del intermediario de IA** · `npm test` · código de salida 0 · 6.3 s

```text
$ npm test
… (se muestran las últimas 12 líneas)
✔ cobro de piso y variables emocionales: neutras por defecto, con efecto al usarlas (1.6311ms)
✔ v11 fiscal: tabla del RESICO (art. 113-E LISR), tope de 3.5 millones y régimen general (0.9413ms)
✔ v11 diagnóstico: 30 puntos en 5 niveles, pesos que suman 1 e índice de 0 a 100 (1.4452ms)
✔ referencia: rango plausible de P = 44.1–58.2 % (vigente desde v9) (60.0605ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1556.5671
```
<!-- /t:unitarias -->

<!-- t:validador -->
**Validación cruzada del modelo en Python** · `uv run --no-project python scripts/validar_modelo.py` · código de salida 0 · 0.9 s

```text
$ uv run --no-project python scripts/validar_modelo.py
z=0.0622  margen de seguridad=0.6910  fijos=27000.00
Monte Carlo: {'media': 757349.85, 'sd': 179398.86, 'p025': 449283.73, 'p05': 489097.41, 'p50': 744276.67, 'p95': 1072698.1, 'p975': 1149212.79, 'pPos': 1.0}
S(t): [1, 0.7503, 0.5666, 0.5155, 0.4785, 0.4492, 0.4247, 0.4038, 0.3854, 0.369, 0.3541]
OK  P        obtenido=0.5155  referencia=0.5155
OK  util     obtenido=60,370.7400  referencia=60,371
OK  roi      obtenido=3.0294  referencia=3.029
OK  payback  obtenido=4.1411  referencia=4
OK  vpn      obtenido=912,775.5843  referencia=912,776
```
<!-- /t:validador -->

<!-- t:auditoria -->
**Auditoría de dependencias** · `npm audit` · código de salida 1 · 5.9 s

```text
$ npm audit
# npm audit report

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix --force`
Will install exceljs@3.4.0, which is a breaking change
node_modules/uuid
  exceljs  >=3.5.0
  Depends on vulnerable versions of uuid
  node_modules/exceljs

2 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```
<!-- /t:auditoria -->

<!-- t:e2e -->
**Pruebas en navegador (computadora, teléfono y accesibilidad)** · `npx playwright test --reporter=line` · código de salida 1 · 470.4 s

```text
$ npx playwright test --reporter=line
… (se muestran las últimas 14 líneas)
[165/174] [movil] › tests\e2e\paginas.spec.js:359:1 › v10: aviso legal con uso aceptable, licencias (ODbL) y revisión profesional
[166/174] [movil] › tests\e2e\recorrido.spec.js:15:1 › el widget de inicio coincide con el motor y abre el simulador con su estado
[167/174] [movil] › tests\e2e\paginas.spec.js:368:1 › v11: nombre del negocio, guardado local, alternativas, diagnóstico, fiscal y modelo 2.5D
[168/174] [movil] › tests\e2e\recorrido.spec.js:27:1 › mapa de zonas: la lista se navega con teclado y la ficha muestra la procedencia
[169/174] [movil] › tests\e2e\recorrido.spec.js:40:1 › escenario vigente y restablecer referencia
[170/174] [movil] › tests\e2e\recorrido.spec.js:51:1 › el Worker y el respaldo síncrono reproducen la misma simulación
[171/174] [movil] › tests\e2e\recorrido.spec.js:74:1 › supervivencia por año y meta de Monte Carlo responden
[172/174] [movil] › tests\e2e\recorrido.spec.js:83:1 › superficie: lectura exacta, teclado y vista plana
[173/174] [movil] › tests\e2e\recorrido.spec.js:95:1 › trazabilidad: de un resultado a su fuente
[174/174] [movil] › tests\e2e\recorrido.spec.js:106:3 › movimiento reducido › la superficie arranca en vista plana con la misma información
  1 failed
    [escritorio] › tests\e2e\coatl.spec.js:11:1 › carga sin errores de consola y muestra el escenario de referencia 
  26 skipped
  147 passed (7.7m)
```
<!-- /t:e2e -->
<!-- terminal:fin -->

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


**Limitaciones:**
- Los β son supuestos del equipo, no estimaciones con microdatos.
- S₀(t) es la tabla nacional.
- Las cifras financieras son antes de impuestos.

Ningún resultado constituye asesoría financiera.

## Despliegue

En cada push a `main`, GitHub Actions corre el build, las pruebas unitarias, el validador Python y las e2e. Solo si todo pasa, publica `dist/` en GitHub Pages.

## Licencia

Todos los derechos reservados. Ver [LICENSE](LICENSE). Aviso legal conforme a la LFDA (arts. 11–13) y a la LFPDPPP: el sitio no recopila datos personales, no usa cookies ni analítica, y el escenario compartido viaja solo en el fragmento `#` de la URL.
