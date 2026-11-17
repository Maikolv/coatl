# Prompt para Codex — continuar el trabajo pendiente de COATL

Úsalo si la sesión con Claude se queda sin tokens. Copia el bloque en Codex desde la raíz del repositorio.

```text
Trabajas en COATL (Cálculo de Oportunidad y Análisis Territorial Local): sitio estático en español de
México que estima la probabilidad de supervivencia a 3 años y la rentabilidad de abrir un negocio en
Coacalco de Berriozábal, Estado de México. Publicado en GitHub Pages (repo Maikolv/coatl, rama main).
Lee primero, en este orden: CLAUDE.md, README.md, docs/METODOLOGIA.md, docs/VERIFICACION_DATOS.md,
docs/AUDITORIA.md y data/versiones.json. CLAUDE.md manda sobre todo lo demás.

ESTADO ACTUAL (v13, commit 25ecaf9)
- β de giro y zona estimados con el DENUE (cohorte alta 2019-11 seguida a 2024_11, GLM binomial +
  contracción bayesiana empírica). Script: scripts/denue_supervivencia.py → data/denue/supervivencia.json
  → node scripts/aplicar_betas.mjs escribe z, ee, zEq, fz en src/datos/datos.js.
- Escenario de referencia «Cafetería · Los Héroes»: P 38.0 % (rango plausible 30.3–46.3 %),
  utilidad ≈ $60,371, ROI 302.9 %, payback 4 meses (4.1), VPN $686,989. Lo vigilan
  tests/modelo.test.mjs, scripts/validar_modelo.py y las e2e. Si el modelo cambia, actualiza los cuatro
  lugares y documenta por qué en CLAUDE.md, README, METODOLOGIA y data/versiones.json (versión nueva).

TAREAS PENDIENTES (en orden)
1. Estimar con datos públicos los β que hoy son supuestos del equipo: experiencia, reserva (colchón de
   efectivo), formalidad, marketing y deuda. El DENUE no registra esas variables.
   Ruta propuesta:
   a) ENAMIN 2022 (Encuesta Nacional de Micronegocios, INEGI, microdatos públicos). Variables
      disponibles: años de experiencia del dueño, registro ante el SAT/IMSS, publicidad, crédito o
      préstamo y su fuente, registros contables, ahorro/capital inicial. Descarga desde inegi.org.mx
      (sección de microdatos de la ENAMIN). No inventes URLs: navega la página oficial y anota la
      dirección exacta en docs/VERIFICACION_DATOS.md.
   b) Resultado de supervivencia: la ENAMIN es transversal. Usa como resultado la antigüedad del negocio
      (¿lleva ≥ 3 años operando?) con un modelo de supervivencia simple, o enlaza con el panel de la
      ENOE si consigues el identificador. Explica el sesgo de supervivencia (solo se observan negocios
      vivos) y cómo lo mitigas (p. ej. comparar cohortes de 1–2 años contra 3–5 años; o un modelo de
      riesgo con truncamiento a la izquierda).
   c) Si una variable no se puede estimar (probablemente «reserva»), deja el supuesto del equipo y
      usa como contraste un prior de la literatura citada con enlace verificado. Márcalo fz:"equipo".
   d) Intégralos igual que los β del DENUE: campos ee, zEq (supuesto anterior) y fz ("enamin" o
      "equipo") en src/datos/datos.js; contracción bayesiana empírica; solo diferencias (el nivel lo
      fija β₀). Script nuevo en scripts/ (Python con uv: `uv run --no-project --with numpy --with
      statsmodels --with pandas python scripts/<nuevo>.py`), salida en data/enamin/.
   e) Recalcula la referencia; si cambia, nueva versión v14 en data/versiones.json.
2. Guion del video: actualiza el texto de las escenas en scripts/video_presentacion.mjs (cifras v13/v14
   y la escena de limitaciones: qué se estimó con DENUE, qué con ENAMIN, qué sigue supuesto). Regenera
   docs/GUION_VOCES.md con `node scripts/video_presentacion.mjs --guion`. NO renderices el video: el
   equipo va a grabar sus voces (entregables/voces/NN-escena.*).
3. Prompt para help-quote-terminal: docs/PROMPT_HELP_QUOTE_TERMINAL.md (si no existe) con los buenos
   puntos de COATL aplicables a ese proyecto. Solo el prompt; no toques ese repositorio.
4. data/versiones.json: el commit de v13 es "25ecaf9".

CÓMO VERIFICAR (todo en verde antes de dar algo por terminado)
  npm run build
  npm test
  uv run --no-project python scripts/validar_modelo.py
  npm run test:e2e            (en Windows usa Edge; espera data-calculo="listo", no tiempos fijos)
  npm run entregables         (documentos PDF/PPTX/XLSX; sin --video)
Edita siempre src/ y luego build: el CI falla si index.html no coincide.

REGLAS FIJAS
- Autores en este orden: Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés.
- Identidad: #C8102E, #7A0C1F, #FBF6F3 y greca. Nada de neón/negro/SaaS, WebGL, Three.js, Next.js.
- Nunca afirmes «99 % de exactitud». El rango plausible es sensibilidad, no intervalo de confianza.
- Seguridad: no escribas, imprimas ni subas claves o tokens. DENUE_TOKEN solo en el secreto de GitHub;
  GEMINI_API_KEY solo en Vercel (la pone el usuario). No hagas nada que genere cobros o facturación.
- Archivos de «Para empresas»: solo en memoria del navegador; nada de envío, analítica o localStorage.
- DENUE: solo conteos agregados, nunca datos de contacto. Lo mismo para ENAMIN: solo agregados y
  coeficientes; no subas microdatos al repositorio (.cache/ está ignorado).
- Fotos sin repetir; sin fotos en DENUE, Simulador, Empresas, Estrategia ni Aviso legal.
- Accesibilidad WCAG 2.1 AA en 0 violaciones; el teléfono debe verse tan bien como la computadora.
- Idioma: español de México en UI, comentarios, commits y documentación.
- Commits: no hagas push sin que el usuario lo pida. Mensaje en español terminado en
  "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".

ENTREGA
Un resumen de qué estimaste, con qué datos, cuánto cambió la referencia y qué quedó como supuesto, más
la lista de archivos tocados y el resultado de cada verificación.
```

Para ejecutarlo:

```bash
codex exec --sandbox workspace-write "$(sed -n '/^```text$/,/^```$/p' docs/PROMPT_CODEX_CONTINUAR.md | sed '1d;$d')"
```
