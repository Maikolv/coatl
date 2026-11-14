# Prompt para Codex: fase 1 de la ruta de precisión (panel del DENUE)

Uso, en una rama nueva:

```bash
git switch -c codex/panel-denue
```

```bash
codex exec -s workspace-write "$(sed -n '/^---$/,$p' docs/PROMPT_CODEX_PRECISION.md | tail -n +2)"
```

En PowerShell:

```bash
$prompt = ((Get-Content docs\PROMPT_CODEX_PRECISION.md -Raw -Encoding utf8) -split '(?m)^---\s*$', 2)[1]
```

```bash
codex exec -s workspace-write $prompt
```

Necesita acceso a internet para descargar del INEGI. Si tu sandbox no lo permite, deja el script listo y dilo en el resumen.

---

Trabajas en COATL (lee `CLAUDE.md` y `docs/METODOS_PRECISION.md`). Tu tarea es la **fase 1 y el inicio de la fase 2** de la ruta de precisión. **No cambies todavía el modelo del sitio** (`src/modelo/`) ni el escenario de referencia: esta fase solo **produce datos y estimaciones** para revisarlas.

1. **`scripts/denue_panel.py`**
   - Descarga las ediciones históricas disponibles del DENUE del INEGI para el Estado de México: todas las que el INEGI publique en su sitio de descargas. No inventes URL; si no encuentras una edición, dilo.
   - Enlaza los establecimientos entre ediciones por su identificador (`id`/`clee`).
   - Genera `data/panel/coacalco.csv` con: clase SCIAN, giro COATL (usa el mapeo verificado de `data/denue/meta.json`), estrato de personal, AGEB, edición de entrada, edición de salida (o censurado).
   - **Nunca publiques nombres, direcciones ni contactos**: solo identificadores anonimizados (hash) y atributos agregables.
2. **`scripts/supervivencia_local.py`** (Python con `lifelines` o `statsmodels`)
   - Kaplan–Meier por giro COATL en Coacalco y en el conjunto de municipios vecinos (Tultitlán, Ecatepec, Tlalnepantla, Tultepec), con intervalos de confianza.
   - Modelo de riesgo en tiempo discreto (Shumway, 2001): regresión logística por establecimiento-periodo con giro, estrato, densidad de competencia por AGEB y municipio.
   - Salida: `data/panel/estimaciones.json` con los coeficientes, sus errores estándar y el tamaño de muestra.
   - Separa los cierres reales de los cambios de domicilio o de giro cuando el panel lo permita. Si no lo permite, explica la limitación.
3. **`docs/PANEL_DENUE.md`**
   - Fuentes exactas y su fecha.
   - Cuántos establecimientos hay y cuántos eventos de cierre.
   - Comparación de la S(3) local con la nacional del INEGI (51.6 % de referencia del sitio frente a la estimada).
   - Tabla de β estimados frente a los β actuales del equipo (`src/datos/datos.js`).
   - Limitaciones.

## Reglas

- Español de México.
- No borres nada.
- Ningún dato inventado: si algo no se puede estimar, dilo.
- Corre `npm test` y `uv run --no-project python scripts/validar_modelo.py` al final; deben seguir en verde porque el modelo del sitio no cambia.
- Un commit por paso, terminando con `Co-Authored-By: Codex`. Sin push.
