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

## Fase 4

13 de noviembre de 2026. Avance parcial: prueba de privacidad agregada y verificada; actualizaciones de dependencias y commits bloqueados por el entorno.

### Dependencias

La opción elegida para la tarea 1 es un `overrides` específico de `pptxgenjs` hacia `image-size` 2.0.3, pendiente de aplicar. Los avisos [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) y [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) señalan esa versión como corregida. Subir únicamente a `pptxgenjs` 4.0.1 conserva `image-size` 1.2.1, según sus [notas de versión](https://github.com/gitbrent/PptxGenJS/releases/tag/v4.0.1). El paquete instalado de `pptxgenjs` 3.12 declara `image-size`, pero sus archivos de distribución no lo usan; el override tiene menor alcance que cambiar el generador de presentaciones completo.

Para la tarea 2 se consultaron las versiones estables [Playwright 1.65.1](https://registry.npmjs.org/@playwright/test/latest), [axe 4.14.0](https://www.npmjs.com/package/@axe-core/playwright?activeTab=versions) y [docx 9.15.3](https://www.npmjs.com/package/docx?activeTab=versions). El intento de actualización con npm falló: `EACCES` y `ENOTFOUND` al acceder a `registry.npmjs.org`. `package.json`, `package-lock.json` y las dependencias instaladas siguen sin cambios. No se pudo confirmar una auditoría con cero vulnerabilidades.

### Privacidad del asistente

`tests/e2e/privacidad-ia.spec.js` carga seis meses de datos simulados con valores distintivos en Empresas, confirma que se analizaron, configura una clave ficticia y pregunta al asistente. `page.route` intercepta Gemini y devuelve una respuesta simulada. La prueba exige una petición con la pregunta, el contexto del escenario y `store:false`; revisa que el cuerpo excluya el nombre del archivo, el CSV y cada celda, tanto en texto como con formato numérico mexicano. Pasó en Edge en escritorio y móvil. No se modificaron el modelo, los valores por defecto ni la interfaz.

### Verificación y pendientes

| Comando o comprobación | Resultado |
|---|---|
| `npm run build` | Correcto; `index.html` sin diferencias respecto a Git e idéntico a `dist/index.html` |
| `npm test` | 12/12 correctas |
| `uv run --no-project python scripts/validar_modelo.py` | Correcto con `UV_CACHE_DIR` en un directorio temporal; cinco métricas de referencia verificadas |
| Prueba nueva en Edge | Correcta en los dos tamaños de pantalla |
| `npm run test:e2e` | 93/98 en Edge: falló el mapa AGEB en ambos tamaños (0 de 70 polígonos y aviso de mapa real sin conexión); en móvil fallaron la creación del contexto de Edge para medir desbordamiento y la inicialización del indicador en las pruebas de costos propios y censo (`—` en lugar de `51.6%`) |
| Generadores PPTX y DOCX | Correctos con las dependencias actuales, ejecutados desde un directorio temporal con copias de sus entradas para conservar los entregables existentes; PPTX nuevo y existente: 10 láminas; DOCX con `word/document.xml` |
| Conversión con LibreOffice headless | Pendiente: `soffice.exe` no está disponible en el PATH ni en las rutas de instalación revisadas |
| `npm audit` | Falló la consulta al registro; no se certifica cero vulnerabilidades |
| `git status --short` | Solo `docs/AUDITORIA.md`, `docs/REVISION_CODEX.md` y el nuevo `tests/e2e/privacidad-ia.spec.js`; `index.html` sin diferencias |
| Commits | Ninguno: `git add` no pudo crear `.git/index.lock` por permiso denegado; sin push |

Las tres pruebas móviles de desbordamiento, costos propios y censo aprobaron al repetirlas con un solo trabajador. El cierre automático del servidor de las ejecuciones dirigidas quedó sin responder y se interrumpieron esos procesos después de ver sus pruebas aprobadas. La ejecución completa terminó con código 1 y conserva el resultado 93/98.

Los puntos 7 y 8 de la auditoría conservan ⏳ porque aún faltan la instalación, la validación de los documentos con las nuevas dependencias, la conversión a PDF y una auditoría satisfactoria. Las verificaciones actuales no certifican las versiones propuestas.

### Cierre de la Fase 4

13 de noviembre de 2026. Se completó fuera del entorno de Codex, porque su sandbox bloqueaba el acceso a npm y los commits.

- **`image-size`:** se aplicó el `overrides` propuesto (`pptxgenjs` → `image-size` ^2.0.3, instalado 2.1.0). `npm audit` da 0 vulnerabilidades.
- **Dependencias:** `@playwright/test` 1.65.1, `@axe-core/playwright` 4.14.0 y `docx` 9.15.3.
- **Generadores:** `reporte_docx.mjs` y `presentacion_pptx.mjs` funcionan con las nuevas versiones. La presentación tiene 10 láminas. Los entregables publicados no se regeneraron. No se hizo la conversión a PDF con LibreOffice.
- **Accesibilidad:** axe 4.14 agregó la regla `label-content-name-mismatch`. El logo tenía `aria-label="COATL, inicio"`, distinto de su texto visible. Se quitó el `aria-label` y la suite de accesibilidad volvió a 20/20.
- **Verificación:** build idéntico, 12/12 unitarias, validador Python correcto y e2e completas; las únicas fallas fueron las 16 de axe por la nueva regla, ya corregidas. Los fallos del mapa AGEB que vio Codex vienen de que su entorno no tenía red; aquí pasan.
