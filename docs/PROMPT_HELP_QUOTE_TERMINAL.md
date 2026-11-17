# Prompt — llevar los buenos puntos de COATL a Help Quote Terminal

Carpeta local: `C:\Users\MIKE\Desktop\Repos\actinver-terminal` (repo `Maikolv/help-quote-terminal`). Sirve para Claude Code o Codex abiertos **en esa carpeta**.

```text
Trabajas en Help Quote Terminal (carpeta actinver-terminal): terminal local de análisis de portafolios
(FastAPI + SQLite + HTML/CSS/JS sin build). Lee primero su CLAUDE.md, docs/mandato-autonomia-v2.txt y
DESIGN.md: sus límites duros mandan sobre este encargo (sin dinero real ni órdenes, secretos solo en
.env, solo proveedores gratuitos, servir solo en 127.0.0.1, nunca presentar un precio vencido como
vigente). Su identidad visual es la de DESIGN.md (negro/gris/blanco con rojo): NO la cambies por la de
COATL.

OBJETIVO
Adoptar ocho prácticas que funcionaron en COATL (proyecto hermano, sitio estático de estadística).
Para cada una, primero verifica si ya existe algo equivalente; si existe, no la dupliques: anota en el
informe dónde está. Haz el cambio más pequeño que funcione y deja una prueba por cada lógica nueva.

1. Indicador de «cálculo listo». En COATL, <html data-calculo="pendiente|listo"
   data-calculo-version="n"> cambia cuando termina el cálculo, y las pruebas de navegador esperan ese
   atributo en vez de tiempos fijos. Aplícalo a las vistas que recalculan (plan, propuestas, riesgo,
   Estación) y cambia las pruebas de tests/navegador que usen esperas fijas. Meta: cero sleeps.
2. Historial único de versiones. En COATL, data/versiones.json es la sola fuente de la que salen
   docs/VERSIONES.md, el apéndice del documento técnico y la hoja del Excel. Aquí hay CHANGELOG.md,
   docs/historial-estado.md y varias secciones «Estado comprobado» en CLAUDE.md: crea una fuente única
   (versión, fecha, commit, cambios, cifras de referencia) y un script que genere los otros, sin perder
   texto existente.
3. Escenario de referencia como prueba de regresión. COATL fija cifras exactas (P, VPN, ROI) que
   vigilan la prueba unitaria, un validador independiente en otro lenguaje y la e2e. Elige una cartera
   demo de data/demo/ y fija sus cifras (rendimiento esperado, volatilidad, VaR/CVaR, pesos de máximo
   Sharpe) en una prueba; si alguien cambia el modelo, la prueba obliga a documentar por qué.
4. Resultado para llevar con QR. COATL genera un reporte propio para imprimir/PDF (no captura de
   pantalla) con un QR que reabre el mismo resultado (estado en el fragmento #r=, nunca en la consulta
   de la URL). Haz lo mismo para el plan del día y el reporte ejecutivo, con qrcode-generator copiado a
   un vendor local. El QR solo debe codificar parámetros del escenario, nunca la cartera real ni datos de
   la cuenta; en modo demo, solo datos simulados.
5. Datos guardados aislados por usuario. COATL cifra los negocios guardados con PBKDF2-SHA-256 (250 000
   iteraciones) + AES-GCM-256, llave solo en memoria, bloqueo por inactividad a los 15 min, y sin perfil
   usa sessionStorage. Revisa los 7 usos de localStorage: lo que sea preferencia de vista puede quedarse;
   lo que contenga cartera, pesos o montos debe cifrarse o vivir solo en el servidor local.
6. Tipografías propias y CSP estricta. COATL sirve woff2 variables desde el propio sitio
   (@fontsource-variable) con font-src 'self' y sin Google Fonts; el build calcula hashes para la CSP y
   prohíbe style="" generado por JS (usa clases o CSSOM). Revisa las 3 CSP existentes y apriétalas igual.
7. Accesibilidad medida. COATL corre axe (WCAG 2.1 AA) en las e2e y la mantiene en 0 violaciones, en
   escritorio y en 375 px vertical/horizontal. Agrega esa prueba para Estación, plan y portafolios;
   corrige lo que salga sin cambiar la estética.
8. Documentos generados desde el modelo. En COATL, los PDF, PPTX y XLSX salen de un solo script que lee
   las cifras del motor (nunca escritas a mano) y usa las tipografías y la paleta del sitio; los PDF se
   componen con Chromium, no con LibreOffice. Aplícalo al reporte ejecutivo y al Excel de Markowitz que
   ya existen, sin cambiar sus números.

FUERA DE ALCANCE
Rediseños, cambiar de framework, nuevos proveedores de datos, cualquier servicio que pida tarjeta o
facturación, renombrar la carpeta, tocar la cuenta de Actinver, subir datos reales a GitHub o a una IA.

VERIFICACIÓN
Todas las pruebas existentes (uv run pytest y node --test tests/*.test.mjs) más las nuevas, en verde.
Arranca la demo (.\start.bat demo, http://127.0.0.1:8765) y comprueba en navegador: indicador listo,
QR que reabre el plan, axe en 0 y consola sin errores. No hagas push sin que el usuario lo pida. Commits
en español terminados en "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".

ENTREGA
Un informe en docs/mejoras-desde-coatl.md: qué se adoptó, qué ya existía (con ruta), qué se descartó y
por qué, archivos tocados y resultado de cada prueba.
```
