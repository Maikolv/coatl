# Encuesta a negocios de Coacalco

Sirve para estimar con datos los cuatro coeficientes que siguen siendo supuestos del equipo: **experiencia, reserva, marketing y deuda** (ver METODOLOGIA.md, «Coeficientes que siguen sin datos»).

**Formulario publicado:** el enlace lo comparte el equipo en el trabajo de campo; no se publica en el repositorio. Creado el 17 de noviembre de 2026 con el script de abajo y con el tema de COATL ya aplicado: encabezado con greca, color `#C8102E`, fondo claro, Bricolage Grotesque en títulos y Hanken Grotesk en preguntas y texto, las mismas tipografías del sitio. Las respuestas van a una hoja de cálculo privada de la cuenta dueña del formulario.

## Archivos

| Archivo | Qué es |
|---|---|
| `scripts/encuesta.mjs` | Generador. Lee los 35 giros y las 6 zonas de `src/datos/datos.js`, así que las opciones coinciden con el simulador. |
| `entregables/encuesta/crear_formulario.gs` | Google Apps Script que crea el formulario y su hoja de respuestas en la cuenta de quien lo ejecuta. |
| `entregables/encuesta/encabezado.png` | Encabezado de 1600 × 400 con la identidad de COATL (granate, rojo, greca, logotipo y tipografías del sitio). |
| `entregables/encuesta/encabezado-movil.png` | Variante con texto más corto y centrado, que se lee mejor en teléfono. |
| `entregables/encuesta/codificacion.json` | Conversión de cada respuesta al valor del simulador, para el análisis. |

Regenerar: `node scripts/encuesta.mjs`.

## Estructura (5 secciones, 22 preguntas)

1. **Aviso de privacidad y consentimiento** (LFPDPPP). Si la persona no acepta, el formulario termina.
2. **Tu negocio:** giro, zona, año de apertura, personal ocupado (mismos tramos que el DENUE) y tipo de local.
3. **Cuando abriste:** experiencia previa en el giro, capacitación, meses de reserva, parte de la inversión con crédito, origen del crédito, promoción y gasto en publicidad, y formalidad (control contra la ENOE).
4. **Hoy:** si sigue abierto (los negocios que cerraron también cuentan: sin ellos la estimación saldría sesgada), año de cierre, ventas y cobro de piso (opcionales).
5. **Seguimiento (opcional):** nombre comercial y calle para buscar el negocio en el DENUE dentro de un año, y contacto solo con permiso.

## Crear el formulario

1. Abre [script.google.com](https://script.google.com) → **Proyecto nuevo**.
2. Borra el contenido y pega `entregables/encuesta/crear_formulario.gs`. Guarda.
3. Elige la función `crearFormulario` y pulsa **Ejecutar**.
4. Google pide autorización: **Revisar permisos** → elige tu cuenta → **Permitir**. El script solo crea un formulario y una hoja de cálculo nuevos.
5. El **registro de ejecución** muestra tres enlaces: para responder, para editar y la hoja de respuestas.

## Aplicar la identidad de COATL (en el editor del formulario)

La API de Google Forms no permite fijar el tema; se hace en el editor:

1. Abre el formulario (enlace «para editar») → ícono de **paleta** (Personalizar tema).
2. **Encabezado** → Seleccionar imagen → **Mediante URL** → `https://raw.githubusercontent.com/Maikolv/coatl/main/entregables/encuesta/encabezado.png` → Insertar → Guardar. (La pestaña «Subir» abre el explorador de archivos; también sirve.)
3. **Color** → «+» (personalizado) → `#C8102E` (rojo de COATL) → Agregar. En **Fondo** elige el más claro, que es el más cercano al blanco hueso `#FBF6F3`.
4. **Estilo de texto** → lista de fuentes → **Más fuentes** → busca y marca «Bricolage Grotesque» y «Hanken Grotesk» → Listo. Encabezado: Bricolage Grotesque 24; Pregunta y Texto: Hanken Grotesk. Son las mismas tipografías del sitio, disponibles en Google Fonts.
5. **Configuración → Respuestas:** deja apagado «Recopilar direcciones de correo electrónico» y «Limitar a 1 respuesta» (exige iniciar sesión y reduce la participación).

## Muestra y análisis

- **Tamaño:** para detectar una diferencia de 10 puntos (45 % contra 55 %) con 80 % de potencia y α = 0.05 hacen falta unos **400 negocios por grupo**.
- **Campo:** recorrer las seis zonas con cuotas por giro parecidas a las del DENUE; incluir negocios cerrados (vecinos, dueños anteriores).
- **Análisis:** con `codificacion.json`, regresión logística de «sigue abierto» sobre experiencia, reserva, marketing y deuda, con giro, zona y año de apertura como controles; después, seguimiento en la siguiente edición del DENUE con el método de v13.
- **Privacidad:** las respuestas viven en la hoja de cálculo de la cuenta dueña del formulario. **No se suben al repositorio** ni se envían a servicios de inteligencia artificial; en el proyecto solo entran resultados agregados.
