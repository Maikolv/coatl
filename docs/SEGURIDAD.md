# Seguridad y privacidad de COATL

| Medida | Dónde | Detalle |
|---|---|---|
| CSP sin `'unsafe-inline'` en scripts ni estilos | `scripts/build.mjs` | El build calcula el hash sha256 del único `<script>` y del único `<style>` en línea. Los atributos `style=""` se convierten en reglas `[data-ei]`. |
| `connect-src` acotado | `src/index.html` | La página solo puede conectarse a su propio origen (JSON del DENUE, censo y AGEB), a `generativelanguage.googleapis.com` (Gemini), a `api.anthropic.com` y a `cdn.jsdelivr.net` (SDK de Claude). Las dos IA solo se usan si la persona pega su propia clave; sin clave no sale ninguna petición. |
| IA opcional | `src/ui/describir.js`, `src/ui/asistente.js` | La clave vive solo en memoria de la pestaña. A la IA se envía el texto que la persona escribe y un resumen del escenario (giro, zona, P, utilidad, clientes, ticket); nunca los archivos de Empresas. Gemini se llama con `store:false`. |
| SRI sha384 | Leaflet y Chart.js | Si el archivo del CDN cambiara, el navegador lo rechaza. |
| Sin rutas ocultas | `scripts/servir.mjs` | El servidor local no sirve `.git`, `.env`, `.claude` ni ningún otro segmento que empiece con punto. |
| Cabeceras de seguridad | `scripts/servir.mjs` | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` y la CSP completa con `frame-ancestors 'none'`. GitHub Pages no permite cabeceras propias; ahí aplica la CSP del `<meta>`. |
| Datos de empresas confidenciales | `src/ui/empresas.js` | Los archivos se leen con `FileReader` dentro del navegador. **No se suben a ningún servidor**: no hay código que los envíe (tampoco a las IA opcionales). Al recargar o pulsar «Borrar», los datos desaparecen. No se usa `localStorage`. |
| DENUE solo agregado | `scripts/denue_sync.py` | Se publican conteos. Los nombres, direcciones y contactos de los establecimientos no salen de la caché local de la sincronización. |

## Verificación

- `npm run test:e2e` falla si hay errores de consola, incluidas las violaciones de la CSP.
- Una prueba e2e confirma que analizar un archivo de empresa no genera ninguna petición de red.
- Lighthouse: Buenas prácticas 100.
