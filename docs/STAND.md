# Propuesta de stand físico — COATL

Objetivo: que un evaluador o inversionista entienda en **30 segundos** qué es COATL y en **3 minutos** lo vea funcionar con un caso real de Coacalco. Identidad fija: rojo `#C8102E`, granate `#7A0C1F`, blanco hueso `#FBF6F3` y greca escalonada.

## 1. Distribución (mesa de 1.8 × 0.6 m)

```
   [ Lona roll-up 0.85×2 m ]                 [ Pantalla 32"+ en pedestal: video en bucle ]
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │  Tablet/laptop DEMO    │   Póster central (tríptico)   │   QR grande + one-pager │
 │  (simulador en vivo)   │   "¿Sobrevivirá tu negocio?"  │   tarjetas para llevar   │
 └──────────────────────────────────────────────────────────────────────────────┘
          mantel rojo con franja de greca al frente
```

## 2. Recursos y presupuesto aproximado (MXN, cotizar antes de comprar)

| Recurso | Para qué | Costo aprox. | Prioridad |
|---|---|---|---|
| Laptop o tablet ≥ 10" con el sitio abierto (modo sin conexión: `npm run servir`) | Demo en vivo del simulador | Propia | Indispensable |
| Pantalla/monitor 32"+ (prestado o rentado) | `entregables/COATL_Video.mp4` en bucle con subtítulos | $0–1,500 renta | Alta |
| Lona roll-up 85×200 cm | Nombre, pregunta gancho, logotipo y greca | $650–1,100 | Alta |
| Póster/tríptico 90×60 cm (foam board) | Modelo en 4 pasos: logística → Cox → Monte Carlo → finanzas | $350–600 | Alta |
| One-pager impreso (100 pzas, carta, color) | Escenario de referencia, QR y autores | $250–450 | Alta |
| QR grande impreso (A4) apuntando a `maikolv.github.io/coatl` | Que lo prueben en su teléfono | $30 | Indispensable |
| Mantel rojo + franja de greca (vinil o tela) | Identidad visual | $250–500 | Media |
| Tarjetas de presentación (50 pzas) con QR | Contacto del equipo | $150–300 | Media |
| Multicontacto, extensión 5 m, cargadores, cable HDMI | Energía y respaldo | Propios | Indispensable |
| Hotspot del teléfono / módem | La IA requiere internet; el resto funciona sin red | Propio | Alta |
| Playeras o gafetes rojos con nombre | Imagen de equipo | $0–450 | Opcional |
| **Total estimado** | | **≈ $1,700 – 5,400** | |

## 3. Contenido impreso (todo se genera del propio modelo)

- **One-pager**: problema (≈ 57 % de los negocios no llega a 3 años, tabla INEGI), la solución, el escenario de referencia *Cafetería · Los Héroes* (P 51.6 %, rango 44.3–58.3 %, ROI 302.9 %, payback 4.1 meses, VPN $912,776), QR y autores en orden: Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés.
- **Póster**: diagrama de proceso (`entregables/diagrama-proceso.png`) y una lámina de "qué NO es" (no es un pronóstico exacto; los β son estimaciones del equipo).
- Sacar los PDF con `npm run entregables` justo antes de imprimir, para que las cifras coincidan con el sitio.

## 4. Guion de demostración (3 minutos)

1. **Gancho (15 s)**: «¿Qué probabilidad tiene una cafetería en Los Héroes de seguir abierta en 3 años?» Que el visitante adivine.
2. **Simular (60 s)**: abrir el simulador, mostrar el mapa de zonas y el resultado 51.6 % con su rango plausible. Cambiar la zona o el ticket para que vea moverse P.
3. **Riesgo (45 s)**: Monte Carlo (P5 / mediana / P95) y el cobro de piso: subirlo muestra cómo baja la utilidad.
4. **Estrategia (45 s)**: marcar acciones en el simulador de plan (51.6 % → 66.2 % con tres acciones), mostrar la matriz de impacto y control y el calendario de 90 días; imprimir el plan en PDF.
5. **Cierre (15 s)**: QR para que lo prueben en su teléfono y el one-pager.

Para **inversionistas**, enfatizar: producto sin servidor (costo de operación casi cero), datos públicos (INEGI, DENUE), modelo validado por pruebas automáticas y la ruta de crecimiento (más municipios, calibrar β con datos reales). Para **evaluadores**: método estadístico, honestidad sobre los límites y las pruebas (`npm test`, validador Python, e2e).

## 5. Lista de verificación del día

- [ ] Sitio abierto en `?vista=todo` y también servido localmente (`npm run servir`) por si falla la red.
- [ ] Video descargado en la laptop, no en streaming.
- [ ] Brillo al máximo, notificaciones y protector de pantalla apagados.
- [ ] Respuestas ensayadas: «¿qué tan exacto es?» → es una estimación con rango plausible, no una predicción exacta; «¿de dónde salen los datos?» → INEGI, DENUE y supuestos del equipo, documentados en METODOLOGIA.md.
- [ ] Una persona hace la demo, otra atiende preguntas y otra reparte material.
- [ ] No pedir ni guardar datos personales de los visitantes (aviso de privacidad del sitio).
