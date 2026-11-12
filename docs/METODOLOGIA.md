# Metodología de COATL (v2)

Fichas técnicas del modelo. Fuente de verdad del código: `src/modelo/modelo.js`, `src/modelo/finanzas.js` y `src/datos/datos.js`.
Validación cruzada independiente: `scripts/validar_modelo.py`.

Diagrama de proceso (UML, 6 carriles): [`diagrama-proceso.svg`](diagrama-proceso.svg) · [PNG](diagrama-proceso.png).

## ƒ₁ · Modelo logístico de puntaje

```
z = β₀ + Σ βᵢ·xᵢ        β₀ = −0.16
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

S₀ = [1, .67, .56, .46, .40, .35, .33, .31, .29, .27, .25]. Es la tabla nacional aproximada de INEGI, «Esperanza de vida de los negocios». **Por verificar:** año y tabla exacta de la publicación.
El resultado cumple S(3) = P por construcción. La banda de la gráfica usa S(t) evaluada en P5 y P95 del rango plausible.

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
| **v2 (vigente)** | ticket 95, CV 38 % (giro Cafetería), MC con choque anual | **55.0 %** | **$60,371** | **302.9 %** | **4** | **$970,106** |

Rango plausible de P (v2): 47.8 %–61.7 %.
Monte Carlo v2: DE $179,399; P5 $489,097; P50 $744,277; P95 $1,072,698.
La prueba `compatibilidad` de `tests/modelo.test.mjs` confirma que con las entradas v1 se recuperan la utilidad y el VPN v1. Ninguna de las dos cantidades depende del Monte Carlo.
