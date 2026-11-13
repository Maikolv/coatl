# Accesibilidad

## Lo que se verifica automáticamente (cada push, `tests/e2e/accesibilidad.spec.js`)

- **axe-core 4.10** con las reglas WCAG 2.0/2.1 A y AA en los 8 apartados, en escritorio (1366 px) y móvil (375 px): **0 violaciones**.
- El asistente abierto (panel, mensajes, chips y campo de texto) también pasa axe.
- Uso solo con teclado del asistente: abrir con Enter, foco en el campo, enviar, cerrar con Esc y regreso del foco al botón.
- Otras e2e ya existentes: pestañas WAI-ARIA del simulador (flechas, Inicio/Fin), nombres accesibles de botones, páginas con `aria-current`.

Correcciones de esta revisión (v7.1): contraste de notas y del tono de alerta (`--alerta` #B7791F → #8F5E12, de 3.6:1 a más de 6:1), nombre accesible del tablero de 100 negocios, fórmulas y tabla de zonas desplazables alcanzables con teclado.

## Lo que necesita una persona con lector de pantalla

Una herramienta automática detecta cerca de un tercio de los problemas. Antes de la presentación, alguien del equipo debe hacer este recorrido con **NVDA** (gratuito, Windows) y Edge o Chrome. Se calcula media hora.

| # | Tarea | Qué debe pasar |
|---|---|---|
| 1 | Abrir el sitio y pulsar `H` varias veces | Se escuchan los títulos de sección en orden lógico |
| 2 | `Tab` desde el inicio hasta «Simulador» y Enter | Se anuncia el cambio de página; aparece la pestaña «Simulador» |
| 3 | En el simulador, cambiar el giro y los clientes | Se anuncia la nueva probabilidad (región viva) sin tener que buscarla |
| 4 | Recorrer las pestañas Negocio → Operación con flechas | Cada pestaña se anuncia como «pestaña, seleccionada» |
| 5 | Abrir el asistente, escribir «¿cómo voy?» | La respuesta se lee sola |
| 6 | Cerrar una pestaña de apartado con su botón ✕ | Se anuncia «Cerrar la pestaña …» y el foco no se pierde |
| 7 | Cargar un CSV en Empresas | Se anuncia el estado (listo o error) |
| 8 | Tablas de zonas, censo y comparador | Se leen encabezados de fila y columna |

Anotar en este archivo la fecha, el lector, el navegador y cada hallazgo.
