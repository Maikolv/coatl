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
| S₀(t), t = 6…10 | 0.341 … 0.284 | ⚠️ Interpolación geométrica | La nota solo publica las edades 0–4 y 30–34. Se interpola hasta S(32) = 1 − 0.8952 |
| Esperanza de vida al nacer | 8.4 años | ✏️ Antes 7.8 años | Misma nota del INEGI, E(0) = 8.4 |
| «De cada 100 negocios…» | 31 mueren el primer año; ~36 llegan a 5 años | ✏️ Antes 33 y 35 | Misma nota del INEGI |
| Esperanza de vida por sector (9.7 / 8.0 / 6.9) | — | ✏️ **Eliminado** | No se encontró en la edición 1989–2019. Las cifras sectoriales que circulan son de otra edición |
| Supervivencia nacional a 3 años (referencia en la lectura) | 42.6 % | ✏️ Antes 46 % | S₀(3) del INEGI |
| Distribución sectorial (48 / 38 / 9 / 5 %) | — | ⚠️ | Las fuentes municipales no publican el desglose; queda rotulado como estimación del equipo |
| Afluencia y renta por zona, ticket / CV / demanda por giro, coeficientes β | — | ⚠️ | Supuestos del equipo, declarados y editables en el simulador |

## Impacto en el modelo

- **β₀** se recalibró con la regla documentada (un escenario neutro reproduce S₀(3)): pasa de −0.16 a ln(0.4261/0.5739) ≈ −0.298.
- **Referencia v3:** P = 51.6 % (rango 44.3–58.3 %) y VPN = $912,776.
- La utilidad, el ROI y el payback no dependen de S₀, por eso no cambian.

## Pasos para que verifiques tú (≈15 min)

1. Abre la [nota del INEGI](https://www.inegi.org.mx/contenidos/programas/dn/2021/doc/Nota_Demo_Negocios.pdf). En la página 1 confirma la tabla q(x): 0.3092, 0.5188, 0.5739, 0.6129, 0.6432; E(0) = 8.4.
2. Si tu docente pide los años 6–10 exactos, consulta las tablas completas en el sitio de [Demografía de los Negocios del INEGI](https://www.inegi.org.mx/temas/dn/). Reemplaza los valores en `src/datos/datos.js` (`S0`) y en `scripts/validar_modelo.py`, y corre `npm run build && npm test`.
3. Descarga el CSV de [datos económicos de Coacalco](https://coacalco.gob.mx/datos-economicos/) y confirma 8,517 / 9,710 / 11,018 y 17,179,600.
4. Para la distribución sectorial, consulta el [DENUE](https://www.inegi.org.mx/app/mapa/denue/) filtrando por municipio 15-020. Con conteos por sector, actualiza `data:[48,38,9,5]` en `src/ui/resultados.js` y quita la marca de «estimación».
