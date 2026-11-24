> **Histórico (v17).** Reemplazado por las propuestas austeras de [STAND.md](STAND.md), generadas por `scripts/stand.mjs`. Se conserva como registro.

# Prompt para Codex — tres propuestas de stand físico

Copia el bloque siguiente en Codex (desde la raíz del repositorio). Es de **solo lectura sobre el código**: lo único que puede crear es el archivo `docs/STAND_CODEX.md`.

```text
Trabajas en el repositorio de COATL (Cálculo de Oportunidad y Análisis Territorial Local), una
aplicación web estadística que estima la probabilidad de supervivencia a 3 años y la rentabilidad
de un negocio en Coacalco de Berriozábal, Estado de México. Lee primero CLAUDE.md, README.md,
docs/STAND.md y docs/METODOLOGIA.md.

TAREA
Escribe docs/STAND_CODEX.md con TRES propuestas distintas de recursos para un stand físico
profesional y atractivo para evaluadores académicos e inversionistas, en español de México.
No copies las propuestas de docs/STAND.md: propón alternativas propias y, al final, compáralas
con ellas en una tabla (qué coincide, qué cambia y por qué).

CADA PROPUESTA DEBE INCLUIR
1. Nombre, idea en una frase y a quién le conviene.
2. Tabla de recursos: recurso, para qué sirve, cantidad, costo aproximado en MXN (rango) y si es
   indispensable, recomendable u opcional. Marca qué se puede conseguir prestado.
3. Total aproximado, tiempo de preparación, personas necesarias y metros de espacio.
4. Croquis del acomodo en texto (mesa, pantallas, lona, flujo del visitante).
5. Riesgos y plan B (sin internet, sin energía, sin pantalla).
6. Qué archivos del repositorio se usan (entregables/, docs/capturas/, el sitio servido con
   `npm run servir`) y qué habría que imprimir.

RESTRICCIONES
- Identidad visual fija: rojo #C8102E, granate #7A0C1F, blanco hueso #FBF6F3 y greca escalonada.
  Nada de estética neón, negro o «SaaS».
- Autores en este orden exacto: Miguel Antonio Cruz García, Bruno Alejandro López Bautista,
  Alonso Arroyo Cortés.
- Usa solo cifras que existan en el repositorio (escenario de referencia: P 40.9 %, rango
  plausible 33.4–48.9 %, ROI 302.9 %, payback 4.1 meses, VPN $736,085). Nunca afirmes «99 % de exactitud»
  ni que el modelo predice con certeza.
- Los precios son estimaciones: dilo y recomienda cotizar. No inventes proveedores ni enlaces.
- No recolectes datos personales de visitantes en ninguna propuesta.
- No modifiques ningún archivo que no sea docs/STAND_CODEX.md. No ejecutes comandos que instalen
  paquetes, hagan commits, usen la red o toquen claves o tokens.

ENTREGA
Un solo archivo Markdown, con una tabla comparativa inicial de las tres propuestas, las tres
secciones, la comparación contra docs/STAND.md y una recomendación final razonada.
```

Para ejecutarlo sin que Codex pueda escribir fuera del repositorio:

```bash
codex exec --sandbox workspace-write "$(sed -n '/^```text$/,/^```$/p' docs/PROMPT_CODEX_STAND.md | sed '1d;$d')"
```
