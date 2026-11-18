# Pauta para grabar las voces del video

El video de COATL usa hoy una voz sintética provisional. Para que las voces sean las de **Miguel, Bruno y Alonso**, cada quien graba sus escenas y el video se vuelve a generar: el programa detecta las grabaciones y las usa en lugar de la voz sintética.

> Este archivo lo genera `node scripts/video_presentacion.mjs --guion` a partir del guion real del video. No lo edites a mano: cambia el guion en `scripts/video_presentacion.mjs` y vuelve a generarlo.

## Reparto

| Narrador | Escenas | Tiempo aproximado |
|---|---|---|
| Miguel Antonio Cruz García | 7 | 123 s |
| Bruno Alejandro López Bautista | 7 | 111 s |
| Alonso Arroyo Cortés | 5 | 95 s |
| **Total** | **19** | **5 min 29 s** |

## Cómo grabar (5 pasos)

1. **Lugar.** Un cuarto cerrado, sin eco ni ruido de fondo (un clóset con ropa funciona muy bien). Apaga ventiladores y notificaciones.
2. **Equipo.** La grabadora de voz del teléfono basta. Sostén el micrófono a unos 15 cm de la boca, un poco de lado para evitar los golpes de aire.
3. **Lectura.** Lee con calma, a unas 150 palabras por minuto, sonriendo ligeramente. Deja medio segundo de silencio al inicio y al final. Si te equivocas, repite la escena completa.
4. **Un archivo por escena.** Guarda cada escena con el **nombre exacto** de la tabla (por ejemplo `01-titulo.m4a`). Se aceptan WAV, MP3, M4A, AAC, OGG y FLAC.
5. **Entrega.** Copia los archivos a la carpeta `entregables/voces/` del proyecto y ejecuta:

```bash
npm run build
```
```bash
node scripts/video_presentacion.mjs
```

El programa iguala el volumen de todas las grabaciones, ajusta cada escena a la duración de su audio, vuelve a escribir los subtítulos y muestra en pantalla el nombre de quien narra. Las escenas sin grabación siguen con la voz provisional, así que pueden grabar por partes.

**Privacidad.** Las grabaciones originales no se suben al repositorio (la carpeta está excluida); solo el video final las contiene.

## Guion por narrador

### Miguel Antonio Cruz García

| Archivo | Qué se ve | Texto para leer | Duración |
|---|---|---|---|
| `01-titulo` | Tarjeta: COATL | COATL: Cálculo de Oportunidad y Análisis Territorial Local. Un proyecto de Probabilidad y Estadística para estimar si un negocio sobrevivirá en Coacalco de Berriozábal. | ≈ 10 s |
| `02-problema` | Tarjeta: ¿Sobrevivirá mi negocio? | Según el INEGI, de cada cien negocios que nacen en México, solo cuarenta y tres siguen abiertos a los tres años. Y la decisión de abrir suele tomarse sin medir el riesgo. COATL responde dos preguntas antes de invertir: qué tan probable es que el negocio siga abierto y rentable a tres años, y cuánto podría ganar. | ≈ 23 s |
| `03-inicio` | El sitio: inicio | Es una aplicación web gratuita: funciona en cualquier navegador, en computadora o en teléfono, sin instalar nada y sin registrarse. La portada muestra el tablero de cien negocios: cuántos siguen abiertos cada año. | ≈ 13 s |
| `04-simulador` | El sitio: simulador | En el simulador, el usuario le pone nombre a su negocio y configura treinta y seis variables en cuatro pestañas: giro, zona, clientes, ticket, renta, empleados e inversión. Cada cambio recalcula al instante la probabilidad, la utilidad y los indicadores financieros. | ≈ 16 s |
| `05-modelo` | Tarjeta: Cuatro técnicas, un solo motor | El motor combina cuatro técnicas de la materia: una regresión logística para la probabilidad base; una curva de supervivencia de riesgos proporcionales con datos oficiales del INEGI; una simulación Monte Carlo reproducible para el riesgo; y el análisis financiero con valor presente neto, retorno y recuperación de la inversión. | ≈ 20 s |
| `17-limitaciones` | Tarjeta: Lo que el modelo no afirma | COATL declara sus límites. Giro, zona y formalidad ya se estiman con microdatos del INEGI, pero experiencia, reserva, marketing y deuda siguen siendo supuestos del equipo, porque ninguna fuente pública los liga con el cierre. Y lo comprobamos con negocios reales de Coacalco que el modelo no había visto: ordena el riesgo apenas mejor que el azar. Por eso la probabilidad se acompaña siempre de un rango plausible, que es un análisis de sensibilidad y no un intervalo de confianza. La herramienta apoya la decisión, pero no sustituye la asesoría profesional. | ≈ 36 s |
| `19-cierre` | Tarjeta: COATL | COATL convierte datos oficiales en una decisión informada. Gracias por su atención. | ≈ 5 s |

### Bruno Alejandro López Bautista

| Archivo | Qué se ve | Texto para leer | Duración |
|---|---|---|---|
| `06-territorio` | El sitio: territorio | El apartado Territorio reúne los indicadores oficiales del municipio y fotografías reales de Coacalco: su movilidad, su comercio regional y de barrio, y su vida cultural. | ≈ 10 s |
| `07-mapa` | El sitio: mapa | El mapa real divide Coacalco en seis zonas construidas sobre las setenta áreas geoestadísticas oficiales del INEGI, y compara la probabilidad del mismo negocio en cada una. | ≈ 11 s |
| `08-denue` | El sitio: denue | La competencia sale del Directorio Estadístico Nacional de Unidades Económicas, el DENUE, que se actualiza cada semana de forma automática. En Coacalco hay más de once mil quinientos negocios registrados, en cuatrocientas veinticuatro actividades. | ≈ 14 s |
| `09-empresas` | El sitio: empresas | Si el negocio ya existe, el apartado Para empresas analiza su historial mensual a partir de una plantilla de Excel con guía. El archivo se lee solo en el navegador: nunca se envía a ningún servidor. | ≈ 14 s |
| `10-fuentes` | Tarjeta: Datos oficiales, citados | Ningún dato se inventa. La información proviene del INEGI: la tabla oficial de supervivencia, el DENUE, los Censos Económicos dos mil diecinueve, el Censo de Población dos mil veinte y la Encuesta Nacional de Ocupación y Empleo; además del CONEVAL. Lo que es supuesto del equipo se rotula como estimación del equipo. | ≈ 21 s |
| `15-versiones` | Tarjeta: De supuestos a datos | El proyecto ha tenido dieciocho versiones. Primero el modelo pasó a la tabla oficial del INEGI. Después, los coeficientes de giro y zona se estimaron siguiendo a más de trescientos mil negocios en el DENUE de dos mil diecinueve a dos mil veinticuatro, y el de formalidad, con el panel de la ENOE. Con datos reales y una validación con negocios de Coacalco, la cafetería de referencia en Los Héroes pasó de cincuenta y dos a cuarenta y uno por ciento. Cada cifra la vigilan pruebas automáticas. | ≈ 35 s |
| `18-telefono` | El sitio en un teléfono | La interfaz se adapta al teléfono, tanto en vertical como en horizontal, sin perder información. | ≈ 6 s |

### Alonso Arroyo Cortés

| Archivo | Qué se ve | Texto para leer | Duración |
|---|---|---|---|
| `11-estrategia` | El sitio: estrategia | Con esos resultados, el apartado de Estrategia construye un análisis FODA con el propio modelo y propone acciones; como sus efectos son asociación o supuesto, cuenta solo la mitad. Y en lugar de prometer éxito, arma un plan por etapas: probar la demanda antes de abrir, invertir por tramos, revisar las ventas en los meses tres, seis y doce, y fijar desde el primer día cuánto se está dispuesto a perder. | ≈ 28 s |
| `12-mejora` | El sitio: simulador | Mejora tu negocio va más allá de los números: ofrece alternativas que se prueban con un clic, un diagnóstico de cinco niveles con un borrador a la medida en cada punto, una estimación fiscal y un modelo en dos punto cinco D de lo que el negocio puede llegar a ser. | ≈ 20 s |
| `13-qr` | El sitio: simulador | Y el resultado se lleva en el teléfono. Un código QR abre el reporte completo, del simulador y de la estrategia, listo para guardarse en PDF. El resultado viaja dentro del propio enlace: no se sube a ningún servidor. | ≈ 16 s |
| `14-asistente` | El sitio: simulador | Un asistente siempre disponible responde preguntas como cómo voy o qué zona me conviene, usando el mismo motor. Para preguntas libres, la inteligencia artificial de COATL responde sin pedirle ninguna clave al visitante. | ≈ 13 s |
| `16-construccion` | Tarjeta: Programado, probado y publicado | El proyecto se programó en Visual Studio Code, con control de versiones en Git y GitHub. El motor se escribió en módulos independientes y se validó con una réplica en Python. Cada cambio pasa por pruebas automáticas, incluidas las de accesibilidad, antes de publicarse. | ≈ 18 s |

## Guion completo en orden

1. **Miguel** · `01-titulo` — COATL: Cálculo de Oportunidad y Análisis Territorial Local. Un proyecto de Probabilidad y Estadística para estimar si un negocio sobrevivirá en Coacalco de Berriozábal.
2. **Miguel** · `02-problema` — Según el INEGI, de cada cien negocios que nacen en México, solo cuarenta y tres siguen abiertos a los tres años. Y la decisión de abrir suele tomarse sin medir el riesgo. COATL responde dos preguntas antes de invertir: qué tan probable es que el negocio siga abierto y rentable a tres años, y cuánto podría ganar.
3. **Miguel** · `03-inicio` — Es una aplicación web gratuita: funciona en cualquier navegador, en computadora o en teléfono, sin instalar nada y sin registrarse. La portada muestra el tablero de cien negocios: cuántos siguen abiertos cada año.
4. **Miguel** · `04-simulador` — En el simulador, el usuario le pone nombre a su negocio y configura treinta y seis variables en cuatro pestañas: giro, zona, clientes, ticket, renta, empleados e inversión. Cada cambio recalcula al instante la probabilidad, la utilidad y los indicadores financieros.
5. **Miguel** · `05-modelo` — El motor combina cuatro técnicas de la materia: una regresión logística para la probabilidad base; una curva de supervivencia de riesgos proporcionales con datos oficiales del INEGI; una simulación Monte Carlo reproducible para el riesgo; y el análisis financiero con valor presente neto, retorno y recuperación de la inversión.
6. **Bruno** · `06-territorio` — El apartado Territorio reúne los indicadores oficiales del municipio y fotografías reales de Coacalco: su movilidad, su comercio regional y de barrio, y su vida cultural.
7. **Bruno** · `07-mapa` — El mapa real divide Coacalco en seis zonas construidas sobre las setenta áreas geoestadísticas oficiales del INEGI, y compara la probabilidad del mismo negocio en cada una.
8. **Bruno** · `08-denue` — La competencia sale del Directorio Estadístico Nacional de Unidades Económicas, el DENUE, que se actualiza cada semana de forma automática. En Coacalco hay más de once mil quinientos negocios registrados, en cuatrocientas veinticuatro actividades.
9. **Bruno** · `09-empresas` — Si el negocio ya existe, el apartado Para empresas analiza su historial mensual a partir de una plantilla de Excel con guía. El archivo se lee solo en el navegador: nunca se envía a ningún servidor.
10. **Bruno** · `10-fuentes` — Ningún dato se inventa. La información proviene del INEGI: la tabla oficial de supervivencia, el DENUE, los Censos Económicos dos mil diecinueve, el Censo de Población dos mil veinte y la Encuesta Nacional de Ocupación y Empleo; además del CONEVAL. Lo que es supuesto del equipo se rotula como estimación del equipo.
11. **Alonso** · `11-estrategia` — Con esos resultados, el apartado de Estrategia construye un análisis FODA con el propio modelo y propone acciones; como sus efectos son asociación o supuesto, cuenta solo la mitad. Y en lugar de prometer éxito, arma un plan por etapas: probar la demanda antes de abrir, invertir por tramos, revisar las ventas en los meses tres, seis y doce, y fijar desde el primer día cuánto se está dispuesto a perder.
12. **Alonso** · `12-mejora` — Mejora tu negocio va más allá de los números: ofrece alternativas que se prueban con un clic, un diagnóstico de cinco niveles con un borrador a la medida en cada punto, una estimación fiscal y un modelo en dos punto cinco D de lo que el negocio puede llegar a ser.
13. **Alonso** · `13-qr` — Y el resultado se lleva en el teléfono. Un código QR abre el reporte completo, del simulador y de la estrategia, listo para guardarse en PDF. El resultado viaja dentro del propio enlace: no se sube a ningún servidor.
14. **Alonso** · `14-asistente` — Un asistente siempre disponible responde preguntas como cómo voy o qué zona me conviene, usando el mismo motor. Para preguntas libres, la inteligencia artificial de COATL responde sin pedirle ninguna clave al visitante.
15. **Bruno** · `15-versiones` — El proyecto ha tenido dieciocho versiones. Primero el modelo pasó a la tabla oficial del INEGI. Después, los coeficientes de giro y zona se estimaron siguiendo a más de trescientos mil negocios en el DENUE de dos mil diecinueve a dos mil veinticuatro, y el de formalidad, con el panel de la ENOE. Con datos reales y una validación con negocios de Coacalco, la cafetería de referencia en Los Héroes pasó de cincuenta y dos a cuarenta y uno por ciento. Cada cifra la vigilan pruebas automáticas.
16. **Alonso** · `16-construccion` — El proyecto se programó en Visual Studio Code, con control de versiones en Git y GitHub. El motor se escribió en módulos independientes y se validó con una réplica en Python. Cada cambio pasa por pruebas automáticas, incluidas las de accesibilidad, antes de publicarse.
17. **Miguel** · `17-limitaciones` — COATL declara sus límites. Giro, zona y formalidad ya se estiman con microdatos del INEGI, pero experiencia, reserva, marketing y deuda siguen siendo supuestos del equipo, porque ninguna fuente pública los liga con el cierre. Y lo comprobamos con negocios reales de Coacalco que el modelo no había visto: ordena el riesgo apenas mejor que el azar. Por eso la probabilidad se acompaña siempre de un rango plausible, que es un análisis de sensibilidad y no un intervalo de confianza. La herramienta apoya la decisión, pero no sustituye la asesoría profesional.
18. **Bruno** · `18-telefono` — La interfaz se adapta al teléfono, tanto en vertical como en horizontal, sin perder información.
19. **Miguel** · `19-cierre` — COATL convierte datos oficiales en una decisión informada. Gracias por su atención.
