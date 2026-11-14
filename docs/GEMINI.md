# IA de COATL (Gemini): cómo funciona y cómo se configura

Desde la v8, **el visitante no pone ninguna clave**. El asistente 💬 y «Describe tu negocio» usan la IA del proyecto: Gemini, con **la clave del equipo**, guardada en un servidor intermedio.

```
Navegador (sitio en GitHub Pages)  →  coatl-ia.vercel.app/api/coatl  →  Gemini
        sin clave                        clave en GEMINI_API_KEY          plan gratuito
```

## Por qué un intermediario

El sitio es estático: cualquier clave escrita en la página la podría copiar cualquiera. El intermediario (`servicios/ia/api/coatl.js`, una función de Vercel) guarda la clave como variable de entorno secreta y además:

- solo atiende peticiones del sitio de COATL (CORS);
- fija él mismo las instrucciones de la IA, `store:false` y un tope de tokens, así que no sirve como chatbot gratuito para otros fines;
- limita a 30 peticiones por IP cada 10 minutos;
- nunca recibe archivos de Empresas, solo la pregunta y un resumen del escenario.

Si la IA no responde (sin red, límite gratuito agotado o clave sin configurar), el sitio sigue funcionando con el motor local.

## Costo: cero

- **Vercel Hobby** es gratuito y no cobra excedentes: si se rebasa el límite, la función se detiene.
- **Gemini en plan gratuito, sin facturación activada:** al agotar la cuota responde «límite gratuito» y no cobra. **No actives la facturación** en Google AI Studio.

## Publicar el intermediario (una vez, unos 5 minutos)

### Opción A · Desde el panel de Vercel (recomendada)

1. Entra a <https://vercel.com/new> con tu cuenta (plan Hobby).
2. **Import Git Repository** → elige `Maikolv/coatl`.
3. En **Project Name** escribe `coatl-ia`.
4. En **Root Directory** elige `servicios/ia`.
5. Abre **Environment Variables** y agrega:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** tu clave de <https://aistudio.google.com/apikey> (la «Default Gemini API Key» de nivel gratuito).
6. Pulsa **Deploy**.
7. Comprueba que <https://coatl-ia.vercel.app/api/coatl> responde `{"servicio":"COATL IA","listo":true}`.

Si Vercel asigna otro nombre (por ejemplo `coatl-ia-xyz.vercel.app`), avísanos o cambia la variable `COATL_IA_URL` del build (`scripts/build.mjs`). El sitio la toma de ahí y ajusta la CSP sola.

### Opción B · Con Claude Code

Aprueba el acceso de la conexión de Vercel a tu equipo (enlace que genera Claude). Claude publica la función. Después agregas solo `GEMINI_API_KEY` en *Project → Settings → Environment Variables* y haces *Redeploy*. La clave nunca la escribe Claude.

## Cambiar o revocar la clave

En Vercel: *coatl-ia → Settings → Environment Variables → GEMINI_API_KEY → Edit*, luego *Deployments → Redeploy*. En Google AI Studio puedes borrar la clave anterior. El sitio no se toca.

## Probar en local

La IA solo se activa en `*.github.io`. En una copia local agrega `?ia=1` a la dirección. Para que el intermediario la acepte, el origen debe estar en su lista (`http://127.0.0.1:8000` ya lo está).
