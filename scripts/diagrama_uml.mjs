// Genera el diagrama de actividad UML de COATL (6 carriles) en SVG.
// Uso: node scripts/diagrama_uml.mjs  →  docs/diagrama-proceso.svg y entregables/diagrama-proceso.svg
import fs from 'node:fs';

const C = { rojo: '#C8102E', granate: '#7A0C1F', hueso: '#FBF6F3', tinta: '#38070F', rosa: '#E9B9BE', gris: '#6B5457', blanco: '#FFFFFF' };
const ANCHO_CARRIL = 270, X0 = 20, Y0 = 110, ALTO = 1240;
const CARRILES = ['1 · Entrada', '2 · Determinista', '3 · Probabilístico', '4 · Simulación', '5 · Rentabilidad', '6 · Decisión / FODA'];
const W = X0 * 2 + ANCHO_CARRIL * CARRILES.length;
const H = Y0 + ALTO + 90;
const cx = (c) => X0 + ANCHO_CARRIL * c + ANCHO_CARRIL / 2;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const partes = [];
const nodos = {};

function accion(id, c, y, lineas, { formula = false, ancho = 236 } = {}) {
  const alto = 22 + lineas.length * 17;
  const x = cx(c) - ancho / 2;
  nodos[id] = { x: cx(c), y, arriba: y, abajo: y + alto, izq: x, der: x + ancho };
  partes.push(`<rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="14" fill="${C.blanco}" stroke="${C.granate}" stroke-width="1.6"/>`);
  lineas.forEach((l, i) => partes.push(
    `<text x="${cx(c)}" y="${y + 24 + i * 17}" text-anchor="middle" font-family="${formula && i > 0 ? 'Spline Sans Mono,Consolas,monospace' : 'Hanken Grotesk,Arial,sans-serif'}" font-size="${formula && i > 0 ? 12 : 13}" fill="${C.tinta}"${i === 0 ? ' font-weight="700"' : ''}>${esc(l)}</text>`));
}
function rombo(id, c, y, texto) {
  const r = 34;
  nodos[id] = { x: cx(c), y, arriba: y, abajo: y + 2 * r, izq: cx(c) - r * 1.6, der: cx(c) + r * 1.6 };
  partes.push(`<polygon points="${cx(c)},${y} ${cx(c) + r * 1.6},${y + r} ${cx(c)},${y + 2 * r} ${cx(c) - r * 1.6},${y + r}" fill="${C.hueso}" stroke="${C.rojo}" stroke-width="2"/>`);
  partes.push(`<text x="${cx(c)}" y="${y + r + 4}" text-anchor="middle" font-family="Hanken Grotesk,Arial" font-size="12" font-weight="700" fill="${C.granate}">${esc(texto)}</text>`);
}
function inicio(id, c, y) { nodos[id] = { x: cx(c), arriba: y - 11, abajo: y + 11, izq: cx(c) - 11, der: cx(c) + 11 }; partes.push(`<circle cx="${cx(c)}" cy="${y}" r="11" fill="${C.tinta}"/>`); }
function fin(id, c, y) { nodos[id] = { x: cx(c), arriba: y - 14, abajo: y + 14, izq: cx(c) - 14, der: cx(c) + 14 }; partes.push(`<circle cx="${cx(c)}" cy="${y}" r="14" fill="none" stroke="${C.tinta}" stroke-width="2"/><circle cx="${cx(c)}" cy="${y}" r="8" fill="${C.tinta}"/>`); }

function flecha(puntos, guarda = '', { color = C.tinta, punteada = false, posGuarda = 0 } = {}) {
  const d = puntos.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  partes.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.6"${punteada ? ' stroke-dasharray="6 4"' : ''} marker-end="url(#punta${color === C.rojo ? 'Roja' : ''})"/>`);
  if (guarda) {
    const [a, b] = [puntos[posGuarda], puntos[posGuarda + 1]];
    const gx = (a[0] + b[0]) / 2 + 6, gy = (a[1] + b[1]) / 2 - 5;
    partes.push(`<text x="${gx}" y="${gy}" font-family="Spline Sans Mono,Consolas,monospace" font-size="11" fill="${C.rojo}" font-weight="700">${esc(guarda)}</text>`);
  }
}
const abajo = (a, b, g, o) => flecha([[nodos[a].x, nodos[a].abajo], [nodos[b].x, nodos[b].arriba]], g, o);
const lado = (a, b, g, o) => { const A = nodos[a], B = nodos[b]; const y = (A.arriba + A.abajo) / 2;
  flecha([[A.der, y], [(A.der + B.izq) / 2, y], [(A.der + B.izq) / 2, B.arriba - 14], [B.x, B.arriba - 14], [B.x, B.arriba]], g, o); };

// ---- Carril 1: Entrada ----
inicio('ini', 0, Y0 + 40);
rombo('url', 0, Y0 + 80, '¿#e= en URL?');
accion('cargarURL', 0, Y0 + 190, ['Cargar escenario', 'compartido (decodifica', 'y valida cada campo)']);
accion('captura', 0, Y0 + 300, ['Capturar 32 variables', 'giro · zona · local · deuda', 'ticket · CV · merma · μ', 'g · π · r · estacionalidad']);
// ---- Carril 2: Determinista ----
accion('derivar', 1, Y0 + 300, ['derivar()', 'cv′ = cv + merma', 'CF = renta+nómina+otros', '     +mkt+I₀·d·i/12'], { formula: true });
accion('pe', 1, Y0 + 430, ['Punto de equilibrio', 'PE = CF / (t̄·(1−cv′))', 'MS = (V − PE$) / V'], { formula: true });
// ---- Carril 3: Probabilístico ----
accion('logit', 2, Y0 + 300, ['Modelo logístico', 'z = β₀ + Σ βᵢ·xᵢ', 'P = acota(1/(1+e⁻ᶻ),', '         0.04, 0.93)'], { formula: true });
accion('rango', 2, Y0 + 430, ['Rango plausible de P', 'βᵢ·(1+0.30ε), β₀+0.15ε', '1,000 sorteos → P5–P95'], { formula: true });
accion('cox', 2, Y0 + 545, ['Supervivencia tipo Cox', 'h = ln P / ln S₀(3)', 'S(t) = S₀(t)^h, t=0…10'], { formula: true });
// ---- Carril 4: Simulación ----
accion('rng', 3, Y0 + 300, ['RNG reproducible', 'mulberry32(20262)', '+ Box–Muller → N(0,1)'], { formula: true });
accion('anio', 3, Y0 + 410, ['Año simulado i', 'F ~ LogN(−σ²/2, 0.15²)', 'cv″ ~ N(cv′, 0.02²)'], { formula: true });
accion('mes', 3, Y0 + 520, ['12 meses', 'clientes ~ N(μF, (0.22μF)²)', 'ticket ~ N(t̄, (0.08t̄)²)', 'Uᵢ += cli·d·tk·(1−cv″) − CF'], { formula: true });
rombo('mas', 3, Y0 + 650, 'i < 2,000 ?');
accion('cuantiles', 3, Y0 + 770, ['Distribución de U', 'P5 · P50 · P95 (tipo 7)', 'P(U>0) = #{Uᵢ>0}/2000'], { formula: true });
// ---- Carril 5: Rentabilidad ----
accion('roi', 4, Y0 + 770, ['Indicadores (antes de ISR)', 'ROI = Ū / I₀', 'Payback = I₀ / U_mes'], { formula: true });
accion('vpn', 4, Y0 + 885, ['VPN a 3 años', '−I₀ + Σ S(t)·Uₜ/(1+r)ᵗ', 'Uₜ = V(1+g)ᵗ⁻¹(1−cv′)', '     − CF(1+π)ᵗ⁻¹'], { formula: true });
// ---- Carril 6: Decisión / FODA ----
rombo('semaforo', 5, Y0 + 300, 'P ≥ 0.65 ?');
accion('solido', 5, Y0 + 420, ['Escenario sólido', '(+ confeti al cruzar umbral)'], { ancho: 200 });
rombo('medio', 5, Y0 + 520, 'P ≥ 0.45 ?');
accion('cond', 5, Y0 + 640, ['Condicionado [sí]', 'Frágil [no]'], { ancho: 200 });
accion('palancas', 5, Y0 + 770, ['palancas(): ΔP real', 'clona escenario, mejora', 'una variable, recalcula P'], { formula: false });
accion('foda', 5, Y0 + 885, ['FODA dinámico', '9 estrategias cuantificadas', 'plan: 3 palancas con mayor ΔP']);
rombo('ajusta', 5, Y0 + 1010, '¿Ajustar?');
fin('fin', 5, Y0 + 1150);

// ---- Flujos ----
abajo('ini', 'url');
flecha([[nodos.url.x, nodos.url.abajo], [nodos.cargarURL.x, nodos.cargarURL.arriba]], '[sí]');
flecha([[nodos.url.izq, nodos.url.y + 34], [X0 + 14, nodos.url.y + 34], [X0 + 14, nodos.captura.arriba + 30], [nodos.captura.izq, nodos.captura.arriba + 30]], '[no]', { posGuarda: 0 });
abajo('cargarURL', 'captura');
lado('captura', 'derivar');
abajo('derivar', 'pe');
flecha([[nodos.pe.der, nodos.pe.arriba + 30], [nodos.logit.izq - 18, nodos.pe.arriba + 30], [nodos.logit.izq - 18, nodos.logit.arriba + 30], [nodos.logit.izq, nodos.logit.arriba + 30]], 'MS', { posGuarda: 1 });
abajo('logit', 'rango');
abajo('rango', 'cox');
flecha([[nodos.derivar.der, nodos.derivar.arriba + 14], [nodos.derivar.der + 10, nodos.derivar.arriba + 14], [nodos.derivar.der + 10, Y0 + 80], [nodos.rng.x, Y0 + 80], [nodos.rng.x, nodos.rng.arriba]], 'μ, t̄, cv′, CF', { posGuarda: 2 });
abajo('rng', 'anio');
abajo('anio', 'mes');
abajo('mes', 'mas');
flecha([[nodos.mas.der, nodos.mas.y + 34], [cx(3) + 126, nodos.mas.y + 34], [cx(3) + 126, nodos.anio.arriba + 30], [nodos.anio.der, nodos.anio.arriba + 30]], '[sí] i++', { color: C.rojo, posGuarda: 0 });
flecha([[nodos.mas.x, nodos.mas.abajo], [nodos.cuantiles.x, nodos.cuantiles.arriba]], '[no]');
lado('cuantiles', 'roi');
abajo('roi', 'vpn');
flecha([[nodos.cox.x, nodos.cox.abajo], [nodos.cox.x, Y0 + 740], [X0 + ANCHO_CARRIL * 4 + 10, Y0 + 740], [X0 + ANCHO_CARRIL * 4 + 10, nodos.vpn.arriba + 40], [nodos.vpn.izq, nodos.vpn.arriba + 40]], 'S(t)', { posGuarda: 1 });
flecha([[nodos.logit.der, nodos.logit.arriba + 12], [nodos.logit.der + 12, nodos.logit.arriba + 12], [nodos.logit.der + 12, Y0 + 55], [nodos.semaforo.x, Y0 + 55], [nodos.semaforo.x, nodos.semaforo.arriba]], 'P', { posGuarda: 2 });
flecha([[nodos.semaforo.x, nodos.semaforo.abajo], [nodos.solido.x, nodos.solido.arriba]], '[sí]');
flecha([[nodos.semaforo.der, nodos.semaforo.y + 34], [X0 + ANCHO_CARRIL * 6 - 12, nodos.semaforo.y + 34], [X0 + ANCHO_CARRIL * 6 - 12, nodos.medio.y + 34], [nodos.medio.der, nodos.medio.y + 34]], '[no]', { posGuarda: 0 });
flecha([[nodos.medio.x, nodos.medio.abajo], [nodos.cond.x, nodos.cond.arriba]], '[sí] / [no]');
flecha([[nodos.solido.izq, nodos.solido.arriba + 20], [nodos.solido.izq - 16, nodos.solido.arriba + 20], [nodos.solido.izq - 16, nodos.palancas.arriba + 20], [nodos.palancas.izq, nodos.palancas.arriba + 20]]);
abajo('cond', 'palancas');
abajo('palancas', 'foda');
flecha([[nodos.vpn.der, nodos.vpn.arriba + 30], [nodos.foda.izq, nodos.vpn.arriba + 30]], 'ROI·VPN');
abajo('foda', 'ajusta');
flecha([[nodos.ajusta.x, nodos.ajusta.abajo], [nodos.fin.x, nodos.fin.arriba]], '[no] decidir');
// Bucle de retroalimentación: el usuario ajusta variables → nuevo cálculo en vivo
const yb = Y0 + ALTO - 20;
flecha([[nodos.ajusta.izq, nodos.ajusta.y + 34], [nodos.ajusta.izq - 30, nodos.ajusta.y + 34], [nodos.ajusta.izq - 30, yb], [X0 + 30, yb], [X0 + 30, nodos.captura.abajo - 14], [nodos.captura.izq, nodos.captura.abajo - 14]],
  '[sí] mueve una palanca → recálculo en vivo (220 ms)', { color: C.rojo, punteada: true, posGuarda: 2 });
partes.push(`<text x="${cx(1)}" y="${yb + 30}" text-anchor="middle" font-family="Hanken Grotesk,Arial" font-size="12" fill="${C.gris}">Bucle de retroalimentación</text>`);

// ---- Lienzo: carriles, greca y títulos ----
const greca = (y) => { let s = ''; for (let x = 0; x < W; x += 24) s += `<path d="M${x},${y + 12} h8 v-8 h8 v8 h8" fill="none" stroke="${C.rojo}" stroke-width="2"/>`; return s; };
const carriles = CARRILES.map((t, i) => {
  const x = X0 + ANCHO_CARRIL * i;
  return `<rect x="${x}" y="${Y0}" width="${ANCHO_CARRIL}" height="${ALTO}" fill="${i % 2 ? C.blanco : C.hueso}" stroke="${C.rosa}"/>` +
    `<rect x="${x}" y="${Y0}" width="${ANCHO_CARRIL}" height="34" fill="${i % 2 ? C.granate : C.rojo}"/>` +
    `<text x="${x + ANCHO_CARRIL / 2}" y="${Y0 + 23}" text-anchor="middle" font-family="Bricolage Grotesque,Arial" font-size="15" font-weight="700" fill="#fff">${esc(t)}</text>`;
}).join('');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">COATL · Diagrama de actividad UML del modelo (6 carriles)</title>
<desc id="d">Flujo desde la captura de variables hasta la decisión: cálculo determinista, modelo logístico y curva de supervivencia, simulación Monte Carlo de 2,000 años, indicadores de rentabilidad y motor FODA con bucle de retroalimentación.</desc>
<defs>
<marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.tinta}"/></marker>
<marker id="puntaRoja" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.rojo}"/></marker>
</defs>
<rect width="${W}" height="${H}" fill="${C.hueso}"/>
${greca(6)}
<text x="${X0}" y="62" font-family="Bricolage Grotesque,Arial" font-size="28" font-weight="800" fill="${C.tinta}">COATL · Proceso del modelo estadístico</text>
<text x="${X0}" y="88" font-family="Hanken Grotesk,Arial" font-size="14" fill="${C.gris}">Diagrama de actividad UML · Coacalco de Berriozábal · Cruz García, López Bautista y Arroyo Cortés · v2 (nov-2026)</text>
${carriles}
${partes.join('\n')}
<text x="${X0}" y="${H - 34}" font-family="Hanken Grotesk,Arial" font-size="12" fill="${C.gris}">Guardas en [corchetes] · línea roja continua: bucle de simulación · línea roja punteada: retroalimentación del usuario · fórmulas en monoespaciado.</text>
${greca(H - 24)}
</svg>
`;
fs.mkdirSync('docs', { recursive: true });
fs.mkdirSync('entregables', { recursive: true });
fs.writeFileSync('docs/diagrama-proceso.svg', svg);
fs.writeFileSync('entregables/diagrama-proceso.svg', svg);
console.log(`Diagrama generado (${W}×${H})`);
