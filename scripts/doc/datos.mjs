// Datos para TODOS los documentos (PDF, Word, PowerPoint y Excel), calculados con el mismo código del sitio.
// Nada se escribe a mano: cifras del modelo, tablas de giros y zonas, variables del formulario, pruebas,
// módulos y el historial de versiones (data/versiones.json).
import fs from 'node:fs';
import { cargarModelo, escenarioReferencia } from '../../tests/cargar.mjs';
import { MODULOS_JS } from '../build.mjs';

export const M = cargarModelo();
export const mxn = (x) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Math.round(x));
export const pct = (x, d = 1) => (100 * x).toFixed(d) + ' %';
const leer = (f) => fs.readFileSync(new URL('../../' + f, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

export const AUTORES = ['Miguel Antonio Cruz García', 'Bruno Alejandro López Bautista', 'Alonso Arroyo Cortés'];
export const DOCENTE = 'Mtra. Noemí Daniela Palacios Fermín';
export const SITIO = 'https://maikolv.github.io/coatl/';
export const REPO = 'https://github.com/Maikolv/coatl';
export const VERSIONES = JSON.parse(leer('data/versiones.json')).versiones;
export const VERSION = VERSIONES[VERSIONES.length - 1];
export const FECHA = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

// ---------- Escenario de referencia ----------
const e = escenarioReferencia(M), modelo = M.modeloLogistico(e), S = M.curvaSupervivencia(modelo.P), mc = M.monteCarlo(e), fin = M.finanzas(e, mc, S), rp = M.rangoP(modelo);
const fiscal = M.estimarFiscal(e.ventasMes, e.utilMes, e.empleados * e.costoEmpleado);
export const REF = {
  e, modelo, S, mc, fin, rp, fiscal,
  P: pct(modelo.P), rango: pct(rp.p05) + ' – ' + pct(rp.p95), utilidad: mxn(e.utilMes), roi: pct(fin.roi), payback: fin.payback.toFixed(1) + ' meses', vpn: mxn(fin.vpn),
  indicadores: [
    ['Probabilidad de seguir operando y rentable a 3 años (P)', pct(modelo.P)],
    ['Rango plausible de P (P5–P95 al perturbar los β)', pct(rp.p05) + ' – ' + pct(rp.p95)],
    ['Suma logística z', modelo.z.toFixed(4)],
    ['Ventas mensuales esperadas', mxn(e.ventasMes)],
    ['Costos fijos mensuales', mxn(e.fijos)],
    ['Utilidad mensual esperada (antes de impuestos)', mxn(e.utilMes)],
    ['Punto de equilibrio', Math.ceil(e.peDia) + ' clientes por día (' + mxn(e.pePesos) + ' al mes)'],
    ['Margen de seguridad', pct(e.ms)],
    ['Utilidad anual Monte Carlo: P5 · mediana · P95', `${mxn(mc.p05)} · ${mxn(mc.p50)} · ${mxn(mc.p95)}`],
    ['Utilidad anual Monte Carlo: media y desviación estándar', `${mxn(mc.media)} · ${mxn(mc.sd)}`],
    ['P(utilidad anual > 0)', pct(mc.pPos)],
    ['ROI anual esperado', pct(fin.roi)],
    ['Recuperación de la inversión', fin.payback.toFixed(1) + ' meses'],
    ['VPN a 3 años (tasa de descuento 12 %)', mxn(fin.vpn)],
    ['ISR mensual estimado (RESICO, ' + (fiscal.tasaResico * 100).toFixed(1) + ' %)', mxn(fiscal.isrMes)],
    ['Utilidad mensual después de ISR', mxn(fiscal.utilDespues)],
  ],
  entradas: [
    ['Giro', e.giro.n], ['Zona', e.zona.n], ['Ticket promedio', mxn(e.ticket)], ['Clientes por día', String(e.mu)], ['Días por semana', String(e.diasSem)],
    ['Costo variable', pct(e.cv, 0)], ['Merma', pct(e.merma, 0)], ['Renta mensual', mxn(e.renta)], ['Empleados', String(e.empleados)], ['Costo por empleado', mxn(e.costoEmpleado)],
    ['Otros costos fijos', mxn(e.otrosFijos)], ['Marketing mensual', mxn(e.mktGasto)], ['Inversión inicial', mxn(e.inversion)], ['Financiado con crédito', pct(e.credPct, 0)], ['Tasa del crédito', pct(e.tasa, 0)],
    ['Tasa de descuento', pct(e.r, 0)], ['Crecimiento anual de ventas', pct(e.crec, 0)], ['Inflación de costos fijos', pct(e.inf, 1)],
  ],
  contribuciones: modelo.contribs.map(([n, b]) => [n, (b > 0 ? '+' : b < 0 ? '−' : '') + Math.abs(b).toFixed(2)]),
  contribucionesActivas: modelo.contribs.filter((c) => c[1] !== 0).map(([n, b]) => [n, (b > 0 ? '+' : '−') + Math.abs(b).toFixed(2)]),
  supervivencia: Array.from({ length: 11 }, (_, t) => [String(t), M.S0[t].toFixed(4), S[t].toFixed(4), pct(S[t])]),
  h: Math.log(modelo.P) / Math.log(M.S0[3]),
};

// ---------- Giros, zonas y matriz giro × zona ----------
export const GIROS = Object.entries(M.GIROS).map(([k, g]) => ({ k, n: g.n, ticket: g.ticket, cv: g.cv, dem: g.dem, z: g.z }));
export const ZONAS = Object.entries(M.ZONAS).map(([k, z]) => ({ k, n: z.n, afl: z.afl, rm2: z.rm2, z: z.z }));
const escenarioDe = (g, z) => escenarioReferencia(M, { giro: M.GIROS[g.k], zona: M.ZONAS[z.k], zonaKey: z.k, ticket: g.ticket, cv: g.cv / 100, mu: Math.max(1, Math.round(g.dem * z.afl)), renta: z.rm2 * 50 });
export const MATRIZ = GIROS.map((g) => ({ giro: g.n, celdas: ZONAS.map((z) => { const x = escenarioDe(g, z); return { P: M.modeloLogistico(x).P, util: x.utilMes }; }) }));

// ---------- Variables del formulario (leídas de la plantilla del sitio) ----------
const html = leer('src/index.html');
const forma = html.slice(html.indexOf('<form class="consola" id="forma"'), html.indexOf('</form>', html.indexOf('<form class="consola" id="forma"')));
const limpio = (t) => t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const etiquetaDe = (id) => { const m = new RegExp('<label for="' + id + '"[^>]*>([\\s\\S]*?)</label>').exec(forma); return m ? limpio(m[1]).replace(/:.*$/, '') : id; };
const PESTANAS = [['c-negocio', 'Negocio'], ['c-ubicacion', 'Ubicación'], ['c-finanzas', 'Finanzas'], ['c-operacion', 'Operación']];
export const VARIABLES = [];
PESTANAS.forEach(([id, nombre], i) => {
  const ini = forma.indexOf('id="' + id + '"'), finP = i < PESTANAS.length - 1 ? forma.indexOf('id="' + PESTANAS[i + 1][0] + '"') : forma.length;
  const trozo = forma.slice(ini, finP);
  for (const m of trozo.matchAll(/<select id="([a-zA-Z]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const ops = [...m[2].matchAll(/<option value="([^"]*)"( selected)?[^>]*>([\s\S]*?)<\/option>/g)].map((o) => ({ valor: o[1], def: !!o[2], texto: limpio(o[3]) }));
    if (m[1] === 'giro' || m[1] === 'zona') { VARIABLES.push({ pestana: nombre, id: m[1], nombre: etiquetaDe(m[1]), tipo: 'lista', detalle: m[1] === 'giro' ? '35 giros calibrados, 424 actividades de Coacalco y 989 del SCIAN' : '6 zonas de Coacalco', def: m[1] === 'giro' ? 'Cafetería' : 'Los Héroes · Loma Bonita', opciones: [] }); continue; }
    VARIABLES.push({ pestana: nombre, id: m[1], nombre: etiquetaDe(m[1]), tipo: 'opciones', detalle: ops.map((o) => o.texto + ' (' + o.valor + ')').join(' · '), def: (ops.find((o) => o.def) || ops[0] || {}).texto || '', opciones: ops });
  }
  for (const m of trozo.matchAll(/<input type="(number|range)" id="([a-zA-Z]+)"([^>]*)>/g)) {
    const at = (k) => (new RegExp(k + '="([^"]*)"').exec(m[3]) || [])[1];
    VARIABLES.push({ pestana: nombre, id: m[2], nombre: etiquetaDe(m[2]), tipo: m[1] === 'range' ? 'deslizador' : 'número', detalle: 'de ' + (at('min') ?? '—') + ' a ' + (at('max') ?? '—') + (at('step') ? ', paso ' + at('step') : ''), def: at('value') ?? '', opciones: [] });
  }
});

// ---------- Sensibilidad: una variable a la vez sobre el escenario de referencia ----------
const CAMPO = { experiencia: 'expZ', formalidad: 'formZ', marketing: 'mktZ', competencia: 'compZ', reserva: 'resZ', modeloNegocio: 'modZ', permisos: 'permZ', modalidad: 'modalZ', horario: 'horZ', extorsion: 'extZ', resiliencia: 'resilZ', motivacion: 'motivZ' };
export const SENSIBILIDAD = VARIABLES.filter((v) => CAMPO[v.id]).map((v) => ({
  variable: v.nombre, filas: v.opciones.map((o) => { const P = M.modeloLogistico(escenarioReferencia(M, { [CAMPO[v.id]]: Number(o.valor) })).P; return [o.texto, (Number(o.valor) > 0 ? '+' : Number(o.valor) < 0 ? '−' : '') + Math.abs(Number(o.valor)).toFixed(2), pct(P), ((P - modelo.P) * 100 >= 0 ? '+' : '−') + Math.abs((P - modelo.P) * 100).toFixed(1) + ' pts']; }),
}));
export const SENSIBILIDAD_NUM = [['Ticket promedio', 'ticket', [0.8, 0.9, 1.1, 1.2]], ['Clientes por día', 'mu', [0.7, 0.85, 1.15, 1.3]], ['Renta mensual', 'renta', [0.7, 1.3, 1.6]], ['Inversión inicial', 'inversion', [0.6, 1.5, 2]]]
  .flatMap(([n, k, fs2]) => fs2.map((f) => { const x = escenarioReferencia(M, { [k]: e[k] * f }), m2 = M.modeloLogistico(x); return [n, (f > 1 ? '+' : '−') + Math.abs(Math.round((f - 1) * 100)) + ' %', pct(m2.P), mxn(x.utilMes), Number.isFinite(x.peDia) ? Math.ceil(x.peDia) + ' clientes/día' : 'no alcanzable']; }));

// ---------- Diagnóstico, fiscal, incertidumbre ----------
export const NIVELES = Array.from(M.NIVELES_MADUREZ, (n) => ({ n: n.n, t: n.t, s: n.s, w: n.w }));
export const PUNTOS = Array.from(M.PUNTOS_MADUREZ, (p) => ({ n: p.n, t: p.t, q: p.q }));
export const RESICO = [['Hasta $25,000.00', '1.00 %'], ['Hasta $50,000.00', '1.10 %'], ['Hasta $83,333.33', '1.50 %'], ['Hasta $208,333.33', '2.00 %'], ['Hasta $3,500,000.00', '2.50 %']];
export const INCERTIDUMBRE = [['Demanda mensual (clientes)', pct(M.INCERTIDUMBRE.demandaMensual, 0), 'Desviación relativa, independiente cada mes'], ['Ticket promedio', pct(M.INCERTIDUMBRE.ticket, 0), 'Desviación relativa, por mes'],
  ['Choque anual de demanda', pct(M.INCERTIDUMBRE.demandaAnual, 0), 'Desviación (logarítmica) común a los 12 meses del año'], ['Costo variable efectivo', '2 pp', 'Desviación absoluta'],
  ['Coeficientes β (rango plausible)', pct(M.INCERTIDUMBRE.betaRelativa, 0), 'Desviación relativa de cada β'], ['Intercepto β₀ (rango plausible)', M.INCERTIDUMBRE.intercepto.toFixed(2), 'Desviación absoluta']];
export const SIMULACIONES = M.N_SIM, SEMILLA = M.SEMILLA, BETA0 = M.BETA0;

// ---------- Pruebas y módulos ----------
const nombres = (f) => [...leer(f).matchAll(/^\s*test\('((?:[^'\\]|\\.)*)'/gm)].map((m) => m[1]);
export const PRUEBAS_UNITARIAS = ['tests/modelo.test.mjs', 'tests/ia.test.mjs'].flatMap((f) => nombres(f).map((n) => [f.replace('tests/', ''), n]));
export const PRUEBAS_E2E = fs.readdirSync(new URL('../../tests/e2e/', import.meta.url)).filter((f) => f.endsWith('.spec.js')).map((f) => [f, (leer('tests/e2e/' + f).match(/^\s*test\(/gm) || []).length]);
export const MODULOS = MODULOS_JS.filter((m) => fs.existsSync(new URL('../../' + m, import.meta.url)) && !m.includes('vendor')).map((m) => {
  const t = leer(m), c = /\/\*\s*-*\s*(?:\d+[-\w]*\.\s*)?([^\n*]+?)\s*-*\s*(?:\*\/|\n)/.exec(t);
  return [m, String(t.split('\n').length), c ? c[1].replace(/-+$/, '').trim().slice(0, 110) : ''];
});

// ---------- Fuentes ----------
export const FUENTES = [
  ['INEGI (2020). Tabulado nacional de supervivencia, mortalidad y esperanza de vida de los negocios, 1989–2019. Demografía de los Negocios.', 'https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx'],
  ['INEGI (2021). Censo de Población y Vivienda 2020.', 'https://www.inegi.org.mx/programas/ccpv/2020/'],
  ['INEGI (2026). Directorio Estadístico Nacional de Unidades Económicas (DENUE), edición 05/2026.', 'https://www.inegi.org.mx/app/mapa/denue/'],
  ['INEGI (2020). Censos Económicos 2019.', 'https://www.inegi.org.mx/programas/ce/2019/'],
  ['Gobierno de Coacalco de Berriozábal. Datos económicos: unidades económicas y valor agregado, 2013–2020.', 'https://coacalco.gob.mx/datos-economicos/'],
  ['CONEVAL (2021). Medición de la pobreza a nivel municipal 2010–2020.', 'https://www.coneval.org.mx/Medicion/Paginas/Pobreza-municipal.aspx'],
  ['Secretaría de Economía. Data México: Coacalco de Berriozábal.', 'https://www.economia.gob.mx/datamexico/es/profile/geo/coacalco-de-berriozabal'],
  ['Cámara de Diputados. Ley del Impuesto sobre la Renta, artículos 9 y 113-E.', 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf'],
  ['Cámara de Diputados. Ley Federal del Derecho de Autor.', 'https://www.diputados.gob.mx/LeyesBiblio/ref/lfda.htm'],
  ['Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society, Series B, 34(2), 187–220.', ''],
  ['Kaplan, E. L. y Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association, 53(282), 457–481.', ''],
  ['Hosmer, D. W., Lemeshow, S. y Sturdivant, R. X. (2013). Applied Logistic Regression (3.ª ed.). Wiley.', ''],
  ['Metropolis, N. y Ulam, S. (1949). The Monte Carlo method. Journal of the American Statistical Association, 44(247), 335–341.', ''],
  ['Box, G. E. P. y Muller, M. E. (1958). A note on the generation of random normal deviates. The Annals of Mathematical Statistics, 29(2), 610–611.', ''],
  ['Hyndman, R. J. y Fan, Y. (1996). Sample quantiles in statistical packages. The American Statistician, 50(4), 361–365.', ''],
  ['Efron, B. (1979). Bootstrap methods: another look at the jackknife. The Annals of Statistics, 7(1), 1–26.', ''],
  ['JPMorgan Chase Institute (2016). Cash is King: Flows, Balances, and Buffer Days. Evidence from 600,000 Small Businesses.', 'https://www.jpmorganchase.com/institute/all-topics/business-growth-and-entrepreneurship/report-cash-flows-balances-and-buffer-days'],
  ['W3C (2018). Web Content Accessibility Guidelines (WCAG) 2.1.', 'https://www.w3.org/TR/WCAG21/'],
  ['OpenStreetMap Foundation. Copyright y licencia ODbL.', 'https://www.openstreetmap.org/copyright'],
];
