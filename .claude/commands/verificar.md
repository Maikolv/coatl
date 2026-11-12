Verifica que COATL sigue sano:

1. `npm run build` y confirma que `git diff -- index.html` solo refleja cambios intencionales de `src/`.
2. `npm test` (unitarias del modelo) y `python scripts/validar_modelo.py` (en Windows: `uv run --no-project python scripts/validar_modelo.py`).
3. `npm run test:e2e`: carga sin errores de consola, escenario de referencia, mapa con 6 zonas, FODA P5 < P50 < P95, compartir por URL, comparar escenarios, exportar PNG y sin desbordamiento en móvil.
4. Escenario de referencia v3 (Cafetería · Los Héroes): P = 51.6 % (rango 44.3–58.3 %), utilidad ≈ $60,371/mes, ROI 302.9 %, payback 4 meses, VPN $912,776.
5. Confirma que la paleta sigue siendo #C8102E / #7A0C1F / #FBF6F3 y que la greca está presente.

Reporta qué pasó y qué falló, sin cambiar código a menos que te lo pida.
