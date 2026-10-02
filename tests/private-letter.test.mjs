import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { encrypt, decrypt, fromBase64, toBase64 } from '../letter/private/crypto.mjs';
import { loadContent } from '../scripts/prepare-private.mjs';
test('Text, Unicode and image data survive encryption; no plaintext is published', async () => {
  const payload = { text: 'Persönlicher Absatz\n\n**Unverändert** :D 🖤 😏', image: 'private-image-bytes' };
  const bundle = await encrypt(payload, 'temporary test passphrase');
  assert.deepEqual(await decrypt(bundle, 'temporary test passphrase'), payload);
  assert.ok(!JSON.stringify(bundle).includes('Persönlicher'));
  assert.ok(!JSON.stringify(bundle).includes('private-image-bytes'));
  await assert.rejects(decrypt(bundle, 'wrong password'));
  const bytes = fromBase64(bundle.ciphertext); bytes[0] ^= 1;
  await assert.rejects(decrypt({ ...bundle, ciphertext: toBase64(bytes) }, 'temporary test passphrase'));
  await assert.rejects(decrypt({ ...bundle, iterations: 1 }, 'temporary test passphrase'));
});
test('Repeated encryption uses fresh random salt and IV', async () => {
  const a = await encrypt({}, 'test password'), b = await encrypt({}, 'test password');
  assert.notEqual(a.salt, b.salt); assert.notEqual(a.iv, b.iv); assert.notEqual(a.ciphertext, b.ciphertext);
});
test('Packaging encrypts local images and audio and rejects remote media', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'letter-test-'));
  try {
    const source = path.join(directory, 'letter.json');
    const input = { intro: [], chapters: [{ blocks: [{ type: 'image', file: 'photo.png' }, { type: 'audio', file: 'voice.m4a' }] }, { blocks: [] }, { blocks: [] }], closing: [], hints: ['A hint'] };
    await writeFile(path.join(directory, 'photo.png'), Buffer.from([1, 2, 3]));
    await writeFile(path.join(directory, 'voice.m4a'), Buffer.from([4, 5, 6]));
    await writeFile(source, JSON.stringify(input));
    const { payload, hints } = await loadContent(source);
    assert.equal(payload.assets['image-1'].data, 'AQID');
    assert.equal(payload.assets['audio-2'].type, 'audio/mp4');
    assert.equal(payload.assets['audio-2'].data, 'BAUG');
    assert.equal(payload.chapters[0].blocks[0].file, undefined);
    assert.deepEqual(hints, ['A hint']);
    assert.equal(payload.hints, undefined);
    input.chapters[0].blocks[0].file = 'https://example.com/photo.png';
    await writeFile(source, JSON.stringify(input));
    await assert.rejects(loadContent(source));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('Packaging can assemble private Markdown chapter files', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'letter-test-'));
  try {
    const source = path.join(directory, 'letter.json');
    await writeFile(path.join(directory, 'round.md'), 'Unveränderter Text.\n\n**Fettung** 🖤');
    await writeFile(source, JSON.stringify({ intro: [], chapters: [{ blocks: [{ type: 'markdown', file: 'round.md' }] }, { blocks: [] }, { blocks: [] }], closing: [] }));
    const { payload } = await loadContent(source);
    assert.deepEqual(payload.chapters[0].blocks, [{ type: 'text', text: 'Unveränderter Text.\n\n**Fettung** 🖤' }]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('Markdown media markers preserve surrounding text and package local audio', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'letter-test-'));
  try {
    const source = path.join(directory, 'letter.json');
    await writeFile(path.join(directory, 'round.md'), 'Vorher.\n\n[[audio:voice.mp3]]\n\nNachher.');
    await writeFile(path.join(directory, 'voice.mp3'), Buffer.from([7, 8, 9]));
    await writeFile(source, JSON.stringify({ intro: [], chapters: [{ blocks: [{ type: 'markdown', file: 'round.md' }] }, { blocks: [] }, { blocks: [] }], closing: [] }));
    const { payload } = await loadContent(source);
    assert.deepEqual(payload.chapters[0].blocks, [{ type: 'text', text: 'Vorher.' }, { type: 'audio', asset: 'audio-1' }, { type: 'text', text: 'Nachher.' }]);
    assert.equal(payload.assets['audio-1'].data, 'BwgJ');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
