# Metodología de COATL (v5)

Fichas técnicas del modelo. Fuente de verdad del código: `src/modelo/modelo.js`, `src/modelo/finanzas.js` y `src/datos/datos.js`.
Validación cruzada independiente: `scripts/validar_modelo.py`.

Diagrama de proceso (UML, 6 carriles): [`diagrama-proceso.svg`](diagrama-proceso.svg) · [PNG](diagrama-proceso.png).

## ƒ₁ · Modelo logístico de puntaje

```
z = β₀ + Σ βᵢ·xᵢ        β₀ = logit(S₀(3)) = ln(0.4261/0.5739) ≈ −0.298
P = acota( 1 / (1 + e^(−z)), 0.04, 0.93 )
```

Hay 10 contribuciones: giro, zona, experiencia, reserva, competencia, formalidad, marketing, deuda, local propio y margen de seguridad (MS, del bloque determinista).
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
| **v13 (vigente)** | β de giro y zona estimados con el DENUE | **38.0 %** | **$60,371** | **302.9 %** | **4.1 meses** | **$686,989** |

Rango plausible de P: **30.6 %–46.6 %** desde v13 (44.1 %–58.2 % de v9 a v12) (en v3 a v8 era 44.3 %–58.3 %). El cambio no viene de los datos ni de los coeficientes: v9 agregó tres variables neutras (extorsión, resiliencia y motivación) y `rangoP` hace un sorteo por cada variable, aunque su β sea 0, así que la secuencia del generador se recorre y el P5 y el P95 se mueven una o dos décimas. P, la utilidad, el ROI, el payback y el VPN no cambiaron. La v4 incorporó el recorrido exploratorio con el modelo v3. En v5 cambian los puntos de supervivencia de los años 6–10. P y el VPN dependen de los primeros tres años. La utilidad, el ROI y el payback se calculan sin S₀.
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
