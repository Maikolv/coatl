# Métodos para llevar la precisión de COATL al máximo posible

> **Punto de partida honesto.** Ningún método produce «exactitud absoluta» al predecir si un negocio sobrevivirá: el futuro de un negocio depende de hechos que aún no ocurren (demanda, competencia, salud del dueño). Lo que sí se puede lograr, y es lo que distingue a un modelo de nivel posgrado, es:
>
> 1. **Estimar** los parámetros con datos reales, no suponerlos.
> 2. **Calibrar**: que cuando el modelo diga 60 %, sobrevivan de verdad cerca del 60 %.
> 3. **Validar** con datos que el modelo no vio.
> 4. **Reportar la incertidumbre real**, con intervalos que cumplan su cobertura.
>
> Todo lo de abajo usa **datos reales y públicos**. Nada agrega ruido artificial: el Monte Carlo actual no es ruido inventado, sino la forma de propagar la variabilidad medida de la demanda. Si esa variabilidad se mide con datos, como se propone abajo, el Monte Carlo también deja de depender de supuestos.

## Situación actual

| Componente | Hoy | Fuente |
|---|---|---|
| S₀(t), supervivencia base | Tabulado **nacional** del INEGI, 1989–2019 | Dato oficial |
| Coeficientes β del modelo logístico | Valores asignados por el equipo | **Estimación del equipo** |
| Afluencia y renta por zona | Índices asignados por el equipo | **Estimación del equipo** |
| Ventas, costos y personal por giro | Censos Económicos 2019 (solo para contrastar) | Dato oficial |
| Incertidumbre de P | Rango de sensibilidad (perturbar los β) | No es un intervalo estadístico |

La mayor ganancia de precisión está en sustituir las dos filas de «estimación del equipo» por parámetros estimados.

## Métodos recomendados, del de mayor impacto al de menor

### 1. Panel del DENUE + modelo de riesgo en tiempo discreto ★ (mayor impacto)

- **Qué es:** el DENUE se publica en varias ediciones. Al seguir cada establecimiento entre ediciones se observa cuándo **aparece** (nace) y cuándo **desaparece** (cierra). Con eso se ajusta una **regresión logística por establecimiento-año**: el *modelo de riesgo en tiempo discreto* de Shumway (2001).
- **Por qué encaja:** COATL ya usa una regresión logística. Este método la convierte en un modelo **estimado con miles de negocios reales de Coacalco y municipios vecinos**, con intervalos de confianza verdaderos para cada β: giro, tamaño, zona (AGEB) y densidad de competencia.
- **Datos:** ediciones históricas del DENUE del INEGI, que son públicas.
- **Advertencia:** la desaparición en el DENUE incluye cambios de domicilio o de giro. Se separan con riesgos competitivos (método 3).

### 2. Kaplan–Meier local y Cox o Royston–Parmar para la curva base

- **Qué mejora:** con el mismo panel se estima la **S₀(t) de Coacalco** (o del Valle de México) por giro, en lugar de usar la curva nacional.
  - **Kaplan–Meier:** no paramétrico.
  - **Cox:** modela los cocientes de riesgo.
  - **Royston–Parmar:** curva base suave y extrapolable con *splines*.
- **Validación inmediata:** contrastar la curva local con la nacional del INEGI (Esperanza de vida de los negocios).

### 3. Riesgos competitivos (Fine–Gray)

- **Qué mejora:** distingue **cierre real** de **cambio de domicilio o de giro**. Sin esto, la probabilidad de cierre se sobreestima.

### 4. Modelo jerárquico bayesiano (*partial pooling*)

- **Qué mejora:** muchos giros tienen pocos negocios en Coacalco. El modelo jerárquico «toma prestada» información del mismo giro en otros municipios y de giros parecidos; así las estimaciones de grupos pequeños dejan de ser inestables.
- **Priors:** débilmente informativos para la regresión logística (Gelman et al., 2008).
- **Incertidumbre:** el resultado son **intervalos creíbles reales** en lugar del rango de sensibilidad actual.

### 5. Modelo de Huff para la demanda (clientes por día)

- **Qué mejora:** sustituye el índice de afluencia del equipo. La demanda de un local se reparte entre competidores según su atractivo (tamaño) y la distancia a cada AGEB:

  P(AGEB i → local j) ∝ tamañoⱼ^α / distanciaᵢⱼ^λ

- **Datos:**
  - población por AGEB (Censo 2020, ya en el proyecto);
  - ubicación y tamaño de cada competidor (DENUE);
  - α y λ calibrados con los ingresos por giro de los Censos Económicos.

### 6. Calibración y validación con datos que el modelo no vio

| Prueba | Qué responde |
|---|---|
| Validación temporal: entrenar con ediciones viejas del DENUE y probar con las recientes | ¿Funciona en el futuro, no solo en el pasado? |
| Puntaje de Brier | Error medio de las probabilidades |
| Curva de calibración y prueba de Hosmer–Lemeshow | ¿El «60 %» del modelo es un 60 % real? |
| AUC (discriminación) | ¿Ordena bien los negocios que sobreviven y los que cierran? |
| Análisis de curva de decisión (Vickers) | ¿Usar el modelo lleva a mejores decisiones que no usarlo? |

Reportar todo según la guía **TRIPOD**, el estándar internacional para modelos de predicción.

### 7. Intervalos con cobertura garantizada (predicción conformal)

- **Qué mejora:** sobre cualquier modelo, la predicción conformal da intervalos que **cumplen su cobertura** (por ejemplo 90 %) sin suponer normalidad. Funciona para la utilidad mensual y para el riesgo.

### 8. Microdatos de los Censos Económicos

- **Qué mejora:** el Laboratorio de Microdatos del INEGI permite trabajar con negocios individuales (no promedios) para medir la variabilidad real de ventas y costos por giro. Ese dato alimenta el Monte Carlo en lugar de los supuestos de `INCERTIDUMBRE`.

## Hoja de ruta sugerida

| Fase | Trabajo | Resultado |
|---|---|---|
| 1 | Descargar y enlazar ediciones del DENUE (método 1) | Nacimientos y cierres reales por giro y AGEB |
| 2 | Kaplan–Meier local y modelo de riesgo en tiempo discreto (métodos 1 y 2) | β y S₀(t) estimados, con intervalos |
| 3 | Validación temporal y calibración (método 6) | Brier, AUC y curva de calibración publicados |
| 4 | Modelo de Huff (método 5) | Demanda por zona estimada |
| 5 | Jerárquico bayesiano y conformal (métodos 4 y 7) | Incertidumbre real en cada resultado |

Al terminar la fase 2, el escenario de referencia cambiará, y **debe** cambiar, porque dejará de usar valores del equipo. El cambio se documenta según la regla de CLAUDE.md.

## Referencias (DOI verificados en Crossref)

- Kaplan, E. L. y Meier, P. (1958). Nonparametric estimation from incomplete observations. *JASA*. https://doi.org/10.1080/01621459.1958.10501452
- Cox, D. R. (1972). Regression models and life-tables. *JRSS B*. https://doi.org/10.1111/j.2517-6161.1972.tb00899.x
- Shumway, T. (2001). Forecasting bankruptcy more accurately: a simple hazard model. *Journal of Business*. https://doi.org/10.1086/209665
- Royston, P. y Parmar, M. (2002). Flexible parametric proportional-hazards and proportional-odds models. *Statistics in Medicine*. https://doi.org/10.1002/sim.1203
- Fine, J. y Gray, R. (1999). A proportional hazards model for the subdistribution of a competing risk. *JASA*. https://doi.org/10.1080/01621459.1999.10474144
- Gelman, A. et al. (2013). *Bayesian Data Analysis*, 3.ª ed. https://doi.org/10.1201/b16018
- Gelman, A., Jakulin, A. et al. (2008). A weakly informative default prior distribution for logistic regression. *Annals of Applied Statistics*. https://doi.org/10.1214/08-AOAS191
- Huff, D. (1964). Defining and estimating a trading area. *Journal of Marketing*. https://doi.org/10.1177/002224296402800307
- Brier, G. (1950). Verification of forecasts expressed in terms of probability. *Monthly Weather Review*. https://doi.org/10.1175/1520-0493(1950)078%3C0001:VOFEIT%3E2.0.CO;2
- Hosmer, D. y Lemeshow, S. (1980). Goodness of fit tests for the multiple logistic regression model. https://doi.org/10.1080/03610928008827941
- Vickers, A. y Elkin, E. (2006). Decision curve analysis. *Medical Decision Making*. https://doi.org/10.1177/0272989X06295361
- Collins, G. et al. (2015). TRIPOD statement. *BMJ*. https://doi.org/10.1136/bmj.g7594
- Steyerberg, E. (2019). *Clinical Prediction Models*, 2.ª ed. https://doi.org/10.1007/978-3-030-16399-0
- Vovk, V., Gammerman, A. y Shafer, G. (2005). *Algorithmic Learning in a Random World*. https://doi.org/10.1007/b106715
- Lei, J. et al. (2018). Distribution-free predictive inference for regression. *JASA*. https://doi.org/10.1080/01621459.2017.1307116
- Angelopoulos, A. y Bates, S. (2021). A gentle introduction to conformal prediction. https://arxiv.org/abs/2107.07511
- INEGI. Esperanza de vida de los negocios. https://www.inegi.org.mx/programas/evn/
- INEGI. DENUE. https://www.inegi.org.mx/temas/directorio/
- INEGI. Censos Económicos 2024. https://www.inegi.org.mx/programas/ce/2024/
