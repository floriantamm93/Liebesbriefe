import { decrypt, fromBase64 } from './crypto.mjs';
const $ = id => document.getElementById(id);
let envelope, generation = 0;
const urls = new Set();
function text(tag, value, className) {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  return element;
}
// Only bold markers are interpreted; HTML and other markup remain literal text.
function paragraph(value) {
  const element = document.createElement('p');
  element.className = 'copy';
  const parts = value.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) element.append(part.startsWith('**') && part.endsWith('**') ? text('strong', part.slice(2, -2)) : document.createTextNode(part));
  return element;
}
function privateImage(asset, caption, reveal = true) {
  if (!asset || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(asset.type)) throw new Error('Invalid image');
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.alt = 'Privates Bild';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.hidden = true;
  let url;
  const button = text('button', 'Privates Bild ansehen');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  function toggle() {
    if (!url) {
      url = URL.createObjectURL(new Blob([fromBase64(asset.data)], { type: asset.type }));
      urls.add(url);
      img.src = url;
    }
    img.hidden = !img.hidden;
    button.textContent = img.hidden ? 'Privates Bild ansehen' : 'Bild verbergen';
    button.setAttribute('aria-expanded', String(!img.hidden));
  }
  button.addEventListener('click', toggle);
  figure.append(img, button);
  if (caption) figure.append(text('figcaption', caption));
  if (!reveal) toggle();
  return figure;
}
function privateAudio(asset, caption) {
  if (!asset || !asset.type.startsWith('audio/')) throw new Error('Invalid audio');
  const section = document.createElement('section');
  section.className = 'private-audio';
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.controlsList = 'nodownload noplaybackrate';
  audio.preload = 'metadata';
  audio.hidden = true;
  const button = text('button', 'Sprachnachricht abspielen');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-pressed', 'false');
  const status = text('p', '', 'audio-status');
  status.hidden = true;
  function updateButton() {
    const playing = Boolean(audio.src) && !audio.paused && !audio.ended;
    button.textContent = playing ? 'Sprachnachricht pausieren' : 'Sprachnachricht abspielen';
    button.setAttribute('aria-pressed', String(playing));
  }
  audio.addEventListener('play', updateButton);
  audio.addEventListener('pause', updateButton);
  audio.addEventListener('ended', updateButton);
  button.addEventListener('click', async () => {
    if (!audio.src) {
      const url = URL.createObjectURL(new Blob([fromBase64(asset.data)], { type: asset.type }));
      urls.add(url);
      audio.src = url;
    }
    audio.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    status.hidden = true;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        status.textContent = 'Tippe im Audioplayer auf Play, um die Nachricht zu starten.';
        status.hidden = false;
      }
    } else {
      audio.pause();
    }
    updateButton();
  });
  section.append(button, audio, status);
  if (caption) section.append(text('p', caption, 'audio-caption'));
  return section;
}
function appendBlocks(container, blocks, assets) {
  for (const block of blocks || []) {
    if (block.type === 'text') {
      for (const value of block.text.split(/\r?\n\s*\r?\n/)) container.append(paragraph(value));
    } else if (block.type === 'image') container.append(privateImage(assets[block.asset], block.caption, block.reveal));
    else if (block.type === 'audio') container.append(privateAudio(assets[block.asset], block.caption));
  }
}
function render(payload) {
  const fragment = document.createDocumentFragment();
  const title = text('h1', payload.title || 'Nur für dich');
  title.tabIndex = -1;
  fragment.append(title);
  appendBlocks(fragment, payload.intro, payload.assets);
  for (const [index, chapter] of payload.chapters.entries()) {
    const section = document.createElement('section');
    section.className = 'chapter';
    section.append(text('p', `Runde ${['I', 'II', 'III'][index] || index + 1}`, 'eyebrow'));
    if (chapter.title) section.append(text('h2', chapter.title));
    appendBlocks(section, chapter.blocks, payload.assets);
    fragment.append(section);
  }
  const closing = document.createElement('section');
  closing.className = 'chapter';
  appendBlocks(closing, payload.closing, payload.assets);
  fragment.append(closing);
  $('letter').replaceChildren(fragment);
  $('gate').hidden = true;
  $('reader').hidden = false;
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true });
}
function lock(focus = true) {
  generation++;
  $('letter').replaceChildren();
  for (const url of urls) URL.revokeObjectURL(url);
  urls.clear();
  $('password').value = '';
  $('reader').hidden = true;
  $('gate').hidden = false;
  $('status').textContent = envelope ? 'Der Brief ist verschlossen.' : 'Der Brief wird vorbereitet.';
  $('open').disabled = !envelope;
  if (focus) $('password').focus();
}
$('lock').addEventListener('click', () => lock());
window.addEventListener('pagehide', () => lock(false));
// A backgrounded tab is locked as well, including during decryption.
document.addEventListener('visibilitychange', () => { if (document.hidden) lock(false); });
$('unlock-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!envelope || $('open').disabled) return;
  const attempt = ++generation;
  let password = $('password').value;
  $('password').value = '';
  $('open').disabled = true;
  $('status').textContent = 'Dein Brief wird geöffnet …';
  try {
    const payload = await decrypt(envelope, password);
    if (attempt !== generation) return;
    render(payload);
    $('status').textContent = '';
  } catch {
    if (attempt !== generation) return;
    lock(false);
    $('status').textContent = 'Das hat nicht geklappt. Prüfe dein Passwort. Wenn es stimmt, muss die Briefdatei geprüft werden.';
    $('password').focus();
  } finally {
    password = '';
    if (attempt === generation) $('open').disabled = false;
  }
});
try {
  if (!crypto.subtle) throw new Error('Secure context required');
  const response = await fetch('./envelope.json', { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Unavailable');
  envelope = await response.json();
  for (const [index, hint] of (envelope.hints || []).slice(0, 3).entries()) {
    const details = document.createElement('details');
    details.append(text('summary', `Hinweis ${index + 1}`), text('p', hint));
    $('hints').append(details);
  }
  $('status').textContent = 'Ein kleines Geheimnis zwischen uns.';
  $('open').disabled = false;
} catch {
  $('status').textContent = 'Dieser Brief ist noch nicht verfügbar. Versuch es später noch einmal.';
}
