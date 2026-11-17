"""COATL · ¿Acierta el modelo? Validación fuera de muestra con la cohorte del DENUE de Coacalco.

Se predice, para cada negocio que el INEGI incorporó al DENUE de Coacalco en 2019 (alta 2019-11),
si seguirá en la edición de noviembre de 2024, SIN usar ese negocio para estimar los β:
  · giro: se reestima con el Estado de México EXCEPTO Coacalco (mismo método que denue_supervivencia.py);
  · zona: validación cruzada de 5 grupos dentro de Coacalco (se estima con 4/5 y se predice el 1/5 restante).
Predicción de COATL: z = β₀ + β_giro + β_zona (las demás variables en su valor neutro, porque el DENUE
no las registra) → P(3 años) → S(5) = S₀(5)^h con h = ln P / ln S₀(3), la misma curva del sitio.

Métricas: puntuación de Brier (y la de un pronóstico constante como punto de comparación), AUC,
calibración global (promedio predicho vs observado) y tabla por deciles. También se informa la Brier
tras corregir solo el nivel (un desplazamiento del intercepto), para separar el error de nivel del de orden.

Uso: uv run --no-project --with numpy --with statsmodels python scripts/validar_denue.py
Requiere las ediciones en .cache/denue/historico/ (las baja denue_supervivencia.py).
Escribe data/denue/validacion.json (solo agregados).
"""
from __future__ import annotations
import json, math, random, sys
from collections import Counter
from pathlib import Path

import numpy as np
import statsmodels.api as sm

sys.path.insert(0, str(Path(__file__).resolve().parent))
from denue_supervivencia import ALTA, DESPUES, MARCA_ALTA, MUN, ESTRATOS, RAIZ, leer, giro_de, contraer  # noqa: E402

S0 = [1, 0.6908, 0.4812, 0.4261, 0.3871, 0.3568]   # tabla del INEGI (src/datos/datos.js)
BETA0 = math.log(S0[3] / (1 - S0[3]))
K = 5
SEMILLA = 20262


def logit_fit(y, X, offset=None):
    return sm.GLM(y, X, family=sm.families.Binomial(), offset=offset).fit()


def auc(p, y):
    """Probabilidad de que un sobreviviente al azar tenga mayor predicción que un no sobreviviente (rangos medios)."""
    orden = np.argsort(p); r = np.empty(len(p)); r[orden] = np.arange(1, len(p) + 1)
    for v in np.unique(p):                              # empates: rango medio
        m = p == v; r[m] = r[m].mean()
    n1 = y.sum(); n0 = len(y) - n1
    return float((r[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))


def main() -> None:
    zonas = {a["ageb"].upper(): a["zona"] for a in json.loads((RAIZ / "data/ageb/coacalco.json").read_text(encoding="utf-8"))["agebs"]}
    E, D = leer(ALTA), leer(DESPUES)
    filas = [(giro_de(v[0]), ESTRATOS.get(v[1], "31+"), v[2], v[3], 1 if i in D else 0)
             for i, v in E.items() if v[4] == MARCA_ALTA]

    # ---------- Giro: Estado de México sin Coacalco ----------
    fuera = [f for f in filas if f[2] != MUN]
    giros = sorted({f[0] for f in fuera if f[0]})
    tams = ["6-10", "11-30", "31+"]
    def matriz(fs):
        X = np.zeros((len(fs), 1 + len(giros) + len(tams))); X[:, 0] = 1
        for k, (g, t, *_r) in enumerate(fs):
            if g in giros: X[k, 1 + giros.index(g)] = 1
            if t in tams: X[k, 1 + len(giros) + tams.index(t)] = 1
        return X
    m1 = logit_fit(np.array([f[4] for f in fuera]), matriz(fuera))
    n_g = Counter(f[0] for f in fuera if f[0])
    media = sum(m1.params[1 + giros.index(g)] * n_g[g] for g in giros) / sum(n_g.values())
    giro_c, _ = contraer({g: (float(m1.params[1 + giros.index(g)] - media), float(m1.bse[1 + giros.index(g)])) for g in giros})

    # ---------- Zona: validación cruzada dentro de Coacalco (solo negocios de giros COATL) ----------
    coa = [f for f in filas if f[2] == MUN and f[3] in zonas and f[0] in giros]
    y = np.array([f[4] for f in coa], dtype=float)
    lineal = matriz(coa) @ m1.params - m1.params[0]          # desplazamiento: giro y tamaño, sin intercepto
    zn = sorted(set(zonas.values()))
    Z = np.zeros((len(coa), len(zn)))
    for j, f in enumerate(coa): Z[j, zn.index(zonas[f[3]])] = 1
    grupos = list(range(len(coa))); random.Random(SEMILLA).shuffle(grupos)
    pliegue = np.empty(len(coa), dtype=int); pliegue[grupos] = np.arange(len(coa)) % K
    z_pred = np.zeros(len(coa))
    for k in range(K):
        tr = pliegue != k
        m2 = logit_fit(y[tr], Z[tr], offset=lineal[tr])
        n_z = Z[tr].sum(0)
        mz = float((m2.params * n_z).sum() / n_z.sum())
        zc, _ = contraer({z: (float(m2.params[i] - mz), float(m2.bse[i])) for i, z in enumerate(zn)})
        te = ~tr
        z_pred[te] = [zc[zonas[coa[j][3]]][0] for j in np.where(te)[0]]

    # ---------- Predicción de COATL y métricas ----------
    zg = np.array([giro_c[f[0]][0] for f in coa])
    P3 = 1 / (1 + np.exp(-(BETA0 + zg + z_pred)))
    P3 = np.clip(P3, 0.04, 0.93)                              # mismo tope que el sitio
    S5 = S0[5] ** (np.log(P3) / math.log(S0[3]))
    brier = float(np.mean((S5 - y) ** 2))
    brier_const = float(np.mean((y.mean() - y) ** 2))         # pronóstico constante = tasa observada (ya conoce el nivel)
    # Corrección solo del nivel: un intercepto sobre el logit de S5.
    lg = np.log(S5 / (1 - S5))
    a = float(logit_fit(y, np.ones((len(y), 1)), offset=lg).params[0])
    S5n = 1 / (1 + np.exp(-(lg + a)))
    brier_nivel = float(np.mean((S5n - y) ** 2))
    pendiente = float(logit_fit(y, sm.add_constant(lg)).params[1])   # 1 = dispersión correcta; <1 = predicciones demasiado extremas
    cortes = np.quantile(S5, np.linspace(0, 1, 11)); dec = np.clip(np.searchsorted(cortes, S5, side="right") - 1, 0, 9)
    tabla = []
    for d in range(10):
        m = dec == d
        if m.any():
            tabla.append({"decil": d + 1, "n": int(m.sum()), "predicho": round(float(S5[m].mean()), 3),
                          "predicho_nivel_corregido": round(float(S5n[m].mean()), 3), "observado": round(float(y[m].mean()), 3)})
    salida = {
        "que_se_valida": "Probabilidad de seguir en el DENUE a 5 años (alta 2019-11 → edición 2024-11) para negocios de Coacalco de los giros de COATL, con giro estimado sin Coacalco y zona por validación cruzada de 5 grupos.",
        "n": len(coa), "observado": round(float(y.mean()), 3), "predicho_promedio": round(float(S5.mean()), 3),
        "brier": round(brier, 4), "brier_constante": round(brier_const, 4),
        "brier_nivel_corregido": round(brier_nivel, 4), "desplazamiento_nivel_logit": round(a, 3),
        "pendiente_calibracion": round(pendiente, 3), "auc": round(auc(S5, y), 3),
        "deciles": tabla,
        "lectura": None,
    }
    mejora = 1 - brier_nivel / brier_const
    A = auc(S5, y)
    orden = "casi no ordenan el riesgo mejor que el azar" if A < 0.55 else \
            "ordenan el riesgo un poco mejor que el azar" if A < 0.65 else "ordenan el riesgo de forma moderada"
    salida["mejora_sobre_constante"] = round(mejora, 4)
    salida["lectura"] = (f"COATL predice en promedio {S5.mean():.0%} a 5 años y en el DENUE siguió el {y.mean():.0%}. "
                         f"Con el nivel corregido, la Brier mejora {mejora:.1%} sobre un pronóstico constante; AUC {A:.2f} "
                         f"(0.5 = azar). Giro y zona {orden}; no predicen negocio por negocio.")
    destino = RAIZ / "data" / "denue" / "validacion.json"
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in salida.items() if k != "deciles"}, indent=1))
    for t in tabla: print(t)
    assert 0 <= brier <= 1 and 0 <= salida["auc"] <= 1


if __name__ == "__main__":
    main()
