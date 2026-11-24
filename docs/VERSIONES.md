# Historial de versiones de COATL

> Generado por `node scripts/documentos.mjs versiones` desde `data/versiones.json`, la misma fuente del documento técnico, el reporte, la presentación, el libro de Excel y el video. Para agregar una versión, edita ese archivo y ejecuta `npm run entregables`.

## Escenario de referencia en cada versión

| Versión | Fecha | Qué cambió | P | Utilidad/mes | ROI | Recuperación | VPN |
|---|---|---|---|---|---|---|---|
| v1 | 2026-11-12 | Importación inicial | 55.0 % | $41,899 | 212.6 % | 6 meses | $601,442 |
| v2 | 2026-11-12 | Modelo v2, módulos y pruebas | 55.0 % | $60,371 | 302.9 % | 4 meses | $970,106 |
| v3 | 2026-11-12 | Datos verificados del INEGI | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v4 | 2026-11-12 | Recorrido exploratorio | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v5 | 2026-11-12 | S₀ oficial hasta el año 10 y cálculo en segundo plano | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v5.1 | 2026-11-13 | DENUE nacional y apartado para empresas | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v6 | 2026-11-13 | Páginas por apartado, asistente y giros del SCIAN | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v7 | 2026-11-13 | Pestañas, censo, AGEB y accesibilidad verificada | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v8 | 2026-11-14 | IA del proyecto sin clave del visitante y mapa real | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v9 | 2026-11-15 | Cobro de piso, variables emocionales y giros de Coacalco | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v10 | 2026-11-15 | Herramientas del plan y entregables automáticos | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v11 | 2026-11-15 | Negocio con nombre, mejora del negocio y reporte propio | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v12 | 2026-11-16 | Resultado para llevar con QR y documentación extensa | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v13 | 2026-11-17 | β de giro y zona estimados con el DENUE, perfiles cifrados y carga más rápida | 38.0 % | $60,371 | 302.9 % | 4.1 meses | $686,989 |
| v14 | 2026-11-17 | β de formalidad estimado con el panel de la ENOE | 38.0 % | $60,371 | 302.9 % | 4.1 meses | $686,989 |
| v15 | 2026-11-17 | Validación fuera de muestra, sin doble conteo y plan que acota la pérdida | 38.0 % | $60,371 | 302.9 % | 4.1 meses | $686,989 |
| v16 | 2026-11-17 | Auditoría estricta: regla de salida corregida y β recalibrados | 40.9 % | $60,371 | 302.9 % | 4.1 meses | $736,085 |
| v17 | 2026-11-18 | Encuesta a negocios, veredicto honesto con VPN negativo y cotización del stand | 40.9 % | $60,371 | 302.9 % | 4.1 meses | $736,085 |
| v18 | 2026-11-23 | Versión final para la Feria Profesiográfica 2026: video con las voces del equipo y carga más ligera | 40.9 % | $60,371 | 302.9 % | 4.1 meses | $736,085 |

## v1 · Importación inicial (12 de noviembre de 2026)

**Qué es.** Primera versión funcional: un solo archivo HTML con el modelo logístico, la curva de supervivencia, el Monte Carlo y las finanzas.

**Por qué se hizo.** Punto de partida del proyecto de Probabilidad y Estadística: demostrar que la supervivencia de un negocio en Coacalco puede estimarse con un modelo reproducible.

- Aplicación de una sola página con 35 giros y 6 zonas.
- Modelo logístico con coeficientes del equipo, supervivencia aproximada y Monte Carlo sin choque anual.
- Auditoría inicial y validador del modelo en Python para vigilar el escenario de referencia.

**Efecto en el modelo.** β₀ = −0.16; S₀(t) aproximada; ticket 85 y costo variable 45 % en el escenario de referencia.

Confirmaciones: `69509f3`, `ed5ec65`.

## v2 · Modelo v2, módulos y pruebas (12 de noviembre de 2026)

**Qué es.** El código se separa en módulos con un build autocontenido; el Monte Carlo incorpora un choque anual común y se reportan P5, mediana y P95; aparece el rango plausible de P.

**Por qué se hizo.** Una auditoría mostró que el Monte Carlo subestimaba la dispersión (cada mes era independiente) y que P se presentaba como cifra exacta.

- Separación de index.html en src/ (datos, modelo, interfaz, mapa) con build sin dependencias.
- Monte Carlo con choque anual de demanda, ruido mensual y ruido de costo variable; cuantil tipo 7.
- Rango plausible de P perturbando los β (sensibilidad, no intervalo de confianza).
- Widgets: tornado de β, banda de supervivencia, comparador de escenarios, exportar y compartir.
- Pruebas unitarias, pruebas de navegador con Playwright y CI que prueba antes de publicar.
- Diagrama UML de 6 carriles y documento de metodología.
- Revisión de Codex: validación de entradas, controles conectados al modelo y accesibilidad.

**Efecto en el modelo.** Valores por defecto de Cafetería: ticket 95 y costo variable 38 %. Monte Carlo con choque anual.

Confirmaciones: `e988ea4`, `d1838b4`, `b5cd60a`, `8352ca5`, `e4b679f`, `ceb519b`, `a245ce2`.

## v3 · Datos verificados del INEGI (12 de noviembre de 2026)

**Qué es.** La supervivencia base pasa a ser la tabla oficial del INEGI 1989–2019 y β₀ se recalibra para reproducir la supervivencia nacional a 3 años.

**Por qué se hizo.** La S₀(t) original era una aproximación. Con la tabla oficial, un escenario neutro debe dar la supervivencia nacional (42.6 % a 3 años).

- S₀(t) oficial hasta el año 5 e interpolada del 6 al 10.
- β₀ = ln(0.4261/0.5739) ≈ −0.298.
- Reporte en Word y presentación generados directamente del modelo.
- Documento de verificación de datos (VERIFICACION_DATOS.md).
- Seguridad: política de contenido con hashes y cabeceras, tras un escaneo dinámico.
- Desglose sectorial con los conteos oficiales del DENUE para Coacalco.

**Efecto en el modelo.** β₀ ≈ −0.298; S₀(3) = 0.4261. La probabilidad de referencia baja de 55.0 % a 51.6 % y el VPN de $970,106 a $912,776.

Confirmaciones: `ef8940e`, `af302d3`, `3414905`, `6c01118`, `e7acfa2`.

## v4 · Recorrido exploratorio (12 de noviembre de 2026)

**Qué es.** El sitio deja de ser un formulario con resultados y se vuelve un recorrido: cada widget plantea una pregunta, permite una interacción y responde con el mismo motor.

**Por qué se hizo.** Los evaluadores entendían mejor el modelo cuando podían mover un supuesto y ver el efecto de inmediato.

- Widgets de inicio (clientes por día y mapa de zonas) con estados cargando, listo, vacío y error.
- Profundidad con SVG isométrico y capas; sin WebGL.
- Trazabilidad: de cada resultado a su fuente.
- Pruebas de teclado, movimiento reducido y coincidencia con el motor.

**Efecto en el modelo.** Sin cambios en el modelo (el de v3).

Confirmaciones: `1580230`, `4ff0e6e`, `b05a2fb`.

## v5 · S₀ oficial hasta el año 10 y cálculo en segundo plano (12 de noviembre de 2026)

**Qué es.** La curva base usa el tabulado oficial completo (t = 1…10) y el Monte Carlo y el rango plausible se calculan en un Web Worker.

**Por qué se hizo.** Eliminar la interpolación de los años 6 a 10 y evitar que 2,000 simulaciones bloquearan la página en teléfonos.

- S₀(t) oficial del INEGI para t = 1…10.
- Monte Carlo y rango de P en un Web Worker, con respaldo síncrono.
- Foto de contexto de Coacalco con su licencia.
- Reporte y presentación actualizados con la referencia v5.

**Efecto en el modelo.** Cambian los puntos de supervivencia de los años 6 a 10; P y VPN (que dependen de los tres primeros años) no cambian.

Confirmaciones: `2f93be5`, `8f0f7cd`, `1be9500`.

## v5.1 · DENUE nacional y apartado para empresas (13 de noviembre de 2026)

**Qué es.** Se agregan los conteos del DENUE para todo el país, sincronizados cada semana, y un apartado donde una empresa analiza su propio historial sin que salga del navegador.

**Por qué se hizo.** Dar contexto de competencia con datos oficiales y permitir sustituir los supuestos del equipo por datos reales del negocio.

- Sincronización semanal con la descarga oficial del INEGI (solo conteos, nunca datos de contacto).
- Explorador del DENUE por entidad, municipio y actividad.
- Apartado «Para empresas»: bootstrap de los meses del historial, 100 % local.
- Prueba automática de que los archivos de empresa no se envían a ningún servidor.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `f6b8fb4`, `1981e6e`, `a0829d7`.

## v6 · Páginas por apartado, asistente y giros del SCIAN (13 de noviembre de 2026)

**Qué es.** Cada apartado se abre como página propia; se puede describir el negocio por texto o voz; cualquier actividad del SCIAN sirve como giro; aparece el asistente.

**Por qué se hizo.** El sitio en una sola página era largo de recorrer y limitaba al usuario a 35 giros.

- Vistas por apartado con dirección propia y navegación atrás/adelante.
- «Describe tu negocio» con intérprete local y dictado por voz.
- 989 actividades del SCIAN como giros, con la plantilla del giro más cercano.
- Asistente flotante en todas las páginas y giros propios con cualquier nombre.
- Fotos reales de cada zona con su cita.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `9fba421`, `f0cd365`, `f65de58`.

## v7 · Pestañas, censo, AGEB y accesibilidad verificada (13 de noviembre de 2026)

**Qué es.** Pestañas de apartados abiertos, contraste de cada giro con los Censos Económicos 2019, límites oficiales de las AGEB en el mapa y accesibilidad WCAG 2.1 AA verificada.

**Por qué se hizo.** Acercar los supuestos por giro a datos oficiales y garantizar que el sitio pueda usarse con teclado y lector de pantalla.

- Pestañas reordenables dentro del proyecto; se retira el modo oscuro a petición del equipo.
- v7.1: contraste con los Censos Económicos 2019 sin cambiar los valores por defecto.
- v7.1: 70 AGEB urbanas del INEGI agrupadas en las seis zonas.
- v7.1: axe-core sin violaciones en todos los apartados.
- v7.2 y v7.3: preguntas libres del asistente e intérprete con Gemini; documentación de seguridad.
- v7.4: teléfono vertical y horizontal, documento técnico y video para evaluadores.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `d42899e`, `c594d22`, `e834ec9`, `967cb9a`, `058b0e1`, `9b2f2b7`.

## v8 · IA del proyecto sin clave del visitante y mapa real (14 de noviembre de 2026)

**Qué es.** La IA pasa a un intermediario del proyecto: el visitante ya no necesita una clave. Inicio y Simulador comparten el mapa real y las fotos no se repiten.

**Por qué se hizo.** Pedir una clave al visitante era una barrera y un riesgo; el esquema dibujado por el equipo no correspondía con los límites oficiales.

- Intermediario de IA en Vercel con lista de orígenes, tope de extensión y límite de solicitudes.
- Mapa real con las AGEB en Inicio y en el Simulador.
- Fotos de escenarios de Wikimedia Commons; el build falla si una se repite.
- Simulador sin huecos: el formulario acompaña a los resultados.
- v8.1: modelo de lenguaje rápido primero y diagnóstico de errores sin exponer la clave.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `d0d734c`, `c0bb8e1`, `faf8370`.

## v9 · Cobro de piso, variables emocionales y giros de Coacalco (15 de noviembre de 2026)

**Qué es.** Se agregan cuatro variables neutras por defecto (riesgo de extorsión, pago de piso, resiliencia y motivación) y la lista de las 424 actividades presentes en Coacalco.

**Por qué se hizo.** La extorsión y el desgaste del emprendedor son causas reales de cierre que el modelo no consideraba; se incorporan como supuestos que el usuario elige.

- 36 variables en cuatro pestañas; las cuatro nuevas no alteran el resultado si no se tocan.
- El pago de piso entra completo a los costos fijos.
- 424 actividades del DENUE de Coacalco como giros.
- Carrusel de zonas y aviso legal actualizado a la nueva ley de datos personales.
- Balance FODA con conteo de factores a favor y en contra.

**Efecto en el modelo.** P, utilidad, ROI, payback y VPN de referencia no cambian. El rango plausible pasa de 44.3–58.3 % a 44.1–58.2 % porque las variables nuevas consumen sorteos del generador aunque su β sea 0.

Confirmaciones: `1f105de`, `a80c253`.

## v10 · Herramientas del plan y entregables automáticos (15 de noviembre de 2026)

**Qué es.** Estrategia gana un simulador de plan, una matriz de impacto y control y un calendario de 90 días; los entregables se regeneran con un comando.

**Por qué se hizo.** Saber la probabilidad no bastaba: hacía falta combinar acciones y convertirlas en un plan con fechas.

- Simulador de plan que aplica juntas las acciones marcadas (no suma puntos).
- Matriz de impacto y control; se declara que la probabilidad de cada riesgo no está medida.
- Calendario de 90 días con indicadores de seguimiento.
- Aviso legal: uso aceptable, licencias de terceros y recomendación de revisión por un abogado.
- `npm run entregables` y flujo de GitHub que convierte a PDF con LibreOffice.
- Propuesta de stand físico.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `65c99fb`.

## v11 · Negocio con nombre, mejora del negocio y reporte propio (15 de noviembre de 2026)

**Qué es.** El usuario nombra y guarda su negocio; un apartado nuevo propone alternativas, un diagnóstico de 5 niveles con borradores, una estimación fiscal y un modelo 2.5D; el reporte deja de ser una captura del sitio.

**Por qué se hizo.** Pasar de «cuál es mi probabilidad» a «qué hago con ella», con algo que el usuario pueda llevarse.

- Nombre del negocio y negocios guardados en el navegador.
- Alternativas con su efecto real en P y botón para probarlas.
- Diagnóstico de solidez: 30 puntos en 5 niveles, con borrador a la medida (no cambia P).
- Estimación fiscal: RESICO de personas físicas o régimen general.
- Modelo 2.5D del negocio en SVG isométrico.
- Reporte propio en PDF e imagen de 3,200 px.
- Plantilla de Excel con identidad y guía.
- Grecas en movimiento con pausa; carruseles en Inicio y Territorio.
- Correcciones: contraste AA, navegación con cambios rápidos y documentos con el rango 44.1–58.2 %.

**Efecto en el modelo.** Sin cambios en el modelo. Se agrega una prueba que vigila el rango plausible.

Confirmaciones: `8c9920d`, `a6c5061`, `7d5ef77`, `95fc92e`, `32e3b85`.

## v12 · Resultado para llevar con QR y documentación extensa (16 de noviembre de 2026)

**Qué es.** El usuario se lleva todo su resultado (simulador y estrategia) con un código QR que abre su reporte completo; Estrategia tiene su propio PDF; los documentos crecen a nivel de tesis con el historial completo de versiones.

**Por qué se hizo.** En un stand, el visitante necesita irse con su resultado en el teléfono; y los evaluadores, con documentos que expliquen cada decisión del proyecto.

- Código QR que lleva el resultado dentro del enlace y abre el reporte completo en el teléfono.
- PDF propio del plan de Estrategia y reporte completo en dos partes.
- Menú con los mismos nombres que las pestañas.
- Micrófono con la identidad del proyecto en los botones de dictado.
- Aviso legal en dos columnas equilibradas, sin huecos.
- Grecas en movimiento en el pie de página y video del proyecto en Inicio.
- Documentos con las tipografías del sitio instaladas antes de convertir a PDF y símbolos β y S₀ escritos de forma explícita.
- Documento técnico, reporte, presentación y libro de Excel extensos, con este historial.
- Video ampliado y pauta para grabar las voces de los tres autores.

**Efecto en el modelo.** Sin cambios en el modelo.

Confirmaciones: `f8b4a0e`, `9b1d262`.

## v13 · β de giro y zona estimados con el DENUE, perfiles cifrados y carga más rápida (17 de noviembre de 2026)

**Qué es.** Los coeficientes de giro y zona dejan de ser supuestos: se estiman con 305,313 negocios jóvenes del Estado de México seguidos en el DENUE de 2019 a 2024. Los negocios guardados quedan aislados por usuario y cifrados, y la página carga más rápido.

**Por qué se hizo.** La auditoría señaló como limitación principal que todos los β eran supuestos del equipo. El DENUE se depura en cada censo económico (2019 y 2024) y los negocios que siguen conservan su identificador: eso permite medir supervivencia real por giro y por zona.

- Script scripts/denue_supervivencia.py: cohorte de negocios incorporados en la actualización censal de 2019, seguida a la edición de 2024; regresión logística con errores estándar y contracción bayesiana.
- β de 34 giros y 6 zonas estimados con datos; spa conserva el supuesto (sin clase SCIAN propia). Se guarda el supuesto anterior (zEq) para trazabilidad.
- Hallazgos: el corredor López Portillo tiene más rotación de lo supuesto (β −0.26 en lugar de +0.30) y la cafetería es más riesgosa (−0.33 en lugar de −0.08).
- Negocios guardados aislados por usuario: perfil con clave, cifrado AES-GCM con llave PBKDF2; sin perfil, solo en la pestaña.
- Tipografías servidas desde el propio sitio y estilos del mapa incorporados: sin peticiones externas que bloqueen la carga.
- La probabilidad se muestra en cuanto se calcula, sin esperar al Monte Carlo; indicador «cálculo listo» en la página (data-calculo).
- El código QR toma el dominio de la propia página o, en local, la dirección canónica.
- Se retiraron los documentos Word y el pitch heredados y sus generadores.

**Efecto en el modelo.** Cambian los β de giro y zona. El escenario de referencia (cafetería en Los Héroes) pasa de P = 51.6 % a 38.0 % (rango 30.6–46.6 %) y el VPN de $912,776 a $686,989; utilidad, ROI y recuperación no cambian porque no dependen de los β.

Confirmaciones: `25ecaf9`.

## v14 · β de formalidad estimado con el panel de la ENOE (17 de noviembre de 2026)

**Qué es.** La formalidad deja de ser un supuesto: se estima siguiendo durante un año a 5,245 dueños de negocios jóvenes en la Encuesta Nacional de Ocupación y Empleo del INEGI. Experiencia, reserva, marketing y deuda siguen como supuestos porque ninguna fuente pública los liga con la supervivencia.

**Por qué se hizo.** Tras v13 quedaban cinco β supuestos que el DENUE no registra. La ENAMIN, que medía micronegocios, se levantó por última vez en 2012. La ENOE sí es un panel: entrevista al mismo hogar cinco trimestres y clasifica cada negocio como formal o del sector informal.

- Script scripts/enoe_supervivencia.py: parejas 2023T1→2024T1 y 2024T1→2025T1; dueños (empleadores y cuenta propia) de negocios con 3 años o menos; sobrevive quien un año después sigue como dueño en la misma rama de actividad; regresión logística con errores agrupados por UPM.
- Resultado: un año después sigue el 53 % de los negocios formales y el 43 % de los informales. Llevado a 3 años con riesgos proporcionales y contraído hacia el supuesto del equipo, la diferencia formal − informal pasa de 0.16 a 0.23.
- Formulario: «Formalización gradual» pasa de 0.02 a −0.02 e «Informal» de −0.06 a −0.13; «Formal desde el inicio» conserva 0.10 (la ENOE identifica la diferencia, no el nivel).
- Prueba nueva: las opciones del formulario deben coincidir con data/enoe/supervivencia.json.
- Prompts para Codex: continuar el trabajo (docs/PROMPT_CODEX_CONTINUAR.md) y llevar las prácticas de COATL a Help Quote Terminal (docs/PROMPT_HELP_QUOTE_TERMINAL.md).
- Guion del video actualizado (cifras v13–v14, fuentes y límites).

**Efecto en el modelo.** Cambian los β de «Formalización gradual» e «Informal». El escenario de referencia usa «Formal desde el inicio», que no cambia, así que sus cifras se mantienen: P = 38.0 % (rango 30.6–46.6 %), VPN $686,989.

Confirmaciones: `14ae32d`.

## v15 · Validación fuera de muestra, sin doble conteo y plan que acota la pérdida (17 de noviembre de 2026)

**Qué es.** Se comprobó por primera vez si el modelo acierta, con 2,562 negocios de Coacalco que no usó para estimarse: ordena el riesgo apenas mejor que el azar (AUC 0.576) y el resultado se publica tal cual. Se quitó el doble conteo de competencia y del bloque financiero, las palancas cuentan la mitad de su efecto y Estrategia propone un plan por etapas con criterios de salida.

**Por qué se hizo.** Una auditoría estricta encontró que nunca se había comparado lo predicho con lo ocurrido, que la competencia y el bloque financiero se contaban dos veces, que se mezclaban horizontes sin documentarlo y que el plan presentaba asociaciones como efectos garantizados.

- Script scripts/validar_denue.py: giro estimado sin Coacalco y zona con validación cruzada de 5 grupos; Brier 0.2691 (constante 0.25), AUC 0.576, tabla por deciles. Se publica en el sitio y en METODOLOGIA.
- La competencia cercana deja de entrar a P (la zona del DENUE ya la refleja); sigue afectando los clientes esperados.
- Margen de seguridad + reserva + deuda acotados a [−0.50, +0.35].
- Nuevos indicadores: riesgo de quedarse sin efectivo en el primer año (Monte Carlo mes a mes contra la reserva) y probabilidad con solo lo medido (sin supuestos del equipo).
- Palancas etiquetadas como asociación medida con datos o supuesto del equipo; el plan cuenta la mitad de su efecto.
- Plan por etapas con criterios de salida en Estrategia y en el PDF del plan: prueba de demanda, inversión por tramos, revisiones en meses 3, 6 y 12, pérdida máxima.
- Una sola fuente de verdad: las cifras de las estimaciones del sitio salen de data/*.json (marcador @@DATO@@ del build).
- Tabla de horizontes de cada coeficiente en METODOLOGIA.

**Efecto en el modelo.** P y VPN de la referencia no cambian (38.0 %, $686,989). El rango plausible pasa de 30.6–46.6 % a 30.3–46.3 %, porque el sorteo de sensibilidad perturba una contribución menos.

Confirmaciones: `410112b`.

## v16 · Auditoría estricta: regla de salida corregida y β recalibrados (17 de noviembre de 2026)

**Qué es.** Se corrigió la regla de salida del plan, que comparaba meses sueltos contra el P5 de un promedio anual y daba falsas alarmas. Los β de giro y zona se recalibraron con la pendiente medida fuera de muestra, juguería y pastelería heredan el β de su clase SCIAN y se retiraron cifras sin fuente de las palancas.

**Por qué se hizo.** Una segunda auditoría encontró que el 22 % de los meses normales quedaba por debajo del umbral de salida, que la validación pedía achicar las diferencias entre giros y zonas y que varias palancas citaban porcentajes sin respaldo.

- Monte Carlo: ventas de cada mes, P5 de un mes y tasa de falsas alarmas de la regla (4.2 % de los años en la referencia).
- Regla de salida: dos meses seguidos bajo el P5 mensual → ajustar; el tercero → cerrar.
- β de giro y zona × pendiente de calibración 0.794 (scripts/aplicar_betas.mjs).
- Juguería y pastelería heredan el β de cafetería y panadería (antes conservaban el supuesto por un error de orden en el script).
- Palancas sin cifras sin fuente; cada una dice si su efecto está medido o es supuesto.
- Trazabilidad sin la competencia como parte de P; AUDITORIA con las secciones de v14 a v16.

**Efecto en el modelo.** Cambian los β de giro y zona. La referencia pasa de P = 38.0 % (rango 30.3–46.3 %) a 40.9 % (rango 33.4–48.9 %) y el VPN de $686,989 a $736,085; utilidad, ROI y recuperación no cambian.

Confirmaciones: `b406eb6`, `9f364d1`.

## v17 · Encuesta a negocios, veredicto honesto con VPN negativo y cotización del stand (18 de noviembre de 2026)

**Qué es.** Se creó la encuesta a negocios de Coacalco para estimar experiencia, reserva, marketing y deuda, sin enlaces ni datos que puedan filtrarse. El veredicto deja de llamar «sólido» a un negocio que sobrevive pero no recupera la inversión, y el stand tiene una cotización por partida.

**Por qué se hizo.** Quedaban cuatro coeficientes sin datos. Además, un reporte de un caso real mostraba 69.9 % de probabilidad con VPN de −$784,304 bajo el letrero «Escenario sólido» y con confeti.

- Encuesta (scripts/encuesta.mjs): 5 secciones, 22 preguntas, aviso de privacidad con consentimiento, codificación a los niveles del simulador y encabezado con la identidad de COATL; sin enlaces y con aviso contra suplantaciones.
- Veredicto: con P de 65 % o más y VPN negativo, el letrero dice «Sobrevive, pero no recupera la inversión», no hay confeti y la leyenda lo aclara.
- Cotización del stand por partida (entregables/COATL_Stand_Cotizacion.pdf) y totales actualizados en docs/STAND.md.
- Documentos con v14 a v16 y escena de Estrategia del guion actualizada.

**Efecto en el modelo.** El modelo no cambia: P = 40.9 % (rango 33.4–48.9 %), VPN $736,085.

Confirmaciones: `1ea9268`, `c079078`.

## v18 · Versión final para la Feria Profesiográfica 2026: video con las voces del equipo y carga más ligera (23 de noviembre de 2026)

**Qué es.** Versión de entrega. El proyecto se presenta en la Feria Profesiográfica 2026. El video lleva las voces del equipo en las 19 escenas, con subtítulos de lo que se dijo. El HTML pasa de 597 KB a 220 KB: el JS sale a un archivo con defer y las fotos fuera de la primera vista se cargan en diferido, pero las del carrusel se piden antes de que aparezcan. Los puntos del carrusel cumplen el área táctil de 24 px. Para la entrega se agregaron el correo de contacto del equipo, una sección de opinión en Inicio, un formulario de Google de retroalimentación y tres propuestas de stand austeras con imprimibles listos para la imprenta.

**Por qué se hizo.** El equipo grabó sus voces y el evento cambió a la Feria Profesiográfica 2026. PageSpeed Insights daba 95 de rendimiento y 97 de accesibilidad en el sitio publicado; la única auditoría fallida era el tamaño de los puntos del carrusel. En la revisión final, algunas fotos del carrusel aparecían en blanco al avanzar.

- Video: voces de Miguel, Bruno y Alonso en las 19 escenas (la 15 y la 17, regrabadas por Miguel con el guion vigente); tarjeta de portada con la Feria Profesiográfica 2026.
- Sitio, documentos, libro de Excel, README y propuesta de stand: el evento pasa a ser la Feria Profesiográfica 2026.
- Contacto A660136406@my.uvm.edu.mx en el pie, el aviso legal y la sección «Tu opinión» de Inicio, que arma un correo con la opinión ya escrita sin guardar ni enviar nada por su cuenta.
- Formulario de Google de retroalimentación (scripts/retroalimentacion.mjs) con encabezado de COATL y hoja de respuestas.
- Stand: tres propuestas austeras y acumulativas ($410 a $1,660) con visualizaciones generadas con Codex, cotización por partida e imprimibles a tamaño real (scripts/stand.mjs).
- JS en assets/js/coatl-<hash>.js con defer; la CSP ya no permite scripts en línea.
- Fotos del carrusel diferidas salvo la primera de Inicio; al acercarse el carrusel se cargan todas, así ninguna diapositiva aparece en blanco. La foto del Palacio deja de ir en base64.
- Puntos del carrusel con área táctil de 24 px (WCAG 2.5.8).
- scripts/medir_lighthouse.mjs y docs/rendimiento/INFORME.md con cada medición, la matriz de recursos y el estudio del DENUE.

**Efecto en el modelo.** El modelo no cambia: P = 40.9 % (rango 33.4–48.9 %), VPN $736,085.

Confirmaciones: `e4646ca`, `5086537`, `06fada3`, `bdc38bf`, `ddc45e7`, `e07e22a`, `2781546`.
