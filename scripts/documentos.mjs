// Genera los documentos de COATL desde el propio modelo:
//   entregables/COATL_Documento_Tecnico.pdf   documento extenso (nivel tesis) con el historial completo de versiones
//   entregables/COATL_Reporte.pdf             reporte técnico
//   entregables/COATL_Presentacion.pdf/.pptx  presentación
//   entregables/COATL_Libro_Tecnico.xlsx      libro de cálculo con todas las tablas
// Uso: node scripts/documentos.mjs [tecnico] [reporte] [presentacion] [excel]   (sin argumentos: todos)
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, generarPDF, cerrarNavegador } from './doc/kit.mjs';
import { documentoTecnico, reporte } from './doc/contenido.mjs';

const pedir = process.argv.slice(2).filter((x) => !x.startsWith('-'));
const quiere = (n) => !pedir.length || pedir.includes(n);
const salida = (n) => path.join(RAIZ, 'entregables', n);
const peso = (f) => (fs.statSync(f).size / 1048576).toFixed(1) + ' MB';

// docs/VERSIONES.md: el mismo historial, legible en GitHub.
if (quiere('versiones')) {
  const { VERSIONES } = await import('./doc/datos.mjs');
  const fecha = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const md = `# Historial de versiones de COATL

> Generado por \`node scripts/documentos.mjs versiones\` desde \`data/versiones.json\`, la misma fuente del documento técnico, el reporte, la presentación, el libro de Excel y el video. Para agregar una versión, edita ese archivo y ejecuta \`npm run entregables\`.

## Escenario de referencia en cada versión

| Versión | Fecha | Qué cambió | P | Utilidad/mes | ROI | Recuperación | VPN |
|---|---|---|---|---|---|---|---|
${VERSIONES.map((v) => `| ${v.id} | ${v.fecha} | ${v.titulo} | ${v.referencia.P} | ${v.referencia.utilidad} | ${v.referencia.roi} | ${v.referencia.payback} | ${v.referencia.vpn} |`).join('\n')}

${VERSIONES.map((v) => `## ${v.id} · ${v.titulo} (${fecha(v.fecha)})

**Qué es.** ${v.resumen}

**Por qué se hizo.** ${v.motivo}

${v.cambios.map((c) => '- ' + c).join('\n')}

**Efecto en el modelo.** ${v.modelo}${v.commits.length ? `\n\nConfirmaciones: ${v.commits.map((c) => '`' + c + '`').join(', ')}.` : ''}
`).join('\n')}`;
  fs.writeFileSync(path.join(RAIZ, 'docs', 'VERSIONES.md'), md);
  console.log('docs/VERSIONES.md ·', VERSIONES.length, 'versiones');
}
try {
  if (quiere('tecnico')) { const f = salida('COATL_Documento_Tecnico.pdf'); const r = await generarPDF(documentoTecnico(), f); console.log('COATL_Documento_Tecnico.pdf ·', peso(f), r.conIndice ? '· índice con páginas' : '· índice sin números de página (falta uv/PyMuPDF)'); }
  if (quiere('reporte')) { const f = salida('COATL_Reporte.pdf'); const r = await generarPDF(reporte(), f); console.log('COATL_Reporte.pdf ·', peso(f), r.conIndice ? '· índice con páginas' : '· índice sin números de página'); }
  if (quiere('presentacion')) { const { generarPresentacion } = await import('./doc/presentacion.mjs'); console.log(await generarPresentacion(salida('COATL_Presentacion'))); }
  if (quiere('excel')) { const { generarLibro } = await import('./doc/libro_excel.mjs'); console.log(await generarLibro(salida('COATL_Libro_Tecnico.xlsx'))); }
} finally { await cerrarNavegador(); }
