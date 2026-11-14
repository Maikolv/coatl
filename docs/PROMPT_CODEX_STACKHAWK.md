# Prompt para Codex: buscar copias de la clave de StackHawk expuesta

**Codex no puede revocar la clave.** Revocarla requiere entrar a tu cuenta de StackHawk, y eso lo haces tú (pasos abajo). Lo que sí puede hacer Codex es buscar en tu computadora y en el repo si quedó alguna copia de la clave y decirte dónde está, sin mostrarla.

Uso, en modo de solo lectura:

```bash
codex exec -s read-only "$(sed -n '/^---$/,$p' docs/PROMPT_CODEX_STACKHAWK.md | tail -n +2)"
```

---

Una clave de API de StackHawk (formato `hawk.<id>.<secreto>`) quedó expuesta en un chat y el dueño la va a revocar. Tu tarea es **solo localizar** copias de esa clave o de cualquier otra clave `hawk.` en esta computadora y en el repositorio COATL. **No modifiques ni borres nada** y **nunca imprimas el valor de una clave**: muestra solo los primeros 10 caracteres seguidos de `…`.

Busca en:

1. **El repositorio actual**, incluyendo todo el historial:
   ```bash
   git log -p --all -G 'hawk\.[A-Za-z0-9]{6,}\.'
   git grep -nE 'hawk\.[A-Za-z0-9]{6,}\.' $(git rev-list --all)
   ```
   Revisa también `stackhawk.yml` y cualquier `.env*`.
2. **Configuración de hawk**: `%USERPROFILE%\.hawk\` y `~/.hawk/hawk.properties`.
3. **Variables de entorno de usuario y de sistema**: `HAWK_API_KEY` y `API_KEY` (en Windows: `[Environment]::GetEnvironmentVariable('HAWK_API_KEY','User')` y `'Machine'`).
4. **Historial de terminales**: `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` y `~/.bash_history`.
5. **Secretos de GitHub del repo**: `gh secret list --repo Maikolv/coatl`. Solo lista los nombres; los valores no se pueden leer.

Entrega una tabla con: lugar, tipo (archivo, variable, historial, commit), los primeros 10 caracteres y cómo quitarla de forma segura. Si aparece en el historial de git de un repo público, dilo en la primera línea, porque eso obliga a revocar la clave aunque se borre del historial. Si no encuentras nada, dilo así: «sin copias encontradas».
