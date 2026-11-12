// Servidor estático mínimo (sin dependencias) para desarrollo y pruebas e2e.
// Uso: node scripts/servir.mjs [puerto] [carpeta]   → http://127.0.0.1:8000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const puerto = Number(process.argv[2] || process.env.PORT || 8000);
const raiz = path.resolve(process.argv[3] || '.');
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch { res.writeHead(400).end('Solicitud mal formada'); return; }
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, path.normalize(ruta));
  if (!archivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404).end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream' }).end(datos);
  });
}).listen(puerto, '127.0.0.1', () => console.log(`COATL en http://127.0.0.1:${puerto}`));
