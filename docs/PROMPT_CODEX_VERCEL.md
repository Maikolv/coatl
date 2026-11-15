# Prompt para Codex: publicar el intermediario de IA en Vercel

Codex publica `servicios/ia` en Vercel con la CLI oficial. **La clave de Gemini la escribes tú**, nunca Codex: Vercel te la pide en la terminal o la pones en el panel.

## Ruta completa (PowerShell)

1. Entra al repo y actualízalo:

```bash
cd C:\Users\MIKE\Desktop\Repos\coatl
```

```bash
git switch main
```

```bash
git pull
```

2. Inicia sesión en Vercel **tú mismo**. Se abre el navegador; entra con tu cuenta y aprueba:

```bash
npx vercel login
```

3. Inicia sesión en Codex, solo si no lo has hecho:

```bash
codex login
```

4. Carga el prompt y ejecútalo. Necesita red para hablar con Vercel; por eso va `network_access=true`:

```bash
$prompt = ((Get-Content docs\PROMPT_CODEX_VERCEL.md -Raw -Encoding utf8) -split '(?m)^---\s*$', 2)[1]
```

```bash
codex exec -s workspace-write -c sandbox_workspace_write.network_access=true $prompt
```

5. Cuando Codex pida la clave, o al terminar, agrega tu clave de Gemini. Vercel te pide el valor; pégalo tú, no Codex:

```bash
npx vercel env add GEMINI_API_KEY production --cwd servicios/ia
```

Después vuelve a publicar:

```bash
npx vercel deploy servicios/ia --prod
```

6. Comprueba en el navegador: <https://coatl-ia.vercel.app/api/coatl> debe responder `{"servicio":"COATL IA","listo":true}`.

7. Si Codex hizo commits (solo ocurre si la URL resultó distinta de `coatl-ia.vercel.app`), revísalos y súbelos:

```bash
git log --oneline -3
```

```bash
git push
```

---

Trabajas en COATL; lee `CLAUDE.md` y `docs/GEMINI.md`. Tu tarea es **publicar el intermediario de IA** (`servicios/ia/`, una función de Vercel en `api/coatl.js`) en la cuenta de Vercel con la que ya inició sesión la persona (`npx vercel whoami`).

## Reglas de seguridad (no negociables)

- **Nunca** pidas, escribas, imprimas, guardes ni pases como argumento la clave de Gemini ni ningún token. El valor de `GEMINI_API_KEY` lo escribe la persona. Si hace falta, termina indicándole el comando `npx vercel env add GEMINI_API_KEY production --cwd servicios/ia`.
- No modifiques `servicios/ia/api/coatl.js` salvo que el despliegue falle por un error de código, y en ese caso explica el cambio.
- No actives planes de pago ni nada que genere cargos. El proyecto debe quedar en el plan Hobby (gratuito).
- No borres proyectos ni despliegues existentes en Vercel.

## Pasos

1. `npx vercel whoami`. Si no hay sesión, detente y pide a la persona que ejecute `npx vercel login`.
2. `npm test`. Las pruebas de `tests/ia.test.mjs` deben pasar antes de publicar.
3. Publica en producción sin preguntas interactivas, con nombre de proyecto `coatl-ia`:
   `npx vercel deploy servicios/ia --prod --yes --name coatl-ia`
   Si `--name` ya no existe en la versión de la CLI, usa `npx vercel link --cwd servicios/ia --yes --project coatl-ia` y luego `npx vercel deploy --cwd servicios/ia --prod --yes`.
4. Anota la URL de producción que devuelve Vercel. Comprueba con `curl` (GET) que `<url>/api/coatl` responde JSON con `"servicio":"COATL IA"`. Si `listo` es `false`, falta la clave: indícale a la persona el comando del paso 5 de la ruta.
5. Comprueba que el CORS acepta el sitio: un `OPTIONS` con `Origin: https://maikolv.github.io` debe devolver `Access-Control-Allow-Origin: https://maikolv.github.io`.
6. **Solo si la URL de producción NO es `https://coatl-ia.vercel.app`:**
   - cambia el valor por defecto de `IA_URL` en `scripts/build.mjs` a `<url>/api/coatl`;
   - actualiza las menciones de `coatl-ia.vercel.app` en `docs/GEMINI.md`, `docs/SEGURIDAD.md`, `CLAUDE.md` y en las pruebas `tests/e2e/paginas.spec.js` y `tests/e2e/privacidad-ia.spec.js` (las rutas simuladas);
   - corre `npm run build`, `npm test` y `npx playwright test tests/e2e/paginas.spec.js tests/e2e/privacidad-ia.spec.js`;
   - haz un commit en español terminando con `Co-Authored-By: Codex`. **No hagas push.**
7. Entrega un resumen:
   - la URL publicada;
   - la respuesta del GET y del OPTIONS;
   - si falta la clave;
   - los commits hechos, si los hubo.
