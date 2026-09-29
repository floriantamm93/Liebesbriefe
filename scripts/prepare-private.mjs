import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitKeypressEvents } from 'node:readline';
import { encrypt } from '../letter/private/crypto.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const mediaTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.wav': 'audio/wav', '.webm': 'audio/webm'
};
export async function loadContent(source) {
  const input = JSON.parse((await readFile(source, 'utf8')).replace(/^\uFEFF/, ''));
  if (!Array.isArray(input.chapters) || input.chapters.length !== 3) throw new Error('Genau drei Kapitel sind erforderlich.');
  if (input.hints && (!Array.isArray(input.hints) || input.hints.length > 3 || input.hints.some(h => typeof h !== 'string'))) throw new Error('Maximal drei Texthinweise verwenden.');
  const assets = {};
  for (const blocks of [input.intro, ...input.chapters.map(c => c.blocks), input.closing]) {
    if (!Array.isArray(blocks)) throw new Error('Intro, Kapitel und Abschluss benötigen Blocklisten.');
    for (const block of blocks) {
      if (block.type === 'markdown' && typeof block.file === 'string' && !/^[a-z]+:/i.test(block.file) && !block.file.startsWith('//') && !block.file.startsWith('\\\\')) {
        const file = path.resolve(path.dirname(source), block.file);
        if (!file.startsWith(path.dirname(source))) throw new Error('Textdateien müssen neben dem Briefentwurf liegen.');
        block.type = 'text';
        block.text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
        delete block.file;
      }
      if (block.type === 'text' && typeof block.text === 'string') continue;
      if (!['image', 'audio'].includes(block.type) || typeof block.file !== 'string' || /^[a-z]+:/i.test(block.file) || block.file.startsWith('//') || block.file.startsWith('\\\\')) throw new Error('Nur Text-, Bild- oder lokale Audioblöcke sind erlaubt.');
      const file = path.resolve(path.dirname(source), block.file);
      const type = mediaTypes[path.extname(file).toLowerCase()];
      if (!type) throw new Error('Bilder müssen JPEG, PNG, WebP oder AVIF sein; Audios MP3, M4A, OGG/Opus, WAV oder WebM.');
      const data = await readFile(file);
      if (data.length > 8 * 1024 * 1024) throw new Error('Bitte einzelne Bilder oder Audios vorab auf höchstens 8 MiB verkleinern.');
      const asset = `${block.type}-${Object.keys(assets).length + 1}`;
      assets[asset] = { type, data: data.toString('base64') };
      block.asset = asset;
      delete block.file;
    }
  }
  const { hints = [], ...payload } = input;
  payload.assets = assets;
  if (Buffer.byteLength(JSON.stringify(payload)) > 32 * 1024 * 1024) throw new Error('Brief inklusive Bilder auf höchstens 32 MiB verkleinern.');
  return { payload, hints };
}
function passwordPrompt(label) {
  if (!process.stdin.isTTY) throw new Error('Bitte in einem interaktiven Terminal starten.');
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdout.write(label);
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    function finish(error) {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error); else resolve(value);
      value = '';
    }
    function onKey(character, key = {}) {
      if (key.ctrl && key.name === 'c') return finish(new Error('Abgebrochen.'));
      if (key.name === 'return') return finish();
      if (key.name === 'backspace') value = Array.from(value).slice(0, -1).join('');
      else if (character && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(character)) value += character;
    }
    process.stdin.on('keypress', onKey);
  });
}
async function main() {
  const source = process.argv[2];
  if (!source) throw new Error('Aufruf: node scripts/prepare-private.mjs PFAD/ZUM/brief.json');
  const { payload, hints } = await loadContent(path.resolve(source));
  let password = await passwordPrompt('Passwort (Eingabe bleibt unsichtbar): ');
  if (password.length < 12 || password.length > 1024) throw new Error('Bitte 12 bis 1024 Zeichen verwenden, idealerweise eine lange persönliche Passphrase.');
  let confirmation = await passwordPrompt('Passwort wiederholen: ');
  if (password !== confirmation) throw new Error('Passwörter stimmen nicht überein.');
  const bundle = await encrypt(payload, password, hints);
  password = confirmation = '';
  const target = path.join(root, 'letter/private/envelope.json');
  const temporary = `${target}.tmp`;
  await writeFile(temporary, JSON.stringify(bundle), { mode: 0o600 });
  const { rename } = await import('node:fs/promises');
  await rename(temporary, target);
  console.log('Verschlüsselter Brief erstellt: letter/private/envelope.json. Nur diese Inhaltsdatei veröffentlichen.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
