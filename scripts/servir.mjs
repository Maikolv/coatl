// Servidor estático mínimo (sin dependencias) para desarrollo y pruebas e2e.
// Uso: node scripts/servir.mjs [puerto] [carpeta]   → http://127.0.0.1:8000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const puerto = Number(process.argv[2] || process.env.PORT || 8000);
const raiz = path.resolve(process.argv[3] || '.');
// Cabeceras de seguridad (hallazgos de HawkScan: clickjacking, nosniff). GitHub Pages no permite
// cabeceras propias; allí la protección equivalente es la CSP en <meta> del index.html.
const CABECERAS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400, CABECERAS).end('Solicitud mal formada'); return; }
  // Nunca servir archivos ni carpetas ocultas (.git, .env, .claude…): hallazgo de HawkScan «Hidden File Found».
  if (ruta.split('/').some((seg) => seg.startsWith('.'))) { res.writeHead(404, CABECERAS).end('No encontrado'); return; }
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, path.normalize(ruta));
  if (!archivo.startsWith(raiz)) { res.writeHead(403, CABECERAS).end(); return; }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, CABECERAS).end('No encontrado'); return; }
    // En HTML, la cabecera CSP replica la política del <meta> (con el hash del script) y añade frame-ancestors.
    const extra = {};
    if (archivo.endsWith('.html')) {
      const meta = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(datos.toString('utf8'));
      if (meta) extra['Content-Security-Policy'] = meta[1].replace(/&#39;/g, "'") + "; frame-ancestors 'none'";
    }
    res.writeHead(200, { ...CABECERAS, ...extra, 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream' }).end(datos);
  });
}).listen(puerto, '127.0.0.1', () => console.log(`COATL en http://127.0.0.1:${puerto}`));
