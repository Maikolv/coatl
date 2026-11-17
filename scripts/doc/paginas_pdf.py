# Devuelve en qué página del PDF empieza cada apartado (para llenar el índice).
# Uso: uv run --no-project --with pymupdf python scripts/doc/paginas_pdf.py documento.pdf apartados.json
# Imprime una sola línea JSON {id: página}. Se toma la ÚLTIMA página donde el título aparece como línea propia,
# porque la primera aparición es la del propio índice.
import json
import sys

import pymupdf

doc = pymupdf.open(sys.argv[1])
apartados = json.load(open(sys.argv[2], encoding="utf-8"))
norm = lambda s: " ".join(s.split())
lineas = [[norm(l) for l in pag.get_text().split("\n")] for pag in doc]
texto = [norm(pag.get_text()) for pag in doc]
res = {}
for a in apartados:
    t = norm(a["texto"])
    for i in range(doc.page_count - 1, -1, -1):
        if t in lineas[i] or (len(t) > 60 and t in texto[i]) or any(l.endswith(t) and len(l) - len(t) < 14 for l in lineas[i]):
            res[a["id"]] = i + 1
            break
print(json.dumps(res))
