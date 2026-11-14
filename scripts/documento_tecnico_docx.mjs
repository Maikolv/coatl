// Genera entregables/COATL_Documento_Tecnico.docx: cómo funciona COATL, de dónde salen sus datos y cómo se construyó.
// Misma identidad que el sitio: paleta roja/granate/hueso, greca y las tipografías de la web
// (Bricolage Grotesque, Hanken Grotesk, Spline Sans Mono, OFL), incrustadas para que se vean igual en cualquier equipo.
// Cifras tomadas del propio modelo (scripts/datos_reporte.mjs). Uso: node scripts/documento_tecnico_docx.mjs
import fs from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, ExternalHyperlink, PageBreak, Footer, Header, PageNumber,
  LevelFormat, TableOfContents, CharacterSet,
} from 'docx';
import { REF, FUENTES, AUTORES } from './datos_reporte.mjs';

const ROJO = 'C8102E', GRANATE = '7A0C1F', HUESO = 'FBF6F3', TINTA = '38070F', GRIS = '6E464B', ROSA = 'F3E9E4';
const DISPLAY = 'Bricolage Grotesque', CUERPO = 'Hanken Grotesk', MONO = 'Spline Sans Mono';
const ANCHO = 9360;
const F = (n) => fs.readFileSync(new URL('../assets/fuentes/' + n, import.meta.url));
const { e, mc, f, rp, mxn, pct, modelo } = REF;

const run = (t) => (typeof t === 'string' ? new TextRun(t) : t);
const p = (texto, o = {}) => new Paragraph({ spacing: { after: 140, line: 312 }, ...o, children: [].concat(texto).map(run) });
const b = (t) => new TextRun({ text: t, bold: true });
const code = (t) => new TextRun({ text: t, font: MONO, size: 19, color: GRANATE });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, keepNext: true, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun(t)] });
const vineta = (t) => new Paragraph({ numbering: { reference: 'vinetas', level: 0 }, spacing: { after: 90, line: 300 }, children: [].concat(t).map(run) });
const paso = (t) => new Paragraph({ numbering: { reference: 'pasos', level: 0 }, spacing: { after: 90, line: 300 }, children: [].concat(t).map(run) });
const etiqueta = (t) => new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: t.toUpperCase(), font: MONO, size: 16, color: ROJO, characterSpacing: 40 })] });
// Greca: doble filete rojo, como el borde escalonado del sitio.
const greca = (antes = 0) => new Paragraph({ spacing: { before: antes, after: 220 }, border: { bottom: { style: BorderStyle.THICK_THIN_LARGE_GAP, size: 18, color: ROJO, space: 4 } } });
const nota = (texto) => new Paragraph({
  spacing: { before: 120, after: 200, line: 300 }, indent: { left: 240, right: 240 },
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: ROJO, space: 10 } },
  shading: { type: ShadingType.CLEAR, fill: HUESO, color: 'auto' }, children: [].concat(texto).map(run),
});
const formula = (t) => new Paragraph({ spacing: { before: 80, after: 160 }, indent: { left: 360 }, shading: { type: ShadingType.CLEAR, fill: ROSA, color: 'auto' }, children: [new TextRun({ text: t, font: MONO, size: 19, color: TINTA })] });
const enlace = (texto, url) => new ExternalHyperlink({ link: url, children: [new TextRun({ text: texto, style: 'Hyperlink', color: ROJO, underline: {} })] });
const tamPng = (ruta) => { const x = fs.readFileSync(ruta); return [x.readUInt32BE(16), x.readUInt32BE(20)]; };
function fig(ruta, pie, anchoPx = 600) {
  const [w, h] = tamPng(ruta);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(ruta), transformation: { width: anchoPx, height: Math.round(h * anchoPx / w) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: pie, italics: true, size: 17, color: GRIS })] }),
  ];
}
function tabla(encabezados, filas, anchos) {
  const celda = (t, i, cab, par) => new TableCell({
    width: { size: anchos[i], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: cab ? GRANATE : par ? HUESO : 'FFFFFF', color: 'auto' },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({ children: [new TextRun({ text: String(t), bold: cab, color: cab ? 'FFFFFF' : TINTA, size: 19, font: cab ? DISPLAY : CUERPO })] })],
  });
  const borde = { style: BorderStyle.SINGLE, size: 4, color: 'E5D3CF' };
  return new Table({
    width: { size: anchos.reduce((a, x) => a + x, 0), type: WidthType.DXA }, columnWidths: anchos,
    borders: { top: borde, bottom: borde, left: borde, right: borde, insideHorizontal: borde, insideVertical: borde },
    rows: [new TableRow({ tableHeader: true, children: encabezados.map((t, i) => celda(t, i, true)) }),
      ...filas.map((r, k) => new TableRow({ cantSplit: true, children: r.map((t, i) => celda(t, i, false, k % 2 === 1)) }))],
  });
}
const espacio = () => new Paragraph({ spacing: { after: 120 } });

// ---------- Portada ----------
const portada = [
  new Paragraph({ spacing: { before: 1300 }, children: [new TextRun({ text: 'DOCUMENTO TÉCNICO · NOVIEMBRE 2026', font: MONO, size: 18, color: ROJO, characterSpacing: 60 })] }),
  new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'COATL', font: DISPLAY, bold: true, size: 130, color: ROJO })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Cálculo de Oportunidad y Análisis Territorial Local', font: DISPLAY, bold: true, size: 34, color: GRANATE })] }),
  greca(),
  p('Cómo funciona la herramienta, de dónde proviene su información y cómo se construyó: probabilidad de supervivencia a 3 años y rentabilidad esperada de abrir un negocio en Coacalco de Berriozábal, Estado de México.', { spacing: { after: 700, line: 340 } }),
  etiqueta('Proyecto'),
  p('Proyecto de Participación Especial · Jornada Académica Empresarial · Probabilidad y Estadística', { spacing: { after: 60 } }),
  p('Docente: Mtra. Noemí Daniela Palacios Fermín', { spacing: { after: 300 } }),
  etiqueta('Autores'),
  ...AUTORES.map((a) => p(a, { spacing: { after: 40 } })),
  new Paragraph({ spacing: { before: 500 }, children: [new TextRun({ text: 'Sitio: ', color: GRIS, size: 20 }), enlace('maikolv.github.io/coatl', 'https://maikolv.github.io/coatl/'), new TextRun({ text: '   ·   Código: ', color: GRIS, size: 20 }), enlace('github.com/Maikolv/coatl', 'https://github.com/Maikolv/coatl')] }),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Contenido', font: DISPLAY, bold: true, size: 40, color: ROJO })] }),
  new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' }),
  nota('Si el índice aparece vacío, en Word pulsa F9 sobre él (o «Actualizar tabla») para generarlo.'),
];

// ---------- 1. Qué es ----------
const que = [
  h1('1. Qué es COATL'),
  p(['COATL es una aplicación web que estima, antes de invertir, ', b('qué tan probable es que un negocio siga abierto y rentable después de tres años'), ' en Coacalco de Berriozábal, y ', b('cuánto podría ganar'), '. Funciona en cualquier navegador, en computadora o teléfono, sin instalar nada ni crear cuenta.']),
  p('El nombre viene del náhuatl cóatl («serpiente»), presente en la toponimia de Coacalco («en la casa de las serpientes»). La identidad visual usa el rojo mexicano, el granate y el blanco hueso, con la greca escalonada (xicalcoliuhqui) como borde.'),
  h2('El problema que resuelve'),
  p('En México, de cada 100 negocios que abren, solo una parte sigue operando años después (INEGI, tabulados de esperanza de vida de los negocios). Muchas decisiones de apertura se toman sin medir el riesgo. COATL convierte datos oficiales y supuestos explícitos en una probabilidad, un rango de utilidades y un plan de mejora.'),
  h2('Qué entrega'),
  vineta([b('Probabilidad de supervivencia a 3 años'), ' con su rango plausible.']),
  vineta([b('Rentabilidad'), ': utilidad mensual, punto de equilibrio, ROI, recuperación de la inversión (payback) y VPN.']),
  vineta([b('Riesgo'), ': 2,000 años simulados por Monte Carlo con escenarios pesimista (P5), mediano y optimista (P95).']),
  vineta([b('Territorio'), ': mapa real con las 6 zonas del municipio sobre las 70 AGEB oficiales del INEGI, comparador de zonas y competencia del DENUE.']),
  vineta([b('Estrategia'), ': FODA dinámico con 9 palancas cuantificadas (cuánto sube la probabilidad cada una).']),
  ...fig('docs/capturas/doc/inicio.png', 'Figura 1. Portada del sitio con el tablero de 100 negocios.'),
];

// ---------- 2. Cómo funciona ----------
const como = [
  h1('2. Cómo funciona'),
  p('El recorrido tiene tres pasos: la persona describe su negocio, el motor estadístico calcula y la interfaz explica los resultados.'),
  h2('Paso 1 · Entrada'),
  p('El simulador tiene 32 variables en 4 pestañas (Negocio, Ubicación, Operación y Finanzas): giro (35 giros base y 989 actividades del SCIAN), zona, clientes por día, ticket promedio, renta, empleados, inversión, crédito y experiencia, entre otras. También se puede escribir o dictar el negocio en lenguaje natural («Describe tu negocio»): un intérprete local por reglas extrae las cifras y, de forma opcional, puede usarse Gemini con una clave gratuita de la propia persona.'),
  h2('Paso 2 · Motor estadístico'),
  p('Los cálculos viven en módulos puros (sin interfaz) en src/modelo/, de modo que los mismos números alimentan la página, las pruebas y este documento. El detalle está en el capítulo 3.'),
  h2('Paso 3 · Resultados y explicación'),
  p('Los resultados se muestran con indicadores, curva de supervivencia, histograma de Monte Carlo y un tablero de 100 negocios. Cada cifra tiene su trazabilidad: de dónde viene y qué la mueve.'),
  ...fig('docs/capturas/simulador-resultados.png', 'Figura 2. Simulador con resultados del escenario de referencia.', 560),
  h2('Apartados del sitio'),
  tabla(['Apartado', 'Para qué sirve'], [
    ['Inicio', 'Presentación y tablero visual de 100 negocios.'],
    ['Contexto', 'Datos del municipio y mapa con las 6 zonas sobre AGEB oficiales.'],
    ['DENUE', 'Competencia real por giro y zona (conteos del directorio del INEGI).'],
    ['Simulador', 'Las 32 variables, resultados, contraste con el censo y comparador de escenarios.'],
    ['Empresas', 'Análisis de los datos propios de una empresa; nunca salen del navegador.'],
    ['Estrategia', 'FODA dinámico y plan de acción con efecto medido de cada palanca.'],
    ['Metodología', 'Fórmulas, supuestos y fuentes.'],
    ['Legal', 'Aviso legal y de privacidad (LFDA y LFPDPPP).'],
  ], [2200, 7160]),
  espacio(),
  p('Un asistente flotante (esquina inferior derecha) responde «¿cómo voy?», «¿qué zona me conviene?» o «¿cómo subo mi probabilidad?» con el mismo motor, ajusta el simulador por texto o voz y navega entre apartados.'),
];

// ---------- 3. Modelo ----------
const mod = [
  h1('3. El modelo estadístico'),
  p('COATL combina cuatro técnicas de la materia. Todas se validan contra un escenario de referencia: una cafetería en Los Héroes con los valores por defecto.'),
  h2('3.1 Regresión logística: probabilidad base'),
  p('Cada variable aporta un coeficiente β; la suma pasa por la función logística para obtener una probabilidad entre 0 y 1.'),
  formula('P = 1 / (1 + e^-(β0 + β1·x1 + … + βk·xk))'),
  p(['Para medir la incertidumbre de los coeficientes, el ', b('rango plausible'), ' perturba los β y reporta los percentiles 5 y 95. Es un análisis de sensibilidad, no un intervalo de confianza muestral.']),
  h2('3.2 Supervivencia tipo Cox'),
  p('La curva base S₀(t) proviene del tabulado nacional del INEGI (1989–2019) para t = 1…10 años. El perfil del negocio la desplaza con un cociente de riesgos (hazard ratio):'),
  formula('S(t) = S0(t) ^ HR'),
  h2('3.3 Monte Carlo: riesgo de la utilidad'),
  p('Se simulan 2,000 años de operación con un generador reproducible (mulberry32, semilla fija) y la transformación de Box-Muller. Cada año combina un choque anual común de demanda, ruido mensual y ruido en el costo variable. Se reportan P5, mediana y P95 (cuantil tipo 7).'),
  h2('3.4 Finanzas'),
  p('Con la utilidad esperada se calculan el punto de equilibrio, el margen de seguridad, el ROI, el payback y el VPN a 3 años con tasa de 12 %.'),
  h2('3.5 FODA dinámico'),
  p('Cada una de las 9 estrategias se evalúa moviendo su palanca y recalculando P con el mismo modelo. Así el plan dice cuántos puntos sube la probabilidad cada acción.'),
  h2('3.6 Escenario de referencia'),
  p('Estas cifras las calcula el propio código del sitio al generar este documento. Las pruebas automáticas fallan si cambian sin justificarlo.'),
  tabla(['Indicador', 'Valor'], REF.filas, [6200, 3160]),
];

// ---------- 4. Fuentes ----------
const fuentes = [
  h1('4. De dónde sale la información'),
  p('Regla del proyecto: ningún dato se inventa. Lo que viene de una fuente oficial se cita; lo que es supuesto del equipo se rotula en pantalla como «estimación del equipo».'),
  tabla(['Dato', 'Fuente', 'Uso en COATL'], [
    ['Supervivencia de negocios S₀(t)', 'INEGI, tabulado nacional 1989–2019', 'Curva base de supervivencia'],
    ['Competencia por giro y zona', 'INEGI, DENUE (descarga masiva y API)', 'Conteos por giro; se actualiza cada semana'],
    ['Ventas, costos, personal y renta por giro', 'INEGI, Censos Económicos 2019 (datos abiertos)', 'Contraste con el negocio real promedio en Coacalco'],
    ['Límites de AGEB y población', 'INEGI, Marco Geoestadístico y Censo 2020', '70 AGEB dibujadas en el mapa, 293,245 habitantes'],
    ['Pobreza municipal', 'CONEVAL 2010–2020', 'Contexto socioeconómico'],
    ['Economía local', 'Gobierno de Coacalco; Data México (SE)', 'Contexto económico del municipio'],
    ['Cartografía base', 'OpenStreetMap y Esri', 'Mapa de fondo'],
    ['Coeficientes β y datos por giro', 'Estimación del equipo', 'Rotulados como tales en la interfaz'],
  ], [2900, 3360, 3100]),
  espacio(),
  h2('Cómo se procesan los datos'),
  p('Los datos oficiales no se copian a mano: scripts reproducibles los descargan y resumen.'),
  vineta([code('scripts/denue_sync.py'), ' agrega el DENUE de las 32 entidades. Solo publica conteos, nunca nombres ni contactos. GitHub Actions lo corre cada semana y lo valida contra la API oficial: 11,557 frente a 11,554 negocios en Coacalco.']),
  vineta([code('scripts/censo_sync.py'), ' toma los Censos Económicos 2019, prefiere el estrato de 0 a 10 personas de Coacalco y cae a niveles más amplios si falta el dato.']),
  vineta([code('scripts/ageb_sync.mjs'), ' descarga las AGEB del servicio geográfico del INEGI y asigna cada una a una zona por su centroide.']),
  ...fig('docs/capturas/doc/denue.png', 'Figura 3. Apartado DENUE: competencia real por giro.'),
];

// ---------- 5. Construcción ----------
const construccion = [
  h1('5. Cómo se construyó'),
  p(['COATL se programó como una aplicación web autocontenida (HTML, CSS y JavaScript) sin servidor propio. El equipo trabajó en ', b('Visual Studio Code'), ' como entorno de desarrollo, con Git y GitHub para el control de versiones.']),
  h2('5.1 Herramientas'),
  tabla(['Herramienta', 'Para qué se usó'], [
    ['Visual Studio Code', 'Edición del código, depuración y terminal integrada.'],
    ['Git y GitHub', 'Control de versiones, historial de cambios e integración continua.'],
    ['Node.js', 'Script de construcción (build), pruebas unitarias y generación de entregables.'],
    ['Python', 'Validación cruzada del modelo y procesamiento de datos del INEGI.'],
    ['Playwright y axe-core', 'Pruebas automáticas en navegador (computadora y teléfono) y de accesibilidad.'],
    ['GitHub Actions y Pages', 'Pruebas en cada cambio y publicación del sitio.'],
    ['Leaflet y Chart.js', 'Mapa interactivo y gráficas.'],
  ], [2900, 6460]),
  espacio(),
  h2('5.2 Arquitectura del código'),
  tabla(['Carpeta', 'Contenido'], [
    ['src/datos/', 'Giros, zonas, curva S₀(t) y supuestos de incertidumbre.'],
    ['src/modelo/', 'Modelo logístico, rango plausible, Cox, Monte Carlo y finanzas (funciones puras).'],
    ['src/ui/, src/mapa/', 'Formulario, resultados, widgets, asistente, mapa y estilos.'],
    ['scripts/', 'Construcción, servidor local, sincronización de datos, validador y documentos.'],
    ['tests/', 'Pruebas unitarias del modelo y pruebas en navegador.'],
  ], [2400, 6960]),
  espacio(),
  p(['El código fuente vive en ', code('src/'), '. El script ', code('npm run build'), ' lo une en un solo ', code('index.html'), ', calcula las huellas (hashes) de seguridad de la política CSP y copia los datos. Así el sitio es una sola página rápida que funciona incluso sin conexión.']),
  h2('5.3 Proceso de trabajo'),
  paso([b('Diseño del modelo.'), ' Selección de variables, coeficientes y supuestos a partir de la literatura y los datos del INEGI.']),
  paso([b('Programación por módulos.'), ' Primero el motor estadístico, aislado y con pruebas; después la interfaz, el mapa y los widgets que lo consumen.']),
  paso([b('Validación cruzada.'), ' El mismo escenario se recalcula en Python (scripts/validar_modelo.py) para confirmar las cifras de JavaScript.']),
  paso([b('Pruebas y revisión.'), ' Cada cambio pasa pruebas unitarias, pruebas en navegador y de accesibilidad antes de publicarse.']),
  paso([b('Iteración.'), ' Auditorías de mejora documentadas en docs/AUDITORIA.md (versiones v1 a v7.3).']),
  h2('5.4 Apoyo de herramientas de IA'),
  p('Como en el desarrollo de software actual, el equipo usó asistentes de programación (Claude Code y Codex) como apoyo: para proponer código, revisar errores y redactar documentación. Las decisiones del modelo, la selección de fuentes, la integración, las correcciones y la validación de cada resultado fueron del equipo, y todo cambio quedó registrado en el historial de Git.'),
];

// ---------- 6. Calidad ----------
const calidad = [
  h1('6. Calidad, seguridad y accesibilidad'),
  tabla(['Verificación', 'Resultado'], [
    ['Pruebas unitarias del modelo', '12 de 12 correctas'],
    ['Validación cruzada en Python', 'Las 5 métricas de referencia coinciden'],
    ['Pruebas en navegador (150 casos)', 'Computadora, teléfono vertical y horizontal, y rotación'],
    ['Accesibilidad WCAG 2.1 AA (axe-core)', '0 violaciones en los 8 apartados'],
    ['Dependencias (npm audit)', '0 vulnerabilidades'],
    ['Integración continua', 'Pruebas y publicación automática en cada cambio'],
  ], [4700, 4660]),
  espacio(),
  h2('Privacidad'),
  vineta('Los archivos de Empresas se leen dentro del navegador y nunca se envían a ningún servidor, ni siquiera a la IA opcional.'),
  vineta('Sin analítica ni rastreadores. La política de seguridad (CSP) limita a qué sitios puede conectarse la página.'),
  vineta('La IA (Gemini o Claude) es opcional: usa la clave de la propia persona, guardada solo en la memoria de la pestaña. Gemini se llama con store:false.'),
  ...fig('docs/capturas/asistente.png', 'Figura 4. Asistente siempre disponible, con motor local y Gemini opcional.', 560),
];

// ---------- 7. Limitaciones y referencias ----------
const cierre = [
  h1('7. Limitaciones'),
  vineta('Los coeficientes β y varios datos por giro son estimaciones del equipo; el contraste con los Censos Económicos ayuda a calibrarlos.'),
  vineta('La curva S₀(t) es nacional. Aplicarla a Coacalco supone que el municipio se comporta como el promedio del país.'),
  vineta('Las cifras del censo están en pesos de 2018 y no se ajustan por inflación.'),
  vineta('El rango plausible de P es un análisis de sensibilidad, no un intervalo de confianza estadístico.'),
  vineta('COATL apoya la decisión pero no sustituye la asesoría financiera profesional.'),
  h1('8. Referencias'),
  ...FUENTES.map(([t, u]) => p([t + ' ', enlace(u, u)], { spacing: { after: 100 } })),
  ...[
    ['INEGI. Directorio Estadístico Nacional de Unidades Económicas (DENUE), descarga masiva.', 'https://www.inegi.org.mx/app/descarga/?ti=6'],
    ['INEGI. API del DENUE.', 'https://www.inegi.org.mx/servicios/api_denue.html'],
    ['INEGI. Censos Económicos 2019.', 'https://www.inegi.org.mx/programas/ce/2019/'],
    ['INEGI. Marco Geoestadístico.', 'https://www.inegi.org.mx/temas/mg/'],
    ['OpenStreetMap. Derechos de autor y licencia.', 'https://www.openstreetmap.org/copyright'],
    ['Microsoft. Visual Studio Code.', 'https://code.visualstudio.com/'],
  ].map(([t, u]) => p([t + ' ', enlace(u, u)], { spacing: { after: 100 } })),
  greca(300),
  p([new TextRun({ text: 'COATL · ', font: DISPLAY, bold: true, color: ROJO }), new TextRun({ text: AUTORES.join(' · '), color: GRIS, size: 19 })], { alignment: AlignmentType.CENTER }),
];

const doc = new Document({
  creator: AUTORES.join(', '), title: 'COATL · Documento técnico', description: 'Cómo funciona COATL, fuentes de información y construcción',
  features: { updateFields: true },
  fonts: [
    { name: DISPLAY, data: F('BricolageGrotesque-ExtraBold.ttf'), bold: F('BricolageGrotesque-ExtraBold.ttf'), characterSet: CharacterSet.ANSI },
    { name: CUERPO, data: F('HankenGrotesk-Regular.ttf'), bold: F('HankenGrotesk-Bold.ttf'), characterSet: CharacterSet.ANSI },
    { name: MONO, data: F('SplineSansMono-Regular.ttf'), characterSet: CharacterSet.ANSI },
  ],
  styles: {
    default: { document: { run: { font: CUERPO, size: 21, color: TINTA } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: DISPLAY, size: 40, bold: true, color: ROJO }, paragraph: { spacing: { before: 200, after: 220 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ROJO, space: 6 } }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: DISPLAY, size: 27, bold: true, color: GRANATE }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '■', alignment: AlignmentType.LEFT, style: { run: { color: ROJO, size: 14 }, paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    { reference: 'pasos', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { run: { color: ROJO, bold: true, font: DISPLAY }, paragraph: { indent: { left: 540, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { titlePage: true, page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1300, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.THICK_THIN_LARGE_GAP, size: 12, color: ROJO, space: 4 } }, children: [new TextRun({ text: 'COATL', font: DISPLAY, bold: true, color: ROJO, size: 18 }), new TextRun({ text: '  ·  Documento técnico', color: GRIS, size: 16 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: MONO, size: 16, color: ROJO })] })] }) },
    children: [...portada, ...que, ...como, ...mod, ...fuentes, ...construccion, ...calidad, ...cierre],
  }],
});

fs.mkdirSync('entregables', { recursive: true });
fs.writeFileSync('entregables/COATL_Documento_Tecnico.docx', await Packer.toBuffer(doc));
console.log('entregables/COATL_Documento_Tecnico.docx generado (ancho útil', ANCHO, 'DXA)');
