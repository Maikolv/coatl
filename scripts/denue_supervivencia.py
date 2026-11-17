"""Estima con datos reales los coeficientes β de GIRO y ZONA comparando ediciones sucesivas del DENUE (INEGI).

Idea. El DENUE casi no cambia entre censos: el INEGI lo depura cuando levanta los Censos Económicos (ediciones
de noviembre de 2019 y de 2024). Los negocios que siguen conservan su identificador; los que cerraron desaparecen.
Cohorte: negocios que el INEGI INCORPORÓ en la actualización de 2019 (fecha de alta 2019-11, negocios jóvenes).
Resultado: si siguen en la edición de noviembre de 2024 (siguiente depuración censal, cinco años después).
Con todos los negocios de esa cohorte en el Estado de México se ajusta una regresión logística

    logit P(sigue en 2024) = α + β_giro + β_tamaño                          (todo el Estado de México)
    logit P(sigue en 2024) = α + β_zona + desplazamiento(giro, tamaño)      (solo Coacalco)

con errores estándar, y cada β se contrae hacia cero según su incertidumbre (Bayes empírico):
β* = β · τ² / (τ² + EE²). Así un giro con pocos negocios no recibe un efecto extremo por azar.

Qué NO puede estimar el DENUE: experiencia, reserva, formalidad, marketing, deuda, etc. (formalidad: ver scripts/enoe_supervivencia.py). Esos β siguen siendo
supuestos del equipo. El DENUE tampoco distingue «cerró» de «dejó de registrarse»: la tasa absoluta no se usa
(el intercepto del modelo sigue calibrado con la tabla oficial del INEGI); solo se usan DIFERENCIAS entre giros
y entre zonas.

Salida: data/denue/supervivencia.json (solo conteos y coeficientes; nunca nombres, direcciones ni contactos).
Uso:   uv run --no-project --with numpy --with statsmodels python scripts/denue_supervivencia.py
"""
from __future__ import annotations

import csv
import io
import json
import math
import sys
import time
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import statsmodels.api as sm

sys.path.insert(0, str(Path(__file__).parent))
from denue_sync import COMPARTIDAS, GIROS_SCIAN, UA, norm  # mismo mapeo giro → SCIAN verificado

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / ".cache" / "denue" / "historico"
BASE = "https://www.inegi.org.mx/contenidos/masiva/denue/"
ENT, MUN = "15", "020"   # Estado de México · Coacalco de Berriozábal
ALTA, DESPUES, MARCA_ALTA = "2019_11", "2024_11", "2019-11"   # cohorte: incorporados en la actualización censal de 2019
CONTRASTE = "2018_11"                                         # comprobación: los incorporados en 2019 no estaban en 2018
ESTRATOS = {"0 a 5 personas": "0-5", "6 a 10 personas": "6-10", "11 a 30 personas": "11-30"}   # el resto: 31+


def bajar(url: str, destino: Path) -> bool:
    if destino.exists() and zipfile.is_zipfile(destino):
        return True
    destino.parent.mkdir(parents=True, exist_ok=True)
    for intento in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r:
                cabeza = r.read(4)
                if cabeza != b"PK\x03\x04":
                    return False   # INEGI responde con una página HTML cuando el archivo no existe
                tmp = destino.with_suffix(".part")
                with open(tmp, "wb") as f:
                    f.write(cabeza)
                    while b := r.read(1 << 20):
                        f.write(b)
                if not zipfile.is_zipfile(tmp):
                    raise IOError("ZIP incompleto")
                tmp.replace(destino)
                print(f"  descargado {destino.name} ({destino.stat().st_size / 1e6:.0f} MB)", flush=True)
                return True
        except Exception as err:
            print(f"  reintento {intento + 1} {url}: {err}", file=sys.stderr, flush=True)
            time.sleep(5 * (intento + 1))
    raise RuntimeError(f"No se pudo descargar {url}")


def edicion(clave: str) -> list[Path]:
    """Partes de la edición (p. ej. 2019_11 → denue_15_1_1119_csv.zip, denue_15_2_1119_csv.zip)."""
    a, m = clave.split("_")
    sufijo = m + a[2:]
    partes = []
    for n in range(1, 10):
        p = CACHE / clave / f"denue_{ENT}_{n}_{sufijo}_csv.zip"
        if not bajar(f"{BASE}{clave}/{p.name}", p):
            break
        partes.append(p)
    if not partes:
        unico = CACHE / clave / f"denue_{ENT}_{sufijo}_csv.zip"
        if bajar(f"{BASE}{clave}/{unico.name}", unico):
            partes = [unico]
    if not partes:
        raise RuntimeError(f"No hay archivos para la edición {clave}")
    return partes


def leer(clave: str) -> dict[str, tuple]:
    """id → (clase SCIAN, estrato, municipio, AGEB). Solo se leen columnas sin datos personales."""
    out: dict[str, tuple] = {}
    for zp in edicion(clave):
        with zipfile.ZipFile(zp) as z:
            for n in z.namelist():
                if not n.lower().endswith(".csv") or "diccionario" in n.lower():
                    continue
                crudo = z.read(n)
                texto = None
                for cod in ("utf-8-sig", "latin-1"):
                    try:
                        texto = crudo.decode(cod)
                        break
                    except UnicodeDecodeError:
                        continue
                lector = csv.reader(io.StringIO(texto))
                cab = [norm(c) for c in next(lector)]
                if "codigo_act" not in cab:
                    continue
                i = {k: cab.index(k) for k in ("id", "codigo_act", "per_ocu", "cve_mun", "ageb", "fecha_alta") if k in cab}
                for r in lector:
                    if len(r) != len(cab):
                        continue
                    ide = r[i["id"]].strip()
                    if ide:
                        out[ide] = (r[i["codigo_act"]].strip(), r[i["per_ocu"]].strip(), r[i["cve_mun"]].strip().zfill(3), r[i["ageb"]].strip().upper(), r[i["fecha_alta"]].strip()[:7] if "fecha_alta" in i else "")
    print(f"  {clave}: {len(out):,} establecimientos", flush=True)
    return out


def giro_de(clase: str) -> str | None:
    """Una clase compartida por dos giros (p. ej. cafetería y juguería) se cuenta UNA vez, en el primero;
    el segundo hereda el coeficiente (se marca «comparte clase con»)."""
    if clase in COMPARTIDAS:
        return COMPARTIDAS[clase][0]
    for g, clases in GIROS_SCIAN.items():
        if clase in clases:
            return g
    return None


def ajustar(y, X, nombres):
    m = sm.GLM(y, X, family=sm.families.Binomial()).fit()
    return {n: (float(b), float(e)) for n, b, e in zip(nombres, m.params, m.bse)}, m


def contraer(efectos: dict[str, tuple[float, float]]) -> tuple[dict, float]:
    """Bayes empírico: τ² = varianza entre efectos menos el error medio (método de momentos), mínimo 0.0025."""
    b = np.array([v[0] for v in efectos.values()]); e = np.array([v[1] for v in efectos.values()])
    tau2 = max(0.0025, float(np.var(b) - np.mean(e ** 2)))
    return {k: (bb * tau2 / (tau2 + ee ** 2), bb, ee) for k, (bb, ee) in efectos.items()}, tau2


def main() -> None:
    zonas = {a["ageb"].upper(): a["zona"] for a in json.loads((RAIZ / "data/ageb/coacalco.json").read_text(encoding="utf-8"))["agebs"]}
    filas = []   # (giro, estrato, cohorte, municipio, ageb, sobrevive)
    E, D, A = leer(ALTA), leer(DESPUES), leer(CONTRASTE)
    cohorte = [ide for ide, v in E.items() if v[4] == MARCA_ALTA]
    ya_estaban = sum(1 for ide in cohorte if ide in A)
    sob = sum(1 for ide in cohorte if ide in D)
    todos = sum(1 for ide in E if ide in D) / len(E)
    resumen_cohortes = [{"cohorte": f"alta {MARCA_ALTA} → edición {DESPUES}", "nuevos": len(cohorte), "sobreviven": sob,
                         "tasa_nuevos": round(sob / len(cohorte), 4), "tasa_todos": round(todos, 4),
                         "ya_estaban_en_2018": ya_estaban}]
    print(f"  cohorte: {len(cohorte):,} incorporados en {MARCA_ALTA} ({ya_estaban} ya estaban en {CONTRASTE}); "
          f"{sob / len(cohorte):.1%} siguen en {DESPUES}; todos los negocios {todos:.1%}", flush=True)
    for ide in cohorte:
        clase, estr, mun, ageb, _ = E[ide]
        filas.append((giro_de(clase), ESTRATOS.get(estr, "31+"), ALTA, mun, ageb, 1 if ide in D else 0))
    ediciones = {ALTA: 1, DESPUES: 1, CONTRASTE: 1}

    # ---------- Modelo 1: giro + tamaño + cohorte, todo el Estado de México ----------
    hereda = {sec: prim for clase, gs in COMPARTIDAS.items() for prim, *resto in [gs] for sec in resto}
    hereda = {g: p for g, p in hereda.items() if not any(c not in COMPARTIDAS for c in GIROS_SCIAN[g])}   # solo si no tiene clase propia
    giros = sorted(g for g in GIROS_SCIAN if GIROS_SCIAN[g] and g not in hereda)
    est_niveles = ["6-10", "11-30", "31+"]   # base: 0-5
    coh_niveles = []
    nombres = ["intercepto"] + [f"giro:{g}" for g in giros] + [f"tam:{t}" for t in est_niveles] + [f"coh:{c}" for c in coh_niveles]
    X = np.zeros((len(filas), len(nombres))); y = np.zeros(len(filas))
    for k, (g, t, c, *_rest, s) in enumerate(filas):
        X[k, 0] = 1
        if g in giros: X[k, 1 + giros.index(g)] = 1        # base: negocios de cualquier otra actividad
        if t in est_niveles: X[k, 1 + len(giros) + est_niveles.index(t)] = 1
        if c in coh_niveles: X[k, 1 + len(giros) + len(est_niveles) + coh_niveles.index(c)] = 1
        y[k] = s
    coef, m1 = ajustar(y, X, nombres)
    # Centrar los giros: COATL usa desviaciones respecto del giro promedio (ponderado por número de negocios nuevos).
    n_giro = Counter(f[0] for f in filas if f[0])
    media = sum(coef[f"giro:{g}"][0] * n_giro[g] for g in giros) / sum(n_giro[g] for g in giros)
    efectos_giro = {g: (coef[f"giro:{g}"][0] - media, coef[f"giro:{g}"][1]) for g in giros}
    giro_c, tau_g = contraer(efectos_giro)

    # ---------- Modelo 2: zona dentro de Coacalco, con el resto como desplazamiento ----------
    lineal = X @ np.array([coef[n][0] for n in nombres])
    idx = [k for k, f in enumerate(filas) if f[3] == MUN and f[4] in zonas]
    zonas_n = sorted(set(zonas.values()))
    Z = np.zeros((len(idx), len(zonas_n)))
    for j, k in enumerate(idx):
        Z[j, zonas_n.index(zonas[filas[k][4]])] = 1
    yz = y[idx]
    m2 = sm.GLM(yz, Z, family=sm.families.Binomial(), offset=lineal[idx] - coef["intercepto"][0]).fit()
    n_zona = Counter(zonas[filas[k][4]] for k in idx)
    mz = sum(m2.params[i] * n_zona[z] for i, z in enumerate(zonas_n)) / len(idx)
    efectos_zona = {z: (float(m2.params[i] - mz), float(m2.bse[i])) for i, z in enumerate(zonas_n)}
    zona_c, tau_z = contraer(efectos_zona)
    sob_zona = {z: sum(int(yz[j]) for j, k in enumerate(idx) if zonas[filas[k][4]] == z) for z in zonas_n}

    salida = {
        "fuente": "INEGI, DENUE, descarga masiva por entidad (Estado de México), ediciones " + ", ".join(sorted(ediciones)),
        "url": "https://www.inegi.org.mx/app/descarga/?ti=6",
        "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "metodo": "Cohortes de negocios nuevos (presentes en la edición de alta y ausentes en la anterior) seguidos 5 años (2019 → 2024). "
                  "Regresión logística binomial (statsmodels GLM) con giro, tamaño y cohorte en el Estado de México; zona con los negocios "
                  "de Coacalco y el resto como desplazamiento. Efectos centrados en el promedio y contraídos hacia 0 por Bayes empírico.",
        "limitaciones": "Desaparecer del DENUE no siempre significa cerrar (cambio de domicilio o de giro, actualización del directorio). "
                        "Por eso solo se usan diferencias entre giros y zonas; el nivel absoluto sigue anclado a la tabla oficial del INEGI.",
        "cohortes": resumen_cohortes,
        "n": len(filas), "n_coacalco": len(idx),
        "tamano": {t: [round(coef[f'tam:{t}'][0], 4), round(coef[f'tam:{t}'][1], 4)] for t in est_niveles},
        "tau_giro": round(math.sqrt(tau_g), 4), "tau_zona": round(math.sqrt(tau_z), 4),
        "giros": {g: {"beta": round(giro_c[g][0], 3), "beta_sin_contraer": round(giro_c[g][1], 4), "ee": round(giro_c[g][2], 4),
                      "n": n_giro[g], "sobreviven": sum(1 for f in filas if f[0] == g and f[5])} for g in giros},
        "zonas": {z: {"beta": round(zona_c[z][0], 3), "beta_sin_contraer": round(zona_c[z][1], 4), "ee": round(zona_c[z][2], 4),
                      "n": n_zona[z], "sobreviven": sob_zona[z]} for z in zonas_n},
        "sin_clase_propia": [g for g in GIROS_SCIAN if not GIROS_SCIAN[g]],
        "comparte_clase_con": hereda,
    }
    destino = RAIZ / "data" / "denue" / "supervivencia.json"
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{destino.relative_to(RAIZ)}: {len(filas):,} negocios nuevos ({len(idx):,} en Coacalco)")
    for g, p in hereda.items():
        salida["giros"][g] = {**salida["giros"][p], "comparte_clase_con": p}
    for g in sorted(salida["giros"]):
        v = salida["giros"][g]; print(f"  {g:14s} β={v['beta']:+.3f}  (sin contraer {v['beta_sin_contraer']:+.3f} ± {v['ee']:.3f}, n={v['n']})")
    for z in zonas_n:
        v = salida["zonas"][z]; print(f"  zona {z:10s} β={v['beta']:+.3f}  (sin contraer {v['beta_sin_contraer']:+.3f} ± {v['ee']:.3f}, n={v['n']})")


if __name__ == "__main__":
    main()
