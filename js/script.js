/*
 Script um Briefe hinzuzufügen
 Einfach letters kopieren und aein neues Array anhängen.
 */
const letters = [
  {
    id: "2026-08-11",
    date: "11. August 2026",
    title: "Der Anfang von etwas Schönem",
    salutation: "Mein liebster Mensch,",
    paragraphs: [
      "[HIER KOMMT DER LIEBESBRIEF HINEIN]",
      "Ersetze diesen Platzhalter später durch deine eigenen Worte. Jeder Text in Anführungszeichen wird zu einem eigenen Absatz."
    ],
    closing: "In Liebe,",
    signature: "Dein Name"
  },
  {
    id: "beispiel-gestern",
    date: "10. August 2026",
    title: "Ein Gedanke nur für dich",
    salutation: "Liebe Chantal,",
    paragraphs: [
      "Dies ist ein Beispiel für einen älteren Brief. Du kannst diesen Eintrag vollständig ersetzen oder löschen."
    ],
    closing: "Von Herzen,",
    signature: "Dein Name"
  }
];

const openButton = document.querySelector("#open-letter");
const printButton = document.querySelector("#print-letter");
const backButton = document.querySelector("#back-to-archive");
const scroll = document.querySelector("#scroll");
const letterList = document.querySelector("#letter-list");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let selectedLetter = letters[0];
let openingTimer;
let focusTimer;

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function renderArchive() {
  letterList.innerHTML = letters.map((letter) => `
    <button class="archive-card" type="button" data-letter-id="${escapeHtml(letter.id)}"
      aria-pressed="${letter.id === selectedLetter.id}">
      <span class="archive-card__date">${escapeHtml(letter.date)}</span>
      <span class="archive-card__title">${escapeHtml(letter.title)}</span>
    </button>
  `).join("");
}

function renderLetter(letter) {
  document.querySelector(".letter-date").textContent = `${letter.date} · Für Chantal`;
  document.querySelector("#letter-title").textContent = letter.salutation;
  document.querySelector(".letter-copy").innerHTML = letter.paragraphs
    .map((paragraph, index) => `<p${index === 0 && paragraph.startsWith("[") ? ' class="placeholder"' : ""}>${escapeHtml(paragraph)}</p>`)
    .join("");
  document.querySelector(".signature").innerHTML = `${escapeHtml(letter.closing)}<br><span>${escapeHtml(letter.signature)}</span>`;
  document.title = `${letter.title} – Für Chantal`;
}

function selectLetter(id) {
  const letter = letters.find((entry) => entry.id === id);
  if (!letter) return;
  selectedLetter = letter;
  renderArchive();
  renderLetter(letter);
  openButton.focus();
}

function openLetter() {
  if (openButton.disabled) return;
  renderLetter(selectedLetter);
  openButton.disabled = true;
  openButton.classList.add("is-opening");

  openingTimer = window.setTimeout(() => {
    document.body.classList.add("letter-open");
    openButton.setAttribute("aria-expanded", "true");
    scroll.setAttribute("aria-hidden", "false");
    focusTimer = window.setTimeout(() => backButton.focus({ preventScroll: true }), reducedMotion ? 0 : 2700);
  }, reducedMotion ? 0 : 1500);
}

function returnToArchive() {
  window.clearTimeout(openingTimer);
  window.clearTimeout(focusTimer);
  document.body.classList.remove("letter-open");
  openButton.classList.remove("is-opening");
  openButton.disabled = false;
  openButton.setAttribute("aria-expanded", "false");
  scroll.setAttribute("aria-hidden", "true");
  document.title = "Briefe für Chantal";
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  window.setTimeout(() => openButton.focus({ preventScroll: true }), reducedMotion ? 0 : 500);
}

letterList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-letter-id]");
  if (card) selectLetter(card.dataset.letterId);
});

openButton.addEventListener("click", openLetter);
backButton.addEventListener("click", returnToArchive);
printButton.addEventListener("click", () => window.print());

renderArchive();
renderLetter(selectedLetter);
