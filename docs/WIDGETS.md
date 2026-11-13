# Inventario de widgets (recorrido exploratorio, v4)

El recorrido es: **ajustar un supuesto → ejecutar → interpretar → verificar la fuente**.
Todos los widgets llaman al mismo motor (`derivar`, `modeloLogistico`, `curvaSupervivencia`, `rangoP`, `monteCarlo`, `finanzas`) con el escenario del formulario y la semilla 20262. Por eso, para entradas equivalentes, dan exactamente los números del simulador; las pruebas lo verifican.

Cada widget declara su estado en `data-estado`: `cargando` · `listo` · `vacio` · `error`, con un mensaje en `#<id>-estado`. Si un widget falla, los demás siguen funcionando.

| Ruta (ancla) | Widget | Pregunta | Interacción | Respuesta visible | Profundidad | Accesible fuera del lienzo |
|---|---|---|---|---|---|---|
| `#explorar` | `wDemo` | ¿Cuántos clientes al día necesita tu escenario para sostenerse? | Deslizador de clientes/día; botón «Abrir el simulador con este escenario» | P, utilidad y equilibrio; barra con marca de equilibrio | 3 capas: rejilla de fondo, barra iluminada, anotación | `<output>` y `<dl>` con `aria-live` |
| `#explorar` | `wMapa` | ¿En qué zona le iría mejor a este mismo negocio? | Clic o toque en el bloque, o lista con flechas, Inicio/Fin y Enter | Ficha de la zona con procedencia (resultado del modelo / estimación del equipo); botón al simulador | 2.5D isométrico en SVG; altura = P con escala de 50 % rotulada; esquema no catastral | Lista `listbox` sincronizada |
| `#simulador` | Escenario vigente + Restablecer | ¿Qué escenario estoy viendo? | Restablecer referencia | Nombre, hora y estado («Recalculando…» mientras se muestra la última simulación válida) | — | Texto |
| `#explorarResultados` | `wSup` | ¿Qué tan probable es que siga abierto al año t? | Deslizador de año (1–10) | Capas: nacional (contexto), sensibilidad P5–P95, tu escenario; tabla 1/2/3/5/10 | Capas apiladas sobre fondo profundo | Tabla con encabezados |
| `#explorarResultados` | `wMC` | ¿Con qué probabilidad la utilidad anual supera una meta? | Campo numérico de meta (MXN) | «En N de 2,000 años…»; curva de probabilidad acumulada con la meta marcada | Curva SVG con anotación | Frase en `aria-live` |
| `#explorarResultados` | `wSuperficie` | ¿Cómo responde el resultado a dos supuestos a la vez? | Resultado (utilidad o P), dos ejes (clientes, ticket, CV, renta), celdas con flechas, vista plana | Lectura exacta con unidades y corte 2D en tabla | Rejilla 9×9 en 2.5D (CSS 3D); vista plana con la misma información | Celdas como `button` con `aria-label`; tabla de corte |
| `#trazabilidad` | `wTraza` | ¿De dónde sale este número? | Lista navegable con flechas | Ruta en 6 pasos: resultado → fórmula → variables → fuente (con enlace) → periodo → supuesto, con etiqueta de procedencia | Pasos encadenados | `listbox` + lista ordenada |

## Decisiones

- **Sin WebGL ni Three.js.** CLAUDE.md los rechaza, así que la profundidad se logra con SVG isométrico, CSS 3D y capas. No existe un modo «WebGL falla»: el único modo es el accesible, y la «Vista plana (2D)» de la superficie se activa sola con movimiento reducido.
- **Extrusión solo con escala explícita:** en el mapa, la altura es P (0–100 %) con una regla de 50 % rotulada; en la superficie, la altura es relativa (mín.–máx. de la rejilla), y el valor exacto se lee en la tabla.
- **Mapa esquemático:** no existen geometrías verificadas de las zonas, por eso la escena se rotula «esquema · no catastral».

## Mediciones (móvil emulado 390×844, CPU 4× más lenta, Edge)

| Interacción | Antes de optimizar | Después |
|---|---|---|
| Deslizador del widget de inicio | — | 15 ms |
| Cambio de eje de la superficie | 362 ms | 14–42 ms (eventos delegados) |
| Año de supervivencia | — | 6 ms |
| Meta del Monte Carlo | — | 24 ms |
| Recálculo completo (parte síncrona) | — | ~400 ms; el resto se pinta en tareas separadas |

Lighthouse (local): Accesibilidad 100, Buenas prácticas 100, SEO 92, Rendimiento 40–57 (varía entre corridas).

## Capturas

- Antes: `docs/capturas/antes/`.
- Después: `docs/capturas/` (`explorar.png`, `resultados.png`, `trazabilidad.png`, …).
