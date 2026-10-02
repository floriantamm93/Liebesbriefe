// @ts-nocheck

import http from 'node:http';
import https from 'node:https';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const host = process.env.LETTER_HOST || '127.0.0.1';
const port = Number(process.env.LETTER_PORT || 8000);
const tlsPfxPath = process.env.LETTER_HTTPS_PFX;
const protocol = tlsPfxPath ? 'https' : 'http';
const handler = async (request, response) => {
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
};
const server = tlsPfxPath
  ? https.createServer({ pfx: await readFile(path.resolve(root, tlsPfxPath)), passphrase: process.env.LETTER_HTTPS_PASSWORD }, handler)
  : http.createServer(handler);
server.listen(port, host, () => {
  if (host === '127.0.0.1') {
    console.log(`Lokal: ${protocol}://127.0.0.1:${port}/letter/private/`);
    return;
  }
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter(address => address && address.family === 'IPv4' && !address.internal)
    .map(address => address.address);
  console.log('Handyvorschau im selben WLAN:');
  for (const address of addresses) console.log(`${protocol}://${address}:${port}/index.html`);
});
