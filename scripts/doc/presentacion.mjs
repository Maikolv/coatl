// Presentación de COATL: un mismo guion de láminas se entrega como PDF (compuesto con el navegador, con las
// tipografías, la greca y el logotipo del sitio) y como PowerPoint editable (pptxgenjs). Todas las cifras salen
// del modelo (datos.mjs) y el historial de versiones, de data/versiones.json.
import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';
import { RAIZ, COL, LOGO, GRECA_URI, FUENTES_CSS, esc, enLinea, textoPlano, imagenURI, abrirNavegador } from './kit.mjs';
import * as D from './datos.mjs';

const { REF, mxn, pct } = D;
const S0 = D.M.S0;
const extremos = D.SENSIBILIDAD.map((s) => { const f = [...s.filas].sort((x, y) => parseFloat(y[2]) - parseFloat(x[2])); return [s.variable, f[0][0], f[0][2], f[f.length - 1][0], f[f.length - 1][2]]; });
const planos = D.MATRIZ.flatMap((f) => f.celdas.map((c, i) => ({ giro: f.giro, zona: D.ZONAS[i].n.split(' · ')[0], P: c.P }))).sort((a, b) => b.P - a.P);
const porPestana = ['Negocio', 'Ubicación', 'Finanzas', 'Operación'].map((t) => [t, String(D.VARIABLES.filter((v) => v.pestana === t).length), D.VARIABLES.filter((v) => v.pestana === t).slice(0, 6).map((v) => v.nombre).join(', ') + '…']);

// ---------- Guion ----------
export function laminas() {
  const L = [];
  const sec = (titulo, sub) => L.push({ tipo: 'seccion', titulo, sub });
  const lam = (titulo, o) => L.push({ tipo: 'contenido', titulo, ...o });
  L.push({ tipo: 'portada', titulo: 'COATL', sub: 'Cálculo de Oportunidad y Análisis Territorial Local', nota: '¿Qué probabilidad tiene tu negocio de sobrevivir en Coacalco?' });
  lam('El problema: la mayoría de los negocios no llega a tres años', { kpis: [[Math.round(S0[1] * 100) + ' de 100', 'siguen al año 1'], [Math.round(S0[3] * 100) + ' de 100', 'siguen al año 3'], [Math.round(S0[5] * 100) + ' de 100', 'siguen al año 5'], [Math.round(S0[10] * 100) + ' de 100', 'siguen al año 10']],
    puntos: ['Fuente: INEGI, tabla nacional de supervivencia de los negocios 1989–2019.', 'El primer año es el más peligroso: cierra ' + pct(1 - S0[1]) + ' de los negocios.', 'Las cifras nacionales no distinguen giro, zona ni condiciones del negocio.'] });
  lam('La pregunta que nadie le responde al emprendedor', { puntos: ['**¿Qué probabilidad tiene *mi* negocio, *aquí*, con *estos* números?**', 'Una cafetería no es una ferretería; una avenida comercial no es una colonia habitacional.', 'Abrir con reservas y experiencia no es lo mismo que abrir endeudado y sin conocer el giro.', 'Sin una estimación propia, la decisión se toma a ciegas.'] });
  lam('La propuesta: COATL', { puntos: ['Sitio web gratuito, sin registro y sin servidor: todo se calcula en el navegador.', `${D.VARIABLES.length} variables del negocio → probabilidad a 3 años, utilidad, riesgo y punto de equilibrio, en vivo.`, 'Cuatro modelos encadenados y anclados a datos oficiales del INEGI.', 'Convierte el resultado en un plan y en un reporte que el usuario se lleva.', 'COATL es un producto en sí mismo: una herramienta en la que puede invertirse.'], img: 'docs/capturas/inicio.png', recorte: 0.62 });
  lam('Coacalco de Berriozábal en cifras', { tabla: { cab: ['Indicador', 'Valor', 'Fuente'], filas: [['Población', '293,444 habitantes', 'INEGI, Censo 2020'], ['Unidades económicas', '8,517 (2013) → 11,018 (2020)', 'IGECEM'], ['Crecimiento del padrón', '3.7 % anual', 'Cálculo propio'], ['Valor agregado censal bruto', '$17,179.6 millones', 'Gobierno de Coacalco, 2020'], ['Población fuera de pobreza', '71.4 %', 'CONEVAL 2020'], ['Establecimientos en el DENUE', '11,554 en 424 actividades', 'INEGI, DENUE 05/2026']] } });
  lam('Seis zonas, seis mercados distintos', { tabla: { cab: ['Zona', 'Afluencia', 'Renta por m²', 'β'], filas: D.ZONAS.map((z) => [z.n, z.afl.toFixed(2), mxn(z.rm2), (z.z >= 0 ? '+' : '−') + Math.abs(z.z).toFixed(2)]) }, pie: 'Límites: 70 AGEB oficiales del INEGI. Agrupación, afluencia, renta y coeficiente: estimaciones del equipo.' });
  sec('Datos', 'Qué es oficial y qué es estimación del equipo');
  lam('Fuentes y procedencia de cada cifra', { tabla: { cab: ['Elemento', 'Procedencia'], filas: [['Supervivencia base S₀(t)', 'Oficial · INEGI, Demografía de los Negocios 1989–2019'], ['Población, pobreza, unidades económicas', 'Oficial · INEGI, CONEVAL, IGECEM'], ['Conteos por actividad y municipio', 'Oficial · INEGI, DENUE 05/2026'], ['Contraste de cada giro', 'Oficial · INEGI, Censos Económicos 2019'], ['Coeficientes β de giro y zona', 'DENUE 2019 → 2024 (regresión logística)'], ['Demás coeficientes β', 'Estimación del equipo'], ['Ticket, costos y demanda por giro', 'Estimación del equipo'], ['Afluencia y renta por zona', 'Estimación del equipo'], ['Desviaciones del Monte Carlo', 'Supuesto del equipo']] }, pie: 'En el sitio, cada número lleva su etiqueta: dato oficial, resultado del modelo o estimación del equipo.' });
  lam('La tabla que ancla todo el modelo', { tabla: { cab: ['Año t', 'S₀(t)', 'Siguen de cada 100', 'Cierres en el año'], filas: [1, 2, 3, 4, 5, 7, 10].map((t) => [String(t), S0[t].toFixed(4), String(Math.round(S0[t] * 100)), pct(1 - S0[t] / S0[t - 1])]) }, pie: 'INEGI, tabulado nacional Nal_Tot_CE2019. Se aplica a Coacalco sin ajuste municipal.' });
  lam('β de giro y zona estimados con datos reales', { kpis: [[D.SUP.n.toLocaleString('es-MX'), 'negocios jóvenes'], [pct(D.SUP.cohortes[0].tasa_nuevos), 'siguen 5 años después'], [D.SUP.n_coacalco.toLocaleString('es-MX'), 'en Coacalco']],
    puntos: ['Cohorte: negocios que el INEGI incorporó al DENUE en la actualización censal de 2019 (Estado de México).', 'Resultado: si siguen en la edición de 2024, la siguiente depuración censal.', 'Regresión logística con errores estándar; efectos contraídos por Bayes empírico.', 'Desaparecer no siempre es cerrar: solo se usan diferencias; el nivel sigue anclado al INEGI.'] });
  lam('Lo que dicen los datos: giros', { tabla: { cab: ['Giro', 'β', 'EE', 'Negocios', 'Supuesto anterior'], filas: [...D.TABLA_BETA_GIROS].filter((r) => r[7] === 'DENUE').sort((a, b) => parseFloat(b[1].replace('−', '-')) - parseFloat(a[1].replace('−', '-'))).filter((_, i, l) => i < 5 || i >= l.length - 5).map((r) => [r[0], r[1], r[2], r[4], r[6]]) }, pie: 'Los cinco giros con mayor y menor supervivencia relativa. β > 0: sobrevive más que el promedio.' });
  lam('Lo que dicen los datos: zonas de Coacalco', { tabla: { cab: ['Zona', 'β', 'EE', 'Negocios', 'Supuesto anterior'], filas: D.TABLA_BETA_ZONAS.map((r) => [r[0], r[1], r[2], r[4], r[6]]) }, pie: 'El corredor López Portillo tiene más rotación de negocios de lo supuesto: la afluencia sube la demanda, pero también la competencia y los cierres.' });
  sec('Los cuatro modelos', 'Logística · supervivencia · Monte Carlo · finanzas');
  lam('1 · Regresión logística', { formula: 'z = β₀ + Σ βᵢ          P = 1 / (1 + e^(−z))', puntos: ['Cada variable aporta un coeficiente β al logaritmo de los momios.', `Hay ${REF.modelo.contribs.length} contribuciones: giro, zona, trece opciones del formulario y dos derivadas por tramos.`, 'Los efectos no se suman en probabilidad: el mismo β mueve más a P cerca de 50 %.', 'P se acota entre 4 % y 93 %: el modelo no afirma certezas.'] });
  lam('Calibración: un escenario neutro da el promedio nacional', { formula: `β₀ = ln( ${S0[3]} / ${(1 - S0[3]).toFixed(4)} ) = ${D.BETA0.toFixed(4)}`, puntos: ['Sin ventajas ni desventajas, COATL devuelve la supervivencia nacional a 3 años: ' + pct(S0[3]) + '.', 'Cada β desplaza la estimación respecto de ese promedio.', 'Es la decisión que le da sentido estadístico al modelo.'] });
  lam(`Las ${D.VARIABLES.length} variables del simulador`, { tabla: { cab: ['Pestaña', 'Variables', 'Ejemplos'], filas: porPestana }, pie: 'Incluye riesgo de extorsión, pago de piso, resiliencia y motivación, neutras por defecto.' });
  lam('Rango plausible: honestidad sobre los coeficientes', { formula: 'z⁽ʲ⁾ = β₀ + 0.15·ε₀ + Σ βᵢ·(1 + 0.30·εᵢ)        j = 1…1000', puntos: ['Giro y zona ya tienen error estándar (DENUE); los demás β son supuestos del equipo.', 'Se perturban 1,000 veces y se reportan los percentiles 5 y 95 de P.', '**Es un análisis de sensibilidad, no un intervalo de confianza.**', `Escenario de referencia: ${REF.P}, rango plausible ${REF.rango}.`] });
  lam('2 · Supervivencia por riesgos proporcionales', { formula: 'θ = ln P / ln S₀(3)          S(t) = S₀(t) ^ θ', puntos: ['Se impone S(3) = P y se conserva la forma de la curva nacional.', 'θ < 1: menos riesgo que el promedio en todos los años; θ > 1: más.', `Escenario de referencia: θ = ${REF.h.toFixed(4)}.`] });
  lam('3 · Monte Carlo: 2,000 años simulados', { puntos: [`Generador mulberry32 con semilla fija (${D.SEMILLA}) y transformación de Box–Muller: resultados reproducibles.`, 'Choque anual común de demanda: un mal año afecta a los doce meses a la vez.', 'Ruido mensual de clientes y de ticket; ruido en el costo variable.', 'Escenarios: percentil 5 (pesimista), mediana (esperado) y percentil 95 (optimista), cuantil tipo 7.'] });
  lam('Supuestos de incertidumbre', { tabla: { cab: ['Fuente de variación', 'Magnitud', 'Cómo entra'], filas: D.INCERTIDUMBRE }, pie: 'Todos son supuestos del equipo, declarados en el sitio.' });
  lam('4 · Finanzas', { formula: 'VPN = −I₀ + Σ S(t)·Uₜ / (1 + r)ᵗ      ROI = Ū / I₀      Recuperación = I₀ / U_mes', puntos: ['El VPN pondera cada flujo anual por la probabilidad de seguir operando.', 'Punto de equilibrio y margen de seguridad en clientes por día.', 'Antes de impuestos, sin depreciación ni valor terminal: se declara.'] });
  sec('Resultados', 'Escenario de referencia: cafetería en Los Héroes');
  lam('El escenario de referencia', { kpis: [[REF.P, 'probabilidad a 3 años'], [REF.utilidad, 'utilidad mensual'], [REF.roi, 'ROI anual'], [REF.payback, 'recuperación'], [REF.vpn, 'VPN a 3 años']], puntos: [`Rango plausible de P: ${REF.rango}. Promedio nacional: ${pct(S0[3])}.`, `Equilibrio con ${Math.ceil(REF.e.peDia)} clientes al día; se esperan ${REF.e.mu}.`, 'Estas cifras se vigilan con pruebas automáticas en cada cambio.'] });
  lam('Cómo se forma la probabilidad', { tabla: { cab: ['Contribución', 'β'], filas: REF.contribucionesActivas }, pie: `β₀ = ${D.BETA0.toFixed(3)} · z = ${REF.modelo.z.toFixed(4)} · P = ${REF.P}` });
  lam('Curva de supervivencia del escenario', { tabla: { cab: ['Año', 'Nacional', 'Escenario'], filas: [1, 2, 3, 5, 10].map((t) => [String(t), pct(S0[t]), pct(REF.S[t])]) }, img: 'docs/capturas/resultados.png', recorte: 0.7 });
  lam('Tres escenarios de un año', { kpis: [[mxn(REF.mc.p05), 'pesimista · P5'], [mxn(REF.mc.p50), 'esperado · mediana'], [mxn(REF.mc.p95), 'optimista · P95']], puntos: [`Media ${mxn(REF.mc.media)}; desviación estándar ${mxn(REF.mc.sd)}.`, `Años con utilidad positiva: ${pct(REF.mc.pPos)}.`, 'El Monte Carlo describe la operación; la probabilidad logística incorpora las causas de cierre que no son contables.'] });
  lam('Sensibilidad: qué opción de cada variable ayuda más', { tabla: { cab: ['Variable', 'Mejor opción', 'P', 'Peor opción', 'P'], filas: extremos.slice(0, 8) } });
  lam('Giro y zona: los extremos', { tabla: { cab: ['Giro', 'Zona', 'P a 3 años'], filas: [...planos.slice(0, 4), ...planos.slice(-4)].map((x) => [x.giro, x.zona, pct(x.P)]) }, pie: 'Cuatro combinaciones más altas y cuatro más bajas de 210 (35 giros × 6 zonas). Tabla completa en el documento técnico.' });
  sec('De la probabilidad a la decisión', 'Estrategia, mejora del negocio y resultado para llevar');
  lam('FODA cuantitativo y palancas', { puntos: ['Cada contribución del modelo se clasifica por su signo y por si depende del negocio.', 'Una palanca es un cambio concreto: reserva, deuda, margen, marketing, formalidad, experiencia, diferenciación, fidelización o zona.', 'Para cada una se vuelve a correr el modelo: el plan se ordena por puntos de probabilidad ganados.', 'El plan combinado aplica varias a la vez; los puntos no se suman.'], img: 'docs/capturas/estrategia.png', recorte: 0.62 });
  lam('Plan, impacto y calendario', { puntos: ['**Matriz de impacto y control:** qué pesa más y qué depende de ti. La probabilidad de cada riesgo no está medida, y se dice.', '**Calendario de 90 días:** hitos por mes e indicador de seguimiento por acción.', '**PDF propio del plan:** solo lo relevante del negocio, con la identidad del proyecto.'] });
  lam('Mejora tu negocio: diagnóstico de 5 niveles', { tabla: { cab: ['Nivel', 'Tema', 'Puntos', 'Peso'], filas: D.NIVELES.map((n) => [String(n.n), n.t, String(D.PUNTOS.filter((x) => x.n === n.n).length), Math.round(n.w * 100) + ' %']) }, pie: `${D.PUNTOS.length} puntos con un borrador a la medida en cada uno. Es una lista de verificación: no modifica la probabilidad.` });
  lam('Estimación fiscal orientativa', { tabla: { cab: ['Ingresos del mes', 'Tasa de ISR (RESICO)'], filas: D.RESICO }, puntos: [`Escenario de referencia: ISR ${mxn(REF.fiscal.isrMes)} al mes; utilidad después de ISR ${mxn(REF.fiscal.utilDespues)}.`, 'No es asesoría fiscal: se confirma con un contador.'] });
  lam('El resultado se lleva en el teléfono', { puntos: ['Reporte del negocio, plan y reporte completo en PDF: ninguno es una captura del sitio.', 'Un código QR abre el reporte completo en el teléfono.', 'El resultado viaja dentro del enlace: no se sube a ningún servidor.', 'El teléfono recalcula todo con el mismo motor y la misma semilla.'] });
  sec('Software y verificación', 'Cómo sabemos que el programa hace lo que dice');
  lam('Arquitectura', { puntos: ['Sin servidor: un archivo HTML autocontenido; todo se calcula en el navegador.', `Un solo motor: ${D.MODULOS.length} módulos; la interfaz, los reportes y estos documentos llaman a las mismas funciones.`, 'Monte Carlo en segundo plano (Web Worker) con respaldo síncrono.', 'Política de seguridad de contenido con hashes; recursos externos con verificación de integridad.', 'Publicación automática: GitHub prueba y solo publica si todo pasa.'], img: 'entregables/diagrama-proceso.png' });
  lam('Verificación en tres capas', { tabla: { cab: ['Capa', 'Qué comprueba', 'Tamaño'], filas: [['Pruebas unitarias', 'Fórmulas, tabla del INEGI, referencia, fiscal y diagnóstico', D.PRUEBAS_UNITARIAS.length + ' pruebas'], ['Validador en Python', 'Segunda implementación independiente del modelo', '1 programa'], ['Pruebas de navegador', 'Sitio real en computadora y teléfono', D.PRUEBAS_E2E.reduce((s, x) => s + x[1], 0) + ' casos × 2']] }, pie: 'La semilla fija hace que cada resultado sea reproducible en cualquier equipo.' });
  lam('Accesibilidad, privacidad y ética', { puntos: ['WCAG 2.1 nivel AA verificado automáticamente en todos los apartados.', 'Sin registro, sin cookies propias y sin analítica.', 'Los archivos de empresas no salen del navegador: una prueba lo vigila.', 'La IA apoya, pero nunca es fuente de las cifras.', 'No se afirma ningún nivel de exactitud que no pueda demostrarse.'] });
  sec('Historial de versiones', `De la importación inicial a la versión ${D.VERSION.id.replace('v', '')}`);
  lam('Evolución del escenario de referencia', { tabla: { cab: ['Versión', 'Qué cambió', 'P', 'Utilidad/mes', 'VPN'], filas: D.VERSIONES.map((v) => [v.id, v.titulo, v.referencia.P, v.referencia.utilidad, v.referencia.vpn]) }, pie: 'El modelo cambió de fondo tres veces (v1 a v3); desde entonces sus cifras se mantienen, vigiladas por pruebas.' });
  D.VERSIONES.forEach((v) => lam(`${v.id} · ${v.titulo}`, { sub: new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), kpis: [[v.referencia.P, 'P a 3 años'], [v.referencia.utilidad, 'utilidad mensual'], [v.referencia.roi, 'ROI anual'], [v.referencia.vpn, 'VPN a 3 años']], puntos: [`**Por qué:** ${v.motivo}`, ...v.cambios.slice(0, 5)], pie: `Modelo: ${v.modelo}`, chico: v.cambios.length > 4 }));
  sec('Cierre', 'Limitaciones, trabajo futuro y conclusiones');
  lam('Limitaciones declaradas', { puntos: ['Giro y zona se estiman con el DENUE; los demás β siguen siendo supuestos del equipo.', 'En el DENUE, desaparecer no siempre es cerrar: solo se usan diferencias entre giros y zonas.', 'La curva S₀(t) es nacional y de todos los sectores.', 'Las desviaciones del Monte Carlo son supuestos.', 'Ticket, costos, demanda, afluencia y renta son estimaciones propias, editables.', 'Las finanzas son antes de impuestos y sin valor terminal.', 'El rango plausible es sensibilidad, no confianza estadística.'] });
  lam('Trabajo futuro', { puntos: ['Estimar los β restantes con una encuesta local.', 'Repetir la estimación con la cohorte censal de 2024.', 'Usar tablas de supervivencia por sector y tamaño.', 'Validación retrospectiva con ediciones sucesivas del DENUE.', 'Distribución de Poisson para giros de poco flujo.', 'Replicar el modelo en otros municipios.'] });
  lam('Conclusiones', { puntos: [`COATL estima ${REF.P} para el escenario de referencia, frente a ${pct(S0[3])} del promedio nacional.`, 'Anclar el modelo a la tabla oficial le da un punto de partida verificable.', 'Declarar qué es dato y qué es supuesto lo hace honesto.', 'Vigilarlo con pruebas automáticas le permitió crecer sin que sus cifras se movieran.', 'Convierte una decisión a ciegas en una decisión informada.'] });
  lam('Referencias principales', { puntos: D.FUENTES.filter((_, i) => [0, 1, 2, 3, 9, 11, 12, 13, 14].includes(i)).map((f) => f[0]), chico: true });
  L.push({ tipo: 'cierre', titulo: 'Gracias', sub: 'maikolv.github.io/coatl', nota: D.AUTORES.join(' · ') });
  return L;
}

// ---------- PDF (HTML compuesto con el navegador) ----------
const CSS = `${FUENTES_CSS}
@page{size:338.67mm 190.5mm;margin:0}
*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:400 15pt/1.4 "Hanken Grotesk",sans-serif;color:${COL.tinta}}
.lam{width:338.67mm;height:190.5mm;position:relative;overflow:hidden;background:${COL.hueso};break-after:page;padding:34mm 16mm 16mm}
.cab{position:absolute;left:0;right:0;top:0;height:26mm;padding:0 16mm;display:flex;align-items:center;gap:9pt;background:#fff;border-bottom:1.4pt solid ${COL.rojo}}
.cab b{font:800 15pt "Bricolage Grotesque";color:${COL.rojo}}
.cab h1{font:800 21pt/1.1 "Bricolage Grotesque";color:${COL.tinta};margin:0 0 0 10pt;flex:1}
.cab .sub{font:400 9pt "Spline Sans Mono";color:${COL.granate};letter-spacing:.06em}
.greca{position:absolute;left:0;right:0;top:26mm;height:4.4mm;background:${GRECA_URI()} repeat-x;background-size:auto 4.4mm}
.pieL{position:absolute;left:16mm;right:16mm;bottom:5.5mm;display:flex;font:400 8pt "Spline Sans Mono";color:${COL.gris}}
.pieL span:last-child{margin-left:auto}
.cuerpo{display:flex;gap:9mm;height:100%;align-items:center}
.col{flex:1;min-width:0}
ul{margin:0;padding-left:18pt}li{margin-bottom:9pt}
.amplia{font-size:21pt}.amplia li{margin-bottom:13pt}.amplia .formula{font-size:19pt;padding:12pt 16pt;margin-bottom:16pt}.amplia .kpi b{font-size:30pt}.amplia .kpis{margin-bottom:16pt}
.chico{font-size:14pt}.chico li{margin-bottom:6pt}
.formula{font:400 14pt "Spline Sans Mono";background:#fff;border-left:4pt solid ${COL.rojo};padding:8pt 12pt;margin:0 0 10pt;white-space:pre-wrap}
table{width:100%;border-collapse:collapse;font-size:14pt;line-height:1.3}
th{background:${COL.granate};color:#fff;font:800 13pt "Bricolage Grotesque";text-align:left;padding:7pt 9pt}
td{padding:6pt 9pt;border-bottom:.6pt solid ${COL.niebla};background:#fff;vertical-align:top}
tbody tr:nth-child(even) td{background:${COL.rosa}}
.densa table{font-size:10pt}.densa td{padding:3pt 7pt}.densa th{font-size:10pt;padding:4pt 7pt}
.nota{font:italic 400 12pt "Hanken Grotesk";color:${COL.gris};margin-top:10pt}
.kpis{display:flex;gap:6mm;margin-bottom:9pt}
.kpi{flex:1;background:#fff;border-top:4pt solid ${COL.rojo};border-radius:5pt;padding:7pt 9pt}
.kpi b{display:block;font:800 22pt/1.05 "Bricolage Grotesque";color:${COL.rojo}}
.kpi span{font:400 9pt "Spline Sans Mono";color:${COL.gris};text-transform:uppercase;letter-spacing:.05em}
.img{flex:0 0 42%;max-height:128mm;overflow:hidden;border-radius:6pt;border:.6pt solid ${COL.niebla};background:#fff}
.img img{width:100%;display:block}
.oscura{background:${COL.rojo};color:#fff;padding:0 22mm;display:flex;flex-direction:column;justify-content:center}
.oscura .gb{position:absolute;left:0;right:0;height:7mm;background:${GRECA_URI('FFFFFF')} repeat-x;background-size:auto 7mm;opacity:.9}
.oscura h1{font:800 46pt/1.05 "Bricolage Grotesque";margin:0}
.oscura p{font-size:18pt;margin:8pt 0 0;opacity:.95}
.portada h1{font-size:92pt}.portada .marca{display:flex;align-items:center;gap:14pt}
.portada .autores{font:400 11pt "Spline Sans Mono";margin-top:18pt;opacity:.95}`;

function htmlLamina(l, i, n) {
  if (l.tipo === 'portada' || l.tipo === 'seccion' || l.tipo === 'cierre') {
    const portada = l.tipo !== 'seccion';
    return `<section class="lam oscura${portada ? ' portada' : ''}"><div class="gb" style="top:9mm"></div><div class="gb" style="bottom:9mm"></div>
      ${portada ? `<div class="marca">${LOGO(96).replace('fill="#C8102E"/><path', 'fill="#fff"/><path').replace('fill="#fff"/><circle', 'fill="#C8102E"/><circle').replace('r="1.8" fill="#C8102E"', 'r="1.8" fill="#fff"')}<h1>${esc(l.titulo)}</h1></div>` : `<h1>${esc(l.titulo)}</h1>`}
      <p>${esc(l.sub || '')}</p>${l.nota ? `<p class="autores">${esc(l.nota)}</p>` : ''}${l.tipo === 'portada' ? `<p class="autores">${D.AUTORES.map(esc).join(' · ')}<br>Docente: ${esc(D.DOCENTE)} · Probabilidad y Estadística · versión ${D.VERSION.id.replace('v', '')} · ${esc(D.FECHA)}</p>` : ''}</section>`;
  }
  const uri = l.img ? imagenURI(l.img, { ancho: 1100, recorte: l.recorte || 0 }) : null;
  const densa = l.tabla && l.tabla.filas.length > 9;
  const col = (l.kpis ? `<div class="kpis">${l.kpis.map(([v, k]) => `<div class="kpi"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}</div>` : '') +
    (l.formula ? `<div class="formula">${esc(l.formula)}</div>` : '') +
    (l.tabla ? `<table><thead><tr>${l.tabla.cab.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${l.tabla.filas.map((f) => `<tr>${f.map((c) => `<td>${enLinea(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '') +
    (l.puntos ? `<ul${l.tabla || l.kpis || l.formula ? ' style="margin-top:9pt"' : ''}>${l.puntos.map((x) => `<li>${enLinea(x)}</li>`).join('')}</ul>` : '') +
    (l.pie ? `<p class="nota">${enLinea(l.pie)}</p>` : '');
  const clase = (densa ? ' densa' : '') + (l.chico ? ' chico' : !l.tabla && !uri ? ' amplia' : '');
  return `<section class="lam${clase}"><div class="cab">${LOGO(34)}<b>COATL</b><h1>${esc(l.titulo)}</h1>${l.sub ? `<span class="sub">${esc(l.sub)}</span>` : ''}</div><div class="greca"></div>
    <div class="cuerpo"><div class="col">${col}</div>${uri ? `<div class="img"><img src="${uri}" alt=""></div>` : ''}</div>
    <div class="pieL"><span>${D.AUTORES.map(esc).join(' · ')}</span><span>${i + 1} / ${n}</span></div></section>`;
}

// ---------- PowerPoint editable ----------
const ESPECIAL = /[Ͱ-Ͽ←-⇿′■-◿]/;
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', 'ᵢ': 'i', 'ₜ': 't' };
/* Los símbolos que las tipografías del proyecto no traen se escriben en su propio tramo de texto, con una fuente
   que sí los tiene (y los subíndices, como subíndice real), para que PowerPoint y LibreOffice no los descoloquen. */
function tramos(texto, base = {}) {
  const out = []; let buf = '';
  const suelta = () => { if (buf) { out.push({ text: buf, options: { ...base } }); buf = ''; } };
  for (const ch of textoPlano(texto)) {
    if (SUB[ch]) { suelta(); out.push({ text: SUB[ch], options: { ...base, subscript: true } }); }
    else if (ESPECIAL.test(ch)) { suelta(); out.push({ text: ch, options: { ...base, fontFace: 'Cambria Math' } }); }
    else buf += ch;
  }
  suelta(); return out.length ? out : [{ text: ' ', options: base }];
}
async function pptx(L, archivo) {
  const P = new pptxgen(); P.layout = 'LAYOUT_WIDE'; P.author = D.AUTORES.join(', '); P.title = 'COATL · Presentación'; P.company = 'COATL';
  const DISP = 'Bricolage Grotesque ExtraBold', CUERPO = 'Hanken Grotesk', MONO = 'Spline Sans Mono';
  const logo = path.join(RAIZ, 'assets/img/logo-coatl.png'), greca = path.join(RAIZ, 'assets/img/greca-coatl.png');
  const c = (h) => h.replace('#', '');
  L.forEach((l, i) => {
    const s = P.addSlide();
    if (l.tipo !== 'contenido') {
      s.background = { color: c(COL.rojo) };
      if (fs.existsSync(logo) && l.tipo !== 'seccion') s.addImage({ path: logo, x: 0.9, y: 2.2, w: 1.3, h: 1.3 });
      s.addText(tramos(l.titulo), { x: l.tipo === 'seccion' ? 0.9 : 2.5, y: 2.1, w: 10, h: 1.5, fontFace: DISP, fontSize: l.tipo === 'seccion' ? 44 : 80, color: 'FFFFFF', bold: true });
      s.addText(tramos(l.sub || ''), { x: 0.9, y: 3.7, w: 11.5, h: 0.7, fontFace: CUERPO, fontSize: 20, color: 'FFFFFF' });
      if (l.nota) s.addText(tramos(l.nota), { x: 0.9, y: 4.5, w: 11.5, h: 0.5, fontFace: MONO, fontSize: 12, color: 'FFFFFF' });
      if (l.tipo === 'portada') s.addText(`${D.AUTORES.join(' · ')}\nDocente: ${D.DOCENTE} · versión ${D.VERSION.id.replace('v', '')} · ${D.FECHA}`, { x: 0.9, y: 5.4, w: 11.5, h: 0.9, fontFace: MONO, fontSize: 11, color: 'FFFFFF' });
      return;
    }
    s.background = { color: c(COL.hueso) };
    s.addShape(P.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF' } });
    if (fs.existsSync(logo)) s.addImage({ path: logo, x: 0.45, y: 0.22, w: 0.56, h: 0.56 });
    s.addText('COATL', { x: 1.08, y: 0.22, w: 1.3, h: 0.56, fontFace: DISP, fontSize: 15, color: c(COL.rojo), bold: true });
    s.addText(tramos(l.titulo), { x: 2.3, y: 0.12, w: 10.6, h: 0.78, fontFace: DISP, fontSize: 20, color: c(COL.tinta), bold: true, valign: 'middle', fit: 'shrink' });
    if (fs.existsSync(greca)) s.addImage({ path: greca, x: 0, y: 1.0, w: 13.333, h: 0.17, sizing: { type: 'cover', w: 13.333, h: 0.17 } });
    const conImg = l.img && fs.existsSync(path.join(RAIZ, l.img)), ancho = conImg ? 7.0 : 12.3;
    let y = 1.4;
    if (l.kpis) { const w = (ancho - 0.2 * (l.kpis.length - 1)) / l.kpis.length; l.kpis.forEach(([v, k], j) => { s.addShape(P.ShapeType.rect, { x: 0.5 + j * (w + 0.2), y, w, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: c(COL.niebla) } }); s.addText(tramos(v), { x: 0.5 + j * (w + 0.2), y: y + 0.05, w, h: 0.55, fontFace: DISP, fontSize: 20, color: c(COL.rojo), bold: true, align: 'center', fit: 'shrink' }); s.addText(k.toUpperCase(), { x: 0.5 + j * (w + 0.2), y: y + 0.58, w, h: 0.36, fontFace: MONO, fontSize: 8, color: c(COL.gris), align: 'center' }); }); y += 1.2; }
    if (l.formula) { s.addText(tramos(l.formula), { x: 0.5, y, w: ancho, h: 0.6, fontFace: MONO, fontSize: 13, color: c(COL.tinta), fill: { color: 'FFFFFF' }, margin: 8 }); y += 0.75; }
    if (l.tabla) { const tam = l.tabla.filas.length > 9 ? 8.5 : 10.5;
      const filas = [l.tabla.cab.map((t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: c(COL.granate) }, fontFace: DISP, fontSize: tam } })),
        ...l.tabla.filas.map((f, k) => f.map((t) => ({ text: tramos(String(t), { fontFace: CUERPO, fontSize: tam, color: c(COL.tinta) }), options: { fill: { color: k % 2 ? c(COL.rosa) : 'FFFFFF' } } })))];
      s.addTable(filas, { x: 0.5, y, w: ancho, border: { type: 'solid', color: c(COL.niebla), pt: 0.5 }, margin: 4 }); y += 0.34 * (l.tabla.filas.length + 1) * (tam / 10.5) + 0.25; }
    if (l.puntos) s.addText(l.puntos.map((x) => ({ text: textoPlano(x), options: { bullet: true, breakLine: true } })), { x: 0.5, y, w: ancho, h: Math.max(0.6, 6.5 - y), fontFace: CUERPO, fontSize: l.chico ? 10 : 15, color: c(COL.tinta), valign: 'top', paraSpaceAfter: 6, fit: 'shrink' });
    if (l.pie) s.addText(tramos(l.pie), { x: 0.5, y: 6.55, w: 12.3, h: 0.42, fontFace: CUERPO, fontSize: 9.5, italic: true, color: c(COL.gris), fit: 'shrink' });
    if (conImg) s.addImage({ path: path.join(RAIZ, l.img), x: 7.8, y: 1.4, w: 5.0, h: 4.6, sizing: { type: 'contain', w: 5.0, h: 4.6 } });
    s.addText(`${D.AUTORES.join(' · ')}`, { x: 0.5, y: 7.05, w: 10, h: 0.3, fontFace: MONO, fontSize: 7.5, color: c(COL.gris) });
    s.addText(`${i + 1} / ${L.length}`, { x: 11.3, y: 7.05, w: 1.5, h: 0.3, fontFace: MONO, fontSize: 7.5, color: c(COL.gris), align: 'right' });
  });
  await P.writeFile({ fileName: archivo });
}

export async function generarPresentacion(base) {
  const L = laminas();
  const html = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>COATL · Presentación</title><style>${CSS}</style></head><body>${L.map((l, i) => htmlLamina(l, i, L.length)).join('')}</body></html>`;
  const pag = await (await abrirNavegador()).newPage();
  await pag.setContent(html, { waitUntil: 'load' }); await pag.evaluate(() => document.fonts.ready);
  await pag.pdf({ path: base + '.pdf', width: '338.67mm', height: '190.5mm', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await pag.close();
  await pptx(L, base + '.pptx');
  return `COATL_Presentacion.pdf y .pptx · ${L.length} láminas`;
}
