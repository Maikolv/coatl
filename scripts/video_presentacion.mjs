// Genera entregables/COATL_Video.mp4 (1080p) para la Feria Profesiográfica 2026: tarjetas con la identidad de COATL (paleta, greca
// y tipografías del sitio), grabaciones reales del sitio, narración y subtítulos.
//
// VOCES DEL EQUIPO. Cada escena tiene asignado un narrador (Miguel, Bruno o Alonso). Si existe una grabación en
// entregables/voces/NN-escena.(wav|mp3|m4a|aac|ogg) se usa esa voz (normalizada); si no, se usa la voz sintética
// «Sabina» de Windows como provisional. El guion para grabar está en docs/GUION_VOCES.md y se regenera con --guion.
//
// Uso: node scripts/video_presentacion.mjs            (requiere Windows o voces grabadas, Edge/Chromium, ffmpeg y `npm run build`)
//      node scripts/video_presentacion.mjs --guion    (solo escribe docs/GUION_VOCES.md, sin generar el video)
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const TMP = path.join(RAIZ, '.herramientas', 'video'), VOCES = path.join(RAIZ, 'entregables', 'voces');
const PUERTO = 8131, BASE = `http://127.0.0.1:${PUERTO}/`;
const W = 1920, H = 1080, PAUSA = 0.7;
const VERSIONES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/versiones.json'), 'utf8')).versiones;
const AUTOR = { miguel: 'Miguel Antonio Cruz García', bruno: 'Bruno Alejandro López Bautista', alonso: 'Alonso Arroyo Cortés' };
const TRES = Object.values(AUTOR).join(' · ');
const numero = (n) => ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'][n] || String(n);

// ---------- Guion: cada escena = narrador + narración + visual ----------
const ESCENAS = [
  { id: 'titulo', quien: 'miguel', tipo: 'tarjeta', voz: 'COATL: Cálculo de Oportunidad y Análisis Territorial Local. Un proyecto de Probabilidad y Estadística para estimar si un negocio sobrevivirá en Coacalco de Berriozábal.',
    html: { fondo: 'granate', kicker: 'Feria Profesiográfica 2026 · Probabilidad y Estadística', titulo: 'COATL', sub: 'Cálculo de Oportunidad y Análisis Territorial Local', pie: TRES } },
  { id: 'problema', quien: 'miguel', tipo: 'tarjeta', voz: 'Según el INEGI, de cada cien negocios que nacen en México, solo cuarenta y tres siguen abiertos a los tres años. Y la decisión de abrir suele tomarse sin medir el riesgo. COATL responde dos preguntas antes de invertir: qué tan probable es que el negocio siga abierto y rentable a tres años, y cuánto podría ganar.',
    html: { fondo: 'hueso', kicker: 'El problema', titulo: '¿Sobrevivirá mi negocio?', lista: ['43 de cada 100 negocios siguen abiertos a los 3 años (INEGI)', 'Probabilidad de seguir abierto y rentable a 3 años', 'Utilidad, punto de equilibrio, ROI, recuperación y VPN', 'Riesgo con 2,000 años simulados'] } },
  { id: 'inicio', quien: 'miguel', tipo: 'sitio', hash: 'inicio', accion: 'recorrer', voz: 'Es una aplicación web gratuita: funciona en cualquier navegador, en computadora o en teléfono, sin instalar nada y sin registrarse. La portada muestra el tablero de cien negocios: cuántos siguen abiertos cada año.' },
  { id: 'simulador', quien: 'miguel', tipo: 'sitio', hash: 'simulador', accion: 'simular', voz: 'En el simulador, el usuario le pone nombre a su negocio y configura treinta y seis variables en cuatro pestañas: giro, zona, clientes, ticket, renta, empleados e inversión. Cada cambio recalcula al instante la probabilidad, la utilidad y los indicadores financieros.' },
  { id: 'modelo', quien: 'miguel', tipo: 'tarjeta', voz: 'El motor combina cuatro técnicas de la materia: una regresión logística para la probabilidad base; una curva de supervivencia de riesgos proporcionales con datos oficiales del INEGI; una simulación Monte Carlo reproducible para el riesgo; y el análisis financiero con valor presente neto, retorno y recuperación de la inversión.',
    html: { fondo: 'hueso', kicker: 'El modelo estadístico', titulo: 'Cuatro técnicas, un solo motor', lista: ['Regresión logística → P = 1 / (1 + e^−z)', 'Supervivencia → S(t) = S₀(t)^θ', 'Monte Carlo → 2,000 años, P5 · mediana · P95', 'Finanzas → VPN, ROI y recuperación'] } },
  { id: 'territorio', quien: 'bruno', tipo: 'sitio', hash: 'territorio', accion: 'recorrer', voz: 'El apartado Territorio reúne los indicadores oficiales del municipio y fotografías reales de Coacalco: su movilidad, su comercio regional y de barrio, y su vida cultural.' },
  { id: 'mapa', quien: 'bruno', tipo: 'sitio', hash: 'mapa', accion: 'mapa', voz: 'El mapa real divide Coacalco en seis zonas construidas sobre las setenta áreas geoestadísticas oficiales del INEGI, y compara la probabilidad del mismo negocio en cada una.' },
  { id: 'denue', quien: 'bruno', tipo: 'sitio', hash: 'denue', accion: 'recorrer', voz: 'La competencia sale del Directorio Estadístico Nacional de Unidades Económicas, el DENUE, que se actualiza cada semana de forma automática. En Coacalco hay más de once mil quinientos negocios registrados, en cuatrocientas veinticuatro actividades.' },
  { id: 'empresas', quien: 'bruno', tipo: 'sitio', hash: 'empresas', accion: 'recorrer', voz: 'Si el negocio ya existe, el apartado Para empresas analiza su historial mensual a partir de una plantilla de Excel con guía. El archivo se lee solo en el navegador: nunca se envía a ningún servidor.' },
  { id: 'fuentes', quien: 'bruno', tipo: 'tarjeta', voz: 'Ningún dato se inventa. La información proviene del INEGI: la tabla oficial de supervivencia, el DENUE, los Censos Económicos dos mil diecinueve, el Censo de Población dos mil veinte y la Encuesta Nacional de Ocupación y Empleo; además del CONEVAL. Lo que es supuesto del equipo se rotula como estimación del equipo.',
    html: { fondo: 'granate', kicker: 'De dónde sale la información', titulo: 'Datos oficiales, citados', lista: ['INEGI · supervivencia de negocios 1989–2019', 'INEGI · DENUE 2019–2024 y Censos Económicos 2019', 'INEGI · ENOE 2023–2025 y Censo 2020', 'CONEVAL · OpenStreetMap'] } },
  { id: 'estrategia', quien: 'alonso', tipo: 'sitio', hash: 'estrategia', accion: 'recorrer', voz: 'Con esos resultados, el apartado de Estrategia construye un análisis FODA con el propio modelo y propone acciones; como sus efectos son asociación o supuesto, cuenta solo la mitad. Y en lugar de prometer éxito, arma un plan por etapas: probar la demanda antes de abrir, invertir por tramos, revisar las ventas en los meses tres, seis y doce, y fijar desde el primer día cuánto se está dispuesto a perder.' },
  { id: 'mejora', quien: 'alonso', tipo: 'sitio', hash: 'simulador', accion: 'mejora', voz: 'Mejora tu negocio va más allá de los números: ofrece alternativas que se prueban con un clic, un diagnóstico de cinco niveles con un borrador a la medida en cada punto, una estimación fiscal y un modelo en dos punto cinco D de lo que el negocio puede llegar a ser.' },
  { id: 'qr', quien: 'alonso', tipo: 'sitio', hash: 'simulador', accion: 'qr', voz: 'Y el resultado se lleva en el teléfono. Un código QR abre el reporte completo, del simulador y de la estrategia, listo para guardarse en PDF. El resultado viaja dentro del propio enlace: no se sube a ningún servidor.' },
  { id: 'asistente', quien: 'alonso', tipo: 'sitio', hash: 'simulador', accion: 'asistente', voz: 'Un asistente siempre disponible responde preguntas como cómo voy o qué zona me conviene, usando el mismo motor. Para preguntas libres, la inteligencia artificial de COATL responde sin pedirle ninguna clave al visitante.' },
  { id: 'versiones', quien: 'miguel', tipo: 'tarjeta', voz: `El proyecto ha tenido ${numero(VERSIONES.length)} versiones. Primero el modelo pasó a la tabla oficial del INEGI. Después, los coeficientes de giro y zona se estimaron siguiendo a más de trescientos mil negocios en el DENUE de dos mil diecinueve a dos mil veinticuatro, y el de formalidad, con el panel de la ENOE. Con datos reales y una validación con negocios de Coacalco, la cafetería de referencia en Los Héroes pasó de cincuenta y dos a cuarenta y uno por ciento. Cada cifra la vigilan pruebas automáticas.`,
    html: { fondo: 'hueso', kicker: `Historial · ${VERSIONES.length} versiones`, titulo: 'De supuestos a datos', lista: ['v1 a v3 · del prototipo a la tabla oficial del INEGI', 'v4 a v12 · recorrido, DENUE, asistente, plan y QR', 'v13 a v16 · β con DENUE y ENOE, validados: P 51.6 % → 40.9 %', `${VERSIONES[VERSIONES.length - 1].id} · ${VERSIONES[VERSIONES.length - 1].titulo.toLowerCase()}`] } },
  { id: 'construccion', quien: 'alonso', tipo: 'tarjeta', voz: 'El proyecto se programó en Visual Studio Code, con control de versiones en Git y GitHub. El motor se escribió en módulos independientes y se validó con una réplica en Python. Cada cambio pasa por pruebas automáticas, incluidas las de accesibilidad, antes de publicarse.',
    html: { fondo: 'granate', kicker: 'Cómo se construyó', titulo: 'Programado, probado y publicado', lista: ['Visual Studio Code · Git · GitHub', 'JavaScript + validación cruzada en Python', 'Pruebas automáticas en computadora y teléfono', 'Accesibilidad WCAG 2.1 AA · 0 violaciones'] } },
  { id: 'limitaciones', quien: 'miguel', tipo: 'tarjeta', voz: 'COATL declara sus límites. Giro, zona y formalidad ya se estiman con microdatos del INEGI, pero experiencia, reserva, marketing y deuda siguen siendo supuestos del equipo, porque ninguna fuente pública los liga con el cierre. Y lo comprobamos con negocios reales de Coacalco que el modelo no había visto: ordena el riesgo apenas mejor que el azar. Por eso la probabilidad se acompaña siempre de un rango plausible, que es un análisis de sensibilidad y no un intervalo de confianza. La herramienta apoya la decisión, pero no sustituye la asesoría profesional.',
    html: { fondo: 'hueso', kicker: 'Honestidad estadística', titulo: 'Lo que el modelo no afirma', lista: ['Giro, zona y formalidad: estimados con datos', 'Experiencia, reserva, marketing y deuda: supuestos', 'Rango plausible: sensibilidad, no confianza', 'Validado: ordena el riesgo apenas mejor que el azar'] } },
  { id: 'telefono', quien: 'bruno', tipo: 'telefono', voz: 'La interfaz se adapta al teléfono, tanto en vertical como en horizontal, sin perder información.' },
  { id: 'cierre', quien: 'miguel', tipo: 'tarjeta', voz: 'COATL convierte datos oficiales en una decisión informada. Gracias por su atención.',
    html: { fondo: 'granate', kicker: 'maikolv.github.io/coatl', titulo: 'COATL', sub: 'Datos oficiales → decisión informada', pie: TRES } },
];
const archivoVoz = (i, e) => `${String(i + 1).padStart(2, '0')}-${e.id}`;
const grabacion = (i, e) => ['wav', 'mp3', 'm4a', 'aac', 'ogg', 'flac'].map((x) => path.join(VOCES, archivoVoz(i, e) + '.' + x)).find((f) => fs.existsSync(f));

// ---------- Pauta para grabar las voces ----------
function escribirGuion() {
  const pal = (t) => t.split(/\s+/).length, seg = (t) => Math.round(pal(t) / 2.5);
  const por = (q) => ESCENAS.map((e, i) => [e, i]).filter(([e]) => e.quien === q);
  const total = ESCENAS.reduce((s, e) => s + seg(e.voz), 0);
  const md = `# Pauta para grabar las voces del video

El video de COATL usa hoy una voz sintética provisional. Para que las voces sean las de **Miguel, Bruno y Alonso**, cada quien graba sus escenas y el video se vuelve a generar: el programa detecta las grabaciones y las usa en lugar de la voz sintética.

> Este archivo lo genera \`node scripts/video_presentacion.mjs --guion\` a partir del guion real del video. No lo edites a mano: cambia el guion en \`scripts/video_presentacion.mjs\` y vuelve a generarlo.

## Reparto

| Narrador | Escenas | Tiempo aproximado |
|---|---|---|
${Object.keys(AUTOR).map((q) => `| ${AUTOR[q]} | ${por(q).length} | ${por(q).reduce((s, [e]) => s + seg(e.voz), 0)} s |`).join('\n')}
| **Total** | **${ESCENAS.length}** | **${Math.floor(total / 60)} min ${total % 60} s** |

## Cómo grabar (5 pasos)

1. **Lugar.** Un cuarto cerrado, sin eco ni ruido de fondo (un clóset con ropa funciona muy bien). Apaga ventiladores y notificaciones.
2. **Equipo.** La grabadora de voz del teléfono basta. Sostén el micrófono a unos 15 cm de la boca, un poco de lado para evitar los golpes de aire.
3. **Lectura.** Lee con calma, a unas 150 palabras por minuto, sonriendo ligeramente. Deja medio segundo de silencio al inicio y al final. Si te equivocas, repite la escena completa.
4. **Un archivo por escena.** Guarda cada escena con el **nombre exacto** de la tabla (por ejemplo \`01-titulo.m4a\`). Se aceptan WAV, MP3, M4A, AAC, OGG y FLAC.
5. **Entrega.** Copia los archivos a la carpeta \`entregables/voces/\` del proyecto y ejecuta:

\`\`\`bash
npm run build
\`\`\`
\`\`\`bash
node scripts/video_presentacion.mjs
\`\`\`

El programa iguala el volumen de todas las grabaciones, ajusta cada escena a la duración de su audio, vuelve a escribir los subtítulos y muestra en pantalla el nombre de quien narra. Las escenas sin grabación siguen con la voz provisional, así que pueden grabar por partes.

**Privacidad.** Las grabaciones originales no se suben al repositorio (la carpeta está excluida); solo el video final las contiene.

## Guion por narrador

${Object.keys(AUTOR).map((q) => `### ${AUTOR[q]}

| Archivo | Qué se ve | Texto para leer | Duración |
|---|---|---|---|
${por(q).map(([e, i]) => `| \`${archivoVoz(i, e)}\` | ${e.tipo === 'tarjeta' ? 'Tarjeta: ' + e.html.titulo : e.tipo === 'telefono' ? 'El sitio en un teléfono' : 'El sitio: ' + (e.hash || 'simulador')} | ${e.voz} | ≈ ${seg(e.voz)} s |`).join('\n')}
`).join('\n')}
## Guion completo en orden

${ESCENAS.map((e, i) => `${i + 1}. **${AUTOR[e.quien].split(' ')[0]}** · \`${archivoVoz(i, e)}\` — ${e.voz}`).join('\n')}
`;
  fs.writeFileSync(path.join(RAIZ, 'docs/GUION_VOCES.md'), md, 'utf8');
  console.log('docs/GUION_VOCES.md escrito ·', ESCENAS.length, 'escenas ·', Math.floor(total / 60) + ' min ' + (total % 60) + ' s aprox.');
}
if (process.argv.includes('--guion')) { escribirGuion(); process.exit(0); }

const { chromium } = await import('@playwright/test');
// se vacía en lugar de borrarse: en Windows la carpeta puede estar abierta como directorio de trabajo de otra consola
fs.mkdirSync(TMP, { recursive: true }); for (const f of fs.readdirSync(TMP)) fs.rmSync(path.join(TMP, f), { recursive: true, force: true });
// Las fuentes van en base64: una página en blanco no puede leer archivos locales (file://).
const fuente = (f) => 'data:font/ttf;base64,' + fs.readFileSync(path.join(RAIZ, 'assets/fuentes', f)).toString('base64');

// ---------- Utilidades ----------
const ffmpeg = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const duracion = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
function narrar(texto, wav) {
  const txt = wav.replace(/\.wav$/, '.txt');
  fs.writeFileSync(txt, texto, 'utf8');
  const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ` +
    `$s.SelectVoice('Microsoft Sabina Desktop'); $s.Rate = 0; $s.SetOutputToWaveFile('${wav}'); ` +
    `$s.Speak([IO.File]::ReadAllText('${txt}', [Text.Encoding]::UTF8)); $s.Dispose()`;
  execFileSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe'), ['-NoProfile', '-Command', ps]);
}
/* Voz de la escena: la grabación del narrador si existe (sin silencios en los extremos y con volumen normalizado);
   si no, la voz sintética provisional. Devuelve true cuando la voz es real. */
/* Limpieza de las grabaciones del teléfono: quita zumbido grave, siseo de fondo (afftdn) y el ruido entre frases
   (compuerta suave, −18 dB), quita lo «encajonado» (220 Hz), da presencia (3.2 kHz), suaviza las «s» y empareja
   la dinámica. En la prueba con la grabación más ruidosa (06), la voz pasó de 18.5 a 41.5 dB sobre el ruido. */
const LIMPIEZA = 'highpass=f=80,afftdn=nr=24:nf=-50:tn=1,agate=threshold=0.015:ratio=2.5:range=0.12:attack=5:release=250,' +
  'equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser=i=0.4,acompressor=threshold=-22dB:ratio=3:attack=6:release=150:makeup=2';
const RECORTE = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse';
// Volumen parejo en dos pasos: mide la sonoridad tras la limpieza y aplica la ganancia exacta para −16 LUFS, con limitador a −1 dBFS.
const sonoridad = (f, af) => parseFloat(spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', af + ',ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' }).stderr.match(/I:\s+(-?[\d.]+) LUFS/g).at(-1).match(/-?[\d.]+/)[0]);
function nivelar(entrada, af, wav) {
  // el limitador recorta los picos y deja algunas voces hasta 2 dB abajo: se mide de nuevo y se corrige (≤5 vueltas, ±0.5 LU)
  let g = -16 - sonoridad(entrada, af);
  for (let k = 0; k < 5; k++) {
    ffmpeg(['-i', entrada, '-af', `${af},volume=${g.toFixed(2)}dB,alimiter=limit=0.89:attack=3:release=60:level=false`, '-ar', '48000', '-ac', '1', wav]);
    const err = -16 - sonoridad(wav, 'anull');
    if (Math.abs(err) <= 0.5) break;
    g += err;
  }
}
function vozDe(i, e, wav) {
  const real = grabacion(i, e);
  if (real) { nivelar(real, RECORTE + ',' + LIMPIEZA, wav); return true; }
  const crudo = wav.replace(/\.wav$/, '_tts.wav'); narrar(e.voz, crudo);
  nivelar(crudo, 'highpass=f=80', wav); return false;
}
const GRECA = (color) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='18' viewBox='0 0 72 18'%3E%3Cpath d='M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H12 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H48 V18 Z' fill='%23${color}'/%3E%3Crect x='28' y='7' width='4' height='4' fill='%23${color}'/%3E%3Crect x='64' y='7' width='4' height='4' fill='%23${color}'/%3E%3C/svg%3E")`;
function tarjetaHTML(o) {
  const oscuro = o.fondo === 'granate';
  const lista = o.lista ? '<ul>' + o.lista.map((x) => `<li>${x}</li>`).join('') + '</ul>' : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url('${fuente('BricolageGrotesque-ExtraBold.ttf')}')}
@font-face{font-family:C;src:url('${fuente('HankenGrotesk-Regular.ttf')}')}
@font-face{font-family:C;font-weight:700;src:url('${fuente('HankenGrotesk-Bold.ttf')}')}
@font-face{font-family:M;src:url('${fuente('SplineSansMono-Regular.ttf')}')}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
body{background:${oscuro ? 'radial-gradient(circle at 75% 30%,#9B1028,#4A0712 70%)' : '#FBF6F3'};color:${oscuro ? '#fff' : '#38070F'};font-family:C;position:relative}
/* La misma greca escalonada del sitio (no una aproximación) */
.greca{position:absolute;left:0;right:0;height:44px;background:${GRECA(oscuro ? 'FFFFFF' : 'C8102E')} repeat-x;background-size:auto 44px;opacity:${oscuro ? '.92' : '1'}}
.arriba{top:34px}.abajo{bottom:34px}
.c{position:absolute;left:160px;right:160px;top:50%;transform:translateY(-50%)}
.k{font-family:M;font-size:26px;letter-spacing:.18em;text-transform:uppercase;color:${oscuro ? '#FFC9CF' : '#C8102E'};margin-bottom:28px}
h1{font-family:D;font-size:${o.lista ? 96 : 210}px;line-height:1;margin:0;color:${oscuro ? '#fff' : '#C8102E'}}
.s{font-family:D;font-size:52px;margin-top:22px;color:${oscuro ? '#FFE3E6' : '#7A0C1F'}}
ul{list-style:none;padding:0;margin:56px 0 0}
li{font-size:42px;margin:0 0 24px;padding-left:56px;position:relative}
li:before{content:'';position:absolute;left:0;top:14px;width:22px;height:22px;background:#C8102E;${oscuro ? 'outline:3px solid #fff;' : ''}}
.p{position:absolute;left:160px;right:160px;bottom:150px;font-size:28px;color:${oscuro ? '#FFE3E6' : '#6E464B'}}
.logo{position:absolute;right:160px;top:130px;width:110px;height:110px}
</style></head><body><div class="greca arriba"></div><div class="greca abajo"></div>
<svg class="logo" viewBox="0 0 38 38"><rect width="38" height="38" rx="9" fill="${oscuro ? '#fff' : '#C8102E'}"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="${oscuro ? '#C8102E' : '#fff'}"/><circle cx="27.5" cy="14.5" r="1.8" fill="${oscuro ? '#fff' : '#C8102E'}"/></svg>
<div class="c"><div class="k">${o.kicker}</div><h1>${o.titulo}</h1>${o.sub ? `<div class="s">${o.sub}</div>` : ''}${lista}</div>
${o.pie ? `<div class="p">${o.pie}</div>` : ''}</body></html>`;
}

// ---------- Acciones grabadas en el sitio ----------
const lento = async (p, hasta, ms) => { const pasos = Math.max(1, Math.round(ms / 40));
  const ini = await p.evaluate(() => scrollY); for (let i = 1; i <= pasos; i++) { await p.evaluate((y) => scrollTo(0, y), ini + (hasta - ini) * (i / pasos)); await p.waitForTimeout(40); } };
const ACCIONES = {
  async recorrer(p, d) { await p.waitForTimeout(1200); const alto = await p.evaluate(() => document.querySelector('section:not([hidden])[data-pagina]')?.scrollHeight || 2400);
    await lento(p, Math.min(alto - 900, 2600), d * 1000 - 2400); await p.waitForTimeout(1000); },
  async simular(p, d) { await p.waitForTimeout(600);
    await p.evaluate(() => { const b = document.querySelector('#negocioBarra'); scrollTo(0, b.getBoundingClientRect().top + scrollY - 160); });
    await p.locator('#negocioNombre').pressSequentially('Café La Serpiente', { delay: 70 }); await p.waitForTimeout(500);
    await p.evaluate(() => { const f = document.querySelector('#forma'); scrollTo({ top: f.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' }); });
    const t = Math.max(0, d * 1000 - 5200) / 3;
    await p.click('#t-operacion'); await p.fill('#clientes', '90'); await p.waitForTimeout(t);
    await p.click('#t-ubicacion'); await p.selectOption('#zona', { index: 2 }); await p.waitForTimeout(t);
    await p.click('#t-finanzas'); await p.fill('#ticket', '110'); await p.waitForTimeout(t); },
  async mapa(p, d) {   // la escena abre ya en #mapa: se ajusta bajo la barra fija y se mantiene mientras cargan las teselas
    await p.evaluate(() => { const m = document.querySelector('#mapa'); scrollTo(0, m.getBoundingClientRect().top + scrollY - 100); });
    await p.waitForTimeout(d * 1000); },
  async mejora(p, d) { await p.waitForTimeout(500); await p.fill('#negocioNombre', 'Café La Serpiente'); await p.waitForTimeout(400);
    const y = await p.evaluate(() => document.querySelector('#mejora').getBoundingClientRect().top + scrollY - 110);
    await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(900);
    const yEsc = await p.evaluate(() => document.querySelector('#wEscena').getBoundingClientRect().top + scrollY - 140);
    await lento(p, yEsc, Math.max(1500, d * 1000 - 5200)); await p.waitForTimeout(600);
    await p.click('#escenaPotencial'); await p.waitForTimeout(1800); },
  async qr(p, d) { await p.waitForTimeout(500); await p.fill('#negocioNombre', 'Café La Serpiente');
    await p.evaluate(() => { const b = document.querySelector('#qrResultado'); scrollTo(0, b.getBoundingClientRect().top + scrollY - 520); }); await p.waitForTimeout(1400);
    await p.click('#qrResultado'); await p.waitForTimeout(Math.max(1500, d * 1000 - 2600)); },
  async asistente(p, d) { await p.waitForTimeout(700); await p.click('#asisAbrir'); const t = Math.max(600, (d * 1000 - 1500) / 3);
    for (const c of ['¿Cómo voy?', '¿Qué zona me conviene?', '¿Cómo subo mi probabilidad?']) { await p.click(`#asisChips button:has-text("${c}")`); await p.waitForTimeout(t); } },
};
// La CSP bloquea estilos inyectados (bien): se usa la misma clase que activa el sitio al desplazarse.
const preparar = async (p) => { await p.waitForTimeout(600); await p.evaluate(() => document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible'))); };

// ---------- Producción ----------
const servidor = spawn(process.execPath, [path.join(RAIZ, 'scripts/servir.mjs'), String(PUERTO), 'dist'], { cwd: RAIZ, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const navegador = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
const partes = [], cues = [], narradores = []; let t0 = 0, reales = 0;
// Corta la narración en líneas de hasta ~70 caracteres, de preferencia en signos de puntuación.
function trozos(t) {
  const out = []; let cur = '';
  for (const w of t.split(' ')) {
    if ((cur + ' ' + w).trim().length > 70 && cur.trim()) { out.push(cur.trim()); cur = ''; }
    cur += ' ' + w;
    if (/[.,:;]$/.test(w) && cur.trim().length > 35) { out.push(cur.trim()); cur = ''; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const marca = (s) => { const h = String(Math.floor(s / 3600)).padStart(2, '0'), m = String(Math.floor(s / 60) % 60).padStart(2, '0'), x = (s % 60).toFixed(3).replace('.', ',').padStart(6, '0'); return `${h}:${m}:${x}`; };
try {
  for (const [i, e] of ESCENAS.entries()) {
    const wav = path.join(TMP, `${e.id}.wav`); const real = vozDe(i, e, wav); if (real) reales++;
    const d = duracion(wav) + PAUSA * 2;
    const vis = path.join(TMP, `${e.id}.mp4`);
    if (e.tipo === 'tarjeta') {
      const pag = await navegador.newPage({ viewport: { width: W, height: H } });
      await pag.setContent(tarjetaHTML(e.html), { waitUntil: 'load' }); await pag.evaluate(() => document.fonts.ready);
      const png = path.join(TMP, `${e.id}.png`); await pag.screenshot({ path: png }); await pag.close();
      // acercamiento lento (Ken Burns) para que la tarjeta no quede estática
      ffmpeg(['-loop', '1', '-i', png, '-t', String(d), '-vf', `scale=${W * 2}:${H * 2},zoompan=z='min(zoom+0.0004,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=30,format=yuv420p`, '-r', '30', vis]);
    } else {
      const movil = e.tipo === 'telefono';
      const ctx = await navegador.newContext(movil
        ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, recordVideo: { dir: TMP, size: { width: 390, height: 844 } } }
        : { viewport: { width: 1600, height: 900 }, recordVideo: { dir: TMP, size: { width: 1600, height: 900 } } });
      const pag = await ctx.newPage(); const inicio = Date.now();
      await pag.goto(BASE + '#' + (e.hash || 'simulador'), { waitUntil: 'load' }); await preparar(pag);
      const carga = (Date.now() - inicio) / 1000;
      if (movil) { await pag.waitForTimeout(1200); await lento(pag, 900, 2500); await pag.setViewportSize({ width: 844, height: 390 }); await pag.waitForTimeout(800); await lento(pag, 1500, Math.max(500, d * 1000 - 5500)); }
      else await ACCIONES[e.accion](pag, d);
      const video = await pag.video().path(); await ctx.close();
      const fondo = movil
        ? `[0:v]trim=start=${carga.toFixed(2)},setpts=PTS-STARTPTS,scale=-2:960:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x4A0712`
        : `[0:v]trim=start=${carga.toFixed(2)},setpts=PTS-STARTPTS,scale=${W}:${H}:flags=lanczos`;
      ffmpeg(['-i', video, '-filter_complex', `${fondo},fps=30,tpad=stop_mode=clone:stop_duration=${d},format=yuv420p[v]`, '-map', '[v]', '-t', String(d), vis]);
    }
    // Cada escena entra y sale con un fundido breve de imagen y de voz.
    const parte = path.join(TMP, `p${String(i).padStart(2, '0')}.mp4`);
    ffmpeg(['-i', vis, '-i', wav, '-filter_complex', `[0:v]fade=t=in:st=0:d=0.35,fade=t=out:st=${(d - 0.35).toFixed(2)}:d=0.35[v];[1:a]adelay=${PAUSA * 1000}|${PAUSA * 1000},apad,aresample=48000[a]`, '-map', '[v]', '-map', '[a]', '-t', String(d), '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', parte]);
    partes.push(parte);
    // Cada línea dura en proporción a su largo dentro de la narración de la escena.
    // Con voz real, los subtítulos dicen lo que se escucha: entregables/voces/NN-escena.txt (si existe) gana sobre el guion.
    const dicho = path.join(VOCES, archivoVoz(i, e) + '.txt');
    const texto = real && fs.existsSync(dicho) ? fs.readFileSync(dicho, 'utf8').trim() : e.voz;
    const frases = trozos(texto), total = frases.reduce((a, x) => a + x.length, 0); let ti = t0 + PAUSA;
    for (const fr of frases) { const tf = ti + (d - 2 * PAUSA) * fr.length / total; cues.push([ti, tf, fr]); ti = tf; }
    if (real) narradores.push([t0 + 0.4, t0 + Math.min(d - 0.4, 4.5), AUTOR[e.quien]]);   // el nombre solo aparece cuando la voz es la de esa persona
    t0 += d;
    console.log(`${String(i + 1).padStart(2, '0')} ${e.id}: ${d.toFixed(1)} s · ${real ? 'voz de ' + AUTOR[e.quien].split(' ')[0] : 'voz provisional'}`);
  }
} finally { await navegador.close(); servidor.kill(); }

// Unir, quemar subtítulos con la tipografía del proyecto y escribir el .srt aparte.
fs.writeFileSync(path.join(TMP, 'lista.txt'), partes.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
ffmpeg(['-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'lista.txt'), '-c', 'copy', path.join(TMP, 'unido.mp4')]);
fs.mkdirSync(path.join(RAIZ, 'entregables'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'entregables/COATL_Video.srt'), cues.map(([a, z, x], k) => `${k + 1}\n${marca(a)} --> ${marca(z)}\n${x}\n`).join('\n'), 'utf8');
// Para quemarlos se usa ASS con la resolución real: con .srt, libass usa un lienzo de 384×288 y agranda todo.
const tass = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
fs.writeFileSync(path.join(TMP, 'sub.ass'), [
  '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${W}`, `PlayResY: ${H}`, 'WrapStyle: 0', '',
  '[V4+ Styles]',
  'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
  // texto blanco sobre caja granate (#7A0C1F) casi opaca, abajo al centro; el nombre del narrador, arriba a la izquierda
  'Style: COATL,Hanken Grotesk,46,&H00FFFFFF,&H00FFFFFF,&H201F0C7A,&H201F0C7A,0,0,0,0,100,100,0,0,3,14,0,2,260,260,60,1',
  'Style: NARRA,Hanken Grotesk,34,&H00FFFFFF,&H00FFFFFF,&H202E10C8,&H202E10C8,1,0,0,0,100,100,0,0,3,12,0,7,70,70,110,1', '',
  '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ...cues.map(([a, z, x]) => `Dialogue: 0,${tass(a)},${tass(z)},COATL,,0,0,0,,${x}`),
  ...narradores.map(([a, z, x]) => `Dialogue: 1,${tass(a)},${tass(z)},NARRA,,0,0,0,,{\\fad(300,300)}Narra: ${x}`),
].join('\n') + '\n', 'utf8');
for (const f of fs.readdirSync(path.join(RAIZ, 'assets/fuentes'), { withFileTypes: true })) if (f.isFile()) fs.copyFileSync(path.join(RAIZ, 'assets/fuentes', f.name), path.join(TMP, f.name));   // solo archivos: assets/fuentes/web/ es una carpeta
/* Música de fondo original (scripts/musica_fondo.py, sin derechos de terceros). Se le quitan graves y la banda de
   la voz (2.5 kHz) para que no compita, va unos 12 dB debajo de la voz y baja otros ≈6 dB mientras alguien habla
   (compresión por cadena lateral). La mezcla se limita a −1 dBFS. */
const largo = duracion(path.join(TMP, 'unido.mp4'));
execFileSync('uv', ['run', '--no-project', '--with', 'numpy', 'python', '-I', path.join(RAIZ, 'scripts/musica_fondo.py'), largo.toFixed(2), path.join(TMP, 'musica.wav')], { stdio: 'inherit' });
ffmpeg(['-i', path.join(TMP, 'unido.mp4'), '-i', path.join(TMP, 'musica.wav'), '-filter_complex',
  '[0:a]asplit=2[voz][guia];[1:a]highpass=f=90,equalizer=f=2500:t=q:w=1.5:g=-5,volume=-14dB[mus];' +
  '[mus][guia]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=450[bajo];' +
  '[voz][bajo]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89:level=false[a]',
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', path.join(TMP, 'mezcla.mp4')]);
const final = path.join(RAIZ, 'entregables/COATL_Video.mp4');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'mezcla.mp4', '-vf', 'ass=sub.ass:fontsdir=.', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'copy', '-movflags', '+faststart', final], { cwd: TMP, stdio: 'inherit' });
// Copia ligera para Teams o correo: 720p y audio AAC de 160 kb/s (≈20 MB para 6 min).
ffmpeg(['-i', final, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', path.join(RAIZ, 'entregables/COATL_Video_Teams.mp4')]);
// Portada del video para el sitio (Inicio): un cuadro de la tarjeta de título.
fs.mkdirSync(path.join(RAIZ, 'assets/video'), { recursive: true });
ffmpeg(['-ss', '3', '-i', final, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', path.join(RAIZ, 'assets/video/poster.jpg')]);
escribirGuion();
console.log('entregables/COATL_Video.mp4 listo ·', duracion(final).toFixed(1), 's ·', reales, 'de', ESCENAS.length, 'escenas con voz del equipo');
