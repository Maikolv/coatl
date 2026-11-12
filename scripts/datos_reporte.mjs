// Cifras del escenario de referencia calculadas con el MISMO código del sitio,
// para que el reporte Word y la presentación nunca se desalineen del modelo.
import { cargarModelo, escenarioReferencia } from '../tests/cargar.mjs';

const M = cargarModelo();
const e = escenarioReferencia(M);
const modelo = M.modeloLogistico(e);
const S = M.curvaSupervivencia(modelo.P);
const mc = M.monteCarlo(e);
const f = M.finanzas(e, mc, S);
const rp = M.rangoP(modelo);

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const pct = (x, d = 1) => (100 * x).toFixed(d) + ' %';

export const REF = {
  M, e, modelo, S, mc, f, rp, mxn, pct,
  filas: [
    ['Probabilidad de seguir operando y rentable a 3 años (P)', pct(modelo.P)],
    ['Rango plausible de P (P5–P95, sensibilidad a los β)', pct(rp.p05) + ' – ' + pct(rp.p95)],
    ['Utilidad mensual esperada (antes de impuestos)', mxn.format(Math.round(e.utilMes))],
    ['Punto de equilibrio', Math.ceil(e.peDia) + ' clientes/día'],
    ['Margen de seguridad', pct(e.ms)],
    ['Utilidad anual Monte Carlo P5 · P50 · P95', `${mxn.format(Math.round(mc.p05))} · ${mxn.format(Math.round(mc.p50))} · ${mxn.format(Math.round(mc.p95))}`],
    ['P(utilidad anual > 0)', pct(mc.pPos)],
    ['ROI anual esperado', pct(f.roi)],
    ['Recuperación de la inversión (payback)', f.payback.toFixed(1) + ' meses'],
    ['VPN a 3 años (r = 12 %)', mxn.format(Math.round(f.vpn))],
  ],
  supervivencia: [1, 2, 3, 5, 10].map((t) => [t, M.S0[t], S[t]]),
  contribuciones: modelo.contribs.filter((c) => c[1] !== 0),
};

export const FUENTES = [
  ['INEGI. Nota sobre los indicadores de la Demografía de los Negocios (tabla 1989–2019), 2021.', 'https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf'],
  ['INEGI. Censo de Población y Vivienda 2020.', 'https://www.inegi.org.mx/programas/ccpv/2020/'],
  ['Gobierno de Coacalco de Berriozábal. Datos económicos (unidades económicas y valor agregado 2013–2020).', 'https://coacalco.gob.mx/datos-economicos/'],
  ['CONEVAL. Pobreza a nivel municipio 2010–2020.', 'https://www.coneval.org.mx/InformesPublicaciones/Paginas/Mosaicos/Informe_Pobreza_Municipios_Mexico_2020.aspx'],
  ['Secretaría de Economía. Data México: Coacalco de Berriozábal.', 'https://www.economia.gob.mx/datamexico/es/profile/geo/coacalco-de-berriozabal'],
];

export const AUTORES = ['Miguel Antonio Cruz García', 'Bruno Alejandro López Bautista', 'Alonso Arroyo Cortés'];
