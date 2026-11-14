# Prompt para Codex: aplicar los pendientes de la auditoría v7.3

Uso sugerido, en una rama nueva y con permiso de escritura solo en el repositorio:

```bash
git switch -c codex/pendientes-v7.3
codex exec -s workspace-write "$(sed -n '/^---$/,$p' docs/PROMPT_CODEX_TAREAS.md | tail -n +2)"
```

Revisa el diff antes de hacer merge. Codex no debe hacer push.

---

Trabajas en COATL, una app web estática en español de México (GitHub Pages, sin backend). Antes de tocar nada, lee `CLAUDE.md`, `docs/AUDITORIA.md` §8, `docs/SEGURIDAD.md` y `docs/GEMINI.md`. Todo lo que escribas (código, comentarios, mensajes de commit y documentación) va en español de México.

## Reglas obligatorias

- Edita solo `src/`, `scripts/`, `tests/`, `docs/`, `package.json` y `package-lock.json`. Nunca edites a mano `index.html` ni `dist/`: se regeneran con `npm run build`.
- No cambies el modelo estadístico ni los valores por defecto. El escenario de referencia es Cafetería · Los Héroes y debe seguir dando P = 51.6 % (rango 44.3–58.3), utilidad ≈ $60,371, ROI 302.9 %, payback 4.1 y VPN $912,776.
- No cambies la identidad visual. No agregues Three.js, WebGL ni frameworks. No agregues analítica ni `localStorage`, ni envíes datos de Empresas a ningún lado.
- No borres archivos existentes ni quites funciones, pruebas o documentación. Si algo sobra, propónlo en el resumen en vez de borrarlo.
- No uses claves reales ni tokens. Las pruebas de Gemini y Claude deben usar respuestas simuladas (`page.route`).
- Haz un commit por tarea, sin push, terminando cada mensaje con `Co-Authored-By: Codex`.

## Tareas, en este orden

1. **Vulnerabilidad en `image-size`**
   - Viene por `pptxgenjs` 3.12 (`npm audit`).
   - Elige la opción menos riesgosa: subir a `pptxgenjs` 4.x o usar un `overrides` de npm hacia una versión de `image-size` sin la vulnerabilidad.
   - Comprueba que `node scripts/presentacion_pptx.mjs` sigue generando la presentación. Valídala convirtiéndola a PDF con LibreOffice headless y revisando que tenga el mismo número de láminas.
   - `npm audit` debe quedar en 0 vulnerabilidades.
2. **Dependencias de desarrollo**
   - Actualiza `@playwright/test` a la 1.65.x más reciente, `@axe-core/playwright` a la 4.x más reciente y `docx` a la 9.x más reciente.
   - Si una prueba falla por un cambio de la herramienta, ajusta la prueba; no relajes lo que verifica.
   - `node scripts/reporte_docx.mjs` debe seguir generando el reporte.
3. **Prueba de seguridad de la IA**
   - En `tests/e2e/`, agrega una prueba que cargue un archivo en Empresas (como ya hace `tests/e2e/denue-empresas.spec.js`), configure una clave simulada de Gemini y haga una pregunta al asistente.
   - Debe comprobar que el cuerpo enviado a `generativelanguage.googleapis.com` no contiene ningún dato del archivo de la empresa.
4. **Documentación**
   - En `docs/AUDITORIA.md` §8, cambia ⏳ por ✅ en los puntos 7 y 8, con una línea que diga qué se hizo.
   - Agrega a `docs/REVISION_CODEX.md` una sección «Fase 4» que resuma estos cambios.

## Verificación antes de terminar (todo en verde)

```bash
npm run build
npm test
uv run --no-project python scripts/validar_modelo.py
npm run test:e2e
npm audit
git status --short
```

Las pruebas de navegador usan Edge en Windows. Si no hay Edge, usa el Chromium de Playwright y dilo en el resumen. `git status --short` no debe mostrar `index.html` distinto al build.

## Entrega

Un resumen con:
- los commits hechos;
- qué opción elegiste para `image-size` y por qué;
- el resultado de cada comando de verificación;
- cualquier cosa que no pudiste hacer o verificar.
