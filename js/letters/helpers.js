// Leerzeilen trennen Absätze; einzelne Zeilenumbrüche bleiben erhalten.
export function toParagraphs(text) {
  return text.trim().split(/\r?\n\s*\r?\n/);
}
