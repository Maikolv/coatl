# COATL · Tres propuestas para el stand físico

**Cálculo de Oportunidad y Análisis Territorial Local**  
**Autores:** Miguel Antonio Cruz García, Bruno Alejandro López Bautista, Alonso Arroyo Cortés.

| Propuesta | Qué hace el visitante | Público al que más le conviene | Total estimado en MXN | Preparación | Personas | Espacio |
|---|---|---|---:|---|---:|---|
| 1. Mesa de dictamen | Abre el expediente de una cafetería y rastrea una cifra hasta su fuente | Evaluadores de estadística y jurados con poco tiempo | $820–$1,520 | 2–3 días | 2 | 1.5 × 1.5 m |
| 2. Un supuesto bajo prueba | Elige un cambio, formula una hipótesis oral y contrasta el resultado | Público mixto y evaluadores que quieren ver el modelo en acción | $1,060–$2,740 | 4–5 días | 2 | 2 × 2 m |
| 3. Galería de decisión | Recorre el problema, la prueba del producto y las preguntas para una inversión en COATL | Inversionistas y jurados de viabilidad | $1,780–$4,050 | 5–7 días | 3 | 3 × 2 m |

**Presupuesto y montaje.** Todos los precios son estimaciones del equipo en MXN por la cantidad indicada. Las cifras bajas y altas contemplan distintos acabados y, donde se indica, renta opcional. Cotizar impresión y renta antes de comprar. Confirmar con la sede los préstamos, las medidas y el paso disponible. Los metros corresponden al espacio ocupado por el stand, sin contar el pasillo público.

**Identidad.** Blanco hueso `#FBF6F3` en superficies, granate `#7A0C1F` para texto y estructura, rojo `#C8102E` para acciones y cifras destacadas, y greca escalonada como remate. Usar materiales mate y acabado editorial. Rotular cada estado con texto además de color.

**Caso común.** *Cafetería · Los Héroes* estima una P de supervivencia a tres años de **51.6 %**, con **rango plausible de 44.1–58.2 %**, **ROI de 302.9 %**, **payback de 4.1 meses** y **VPN a tres años de $912,776 MXN**, antes de impuestos. El rango muestra sensibilidad a los supuestos de los coeficientes del equipo. La tabla de supervivencia del INEGI es nacional y se aplica sin ajuste municipal. La cafetería es un escenario de referencia de alto desempeño según el contraste censal documentado. Fuente y límites en [Metodología](METODOLOGIA.md#escenario-de-referencia).

**Operación común.** La persona a cargo maneja el equipo con el escenario del repositorio y opciones de prueba predefinidas. La participación es oral o mediante fichas reutilizables. Se prescinde de registros, nombres de visitantes o negocios, fotos, cargas de archivos y almacenamiento de escenarios de visitantes. Preparar el sitio con `npm run servir` en el equipo del stand y ensayar con el navegador desconectado de internet. Abrir `http://127.0.0.1:8000/` en ese mismo equipo. Dejar disponibles los PDF y las capturas en disco para suplir los recursos externos.

## 1. Mesa de dictamen

**Idea.** Presentar COATL como un expediente de evaluación que se abre por la cifra que el jurado quiere comprobar. Conviene a evaluadores académicos que necesitan revisar el origen de un dato, el método y sus límites en una mesa compacta.

| Recurso | Para qué sirve | Cantidad | Costo estimado en MXN | Prioridad | ¿Prestable? |
|---|---|---:|---:|---|---|
| Archivador de anillas con separadores y fundas mate | Consultar las pestañas de insumos, método y resultados | 1 | $280–$450 | Indispensable | Sí |
| Juegos impresos del expediente con el diagrama y extractos técnicos | Consultar uno en mesa y tener un respaldo completo | 2 | $170–$300 | Indispensable | No |
| Fichas de lectura con el caso base y su alcance | Entregar las cifras y la referencia documental | 20 | $90–$160 | Recomendable | No |
| Lona horizontal corta con nombre, autores y greca | Identificar el stand al frente de la mesa | 1 | $280–$470 | Recomendable | No |
| Mesa y sillas | Revisar el expediente a la altura del visitante | 1 mesa y 2 sillas | $0–$0 | Indispensable | Sí |
| Laptop cargada | Abrir la metodología interactiva o reproducir el escenario | 1 | $0–$0 | Recomendable | Sí |
| Atril de mesa | Mantener visible la página del caso | 1 | $80–$140 | Opcional | Sí |

**Montaje.** $820–$1,380 MXN sin atril, $900–$1,520 con atril comprado. Preparación de 2–3 días. Dos personas, una conduce el dictamen y otra recibe visitantes y abre la demo si se requiere. Área de 1.5 × 1.5 m con mesa de 1.2 m.

~~~
          DENTRO DEL STAND
[ Mesa 1.2 m: expediente abierto | laptop lateral ]
[ Frente de la mesa: lona horizontal con greca   ]
Pasillo → abrir expediente → revisar una cifra → salida
~~~

**Cómo se presenta.** El jurado elige una cifra de la ficha, por ejemplo P o VPN. La persona que presenta abre la pestaña correspondiente y sigue la misma ruta en el diagrama hasta el método o la fuente. El expediente identifica por separado los datos públicos y los supuestos del equipo.

| Riesgo | Plan B |
|---|---|
| Sin internet | Abrir la metodología en el sitio local. Consultar el PDF técnico en disco si el navegador no carga un recurso externo. |
| Sin energía | Presentar con el expediente y su copia. La lona y la ficha quedan a la vista. |
| Sin pantalla | Mostrar el resultado y su procedencia en las páginas impresas y señalar el paso correspondiente en el diagrama. |

**Archivos e impresión.** Usar [COATL_Documento_Tecnico.pdf](../entregables/COATL_Documento_Tecnico.pdf), [diagrama-proceso.png](../entregables/diagrama-proceso.png) y [captura de trazabilidad](capturas/trazabilidad.png). Con `npm run servir`, abrir Metodología y el caso de referencia. Imprimir en carta los extractos del documento y la captura, en doble carta el diagrama y en media carta la ficha. Revisar las cifras de cualquier captura o extracto antes de imprimir y acompañarlo con la ficha vigente si la imagen es anterior.

## 2. Un supuesto bajo prueba

**Idea.** Darle al visitante una ficha para elegir una palanca y comparar su hipótesis con una corrida. Conviene para conversaciones mixtas donde hace falta demostrar que COATL permite examinar cómo cambia un resultado al variar una entrada.

| Recurso | Para qué sirve | Cantidad | Costo estimado en MXN | Prioridad | ¿Prestable? |
|---|---|---:|---:|---|---|
| Tablero mate plegable con columnas «Referencia» y «Prueba» | Comparar entradas y resultados a simple vista | 1 | $420–$720 | Indispensable | Sí, la base |
| Juego de fichas rígidas movibles | Elegir una palanca y registrar la hipótesis sin escribir | 1 juego de 6 | $150–$260 | Indispensable | No |
| Hojas plastificadas de entrada y salida | Ejecutar una comparación física cuando falle la demo | 4 | $100–$180 | Indispensable | No |
| Lona horizontal con la pregunta del módulo | Identificar el ejercicio sobre la mesa | 1 | $310–$530 | Recomendable | No |
| Cinta removible y velcro | Fijar tablero, fichas y señalización | 1 juego | $80–$150 | Indispensable | No |
| Mesa, laptop, base y extensión | Operar la demo local y mantener el cableado dentro del módulo | 1 de cada uno | $0–$0 | Recomendable | Sí |
| Monitor lateral con cable | Duplicar la demo si el público se agrupa | 1 | $0–$900 | Opcional | Sí |

**Montaje.** $1,060–$1,840 MXN con laptop y sin monitor externo. Hasta $2,740 si se renta el monitor. Preparación de 4–5 días. Dos personas, una guía el ejercicio y otra verifica que el simulador parta de la referencia y restablece el escenario entre rondas. Área de 2 × 2 m con mesa de 1.5 m.

~~~
        [ Lona al fondo: ¿qué cambia si…? ]
[ Mesa: tablero en dos columnas | laptop → monitor opcional ]
Pasillo → elegir ficha → comparar → responder → salida lateral
~~~

**Cómo se presenta.** El visitante elige, por ejemplo, «ticket» o «costo variable» y dice qué resultado espera que cambie. El equipo conserva la cafetería, la zona y los demás supuestos del caso base. Cambia solo la entrada seleccionada y contrasta P y el resultado financiero pertinente. Las fichas describen la dirección del cambio. Los resultados que se impriman para el respaldo deben salir de corridas del sitio con las mismas entradas predefinidas, fechadas y rotuladas como simulaciones. Antes de imprimir, verificar que cada par de hojas contraste un solo cambio y que la referencia se pueda restablecer.

| Riesgo | Plan B |
|---|---|
| Sin internet | Usar el simulador local con las opciones predefinidas. Sustituir gráficas que dependan de recursos externos por las hojas de la corrida. |
| Sin energía | Poner el caso base en una columna y revelar la hoja del cambio elegido en la otra. Hacer la misma lectura en voz alta. |
| Sin pantalla | Usar fichas y hojas plastificadas. Mostrar el ajuste y la salida juntos para conservar el vínculo entre entrada y resultado. |

**Archivos e impresión.** Usar [COATL_Reporte.pdf](../entregables/COATL_Reporte.pdf) para preparar la explicación del caso base y las [capturas del simulador](capturas/simulador.png) y de [resultados](capturas/simulador-resultados.png) para identificar los controles. Con `npm run servir`, abrir Simulador y ensayar el restablecimiento. Imprimir el fondo de las dos columnas, las seis fichas y cuatro hojas en doble carta para el respaldo. Las capturas existentes pueden ilustrar la interfaz. Para las variantes del ejercicio, usar las salidas de las corridas preparadas para el stand.

## 3. Galería de decisión

**Idea.** Organizar tres estaciones de lectura sobre el territorio, la evidencia y los siguientes pasos de COATL como producto. Conviene a inversionistas que quieren entender qué existe hoy, qué se ha verificado y qué habría que validar antes de respaldar el proyecto.

| Recurso | Para qué sirve | Cantidad | Costo estimado en MXN | Prioridad | ¿Prestable? |
|---|---|---:|---:|---|---|
| Paneles rígidos mate | Presentar territorio, ejercicio de referencia y preguntas para una inversión | 3 | $890–$1,450 | Indispensable | Sí, las bases reutilizables |
| Bases estables o caballetes | Sostener los tres paneles dentro del perímetro | 3 | $0–$0 | Indispensable | Sí |
| Carpeta con láminas de apoyo | Revisar el caso y el método al detenerse en la última estación | 2 juegos | $250–$420 | Indispensable | No |
| Lona horizontal de cabecera | Unir visualmente el recorrido con el nombre, autores y greca | 1 | $420–$790 | Recomendable | No |
| Resumen impreso del pitch | Dejar una referencia de producto y de los próximos pasos propuestos | 25 | $130–$230 | Recomendable | No |
| Cinta removible y sujetadores | Ordenar el montaje sin ocupar el pasillo | 1 juego | $90–$160 | Indispensable | No |
| Mesa auxiliar y laptop | Atender preguntas en la última estación y abrir el sitio local | 1 de cada uno | $0–$0 | Recomendable | Sí |
| Pantalla con base y cable | Mostrar el escenario local al acompañar la conversación | 1 | $0–$1,000 | Opcional | Sí |

**Montaje.** $1,780–$3,050 MXN sin pantalla externa. Hasta $4,050 si se renta la pantalla. Preparación de 5–7 días. Tres personas, una recibe, otra explica la evidencia y otra conduce la conversación de producto. Área de 3 × 2 m. Dejar libre el frente y situar la mesa de 1.2 m al fondo derecho.

~~~
               [ Lona horizontal de cabecera ]
[ Territorio ] → [ Evidencia ] → [ Producto y próximos pasos ]
                                 [ Mesa: carpeta | laptop/pantalla opcional ]
Pasillo → entrada por la izquierda                  salida por la derecha →
~~~

**Cómo se presenta.** El primer panel ubica Coacalco y el problema que aborda COATL. El segundo muestra el escenario de referencia y separa fuentes, supuestos y resultados. El tercero abre preguntas sobre la inversión en el producto, como qué datos locales ayudarían a recalibrar el modelo y qué evidencia se necesitaría para evaluar su uso en otro municipio. Si se incluye una ruta de crecimiento, presentarla como propuesta. Mantener la evidencia actual y los próximos pasos en áreas rotuladas del panel.

| Riesgo | Plan B |
|---|---|
| Sin internet | Usar los paneles, el PDF del pitch en disco y el simulador local. Mostrar el territorio con la captura ya impresa si no cargan las teselas. |
| Sin energía | Operar las tres estaciones con las láminas, la carpeta y el pitch impreso. |
| Sin pantalla | Recorrer los paneles y abrir en mesa la lámina del simulador y la ficha de resultados cuando surjan preguntas. |

**Archivos e impresión.** Usar [COATL_Pitch_Inversionistas.pdf](../entregables/COATL_Pitch_Inversionistas.pdf), [COATL_Documento_Tecnico.pdf](../entregables/COATL_Documento_Tecnico.pdf), la [captura del mapa](capturas/mapa.png) y la de [metodología](capturas/metodologia.png). Con `npm run servir`, preparar Territorio y Simulador, con el caso base listo desde el equipo del stand. Imprimir tres paneles, dos juegos de láminas en doble carta con los detalles técnicos y el resumen del pitch en media carta. Conservar la atribución del mapa visible en la impresión.

## Comparación con [docs/STAND.md](STAND.md)

| Alternativa | Referente en el documento original | Qué coincide | Qué cambia | Por qué |
|---|---|---|---|---|
| Mesa de dictamen | A · Esencial | Mesa compacta, laptop disponible y caso de referencia impreso | Un expediente consultable organiza la conversación en torno a la cifra elegida por el jurado. La laptop queda al lado del expediente. | Permite evaluar el razonamiento y la procedencia de una cifra aun cuando el jurado disponga de poco tiempo. |
| Un supuesto bajo prueba | B · Profesional y C · Inmersiva | Demo guiada, identidad visible y participación del visitante | El tablero de referencia y prueba ocupa el lugar central. Se prueba un cambio predefinido y el visitante interactúa con fichas reutilizables. | Al controlar una sola entrada se puede atribuir el cambio observado. El mismo ejercicio funciona en papel. |
| Galería de decisión | B · Profesional y C · Inmersiva | Presencia visual, apoyo digital y material para llevar | Tres estaciones sostienen el recorrido. Los paneles muestran el producto y sus límites y abren una conversación de inversión. | El visitante puede entender la propuesta antes de hablar con el equipo y formular preguntas sobre cómo validar el proyecto. |

## Recomendación final

Elegir **Un supuesto bajo prueba** para una jornada con evaluadores e inversionistas. Con dos personas y una laptop prestada, el presupuesto sin monitor externo queda entre **$1,060 y $1,840 MXN**. El visitante participa y observa cómo COATL responde a un cambio. El tablero físico permite demostrar la misma relación sin red, alimentación eléctrica ni pantalla. Priorizar **Mesa de dictamen** si hay una mesa compartida o si el jurado necesita revisar el método en detalle. Elegir **Galería de decisión** si la sede confirma el espacio y habrá tiempo para conversaciones sobre la inversión en COATL.
