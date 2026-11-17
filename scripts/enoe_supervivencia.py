"""COATL · β de formalidad estimado con el panel de la ENOE (INEGI).

La ENOE entrevista a cada hogar cinco trimestres seguidos: quien está en su
1.ª visita en el trimestre t está en la 5.ª en t+4 (un año después). Para cada
dueño de un negocio joven (empleador o cuenta propia, negocio con ≤ 3 años) en
la visita 1, «sobrevive» si en la visita 5 sigue siendo dueño de un negocio en la
misma rama de actividad. Formalidad = tue_ppal (2 = fuera del sector
informal: el negocio lleva registros contables o está constituido; definición
oficial del INEGI).

Uso:
  uv run --no-project --with numpy --with pandas --with statsmodels python scripts/enoe_supervivencia.py
Lee .cache/enoe/enoe_AAAA_trimN_csv.zip (microdatos públicos del INEGI, ver
docs/VERIFICACION_DATOS.md) y escribe data/enoe/supervivencia.json. Solo
agregados y coeficientes: los microdatos no se suben al repositorio.
"""
import io, json, math, zipfile
from pathlib import Path
import numpy as np, pandas as pd, statsmodels.api as sm

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / ".cache" / "enoe"
SALIDA = RAIZ / "data" / "enoe" / "supervivencia.json"
PAREJAS = [("2023", 1, "2024", 1), ("2024", 1, "2025", 1)]  # p3r_anio solo viene en el cuestionario ampliado (1.er trimestre)
LLAVE = ["cd_a", "ent", "con", "v_sel", "n_hog", "h_mud", "n_ren"]
S0_3 = 1 / (1 + math.exp(0.2980))   # S₀(3) del INEGI: β₀ = logit(S₀(3)) = −0.2980
EQUIPO = {"formal": 0.10, "gradual": 0.02, "informal": -0.06}  # supuesto anterior
SD_PREVIA = 0.15   # incertidumbre que le damos al supuesto del equipo (escala logit a 3 años)


def tabla(anio, q, nombre, cols):
    with zipfile.ZipFile(CACHE / f"enoe_{anio}_trim{q}_csv.zip") as z:
        arch = next(n for n in z.namelist() if n.upper().startswith(f"ENOE_{nombre}T"))
        with z.open(arch) as f:
            d = pd.read_csv(io.TextIOWrapper(f, encoding="latin-1"), low_memory=False,
                            usecols=lambda c: c.lower() in cols)
    d.columns = [c.lower() for c in d.columns]
    # Algunas ediciones guardan números como texto con espacios: todo a número.
    return d.apply(lambda s: pd.to_numeric(s.astype(str).str.strip(), errors="coerce"))


def personas(anio, q, visita):
    s = tabla(anio, q, "SDEM", set(LLAVE + ["n_ent", "r_def", "c_res", "pos_ocu", "tue_ppal", "sex", "eda", "rama", "upm"]))
    c = tabla(anio, q, "COE1", set(LLAVE + ["p3r_anio"]))
    s = s[(pd.to_numeric(s.r_def, errors="coerce") == 0) & (s.c_res != 2) & (s.n_ent == visita)]
    d = s.merge(c, on=LLAVE, how="left")
    d["p3r_anio"] = pd.to_numeric(d.p3r_anio, errors="coerce")
    d["dueno"] = d.pos_ocu.isin([2, 3])
    return d


def pareja(a0, q0, a1, q1):
    t0 = personas(a0, q0, 1)
    t0 = t0[t0.dueno & t0.p3r_anio.between(1900, int(a0))].copy()
    t0["antig"] = int(a0) - t0.p3r_anio
    t0 = t0[t0.antig <= 3]
    t1 = personas(a1, q1, 5)[LLAVE + ["dueno", "rama", "sex", "eda"]]
    m = t0.merge(t1, on=LLAVE, how="left", suffixes=("", "_1"), indicator=True)
    hallado = (m._merge == "both") & (m.sex == m.sex_1) & (m.eda_1 - m.eda).between(0, 2)
    m = m[hallado].copy()
    # El año de inicio declarado cambia mucho entre visitas (error de memoria), así que
    # «mismo negocio» = sigue siendo dueño en la misma rama de actividad.
    m["sobrevive"] = (m.dueno_1.fillna(False) & (m.rama_1 == m.rama)).astype(int)
    return m, len(t0)


def main():
    partes, base = [], 0
    for p in PAREJAS:
        m, n0 = pareja(*p)
        m["pareja"] = f"{p[0]}T{p[1]}"
        partes.append(m)
        base += n0
    d = pd.concat(partes, ignore_index=True)
    d["formal"] = (d.tue_ppal == 2).astype(int)
    d["empleador"] = (d.pos_ocu == 2).astype(int)
    d["mujer"] = (d.sex == 2).astype(int)
    X = pd.get_dummies(d[["formal", "empleador", "mujer"]].assign(
        antig=d.antig.astype(int).astype(str), rama=d.rama.astype(str), pareja=d.pareja,
        edad=pd.cut(d.eda, [0, 29, 44, 59, 120]).astype(str)), drop_first=True, dtype=float)
    X = sm.add_constant(X)
    r = sm.GLM(d.sobrevive, X, family=sm.families.Binomial()).fit(
        cov_type="cluster", cov_kwds={"groups": pd.factorize(d.upm)[0]})
    b, ee = float(r.params["formal"]), float(r.bse["formal"])

    # De 1 año a 3 años con riesgos proporcionales: S₃(x) = S₀(3)^HR.
    p = r.predict(X)
    s_inf = float(np.mean(1 / (1 + np.exp(-(np.log(p / (1 - p)) - b * d.formal)))))
    s_for = float(np.mean(1 / (1 + np.exp(-(np.log(p / (1 - p)) - b * d.formal + b)))))
    hr = math.log(s_for) / math.log(s_inf)          # riesgo relativo formal / informal
    logit = lambda x: math.log(x / (1 - x))
    delta = logit(S0_3 ** hr) - logit(S0_3)          # diferencia formal − informal a 3 años
    ee_delta = abs(delta) * ee / abs(b) if b else ee # método delta (proporcional)

    # Contracción hacia el supuesto del equipo (normal–normal).
    previa = EQUIPO["formal"] - EQUIPO["informal"]
    w = (1 / ee_delta**2) / (1 / ee_delta**2 + 1 / SD_PREVIA**2)
    final = w * delta + (1 - w) * previa
    # El nivel de «formal desde el inicio» (valor por defecto) se conserva: la
    # ENOE identifica la diferencia, no el nivel, que lo fija β₀.
    z = {"formal": EQUIPO["formal"], "gradual": round(EQUIPO["formal"] - final / 2, 2),
         "informal": round(EQUIPO["formal"] - final, 2)}

    salida = {
        "fuente": "INEGI, ENOE (microdatos trimestrales, panel de 5 visitas)",
        "parejas": [f"{a}T{q} → {c}T{s}" for a, q, c, s in PAREJAS],
        "muestra": {"duenos_jovenes_visita1": int(base), "seguidos_visita5": int(len(d)),
                    "seguimiento": round(len(d) / base, 3), "formales": int(d.formal.sum())},
        "supervivencia_1a": {"informal": round(float(d.sobrevive[d.formal == 0].mean()), 3),
                             "formal": round(float(d.sobrevive[d.formal == 1].mean()), 3)},
        "logit_1a": {"beta_formal": round(b, 4), "ee": round(ee, 4)},
        "riesgo_relativo": round(hr, 3),
        "diferencia_3a": {"estimada": round(delta, 3), "ee": round(ee_delta, 3),
                          "supuesto_equipo": previa, "peso_datos": round(w, 3), "final": round(final, 3)},
        "z": z, "zEq": EQUIPO,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(salida, indent=2))
    assert 0 < s_inf < 1 and 0 < s_for < 1 and z["informal"] <= z["formal"] + 0.5


if __name__ == "__main__":
    main()
