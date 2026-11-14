// Genera entregables/COATL_Presentacion.pptx (16:9) con cifras del propio modelo.
// Uso: node scripts/presentacion_pptx.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import PptxGenJS from 'pptxgenjs';
import { REF, FUENTES, AUTORES } from './datos_reporte.mjs';
import { execSync } from 'node:child_process';
// Conteos reales de pruebas al generar (no a mano).
const UNITARIAS = ['tests/modelo.test.mjs', 'tests/ia.test.mjs'].map((t) => (fs.readFileSync(t, 'utf8').match(/^test\(/gm) || []).length).reduce((a, x) => a + x, 0);
const E2E = +(/Total: (\d+) tests?/.exec(execSync('npx playwright test --list', { encoding: 'utf8' })) || [])[1] || 0;

const C = { rojo: 'C8102E', granate: '7A0C1F', hueso: 'FBF6F3', tinta: '38070F', gris: '6E464B', rosa: 'E9B9BE', blanco: 'FFFFFF' };
const { e, mc, f, rp, mxn, pct, modelo, M } = REF;
const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5 in
pres.title = 'COATL · Presentación';
pres.author = AUTORES.join(', ');
const FT = 'Bricolage Grotesque', FC = 'Hanken Grotesk';   // tipografías del sitio (assets/fuentes, OFL)

// Greca escalonada (xicalcoliuhqui simplificada) como borde superior/inferior.
function greca(s, y, color = C.rojo) {
  for (let x = 0; x < 13.33; x += 0.4) {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.13, h: 0.13, fill: { color }, line: { color } });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.13, y: y - 0.13, w: 0.13, h: 0.26, fill: { color }, line: { color } });
  }
}
function lamina(titulo, folio, fondo = C.hueso) {
  const s = pres.addSlide();
  s.background = { color: fondo };
  greca(s, 0.25);
  s.addText(folio, { x: 0.6, y: 0.55, w: 12, h: 0.3, fontFace: FC, fontSize: 11, color: C.rojo, bold: true, charSpacing: 2 });
  s.addText(titulo, { x: 0.6, y: 0.85, w: 12.1, h: 0.8, fontFace: FT, fontSize: 30, bold: true, color: C.tinta });
  s.addText('COATL · Probabilidad y Estadística · 2026', { x: 0.6, y: 7.05, w: 8, h: 0.3, fontFace: FC, fontSize: 9, color: C.gris });
  return s;
}
const vinetas = (s, items, o) => s.addText(items.map((t) => ({ text: t, options: { bullet: { indent: 18 }, paraSpaceAfter: 8 } })), { fontFace: FC, fontSize: 17, color: C.tinta, valign: 'top', ...o });
const kpi = (s, x, y, v, k, w = 2.9) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.35, rectRadius: 0.08, fill: { color: C.blanco }, line: { color: C.rosa }, shadow: { type: 'outer', color: '000000', opacity: 0.12, blur: 6, offset: 2, angle: 90 } });
  s.addText(v, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.65, fontFace: FT, fontSize: 26, bold: true, color: C.rojo });
  s.addText(k, { x: x + 0.15, y: y + 0.78, w: w - 0.3, h: 0.5, fontFace: FC, fontSize: 12, color: C.gris });
};
const formula = (s, t, y) => {
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.55, fill: { color: C.rojo }, line: { color: C.rojo } });
  s.addText(t, { x: 0.8, y, w: 11.9, h: 0.55, fontFace: 'Spline Sans Mono', fontSize: 16, color: C.tinta, fill: { color: C.blanco } });
};
const img = (ruta) => 'data:image/png;base64,' + fs.readFileSync(ruta).toString('base64');
const tam = (ruta) => { const b = fs.readFileSync(ruta); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
function imagen(s, ruta, x, y, wMax, hMax) {
  const [w, h] = tam(ruta), k = Math.min(wMax / w, hMax / h);
  s.addImage({ data: img(ruta), x: x + (wMax - w * k) / 2, y, w: w * k, h: h * k });
}

// 1 · Portada
{
  const s = pres.addSlide();
  s.background = { color: C.granate };
  greca(s, 0.3, C.rojo); greca(s, 7.1, C.rojo);
  s.addText('COATL', { x: 0.8, y: 1.4, w: 11.7, h: 1.4, fontFace: FT, fontSize: 88, bold: true, color: C.blanco });
  s.addText('Cálculo de Oportunidad y Análisis Territorial Local', { x: 0.8, y: 2.8, w: 11.7, h: 0.6, fontFace: FC, fontSize: 24, color: C.rosa });
  s.addText('¿Qué tan probable es que tu negocio en Coacalco siga operando y sea rentable al tercer año?', { x: 0.8, y: 3.6, w: 11, h: 0.9, fontFace: FC, fontSize: 20, italic: true, color: C.blanco });
  s.addText([
    { text: AUTORES.join('  ·  '), options: { bold: true, breakLine: true } },
    { text: 'Probabilidad y Estadística · Mtra. Noemí Daniela Palacios Fermín', options: { breakLine: true } },
    { text: 'Jornada Académica Empresarial · Noviembre 2026' },
  ], { x: 0.8, y: 5.2, w: 11.7, h: 1.3, fontFace: FC, fontSize: 15, color: C.blanco });
}

// 2 · El problema
{
  const s = lamina('El problema: abrir un negocio es apostar a ciegas', '01 · CONTEXTO');
  kpi(s, 0.6, 1.9, '31 de 100', 'negocios en México mueren antes de cumplir un año (INEGI, 1989–2019)', 3.9);
  kpi(s, 4.7, 1.9, pct(M.S0[3]), 'sobreviven a 3 años a nivel nacional (INEGI)', 3.9);
  kpi(s, 8.8, 1.9, '8.4 años', 'esperanza de vida al nacer de un negocio (INEGI)', 3.9);
  vinetas(s, [
    'Coacalco de Berriozábal: 293,444 habitantes (Censo 2020) y 11,018 unidades económicas (2020).',
    'Las unidades económicas crecieron 3.7 % al año desde 2013: más mercado, pero también más competencia.',
    'Quien emprende decide con intuición; COATL convierte esa decisión en una probabilidad con su incertidumbre.',
  ], { x: 0.6, y: 3.6, w: 12.1, h: 3.2 });
}

// 3 · Qué es COATL
{
  const s = lamina('COATL: un simulador estadístico del territorio', '02 · LA HERRAMIENTA');
  imagen(s, 'docs/capturas/inicio.png', 0.6, 1.8, 6.6, 4.9);
  vinetas(s, [
    '35 giros de negocio, 6 zonas del municipio y 32 variables en 4 pestañas.',
    'Resultado en vivo: probabilidad, rango plausible, utilidad, equilibrio, ROI, payback y VPN.',
    'Mapa real de zonas, FODA cuantificado y plan de acción.',
    'Comparar escenarios, compartir por enlace y exportar a PDF.',
  ], { x: 7.5, y: 1.9, w: 5.3, h: 4.9, fontSize: 16 });
}

// 4 · Metodología
{
  const s = lamina('Cinco herramientas del curso, encadenadas', '03 · METODOLOGÍA');
  imagen(s, 'docs/diagrama-proceso.png', 0.6, 1.75, 7.0, 5.15);
  vinetas(s, [
    'Modelo logístico: P = 1/(1+e^(−z)), con β₀ calibrado a la tabla del INEGI.',
    'Riesgos proporcionales: S(t) = S₀(t)^h.',
    'Monte Carlo: 2,000 años con semilla fija y Box–Muller.',
    'Equilibrio y margen de seguridad.',
    'VPN, ROI y payback; FODA con ΔP real por palanca.',
  ], { x: 7.8, y: 1.85, w: 5.0, h: 5.0, fontSize: 15 });
}

// 5 · Fórmulas
{
  const s = lamina('Las fórmulas detrás del número', '03 · METODOLOGÍA');
  formula(s, 'z = β₀ + Σ βᵢ·xᵢ      P = 1 / (1 + e^(−z))      β₀ = ln(0.4261/0.5739) ≈ −0.298', 1.9);
  formula(s, 'h = ln P / ln S₀(3)      S(t) = S₀(t)^h      S₀: INEGI 1989–2019 (t = 1…5)', 2.75);
  formula(s, 'F ~ LogN(−σ²/2, 0.15²)   clientes ~ N(μF, (0.22μF)²)   ticket ~ N(t̄, (0.08t̄)²)', 3.6);
  formula(s, 'PE = CF / (t̄·(1−cv′))      MS = (V − PE$) / V', 4.45);
  formula(s, 'VPN = −I₀ + Σ S(t)·Uₜ/(1+r)ᵗ      ROI = Ū/I₀      Payback = I₀/U_mes', 5.3);
  s.addText('Cuantiles con interpolación lineal (tipo 7). El rango de P perturba cada βᵢ ±30 % en 1,000 sorteos: es sensibilidad, no un intervalo muestral.', { x: 0.6, y: 6.15, w: 12.1, h: 0.6, fontFace: FC, fontSize: 13, italic: true, color: C.gris });
}

// 6 · Escenario de referencia
{
  const s = lamina('Escenario de referencia: Cafetería · Los Héroes', '04 · RESULTADOS');
  kpi(s, 0.6, 1.85, pct(modelo.P), `probabilidad a 3 años (rango ${pct(rp.p05, 0)}–${pct(rp.p95, 0)})`);
  kpi(s, 3.65, 1.85, mxn.format(Math.round(e.utilMes)), 'utilidad mensual esperada');
  kpi(s, 6.7, 1.85, f.payback.toFixed(1) + ' meses', 'recuperación de la inversión');
  kpi(s, 9.75, 1.85, mxn.format(Math.round(f.vpn)), 'VPN a 3 años (r = 12 %)');
  imagen(s, 'docs/capturas/simulador-resultados.png', 0.6, 3.4, 6.1, 3.5);
  vinetas(s, [
    `Supera el ${pct(M.S0[3])} de supervivencia nacional a 3 años.`,
    `Monte Carlo: P5 ${mxn.format(Math.round(mc.p05))} · mediana ${mxn.format(Math.round(mc.p50))} · P95 ${mxn.format(Math.round(mc.p95))} al año.`,
    `Equilibrio con ${Math.ceil(e.peDia)} clientes/día; se esperan 60 (margen de seguridad de ${pct(e.ms, 0)}).`,
    'Cifras antes de impuestos y sin valor terminal.',
  ], { x: 7.0, y: 3.45, w: 5.8, h: 3.4, fontSize: 15 });
}

// 7 · Análisis y mapa
{
  const s = lamina('¿De qué depende? Sensibilidad y territorio', '04 · RESULTADOS');
  imagen(s, 'docs/capturas/analisis.png', 0.6, 1.8, 6.2, 2.7);
  imagen(s, 'docs/capturas/mapa.png', 7.0, 1.8, 5.8, 5.0);
  vinetas(s, [
    'El tornado muestra el aporte β de cada variable; el margen de seguridad (+0.25) es el que más suma.',
    'El mapa real (70 AGEB oficiales del INEGI) evalúa el mismo negocio en las 6 zonas, con su renta y afluencia.',
    'El FODA mide el ΔP real de cada palanca y arma un plan de 3 acciones.',
  ], { x: 0.6, y: 4.65, w: 6.2, h: 2.3, fontSize: 14 });
}

// 8 · Honestidad del modelo
{
  const s = lamina('Lo que el modelo sabe y lo que supone', '05 · SUPUESTOS Y LIMITACIONES');
  s.addText('No existe el «margen de error inexistente»: COATL muestra su incertidumbre y separa el dato oficial, el supuesto y el resultado.', { x: 0.6, y: 1.8, w: 12.1, h: 0.7, fontFace: FC, fontSize: 17, bold: true, color: C.granate });
  vinetas(s, [
    'Dato oficial: población, unidades económicas, valor agregado, pobreza y tabla de supervivencia del INEGI.',
    'Supuesto del equipo: coeficientes β, afluencia y renta por zona, ticket y costo por giro, desviaciones del Monte Carlo y años 6–10 de la tabla.',
    'Resultado del modelo: P con su rango plausible, la distribución de la utilidad y los indicadores financieros.',
    'Ruta de precisión: estimar los β con el panel del DENUE (riesgo en tiempo discreto), demanda con el modelo de Huff, y validar con Brier, calibración y TRIPOD (docs/METODOS_PRECISION.md).',
  ], { x: 0.6, y: 2.6, w: 12.1, h: 4.2 });
}

// 9 · Calidad
{
  const s = lamina('Calidad verificable', '06 · VALIDACIÓN');
  kpi(s, 0.6, 1.9, `${UNITARIAS} + ${E2E}`, 'pruebas unitarias y en navegador (computadora y teléfono)', 2.9);
  kpi(s, 3.65, 1.9, 'JS = Python', 'reimplementación independiente, idéntica bit a bit', 2.9);
  kpi(s, 6.7, 1.9, '8 / 8', 'hallazgos de la revisión con Codex corregidos', 2.9);
  kpi(s, 9.75, 1.9, '0 · 0', 'violaciones WCAG 2.1 AA (axe) y vulnerabilidades (npm audit)', 2.9);
  vinetas(s, [
    'Integración continua: cada cambio se prueba antes de publicarse en GitHub Pages.',
    'Datos verificados contra INEGI, CONEVAL y el Gobierno de Coacalco el 12-nov-2026.',
    'Sin datos personales, sin cookies ni analítica (LFPDPPP). Obra protegida (LFDA, arts. 11–13).',
  ], { x: 0.6, y: 3.6, w: 12.1, h: 3.2 });
}

// 9b · Novedades v8
{
  const s = lamina('Nuevo en la versión 8', '07 · EVOLUCIÓN');
  imagen(s, 'docs/capturas/asistente.png', 0.6, 1.8, 6.4, 4.9);
  vinetas(s, [
    'IA de COATL: el asistente y «Describe tu negocio» usan Gemini con la clave del proyecto, guardada en un servidor intermedio; el visitante no pone ninguna clave.',
    'Mapa real en Inicio y en el Simulador con las 70 AGEB del INEGI; se retiró el esquema hecho a mano.',
    'Pestañas de apartados que se reordenan arrastrando o con el teclado.',
    'Teléfono vertical y horizontal sin pérdida de información (probado).',
  ], { x: 7.3, y: 1.9, w: 5.5, h: 4.9, fontSize: 15 });
}

// 9c · Coacalco en imágenes
{
  const s = lamina('Coacalco en imágenes: los escenarios del modelo', '07 · TERRITORIO');
  const fotos = [['mexibus', 'Movilidad'], ['power-center', 'Comercio regional'], ['calle-chiapas', 'Comercio de barrio'], ['cafeteria', 'Escenario de referencia']];
  const cred = JSON.parse(fs.readFileSync('assets/img/escenarios/creditos.json', 'utf8'));
  fotos.forEach(([id, t], i) => {
    const x = 0.6 + i * 3.08;
    // PowerPoint no garantiza WebP: copia JPG temporal (ffmpeg)
    const jpg = path.join(os.tmpdir(), `coatl-${id}.jpg`);
    execSync(`ffmpeg -loglevel error -y -i assets/img/escenarios/${id}.webp -q:v 3 "${jpg}"`);
    s.addImage({ path: jpg, x, y: 1.9, w: 2.9, h: 1.93 });
    s.addText(t, { x, y: 3.9, w: 2.9, h: 0.4, fontFace: FT, fontSize: 15, bold: true, color: C.rojo });
    s.addText(`${cred[id].titulo} · ${cred[id].autor} · ${cred[id].licencia}`, { x, y: 4.3, w: 2.9, h: 0.7, fontFace: FC, fontSize: 9, color: C.gris, valign: 'top' });
  });
  vinetas(s, [
    'Fotografías reales de Wikimedia Commons con su licencia; en el sitio ninguna se repite.',
    'Cada zona del modelo tiene un perfil de demanda y renta distinto: el mismo negocio no rinde igual en todas.',
  ], { x: 0.6, y: 5.2, w: 12.1, h: 1.6, fontSize: 15 });
}

// 10 · Cierre
{
  const s = pres.addSlide();
  s.background = { color: C.granate };
  greca(s, 0.3, C.rojo); greca(s, 7.1, C.rojo);
  s.addText('No adivines. Calcula.', { x: 0.8, y: 1.6, w: 11.7, h: 1.2, fontFace: FT, fontSize: 54, bold: true, color: C.blanco });
  s.addText('maikolv.github.io/coatl', { x: 0.8, y: 3.0, w: 11.7, h: 0.7, fontFace: FC, fontSize: 28, color: C.rosa });
  s.addText(FUENTES.map(([t]) => ({ text: t, options: { breakLine: true } })), { x: 0.8, y: 4.2, w: 11.7, h: 2.0, fontFace: FC, fontSize: 11, color: C.blanco });
  s.addText(AUTORES.join('  ·  '), { x: 0.8, y: 6.3, w: 11.7, h: 0.5, fontFace: FC, fontSize: 14, bold: true, color: C.blanco });
}

await pres.writeFile({ fileName: 'entregables/COATL_Presentacion.pptx' });
console.log('entregables/COATL_Presentacion.pptx generado (' + pres.slides.length + ' láminas)');
