// @ts-nocheck

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { encrypt } from '../letter/private/crypto.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const server = spawn(process.execPath, ['scripts/serve.mjs'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browser;
try {
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw new Error('Testserver konnte nicht starten'); }), new Promise((_, reject) => setTimeout(() => reject(new Error('Server timeout')), 10000).unref())]);
  browser = await chromium.launch({ headless: true, ...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}) });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const password = 'temporary test passphrase';
  const payload = { title: 'Ein Brief. Nur für dich.', intro: [{ type: 'text', text: 'Erste Zeile\n\n**Persönlicher** Absatz 🖤\n<script>alert(1)</script>' }], chapters: [1, 2, 3].map(n => ({ title: `Kapitel ${n}`, blocks: [{ type: 'text', text: 'Ein neutraler Testabsatz. '.repeat(12) }, { type: 'image', asset: 'sample', reveal: true }, { type: 'audio', asset: 'voice', caption: 'Private Sprachnachricht' }] })), closing: [{ type: 'text', text: 'Deine Entscheidung.' }], assets: { sample: { type: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=' }, voice: { type: 'audio/wav', data: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' } } };
  const bundle = await encrypt(payload, password, ['Ein Testhinweis']);
  await page.route('**/envelope.json', route => route.fulfill({ json: bundle }));
  await mkdir('.private/test-output', { recursive: true });
  for (const width of [280, 360, 390, 540, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:8000/letter/private/');
    await page.locator('#open:enabled').waitFor();
    assert.equal(await page.locator('#reader').isVisible(), false);
    await page.locator('summary').click();
    assert.equal(await page.getByText('Ein Testhinweis').isVisible(), true);
    await page.locator('#password').fill('wrong password');
    await page.locator('#open').click();
    await page.getByText('Das hat nicht geklappt.', { exact: false }).waitFor();
    await page.locator('#password').fill(password);
    await page.locator('#password').press('Enter');
    await page.locator('#reader').waitFor();
    assert.equal(await page.locator('#letter script').count(), 0);
    assert.equal(await page.locator('#letter strong').textContent(), 'Persönlicher');
    assert.equal(await page.locator('figure img').first().isVisible(), false);
    await page.locator('figure button').first().click();
    await page.locator('figure img').first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('figure img').naturalWidth > 0);
    await page.locator('.private-audio button').first().click();
    await page.locator('.private-audio audio').first().waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}`);
    if (width === 390 || width === 1440) await page.screenshot({ path: `.private/test-output/reader-${width}.png`, fullPage: true });
    await page.locator('#lock').click();
    assert.equal(await page.locator('#letter').textContent(), '');
    assert.equal(await page.locator('img').count(), 0);
    assert.equal(await page.locator('#password').inputValue(), '');
    await page.reload();
    assert.equal(await page.locator('#reader').isVisible(), false);
    console.log(`PASS ${width}px: unlock, wrong password, hints, image, layout, lock, reload`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#reader').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
  await page.screenshot({ path: '.private/test-output/gate.png', fullPage: true });
  await page.unroute('**/envelope.json');
  await page.route('**/envelope.json', route => route.fulfill({ status: 404, body: '' }));
  await page.reload();
  await page.getByText('Dieser Brief ist noch nicht verfügbar.', { exact: false }).waitFor();
  assert.equal(await page.locator('#open').isDisabled(), true);
  assert.equal((await page.request.get('http://127.0.0.1:8000/.private/test-output/gate.png')).status(), 404);
  assert.equal((await page.request.get('http://127.0.0.1:8000/scripts/private-letter.example.json')).status(), 404);
  assert.deepEqual(errors, []);
  console.log('PASS reduced motion, no browser storage, unavailable state, private paths, no JS errors');
} finally { await browser?.close(); server.kill(); }


