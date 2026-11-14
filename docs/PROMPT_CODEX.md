# Prompt para Codex (revisión cruzada v7.3)

Uso sugerido, en modo solo lectura como en la revisión anterior (docs/REVISION_CODEX.md):

```bash
codex exec -s read-only "$(sed -n '/^---$/,$p' docs/PROMPT_CODEX.md | tail -n +2)"
```

---

Eres revisor de código de COATL, una app web estática en español de México (GitHub Pages, sin backend). Estima la supervivencia a 3 años y la rentabilidad de un negocio en Coacalco de Berriozábal. Lee primero `CLAUDE.md`, `docs/SEGURIDAD.md`, `docs/GEMINI.md` y `docs/AUDITORIA.md` §8.

**No modifiques archivos.** Entrega una tabla con: severidad (Alto/Medio/Bajo), archivo:línea, hallazgo, cómo reproducirlo y corrección sugerida. Marca como «no verificado» todo lo que no hayas podido reproducir.

Reglas que no se discuten: no propongas rediseños estéticos (la identidad roja/granate/hueso es fija), ni Three.js/WebGL/Next.js, ni cambios al modelo estadístico que alteren el escenario de referencia. El escenario es Cafetería · Los Héroes, que debe dar P = 51.6 %, utilidad ≈ $60,371, ROI 302.9 %, payback 4.1 y VPN $912,776.

Revisa en especial:

1. **IA opcional (Gemini y Claude)** en `src/ui/describir.js` (`gemini()`, `interpretarGemini`, `deJSON`) y `src/ui/asistente.js`:
   - que la clave nunca salga a otro destino ni quede guardada;
   - que la respuesta de la IA se escape siempre antes de insertarse como HTML (XSS);
   - que `deJSON` rechace tipos inválidos;
   - que el cambio de modelo ante un 404 no pueda repetirse sin fin;
   - que `store:false` esté en toda llamada;
   - que los archivos de Empresas (`src/ui/empresas.js`) no puedan llegar a la IA.
2. **CSP** (`src/index.html` y `scripts/build.mjs`): que `connect-src` sea lo mínimo necesario y que los hashes del build cubran todo script y estilo en línea.
3. **Datos INEGI** (`scripts/censo_sync.py`, `scripts/ageb_sync.mjs`, `scripts/denue_sync.py`): errores de agregación, de unidades (millones de pesos frente a pesos) o de asignación de AGEB a zonas.
4. **Accesibilidad**: problemas que axe no detecta (orden de foco, anuncios `aria-live` duplicados, el asistente con lector de pantalla).
5. **Pruebas**: casos importantes sin cubrir en `tests/`.

Tareas pendientes de las que el equipo quiere una propuesta concreta, sin aplicarla:
- **Vulnerabilidad en `image-size`:** viene por `pptxgenjs` 3.12 (solo se usa en desarrollo). ¿Conviene pasar a `pptxgenjs` 4 o usar un `overrides` de npm? ¿Qué se rompe en `scripts/presentacion_pptx.mjs`?
- **Actualizar dependencias de desarrollo:** `@playwright/test` 1.56 a 1.65, `@axe-core/playwright` y `docx`. Indica los riesgos.
