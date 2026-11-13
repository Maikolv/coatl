"""Referencia censal por giro: INEGI, Censos Económicos 2019 (datos abiertos, año de referencia 2018).

Para cada giro COATL suma sus clases SCIAN (mismo mapeo verificado que el DENUE, data/denue/meta.json)
y calcula, por unidad económica, ingreso anual, costo directo (mercancías + insumos + materias primas)
como % de los ingresos, personal ocupado, renta mensual y remuneración mensual media.

Nivel preferido: Coacalco, estrato de 0 a 10 personas (micronegocio, lo que simula COATL). Si una
clase no aparece ahí, cae a Coacalco total, luego Estado de México 0-10 y luego Estado de México total.
Genera data/censo/giros.json. Uso: uv run --no-project python scripts/censo_sync.py
"""
import csv, io, json, sys, urllib.request, zipfile
from datetime import date
from pathlib import Path

URL = "https://www.inegi.org.mx/contenidos/programas/ce/2019/Datosabiertos/ce2019_mex_csv.zip"
RAIZ = Path(__file__).resolve().parent.parent
NIVELES = [("020", "1", "Coacalco · 0 a 10 personas"), ("020", "", "Coacalco · todos los tamaños"),
           ("", "1", "Estado de México · 0 a 10 personas"), ("", "", "Estado de México · todos los tamaños")]
VARS = ["UE", "M000A", "K010A", "K020A", "K030A", "H001A", "H010A", "K050A", "J000A"]


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None  # celda vacía o confidencial


def main():
    meta = json.loads((RAIZ / "data/denue/meta.json").read_text(encoding="utf-8"))
    giros = meta["giros_scian"]
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (COATL, proyecto académico)"})
    with urllib.request.urlopen(req, timeout=180) as r:
        datos = r.read()
    z = zipfile.ZipFile(io.BytesIO(datos))
    nombre = next(n for n in z.namelist() if n.endswith("conjunto_de_datos/ce2019_mex.csv"))
    filas = {}
    with z.open(nombre) as f:
        for row in csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")):
            clave = (row["MUNICIPIO"].strip(), row["CODIGO"].strip(), row["ID_ESTRATO"].strip())
            filas[clave] = {v: num(row.get(v)) for v in VARS}
    if not filas:
        sys.exit("El archivo del INEGI no trae filas")

    salida = {}
    for giro, clases in giros.items():
        if not clases:
            continue  # giro sin clase SCIAN equivalente
        for mun, estrato, etiqueta in NIVELES:
            regs = [filas.get((mun, c, estrato)) for c in clases]
            regs = [r for r in regs if r and r["UE"] and r["M000A"]]
            if len(regs) != len(clases):
                continue  # algún dato faltante o confidencial: probar el siguiente nivel
            s = {v: sum((r[v] or 0) for r in regs) for v in VARS}
            ue, ing = s["UE"], s["M000A"] * 1e6
            salida[giro] = {
                "nivel": etiqueta, "clases": clases, "ue": int(ue),
                "ingreso_anual_ue": round(ing / ue),
                "costo_directo_pct": round(100 * (s["K010A"] + s["K020A"] + s["K030A"]) * 1e6 / ing, 1),
                "personal_ue": round(s["H001A"] / ue, 2),
                "renta_mes_ue": round(s["K050A"] * 1e6 / ue / 12),
                "remuneracion_mes": round(s["J000A"] * 1e6 / s["H010A"] / 12) if s["H010A"] else None,
            }
            break
    faltan = sorted(set(giros) - set(salida))
    destino = RAIZ / "data/censo"
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "giros.json").write_text(json.dumps({
        "fuente": "INEGI, Censos Económicos 2019, datos abiertos del Estado de México (año de referencia 2018). Pesos corrientes de 2018.",
        "url": URL, "descargado": date.today().isoformat(),
        "nota": "Promedios por unidad económica; el costo directo es mercancías para reventa + insumos de servicios + materias primas.",
        "giros": salida, "sin_dato": faltan}, ensure_ascii=False, indent=1), encoding="utf-8")
    assert all(0 <= g["costo_directo_pct"] <= 100 for g in salida.values()), "costo directo fuera de rango"
    print(len(salida), "giros con referencia censal;", "sin dato:", faltan)


if __name__ == "__main__":
    main()
