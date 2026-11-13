# Escaneo de seguridad con HawkScan (StackHawk)

- **Fecha:** 13-nov-2026.
- **Herramienta:** HawkScan 6.6.0 (CLI oficial, binario de `download.stackhawk.com`).
- **App en StackHawk:** `coatl` (`c097a7f6-d022-4b52-a50c-68efd438abfd`), entorno `Production`.
- **Objetivo:** el build autocontenido servido localmente (`node scripts/servir.mjs 8000`), con spider base y Ajax.

La clave de API **no está en el repositorio**: se pasa como variable de entorno (`HAWK_API_KEY` / `API_KEY`) y `stackhawk.yml` no la contiene.
No se hizo ninguna acción de facturación: solo se usaron la creación de la app, el escaneo y la clasificación de hallazgos (triage).

| Escaneo | Resultado | Hallazgos |
|---|---|---|
| 1 (`f893e271`) | PASS | 5: archivo oculto `/.git/config`, sin anti-clickjacking, sin `nosniff`, CSP `script-src unsafe-inline`, CSRF |
| 2 (re-escaneo) | PASS | 2: CSRF y CSP con comodín |
| 3 | PASS | 2: CSRF y CSP `style-src unsafe-inline` |
| 4 (`d54ce6ac`, final) | PASS | 1: CSRF, **marcado como falso positivo** |

## Correcciones

| Hallazgo | Corrección |
|---|---|
| Hidden File Found (`/.git/config`) | `scripts/servir.mjs` ya no sirve rutas con segmentos ocultos (`.git`, `.env`, `.claude`…). En GitHub Pages no ocurría, porque solo se publica `dist/`. |
| Missing Anti-clickjacking / X-Content-Type-Options | El servidor local envía `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` y la CSP completa con `frame-ancestors 'none'`. |
| CSP: script-src unsafe-inline | El build calcula el hash sha256 del único script en línea y lo pone en la CSP en lugar de `'unsafe-inline'`. |
| CSP: Wildcard Directive | Se quitó `https://*.tile.openstreetmap.org`; el servidor ya no envía una CSP parcial. |
| CSP: style-src unsafe-inline | El build mueve los atributos `style=""` a reglas `[data-ei]` y autoriza el `<style>` por hash. Los estilos que antes se inyectaban con `style=""` desde JS ahora se aplican por CSSOM. |
| Anti-CSRF Tokens | **Falso positivo:** sitio estático sin backend; el formulario no se envía (`preventDefault` y CSP `form-action 'none'`). |

## Limitación conocida

GitHub Pages no permite cabeceras HTTP propias, así que `X-Frame-Options` y `frame-ancestors` (que no funcionan en `<meta>`) solo aplican al servidor local. La CSP en `<meta>`, con hashes, sí aplica en Pages.

## Cómo repetir el escaneo

```bash
npm run build && node scripts/servir.mjs 8000      # en otra terminal
set API_KEY=<tu clave>   # PowerShell: $env:API_KEY="<tu clave>"
hawk scan stackhawk.yml
```
