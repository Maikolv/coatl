# Verificación de datos (12-nov-2026)

Cada cifra que muestra COATL se cotejó con su fuente primaria.

| Estado | Significado |
|---|---|
| ✅ | Confirmada |
| ✏️ | Corregida |
| ⚠️ | Estimación del equipo, sin fuente oficial |

| Dato en COATL | Valor | Estado | Fuente consultada |
|---|---|---|---|
| Población de Coacalco | 293,444 (51.9 % mujeres, 48.1 % hombres) | ✅ | [INEGI, Censo 2020](https://www.inegi.org.mx/programas/ccpv/2020/) · [Data México](https://www.economia.gob.mx/datamexico/es/profile/geo/coacalco-de-berriozabal) |
| Unidades económicas | 8,517 (2013) · 9,710 (2018) · 11,018 (2020) | ✅ | [Gob. de Coacalco, datos económicos](https://coacalco.gob.mx/datos-economicos/) (CSV «Unidades económicas 2013-2020») |
| Crecimiento medio anual de unidades económicas | 3.7 % | ✅ | Cálculo: (11,018/8,517)^(1/7) − 1 = 3.75 % |
| Valor agregado censal bruto | $17,179.6 millones | ✏️ El año es **2020** (decía «IMAE 2021») | Mismo CSV, fila 2020: 17,179,600 miles de pesos |
| Pobreza | 28.6 % (26.1 % moderada, 2.5 % extrema); 71.4 % fuera de pobreza | ✅ | [CONEVAL, pobreza municipal 2020](https://www.coneval.org.mx/InformesPublicaciones/Paginas/Mosaicos/Informe_Pobreza_Municipios_Mexico_2020.aspx) |
| Supervivencia nacional S₀(t), t = 1…5 | 0.691 · 0.481 · 0.426 · 0.387 · 0.357 | ✏️ Antes 0.67 · 0.56 · 0.46 · 0.40 · 0.35 | [INEGI, Nota sobre los indicadores de la Demografía de los Negocios (2021)](https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf), tabla 1989–2019: q(0) = 0.3092 … q(4) = 0.6432 |
| S₀(t), t = 6…10 | 0.3320 · 0.3111 · 0.2930 · 0.2770 · 0.2627 | ✏️ Sustituye la interpolación geométrica | [INEGI, tabulado nacional 1989–2019](https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx), hoja `Nal_Tot_CE2019`, celdas C9:C13, edades 5–9 |
| Esperanza de vida al nacer | 8.4 años | ✏️ Antes 7.8 años | Misma nota del INEGI, E(0) = 8.4 |
| «De cada 100 negocios…» | 31 mueren el primer año; ~36 llegan a 5 años | ✏️ Antes 33 y 35 | Misma nota del INEGI |
| Esperanza de vida por sector (9.7 / 8.0 / 6.9) | — | ✏️ **Eliminado** | No se encontró en la edición 1989–2019. Las cifras sectoriales que circulan son de otra edición |
| Supervivencia nacional a 3 años (referencia en la lectura) | 42.6 % | ✏️ Antes 46 % | S₀(3) del INEGI |
| Distribución sectorial de Coacalco | 45.9 % comercio al por menor · 45.0 % servicios · 6.0 % manufactura · 3.0 % otros | ✅ Confirmada | INEGI, DENUE 05/2026, CSV del Estado de México |
| Afluencia y renta por zona, ticket / CV / demanda por giro, coeficientes β | — | ⚠️ | Supuestos del equipo, declarados y editables en el simulador |

## Impacto en el modelo

- **β₀** se recalibró con la regla documentada (un escenario neutro reproduce S₀(3)): pasa de −0.16 a ln(0.4261/0.5739) ≈ −0.298.
- **Referencia v5:** P = 51.6 % (rango 44.3–58.3 %) y VPN = $912,776, iguales a la v3. El tabulado confirma los primeros cinco años a la precisión usada por el modelo.
- La utilidad, el ROI y el payback no dependen de S₀, por eso no cambian.

## Pasos para que verifiques tú (≈15 min)

1. Abre la [nota del INEGI](https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf). En la página 1 confirma la tabla q(x): 0.3092, 0.5188, 0.5739, 0.6129, 0.6432; E(0) = 8.4.
2. Abre [EDN 1989–2019](https://www.inegi.org.mx/programas/dn/2019/), pestaña «Tabulados», y descarga la [tabla nacional completa](https://www.inegi.org.mx/contenidos/programas/dn/2019/tabulados/Nal_Tot_CE2019.xlsx). En la columna C, usa p(x) de las edades 0–9 para S₀(1)…S₀(10). La fila de edad 9 da p(9) = 0.2627045879779622.
3. Descarga el CSV de [datos económicos de Coacalco](https://coacalco.gob.mx/datos-economicos/) y confirma 8,517 / 9,710 / 11,018 y 17,179,600.

## Distribución sectorial de Coacalco

Edición DENUE 05/2026, descargada el 12 de noviembre de 2026. Se filtraron ambos CSV por entidad 15 y municipio 020. El sector se obtuvo de los primeros dos dígitos de `codigo_act`. Cada registro representa un establecimiento.

| Grupo | SCIAN | Parte 1 | Parte 2 | Total | Porcentaje |
|---|---|---:|---:|---:|---:|
| Comercio al por menor | 46 | 5,305 | 0 | 5,305 | 45.9 % |
| Servicios | 51–81 | 305 | 4,899 | 5,204 | 45.0 % |
| Manufactura | 31–33 | 696 | 0 | 696 | 6.0 % |
| Otros | Resto | 258 | 91 | 349 | 3.0 % |
| Total | | 6,564 | 4,990 | 11,554 | 100 % |

Los cuatro porcentajes se redondean por separado y suman 99.9 %. Fuentes: [descarga masiva](https://www.inegi.org.mx/app/descarga/), [CSV 1](https://www.inegi.org.mx/contenidos/masiva/denue/denue_15_1_csv.zip) y [CSV 2](https://www.inegi.org.mx/contenidos/masiva/denue/denue_15_2_csv.zip).

## Fuentes consultadas para giros y zonas

| Variable | Estado | Fuente consultada y alcance |
|---|---|---|
| Ticket y demanda por giro | Estimación del equipo | [INEGI, ENIGH 2024](https://www.inegi.org.mx/programas/enigh/nc/2024/). Mide gasto del hogar, sin validar tickets ni clientes diarios por establecimiento. |
| Costo variable por giro | Estimación del equipo | [INEGI, Censos Económicos (SAIC)](https://www.inegi.org.mx/app/saic/default.html). Los agregados de gastos e ingresos no identifican la proporción variable usada en COATL. |
| Afluencia y renta comercial por zona | Estimación del equipo | [INEGI, DENUE](https://www.inegi.org.mx/app/mapa/denue/). Identifica establecimientos y actividad, sin mediciones de afluencia ni rentas comerciales por m². |
