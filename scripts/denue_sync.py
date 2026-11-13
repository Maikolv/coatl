"""Sincroniza el DENUE (INEGI) completo y genera agregados para COATL.

Fuente: descarga masiva oficial del DENUE, un ZIP con CSV por entidad (algunas
entidades vienen en varias partes). No requiere token. Si existe la variable
DENUE_TOKEN, además se valida un conteo contra la API oficial del DENUE.

Salida (data/denue/, servida junto al sitio):
  meta.json            edición, fecha de sincronización, archivos y totales
  nacional.json        entidades y municipios con totales, sectores SCIAN y estratos
  giros.json           conteo por municipio de cada uno de los 35 giros de COATL
  ent/<EE>.json        por municipio: conteo por clase SCIAN (6 dígitos), estrato
                       de personal ocupado y altas por año
  clases.json          catálogo de clases SCIAN presentes (código → nombre)

Solo se publican CONTEOS agregados; no se publican nombres, direcciones ni
contactos de los establecimientos.

Uso:  uv run --no-project python scripts/denue_sync.py [--entidades 15,09] [--cache .cache/denue]
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request
import zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://www.inegi.org.mx/contenidos/masiva/denue/"
UA = {"User-Agent": "COATL-denue-sync/1.0 (proyecto academico)"}
SECTORES = {
    "11": "Agricultura, cría, pesca y forestal", "21": "Minería", "22": "Energía eléctrica, agua y gas",
    "23": "Construcción", "31": "Industrias manufactureras", "32": "Industrias manufactureras",
    "33": "Industrias manufactureras", "43": "Comercio al por mayor", "46": "Comercio al por menor",
    "48": "Transportes, correos y almacenamiento", "49": "Transportes, correos y almacenamiento",
    "51": "Información en medios masivos", "52": "Servicios financieros y de seguros",
    "53": "Servicios inmobiliarios y de alquiler", "54": "Servicios profesionales, científicos y técnicos",
    "55": "Corporativos", "56": "Apoyo a los negocios y manejo de residuos",
    "61": "Servicios educativos", "62": "Servicios de salud y de asistencia social",
    "71": "Esparcimiento, cultural y deportivo", "72": "Alojamiento y preparación de alimentos",
    "81": "Otros servicios (excepto gobierno)", "93": "Actividades legislativas y gubernamentales",
}

# Giros de COATL → clases SCIAN 2018 del DENUE. Se definen por código (6 dígitos) o
# prefijo; las coincidencias se reportan en docs/DENUE.md para su verificación.
GIROS_SCIAN = {
    # Clases verificadas contra el catálogo del propio DENUE (nombre_act). Donde el SCIAN no
    # distingue dos giros, la clase se comparte (ver COMPARTIDAS); "spa" no tiene clase propia.
    "abarrotes": ["461110"], "tortilleria": ["311830"], "carniceria": ["461121", "461122", "461123"],
    "fruteria": ["461130"], "fonda": ["722511"], "taqueria": ["722513", "722514"],
    "restaurante": ["722511", "722512"], "pizzeria": ["722517"], "cafeteria": ["722515"],
    "jugueria": ["722515"], "panaderia": ["311812"], "pasteleria": ["311812"],
    "papeleria": ["465311"], "ciber": ["561431", "561432"], "farmacia": ["464111", "464112"],
    "naturista": ["464113"], "vinateria": ["461211", "461212"], "ropa": ["463211", "463212", "463213", "463310"],
    "joyeria": ["465112", "463215"], "celulares": ["466212"], "tecnologia": ["466211", "811211"],
    "ferreteria": ["467111"], "refaccionaria": ["468211", "468213"], "taller": ["811111", "811112", "811113", "811114", "811115", "811116", "811119"],
    "autolavado": ["811192"], "estetica": ["812110"], "spa": [], "lavanderia": ["812210"],
    "gimnasio": ["713943"], "veterinaria": ["541941"], "dental": ["621211", "621212"], "optica": ["464121", "621320"],
    "consultorio": ["621111", "621112", "541110", "541211"], "educacion": ["611631", "611632", "611691"],
    "floreria": ["466312"],
}
COMPARTIDAS = {"722511": ["fonda", "restaurante"], "722515": ["cafeteria", "jugueria"], "311812": ["panaderia", "pasteleria"]}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def bajar(url: str, destino: Path) -> bool:
    """Descarga si no está en caché. Devuelve False si INEGI responde con HTML (no existe)."""
    if destino.exists() and zipfile.is_zipfile(destino):
        return True
    destino.unlink(missing_ok=True)   # caché dañada o incompleta: se vuelve a bajar
    req = urllib.request.Request(url, headers=UA)
    for intento in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                cabeza = r.read(4)
                if cabeza != b"PK\x03\x04":
                    return False
                tmp = destino.with_suffix(".part")
                with open(tmp, "wb") as f:
                    f.write(cabeza)
                    while True:
                        b = r.read(1 << 20)
                        if not b:
                            break
                        f.write(b)
                if not zipfile.is_zipfile(tmp):
                    raise IOError("ZIP incompleto")
                tmp.replace(destino)
                return True
        except Exception as err:  # red inestable: reintenta
            print(f"  reintento {intento + 1} {url}: {err}", file=sys.stderr)
            time.sleep(5 * (intento + 1))
    raise RuntimeError(f"No se pudo descargar {url}")


def archivos_entidad(ee: str, cache: Path) -> list[Path]:
    """El DENUE publica cada entidad en un ZIP o en varias partes (_1, _2, …)."""
    unico = cache / f"denue_{ee}_csv.zip"
    if bajar(BASE + unico.name, unico):
        return [unico]
    partes = []
    for n in range(1, 10):
        p = cache / f"denue_{ee}_{n}_csv.zip"
        if not bajar(BASE + p.name, p):
            break
        partes.append(p)
    return partes


def filas(zp: Path):
    with zipfile.ZipFile(zp) as z:
        nombres = [n for n in z.namelist() if n.lower().endswith(".csv") and "diccionario" not in n.lower()]
        for n in nombres:
            crudo = z.read(n)
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
            for r in lector:
                if len(r) == len(cab):
                    yield dict(zip(cab, r))


def validar_api(meta: dict, total_descarga) -> None:
    """Validación cruzada con la API oficial del DENUE (requiere DENUE_TOKEN).
    Suma los conteos de los sectores SCIAN (claves de 2 dígitos) para Coacalco (15020)
    y los compara con el total de la descarga masiva. El token nunca se guarda."""
    token = os.environ.get("DENUE_TOKEN")
    if not token:
        return
    try:
        url = f"https://www.inegi.org.mx/app/api/denue/v1/consulta/Cuantificar/0/15020/0/{token}"
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
            datos = json.loads(r.read().decode("utf-8"))
        total_api = sum(int(x["Total"]) for x in datos if len(str(x.get("AE", ""))) == 2)
        meta["validacion_api"] = {
            "consulta": "API DENUE · Cuantificar · Coacalco de Berriozábal (15020) · todas las actividades",
            "fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "total_api": total_api, "total_descarga": total_descarga,
            "coincide": total_api == total_descarga,
        }
    except Exception as err:
        meta["validacion_api"] = {"error": type(err).__name__}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--entidades", default=",".join(f"{i:02d}" for i in range(1, 33)))
    ap.add_argument("--cache", default=".cache/denue")
    ap.add_argument("--salida", default="data/denue")
    ap.add_argument("--solo-validar", action="store_true", help="solo actualiza la validación contra la API en meta.json")
    a = ap.parse_args()
    if a.solo_validar:
        p = Path(a.salida) / "meta.json"
        meta = json.loads(p.read_text(encoding="utf-8"))
        nac = json.loads((Path(a.salida) / "nacional.json").read_text(encoding="utf-8"))
        validar_api(meta, nac["municipios"].get("15020", {}).get("total"))
        p.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
        print(json.dumps(meta.get("validacion_api"), ensure_ascii=False))
        return 0
    cache, salida = Path(a.cache), Path(a.salida)
    cache.mkdir(parents=True, exist_ok=True)
    (salida / "ent").mkdir(parents=True, exist_ok=True)
    clase_a_giros = defaultdict(list)
    for g, cs in GIROS_SCIAN.items():
        for c in cs:
            clase_a_giros[c].append(g)

    entidades, municipios, catalogo, archivos = {}, {}, {}, []
    giros_mun: dict[str, Counter] = defaultdict(Counter)
    total = 0
    for ee in a.entidades.split(","):
        zips = archivos_entidad(ee, cache)
        if not zips:
            print(f"Entidad {ee}: sin archivos", file=sys.stderr)
            continue
        archivos += [{"archivo": z.name, "bytes": z.stat().st_size} for z in zips]
        por_mun = defaultdict(lambda: {"clases": Counter(), "estratos": Counter(), "altas": Counter()})
        nom_ent, nom_mun = "", {}
        for f in (r for z in zips for r in filas(z)):
            cm = f.get("cve_mun", "").zfill(3)
            cod = f.get("codigo_act", "").strip()
            if not cod:
                continue
            nom_ent = nom_ent or f.get("entidad", "").strip()
            nom_mun.setdefault(cm, f.get("municipio", "").strip())
            catalogo.setdefault(cod, f.get("nombre_act", "").strip())
            m = por_mun[cm]
            m["clases"][cod] += 1
            m["estratos"][f.get("per_ocu", "").strip() or "ND"] += 1
            anio = (f.get("fecha_alta", "") or "")[:4]
            m["altas"][anio if anio.isdigit() else "ND"] += 1
            for g in clase_a_giros.get(cod, ()):
                giros_mun[ee + cm][g] += 1
        ent_json, tot_ent, sect_ent = {}, 0, Counter()
        for cm, m in sorted(por_mun.items()):
            t = sum(m["clases"].values())
            sect = Counter()
            for c, n in m["clases"].items():
                sect[c[:2]] += n
            tot_ent += t
            sect_ent.update(sect)
            municipios[ee + cm] = {"ent": ee, "mun": cm, "nombre": nom_mun.get(cm, ""), "total": t, "sectores": dict(sect)}
            ent_json[cm] = {"nombre": nom_mun.get(cm, ""), "total": t, "clases": dict(m["clases"]),
                            "estratos": dict(m["estratos"]), "altas": dict(sorted(m["altas"].items()))}
        entidades[ee] = {"nombre": nom_ent, "total": tot_ent, "sectores": dict(sect_ent), "municipios": len(por_mun)}
        total += tot_ent
        (salida / "ent" / f"{ee}.json").write_text(json.dumps(ent_json, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"Entidad {ee} ({nom_ent}): {tot_ent:,} establecimientos en {len(por_mun)} municipios")

    meta = {
        "fuente": "INEGI, Directorio Estadístico Nacional de Unidades Económicas (DENUE), descarga masiva",
        "url": "https://www.inegi.org.mx/app/descarga/?ti=6",
        "sincronizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "total_establecimientos": total, "entidades": len(entidades), "municipios": len(municipios),
        "archivos": archivos, "sectores_scian": SECTORES, "giros_scian": GIROS_SCIAN, "clases_compartidas": COMPARTIDAS,
    }
    validar_api(meta, municipios.get("15020", {}).get("total"))
    (salida / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    (salida / "nacional.json").write_text(json.dumps({"entidades": entidades, "municipios": municipios}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (salida / "giros.json").write_text(json.dumps({k: dict(v) for k, v in giros_mun.items()}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (salida / "clases.json").write_text(json.dumps(dict(sorted(catalogo.items())), ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Total nacional: {total:,} establecimientos · {len(municipios):,} municipios")
    return 0


if __name__ == "__main__":
    sys.exit(main())
