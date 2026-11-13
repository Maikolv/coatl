# AGENTS.md — COATL

Las reglas del proyecto viven en **CLAUDE.md** y aplican a cualquier agente (Codex, Claude Code u otros). Lo esencial:

- Español de México. Autores en este orden: Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés.
- Paleta #C8102E / #7A0C1F / #FBF6F3 con greca. Sin neón, sin estética SaaS, sin WebGL/Three.js.
- Nunca inventes datos: lo que no tenga fuente se rotula «estimación del equipo».
- Edita `src/` y regenera con `npm run build`; no edites `index.html` a mano.
- Antes de terminar: `npm test`, `python scripts/validar_modelo.py`, `npm run test:e2e`.
- Secretos (DENUE_TOKEN, ANTHROPIC_API_KEY) solo en variables de entorno o secretos de GitHub; nunca en archivos.

Asistente de IA del repositorio: `npm run asistente` (requiere `ANTHROPIC_API_KEY` o `ant auth login`).
