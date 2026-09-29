// @ts-nocheck

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
http.createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  try {
    let route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!['GET', 'HEAD'].includes(request.method) || route.includes('\\') || route.split('/').some(s => s.startsWith('.')) || !/^\/(?:$|index\.html$|(?:css|js|assets|letter)\/)/.test(route)) throw new Error();
    let file = path.resolve(root, `.${route}`);
    if (!file.startsWith(root)) throw new Error();
    if ((await stat(file)).isDirectory()) {
      if (!route.endsWith('/')) { response.writeHead(302, { Location: `${route}/` }); response.end(); return; }
      file = path.join(file, 'index.html');
    }
    const data = await readFile(file);
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404); response.end('Nicht gefunden'); }
}).listen(8000, '127.0.0.1', () => console.log('Lokal: http://127.0.0.1:8000/letter/private/'));
