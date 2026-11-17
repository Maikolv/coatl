// Contenido de los documentos largos de COATL (documento técnico y reporte), como lista de bloques.
// La prosa está aquí; TODAS las cifras y tablas salen de scripts/doc/datos.mjs (es decir, del propio modelo).
import { h1, h2, h3, p, nota, formula, lista, pasos, tabla, fig } from './kit.mjs';
import * as D from './datos.mjs';

const { REF, mxn, pct } = D;
const ref = REF, e = REF.e;
const fechaLarga = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

// ---------- Piezas compartidas ----------
const tablaEvolucion = () => tabla(['Versión', 'Fecha', 'Qué cambió', 'P', 'Utilidad/mes', 'ROI', 'Recuperación', 'VPN'],
  D.VERSIONES.map((v) => [v.id, v.fecha, v.titulo, v.referencia.P, v.referencia.utilidad, v.referencia.roi, v.referencia.payback, v.referencia.vpn]),
  { pie: 'Evolución del escenario de referencia (Cafetería · Los Héroes) a lo largo de todas las versiones.', num: [3, 4, 5, 6, 7], anchos: [7, 11, 30, 8, 11, 9, 12, 12] });
const bloqueVersion = (v) => ({ t: 'html', x: '' });   // marcador: el historial se arma con bloques normales (ver historial())
function historial(detalle = true) {
  const b = [];
  D.VERSIONES.forEach((v) => {
    b.push(h2(`${v.id} · ${v.titulo} (${fechaLarga(v.fecha)})`));
    b.push(p(`**Qué es.** ${v.resumen}`));
    b.push(p(`**Por qué se hizo.** ${v.motivo}`));
    if (detalle) { b.push(p('**Cambios.**')); b.push(lista(v.cambios)); }
    b.push(p(`**Efecto en el modelo.** ${v.modelo}`));
    b.push(p(`**Escenario de referencia en esta versión.** P = ${v.referencia.P}; utilidad mensual ${v.referencia.utilidad}; ROI ${v.referencia.roi}; recuperación en ${v.referencia.payback}; VPN ${v.referencia.vpn}.` + (v.commits.length ? ` Confirmaciones en el repositorio: ${v.commits.map((c) => '`' + c + '`').join(', ')}.` : ' Versión en curso al generar este documento.')));
  });
  return b;
}
const tablaVariables = () => tabla(['Pestaña', 'Variable', 'Tipo', 'Valores posibles (y su coeficiente β, cuando aplica)', 'Por defecto'],
  D.VARIABLES.map((v) => [v.pestana, v.nombre, v.tipo, v.detalle, v.def]), { pie: `Las ${D.VARIABLES.length} variables del simulador, leídas de la plantilla del sitio. Entre paréntesis, el valor que cada opción aporta al modelo.`, anchos: [10, 20, 9, 46, 15] });
const tablaMatriz = () => tabla(['Giro', ...D.ZONAS.map((z) => z.n.split(' · ')[0].replace('San Francisco Coacalco (Centro)', 'Centro').replace('Corredor Vía López Portillo', 'Corredor').replace('Zonas habitacionales periféricas', 'Periferia'))],
  D.MATRIZ.map((f) => [f.giro, ...f.celdas.map((c) => pct(c.P))]), { pie: 'Probabilidad de supervivencia a 3 años de los 35 giros calibrados en las 6 zonas. Supuestos de la tabla: clientes = demanda de referencia del giro × índice de afluencia de la zona; renta = renta de referencia por m² × 50 m²; el resto, como en el escenario de referencia.', num: [1, 2, 3, 4, 5, 6] });

// =====================================================================================================
export function documentoTecnico() {
  const B = [];
  const a = (...x) => B.push(...x.flat());

  // 1
  a(h1('Resumen'),
    p(`**COATL** (Cálculo de Oportunidad y Análisis Territorial Local) es una aplicación web estadística que estima la probabilidad de que un negocio siga operando y sea rentable tres años después de abrir en Coacalco de Berriozábal, Estado de México, junto con su rentabilidad esperada. El nombre alude al náhuatl *cōātl*, «serpiente»: Coacalco significa «en la casa de la serpiente».`),
    p(`El sistema encadena cuatro modelos. (1) Una **regresión logística** convierte ${D.VARIABLES.length} variables del negocio en una probabilidad base; su intercepto está calibrado para que un escenario neutro reproduzca la supervivencia nacional a tres años publicada por el INEGI (${pct(D.M.S0[3])}). (2) Un modelo de **riesgos proporcionales** traslada esa probabilidad a una curva de supervivencia de diez años sobre la tabla nacional 1989–2019. (3) Una **simulación de Monte Carlo** de ${D.SIMULACIONES.toLocaleString('es-MX')} años, con generador de semilla fija, describe la distribución de la utilidad anual. (4) Un módulo **financiero** calcula valor presente neto, retorno y periodo de recuperación.`),
    p(`Para el escenario de referencia (cafetería en Los Héroes) el modelo estima P = **${ref.P}** con un rango plausible de ${ref.rango}, utilidad mensual de **${ref.utilidad}**, ROI anual de **${ref.roi}**, recuperación de la inversión en **${ref.payback}** y VPN a tres años de **${ref.vpn}**. Estas cifras se vigilan con pruebas automáticas en cada cambio.`),
    p(`Desde la versión 13, los coeficientes de **giro y zona** se estiman con datos reales: ${D.SUP.n.toLocaleString('es-MX')} negocios jóvenes del Estado de México seguidos en el DENUE de 2019 a 2024, con regresión logística y errores estándar. Desde la versión 14, el de **formalidad** se estima con el panel de la ENOE (5,245 dueños de negocios jóvenes seguidos un año). Los demás coeficientes siguen siendo supuestos del equipo.`),
    p(`El documento describe el problema, el marco teórico, las fuentes de datos, la especificación formal de cada modelo, los resultados, el análisis de sensibilidad, la arquitectura de software, la verificación, las limitaciones y el **historial completo de las ${D.VERSIONES.length} versiones** del proyecto. Se declara con precisión qué es dato oficial, qué es estimación con datos y qué es supuesto del equipo; como varios coeficientes siguen siendo supuestos, la probabilidad se acompaña siempre de un rango plausible, que es un análisis de sensibilidad y no un intervalo de confianza.`),
    p(`**Palabras clave:** supervivencia empresarial, regresión logística, riesgos proporcionales, simulación de Monte Carlo, análisis de sensibilidad, micro y pequeñas empresas, Coacalco de Berriozábal, INEGI, DENUE.`));

  // 2
  a(h1('Introducción'),
    h2('Planteamiento del problema'),
    p(`Abrir un negocio en México es una decisión de alto riesgo. La tabla nacional de supervivencia de los negocios del INEGI, construida con los Censos Económicos de 1989 a 2019, indica que de cada 100 negocios que nacen solo ${Math.round(D.M.S0[1] * 100)} siguen operando al cumplir un año, ${Math.round(D.M.S0[3] * 100)} a los tres años, ${Math.round(D.M.S0[5] * 100)} a los cinco y ${Math.round(D.M.S0[10] * 100)} a los diez. Dicho de otro modo, más de la mitad cierra antes de su tercer aniversario.`),
    p(`Quien emprende rara vez dispone de una estimación cuantitativa de su propio riesgo. Las cifras nacionales son promedios: no distinguen una cafetería de una ferretería, ni una avenida comercial de una colonia habitacional, ni a quien abre con reservas y experiencia de quien abre endeudado y sin conocer el giro. La pregunta práctica —«¿qué probabilidad tiene *mi* negocio, *aquí*, con *estos* números?»— queda sin respuesta.`),
    h2('Justificación'),
    p(`Coacalco de Berriozábal es un municipio urbano del Valle de México con 293,444 habitantes (Censo 2020) y más de once mil unidades económicas. Su tejido empresarial creció 3.7 % anual entre 2013 y 2020: hay más mercado, pero también más competencia. El municipio no es homogéneo: el corredor de la Vía José López Portillo concentra centros comerciales y afluencia regional, mientras que las zonas habitacionales ofrecen rentas bajas y demanda de proximidad. Una herramienta que combine datos oficiales con un modelo transparente permite comparar alternativas antes de comprometer capital.`),
    p(`Desde el punto de vista académico, el proyecto integra en un solo caso los contenidos centrales de Probabilidad y Estadística: variables aleatorias, distribuciones, probabilidad condicional, estimación, simulación, cuantiles, análisis de sensibilidad y comunicación honesta de la incertidumbre.`),
    h2('Objetivos'),
    p(`**Objetivo general.** Estimar, con un modelo estadístico reproducible y transparente, la probabilidad de supervivencia a tres años y la rentabilidad esperada de un negocio en Coacalco de Berriozábal, y traducir esa estimación en decisiones concretas.`),
    p('**Objetivos específicos.**'),
    lista(['Construir un modelo logístico cuyas variables sean comprensibles para una persona sin formación estadística.', 'Anclar el modelo a datos oficiales: la tabla de supervivencia del INEGI, el Censo 2020, el DENUE y los Censos Económicos 2019.', 'Cuantificar la incertidumbre de la utilidad con simulación de Monte Carlo y la de la probabilidad con un rango plausible.', 'Convertir el resultado en un plan: palancas ordenadas por impacto, diagnóstico de solidez y estimación fiscal.', 'Garantizar que cada cifra sea reproducible, verificable con pruebas automáticas y rastreable hasta su fuente.', 'Publicar la herramienta como sitio web accesible (WCAG 2.1 AA), sin costo y sin recolectar datos personales.']),
    h2('Preguntas que responde'),
    lista(['¿Qué probabilidad tiene este negocio de seguir abierto y rentable en tres años?', '¿Cuánto podría ganar o perder en un año bueno, uno típico y uno malo?', '¿Cuántos clientes al día necesita para no perder?', '¿En qué zona de Coacalco le iría mejor?', '¿Qué cambio concreto sube más su probabilidad?', '¿Qué tan sólido es el negocio más allá de sus números?']),
    h2('Alcance y delimitación'),
    p(`COATL modela negocios de escala micro y pequeña en un municipio. No pronostica: estima bajo supuestos declarados. No sustituye un estudio de mercado, un plan de negocio ni la asesoría de un contador. Sus resultados financieros son antes de impuestos; la estimación fiscal se presenta por separado y con carácter orientativo. El posicionamiento del proyecto es el de un **producto en sí mismo** —una herramienta en la que puede invertirse— y no el de un servicio de consultoría.`),
    h2('Aportaciones'),
    lista(['Un modelo de cuatro etapas, anclado a datos oficiales, con todos sus supuestos declarados y editables.', 'Una forma de comunicar la incertidumbre que distingue con claridad sensibilidad de confianza estadística.', 'Un sitio web sin servidor: todos los cálculos ocurren en el navegador de quien lo usa.', 'Una cadena de verificación triple (pruebas unitarias, validador independiente en Python y pruebas de navegador).', 'Documentos, presentación, libro de cálculo y video que se regeneran desde el propio modelo.']),
    h2('Estructura del documento'),
    p(`Los capítulos 3 a 5 presentan el contexto, el marco teórico y los datos. Los capítulos 6 a 8 especifican el modelo, sus resultados y su sensibilidad. El capítulo 9 explica cómo la probabilidad se vuelve decisión. Los capítulos 10 a 12 describen el software, su verificación y su interfaz. Los capítulos 13 a 15 tratan el marco ético y legal, las limitaciones y el trabajo futuro. El capítulo 16 recorre todas las versiones del proyecto. Cierran las conclusiones, el glosario, las referencias y los apéndices.`));

  // 3
  a(h1('Contexto: Coacalco de Berriozábal'),
    h2('El territorio en cifras'),
    tabla(['Indicador', 'Valor', 'Fuente'], [['Población', '293,444 habitantes (51.9 % mujeres, 48.1 % hombres)', 'INEGI, Censo de Población y Vivienda 2020'], ['Unidades económicas', '8,517 (2013) · 9,710 (2018) · 11,018 (2020)', 'IGECEM / portal de datos económicos del municipio'], ['Crecimiento del padrón', '3.7 % anual entre 2013 y 2020', 'Cálculo propio con los datos anteriores'], ['Valor agregado censal bruto', '$17,179.6 millones', 'Gobierno de Coacalco (IGECEM/INEGI), 2020'], ['Población fuera de pobreza', '71.4 % (26.1 % en pobreza moderada, 2.5 % extrema)', 'CONEVAL 2020'], ['Establecimientos en el DENUE', '11,554 en 424 actividades distintas', 'INEGI, DENUE 05/2026'], ['Áreas geoestadísticas básicas urbanas', '70 AGEB', 'INEGI, Marco Geoestadístico']],
      { pie: 'Indicadores de contexto de Coacalco de Berriozábal usados en el sitio.', anchos: [26, 42, 32] }),
    p(`Las dos cifras de establecimientos difieren (11,018 y 11,554) porque miden años distintos con fuentes distintas: la primera es el padrón de 2020 publicado por el municipio; la segunda, el directorio vigente del INEGI. El sitio lo aclara junto a la gráfica.`),
    h2('Seis zonas, seis mercados'),
    p(`El equipo agrupó las 70 AGEB urbanas en seis zonas con perfil comercial distinguible. A cada una se le asignó un **índice de afluencia** relativo (1.00 = promedio municipal), una **renta de referencia** por metro cuadrado y un coeficiente en el modelo logístico. Los límites son oficiales; la agrupación, el índice, la renta y el coeficiente son estimaciones del equipo y así se declaran en el sitio.`),
    tabla(['Zona', 'Índice de afluencia', 'Renta de referencia', 'Coeficiente β'], D.ZONAS.map((z) => [z.n, z.afl.toFixed(2), mxn(z.rm2) + ' por m² al mes', (z.z >= 0 ? '+' : '−') + Math.abs(z.z).toFixed(2) + ' ± ' + z.ee.toFixed(2)]), { pie: 'Zonas de Coacalco en el modelo. Afluencia y renta: estimaciones del equipo. Coeficiente β: estimado con el DENUE (capítulo 5).', num: [1, 2, 3], anchos: [44, 16, 22, 18] }),
    fig('docs/capturas/territorio.png', 'Apartado «Territorio» del sitio: indicadores oficiales, carrusel de fotografías y tabla de zonas.', { recorte: 0.78 }),
    h2('El directorio de unidades económicas'),
    p(`El DENUE registra negocios con local fijo o semifijo; el comercio ambulante no aparece, de modo que la competencia real puede ser mayor que la contada. COATL sincroniza cada semana la descarga oficial y publica únicamente **conteos agregados** por entidad, municipio, sector, tamaño y clase de actividad: nunca nombres, direcciones ni datos de contacto. La edición usada cubre 6,138,075 establecimientos en 2,478 municipios de las 32 entidades.`));

  // 4
  a(h1('Marco teórico'),
    h2('Regresión logística'),
    p(`La regresión logística modela la probabilidad de un suceso binario —aquí, que el negocio siga operando y sea rentable al tercer año— como función de un conjunto de variables explicativas. En lugar de modelar la probabilidad directamente, modela el logaritmo de su razón de momios (*logit*), que sí puede tomar cualquier valor real:`),
    formula('logit(P) = ln( P / (1 − P) ) = β₀ + β₁·x₁ + β₂·x₂ + … + βₖ·xₖ = z\n\nP = 1 / (1 + e^(−z))'),
    p(`Cada coeficiente βᵢ es el cambio en el logaritmo de los momios cuando xᵢ aumenta una unidad con lo demás constante; e^βᵢ es la razón de momios correspondiente. Una consecuencia importante es que los efectos **no se suman en probabilidad**: el mismo β mueve P más cuando P está cerca de 0.5 que cuando está cerca de 0 o de 1. Por eso el sitio insiste en que los puntos de probabilidad de varias acciones no pueden sumarse por separado (Hosmer, Lemeshow y Sturdivant, 2013).`),
    h2('Análisis de supervivencia'),
    p(`El análisis de supervivencia estudia el tiempo hasta que ocurre un suceso. Su objeto central es la **función de supervivencia** S(t) = P(T > t), la probabilidad de que el suceso —el cierre— no haya ocurrido en el tiempo t. La **función de riesgo** h(t) es la tasa instantánea de cierre entre quienes siguen abiertos. Ambas se relacionan por S(t) = exp(−H(t)), donde H es el riesgo acumulado. El estimador no paramétrico clásico de S(t) con datos censurados es el de Kaplan y Meier (1958); las tablas de vida del INEGI siguen una lógica demográfica equivalente.`),
    h2('Modelo de riesgos proporcionales'),
    p(`Cox (1972) propuso que el riesgo de un individuo es el riesgo base multiplicado por un factor que depende de sus características: h(t | x) = h₀(t)·exp(β′x). Si la razón de riesgos no cambia con el tiempo, las curvas de supervivencia de dos individuos se relacionan por una potencia:`),
    formula('S(t | x) = S₀(t) ^ θ ,   θ = exp(β′x)  (razón de riesgos)'),
    p(`COATL usa esta propiedad en sentido inverso. Conoce la curva base S₀(t) nacional y la probabilidad P del negocio a tres años; despeja la razón de riesgos que hace S(3) = P y la aplica al resto de la curva. Es un uso estructural del supuesto de proporcionalidad, no una estimación de un modelo de Cox con datos.`),
    h2('Simulación de Monte Carlo'),
    p(`El método de Monte Carlo (Metropolis y Ulam, 1949) aproxima la distribución de una cantidad repitiendo muchas veces un experimento aleatorio en computadora. Por la ley de los grandes números, las frecuencias simuladas convergen a las probabilidades del modelo. Requiere tres ingredientes: un generador de números pseudoaleatorios uniforme, una transformación a la distribución deseada y un modelo del fenómeno.`),
    p(`COATL usa el generador *mulberry32*, de 32 bits y dominio público, con semilla fija para que cada resultado sea reproducible, y la transformación de Box y Muller (1958), que convierte dos uniformes independientes U₁ y U₂ en una normal estándar:`),
    formula('Z = √(−2·ln U₁) · cos(2π·U₂)'),
    h2('Cuantiles muestrales'),
    p(`Los escenarios pesimista, esperado y optimista son los percentiles 5, 50 y 95 de los años simulados. Hay nueve definiciones usuales de cuantil muestral; COATL emplea la **tipo 7** de Hyndman y Fan (1996), que interpola linealmente entre estadísticos de orden y es la que usan por defecto R y NumPy:`),
    formula('h = (n − 1)·p ;   Q(p) = x₍⌊h⌋₎ + (h − ⌊h⌋)·( x₍⌈h⌉₎ − x₍⌊h⌋₎ )'),
    h2('Indicadores financieros'),
    p(`El **punto de equilibrio** es el volumen de ventas en el que la utilidad es cero: los costos fijos divididos entre el margen de contribución unitario. El **margen de seguridad** es la fracción en que las ventas esperadas superan al equilibrio. El **valor presente neto** descuenta los flujos futuros a una tasa que refleja el costo de oportunidad; el **retorno sobre la inversión** compara la utilidad anual con el capital invertido, y el **periodo de recuperación** es el tiempo en que la utilidad acumulada iguala a la inversión.`),
    h2('Análisis de sensibilidad e incertidumbre'),
    p(`Un **intervalo de confianza** cuantifica la incertidumbre muestral de un estimador: exige una muestra y un modelo estadístico de cómo se obtuvo. Un **análisis de sensibilidad** responde otra pregunta: cuánto cambia el resultado si los supuestos cambian. Como los coeficientes de COATL son supuestos y no estimaciones, lo honesto es reportar lo segundo. El rango plausible de P es exactamente eso, y el sitio lo rotula así en todos los lugares donde aparece.`),
    h2('Bootstrap'),
    p(`En el apartado «Para empresas», cuando el usuario carga su historial mensual, la distribución de su utilidad anual se obtiene por *bootstrap* (Efron, 1979): cada año simulado es la suma de doce meses tomados con reemplazo de su propio historial. No supone ninguna distribución; con pocos meses la incertidumbre es mayor y el sitio lo advierte.`));

  // 5
  a(h1('Datos y fuentes'),
    h2('Qué es oficial y qué es estimación'),
    p(`La regla del proyecto es declarar la procedencia de cada cifra. En el sitio, cada resultado lleva una etiqueta: *dato oficial*, *resultado del modelo* o *estimación del equipo*, y el apartado de trazabilidad permite ir de cada número a su fuente.`),
    tabla(['Elemento', 'Procedencia', 'Uso en el modelo'], [
      ['Supervivencia base S₀(t), t = 1…10', 'Oficial · INEGI, Demografía de los Negocios 1989–2019', 'Calibra β₀ y da forma a la curva de supervivencia'],
      ['Población, pobreza, unidades económicas', 'Oficial · INEGI, CONEVAL, IGECEM', 'Contexto; no entran al cálculo de P'],
      ['Conteos del DENUE por actividad y municipio', 'Oficial · INEGI, DENUE 05/2026', 'Competencia de referencia y lista de giros'],
      ['Ingresos y gastos por establecimiento', 'Oficial · INEGI, Censos Económicos 2019', 'Contraste de cada giro; no cambia los valores por defecto'],
      ['Límites de las AGEB', 'Oficial · INEGI, Marco Geoestadístico', 'Mapa'],
      ['Coeficientes β de giro y zona', 'Estimados con el DENUE 2019 → 2024 (regresión logística, errores estándar)', 'Probabilidad logística'],
      ['Coeficientes β de las demás variables', 'Estimación del equipo, con base en la literatura', 'Probabilidad logística'],
      ['Ticket, costo variable y demanda por giro', 'Estimación del equipo', 'Ventas y costos'],
      ['Afluencia y renta por zona', 'Estimación del equipo', 'Clientes y renta sugeridos'],
      ['Desviaciones del Monte Carlo', 'Supuesto del equipo', 'Dispersión de la utilidad'],
      ['Tabla del RESICO y tasa general', 'Oficial · Ley del ISR, artículos 113-E y 9', 'Estimación fiscal orientativa']],
      { pie: 'Procedencia de cada elemento del modelo.', anchos: [34, 36, 30] }),
    h2('La tabla de supervivencia'),
    p(`La pieza de datos más importante es el tabulado nacional del INEGI, columna p(x): la proporción de negocios que sobrevive a cada edad. COATL usa S₀(x + 1) = p(x) para x = 0…9, redondeada a cuatro decimales. La tabla es nacional y agrega todos los sectores; aplicarla a Coacalco supone que el municipio se comporta como el promedio del país.`),
    tabla(['Año t', 'S₀(t) nacional', 'Negocios que siguen de cada 100', 'Cierres en el año'], Array.from({ length: 11 }, (_, t) => [String(t), D.M.S0[t].toFixed(4), String(Math.round(D.M.S0[t] * 100)), t ? pct(1 - D.M.S0[t] / D.M.S0[t - 1]) : '—']), { pie: 'Supervivencia nacional de los negocios. Fuente: INEGI, tabulado Nal_Tot_CE2019. La última columna es la proporción de los que seguían abiertos y cerraron durante ese año.', num: [0, 1, 2, 3] }),
    p(`La forma de la curva es reveladora: el primer año es, con mucho, el más peligroso (cierra ${pct(1 - D.M.S0[1])} de los negocios) y el riesgo anual desciende después de manera sostenida. Esto justifica el énfasis del sitio en la reserva de capital y en los primeros meses de operación.`),
    h2('Giros'),
    p(`El simulador incluye 35 giros calibrados por el equipo, cada uno con ticket promedio, costo variable, demanda de referencia y coeficiente en el modelo. Además admite las 424 actividades presentes en Coacalco según el DENUE y las 989 del catálogo SCIAN; estas heredan los parámetros del giro calibrado más cercano y se rotulan como «estimación del equipo». La tabla completa de giros está en el apéndice B.`),
    h2('Sincronización y calidad de los datos'),

    h2('Estimación de los coeficientes de giro y zona con el DENUE'),
    p(`Hasta la versión 12 todos los coeficientes β eran supuestos del equipo. A partir de la versión 13, los de **giro** y **zona** —los que más pesan en el resultado— se estiman con datos reales: ediciones sucesivas del Directorio Estadístico Nacional de Unidades Económicas para el Estado de México.`),
    h3('Por qué se puede medir la supervivencia con el DENUE'),
    p(`El DENUE casi no cambia entre censos: entre 2019 y 2022 conserva el 99 % de sus registros de un año a otro. El INEGI lo depura cuando levanta los Censos Económicos, y eso ocurre en las ediciones de noviembre de 2019 y de noviembre de 2024. Los negocios que siguen conservan su identificador; los que cerraron desaparecen. Entre esas dos depuraciones, en Coacalco sigue el 60 % de los registros.`),
    h3('Diseño'),
    lista([
      `**Cohorte.** Los ${D.SUP.n.toLocaleString('es-MX')} negocios que el INEGI incorporó al directorio en la actualización censal de 2019 en el Estado de México (fecha de alta 2019-11): son negocios jóvenes. Ninguno de ellos estaba en la edición de 2018, lo que confirma que son altas reales.`,
      `**Resultado.** Si el negocio sigue en la edición de noviembre de 2024, cinco años después: ${D.pct(D.SUP.cohortes[0].tasa_nuevos)} de la cohorte sigue (frente a ${D.pct(D.SUP.cohortes[0].tasa_todos)} de todos los negocios del directorio).`,
      '**Modelo 1, giro.** Regresión logística binomial con un indicador por giro (los 35 de COATL mapeados a sus clases SCIAN, el resto como base) y el tamaño del establecimiento (personal ocupado) como control, en todo el Estado de México.',
      `**Modelo 2, zona.** Con los ${D.SUP.n_coacalco.toLocaleString('es-MX')} negocios de la cohorte ubicados en Coacalco, un indicador por zona (según su AGEB) y el resultado del modelo 1 como desplazamiento.`,
      `**Centrado y contracción.** Los efectos se centran en el promedio ponderado y se contraen hacia cero por Bayes empírico (β* = β·τ²/(τ² + EE²); τ = ${D.SUP.tau_giro} para giros y ${D.SUP.tau_zona} para zonas), para que un giro o una zona con pocos negocios no reciba un efecto extremo por azar.`,
    ]),
    formula('logit P(sigue en 2024) = α + β_giro + β_tamaño          (Estado de México)\nlogit P(sigue en 2024) = α + β_zona + desplazamiento   (Coacalco)\nβ* = β · τ² / (τ² + EE²)'),
    h3('Resultados por giro'),
    tabla(['Giro', 'β (contraído)', 'Error estándar', 'β sin contraer', 'Negocios', 'Siguen en 2024', 'Supuesto anterior del equipo', 'Fuente'], D.TABLA_BETA_GIROS,
      { pie: 'Coeficientes de giro estimados con el DENUE. Un β positivo indica mayor supervivencia que el giro promedio. Juguería y pastelería comparten clase SCIAN con cafetería y panadería y heredan su coeficiente; spa (equipo*) no tiene clase propia y conserva el supuesto del equipo.', num: [1, 2, 3, 4, 5, 6], anchos: [22, 9, 9, 9, 9, 9, 11, 22] }),
    h3('Resultados por zona de Coacalco'),
    tabla(['Zona', 'β (contraído)', 'Error estándar', 'β sin contraer', 'Negocios', 'Siguen en 2024', 'Supuesto anterior del equipo'], D.TABLA_BETA_ZONAS,
      { pie: 'Coeficientes de zona estimados con los negocios de la cohorte ubicados en Coacalco.', num: [1, 2, 3, 4, 5, 6], anchos: [34, 11, 11, 11, 10, 11, 12] }),
    p('Dos hallazgos contradicen los supuestos anteriores del equipo. El corredor de la Vía López Portillo, que el equipo suponía la mejor zona (+0.30), tiene menor supervivencia que el promedio: la afluencia comercial atrae más negocios, pero también más rotación. Y la cafetería resulta más riesgosa de lo supuesto (−0.33 frente a −0.08). La afluencia sigue aumentando la demanda en el simulador: lo que cambia es el riesgo de cierre.'),
    nota('**Límites de esta estimación.** Desaparecer del DENUE no siempre significa cerrar: también ocurre por cambio de domicilio o de actividad. La cohorte se sigue cinco años, no tres, y empieza con negocios de hasta cinco años de edad. Por eso solo se usan **diferencias** entre giros y entre zonas; el nivel absoluto de P sigue anclado a la tabla oficial de supervivencia del INEGI mediante β₀. Los coeficientes de experiencia, reserva, formalidad, marketing, deuda y las demás variables no pueden estimarse con el DENUE y siguen siendo supuestos del equipo.'),
    h2('Sincronización y calidad de los datos'),
    lista(['**DENUE.** Un flujo semanal descarga la edición oficial, la agrega y la valida. El token de la API vive solo como secreto del repositorio.', '**Censos Económicos.** Un script genera el resumen por giro; el sitio lo contrasta con el supuesto del equipo sin sustituirlo.', '**AGEB.** Se obtienen del servicio de catálogo geográfico del INEGI; si el archivo falta, el mapa cae a un esquema simplificado.', '**Verificación cruzada.** El mapeo de giros a códigos SCIAN se verificó contra el catálogo; no se agregan códigos de memoria.']));

  // 6
  a(h1('Especificación del modelo'),
    h2('Variables'),
    p(`El formulario del simulador tiene ${D.VARIABLES.length} variables en cuatro pestañas. Las de tipo «opciones» aportan directamente un coeficiente al modelo logístico; las numéricas determinan ventas, costos y finanzas, y varias entran al modelo de forma indirecta a través del margen de seguridad y de la estructura de deuda.`),
    tablaVariables(),
    h2('Cantidades derivadas'),
    p('A partir de las entradas se calculan las cantidades del modelo determinista de costo–volumen–utilidad:'),
    formula('días_mes   = días_semana × 4.33\ncv′        = costo_variable + merma                (acotado entre 0.02 y 0.95)\nrenta′     = 0 si el local es propio; la renta en otro caso\ninterés    = inversión × %crédito × tasa / 12\nfijos      = renta′ + empleados × costo_empleado + otros_fijos + marketing + interés\nventas     = clientes × días_mes × ticket\nutilidad   = ventas × (1 − cv′) − fijos\nequilibrio = fijos / ( ticket × (1 − cv′) )        (clientes al mes)\nMS         = ( ventas − fijos / (1 − cv′) ) / ventas'),
    p(`El ajuste de precio usa elasticidad constante: si el precio cambia en una proporción *a*, el ticket pasa a ticket·(1 + a) y la demanda a clientes·(1 + a)^ε, con ε negativa. Con a = 0, que es el valor por defecto, no cambia nada.`),
    h2('Modelo logístico'),
    p(`La suma logística es z = β₀ + Σ βᵢ. Hay ${ref.modelo.contribs.length} contribuciones: dos dependen del giro y de la zona; trece corresponden a opciones del formulario; y dos se derivan de cantidades financieras por tramos:`),
    tabla(['Contribución', 'Regla'], [
      ['Margen de seguridad financiero', 'MS ≥ 30 %: +0.25 · 15 % ≤ MS < 30 %: +0.10 · 0 ≤ MS < 15 %: −0.10 · MS < 0: −0.50'],
      ['Estructura de deuda', 'crédito ≥ 60 %: −0.20 · 30 % ≤ crédito < 60 %: −0.08 · 0 < crédito < 30 %: 0 · sin crédito: +0.05'],
      ['Local propio', '+0.10 si el local es propio; 0 si es rentado']], { pie: 'Contribuciones por tramos.', anchos: [30, 70] }),
    p(`La probabilidad resultante se acota entre 4 % y 93 %: el modelo no afirma certezas en ningún sentido.`),
    formula('P = min( 0.93 , max( 0.04 , 1 / (1 + e^(−z)) ) )'),
    h2('Calibración del intercepto'),
    p(`El intercepto se fija para que un escenario *neutro* —todas las contribuciones en cero— reproduzca exactamente la supervivencia nacional a tres años:`),
    formula(`β₀ = logit( S₀(3) ) = ln( ${D.M.S0[3]} / ${(1 - D.M.S0[3]).toFixed(4)} ) = ${D.BETA0.toFixed(4)}`),
    p(`Esta decisión ancla el modelo: sin ventajas ni desventajas, COATL devuelve el promedio nacional. Cada β desplaza la estimación respecto de ese promedio.`),
    h2('Rango plausible de P'),
    p(`Como los β no tienen error estándar, se perturban: en ${(1000).toLocaleString('es-MX')} sorteos, cada βᵢ se multiplica por (1 + εᵢ) con εᵢ normal de desviación 0.30, y al intercepto se le suma una normal de desviación 0.15. Se reportan los percentiles 5 y 95 de las P resultantes.`),
    formula('z⁽ʲ⁾ = β₀ + 0.15·ε₀ + Σ βᵢ·(1 + 0.30·εᵢ) ,   εᵢ ~ N(0, 1) ,   j = 1…1000\nrango plausible = [ Q₀.₀₅(P⁽ʲ⁾) , Q₀.₉₅(P⁽ʲ⁾) ]'),
    nota(`**Qué es y qué no es.** El rango plausible indica cuánto cambiaría P si los coeficientes fueran hasta 30 % distintos de lo supuesto. No es un intervalo de confianza: no hay muestra detrás. Un detalle de implementación: el generador hace un sorteo por cada contribución aunque su β sea cero, de modo que agregar variables neutras recorre la secuencia y mueve el rango una o dos décimas (ocurrió en la versión 9; ver capítulo 16).`),
    h2('Curva de supervivencia'),
    p(`Se impone S(3) = P y se conserva la forma de la curva nacional mediante el supuesto de riesgos proporcionales:`),
    formula('θ = ln P / ln S₀(3)          S(t) = S₀(t) ^ θ ,   t = 0…10'),
    p(`Si θ < 1 el negocio tiene menos riesgo que el promedio nacional en todos los años; si θ > 1, más. Para el escenario de referencia θ = ${ref.h.toFixed(4)}.`),
    h2('Monte Carlo'),
    p(`Cada una de las ${D.SIMULACIONES.toLocaleString('es-MX')} corridas simula un año de operación. La semilla es ${D.SEMILLA}. Las fuentes de variación son cuatro, todas supuestos del equipo:`),
    tabla(['Fuente de variación', 'Magnitud', 'Cómo entra'], D.INCERTIDUMBRE, { pie: 'Supuestos de incertidumbre del modelo.', anchos: [34, 14, 52] }),
    p('El algoritmo de cada corrida es el siguiente:'),
    pasos(['Sortear el **choque anual** de demanda, lognormal de media 1: f = exp(0.15·Z − 0.15²/2). Un mal año afecta a los doce meses a la vez; por eso no se compensa al sumar.', 'Sortear el **costo variable** del año: cv′ + 0.02·Z, acotado entre 0.02 y 0.98.', 'Para cada mes m = 0…11: calcular la demanda esperada (clientes × estacionalidad × rampa de crecimiento × f), sortear los clientes y el ticket del mes con ruido independiente, y acumular la utilidad del mes.', 'Guardar la utilidad anual.', 'Al terminar, ordenar las corridas y obtener media, desviación estándar, percentiles (2.5, 5, 50, 95 y 97.5) y la proporción de años con utilidad positiva.']),
    formula('U_año = Σₘ [ clientesₘ × días_mes × ticketₘ × (1 − cv_sim) − fijos ]'),
    p(`La versión 1 simulaba cada mes de forma independiente, lo que por el teorema central del límite producía una distribución anual demasiado estrecha. El choque anual común, introducido en la versión 2, corrige esa subestimación del riesgo.`),
    h2('Finanzas'),
    formula('ROI        = media Monte Carlo de la utilidad anual / inversión\nRecuperación = inversión / utilidad mensual determinista        (meses)\nVPN        = −I₀ + Σ_{t=1..3} S(t) · Uₜ / (1 + r)ᵗ\nUₜ         = ventas·12·(1 + g)^(t−1)·(1 − cv′) − fijos·12·(1 + π)^(t−1)'),
    p(`El VPN pondera cada flujo anual por la probabilidad de seguir operando, S(t). La inversión inicial no se pondera. No se incluyen impuestos, depreciación, sueldo del dueño, capital de trabajo ni valor terminal; el sitio lo declara.`),
    h2('Estimación fiscal'),
    p(`Se calcula por separado y no altera los indicadores anteriores. Si los ingresos anuales estimados no superan 3.5 millones de pesos, se aplica la tabla mensual del Régimen Simplificado de Confianza para personas físicas, cuya tasa recae sobre los ingresos; en otro caso, la tasa general de 30 % sobre la utilidad.`),
    tabla(['Ingresos del mes', 'Tasa de ISR'], D.RESICO, { pie: 'Tabla mensual del RESICO para personas físicas (Ley del ISR, artículo 113-E).', num: [1], anchos: [60, 40] }));

  // 7
  a(h1('Resultados del escenario de referencia'),
    p(`El escenario de referencia es una **cafetería en Los Héroes** con los valores por defecto del simulador. Funciona como prueba de regresión: cualquier cambio en el código debe reproducir estas cifras o documentar por qué cambian.`),
    h2('Entradas'),
    tabla(['Variable', 'Valor'], ref.entradas, { pie: 'Entradas del escenario de referencia.', num: [1], anchos: [60, 40] }),
    h2('Indicadores'),
    tabla(['Indicador', 'Valor'], ref.indicadores, { pie: 'Resultados del escenario de referencia, calculados al generar este documento.', num: [1], anchos: [62, 38] }),
    h2('Cómo se forma la probabilidad'),
    p(`La suma logística parte de β₀ = ${D.BETA0.toFixed(3)} y recibe las contribuciones siguientes. Las que valen cero son las variables en su opción neutra.`),
    tabla(['Contribución', 'β'], ref.contribuciones, { pie: `Contribuciones al modelo logístico. Suma z = ${ref.modelo.z.toFixed(4)}; P = ${ref.P}.`, num: [1], anchos: [70, 30] }),
    p(`La mayor contribución positiva es el margen de seguridad: el negocio vende muy por encima de su punto de equilibrio (${Math.ceil(e.peDia)} clientes al día frente a ${e.mu} esperados). La única negativa es el giro: las cafeterías enfrentan competencia intensa y márgenes sensibles al costo de insumos.`),
    h2('Curva de supervivencia'),
    tabla(['Año t', 'S₀(t) nacional', 'S(t) del escenario', 'Probabilidad de seguir operando'], ref.supervivencia, { pie: 'Supervivencia del escenario frente a la nacional.', num: [0, 1, 2, 3] }),
    h2('Distribución de la utilidad anual'),
    p(`De los ${D.SIMULACIONES.toLocaleString('es-MX')} años simulados, el peor 5 % deja menos de ${mxn(ref.mc.p05)}; la mitad, menos de ${mxn(ref.mc.p50)}; y solo el mejor 5 % supera ${mxn(ref.mc.p95)}. La media es ${mxn(ref.mc.media)} y la desviación estándar ${mxn(ref.mc.sd)}, es decir, un coeficiente de variación de ${pct(ref.mc.sd / ref.mc.media)}. La proporción de años con utilidad positiva es ${pct(ref.mc.pPos)}.`),
    fig('docs/capturas/resultados.png', 'Resultados del simulador para el escenario de referencia.', { recorte: 0.8 }),
    h2('Lectura conjunta'),
    p(`Los dos resultados no se contradicen: una utilidad anual casi siempre positiva convive con una probabilidad de supervivencia cercana a la mitad porque miden cosas distintas. El Monte Carlo describe la operación *mientras el negocio existe*; la probabilidad logística incorpora las causas de cierre que no son puramente contables —competencia, giro, experiencia, liquidez— tal como las refleja la estadística nacional.`));

  // 8
  a(h1('Análisis de sensibilidad'),
    h2('Una variable a la vez'),
    p(`Las tablas siguientes mueven una sola variable del escenario de referencia entre todas sus opciones y vuelven a correr el modelo. La última columna es la diferencia en puntos de probabilidad respecto del escenario de referencia (${ref.P}).`),
    ...D.SENSIBILIDAD.flatMap((s) => [h3(s.variable), tabla(['Opción', 'β', 'P a 3 años', 'Cambio'], s.filas, { pie: `Sensibilidad de P a «${s.variable}».`, num: [1, 2, 3], anchos: [52, 12, 18, 18] })]),
    h2('Variables numéricas'),
    p(`Las variables numéricas no tienen un coeficiente propio: actúan a través de la utilidad, el punto de equilibrio y el margen de seguridad, que entra al modelo por tramos. Por eso un cambio moderado puede no mover P y uno mayor moverla de golpe, al cruzar un umbral.`),
    tabla(['Variable', 'Cambio', 'P a 3 años', 'Utilidad mensual', 'Punto de equilibrio'], D.SENSIBILIDAD_NUM, { pie: 'Sensibilidad a las principales variables numéricas.', num: [1, 2, 3, 4] }),
    h2('Giro y zona'),
    p(`La combinación de giro y zona explica buena parte de la variación. La tabla completa de los 35 giros en las 6 zonas está en el apéndice A; con sus supuestos, la probabilidad va de ${pct(Math.min(...D.MATRIZ.flatMap((f) => f.celdas.map((c) => c.P))))} a ${pct(Math.max(...D.MATRIZ.flatMap((f) => f.celdas.map((c) => c.P))))}.`),
    h2('Tornado de coeficientes'),
    fig('docs/capturas/analisis.png', 'Tornado de contribuciones β, comparador de escenarios y herramientas de exportación.', { recorte: 0.72 }));

  // 9
  a(h1('De la probabilidad a la decisión'),
    h2('FODA cuantitativo'),
    p(`El apartado de Estrategia clasifica cada contribución del modelo según su signo y según si depende del negocio: las internas positivas son fortalezas y las negativas, debilidades; las externas positivas son oportunidades y las negativas, amenazas. No es un FODA redactado: es una lectura directa del modelo.`),
    h2('Palancas'),
    p(`Una palanca es un cambio concreto —construir una reserva de seis meses, bajar el apalancamiento, renegociar proveedores, activar el marketing, formalizarse, capacitarse, diferenciarse, fidelizar o cambiar de zona—. Para cada una se vuelve a correr el modelo con ese cambio y se reporta el aumento de probabilidad. El plan se ordena por ese impacto.`),
    h2('Plan combinado, impacto y calendario'),
    lista(['**Simulador de plan.** Aplica juntas las acciones marcadas y recalcula; no suma puntos.', '**Matriz de impacto y control.** El impacto es la probabilidad que cambiaría si el factor fuera neutro. La probabilidad de que cada riesgo ocurra no está medida, y así se declara.', '**Calendario de 90 días.** Hitos por mes e indicador de seguimiento para cada acción; son sugerencias del equipo.']),
    fig('docs/capturas/estrategia.png', 'Apartado de Estrategia: FODA, tres escenarios y plan de acción.', { recorte: 0.85 }),
    h2('Diagnóstico de solidez'),
    p(`Más allá de los números, el negocio se revisa con una lista de verificación de ${D.PUNTOS.length} puntos en cinco niveles. El índice de solidez pondera los niveles (${D.NIVELES.map((n) => Math.round(n.w * 100) + ' %').join(', ')}) y un nivel se considera alcanzado cuando su avance es de al menos 70 %. **No es un modelo estadístico y no modifica P.** Cada punto ofrece un borrador redactado con los datos del simulador.`),
    tabla(['Nivel', 'Punto', 'Qué significa'], D.PUNTOS.map((x) => ['N' + x.n + ' · ' + D.NIVELES[x.n - 1].t, x.t, x.q]), { pie: 'Los 30 puntos del diagnóstico de solidez.', anchos: [24, 28, 48] }),
    h2('Reportes y código QR'),
    p(`El usuario puede llevarse tres documentos generados en su navegador: el reporte del negocio, el plan y el reporte completo. Ninguno es una captura del sitio. El código QR lleva el resultado *dentro* del enlace, en el fragmento que el navegador no envía al servidor: solo viajan las variables que difieren del escenario de referencia, el nombre del negocio, las respuestas del diagnóstico y las acciones marcadas. El teléfono recalcula todo con el mismo motor.`));

  // 10
  a(h1('Arquitectura de software'),
    h2('Principios'),
    lista(['**Sin servidor.** El sitio es un archivo HTML autocontenido; todo se calcula en el navegador.', '**Un solo motor.** La interfaz, los widgets, los reportes y estos documentos llaman a las mismas funciones; no se duplican fórmulas.', '**Núcleo puro.** Los módulos de datos y modelo no tocan la página: pueden probarse y reutilizarse fuera del navegador.', '**Sin dependencias pesadas.** No hay marco de interfaz; las únicas bibliotecas son Leaflet (mapa), Chart.js (gráficas), SheetJS (solo al subir un Excel) y un generador de códigos QR incluido.']),
    h2('Módulos'),
    tabla(['Archivo', 'Líneas', 'Responsabilidad'], D.MODULOS, { pie: 'Módulos que componen el sitio, en el orden en que el build los une.', num: [1], anchos: [30, 9, 61] }),
    h2('Construcción y despliegue'),
    p(`Un script une la plantilla, los estilos y los módulos en un solo archivo, calcula los hashes de la política de seguridad de contenido, inserta las fotografías con su cita y verifica que ninguna se repita. GitHub ejecuta las pruebas en cada cambio y solo publica si pasan.`),
    h2('Cálculo en segundo plano'),
    p(`El Monte Carlo y el rango plausible corren en un *Web Worker* creado a partir del mismo código del modelo. Si el navegador no lo permite, el sitio usa el motor síncrono. Una prueba verifica que ambos caminos den exactamente el mismo resultado.`),
    h2('Seguridad y privacidad por diseño'),
    lista(['Política de seguridad de contenido sin código en línea arbitrario; los recursos externos llevan verificación de integridad.', 'La única conexión saliente con datos del usuario es la pregunta al asistente de IA, que pasa por un intermediario del proyecto con lista de orígenes, tope de extensión y límite de solicitudes.', 'La clave del servicio de IA vive solo en el servidor del intermediario; nunca llega al navegador.', 'Los archivos del apartado para empresas se leen en memoria y no pueden enviarse: la política de contenido lo impide.', 'Los negocios guardados permanecen en el almacenamiento del navegador del usuario.']),
    h2('Diagrama del proceso'),
    fig('entregables/diagrama-proceso.png', 'Diagrama de proceso en seis carriles: del usuario al resultado.'));

  // 11
  a(h1('Verificación y validación'),
    h2('Estrategia'),
    p(`La verificación responde «¿el programa hace lo que dice la especificación?»; la validación, «¿la especificación representa bien la realidad?». COATL verifica de forma exhaustiva y declara con franqueza los límites de su validación (capítulo 14).`),
    h2('Pruebas unitarias'),
    tabla(['Archivo', 'Qué comprueba'], D.PRUEBAS_UNITARIAS, { pie: `Las ${D.PRUEBAS_UNITARIAS.length} pruebas unitarias del modelo y del intermediario de IA.`, anchos: [22, 78] }),
    h2('Validador independiente'),
    p(`Un segundo programa, escrito en Python y sin compartir código con el sitio, vuelve a implementar el modelo y compara sus resultados con los de referencia. Si dos implementaciones independientes coinciden, un error de programación es mucho menos probable.`),
    h2('Pruebas de navegador'),
    tabla(['Archivo', 'Casos'], D.PRUEBAS_E2E.map(([f, n]) => [f, String(n)]), { pie: `Pruebas de extremo a extremo; cada caso corre en computadora y en teléfono (${D.PRUEBAS_E2E.reduce((s, x) => s + x[1], 0) * 2} ejecuciones).`, num: [1], anchos: [70, 30] }),
    p(`Estas pruebas abren el sitio en un navegador real y comprueban, entre otras cosas, que el escenario de referencia dé las cifras esperadas, que no haya errores en la consola, que nada se desborde en teléfono vertical y horizontal, que los archivos de empresa nunca lleguen a la IA y que el sitio no tenga violaciones de accesibilidad.`),
    h2('Reproducibilidad'),
    p(`La semilla fija hace que el mismo escenario produzca siempre el mismo resultado, en cualquier equipo. Compartir un enlace equivale a compartir un experimento repetible.`));

  // 12
  a(h1('Interfaz y experiencia'),
    h2('Apartados'),
    tabla(['Apartado', 'Qué ofrece'], [['Inicio', 'La pregunta central, la retícula de supervivencia nacional, dos atajos al simulador, el video y fotografías del municipio.'], ['Territorio', 'Indicadores oficiales de Coacalco, crecimiento del padrón, sectores y las seis zonas.'], ['DENUE nacional', 'Conteos por entidad, municipio, sector, tamaño y actividad para todo el país.'], ['Simulador', 'Las 36 variables, el resultado en vivo, las gráficas, el mapa de zonas y «Mejora tu negocio».'], ['Para empresas', 'Análisis del historial propio, en el navegador, con plantilla de Excel.'], ['Estrategia', 'FODA, tres escenarios, plan priorizado, plan combinado, impacto y control, calendario.'], ['Metodología', 'Los modelos, la trazabilidad de cada cifra y cómo leer el resultado.'], ['Aviso legal', 'Titularidad, privacidad, uso de IA, licencias y limitaciones.']], { pie: 'Apartados del sitio.', anchos: [22, 78] }),
    fig('docs/capturas/inicio.png', 'Apartado de Inicio.', { recorte: 0.7 }),
    fig('docs/capturas/simulador.png', 'Simulador: formulario de variables y resultado en vivo.', { recorte: 0.75 }),
    h2('Principios de diseño'),
    lista(['**Identidad fija.** Rojo #C8102E, granate #7A0C1F y blanco hueso #FBF6F3; greca escalonada como firma visual.', '**Cada widget responde una pregunta.** Pregunta, interacción, respuesta y estado visible (cargando, listo, vacío o error).', '**Profundidad sin WebGL.** SVG isométrico y capas; el modelo 2.5D del negocio es un dibujo generado por código.', '**Movimiento con control.** Las grecas avanzan, pero se pausan con un botón y se desactivan si el sistema pide menos movimiento.']),
    h2('Accesibilidad'),
    p(`El sitio se verifica automáticamente contra los criterios WCAG 2.1 nivel AA en todos los apartados, en computadora y en teléfono. Puede usarse solo con teclado, las gráficas tienen una descripción en texto y el contraste se comprueba en cada publicación.`));

  // 13
  a(h1('Ética, privacidad y marco legal'),
    h2('Honestidad estadística'),
    p(`El proyecto adoptó desde su primera auditoría tres reglas: nunca presentar la probabilidad como cifra exacta; rotular cada número con su procedencia; y no afirmar niveles de exactitud que no pueden demostrarse. En particular, COATL no afirma «99 % de exactitud»: no existe una muestra contra la cual medirla.`),
    h2('Datos personales'),
    p(`El sitio no pide registro, no usa cookies propias ni analítica. Las excepciones se informan en el aviso legal: las preguntas libres al asistente viajan al servicio de IA, y los recursos de mapas y tipografías se solicitan a sus proveedores. El aviso se redactó conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente.`),
    h2('Variables sensibles'),
    p(`El riesgo de extorsión, la resiliencia y la motivación son supuestos que el usuario elige; el sitio no recaba información sobre delitos ni sobre la salud de nadie, y remite a la línea de denuncia anónima 089.`),
    h2('Propiedad intelectual y licencias'),
    p(`La obra es de sus tres autores conforme a la Ley Federal del Derecho de Autor. Las fotografías provienen de Wikimedia Commons con licencias Creative Commons y cada una lleva su cita; la cartografía es de OpenStreetMap; las tipografías tienen licencia abierta.`),
    h2('Uso de inteligencia artificial'),
    p(`La IA apoya en tres lugares y nunca es fuente de las cifras: responde preguntas libres del asistente, interpreta la descripción del negocio y asistió en la programación y en el dibujo del modelo 2.5D, siempre con revisión del equipo. Si una respuesta de la IA contradice al simulador, prevalece el simulador.`));

  // 14
  a(h1('Limitaciones y amenazas a la validez'),
    h2('Validez interna'),
    lista(['**Coeficientes parcialmente estimados.** Giro y zona se estiman con el DENUE; las demás variables (experiencia, reserva, formalidad, marketing, deuda, entre otras) siguen siendo supuestos del equipo, porque ninguna fuente pública las registra a nivel de negocio. Es la limitación principal.', '**Desaparición no es cierre.** En el DENUE un negocio puede desaparecer por cambio de domicilio o de giro; la cohorte se sigue cinco años y no tres. Por eso solo se usan diferencias entre giros y zonas.', '**Efectos por tramos.** El margen de seguridad y la deuda entran por umbrales, lo que produce saltos al cruzarlos.', '**Independencia.** El modelo no incluye interacciones entre variables (por ejemplo, entre giro y zona).', '**Supuestos del Monte Carlo.** Las desviaciones (22 %, 8 %, 15 % y 2 puntos) no se estimaron con datos.']),
    h2('Validez externa'),
    lista(['**Curva nacional.** S₀(t) es nacional y de todos los sectores; aplicarla a Coacalco supone que el municipio se comporta como el promedio del país.', '**Periodo.** La tabla cubre 1989–2019; no refleja cambios posteriores.', '**Datos por giro y zona.** Ticket, costo variable, demanda, afluencia y renta son estimaciones propias.', '**Pesos de 2018.** Las cifras de los Censos Económicos no se ajustan por inflación.']),
    h2('Validez de constructo'),
    lista(['**«Supervivencia» y «rentabilidad».** La estadística oficial mide permanencia; el sitio habla de seguir operando y ser rentable. La equivalencia es una interpretación.', '**Diagnóstico de solidez.** Es una lista de verificación, no una escala validada.', '**Riesgos del entorno.** Extorsión, resiliencia y motivación tienen efectos estimados por el equipo; no hay datos municipales públicos que permitan calibrarlos.']),
    h2('Limitaciones de la herramienta'),
    lista(['Las finanzas son antes de impuestos y sin valor terminal; la estimación fiscal es orientativa.', 'El guardado de negocios depende del navegador del usuario.', 'La IA depende de un servicio externo gratuito que puede interrumpirse.', 'COATL apoya la decisión, pero no sustituye la asesoría profesional.']));

  // 15
  a(h1('Trabajo futuro'),
    lista(['**Estimar los β restantes.** Levantar una encuesta local (o acceder al laboratorio de microdatos del INEGI) para estimar experiencia, reserva, formalidad y marketing, que el DENUE no registra.', '**Segunda cohorte del DENUE.** Repetir la estimación de giro y zona con la cohorte incorporada en 2024, cuando el INEGI publique la siguiente depuración censal, y comparar la estabilidad de los coeficientes.', '**Curva por sector y tamaño.** Usar las tablas de supervivencia por sector de actividad y por tamaño de establecimiento.', '**Validación retrospectiva.** Comparar las ediciones sucesivas del DENUE para medir cierres observados en Coacalco y contrastarlos con el modelo.', '**Llegadas de clientes.** Modelar con una distribución de Poisson los giros de poco flujo.', '**Rentas de campo.** Validar las rentas por zona con un muestreo en el municipio.', '**Otros municipios.** La arquitectura permite replicar el modelo cambiando los datos de zonas.', '**Interacciones y efectos continuos.** Sustituir los tramos por funciones suaves e incluir interacciones giro × zona.', '**Calibración.** Con datos reales, evaluar la calibración (curva de confiabilidad, puntaje de Brier) y la discriminación (área bajo la curva).']));

  // 16
  a(h1('Historial de versiones'),
    p(`Este capítulo documenta todas las versiones del proyecto, de la importación inicial a la versión ${D.VERSION.id.replace('v', '')}. La información proviene de un archivo único (\`data/versiones.json\`) que alimenta también la presentación, el libro de cálculo y el video; al publicar una versión nueva basta agregarla ahí y regenerar los entregables.`),
    tablaEvolucion(),
    p(`La tabla muestra un hecho central: el modelo cambió de fondo tres veces (versiones 1 a 3) y desde entonces sus cifras de referencia se han mantenido idénticas a través de diez versiones de funciones nuevas. Esa estabilidad no es casual: la vigilan las pruebas automáticas.`),
    ...historial(true));

  // 17
  a(h1('Conclusiones'),
    p(`COATL demuestra que es posible ofrecer a un emprendedor una estimación cuantitativa, transparente y reproducible de su riesgo, usando únicamente datos públicos y un navegador. Para el escenario de referencia, la herramienta estima ${ref.P} de probabilidad de supervivencia a tres años (rango plausible ${ref.rango}), frente a ${pct(D.M.S0[3])} del promedio nacional.`),
    p(`Tres decisiones de diseño resultaron determinantes. La primera, **anclar** el modelo a la tabla oficial de supervivencia, de modo que un escenario neutro reproduzca el promedio del país. La segunda, **declarar** qué es dato y qué es supuesto, y acompañar siempre la probabilidad de un rango. La tercera, **vigilar** el modelo con pruebas automáticas, lo que permitió crecer de un archivo a un sistema de ${D.MODULOS.length} módulos sin que sus cifras se movieran.`),
    p(`La limitación principal se redujo en la versión 13: los coeficientes de giro y zona ya se estiman con 305 mil negocios reales del DENUE; los demás siguen siendo supuestos declarados. El camino para superarla está trazado en el capítulo 15. Mientras tanto, COATL cumple su propósito: convertir una decisión tomada a ciegas en una decisión informada.`));

  // 18
  a(h1('Glosario'),
    tabla(['Término', 'Definición'], [
      ['AGEB', 'Área geoestadística básica: unidad territorial del INEGI.'], ['β (beta)', 'Coeficiente de una variable en el modelo logístico.'], ['β₀', 'Intercepto del modelo: valor de z cuando todas las contribuciones son cero.'],
      ['Bootstrap', 'Remuestreo con reemplazo de los datos propios para aproximar una distribución.'], ['Costo variable', 'Proporción de cada venta que se gasta en producirla o comprarla.'], ['DENUE', 'Directorio Estadístico Nacional de Unidades Económicas del INEGI.'],
      ['Logit', 'Logaritmo de la razón de momios, ln(P/(1−P)).'], ['Margen de seguridad', 'Fracción en que las ventas esperadas superan al punto de equilibrio.'], ['Monte Carlo', 'Simulación repetida de un experimento aleatorio para aproximar una distribución.'],
      ['P', 'Probabilidad de que el negocio siga operando y sea rentable a tres años.'], ['Palanca', 'Cambio concreto cuyo efecto en P se calcula volviendo a correr el modelo.'], ['Percentil', 'Valor por debajo del cual queda cierto porcentaje de los datos.'],
      ['Punto de equilibrio', 'Volumen de ventas en el que la utilidad es cero.'], ['Rango plausible', 'Percentiles 5 y 95 de P al perturbar los coeficientes; análisis de sensibilidad.'], ['RESICO', 'Régimen Simplificado de Confianza del ISR.'],
      ['ROI', 'Retorno sobre la inversión: utilidad anual entre capital invertido.'], ['S₀(t)', 'Supervivencia base nacional al año t.'], ['S(t)', 'Supervivencia del negocio al año t.'],
      ['SCIAN', 'Sistema de Clasificación Industrial de América del Norte.'], ['VPN', 'Valor presente neto de los flujos esperados.'], ['WCAG', 'Pautas de accesibilidad para el contenido web del W3C.'], ['Xicalcoliuhqui', 'Greca escalonada de la tradición mesoamericana; firma visual del proyecto.']], { pie: 'Glosario.', anchos: [24, 76] }));

  // 19
  a(h1('Referencias'), pasos(D.FUENTES.map(([t, u]) => (u ? `${t} [${u.replace(/^https?:\/\//, '').slice(0, 70)}](${u})` : t))));

  // Apéndices
  a(h1('Apéndice A. Probabilidad por giro y zona'), tablaMatriz(),
    h1('Apéndice B. Giros calibrados'),
    tabla(['Giro', 'Ticket promedio', 'Costo variable', 'Demanda de referencia (clientes/día)', 'Coeficiente β', 'Fuente del β'], D.GIROS.map((g) => [g.n, mxn(g.ticket), g.cv + ' %', String(g.dem), (g.z > 0 ? '+' : g.z < 0 ? '−' : '') + Math.abs(g.z).toFixed(2), g.fz === 'denue' ? 'DENUE ± ' + g.ee.toFixed(2) : 'equipo']), { pie: 'Los 35 giros. Ticket, costo variable y demanda: estimaciones del equipo, editables en el simulador. Coeficiente β: estimado con el DENUE salvo donde se indica.', num: [1, 2, 3, 4] }),
    h1('Apéndice C. Cómo reproducir los resultados'),
    pasos(['Clonar el repositorio público y ejecutar `npm ci`.', 'Ejecutar `npm run build` para generar el sitio.', 'Ejecutar `npm test` para las pruebas unitarias.', 'Ejecutar `python scripts/validar_modelo.py` para la validación independiente.', 'Ejecutar `npm run test:e2e` para las pruebas de navegador.', 'Ejecutar `npm run entregables` para regenerar este documento, el reporte, la presentación y el libro de cálculo.']),
    p(`Repositorio: [github.com/Maikolv/coatl](${D.REPO}). Sitio: [maikolv.github.io/coatl](${D.SITIO}).`));
  return { tipo: 'Documento técnico', titulo: 'Documento técnico', bajada: 'Fundamento estadístico, datos, especificación del modelo, resultados, arquitectura, verificación, limitaciones e historial completo de versiones de la herramienta que estima la **probabilidad de supervivencia a 3 años** y la **rentabilidad esperada** de un negocio en Coacalco de Berriozábal, Estado de México.', bloques: B };
}

// =====================================================================================================
export function reporte() {
  const B = [];
  const a = (...x) => B.push(...x.flat());
  a(h1('Resumen ejecutivo'),
    p(`**COATL** estima la probabilidad de que un negocio siga operando y sea rentable tres años después de abrir en Coacalco de Berriozábal, y su rentabilidad esperada. Combina datos oficiales con cuatro modelos encadenados: regresión logística, supervivencia por riesgos proporcionales, simulación de Monte Carlo y finanzas.`),
    tabla(['Indicador del escenario de referencia', 'Valor'], ref.indicadores.slice(0, 2).concat(ref.indicadores.slice(5, 14)), { pie: 'Cafetería en Los Héroes con los valores por defecto del simulador.', num: [1], anchos: [64, 36] }),
    nota(`**Cómo leerlo.** De 100 cafeterías como esta, el modelo espera que unas ${Math.round(ref.modelo.P * 100)} sigan abiertas y rentables al tercer año; el promedio nacional de todos los giros es ${Math.round(D.M.S0[3] * 100)}. El rango plausible (${ref.rango}) recuerda que los coeficientes son supuestos del equipo.`),
    h1('Problema y propuesta'),
    p(`Más de la mitad de los negocios que nacen en México cierra antes de tres años (INEGI, 1989–2019). Quien emprende no suele tener una estimación de su propio riesgo: las cifras nacionales no distinguen giro, zona ni condiciones del negocio.`),
    p(`COATL responde con un sitio web gratuito, sin registro y sin servidor: el usuario captura ${D.VARIABLES.length} variables y obtiene, en vivo, su probabilidad, su utilidad esperada, sus tres escenarios, su punto de equilibrio, un plan priorizado y un reporte que puede llevarse en PDF o con un código QR.`),
    fig('docs/capturas/simulador.png', 'El simulador: variables a la izquierda, resultado en vivo a la derecha.', { recorte: 0.72 }),
    h1('Datos'),
    tabla(['Fuente', 'Qué aporta'], [['INEGI, Demografía de los Negocios 1989–2019', 'Supervivencia base S₀(t): calibra el modelo y da forma a la curva'], ['INEGI, Censo 2020', 'Población del municipio'], ['INEGI, DENUE 05/2026', '11,554 establecimientos de Coacalco en 424 actividades; conteos nacionales'], ['INEGI, Censos Económicos 2019', 'Contraste de cada giro con negocios reales'], ['CONEVAL 2020', 'Poder de compra del mercado local'], ['INEGI, DENUE 2019 → 2024', 'Coeficientes β de giro y zona (305 mil negocios jóvenes seguidos cinco años)'], ['Estimaciones del equipo', 'Demás coeficientes β, ticket, costos y demanda por giro; afluencia y renta por zona']], { pie: 'Fuentes de información.', anchos: [42, 58] }),
    tabla(['Año t', 'S₀(t) nacional', 'S(t) del escenario', 'Probabilidad de seguir operando'], ref.supervivencia.filter((_, i) => [1, 2, 3, 5, 10].includes(i)), { pie: 'Supervivencia nacional y del escenario de referencia.', num: [0, 1, 2, 3] }),
    h1('Método'),
    h2('Modelo logístico'),
    p(`Cada variable aporta un coeficiente β; la suma z se convierte en probabilidad con la función logística. El intercepto se calibra para que un escenario neutro reproduzca la supervivencia nacional a tres años.`),
    formula(`z = β₀ + Σ βᵢ        P = 1 / (1 + e^(−z))        β₀ = ln(${D.M.S0[3]} / ${(1 - D.M.S0[3]).toFixed(4)}) = ${D.BETA0.toFixed(3)}`),
    h2('Supervivencia'),
    formula('θ = ln P / ln S₀(3)        S(t) = S₀(t) ^ θ'),
    h2('Monte Carlo'),
    p(`${D.SIMULACIONES.toLocaleString('es-MX')} años simulados con semilla fija. Cada año combina un choque común de demanda, ruido mensual de clientes y de ticket, y ruido en el costo variable. Se reportan los percentiles 5, 50 y 95.`),
    h2('Finanzas'),
    formula('VPN = −I₀ + Σ_{t=1..3} S(t)·Uₜ / (1 + r)ᵗ        ROI = Ū / I₀        Recuperación = I₀ / U_mes'),
    h1('Resultados'),
    tabla(['Contribución', 'β'], ref.contribucionesActivas, { pie: `Contribuciones distintas de cero. β₀ = ${D.BETA0.toFixed(3)}; z = ${ref.modelo.z.toFixed(4)}; P = ${ref.P}.`, num: [1], anchos: [70, 30] }),
    p(`Utilidad anual simulada: pesimista ${mxn(ref.mc.p05)}, esperada ${mxn(ref.mc.p50)}, optimista ${mxn(ref.mc.p95)}. El negocio alcanza su equilibrio con ${Math.ceil(e.peDia)} clientes al día y espera ${e.mu}.`),
    fig('docs/capturas/resultados.png', 'Resultados del escenario de referencia.', { recorte: 0.78 }),
    h1('Sensibilidad'),
    p('Las variables que más mueven la probabilidad, una a la vez, sobre el escenario de referencia:'),
    tabla(['Variable', 'Mejor opción', 'P', 'Peor opción', 'P'], D.SENSIBILIDAD.map((s) => { const f = [...s.filas].sort((x, y) => parseFloat(y[2]) - parseFloat(x[2])); return [s.variable, f[0][0], f[0][2], f[f.length - 1][0], f[f.length - 1][2]]; }), { pie: 'Extremos de cada variable de opciones.', num: [2, 4], anchos: [24, 28, 9, 30, 9] }),
    h1('De la probabilidad a la acción'),
    lista(['**Palancas:** cada cambio concreto se evalúa volviendo a correr el modelo y el plan se ordena por impacto.', '**Plan combinado:** aplica juntas las acciones marcadas; los puntos no se suman.', '**Diagnóstico de solidez:** 30 puntos en 5 niveles con un borrador a la medida; no modifica P.', '**Estimación fiscal:** RESICO o régimen general, orientativa.', '**Para llevar:** reporte en PDF, imagen y código QR con el reporte completo.']),
    fig('docs/capturas/estrategia.png', 'Estrategia: FODA cuantitativo y plan de acción.', { recorte: 0.8 }),
    h1('Verificación'),
    tabla(['Capa', 'Qué comprueba', 'Tamaño'], [['Pruebas unitarias', 'Fórmulas del modelo, tabla del INEGI, escenario de referencia, cálculo fiscal y diagnóstico', D.PRUEBAS_UNITARIAS.length + ' pruebas'], ['Validador independiente', 'Segunda implementación del modelo en Python', '1 programa'], ['Pruebas de navegador', 'Sitio real en computadora y teléfono, consola sin errores, privacidad y accesibilidad', D.PRUEBAS_E2E.reduce((s, x) => s + x[1], 0) + ' casos × 2']], { pie: 'Cadena de verificación.', anchos: [24, 56, 20] }),
    h1('Supuestos y limitaciones'),
    lista(['Los **coeficientes β de giro y zona** se estiman con el DENUE (2019 → 2024); los **demás** siguen siendo supuestos del equipo, porque ninguna fuente pública los registra a nivel de negocio.', 'En el DENUE, **desaparecer no siempre es cerrar**; por eso solo se usan diferencias entre giros y zonas.', 'La **supervivencia base** es la nacional (1989–2019), aplicada a Coacalco sin ajuste municipal.', 'Las **desviaciones del Monte Carlo** (22 %, 8 %, 15 % y 2 puntos) son supuestos del equipo.', 'El **ticket, el costo variable, la demanda por giro, la afluencia y la renta por zona** son estimaciones propias, editables en el simulador.', 'Las **finanzas** son antes de impuestos y sin valor terminal.', 'El **rango plausible** es un análisis de sensibilidad, no un intervalo de confianza.']),
    p('**Mejoras propuestas:** estimar los β restantes con una encuesta local; usar una distribución de Poisson para giros con poco flujo de clientes; y validar las rentas por zona con un muestreo de campo.'),
    h1('Historial de versiones'),
    tablaEvolucion(),
    ...historial(false),
    h1('Referencias'), pasos(D.FUENTES.map(([t, u]) => (u ? `${t} [${u.replace(/^https?:\/\//, '').slice(0, 70)}](${u})` : t))));
  return { tipo: 'Reporte técnico', titulo: 'Reporte técnico', bajada: 'Síntesis del problema, los datos, el método, los resultados, la verificación, las limitaciones y la evolución del proyecto, con las cifras calculadas por el propio modelo.', bloques: B };
}
