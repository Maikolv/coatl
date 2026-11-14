// Genera entregables/COATL_Video.mp4 (1080p, ~2.5 min) para evaluadores: tarjetas con la identidad de COATL
// (paleta, greca y tipografías del sitio), grabaciones reales del sitio, narración en español de México
// (voz «Sabina» de Windows) y subtítulos. Requiere Windows, Edge, ffmpeg y `npm run build` previo.
// Uso: node scripts/video_presentacion.mjs
import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Conteo real de pruebas en navegador al generar el video.
const E2E = +(/Total: (\d+) tests?/.exec(execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['playwright', 'test', '--list'], { encoding: 'utf8', shell: true })) || [])[1] || 0;
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const TMP = path.join(RAIZ, '.herramientas', 'video');
const PUERTO = 8131, BASE = `http://127.0.0.1:${PUERTO}/`;
const W = 1920, H = 1080, PAUSA = 0.7;
fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
// Las fuentes van en base64: una página en blanco no puede leer archivos locales (file://).
const fuente = (f) => 'data:font/ttf;base64,' + fs.readFileSync(path.join(RAIZ, 'assets/fuentes', f)).toString('base64');

// ---------- Guion: cada escena = narración + visual ----------
const ESCENAS = [
  { id: 'titulo', tipo: 'tarjeta', voz: 'COATL: Cálculo de Oportunidad y Análisis Territorial Local. Un proyecto de Probabilidad y Estadística para estimar si un negocio sobrevivirá en Coacalco de Berriozábal.',
    html: { fondo: 'granate', kicker: 'Jornada Académica Empresarial · Probabilidad y Estadística', titulo: 'COATL', sub: 'Cálculo de Oportunidad y Análisis Territorial Local', pie: 'Miguel Antonio Cruz García · Bruno Alejandro López Bautista · Alonso Arroyo Cortés' } },
  { id: 'problema', tipo: 'tarjeta', voz: 'En México, muchos negocios cierran en sus primeros años, y la decisión de abrir suele tomarse sin medir el riesgo. COATL responde dos preguntas antes de invertir: qué tan probable es que el negocio siga abierto y rentable a tres años, y cuánto podría ganar.',
    html: { fondo: 'hueso', kicker: 'El problema', titulo: '¿Sobrevivirá mi negocio?', lista: ['Probabilidad de seguir abierto y rentable a 3 años', 'Utilidad, punto de equilibrio, ROI, payback y VPN', 'Riesgo con 2,000 años simulados', 'Plan de mejora con efecto medido'] } },
  { id: 'inicio', tipo: 'sitio', hash: 'inicio', accion: 'recorrer', voz: 'Es una aplicación web gratuita: funciona en cualquier navegador, en computadora o en teléfono, sin instalar nada. La portada muestra el tablero de cien negocios: cuántos siguen abiertos al tercer año.' },
  { id: 'simulador', tipo: 'sitio', hash: 'simulador', accion: 'simular', voz: 'En el simulador se configuran treinta y dos variables en cuatro pestañas: giro, zona, clientes, ticket, renta, empleados e inversión. Cada cambio recalcula al instante la probabilidad, la utilidad y los indicadores financieros.' },
  { id: 'modelo', tipo: 'tarjeta', voz: 'El motor combina cuatro técnicas de la materia: una regresión logística para la probabilidad base; una curva de supervivencia tipo Cox con datos oficiales del INEGI; una simulación Monte Carlo reproducible para el riesgo; y el análisis financiero con VPN, ROI y recuperación de la inversión.',
    html: { fondo: 'hueso', kicker: 'El modelo estadístico', titulo: 'Cuatro técnicas, un solo motor', lista: ['Regresión logística → P = 1 / (1 + e^−(β·x))', 'Supervivencia tipo Cox → S(t) = S₀(t)^HR', 'Monte Carlo → 2,000 años, P5 · P50 · P95', 'Finanzas → VPN, ROI, payback'] } },
  { id: 'territorio', tipo: 'sitio', hash: 'territorio', accion: 'recorrer', voz: 'El apartado Territorio reúne los indicadores oficiales del municipio y fotografías reales de Coacalco: su movilidad, su comercio regional y de barrio, y su vida cultural.' },
  { id: 'mapa', tipo: 'sitio', hash: 'mapa', accion: 'mapa', voz: 'El mapa real divide Coacalco en seis zonas construidas sobre las setenta AGEB oficiales del INEGI, y compara la probabilidad del mismo negocio en cada una.' },
  { id: 'denue', tipo: 'sitio', hash: 'denue', accion: 'recorrer', voz: 'La competencia sale del Directorio Estadístico Nacional de Unidades Económicas, el DENUE, que se actualiza cada semana de forma automática. En Coacalco hay más de once mil quinientos negocios registrados.' },
  { id: 'estrategia', tipo: 'sitio', hash: 'estrategia', accion: 'recorrer', voz: 'Con esos resultados, el FODA dinámico propone nueve estrategias y mide cuántos puntos sube la probabilidad cada una, para convertir el diagnóstico en un plan de acción.' },
  { id: 'asistente', tipo: 'sitio', hash: 'simulador', accion: 'asistente', voz: 'Un asistente siempre disponible responde preguntas como cómo voy o qué zona me conviene, usando el mismo motor. Para preguntas libres, la IA de COATL, basada en Gemini, responde sin pedirle ninguna clave al visitante: la clave del proyecto vive en un servidor intermedio.' },
  { id: 'fuentes', tipo: 'tarjeta', voz: 'Ningún dato se inventa. La información proviene del INEGI, de los Censos Económicos dos mil diecinueve, del Censo de Población dos mil veinte, del CONEVAL y de Data México. Lo que es supuesto del equipo se rotula como estimación del equipo.',
    html: { fondo: 'granate', kicker: 'De dónde sale la información', titulo: 'Datos oficiales, citados', lista: ['INEGI · supervivencia de negocios 1989–2019', 'INEGI · DENUE y Censos Económicos 2019', 'INEGI · Marco Geoestadístico y Censo 2020', 'CONEVAL · Data México · OpenStreetMap'] } },
  { id: 'construccion', tipo: 'tarjeta', voz: 'El proyecto se programó en Visual Studio Code, con control de versiones en Git y GitHub. El motor se escribió en módulos independientes y se validó con una réplica en Python. Cada cambio pasa más de ciento cincuenta pruebas automáticas, incluidas las de accesibilidad, antes de publicarse.',
    html: { fondo: 'hueso', kicker: 'Cómo se construyó', titulo: 'Programado, probado y publicado', lista: ['Visual Studio Code · Git · GitHub', 'JavaScript + validación cruzada en Python', `${E2E} pruebas automáticas en navegador`, 'Accesibilidad WCAG 2.1 AA · 0 violaciones'] } },
  { id: 'telefono', tipo: 'telefono', voz: 'La interfaz se adapta al teléfono, tanto en vertical como en horizontal, sin perder información.' },
  { id: 'cierre', tipo: 'tarjeta', voz: 'COATL convierte datos oficiales en una decisión informada. Gracias por su atención.',
    html: { fondo: 'granate', kicker: 'maikolv.github.io/coatl', titulo: 'COATL', sub: 'Datos oficiales → decisión informada', pie: 'Miguel Antonio Cruz García · Bruno Alejandro López Bautista · Alonso Arroyo Cortés' } },
];

// ---------- Utilidades ----------
const ffmpeg = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const duracion = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
function narrar(texto, wav) {
  const txt = wav.replace(/\.wav$/, '.txt');
  fs.writeFileSync(txt, texto, 'utf8');
  const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ` +
    `$s.SelectVoice('Microsoft Sabina Desktop'); $s.Rate = 0; $s.SetOutputToWaveFile('${wav}'); ` +
    `$s.Speak([IO.File]::ReadAllText('${txt}', [Text.Encoding]::UTF8)); $s.Dispose()`;
  execFileSync(path.join(process.env.SystemRoot || 'C:\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe'), ['-NoProfile', '-Command', ps]);
}
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
.greca{position:absolute;left:0;right:0;height:26px;background:
 linear-gradient(135deg,#C8102E 25%,transparent 25%) 0 0/26px 26px,
 linear-gradient(225deg,#C8102E 25%,transparent 25%) 0 0/26px 26px;opacity:${oscuro ? '.9' : '1'}}
.arriba{top:0}.abajo{bottom:0;transform:scaleY(-1)}
.c{position:absolute;left:160px;right:160px;top:50%;transform:translateY(-50%)}
.k{font-family:M;font-size:26px;letter-spacing:.18em;text-transform:uppercase;color:${oscuro ? '#FFC9CF' : '#C8102E'};margin-bottom:28px}
h1{font-family:D;font-size:${o.lista ? 96 : 210}px;line-height:1;margin:0;color:${oscuro ? '#fff' : '#C8102E'}}
.s{font-family:D;font-size:52px;margin-top:22px;color:${oscuro ? '#FFE3E6' : '#7A0C1F'}}
ul{list-style:none;padding:0;margin:56px 0 0}
li{font-size:44px;margin:0 0 26px;padding-left:56px;position:relative}
li:before{content:'';position:absolute;left:0;top:14px;width:22px;height:22px;background:#C8102E;${oscuro ? 'outline:3px solid #fff;' : ''}}
.p{position:absolute;left:160px;right:160px;bottom:200px;font-size:28px;color:${oscuro ? '#FFE3E6' : '#6E464B'}}
.logo{position:absolute;right:160px;top:90px;width:96px;height:96px}
</style></head><body><div class="greca arriba"></div><div class="greca abajo"></div>
<svg class="logo" viewBox="0 0 38 38"><rect width="38" height="38" rx="9" fill="${oscuro ? '#fff' : '#C8102E'}"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="${oscuro ? '#C8102E' : '#fff'}"/></svg>
<div class="c"><div class="k">${o.kicker}</div><h1>${o.titulo}</h1>${o.sub ? `<div class="s">${o.sub}</div>` : ''}${lista}</div>
${o.pie ? `<div class="p">${o.pie}</div>` : ''}</body></html>`;
}

// ---------- Acciones grabadas en el sitio ----------
const lento = async (p, hasta, ms) => { const pasos = Math.max(1, Math.round(ms / 40));
  const ini = await p.evaluate(() => scrollY); for (let i = 1; i <= pasos; i++) { await p.evaluate((y) => scrollTo(0, y), ini + (hasta - ini) * (i / pasos)); await p.waitForTimeout(40); } };
const ACCIONES = {
  async recorrer(p, d) { await p.waitForTimeout(1200); const alto = await p.evaluate(() => document.querySelector('section:not([hidden])[data-pagina]')?.scrollHeight || 2400);
    await lento(p, Math.min(alto - 900, 2600), d * 1000 - 2400); await p.waitForTimeout(1000); },
  async simular(p, d) { await p.waitForTimeout(800); await lento(p, 900, 1500);
    const t = Math.max(0, d * 1000 - 3000) / 3;
    await p.click('#t-operacion'); await p.fill('#clientes', '90'); await p.waitForTimeout(t);
    await p.click('#t-ubicacion'); await p.selectOption('#zona', { index: 2 }); await p.waitForTimeout(t);
    await p.click('#t-finanzas'); await p.fill('#ticket', '110'); await p.waitForTimeout(t); },
  async mapa(p, d) {   // la escena abre ya en #mapa: se ajusta bajo la barra fija y se mantiene mientras cargan las teselas
    await p.evaluate(() => { const m = document.querySelector('#mapa'); scrollTo(0, m.getBoundingClientRect().top + scrollY - 100); });
    await p.waitForTimeout(d * 1000); },
  async asistente(p, d) { await p.waitForTimeout(700); await p.click('#asisAbrir'); const t = Math.max(600, (d * 1000 - 1500) / 3);
    for (const c of ['¿Cómo voy?', '¿Qué zona me conviene?', '¿Cómo subo mi probabilidad?']) { await p.click(`#asisChips button:has-text("${c}")`); await p.waitForTimeout(t); } },
};
// La CSP bloquea estilos inyectados (bien): se usa la misma clase que activa el sitio al desplazarse.
const preparar = async (p) => { await p.waitForTimeout(600); await p.evaluate(() => document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible'))); };

// ---------- Producción ----------
const servidor = spawn(process.execPath, [path.join(RAIZ, 'scripts/servir.mjs'), String(PUERTO), 'dist'], { cwd: RAIZ, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const navegador = await chromium.launch({ channel: 'msedge' });
const partes = [], cues = []; let t0 = 0;
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
    const wav = path.join(TMP, `${e.id}.wav`); narrar(e.voz, wav);
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
        : `[0:v]trim=start=${carga.toFixed(2)},setpts=PTS-STARTPTS,scale=${W}:${H}`;
      ffmpeg(['-i', video, '-filter_complex', `${fondo},fps=30,tpad=stop_mode=clone:stop_duration=${d},format=yuv420p[v]`, '-map', '[v]', '-t', String(d), vis]);
    }
    const parte = path.join(TMP, `p${String(i).padStart(2, '0')}.mp4`);
    ffmpeg(['-i', vis, '-i', wav, '-filter_complex', `[1:a]adelay=${PAUSA * 1000}|${PAUSA * 1000},apad,aresample=48000[a]`, '-map', '0:v', '-map', '[a]', '-t', String(d), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', parte]);
    partes.push(parte);
    // Cada línea dura en proporción a su largo dentro de la narración de la escena.
    const frases = trozos(e.voz), total = frases.reduce((a, x) => a + x.length, 0); let ti = t0 + PAUSA;
    for (const fr of frases) { const tf = ti + (d - 2 * PAUSA) * fr.length / total; cues.push([ti, tf, fr]); ti = tf; }
    t0 += d;
    console.log(`${e.id}: ${d.toFixed(1)} s`);
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
  // texto blanco sobre caja granate (#7A0C1F) casi opaca, abajo al centro
  'Style: COATL,Hanken Grotesk,46,&H00FFFFFF,&H00FFFFFF,&H201F0C7A,&H201F0C7A,0,0,0,0,100,100,0,0,3,14,0,2,260,260,60,1', '',
  '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ...cues.map(([a, z, x]) => `Dialogue: 0,${tass(a)},${tass(z)},COATL,,0,0,0,,${x}`),
].join('\n') + '\n', 'utf8');
for (const f of fs.readdirSync(path.join(RAIZ, 'assets/fuentes'))) fs.copyFileSync(path.join(RAIZ, 'assets/fuentes', f), path.join(TMP, f));
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', 'unido.mp4', '-vf', 'ass=sub.ass:fontsdir=.', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', path.join(RAIZ, 'entregables/COATL_Video.mp4')], { cwd: TMP, stdio: 'inherit' });
console.log('entregables/COATL_Video.mp4 listo ·', duracion(path.join(RAIZ, 'entregables/COATL_Video.mp4')).toFixed(1), 's');
