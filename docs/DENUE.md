# DENUE nacional y apartado para empresas

## 1. Datos reales del DENUE, siempre actualizados

| Pieza | Qué hace |
|---|---|
| `scripts/denue_sync.py` | Descarga la **descarga masiva oficial** del DENUE (INEGI) de las 32 entidades. Valida cada ZIP y vuelve a bajarlo si está dañado. Agrega por municipio. Solo usa la biblioteca estándar de Python. |
| `.github/workflows/denue.yml` | Corre la sincronización **cada lunes** y a demanda. Si los conteos cambian, hace commit en `main` y vuelve a publicar el sitio. |
| `data/denue/` | Agregados publicados junto al sitio: `meta.json` (edición, fecha y totales), `nacional.json` (entidades y municipios por sector), `ent/<EE>.json` (por municipio: clases SCIAN, tamaño y altas por año), `giros.json` (los 35 giros de COATL por municipio) y `clases.json` (catálogo SCIAN). |
| `src/ui/denue.js` | Explorador en el sitio (sección «DENUE»): entidad → municipio, sectores, tamaño, altas por año y búsqueda por actividad. También muestra, junto al simulador, la competencia registrada para el giro elegido. |

Primera sincronización (12-nov-2026): **6,138,075 establecimientos en 2,478 municipios de las 32 entidades**. Coacalco: 11,554, igual que el conteo verificado a mano en el PR #4.

### ¿Por qué no se llama a la API desde el navegador?

La [API del DENUE](https://www.inegi.org.mx/servicios/api_denue.html) exige un token personal. Si el sitio la llamara desde el navegador, el token quedaría expuesto a cualquier visitante. Por eso:

- la fuente principal es la **descarga masiva oficial**, que no requiere token y contiene todos los registros;
- la sincronización se ejecuta en GitHub Actions y publica solo agregados;
- si agregas el secreto `DENUE_TOKEN` en GitHub (Settings → Secrets and variables → Actions → New repository secret), cada sincronización hace además una **validación cruzada contra la API** (`Cuantificar` de Coacalco) y la guarda en `meta.json`.

El INEGI actualiza el DENUE por ediciones (aproximadamente semestrales). La sincronización semanal toma cada edición nueva en cuanto aparece.

### Giros de COATL → clases SCIAN

Las clases se verificaron contra el catálogo del propio DENUE (`nombre_act`). Donde el SCIAN no distingue dos giros, la clase se comparte y se avisa en pantalla:

- 722511: fonda y restaurante;
- 722515: cafetería y juguería;
- 311812: panadería y pastelería.

El giro «Spa / uñas» no tiene clase propia en el SCIAN: no se le asigna ningún conteo.

### Privacidad

Solo se publican conteos. Los nombres, razones sociales, direcciones, teléfonos y correos de los establecimientos se quedan en la caché local de la sincronización (`.cache/`, ignorada por git).

## 2. Apartado para empresas (datos confidenciales)

- **Entrada:** CSV o Excel con una fila por mes. Columnas obligatorias: `ventas`, `costo_variable` y `costos_fijos`; opcionales: `mes` y `clientes`. Mínimo 6 meses y máximo 5 MB. La plantilla se descarga desde el sitio.
- **Procesamiento 100 % local:** el archivo se lee con `FileReader`, no hay código de envío y la CSP (`connect-src 'self'`) lo impediría. No se usa `localStorage`; «Borrar mis datos» o recargar la página lo elimina. Una prueba e2e verifica que analizar un archivo no genera ninguna petición de red.
- **Método:**
  - bootstrap de los meses de la empresa (2,000 años, semilla 20262) para obtener P(utilidad anual > 0) y los percentiles P5, P50 y P95;
  - estimadores muestrales de ticket, costo variable, variabilidad de ventas y costos fijos, comparados con los supuestos de COATL.
- **«Usar mis promedios en el simulador»:** lleva ticket, costo variable, clientes/día y costos fijos al simulador para obtener la probabilidad del modelo con datos propios.
- **Limitación:** el bootstrap supone meses intercambiables. Con menos de 12 meses, la estacionalidad queda mal representada, y COATL lo advierte.
