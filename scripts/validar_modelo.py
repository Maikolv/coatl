"""Reimplementación independiente del modelo COATL (index.html) para validar el
escenario de referencia «Cafetería · Los Héroes» con los valores por defecto.

Uso:  uv run --no-project python scripts/validar_modelo.py
Sale con código 1 si alguna métrica se aparta del valor documentado en CLAUDE.md.
"""
from __future__ import annotations

import math
import sys

# ---- Constantes copiadas de index.html (sección 1) ----
S0 = [1, .67, .56, .46, .40, .35, .33, .31, .29, .27, .25]
N_SIM, SEMILLA = 2000, 20262
GIRO_CAFETERIA_Z = -0.08
ZONA_HEROES_Z = 0.04

# ---- Valores por defecto del formulario (atributos value/selected del HTML) ----
DEF = dict(
    expZ=0.0, formZ=0.10, mktZ=0.05, compZ=0.0, resZ=0.0,
    empleados=1, costoEmpleado=11000, propio=False, superficie=50,
    inversion=250000, credPct=0.20, tasa=0.24, renta=7500, ticket=85, cv=0.45,
    otrosFijos=6000, mu=60, diasSem=6, estacion=[1] * 12, r=0.12, merma=0.03,
    mktGasto=1500, crec=0.08, inf=0.045,
)

REFERENCIA = dict(P=0.550, util=41899, roi=2.126, payback=6, vpn=601442)


def acota(x, a, b):
    return min(b, max(a, x))


def derivar(e):
    e["diasMes"] = e["diasSem"] * 4.33
    e["cvEff"] = acota(e["cv"] + e["merma"], 0.02, 0.95)
    e["rentaEf"] = 0 if e["propio"] else e["renta"]
    e["interesMes"] = e["inversion"] * e["credPct"] * e["tasa"] / 12
    e["fijos"] = (e["rentaEf"] + e["empleados"] * e["costoEmpleado"] + e["otrosFijos"]
                  + e["mktGasto"] + e["interesMes"])
    e["ventasMes"] = e["mu"] * e["diasMes"] * e["ticket"]
    e["utilMes"] = e["ventasMes"] * (1 - e["cvEff"]) - e["fijos"]
    e["pePesos"] = e["fijos"] / (1 - e["cvEff"])
    e["ms"] = (e["ventasMes"] - e["pePesos"]) / e["ventasMes"]
    return e


def modelo_logistico(e):
    ms = e["ms"]
    msZ = 0.25 if ms >= 0.30 else 0.10 if ms >= 0.15 else -0.10 if ms >= 0 else -0.50
    c = e["credPct"]
    deudaZ = -0.20 if c >= 0.6 else -0.08 if c >= 0.3 else 0 if c > 0 else 0.05
    z = (-0.16 + GIRO_CAFETERIA_Z + ZONA_HEROES_Z + e["expZ"] + e["resZ"] + e["compZ"]
         + e["formZ"] + e["mktZ"] + deudaZ + (0.10 if e["propio"] else 0) + msZ)
    return acota(1 / (1 + math.exp(-z)), 0.04, 0.93), z


def curva(P):
    h = math.log(P) / math.log(S0[3])
    return [1 if t == 0 else s ** h for t, s in enumerate(S0)]


def mulberry32(a):
    """Port exacto (enteros de 32 bits) del RNG de index.html."""
    a &= 0xFFFFFFFF

    def imul(x, y):
        return (x * y) & 0xFFFFFFFF

    def rng():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = imul(a ^ (a >> 15), 1 | a)
        t = ((t + imul(t ^ (t >> 7), 61 | t)) & 0xFFFFFFFF) ^ t
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return rng


def gaussiana(rng):
    u = 0.0
    while u == 0:
        u = rng()
    v = 0.0
    while v == 0:
        v = rng()
    return math.sqrt(-2 * math.log(u)) * math.cos(2 * math.pi * v)


def monte_carlo(e):
    rng, res = mulberry32(SEMILLA), []
    for _ in range(N_SIM):
        total = 0.0
        for m in range(12):
            muM = e["mu"] * e["estacion"][m] * (1 + e["crec"]) ** (m / 12)
            cli = max(0, muM + gaussiana(rng) * 0.22 * muM)
            tk = max(1, e["ticket"] + gaussiana(rng) * 0.08 * e["ticket"])
            total += cli * e["diasMes"] * tk * (1 - e["cvEff"]) - e["fijos"]
        res.append(total)
    res.sort()
    media = sum(res) / N_SIM
    sd = math.sqrt(sum((x - media) ** 2 for x in res) / (N_SIM - 1))
    q = lambda p: res[min(N_SIM - 1, math.floor(p * N_SIM))]  # noqa: E731
    return dict(media=media, sd=sd, p025=q(.025), p05=q(.05), p50=q(.5), p95=q(.95),
                p975=q(.975), pPos=sum(x > 0 for x in res) / N_SIM)


def vpn3(e, S):
    v = -e["inversion"]
    for t in range(1, 4):
        ventas = e["ventasMes"] * 12 * (1 + e["crec"]) ** (t - 1)
        fijos = e["fijos"] * 12 * (1 + e["inf"]) ** (t - 1)
        v += S[t] * (ventas * (1 - e["cvEff"]) - fijos) / (1 + e["r"]) ** t
    return v


def main() -> int:
    e = derivar(dict(DEF))
    P, z = modelo_logistico(e)
    S = curva(P)
    mc = monte_carlo(e)
    obt = dict(P=P, util=e["utilMes"], roi=mc["media"] / e["inversion"],
               payback=e["inversion"] / e["utilMes"], vpn=vpn3(e, S))
    print(f"z={z:.4f}  margen de seguridad={e['ms']:.4f}  fijos={e['fijos']:.2f}")
    print("Monte Carlo:", {k: round(v, 2) for k, v in mc.items()})
    print("S(t):", [round(s, 4) for s in S])
    ok = True
    tol = dict(P=0.0005, util=1, roi=0.0005, payback=0.5, vpn=1)
    for k, ref in REFERENCIA.items():
        bien = abs(obt[k] - ref) <= tol[k]
        ok &= bien
        print(f"{'OK ' if bien else 'FALLA'} {k:8s} obtenido={obt[k]:,.4f}  referencia={ref:,}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
