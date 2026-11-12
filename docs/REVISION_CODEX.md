# Revisión cruzada con Codex (Fase 3)

- **Revisor:** Codex CLI 0.167.2 (`codex exec -s read-only`), sesión de ChatGPT, 12-nov-2026.
- **Alcance:** diff `cc26175..68c894c` de la rama `mejoras-profesionales` (sin el `index.html` generado), más `docs/AUDITORIA.md` y `docs/METODOLOGIA.md`.
- **Pedido:** bugs, errores estadísticos, accesibilidad WCAG 2.2 AA y seguridad.
- **Modo:** Codex no modificó archivos. Cada hallazgo se verificó a mano antes de aplicarlo.

## Resultado

| # | Sev. | Hallazgo de Codex | Decisión | Qué se hizo |
|---|---|---|---|---|
| 1 | Alto | Un enlace `#e=` con valores fuera de rango producía `NaN` en el Monte Carlo y un VPN infinito | ✅ Aceptado (reproducido) | `num()` en `src/ui/controles.js` aplica los `min`/`max` de cada control, tanto a la entrada manual como al enlace. E2E «enlace fuera de rango» |
| 2 | Alto | Seis controles (modelo de negocio, permisos, modalidad, horario, ajuste de precio, elasticidad) no afectaban al modelo | ✅ Aceptado | Se conectaron con los β que **ya traía el HTML original**, sin inventar coeficientes. El precio usa elasticidad constante: `ticket′ = t̄(1+a)`, `μ′ = μ(1+a)^ε`. Todos son neutros por defecto, así que **el escenario de referencia no cambia**. Python actualizado y prueba unitaria nueva |
| 3 | Medio | El «potencial con el plan» ignoraba la recomendación de cambiar de zona | ✅ Aceptado | `trasladarZona()` en `src/mapa/mapa.js` es la única regla de traslado; la usan el mapa, el comparador y el plan |
| 4 | Medio | Gráficas sin alternativa textual equivalente | ✅ Aceptado | `aria-label` en los cuatro canvas y una descripción dinámica (`#descGraficas`) con S(t) y su banda, P5/P50/P95, el equilibrio y los β del tornado |
| 5 | Medio | Pestañas sin `aria-controls`/`aria-labelledby` ni navegación con flechas | ✅ Aceptado | Patrón WAI-ARIA completo: ids, *roving tabindex*, flechas e Inicio/Fin. E2E de teclado |
| 6 | Medio | Contraste insuficiente en «Escenario condicionado» y en los títulos del plan en Modo Oráculo | ✅ Aceptado | `#7A4A06` sobre `#F7EDD8`; títulos claros en Oráculo. Lighthouse además detectó `#9B6A6E` en textos pequeños y `#B89BA0` en `.vacio`; ambos pasaron a `#6E464B` |
| 7 | Bajo | «Guardar escenario» podía copiar métricas viejas durante el recálculo de 220 ms | ✅ Aceptado | El botón cancela el temporizador y recalcula antes de guardar |
| 8 | Bajo | `scripts/servir.mjs` se caía con una URL mal formada (`/%`) | ✅ Aceptado | Responde `400`. También se agregó el tipo MIME `.txt` (robots.txt) |

**Descartados:** ninguno. Los ocho hallazgos se reprodujeron o se verificaron en el código.

**Confirmado sin problemas por Codex:**
- los cuantiles tipo 7;
- la perturbación de β para el rango de P;
- la identidad S(3) = P;
- que no hay vector XSS desde el fragmento de la URL hacia `innerHTML`, porque los valores solo se aplican a controles existentes y se validan contra sus opciones o límites;
- que las bases de ROI, payback y VPN están declaradas.

## Verificación posterior

- `npm test`: 11/11.
- `scripts/validar_modelo.py`: las 5 métricas OK; el escenario de referencia no cambió.
- `npm run test:e2e`: 22/22 (escritorio y móvil).
- Lighthouse 12.2.1, Chrome headless, build local:

| Accesibilidad | Buenas prácticas | SEO | Rendimiento |
|---|---|---|---|
| 100 | 100 | 92* | 49 |

\* Con el servidor local de entonces, `robots.txt` se servía sin tipo MIME; ya está corregido y GitHub Pages lo sirve como `text/plain`.

El rendimiento queda bajo porque al cargar se calculan 2,000 años de Monte Carlo, más las fuentes y el mapa. No es objetivo de esta fase; queda como pendiente en CLAUDE.md.
