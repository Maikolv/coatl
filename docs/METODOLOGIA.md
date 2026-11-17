# Metodología de COATL (v5)

Fichas técnicas del modelo. Fuente de verdad del código: `src/modelo/modelo.js`, `src/modelo/finanzas.js` y `src/datos/datos.js`.
Validación cruzada independiente: `scripts/validar_modelo.py`.

Diagrama de proceso (UML, 6 carriles): [`diagrama-proceso.svg`](diagrama-proceso.svg) · [PNG](diagrama-proceso.png).

## ƒ₁ · Modelo logístico de puntaje

```
z = β₀ + Σ βᵢ·xᵢ        β₀ = logit(S₀(3)) = ln(0.4261/0.5739) ≈ −0.298
P = acota( 1 / (1 + e^(−z)), 0.04, 0.93 )
```

Hay 9 contribuciones principales: giro, zona, experiencia, reserva, formalidad, marketing, deuda, local propio y margen de seguridad (MS, del bloque determinista). Desde v15 la competencia cercana no entra a P (ver «Doble conteo»).
**Supuesto:** los β los asignó el equipo; no se estimaron con microdatos.

**Rango plausible de P** (`rangoP`): 1,000 sorteos con `βᵢ·(1 + 0.30·ε)` y `β₀ + 0.15·ε`, con ε ~ N(0,1) y semilla 20263. Se reportan P5–P95.
Es un análisis de sensibilidad, **no** un intervalo de confianza muestral.

## ƒ₂ · Supervivencia tipo Cox

```
h    = ln P / ln S₀(3)
S(t) = S₀(t)^h,   t = 0…10
```

S₀ = [1, 0.6908, 0.4812, 0.4261, 0.3871, 0.3568, 0.3320, 0.3111, 0.2930, 0.2770, 0.2627]. Para t = 1…10 se usa S₀(x+1) = p(x), columna C de la hoja `Nal_Tot_CE2019`, edades 0…9, redondeada a cuatro decimales. La tabla nacional se aplica a Coacalco sin ajuste municipal. [INEGI, tabulado nacional 1989–2019](https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx).

## ƒ₃ · Monte Carlo (2,000 años)

- RNG `mulberry32(20262)` y Box–Muller. Las corridas son reproducibles y dan los mismos números en JS y en Python.
- Por cada año:
  - F ~ LogN(−σ²/2, σ²) con σ = 0.15 (choque común; E[F] = 1).
  - cv″ ~ N(cv′, 0.02²), acotado a [0.02, 0.98].
- Por cada mes m:
  - clientes ~ N(μ·estacionalidadₘ·(1+g)^(m/12)·F, (0.22·…)²), truncado en 0.
  - ticket ~ N(t̄, (0.08·t̄)²), con mínimo 1.
- Uᵢ = Σₘ clientes·días·ticket·(1−cv″) − CF.
- Se reportan la media, la DE, los cuantiles tipo 7 (interpolación lineal) P2.5, P5, P50, P95, P97.5 y P(U>0).

## ƒ₄ · Punto de equilibrio

```
PE (clientes/mes) = CF / (t̄·(1−cv′))      MS = (V − PE$) / V
```

## ƒ₅ · Finanzas (antes de impuestos)

```
ROI     = Ū_MonteCarlo / I₀
Payback = I₀ / U_mes (determinista)
VPN     = −I₀ + Σ_{t=1..3} S(t)·Uₜ / (1+r)ᵗ,   Uₜ = V·12(1+g)^(t−1)(1−cv′) − CF·12(1+π)^(t−1)
```

No incluyen ISR/RESICO, depreciación, sueldo del dueño, capital de trabajo ni valor terminal.

## Escenario de referencia

| Versión | Entrada | P | Utilidad/mes | ROI | Payback | VPN |
|---|---|---|---|---|---|---|
| v1 (original) | ticket 85, CV 45 %, MC sin choque anual | 55.0 % | $41,899 | 212.6 % | 6 | $601,442 |
| v2 | ticket 95, CV 38 % (giro Cafetería), MC con choque anual | 55.0 % | $60,371 | 302.9 % | 4 | $970,106 |
| v3 | S₀ oficial hasta el año 5, interpolada del 6 al 10 | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v5 a v12 | S₀ oficial hasta el año 10 | 51.6 % | $60,371 | 302.9 % | 4.1 meses | $912,776 |
| v13 a v15 | β de giro y zona estimados con el DENUE | 38.0 % | $60,371 | 302.9 % | 4.1 meses | $686,989 |
| **v16 (vigente)** | β de giro y zona × pendiente de calibración (0.794) | **40.9 %** | **$60,371** | **302.9 %** | **4.1 meses** | **$736,085** |

Rango plausible de P: **33.4 %–48.9 %** desde v16 (30.3 %–46.3 % en v15; 30.6 %–46.6 % en v13 y v14, cuando la competencia aún entraba a P; 44.1 %–58.2 % de v9 a v12) (en v3 a v8 era 44.3 %–58.3 %). El cambio no viene de los datos ni de los coeficientes: v9 agregó tres variables neutras (extorsión, resiliencia y motivación) y `rangoP` hace un sorteo por cada variable, aunque su β sea 0, así que la secuencia del generador se recorre y el P5 y el P95 se mueven una o dos décimas. P, la utilidad, el ROI, el payback y el VPN no cambiaron. La v4 incorporó el recorrido exploratorio con el modelo v3. En v5 cambian los puntos de supervivencia de los años 6–10. P y el VPN dependen de los primeros tres años. La utilidad, el ROI y el payback se calculan sin S₀.
Monte Carlo v2: DE $179,399; P5 $489,097; P50 $744,277; P95 $1,072,698.
La prueba `compatibilidad` de `tests/modelo.test.mjs` confirma que con las entradas v1 se recuperan la utilidad y el VPN v1. Ninguna de las dos cantidades depende del Monte Carlo.

## Calibración con los Censos Económicos 2019

`scripts/censo_sync.py` descarga los datos abiertos del Estado de México (INEGI, CE 2019, año de referencia 2018) y, con el mismo mapeo giro → clases SCIAN del DENUE, calcula por unidad económica: ventas anuales (M000A), costo directo (K010A + K020A + K030A sobre M000A), personal ocupado (H001A), renta mensual (K050A) y remuneración media (J000A / H010A). Usa primero Coacalco con negocios de 0 a 10 personas, luego Coacalco total, luego el Estado de México. Resultado en `data/censo/giros.json` (31 giros; consultorio, dental, educación y spa sin dato publicable).

| Cafetería | Equipo (referencia) | Censo · Coacalco 0–10 personas |
|---|---|---|
| Ventas al año | $1,777,032 | $488,705 (pesos de 2018) |
| Costo directo | 38 % | 48 % |
| Personas | 2 | 2.2 |
| Renta al mes | $7,500 | $3,127 |

**Decisión:** el simulador muestra este contraste en el apartado Negocio y ofrece «Usar la referencia del censo», pero los valores por defecto no cambian, para que el escenario de referencia siga siendo reproducible (51.6 %). El contraste indica que el escenario de referencia describe una cafetería de alto desempeño, no la típica de Coacalco; conviene decirlo al presentar. Las cifras del censo están en pesos de 2018 y no se ajustaron por inflación.

## Zonas con límites oficiales

`scripts/ageb_sync.mjs` descarga las 70 AGEB urbanas de Coacalco (INEGI, servicio wscatgeo, Marco Geoestadístico de diciembre de 2025, con población del Censo 2020) y asigna cada una a la zona del equipo que contiene su centroide (64 AGEB) o a la más cercana (6). El mapa real dibuja esos límites; el modelo no cambia.

## Coeficientes de giro y zona estimados con el DENUE (v13)

Hasta la versión 12 todos los β eran supuestos del equipo. Desde la 13, los de **giro** y **zona** se estiman con datos:

1. **Por qué funciona.** El DENUE casi no cambia entre censos (99 % de los registros se repite de un año a otro entre 2019 y 2022). El INEGI lo depura cuando levanta los Censos Económicos: ediciones de noviembre de 2019 y de 2024. Los negocios que siguen conservan su identificador; los que cerraron desaparecen.
2. **Cohorte.** 305,313 negocios incorporados al DENUE en la actualización censal de 2019 en el Estado de México (fecha de alta 2019-11; ninguno estaba en la edición de 2018). 4,654 están en Coacalco.
3. **Resultado.** Si siguen en la edición de noviembre de 2024: el 54.7 % (66.5 % de todos los negocios del directorio).
4. **Modelo.** Regresión logística binomial (statsmodels): giro + tamaño en el Estado de México; zona en Coacalco con el resto como desplazamiento. Efectos centrados en el promedio y contraídos por Bayes empírico: β* = β·τ²/(τ² + EE²).
5. **Aplicación.** `scripts/aplicar_betas.mjs` escribe en `src/datos/datos.js` el β contraído (`z`), su error estándar (`ee`) y el supuesto anterior (`zEq`). Spa conserva el supuesto (no tiene clase SCIAN propia); juguería y pastelería heredan el β de cafetería y panadería (comparten clase).

**Hallazgos.** El corredor López Portillo pasa de +0.30 (supuesto) a −0.26: atrae más negocios, pero también más rotación. La cafetería pasa de −0.08 a −0.33. El escenario de referencia baja de 51.6 % a 38.0 %; utilidad, ROI y recuperación no cambian.

**Límites.** Desaparecer del DENUE no siempre es cerrar (cambio de domicilio o de giro). La cohorte se sigue cinco años y no tres, y empieza con negocios de hasta cinco años. Por eso solo se usan diferencias entre giros y zonas; el nivel de P lo sigue fijando β₀ con la tabla oficial del INEGI. El de formalidad se estima con la ENOE desde la v14 (sección siguiente); experiencia, reserva, marketing, deuda y demás variables siguen siendo supuestos del equipo.

Detalle por giro y zona, con errores estándar: `data/denue/supervivencia.json`, el documento técnico (capítulo 5) y el libro de Excel (hojas «β DENUE»).

## Formalidad estimada con el panel de la ENOE (v14)

El DENUE no registra experiencia, reserva, formalidad, marketing ni deuda. Se buscó una fuente pública que las ligue con la supervivencia:

| Variable | Fuente pública con supervivencia | Resultado |
|---|---|---|
| Formalidad | ENOE: panel de 5 visitas y clasificación oficial del sector informal (`tue_ppal`) | **Estimada** |
| Experiencia en el giro | ENOE solo pregunta la antigüedad en el trabajo actual (es la edad del negocio, no la experiencia previa); la ENAMIN, que preguntaba trayectoria, se levantó por última vez en 2012 | Supuesto del equipo |
| Reserva de capital | Ninguna encuesta pública pregunta meses de gastos cubiertos | Supuesto del equipo |
| Marketing | Ninguna encuesta pública lo liga con el cierre | Supuesto del equipo |
| Deuda | La ENAFIN mide crédito, pero es transversal: no sigue a los negocios | Supuesto del equipo |

1. **Panel.** La ENOE entrevista a cada hogar cinco trimestres seguidos: quien está en su 1.ª visita en el primer trimestre está en la 5.ª un año después. Se usan las parejas 2023T1 → 2024T1 y 2024T1 → 2025T1, porque el año de inicio del negocio (`p3r_anio`) solo viene en el cuestionario ampliado del primer trimestre.
2. **Muestra.** 6,144 dueños (empleadores y trabajadores por cuenta propia) de negocios con 3 años o menos; 5,245 (85.4 %) se volvieron a encontrar, con el mismo sexo y una edad coherente. 1,259 tienen negocio formal.
3. **Resultado.** Sobrevive quien, un año después, sigue como dueño en la misma rama de actividad. Se descartó usar el mismo año de inicio porque la respuesta cambia mucho entre visitas (error de memoria). Siguen el 53.1 % de los formales y el 43.3 % de los informales.
4. **Modelo.** Regresión logística con antigüedad del negocio, empleador o cuenta propia, sexo, edad, rama y pareja; errores agrupados por unidad primaria de muestreo. β(formal, 1 año) = 0.26 (EE 0.09).
5. **De 1 a 3 años.** Con riesgos proporcionales, S₃ = S₀(3)^HR, donde HR = 0.835 es el riesgo relativo formal/informal. La diferencia en escala logit a 3 años es 0.26 (EE 0.09). Se contrae hacia el supuesto anterior (0.16, desviación previa 0.15) y queda en **0.23**, con 75 % del peso en los datos.
6. **Aplicación.** «Formal desde el inicio» conserva 0.10, porque la ENOE identifica la diferencia, no el nivel, que lo fija β₀. «Informal» pasa de −0.06 a −0.13 y «Formalización gradual», a la mitad, de 0.02 a −0.02. El escenario de referencia usa «Formal desde el inicio», así que sus cifras no cambian. Una prueba exige que el formulario coincida con `data/enoe/supervivencia.json`.

**Límites.** Seguir como dueño en la misma rama no prueba que sea el mismo negocio. La ENOE mide personas, no establecimientos, y su muestra es nacional, no de Coacalco. El 14.6 % que no se volvió a encontrar puede tener otra supervivencia. Pasar de 1 a 3 años supone riesgos proporcionales. «Formal» es la definición del INEGI (fuera del sector informal: con registros contables o constituido como sociedad), que no es lo mismo que estar inscrito en el SAT o el IMSS.

**Cómo estimar las otras cuatro.** Hace falta un seguimiento propio. La ruta más barata es una encuesta corta a negocios abiertos en Coacalco que pregunte experiencia previa, meses de reserva, gasto en publicidad y porcentaje financiado con crédito. Después se ve qué negocios siguen en la siguiente edición del DENUE, con el mismo método de v13. Para detectar una diferencia de 10 puntos (45 % contra 55 %) con 80 % de potencia y α = 0.05 hacen falta unos 400 negocios por grupo.



## ¿Acierta el modelo? Validación fuera de muestra (v15)

`scripts/validar_denue.py` → `data/denue/validacion.json`. Se predice si cada negocio que el INEGI incorporó al DENUE de Coacalco en 2019 sigue en la edición de 2024, **sin usar ese negocio para estimar**: el β de giro se reestima con el Estado de México sin Coacalco y el de zona, con validación cruzada de 5 grupos dentro de Coacalco. La predicción es la de COATL: z = β₀ + giro + zona (lo demás en neutro, porque el DENUE no lo registra), P a 3 años y S(5) = S₀(5)^h.

| Métrica | Resultado | Lectura |
|---|---|---|
| Negocios | 2,562 | Coacalco, giros de COATL |
| Promedio predicho vs observado a 5 años | 35.5 % vs 50.6 % | Nivel desfasado: el directorio conserva negocios cerrados y la curva base es nacional |
| Brier | 0.2691 (constante: 0.25) | Sin corregir el nivel, peor que pronosticar la tasa observada |
| Brier con el nivel corregido | 0.2463 | 1.5 % mejor que la constante |
| AUC | 0.576 | 0.5 = azar: giro y zona ordenan el riesgo apenas mejor que el azar |
| Pendiente de calibración | 0.794 | Menor que 1: las diferencias entre giros y zonas están un poco exageradas |

| Decil | n | Predicho | Predicho (nivel corregido) | Observado |
|---|---|---|---|---|
| 1 | 257 | 24.4 % | 37.8 % | 42.8 % |
| 2 | 249 | 28.1 % | 42.6 % | 38.6 % |
| 3 | 263 | 30.1 % | 44.9 % | 41.4 % |
| 4 | 252 | 31.7 % | 46.8 % | 46.4 % |
| 5 | 252 | 33.6 % | 48.9 % | 55.2 % |
| 6 | 262 | 35.9 % | 51.4 % | 56.9 % |
| 7 | 258 | 37.8 % | 53.5 % | 48.4 % |
| 8 | 240 | 41.0 % | 56.8 % | 57.5 % |
| 9 | 271 | 42.7 % | 58.5 % | 57.2 % |
| 10 | 258 | 49.3 % | 64.7 % | 61.6 % |

**Conclusión honesta.** Giro y zona orientan, pero no predicen un negocio en particular. La mayor parte de lo que decide si un negocio sigue no está en el DENUE. Por eso el sitio publica esta validación, muestra P con su rango y propone un plan que acota la pérdida en lugar de prometer éxito.

## Horizonte de cada coeficiente (v15)

| Fuente | Qué estima | Horizonte medido | Cómo se lleva a 3 años |
|---|---|---|---|
| Tabla del INEGI 1989–2019 | Nivel (β₀) y curva S₀(t) | 1 a 10 años | Ya es a 3 años: β₀ = logit(S₀(3)) |
| DENUE 2019 → 2024 | Giro y zona | 5 años | Solo diferencias entre categorías (centradas); el nivel lo fija β₀. Supone que el orden entre giros y zonas es el mismo a 3 y a 5 años |
| ENOE (panel de 1 año) | Formalidad | 1 año | Riesgos proporcionales: S₃ = S₀(3)^HR, con HR medido a 1 año |
| Números del negocio | Margen de seguridad, riesgo de efectivo | Mes a mes y 1 año (Monte Carlo) | No se convierte: es del propio negocio |
| Supuesto del equipo | Experiencia, reserva, marketing, deuda y demás | Sin horizonte medido | Sin datos; se muestran aparte («P con solo lo medido») |

## Doble conteo corregido (v15)

1. **Competencia.** El β de zona del DENUE ya refleja la densidad de negocios: contar además «Competencia cercana» en P era contarla dos veces. Desde v15 no entra a P; sigue afectando los clientes esperados (`factorCompetencia`) y, por ahí, el margen de seguridad y el Monte Carlo.
2. **Bloque financiero.** Margen de seguridad, reserva y deuda salen de los mismos números de ventas y costos. Su suma se acota a [−0.50, +0.35] (el máximo es el de la reserva más alta), para que no se apilen.

El escenario de referencia no cambia (P = 38.0 %, VPN $686,989). El rango plausible pasa de 30.6–46.6 % a 30.3–46.3 %, porque el sorteo de sensibilidad perturba una contribución menos.

## Palancas del plan: asociación o supuesto, efecto a la mitad (v15)

Que los negocios formales sobrevivan más no prueba que formalizarse cause la supervivencia: los mejores negocios suelen formalizarse. Cada palanca de Estrategia se etiqueta como **«Asociación medida con datos»** (formalidad y zona) o **«Supuesto del equipo»** (las demás). Todas cuentan la **mitad** del salto que da el modelo (`FACTOR_PLAN = 0.5` en `src/ui/app.js`): en el plan, en el simulador de plan, en Mejora tu negocio y en los reportes.

## Riesgo de quedarse sin efectivo (v15)

El Monte Carlo sigue la caja mes a mes: reserva declarada (límite inferior de cada opción: 1.5, 3, 6 o 12 meses de gastos fijos) más la utilidad acumulada. Si en algún mes del primer año queda por debajo de cero, ese año cuenta como «sin efectivo». No agrega llamadas al generador aleatorio, así que los demás resultados no cambian. Es un dato del propio negocio, no un supuesto del equipo. La referencia da 0 %, porque gana dinero desde el primer mes; con 25 % de su demanda y sin reserva, da 67 %.

## Plan por etapas con criterios de salida (v15)

Ningún modelo asegura que un negocio sobreviva: en México, a 3 años sigue abierto el 42.6 %. Estrategia ya no promete éxito; propone un plan que **acota la pérdida** (`etapasPlan` en `src/ui/app.js`, también en el PDF del plan):

1. **Prueba de demanda** de 2 a 4 semanas. La meta es el punto de equilibrio en clientes al día; si no se alcanza, no se abre.
2. **Inversión por tramos.** No más del 40 % de la inversión antes del mes 3.
3. **Revisiones en los meses 3, 6 y 12** contra la mediana y el P5 de las ventas de un mes (desde v16; antes se usaba por error el P5 del promedio anual). Dos meses seguidos bajo el P5: ajustar a fondo; si el tercero sigue abajo, cerrar.
4. **Pérdida máxima** = la reserva. Si las pérdidas la alcanzan, se cierra; no se pide crédito para cubrirlas.
5. **Datos reales.** Desde el mes 3, el historial se carga en Para empresas y P se recalcula.

## Una sola fuente de verdad y un solo lenguaje (v15)

- Las cifras de las estimaciones que aparecen en el sitio salen de `data/*.json` con el marcador `@@DATO:archivo:ruta@@` del build; ya no se escriben a mano.
- Tres etiquetas, iguales en el sitio, los documentos y el video: **estimado con datos**, **supuesto del equipo** y **sensibilidad** (el rango plausible).
- No se agregan variables nuevas hasta que la validación mejore: más variables sin datos suben la apariencia de precisión, no la exactitud.


## Correcciones de la auditoría v16

1. **Regla de salida con el umbral correcto.** El plan compara meses sueltos, pero el P5 se calculaba sobre el promedio de los 12 meses del año ($115,150 en la referencia), mucho más estable que un mes: el 22 % de los meses normales caía por debajo. Desde v16 el Monte Carlo guarda las ventas de cada mes y el umbral es el P5 de un mes ($88,328). También mide cuántas veces se activaría la regla por error en un negocio que va como se esperaba: dos meses seguidos bajo el P5 ocurren en el 4.2 % de los años simulados. Por eso la regla pide ajustar primero y cerrar solo si el tercer mes sigue abajo.
2. **Recalibración de giro y zona.** La validación midió una pendiente de calibración de 0.794: las diferencias entre giros y zonas salían exageradas. `scripts/aplicar_betas.mjs` multiplica cada β de giro y zona (y su error estándar) por esa pendiente. La cafetería pasa de −0.33 a −0.26 y Los Héroes de −0.26 a −0.21. El nivel (promedio predicho frente a observado) no se corrige con el DENUE, porque el directorio conserva negocios que ya cerraron; sigue anclado a la tabla del INEGI.
3. **Herencia de clases compartidas.** Juguería y pastelería debían heredar el β de cafetería y panadería, pero el script del DENUE agregaba la herencia después de guardar el archivo y se quedaban con el supuesto del equipo. Desde v16 `aplicar_betas.mjs` la aplica: juguería −0.26 (antes −0.06) y pastelería −0.05 (antes 0.00).
4. **Afirmaciones de las palancas.** Se retiraron las cifras sin fuente verificable («−50 % de riesgo de cierre», «+12 % de alcance» como dato). Cada palanca dice si su efecto está medido (formalidad con la ENOE, zona con el DENUE) o es supuesto del equipo, y la cifra de Bain se rotula como efecto sobre utilidades, no sobre supervivencia.

**Nueva referencia (v16):** P = 40.9 % (rango 33.4–48.9 %), utilidad $60,371, ROI 302.9 %, payback 4.1 meses, VPN $736,085. Con solo lo medido, P = 39.7 %.
