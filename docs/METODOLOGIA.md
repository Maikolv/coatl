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
| **v5 (vigente)** | S₀ oficial hasta el año 10 | **51.6 %** | **$60,371** | **302.9 %** | **4.1 meses** | **$912,776** |

Rango plausible de P (v3 y v5): 44.3 %–58.3 %. La v4 incorporó el recorrido exploratorio con el modelo v3. En v5 cambian los puntos de supervivencia de los años 6–10. P y el VPN dependen de los primeros tres años. La utilidad, el ROI y el payback se calculan sin S₀.
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
