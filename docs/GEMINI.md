# Usar Gemini gratis en COATL

COATL funciona sin ninguna clave (intérprete y asistente locales). Con una clave **gratuita** de Google AI Studio, además:

- **Describe tu negocio** convierte tu descripción libre en los datos del simulador.
- **El asistente 💬** responde preguntas libres sobre tu escenario.

## 1. Sacar la clave (5 minutos, sin tarjeta)

1. Entra a <https://aistudio.google.com/apikey> con una cuenta de Google personal. Si es una cuenta escolar o de trabajo, la organización puede tener bloqueado AI Studio.
2. Acepta los términos de Google AI Studio la primera vez.
3. Pulsa **Create API key** (Crear clave de API). Si te pide un proyecto, deja que cree uno nuevo.
4. Copia la clave. **No actives la facturación**: el plan gratuito no la necesita. Si alguna pantalla te pide una tarjeta, detente: eso es el plan de pago.
5. Opcional pero recomendable: en la ficha de la clave, limítala a **la API de Gemini**.

## 2. Usarla en COATL

1. Abre <https://maikolv.github.io/coatl/> → **Simulador**.
2. En «Describe tu negocio», despliega **Usar IA en línea (opcional)**, pega la clave y haz clic fuera del campo.
3. Debe aparecer «Intérprete: Gemini». Desde ahí funcionan «Describe tu negocio» y el asistente 💬, que muestra «Gemini (tu clave)».
4. **Olvidar clave** la borra. También se borra al cerrar la pestaña: nunca se guarda en el navegador ni en el repositorio.

## 3. Qué se envía y qué no

- **Se envía:** el texto que escribes y un resumen del escenario (giro, zona, probabilidad, utilidad, clientes y ticket). Siempre con `store:false`, para que Google no guarde la conversación.
- **Nunca se envía:** los archivos de **Empresas** ni la clave a ningún otro sitio.
- **En el plan gratuito, Google puede usar lo que escribas para mejorar sus productos.** No escribas datos personales ni confidenciales.

## 4. Si algo falla

| Mensaje | Qué hacer |
|---|---|
| «la clave no es válida» | Cópiala de nuevo completa desde AI Studio. |
| «no tiene permiso para la API de Gemini» | Crea la clave desde AI Studio, o permite «Generative Language API» en sus restricciones. |
| «límite del plan gratuito» | Espera un minuto; el límite gratuito es por minuto y por día. |
| «tardó demasiado» / «sin conexión» | Revisa tu internet. |

En todos los casos COATL sigue funcionando en modo local. Si el modelo `gemini-3.8-flash` no está disponible en tu cuenta, COATL cambia solo a `gemini-3.5-flash-lite`.
