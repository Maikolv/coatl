// Stand de COATL para la Feria Profesiográfica 2026: tres propuestas austeras, de una sola fuente de datos.
// Genera:
//   entregables/COATL_Stand_Cotizacion.pdf   cotización por partida, visualizaciones, montaje y lista de verificación
//   entregables/stand/*.pdf                   imprimibles a tamaño real (cartel, cenefa, tarjetas, gafetes, volante, QR, lonas)
//   entregables/stand/propuesta-N.png         visualizaciones (generadas con Codex; se copian de .cache/stand/)
//   docs/STAND.md                             resumen en Markdown
// Precios en MXN, aproximados (referencias al final). Uso: node scripts/stand.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, COL, LOGO, GRECA_URI, FUENTES_CSS, h1, h2, p, nota, lista, pasos, tabla, imagenURI, abrirNavegador, cerrarNavegador, generarPDF } from './doc/kit.mjs';
import { AUTORES, SITIO, REF } from './doc/datos.mjs';

const SALIDA = path.join(RAIZ, 'entregables', 'stand');
fs.mkdirSync(SALIDA, { recursive: true });
const CONTACTO = 'A660136406@my.uvm.edu.mx';
const FECHA_COT = '23 de noviembre de 2026';

// ---------- Partidas: [recurso, para qué, especificación, mín, máx, tipo de precio] ----------
// tipo: 'propio' (lo pone el equipo o la escuela), 'ref' (referencia de mercado citada), 'est' (estimación del equipo)
const P = {
  mesa: ['Mesa escolar', 'Base del stand', 'La que asigna la feria (1.5 a 1.8 m)', 0, 0, 'propio'],
  laptop: ['Laptop y teléfono del equipo', 'Demostración en vivo', 'El sitio corre sin internet con `npm run servir`', 0, 0, 'propio'],
  mantel: ['Mantel rojo liso', 'Identidad a distancia', '2.5 m de popelina roja de 1.5 m de ancho, sin costura', 100, 175, 'est'],
  cenefa: ['Cenefa de greca', 'Borde con la identidad', '1 hoja tabloide a color con 6 tiras de 43 cm, unidas con cinta (archivo `cenefa-greca.pdf`)', 60, 100, 'est'],
  cartel: ['Cartel tabloide', 'Pregunta gancho y el modelo en 4 pasos', 'Tabloide 28 × 43 cm a color en couché, pegado a cartón pluma (archivo `cartel-tabloide.pdf`)', 70, 130, 'est'],
  qr: ['QR del sitio en acrílico', 'Que lo prueben en su teléfono', 'Hoja carta (archivo `qr-carta.pdf`) en portadocumentos de acrílico', 60, 110, 'est'],
  tarjetas: ['50 tarjetas', 'Lo que el visitante se lleva', '¼ de carta a color, 4 por hoja (archivo `tarjetas.pdf`)', 50, 100, 'est'],
  gafetes: ['3 gafetes', 'Imagen de equipo', 'Impresos (archivo `gafetes.pdf`) con porta gafete y cordón', 45, 75, 'est'],
  consumibles: ['Cinta doble cara y clips', 'Montaje sin dañar la mesa', 'Cinta doble cara, masking y 6 clips binder', 25, 40, 'est'],
  faldon: ['Faldón de lona', 'Frente de la mesa visible desde lejos', 'Lona 1.5 × 0.5 m (0.75 m²) con 4 ojillos (archivo `lona-faldon.pdf`)', 110, 160, 'ref'],
  vertical: ['Lona vertical', 'Marca y método a la altura de la vista', 'Lona 0.6 × 1.6 m (≈1 m²) con bastillas para palo (archivo `lona-vertical.pdf`)', 150, 220, 'ref'],
  soporte: ['Soporte de la lona', 'Colgarla sin comprar un roll-up', '2 palos de madera de 70 cm y cordón; tripié prestado de la escuela', 30, 60, 'est'],
  volantes: ['100 volantes', 'Lo que el visitante se lleva', 'Media carta a color por un lado, 2 por hoja (archivo `volante-media-carta.pdf`)', 150, 250, 'ref'],
  pantalla: ['Pantalla de 32"', 'Demostración visible para un grupo', 'Prestada por la escuela o de un integrante', 0, 0, 'propio'],
  hdmi: ['Cable HDMI de 3 m', 'Conectar la laptop a la pantalla', 'Solo si no hay uno disponible', 80, 150, 'est'],
  porta: ['Soporte para teléfono', 'Formulario de opinión a la mano', 'Soporte de escritorio con el formulario abierto', 60, 120, 'est'],
  calcas: ['50 calcomanías', 'Recuerdo para quien deja su opinión', 'Vinil de 5 cm con el logotipo', 120, 200, 'est'],
};
const PROPUESTAS = [
  { id: 1, nombre: 'Mesa esencial', lema: 'Una mesa bien vestida y una demostración impecable.', imagen: 'propuesta-1.png',
    partidas: ['mesa', 'laptop', 'mantel', 'cenefa', 'cartel', 'qr', 'tarjetas', 'gafetes', 'consumibles'],
    tiempo: '1 día', personas: '2', espacio: 'Mesa de 1.5 m', riesgo: 'De lejos llama poco la atención; todo depende de quien presenta.',
    fuerte: 'La más barata y sin riesgo técnico: funciona sin internet y se monta en 15 minutos.' },
  { id: 2, nombre: 'Mesa con lona', lema: 'La misma mesa, visible desde el otro lado del gimnasio.', imagen: 'propuesta-2.png', recomendada: true,
    partidas: ['mesa', 'laptop', 'mantel', 'cenefa', 'qr', 'gafetes', 'consumibles', 'faldon', 'vertical', 'soporte', 'volantes'],
    tiempo: '3 días (la lona tarda 1 a 2 días)', personas: '2 a 3', espacio: 'Mesa de 1.5 m + 0.6 m al costado', riesgo: 'Bajo; confirmar con la imprenta la fecha de entrega de la lona.',
    fuerte: 'El mejor equilibrio: por unos $300 más que la esencial, el stand se reconoce de lejos y la lona se reutiliza en otros eventos.' },
  { id: 3, nombre: 'Demostración en pantalla', lema: 'Un grupo entero ve el simulador mientras otro visitante opina.', imagen: 'propuesta-3.png',
    partidas: ['mesa', 'laptop', 'mantel', 'cenefa', 'qr', 'gafetes', 'consumibles', 'faldon', 'vertical', 'soporte', 'volantes', 'pantalla', 'hdmi', 'porta', 'calcas'],
    tiempo: '3 días', personas: '3', espacio: 'Mesa de 1.8 m + 0.6 m al costado y un contacto eléctrico', riesgo: 'Depende de conseguir la pantalla prestada y de un contacto cercano.',
    fuerte: 'La más llamativa sin pasar de $1,700: la pantalla atrae grupos y las calcomanías premian a quien deja su opinión.' },
];
const total = (pr) => pr.partidas.reduce(([a, b], k) => [a + P[k][3], b + P[k][4]], [0, 0]);
const $ = (n) => '$' + n.toLocaleString('es-MX');
const rango = ([a, b]) => a === b ? (a ? $(a) : 'Sin costo') : `${$(a)} – ${$(b)}`;
const TIPO = { propio: 'Propio', ref: 'Referencia', est: 'Estimación' };
// Autocomprobación: totales crecientes, la esencial bajo $800 y ninguna sobre $1,700.
const T = PROPUESTAS.map(total);
if (!(T[0][1] < 800 && T[0][1] <= T[1][1] && T[1][1] <= T[2][1] && T[2][1] <= 1700)) throw new Error('Totales fuera del objetivo austero: ' + JSON.stringify(T));

// ---------- Imprimibles a tamaño real ----------
const QR_JS = pathToFileURL(path.join(RAIZ, 'assets/vendor/qrcode-generator-1.4.4.js')).href;
const base = (ancho, alto, cuerpo) => `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><style>${FUENTES_CSS}
@page{size:${ancho}mm ${alto}mm;margin:0}*{box-sizing:border-box}html,body{margin:0}
body{font-family:"Hanken Grotesk",sans-serif;color:${COL.tinta};-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hoja{width:${ancho}mm;height:${alto}mm;position:relative;overflow:hidden;break-after:page}
.greca{background:${GRECA_URI('FBF6F3')} repeat-x,${COL.rojo};background-size:auto 100%}
.grecaR{background:${GRECA_URI('C8102E')} repeat-x;background-size:auto 100%}
.d{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;line-height:1.02}
.m{font-family:"Spline Sans Mono",monospace;letter-spacing:.18em;text-transform:uppercase}
.qr svg{width:100%;height:100%;display:block}
.corte{outline:.2mm dashed #B9A3A0;outline-offset:0}
</style><script src="${QR_JS}"></script></head><body>${cuerpo}
<script>document.querySelectorAll('.qr').forEach(e=>{const q=qrcode(0,'M');q.addData(${JSON.stringify(SITIO)});q.make();e.innerHTML=q.createSvgTag({cellSize:4,margin:0,scalable:true});});</script></body></html>`;
const marca = (px, color = COL.rojo) => `<div style="display:flex;align-items:center;gap:${px * 0.28}px">${LOGO(px)}<span class="d" style="font-size:${px * 0.92}px;color:${color}">COATL</span></div>`;
// Ejemplo real del motor (escenario de referencia): estimación, no promesa.
const ejemplo = (f, pad) => `<div style="background:${COL.granate};color:${COL.hueso};border-radius:${pad}mm;padding:${pad}mm ${pad * 1.4}mm">
  <p class="m" style="font-size:${f * 0.42}pt;color:#F4C7CF;margin:0">Ejemplo · cafetería en Los Héroes</p>
  <p style="margin:${pad * 0.5}mm 0 0;font-size:${f * 0.62}pt;line-height:1.3"><span class="d" style="font-size:${f * 1.6}pt;color:#fff">${REF.P}</span> de probabilidad de seguir abierta y rentable a 3 años; recupera la inversión en unos ${Math.round(REF.fin.payback)} meses.</p></div>`;
const pasosModelo = ['Regresión logística: probabilidad base', 'Supervivencia tipo Cox: curva a 10 años', 'Monte Carlo: 2,000 escenarios', 'Finanzas: VPN, ROI y recuperación'];

const IMPRIMIBLES = [
  { arch: 'cartel-tabloide.pdf', nombre: 'Cartel tabloide (28 × 43 cm)', ancho: 279, alto: 432, html: () => `<div class="hoja" style="background:${COL.hueso}">
    <div class="greca" style="height:16mm"></div>
    <div style="padding:16mm 18mm 0">${marca(62)}
      <p class="m" style="font-size:11pt;color:${COL.granate};margin:6mm 0 0">Cálculo de Oportunidad y Análisis Territorial Local</p>
      <p class="d" style="font-size:52pt;color:${COL.tinta};margin:18mm 0 0">¿Tu negocio seguiría abierto en 3 años?</p>
      <p style="font-size:18pt;line-height:1.35;margin:8mm 0 0">COATL lo estima para <b>35 giros</b> en <b>6 zonas de Coacalco</b> con datos del INEGI y Probabilidad y Estadística.</p>
      <ol style="list-style:none;padding:0;margin:12mm 0 0;display:grid;gap:5mm">${pasosModelo.map((t, i) => `<li style="display:flex;gap:6mm;align-items:center;font-size:17pt"><span class="d" style="flex:none;width:15mm;height:15mm;border-radius:4mm;background:${COL.rojo};color:#fff;display:grid;place-items:center;font-size:20pt">${i + 1}</span>${t}</li>`).join('')}</ol>
      <div style="margin-top:12mm">${ejemplo(26, 6)}</div>
      <div style="display:flex;gap:10mm;align-items:center;margin-top:10mm;background:#fff;border:1mm solid ${COL.rojo};border-radius:6mm;padding:8mm">
        <div class="qr" style="width:62mm;height:62mm;flex:none"></div>
        <div><p class="d" style="font-size:26pt;color:${COL.rojo};margin:0">Pruébalo en tu teléfono</p><p style="font-size:14pt;margin:4mm 0 0">Escanea el código y simula tu propio negocio.</p><p class="m" style="font-size:9pt;margin:5mm 0 0;color:${COL.granate}">${SITIO.replace('https://', '')}</p></div></div>
    </div>
    <div style="position:absolute;left:18mm;right:18mm;bottom:22mm;font-size:11pt;color:${COL.gris}">Feria Profesiográfica 2026 · Probabilidad y Estadística · UVM<br>${AUTORES.join(' · ')}</div>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:16mm;transform:scaleY(-1)"></div></div>` },
  { arch: 'cenefa-greca.pdf', nombre: 'Cenefa de greca (6 tiras de 3.2 cm por hoja tabloide)', ancho: 432, alto: 279, html: () => `<div class="hoja" style="padding:8mm 0;display:grid;gap:8mm;align-content:start">${'<div class="greca corte" style="height:32mm"></div>'.repeat(6)}</div>` },
  { arch: 'qr-carta.pdf', nombre: 'QR para el portadocumentos (carta)', ancho: 216, alto: 279, html: () => `<div class="hoja" style="background:#fff;text-align:center">
    <div class="greca" style="height:12mm"></div><div style="padding:14mm 20mm 0;display:flex;flex-direction:column;align-items:center">${marca(54)}
    <p class="d" style="font-size:34pt;color:${COL.tinta};margin:12mm 0 0">Simula tu negocio</p><p style="font-size:15pt;margin:4mm 0 0">Escanea con la cámara de tu teléfono</p>
    <div class="qr" style="width:120mm;height:120mm;margin-top:12mm"></div>
    <p class="m" style="font-size:11pt;color:${COL.granate};margin-top:9mm">${SITIO.replace('https://', '')}</p></div>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:12mm;transform:scaleY(-1)"></div></div>` },
  { arch: 'tarjetas.pdf', nombre: 'Tarjetas ¼ de carta (4 por hoja)', ancho: 216, alto: 279, html: () => `<div class="hoja" style="display:grid;grid-template-columns:108mm 108mm;grid-template-rows:139.5mm 139.5mm">${Array(4).fill(`<div class="corte" style="position:relative;background:${COL.hueso};padding:9mm 9mm 0">
    ${marca(34)}<p class="d" style="font-size:21pt;margin:8mm 0 0">¿Tu negocio seguiría abierto en 3 años?</p><p style="font-size:10pt;line-height:1.4;margin:4mm 0 0">Probabilidad de supervivencia y rentabilidad para 35 giros en Coacalco.</p>
    <div style="display:flex;gap:5mm;align-items:center;margin-top:9mm"><div class="qr" style="width:46mm;height:46mm;flex:none"></div><p style="font-size:10pt;margin:0">Escanéalo y pruébalo.<br><span class="m" style="font-size:6.5pt;color:${COL.granate}">${SITIO.replace('https://', '')}</span></p></div>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:7mm;transform:scaleY(-1)"></div></div>`).join('')}</div>` },
  { arch: 'gafetes.pdf', nombre: 'Gafetes 9 × 12.5 cm (4 por hoja)', ancho: 216, alto: 279, html: () => `<div class="hoja" style="display:grid;grid-template-columns:90mm 90mm;grid-template-rows:125mm 125mm;gap:8mm;justify-content:center;align-content:center">${[...AUTORES, 'Equipo COATL'].map((n) => `<div class="corte" style="position:relative;background:#fff;text-align:center;overflow:hidden">
    <div class="greca" style="height:9mm"></div><div style="padding:9mm 7mm 0;display:flex;flex-direction:column;align-items:center">${LOGO(70)}
    <p class="d" style="font-size:${n.length > 26 ? 17 : 19}pt;line-height:1.08;margin:8mm 0 0;color:${COL.tinta}">${n}</p><p class="m" style="font-size:7.5pt;color:${COL.rojo};margin:5mm 0 0">${n === 'Equipo COATL' ? 'Probabilidad y Estadística' : 'Autor · COATL'}</p></div>
    <p style="position:absolute;left:0;right:0;bottom:12mm;font-size:8.5pt;color:${COL.gris};margin:0">Feria Profesiográfica 2026 · UVM</p>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:9mm;transform:scaleY(-1)"></div></div>`).join('')}</div>` },
  { arch: 'volante-media-carta.pdf', nombre: 'Volante media carta (2 por hoja)', ancho: 279, alto: 216, html: () => `<div class="hoja" style="display:grid;grid-template-columns:139.5mm 139.5mm">${Array(2).fill(`<div class="corte" style="position:relative;background:${COL.hueso};padding:12mm 11mm 0">
    ${marca(40)}<p class="d" style="font-size:24pt;margin:8mm 0 0">¿Tu negocio seguiría abierto en 3 años?</p>
    <p style="font-size:10pt;line-height:1.45;margin:4mm 0 0">COATL estima la probabilidad de supervivencia y la rentabilidad de abrir un negocio en Coacalco de Berriozábal: 35 giros, 6 zonas y datos del INEGI.</p>
    <ul style="font-size:10.5pt;line-height:1.55;margin:4mm 0 0;padding-left:5mm">${pasosModelo.map((t) => `<li>${t}</li>`).join('')}</ul>
    <div style="margin-top:6mm">${ejemplo(15, 4)}</div>
    <div style="display:flex;gap:6mm;align-items:center;margin-top:7mm"><div class="qr" style="width:40mm;height:40mm;flex:none"></div><p style="font-size:10pt;margin:0"><b>Pruébalo gratis</b> desde tu teléfono.<br><span class="m" style="font-size:7pt;color:${COL.granate}">${SITIO.replace('https://', '')}</span><br><span style="font-size:8.5pt">Opiniones: ${CONTACTO}</span></p></div>
    <p style="position:absolute;left:11mm;right:11mm;bottom:13mm;font-size:7.5pt;color:${COL.gris};margin:0">Feria Profesiográfica 2026 · Probabilidad y Estadística · UVM · ${AUTORES.join(', ')}</p>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:8mm;transform:scaleY(-1)"></div></div>`).join('')}</div>` },
  { arch: 'lona-faldon.pdf', nombre: 'Lona del faldón (150 × 50 cm)', ancho: 1500, alto: 500, html: () => `<div class="hoja" style="background:${COL.granate}">
    <div class="greca" style="height:70mm"></div><div style="position:absolute;left:110mm;right:110mm;top:70mm;bottom:70mm;display:flex;align-items:center;gap:60mm">
    <div style="flex:none">${LOGO(820)}</div><div><p class="d" style="font-size:300pt;color:${COL.hueso};margin:0">COATL</p><p class="m" style="font-size:52pt;color:#F4C7CF;margin:12mm 0 0">Probabilidad de éxito de negocios en Coacalco</p></div></div>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:70mm;transform:scaleY(-1)"></div></div>` },
  { arch: 'lona-vertical.pdf', nombre: 'Lona vertical (60 × 160 cm)', ancho: 600, alto: 1600, html: () => `<div class="hoja" style="background:${COL.hueso}">
    <div class="greca" style="height:60mm"></div><div style="padding:70mm 50mm 0">${marca(300)}
    <p class="m" style="font-size:30pt;color:${COL.granate};margin:20mm 0 0">Cálculo de Oportunidad y Análisis Territorial Local</p>
    <p class="d" style="font-size:150pt;color:${COL.tinta};margin:60mm 0 0">¿Tu negocio seguiría abierto en 3 años?</p>
    <ol style="list-style:none;padding:0;margin:70mm 0 0;display:grid;gap:24mm">${pasosModelo.map((t, i) => `<li style="display:flex;gap:22mm;align-items:center;font-size:52pt"><span class="d" style="flex:none;width:62mm;height:62mm;border-radius:14mm;background:${COL.rojo};color:#fff;display:grid;place-items:center;font-size:80pt">${i + 1}</span>${t}</li>`).join('')}</ol>
    <div style="margin-top:70mm">${ejemplo(90, 22)}</div>
    <div style="display:flex;gap:30mm;align-items:center;margin-top:70mm"><div class="qr" style="width:190mm;height:190mm;flex:none;background:#fff;padding:8mm"></div><p class="d" style="font-size:66pt;color:${COL.rojo};margin:0">Pruébalo en tu teléfono</p></div></div>
    <p style="position:absolute;left:50mm;right:50mm;bottom:90mm;font-size:30pt;color:${COL.gris};margin:0">Feria Profesiográfica 2026 · Probabilidad y Estadística · UVM</p>
    <div class="greca" style="position:absolute;left:0;right:0;bottom:0;height:60mm;transform:scaleY(-1)"></div></div>` },
];

const nav = await abrirNavegador();
const pag = await nav.newPage();
for (const im of IMPRIMIBLES) {
  const tmp = path.join(SALIDA, '_tmp.html');
  fs.writeFileSync(tmp, base(im.ancho, im.alto, im.html()));
  await pag.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await pag.evaluate(() => document.fonts.ready);
  const qrs = await pag.locator('.qr svg').count(), esperados = await pag.locator('.qr').count();
  if (qrs !== esperados) throw new Error(`${im.arch}: QR sin generar`);
  await pag.pdf({ path: path.join(SALIDA, im.arch), width: im.ancho + 'mm', height: im.alto + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  // Vista previa para la cotización (escala para que el lado mayor mida ~1000 px)
  const esc = 1000 / Math.max(im.ancho, im.alto) / 3.7795;
  await pag.setViewportSize({ width: Math.round(im.ancho * 3.7795 * esc), height: Math.round(im.alto * 3.7795 * esc) });
  await pag.evaluate((e) => { document.body.style.zoom = e; }, esc);
  await pag.screenshot({ path: path.join(RAIZ, '.cache', 'stand', 'vista-' + im.arch.replace('.pdf', '.png')), clip: { x: 0, y: 0, width: Math.round(im.ancho * 3.7795 * esc), height: Math.round(im.alto * 3.7795 * esc) } });
  fs.unlinkSync(tmp);
}
await pag.close();

// Visualizaciones de Codex: se copian al entregable si existen.
for (const pr of PROPUESTAS) {
  const src = path.join(RAIZ, '.cache', 'stand', pr.imagen);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(SALIDA, pr.imagen));
}

// ---------- Cotización en PDF ----------
// Figura con altura fija para que la imagen y su tabla quepan en la misma página.
let nFig = 0;
const fig = (ruta, pie, { ancho = 1400, alto = 80 } = {}) => { const uri = imagenURI(ruta, { ancho }); if (!uri) return { t: 'html', x: '' }; nFig++;
  return { t: 'html', x: `<figure style="margin:6pt 0 2pt"><img src="${uri}" style="max-height:${alto}mm;max-width:100%" alt="${pie.replace(/[`*"]/g, '')}"></figure><p class="pie">Figura ${nFig}. ${pie.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>` }; };
const filas = (pr) => pr.partidas.map((k) => { const [r, para, esp, a, b, t] = P[k]; return [`**${r}**`, para, esp, rango([a, b]), TIPO[t]]; });
const bloques = [
  h1('Resumen'),
  p(`Tres propuestas para presentar COATL en la **Feria Profesiográfica 2026** con el **gasto mínimo** y sin perder la imagen profesional. Las tres usan la identidad fija del proyecto (rojo #C8102E, granate #7A0C1F, blanco hueso #FBF6F3 y la greca escalonada) y son **acumulativas**: cada una reutiliza todo lo de la anterior, así que se puede empezar por la esencial y crecer si sobra presupuesto.`),
  tabla(['', ...PROPUESTAS.map((pr) => `${pr.id} · ${pr.nombre}${pr.recomendada ? ' (recomendada)' : ''}`)], [
    ['Idea', ...PROPUESTAS.map((pr) => pr.lema)],
    ['Costo cotizado', ...PROPUESTAS.map((pr) => `**${rango(total(pr))}**`)],
    ['Preparación', ...PROPUESTAS.map((pr) => pr.tiempo)],
    ['Personas', ...PROPUESTAS.map((pr) => pr.personas)],
    ['Espacio', ...PROPUESTAS.map((pr) => pr.espacio)],
    ['Riesgo', ...PROPUESTAS.map((pr) => pr.riesgo)],
  ], { pie: `Comparación de las tres propuestas. Precios en MXN con IVA, cotizados el ${FECHA_COT}.` , anchos: [16, 28, 28, 28] }),
  nota(`**Recomendación:** la propuesta 2, *Mesa con lona*. ${PROPUESTAS[1].fuerte}`),
  ...PROPUESTAS.flatMap((pr) => [
    h1(`Propuesta ${pr.id} · ${pr.nombre}`),
    p(`*${pr.lema}* ${pr.fuerte}`),
    fig(`entregables/stand/${pr.imagen}`, `Visualización de la propuesta ${pr.id} generada con Codex (imagen ilustrativa; los impresos reales son los de la sección «Imprimibles»).`, { ancho: 1800, alto: 150 }),
    nota(`**Costo total: ${rango(total(pr))}.** Preparación: ${pr.tiempo}. Personas: ${pr.personas}. Espacio: ${pr.espacio}. Riesgo: ${pr.riesgo}`),
    { t: 'html', x: '<div style="break-before:page"></div>' },
    tabla(['Recurso', 'Para qué', 'Especificación', 'Costo', 'Precio'], [...filas(pr), ['**Total**', '', '', `**${rango(total(pr))}**`, '']],
      { pie: `Partidas de la propuesta ${pr.id}.`, num: [3], anchos: [17, 21, 38, 13, 11] }),
  ]),
  h1('Imprimibles'),
  p('Todos los archivos están en `entregables/stand/`, a **tamaño real** y con las tipografías del sitio incrustadas: se entregan tal cual a la imprenta, sin diseñar nada más. Las hojas con varias piezas traen línea de corte punteada.'),
  tabla(['Archivo', 'Pieza', 'Tamaño'], IMPRIMIBLES.map((im) => [`\`${im.arch}\``, im.nombre, `${im.ancho / 10} × ${im.alto / 10} cm`]), { pie: 'Archivos listos para imprenta.' }),
  ...IMPRIMIBLES.map((im) => fig(`.cache/stand/vista-${im.arch.replace('.pdf', '.png')}`, `${im.nombre}: \`${im.arch}\`.`, { ancho: 1000, alto: 98 })),
  h1('Montaje y día de la feria'),
  h2('Antes'),
  pasos(['Cotizar en dos imprentas de Coacalco con los PDF de `entregables/stand/` y pedir precio final con IVA y fecha de entrega.', 'Mandar a imprimir las lonas con 3 días de anticipación; los impresos en papel, 1 día antes.', 'Probar el sitio sin internet en la laptop (`npm run servir`) y el QR con dos teléfonos distintos.', 'Generar el formulario de opinión (`entregables/retroalimentacion/crear_formulario.gs`) y dejarlo abierto en el teléfono del soporte.']),
  h2('Montaje (15 a 25 minutos)'),
  pasos(['Mantel y cenefa de greca en el borde frontal con cinta doble cara.', 'Faldón de lona con los 4 ojillos sujetos con clips (propuestas 2 y 3).', 'Lona vertical en los palos y el tripié, a la izquierda de quien mira la mesa.', 'Laptop al centro con el simulador en la cafetería de referencia; QR a la derecha; tarjetas o volantes al frente.', 'Pantalla al fondo y soporte del teléfono con el formulario (propuesta 3).']),
  h2('Durante'),
  lista(['Guion de 30 segundos: «¿Tu negocio seguiría abierto en 3 años? COATL lo estima con datos del INEGI. Elige un giro y una zona».', 'Demostración de 3 minutos: cambiar el giro y la zona, mostrar la probabilidad, la curva de supervivencia y el plan.', 'Cerrar con el QR y pedir la opinión en el formulario.']),
  h1('Referencias de precio'),
  p(`Los precios son aproximados y deben confirmarse con la imprenta. **Referencia**: lona impresa de 1 m² entre $145 y $153 en Mercado Libre (consulta del ${FECHA_COT}); millar de volantes media carta a color por un lado entre $435 y $999, del que 100 piezas en imprenta local cuestan entre $150 y $250. **Estimación**: sondeo del equipo en papelerías y tiendas de telas de la zona. **Propio**: material que ya tiene el equipo o que presta la escuela, sin costo.`),
  lista(['[Mercado Libre · lonas publicitarias](https://listado.mercadolibre.com.mx/lona-publicitaria)', '[Mercado Libre · millar de volantes](https://listado.mercadolibre.com.mx/millar-de-volantes)', '[Cosmos · impresión en lonas](https://www.cosmos.com.mx/producto/impresion-en-lonas-cvrt/)']),
];
await generarPDF({ tipo: 'Cotización', titulo: 'Stand para la Feria Profesiográfica 2026', bajada: `Tres propuestas austeras y profesionales, cotizadas por partida, con visualizaciones, imprimibles a tamaño real y guía de montaje. Contacto: ${CONTACTO}.`, bloques }, path.join(RAIZ, 'entregables', 'COATL_Stand_Cotizacion.pdf'));
await cerrarNavegador();

// ---------- docs/STAND.md ----------
const md = `# Stand de COATL · Feria Profesiográfica 2026

GENERADO por \`scripts/stand.mjs\`; no editar a mano. Cotización completa con visualizaciones e imprimibles: [\`entregables/COATL_Stand_Cotizacion.pdf\`](../entregables/COATL_Stand_Cotizacion.pdf). Archivos para la imprenta: \`entregables/stand/\`.

Tres propuestas austeras y **acumulativas** (cada una reutiliza la anterior). Precios en MXN, aproximados, cotizados el ${FECHA_COT}.

| | ${PROPUESTAS.map((pr) => `${pr.id} · ${pr.nombre}${pr.recomendada ? ' (recomendada)' : ''}`).join(' | ')} |
|---|${PROPUESTAS.map(() => '---').join('|')}|
| Idea | ${PROPUESTAS.map((pr) => pr.lema).join(' | ')} |
| Costo | ${PROPUESTAS.map((pr) => `**${rango(total(pr))}**`).join(' | ')} |
| Preparación | ${PROPUESTAS.map((pr) => pr.tiempo).join(' | ')} |
| Personas | ${PROPUESTAS.map((pr) => pr.personas).join(' | ')} |
| Espacio | ${PROPUESTAS.map((pr) => pr.espacio).join(' | ')} |
| Riesgo | ${PROPUESTAS.map((pr) => pr.riesgo).join(' | ')} |
${PROPUESTAS.map((pr) => `
## Propuesta ${pr.id} · ${pr.nombre}

${pr.fuerte}

![Propuesta ${pr.id}](../entregables/stand/${pr.imagen})

| Recurso | Para qué | Especificación | Costo |
|---|---|---|---|
${pr.partidas.map((k) => `| ${P[k][0]} | ${P[k][1]} | ${P[k][2]} | ${rango([P[k][3], P[k][4]])} |`).join('\n')}
| **Total** | | | **${rango(total(pr))}** |
`).join('')}
## Imprimibles

${IMPRIMIBLES.map((im) => `- \`entregables/stand/${im.arch}\`: ${im.nombre}.`).join('\n')}
`;
fs.writeFileSync(path.join(RAIZ, 'docs', 'STAND.md'), md);
console.log('Stand:', PROPUESTAS.map((pr) => `${pr.id} ${rango(total(pr))}`).join(' · '), `· ${IMPRIMIBLES.length} imprimibles · COATL_Stand_Cotizacion.pdf · docs/STAND.md`);
